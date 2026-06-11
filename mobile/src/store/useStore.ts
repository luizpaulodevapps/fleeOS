import { create } from "zustand";
import { sqliteOperations } from "../lib/sqlite";
import { syncEngine } from "../lib/sync";

interface DriverState {
  currentUser: any | null;
  activeVehicle: any | null;
  activeContract: any | null;
  notifications: any[];
  payments: any[];
  maintenanceHistory: any[];
  syncStatus: {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
  };
  loading: boolean;
  
  // Actions
  initializeSession: () => void;
  loginDriver: (email: string) => Promise<boolean>;
  logoutDriver: () => void;
  loadDashboardData: () => void;
  updateSyncStatus: (status: any) => void;
  submitTicket: (title: string, message: string) => Promise<void>;
  updateMileageOffline: (vehicleId: string, newMileage: number) => Promise<void>;
}

export const useStore = create<DriverState>((set, get) => ({
  currentUser: null,
  activeVehicle: null,
  activeContract: null,
  notifications: [],
  payments: [],
  maintenanceHistory: [],
  syncStatus: {
    isOnline: true,
    isSyncing: false,
    pendingCount: 0
  },
  loading: false,

  initializeSession: () => {
    try {
      // Find default logged in user in SQLite
      const user = sqliteOperations.queryOne<any>(
        "SELECT * FROM users WHERE role = ? LIMIT 1",
        ["driver"]
      );
      if (user) {
        set({ currentUser: user });
        get().loadDashboardData();
      }
    } catch (e) {
      console.error("Erro ao inicializar sessão local", e);
    }
  },

  loginDriver: async (email: string): Promise<boolean> => {
    set({ loading: true });
    try {
      const user = sqliteOperations.queryOne<any>(
        "SELECT * FROM users WHERE email = ? AND role = ? LIMIT 1",
        [email.toLowerCase().trim(), "driver"]
      );
      if (user) {
        set({ currentUser: user, loading: false });
        get().loadDashboardData();
        return true;
      }
      set({ loading: false });
      return false;
    } catch (e) {
      set({ loading: false });
      return false;
    }
  },

  logoutDriver: () => {
    set({ currentUser: null, activeVehicle: null, activeContract: null, notifications: [] });
  },

  loadDashboardData: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      // 1. Fetch active contract for driver
      const contract = sqliteOperations.queryOne<any>(
        "SELECT * FROM contracts WHERE status = ? LIMIT 1",
        ["active"]
      );

      // 2. Fetch assigned vehicle
      let vehicle = null;
      if (contract) {
        vehicle = sqliteOperations.queryOne<any>(
          "SELECT * FROM vehicles WHERE id = ? LIMIT 1",
          [contract.vehicle_id]
        );
      }

      // 3. Fetch notifications
      const notifications = sqliteOperations.query<any>(
        "SELECT * FROM notifications ORDER BY created_at DESC"
      );

      // 4. Fetch payments
      const payments = sqliteOperations.query<any>(
        "SELECT * FROM payments ORDER BY due_date DESC"
      );

      // 5. Fetch maintenance
      const maintenanceHistory = sqliteOperations.query<any>(
        "SELECT * FROM maintenance ORDER BY date DESC"
      );

      set({
        activeContract: contract,
        activeVehicle: vehicle,
        notifications,
        payments,
        maintenanceHistory
      });
    } catch (e) {
      console.error("Erro ao carregar dados do SQLite", e);
    }
  },

  updateSyncStatus: (status) => {
    set({ syncStatus: status });
  },

  submitTicket: async (title: string, message: string) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const ticketId = `tkt-${Math.random().toString(36).substr(2, 9)}`;
    const ticketData = {
      id: ticketId,
      tenant_id: currentUser.tenant_id,
      title,
      message,
      read: 0,
      created_at: new Date().toISOString()
    };

    // Save offline-first to notifications table and enqueue sync
    await syncEngine.saveOfflineFirst(
      "notifications",
      ticketId,
      "create",
      ticketData
    );

    // Refresh local store notifications state
    get().loadDashboardData();
  },

  updateMileageOffline: async (vehicleId: string, newMileage: number) => {
    const { activeVehicle } = get();
    if (!activeVehicle) return;

    // Update local vehicle state in memory first
    set({
      activeVehicle: {
        ...activeVehicle,
        mileage: newMileage
      }
    });

    // Update local sqlite database table and enqueue sync
    await syncEngine.saveOfflineFirst(
      "vehicles",
      vehicleId,
      "update",
      { mileage: newMileage }
    );
  }
}));
