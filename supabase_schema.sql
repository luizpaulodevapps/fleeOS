-- FleetOS Database Migration Script
-- Target: Supabase (PostgreSQL 15+)

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SaaS & Tenants Core
CREATE TABLE IF NOT EXISTS saas_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    enabled_modules JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS saas_fleets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    plan_id TEXT REFERENCES saas_plans(id) ON DELETE SET NULL,
    vehicle_count INTEGER NOT NULL DEFAULT 0,
    vehicle_limit INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    document TEXT,
    phone TEXT,
    email TEXT,
    active BOOLEAN DEFAULT TRUE,
    payment_terminal_mode TEXT DEFAULT 'integrated',
    plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RBAC Security Layer
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY, -- UID from Auth
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'driver',
    role_id TEXT REFERENCES roles(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    supervisor_pin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Core Business Operations
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cpf TEXT,
    rg TEXT,
    phone TEXT,
    condutax TEXT,
    condutax_expiration TEXT,
    alvara_number TEXT,
    alvara_expiration TEXT,
    cnh_number TEXT,
    cnh_category TEXT,
    cnh_expiration TEXT,
    address TEXT,
    address_full JSONB,
    emergency_contact TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    active_locks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    birth_date TEXT,
    civil_status TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    plate TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    chassis TEXT,
    renavam TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    mileage INTEGER NOT NULL DEFAULT 0,
    next_maintenance_mileage INTEGER NOT NULL DEFAULT 0,
    insurance_company TEXT,
    insurance_policy TEXT,
    insurance_expiration TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    weekly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_ledger (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    driver_id TEXT REFERENCES drivers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'daily', 'payment', 'maintenance', 'fine', etc.
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Financial Cashier Layer
CREATE TABLE IF NOT EXISTS cashier_sessions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    opened_by TEXT NOT NULL,
    opened_by_name TEXT NOT NULL,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opening_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    closing_amount NUMERIC(10, 2) DEFAULT 0.00,
    expected_balance NUMERIC(10, 2) DEFAULT 0.00,
    difference NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
    closed_by TEXT,
    closed_by_name TEXT,
    closure_type TEXT
);

CREATE TABLE IF NOT EXISTS cashier_movements (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    cashier_id TEXT REFERENCES cashier_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'RECEIPT', 'WITHDRAW'
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL, -- 'Pix', 'Money', 'Card'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper Tables for Sequences & Schemaless Configs
CREATE TABLE IF NOT EXISTS tenant_counters (
    id TEXT PRIMARY KEY, -- tenantId_sequenceName
    tenant_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    sequence_name TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleetos_collections (
    collection_name TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    tenant_id TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_name, doc_id)
);

-- Index for fast collections queries
CREATE INDEX IF NOT EXISTS idx_fleetos_collections_tenant ON fleetos_collections (collection_name, tenant_id);

-- 6. Core Seeds (Fictitious Fleet Setup)

-- 6.1 SaaS plans
INSERT INTO saas_plans (id, name, price, description, enabled_modules) VALUES
('basic', 'Plano Inicial', 99.00, 'Gestão essencial de frotas e motoristas de forma simples.', '["dashboard", "drivers", "vehicles"]'),
('pro', 'Plano Profissional', 249.00, 'Acesso completo operacional, financeiro e controle de caixa.', '["dashboard", "drivers", "vehicles", "contracts", "cashier", "financial", "reports"]'),
('enterprise', 'Plano Corporativo', 599.00, 'Tudo ilimitado com portal de sinistros, telemetria avançada e SLA.', '["dashboard", "drivers", "vehicles", "contracts", "cashier", "financial", "reports", "claims", "maintenance", "settings"]');

-- 6.2 Companies (Tenants)
INSERT INTO companies (id, company_name, document, phone, email, active, plan) VALUES
('tenant-1', 'Táxi Amarelo S.A.', '12.345.678/0001-90', '(11) 3222-1111', 'contato@taxiamarelo.com', TRUE, 'Pro'),
('tenant-2', 'Locadora RentWheels', '98.765.432/0001-21', '(21) 2555-9999', 'frotas@rentwheels.com', TRUE, 'Enterprise');

-- 6.3 SaaS Fleets
INSERT INTO saas_fleets (id, name, status, plan_id, vehicle_count, vehicle_limit) VALUES
('tenant-1', 'Táxi Amarelo S.A.', 'active', 'pro', 2, 50),
('tenant-2', 'Locadora RentWheels', 'active', 'enterprise', 0, 200);

-- 6.4 Roles
INSERT INTO roles (id, tenant_id, name, description) VALUES
('role-super-admin', 'tenant-1', 'SUPER_ADMIN', 'Administrador da plataforma com privilégios totais e suporte.'),
('role-owner', 'tenant-1', 'OWNER', 'Proprietário da frota com acesso total às configurações e faturamento.'),
('role-manager', 'tenant-1', 'MANAGER', 'Gestor de frotas com acesso operacional total.'),
('role-supervisor', 'tenant-1', 'SUPERVISOR', 'Supervisor com acesso somente leitura e relatórios estratégicos.'),
('role-financial', 'tenant-1', 'FINANCIAL', 'Financeiro responsável por contas, diárias e movimentações.'),
('role-cashier', 'tenant-1', 'CASHIER', 'Operador de caixa com foco em aberturas, recebimentos e fechamentos.'),
('role-hr', 'tenant-1', 'HR', 'Recursos Humanos focado em motoristas, CNHs e documentação.'),
('role-readonly', 'tenant-1', 'READONLY', 'Acesso de apenas leitura a todos os painéis.'),
('role-driver', 'tenant-1', 'DRIVER', 'Motorista com visualização exclusiva do seu próprio extrato e veículo.');

-- 6.5 Permissions
INSERT INTO permissions (id, module, action, description) VALUES
('drivers.view', 'drivers', 'view', 'Visualizar motoristas'),
('drivers.create', 'drivers', 'create', 'Criar motoristas'),
('drivers.edit', 'drivers', 'edit', 'Editar motoristas'),
('drivers.delete', 'drivers', 'delete', 'Excluir motoristas'),
('documents.view', 'documents', 'view', 'Visualizar documentos do motorista'),
('documents.approve', 'documents', 'approve', 'Aprovar documentos do motorista'),
('vehicles.view', 'vehicles', 'view', 'Visualizar veículos'),
('vehicles.create', 'vehicles', 'create', 'Criar veículos'),
('vehicles.edit', 'vehicles', 'edit', 'Editar veículos e atribuições'),
('vehicles.delete', 'vehicles', 'delete', 'Excluir veículos'),
('contracts.view', 'contracts', 'view', 'Visualizar contratos'),
('contracts.create', 'contracts', 'create', 'Criar contratos'),
('contracts.edit', 'contracts', 'edit', 'Encerrar ou editar contratos'),
('cashier.view', 'cashier', 'view', 'Visualizar caixa'),
('cashier.open', 'cashier', 'open', 'Abrir caixa'),
('cashier.close', 'cashier', 'close', 'Fechar caixa'),
('cashier.withdraw', 'cashier', 'withdraw', 'Registrar retiradas/sangria'),
('cashier.receive', 'cashier', 'receive', 'Registrar recebimento de motorista'),
('financial.view', 'financial', 'view', 'Visualizar financeiro'),
('financial.edit', 'financial', 'edit', 'Editar faturas do financeiro'),
('driver_ledger.view', 'driver_ledger', 'view', 'Visualizar conta corrente do motorista'),
('driver_ledger.edit', 'driver_ledger', 'edit', 'Lançar manual na conta corrente'),
('maintenance.view', 'maintenance', 'view', 'Visualizar manutenções'),
('maintenance.edit', 'maintenance', 'edit', 'Registrar e alterar manutenções/planos'),
('expirations.view', 'expirations', 'view', 'Visualizar vencimentos e alertas'),
('reports.view', 'reports', 'view', 'Visualizar relatórios e dashboards'),
('settings.view', 'settings', 'view', 'Visualizar configurações básicas'),
('settings.edit', 'settings', 'edit', 'Editar perfil corporativo da empresa'),
('users.manage', 'users', 'manage', 'Gerenciar usuários, cargos e permissões');

-- 6.6 Role permissions for OWNER
INSERT INTO role_permissions (id, role_id, permission_id) VALUES
('rp-1', 'role-owner', 'drivers.view'),
('rp-2', 'role-owner', 'drivers.create'),
('rp-3', 'role-owner', 'drivers.edit'),
('rp-4', 'role-owner', 'drivers.delete'),
('rp-5', 'role-owner', 'documents.view'),
('rp-6', 'role-owner', 'documents.approve'),
('rp-7', 'role-owner', 'vehicles.view'),
('rp-8', 'role-owner', 'vehicles.create'),
('rp-9', 'role-owner', 'vehicles.edit'),
('rp-10', 'role-owner', 'vehicles.delete'),
('rp-11', 'role-owner', 'contracts.view'),
('rp-12', 'role-owner', 'contracts.create'),
('rp-13', 'role-owner', 'contracts.edit'),
('rp-14', 'role-owner', 'cashier.view'),
('rp-15', 'role-owner', 'cashier.open'),
('rp-16', 'role-owner', 'cashier.close'),
('rp-17', 'role-owner', 'cashier.withdraw'),
('rp-18', 'role-owner', 'cashier.receive'),
('rp-19', 'role-owner', 'financial.view'),
('rp-20', 'role-owner', 'financial.edit'),
('rp-21', 'role-owner', 'driver_ledger.view'),
('rp-22', 'role-owner', 'driver_ledger.edit'),
('rp-23', 'role-owner', 'maintenance.view'),
('rp-24', 'role-owner', 'maintenance.edit'),
('rp-25', 'role-owner', 'reports.view'),
('rp-26', 'role-owner', 'settings.view'),
('rp-27', 'role-owner', 'settings.edit'),
('rp-28', 'role-owner', 'users.manage');

-- 6.7 User Profiles (Fallback Admin credentials)
INSERT INTO user_profiles (id, email, display_name, role, role_id, tenant_id, active, supervisor_pin) VALUES
('00000000-0000-0000-0000-000000000002', 'fleet_owner@fleetsos.com', 'Luiz Frota', 'fleet_owner', 'role-owner', 'tenant-1', TRUE, '1234'),
('00000000-0000-0000-0000-000000000001', 'superadmin@fleetsos.com', 'Admin Master', 'super_admin', 'role-super-admin', 'tenant-1', TRUE, '9999'),
('00000000-0000-0000-0000-000000000003', 'driver@fleetsos.com', 'Carlos Santos', 'driver', 'role-driver', 'tenant-1', TRUE, NULL);

-- 6.8 Sample Fictitious Fleet Drivers
INSERT INTO drivers (id, tenant_id, name, cpf, rg, phone, condutax, condutax_expiration, alvara_number, alvara_expiration, cnh_number, cnh_category, cnh_expiration, address, status, notes) VALUES
('drv-1', 'tenant-1', 'Carlos Santos', '123.456.789-00', '12.345.678-9', '(11) 99999-8888', 'C-54321', '2028-11-20', 'A-987', '2027-04-12', '12345678901', 'AB', '2029-12-31', 'Av. Paulista, 1000 - São Paulo, SP', 'active', 'Motorista modelo da frota.');

-- 6.9 Sample Fictitious Fleet Vehicles
INSERT INTO vehicles (id, tenant_id, plate, brand, model, year, color, renavam, status, mileage, next_maintenance_mileage) VALUES
('veh-1', 'tenant-1', 'XYZ-5678', 'Toyota', 'Corolla Cross', 2023, 'Cinza', '98765432101', 'available', 15000, 20000),
('veh-2', 'tenant-1', 'KJS-1234', 'Chevrolet', 'Onix Plus', 2022, 'Prata', '12345678912', 'available', 42000, 50000);

-- 6.10 Sample Contract
INSERT INTO contracts (id, tenant_id, driver_id, vehicle_id, start_date, status, weekly_rate, deposit) VALUES
('con-1', 'tenant-1', 'drv-1', 'veh-1', '2026-01-15', 'active', 750.00, 1500.00);

-- 6.11 Ledger Entries (Initial Balances)
INSERT INTO driver_ledger (id, tenant_id, driver_id, type, description, amount) VALUES
('led-1', 'tenant-1', 'drv-1', 'daily', 'Diária de Locação - Ref: 2026-06-25', -110.00),
('led-2', 'tenant-1', 'drv-1', 'daily', 'Diária de Locação - Ref: 2026-06-26', -110.00),
('led-3', 'tenant-1', 'drv-1', 'payment', 'Aporte via PIX de Garantia', 500.00);
