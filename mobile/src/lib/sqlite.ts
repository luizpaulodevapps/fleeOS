import * as SQLite from "expo-sqlite";

// Helper to open the database
export const getDb = () => {
  return SQLite.openDatabaseSync("fleetos.db");
};

// Initialize schema
export const initializeDatabase = () => {
  const db = getDb();
  
  db.withTransactionSync(() => {
    // 1. Users Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        name TEXT,
        email TEXT,
        role TEXT,
        photo_url TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT
      );
    `);

    // 2. Drivers Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        name TEXT,
        cpf TEXT,
        phone TEXT,
        condutax TEXT,
        cnh_number TEXT,
        cnh_expiration TEXT,
        address TEXT,
        emergency_contact TEXT,
        photo_url TEXT,
        status TEXT,
        created_at TEXT
      );
    `);

    // 3. Vehicles Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        plate TEXT,
        model TEXT,
        brand TEXT,
        year INTEGER,
        renavam TEXT,
        fuel_type TEXT,
        mileage INTEGER,
        insurance_expiration TEXT,
        registration_expiration TEXT,
        status TEXT,
        photo_url TEXT
      );
    `);

    // 4. Contracts Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        driver_id TEXT,
        vehicle_id TEXT,
        start_date TEXT,
        end_date TEXT,
        daily_rate REAL,
        weekly_rate REAL,
        monthly_rate REAL,
        status TEXT,
        closed_by TEXT,
        amount_paid REAL
      );
    `);

    // 5. Payments Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        driver_id TEXT,
        amount REAL,
        due_date TEXT,
        paid_date TEXT,
        payment_method TEXT,
        status TEXT
      );
    `);

    // 6. Maintenance Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        vehicle_id TEXT,
        type TEXT,
        description TEXT,
        cost REAL,
        date TEXT,
        mileage INTEGER,
        next_maintenance_mileage INTEGER
      );
    `);

    // 7. Fines Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS fines (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        vehicle_id TEXT,
        driver_id TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        status TEXT,
        attachment_url TEXT
      );
    `);

    // 8. Notifications Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        title TEXT,
        message TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT
      );
    `);

    // 9. Sync Queue Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity TEXT,
        entity_id TEXT,
        operation TEXT,
        payload TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT
      );
    `);
  });

  // Seed default driver mock session if empty
  const count = db.getFirstSync("SELECT COUNT(*) as cnt FROM users") as any;
  if (count && count.cnt === 0) {
    db.runSync(
      `INSERT INTO users (id, tenant_id, name, email, role, active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["uid-driver", "tenant-1", "Carlos Santos", "driver@fleetsos.com", "driver", 1, new Date().toISOString()]
    );
    
    db.runSync(
      `INSERT INTO vehicles (id, tenant_id, plate, model, brand, year, mileage, status, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["veh-1", "tenant-1", "ABC-1234", "Corolla", "Toyota", 2022, 45000, "active", "https://images.unsplash.com/photo-1625217527288-93919c996509?w=300"]
    );

    db.runSync(
      `INSERT INTO contracts (id, tenant_id, driver_id, vehicle_id, start_date, daily_rate, weekly_rate, monthly_rate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["con-1", "tenant-1", "drv-1", "veh-1", "2026-01-01", 150.0, 950.0, 3800.0, "active"]
    );

    db.runSync(
      `INSERT INTO notifications (id, tenant_id, title, message, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["not-1", "tenant-1", "Bem-vindo ao FleetOS Mobile", "Seu aplicativo está configurado para operar offline-first.", 0, new Date().toISOString()]
    );

    // Seed Payments
    db.runSync(
      `INSERT INTO payments (id, tenant_id, driver_id, amount, due_date, paid_date, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["pay-1", "tenant-1", "drv-1", 150.0, "2026-05-20", "2026-05-20", "Pix", "paid"]
    );
    db.runSync(
      `INSERT INTO payments (id, tenant_id, driver_id, amount, due_date, paid_date, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["pay-2", "tenant-1", "drv-1", 150.0, "2026-05-21", null, null, "pending"]
    );

    // Seed Maintenance
    db.runSync(
      `INSERT INTO maintenance (id, tenant_id, vehicle_id, type, description, cost, date, mileage, next_maintenance_mileage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["maint-1", "tenant-1", "veh-1", "Preventiva", "Troca de óleo e filtro", 250.0, "2026-05-10", 44500, 54500]
    );
  }
};

// Generic CRUD operations helper for SQLite
export const sqliteOperations = {
  // Query
  query: <T>(sql: string, params: any[] = []): T[] => {
    const db = getDb();
    return db.getAllSync(sql, params) as T[];
  },
  
  // Single Row
  queryOne: <T>(sql: string, params: any[] = []): T | null => {
    const db = getDb();
    const rows = db.getAllSync(sql, params);
    return rows.length > 0 ? (rows[0] as T) : null;
  },

  // Insert/Update/Delete
  execute: (sql: string, params: any[] = []) => {
    const db = getDb();
    return db.runSync(sql, params);
  },

  // Add item to sync queue
  enqueueSync: (entity: string, entityId: string, operation: "create" | "update" | "delete", payload: any) => {
    const db = getDb();
    const id = `sq-${Math.random().toString(36).substr(2, 9)}`;
    db.runSync(
      `INSERT INTO sync_queue (id, entity, entity_id, operation, payload, synced, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [id, entity, entityId, JSON.stringify(payload), new Date().toISOString()]
    );
  }
};
