import NetInfo from "@react-native-community/netinfo";
import { sqliteOperations } from "./sqlite";

export interface SyncItem {
  id: string;
  entity: string;
  entity_id: string;
  operation: "create" | "update" | "delete";
  payload: string;
  synced: number;
  created_at: string;
}

class SyncEngine {
  private isSyncing = false;
  private onStatusChangeCallbacks: Array<(status: { isSyncing: boolean; isOnline: boolean; pendingCount: number }) => void> = [];
  private isOnline = true;

  constructor() {
    // Listen to network changes
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected;
      
      // Auto-trigger sync when transitioning to online
      if (this.isOnline && wasOffline) {
        console.log("Conectado! Iniciando sincronização da fila pendente...");
        this.syncPendingQueue();
      }
      this.triggerStatusChange();
    });
  }

  // Register listener for UI updates (e.g. flashing sync dot in header)
  subscribe(callback: (status: { isSyncing: boolean; isOnline: boolean; pendingCount: number }) => void) {
    this.onStatusChangeCallbacks.push(callback);
    // Initial call
    callback({
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      pendingCount: this.getPendingCount()
    });
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== callback);
    };
  }

  private triggerStatusChange() {
    const status = {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      pendingCount: this.getPendingCount()
    };
    this.onStatusChangeCallbacks.forEach(cb => cb(status));
  }

  getPendingCount(): number {
    try {
      const rows = sqliteOperations.query<{ cnt: number }>(
        "SELECT COUNT(*) as cnt FROM sync_queue WHERE synced = 0"
      );
      return rows[0]?.cnt || 0;
    } catch (e) {
      return 0;
    }
  }

  async syncPendingQueue() {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    this.triggerStatusChange();

    try {
      // Get all unsynced items
      const pendingItems = sqliteOperations.query<SyncItem>(
        "SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC"
      );

      console.log(`Sincronizador: processando ${pendingItems.length} itens da fila.`);

      for (const item of pendingItems) {
        const payloadObj = JSON.parse(item.payload);
        
        // Simulating network latency / Firestore write
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(`Sincronizado: ${item.entity} (${item.operation}) -> Firestore.`);

        // Mark as synced in local SQLite db
        sqliteOperations.execute(
          "UPDATE sync_queue SET synced = 1 WHERE id = ?",
          [item.id]
        );
        
        this.triggerStatusChange();
      }
    } catch (error) {
      console.error("Falha ao sincronizar fila local", error);
    } finally {
      this.isSyncing = false;
      this.triggerStatusChange();
    }
  }

  // Add something offline first, updating local tables and queueing sync
  async saveOfflineFirst(
    table: string,
    entityId: string,
    operation: "create" | "update" | "delete",
    data: any
  ) {
    // 1. Save / Update local SQLite Table
    if (operation === "create") {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => "?").join(", ");
      const columns = keys.join(", ");
      const values = Object.values(data);
      
      sqliteOperations.execute(
        `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      );
    } else if (operation === "update") {
      const keys = Object.keys(data);
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const values = [...Object.values(data), entityId];
      
      sqliteOperations.execute(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`,
        values
      );
    } else if (operation === "delete") {
      sqliteOperations.execute(
        `DELETE FROM ${table} WHERE id = ?`,
        [entityId]
      );
    }

    // 2. Queue for Firebase synchronization
    sqliteOperations.enqueueSync(table, entityId, operation, data);
    this.triggerStatusChange();

    // 3. Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingQueue();
    }
  }
}

export const syncEngine = new SyncEngine();
