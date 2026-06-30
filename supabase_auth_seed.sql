-- FleetOS Auth Seed Script
-- Run AFTER supabase_schema.sql completes successfully

-- 1. Create auth users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'superadmin@fleetsos.com',
    crypt('123456', gen_salt('bf', 10)),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"role":"super_admin","tenant_id":"tenant-1","display_name":"Admin Master"}'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'fleet_owner@fleetsos.com',
    crypt('123456', gen_salt('bf', 10)),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"role":"fleet_owner","tenant_id":"tenant-1","display_name":"Luiz Frota"}'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'driver@fleetsos.com',
    crypt('123456', gen_salt('bf', 10)),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"role":"driver","tenant_id":"tenant-1","display_name":"Carlos Santos"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create email identities (all required columns)
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'superadmin@fleetsos.com',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"superadmin@fleetsos.com"}',
    'email',
    NOW(),
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'fleet_owner@fleetsos.com',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"fleet_owner@fleetsos.com"}',
    'email',
    NOW(),
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'driver@fleetsos.com',
    '{"sub":"00000000-0000-0000-0000-000000000003","email":"driver@fleetsos.com"}',
    'email',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
