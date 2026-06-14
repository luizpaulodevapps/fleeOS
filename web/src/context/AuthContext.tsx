"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isMock, auth as fireAuth, db as fireDb } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  signOut as fireSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  collection, 
  getDocs as getFireDocs, 
  addDoc as addFireDoc, 
  updateDoc as updateFireDoc, 
  deleteDoc as deleteFireDoc, 
  doc, 
  query, 
  where,
  runTransaction
} from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "super_admin" | "fleet_owner" | "driver";
  roleId: string;
  tenantId: string;
  photoURL?: string;
  active: boolean;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signOutUser: () => Promise<void>;
  // Database Operations (Multi-Tenant automatic filtering)
  getCollection: (collName: string) => Promise<any[]>;
  addDocument: (collName: string, data: any) => Promise<any>;
  updateDocument: (collName: string, docId: string, data: any) => Promise<void>;
  deleteDocument: (collName: string, docId: string) => Promise<void>;
  getNextSequence: (sequenceName: string, minimumValue?: number) => Promise<number>;
  
  // RBAC & Impersonation & Audit Helpers
  hasPermission: (permission: string) => boolean;
  can: (action: string, resource?: any) => boolean;
  impersonateUser: (email: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  isImpersonating: boolean;
  originalUser: UserProfile | null;
  logDirect: (action: string, entityType: string, entityId: string, before?: any, after?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_SEEDS = {
  companies: [
    { id: "tenant-1", companyName: "Táxi Amarelo S.A.", document: "12.345.678/0001-90", phone: "(11) 3222-1111", email: "contato@taxiamarelo.com", active: true, plan: "Pro", createdAt: new Date().toISOString() },
    { id: "tenant-2", companyName: "Locadora RentWheels", document: "98.765.432/0001-21", phone: "(21) 2555-9999", email: "frotas@rentwheels.com", active: true, plan: "Enterprise", createdAt: new Date().toISOString() }
  ],
  user_profiles: [
    { uid: "uid-owner", email: "fleet_owner@fleetsos.com", displayName: "Luiz Frota", role: "fleet_owner", roleId: "role-owner", tenantId: "tenant-1", active: true },
    { uid: "uid-super", email: "superadmin@fleetsos.com", displayName: "Admin Master", role: "super_admin", roleId: "role-super-admin", tenantId: "tenant-1", active: true },
    { uid: "uid-driver", email: "driver@fleetsos.com", displayName: "Carlos Santos", role: "driver", roleId: "role-driver", tenantId: "tenant-1", active: true },
    { uid: "uid-financial", email: "financial@fleetsos.com", displayName: "Mariana Costa", role: "fleet_owner", roleId: "role-financial", tenantId: "tenant-1", active: true },
    { uid: "uid-cashier", email: "cashier@fleetsos.com", displayName: "Patricia Alves", role: "fleet_owner", roleId: "role-cashier", tenantId: "tenant-1", active: true },
    { uid: "uid-rh", email: "rh@fleetsos.com", displayName: "Roberto Lima", role: "fleet_owner", roleId: "role-hr", tenantId: "tenant-1", active: true },
    { uid: "uid-supervisor", email: "supervisor@fleetsos.com", displayName: "Gerson Silva", role: "fleet_owner", roleId: "role-supervisor", tenantId: "tenant-1", active: true },
    { uid: "uid-readonly", email: "readonly@fleetsos.com", displayName: "Viewer Externo", role: "fleet_owner", roleId: "role-readonly", tenantId: "tenant-1", active: true },
    { uid: "uid-workshop", email: "oficina_parceira@fleetsos.com", displayName: "Oficina Jabaquara", role: "fleet_owner", roleId: "role-workshop", tenantId: "tenant-1", active: true },
    { uid: "uid-adjuster", email: "regulador_externo@fleetsos.com", displayName: "Regulador Líder", role: "fleet_owner", roleId: "role-adjuster", tenantId: "tenant-1", active: true }
  ],
  drivers: [
    { 
      id: "drv-1", 
      tenantId: "tenant-1", 
      name: "Carlos Santos", 
      cpf: "123.456.789-00", 
      rg: "12.345.678-9",
      phone: "(11) 99999-8888", 
      condutax: "C-54321", 
      condutaxExpiration: "2028-11-20",
      alvaraNumber: "A-987",
      alvaraExpiration: "2027-04-12",
      cnhNumber: "12345678901", 
      cnhCategory: "AB",
      cnhExpiration: "2029-12-31", 
      address: "Av. Paulista, 1000 - São Paulo, SP", 
      addressFull: { street: "Av. Paulista", number: "1000", zipCode: "01311-100", city: "São Paulo", state: "SP" },
      emergencyContact: "Maria Santos - (11) 98888-1111", 
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", 
      status: "active", 
      activeLocks: [],
      createdAt: new Date().toISOString(),
      birthDate: "1988-04-20",
      civilStatus: "Casado(a)",
      notes: "Motorista exemplar, sem histórico de atrasos recorrentes.",
      admissionDate: "2025-01-15",
      exitDate: ""
    },
    { 
      id: "drv-2", 
      tenantId: "tenant-1", 
      name: "Ana Julia", 
      cpf: "234.567.890-11", 
      rg: "98.765.432-1",
      phone: "(11) 98888-7777", 
      condutax: "C-98765", 
      condutaxExpiration: "2026-06-25",
      alvaraNumber: "A-123",
      alvaraExpiration: "2026-07-30",
      cnhNumber: "98765432102", 
      cnhCategory: "D",
      cnhExpiration: "2028-06-15", 
      address: "Rua Augusta, 450 - São Paulo, SP", 
      addressFull: { street: "Rua Augusta", number: "450", zipCode: "01305-000", city: "São Paulo", state: "SP" },
      emergencyContact: "João Silva - (11) 97777-2222", 
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", 
      status: "blocked", 
      activeLocks: ["Financeiro"],
      createdAt: new Date().toISOString(),
      birthDate: "1994-09-12",
      civilStatus: "Solteiro(a)",
      notes: "Atenção necessária a multas de trânsito em vias urbanas.",
      admissionDate: "2025-06-01",
      exitDate: ""
    }
  ],
  vehicles: [
    { id: "veh-1", tenantId: "tenant-1", plate: "ABC-1234", model: "Corolla", brand: "Toyota", year: 2022, renavam: "123456789", chassis: "9BWCA09U8J342984", fuelType: "Flex", mileage: 45000, insuranceExpiration: "2027-02-10", registrationExpiration: "2027-08-20", status: "active", photoUrl: "https://images.unsplash.com/photo-1625217527288-93919c996509?w=300", color: "Cinza", activeLocks: [], pricingCategoryId: "cat-c", defaultPackageId: "pkg-executive", billingProfileId: "profile-daily-full" },
    { id: "veh-2", tenantId: "tenant-1", plate: "XYZ-5678", model: "Prisma", brand: "Chevrolet", year: 2020, renavam: "987654321", chassis: "9BWCA02X8J912831", fuelType: "Flex", mileage: 98000, insuranceExpiration: "2026-11-05", registrationExpiration: "2026-09-12", status: "maintenance", photoUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300", color: "Preto", activeLocks: ["Manutenção"], pricingCategoryId: "cat-a", defaultPackageId: "pkg-flex", billingProfileId: "profile-daily-work" }
  ],
  pricing_categories: [
    { id: "cat-a", code: "CAT-A", name: "Econômicos", description: "Gol, C3, HB20 e similares", active: true },
    { id: "cat-b", code: "CAT-B", name: "Intermediários", description: "Cronos, Virtus, Ônix Plus", active: true },
    { id: "cat-c", code: "CAT-C", name: "Executivos", description: "Toyota Corolla, Nissan Sentra", active: true },
    { id: "cat-h", code: "CAT-H", name: "Híbridos", description: "BYD King, Corolla Hybrid", active: true },
    { id: "cat-e", code: "CAT-E", name: "Elétricos", description: "BYD Dolphin, GWM Ora 03", active: true }
  ],
  pricing_tables: [
    { id: "tbl-std", name: "Tabela Padrão", description: "Preços base normais de balcão", active: true },
    { id: "tbl-promo", name: "Tabela Promocional", description: "Tarifas de desconto para novos motoristas", active: true }
  ],
  pricing_rates: [
    { tableId: "tbl-std", categoryId: "cat-a", billingFrequency: "daily", amount: 170 },
    { tableId: "tbl-std", categoryId: "cat-a", billingFrequency: "weekly", amount: 950 },
    { tableId: "tbl-std", categoryId: "cat-a", billingFrequency: "monthly", amount: 3800 },
    { tableId: "tbl-std", categoryId: "cat-b", billingFrequency: "daily", amount: 190 },
    { tableId: "tbl-std", categoryId: "cat-c", billingFrequency: "daily", amount: 220 },
    { tableId: "tbl-std", categoryId: "cat-h", billingFrequency: "daily", amount: 240 }
  ],
  billing_event_types: [
    { id: "daily_charge", name: "Diária de Locação" },
    { id: "fuel_charge", name: "Combustível Faltante" },
    { id: "damage_charge", name: "Avaria/Inspeção" },
    { id: "fine_charge", name: "Multa de Trânsito" },
    { id: "deposit_charge", "name": "Caução Contratual" },
    { id: "adjustment_charge", name: "Ajuste Operacional" }
  ],
  pricing_packages: [
    {
      id: "pkg-flex",
      name: "Pacote Flex",
      pricingCategoryId: "cat-a",
      includedKm: 250,
      extraKmPrice: 1.50,
      includedServices: ["Seguro", "Suporte 24h"],
      allowReserveVehicle: true,
      roadsideAssistance: true,
      active: true
    },
    {
      id: "pkg-executive",
      name: "Pacote Executivo",
      pricingCategoryId: "cat-c",
      includedKm: 1000,
      extraKmPrice: 2.00,
      includedServices: ["Seguro VIP", "Suporte Premium", "Lavagem Grátis"],
      allowReserveVehicle: true,
      roadsideAssistance: true,
      active: true
    }
  ],
  contract_billing_profiles: [
    {
      id: "profile-daily-work",
      name: "Diário (Seg a Sáb)",
      frequency: "daily",
      billingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      graceDays: 0,
      active: true
    },
    {
      id: "profile-daily-full",
      name: "Corrido (Seg a Dom)",
      frequency: "daily",
      billingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      graceDays: 1,
      active: true
    }
  ],
  pricing_calendar: [
    { date: "2026-12-25", pricingTableId: "tbl-std", description: "Natal", type: "holiday", priority: 2 },
    { date: "2026-06-11", pricingTableId: "tbl-promo", description: "Fórmula 1 SP", type: "event", priority: 5 }
  ],
  pricing_exemptions: [
    { id: "ex-1", tenantId: "tenant-1", name: "Motorista Antigo", targetType: "driver", targetId: "drv-1", exemptionType: "percentage", percentage: 10, value: 0, freeDaysCount: 0, validUntil: "2026-12-31" },
    { id: "ex-2", tenantId: "tenant-1", name: "Veículo Reserva", targetType: "vehicle", targetId: "veh-2", exemptionType: "percentage", percentage: 100, value: 0, freeDaysCount: 0, validUntil: "2026-08-30" }
  ],
  pricing_promotions: [
    { id: "promo-1", name: "Primeira Semana 50%", pricingCategoryId: "cat-a", discountPercentage: 50, validFrom: "2026-01-01", validTo: "2026-12-31", active: true },
    { id: "promo-2", name: "Mês de Julho 20%", pricingCategoryId: "cat-c", discountPercentage: 20, validFrom: "2026-07-01", validTo: "2026-07-31", active: true }
  ],
  operation_types: [
    { id: "taxi", name: "Táxi", active: true },
    { id: "ride_hailing", name: "Aplicativo", active: true },
    { id: "corporate", name: "Corporativo", active: true },
    { id: "truck", name: "Caminhão", active: true },
    { id: "bike", name: "Moto", active: true },
    { id: "utility", name: "Utilitário", active: true }
  ],
  pricing_subcategories: [
    { id: "sub-a1", categoryId: "cat-a", code: "CAT-A.1", name: "Gol G6 completo", description: "Gol G6 1.6 Completo com Ar e Direção" },
    { id: "sub-a2", categoryId: "cat-a", code: "CAT-A.2", name: "HB20 Comfort", description: "HB20 Comfort 1.0 Flex", amountOverride: 185 },
    { id: "sub-b1", categoryId: "cat-b", code: "CAT-B.1", name: "Cronos Drive", description: "Fiat Cronos Drive 1.3" }
  ],
  contract_types: [
    { id: "taxi", name: "Locação Táxi", billingProfileId: "profile-daily-taxi-sp", defaultFrequency: "daily", allowExemptions: true, allowHolidayRules: true, operationTypeId: "taxi" },
    { id: "ride_hailing", name: "Locação Aplicativo", billingProfileId: "profile-weekly-app", defaultFrequency: "weekly", allowExemptions: true, allowHolidayRules: true, operationTypeId: "ride_hailing" },
    { id: "corporate", name: "Locação Corporativa", billingProfileId: "profile-monthly-corp", defaultFrequency: "monthly", allowExemptions: false, allowHolidayRules: false, operationTypeId: "corporate" },
    { id: "fleet", name: "Locação Frota", billingProfileId: "profile-monthly-fleet", defaultFrequency: "monthly", allowExemptions: false, allowHolidayRules: false, operationTypeId: "corporate" },
    { id: "moto", name: "Locação Moto", billingProfileId: "profile-weekly-app", defaultFrequency: "weekly", allowExemptions: true, allowHolidayRules: true, operationTypeId: "bike" },
    { id: "truck", name: "Locação Caminhão", billingProfileId: "profile-monthly-corp", defaultFrequency: "monthly", allowExemptions: false, allowHolidayRules: false, operationTypeId: "truck" },
    { id: "utility", name: "Locação Utilitário", billingProfileId: "profile-monthly-corp", defaultFrequency: "monthly", allowExemptions: true, allowHolidayRules: false, operationTypeId: "utility" },
    { id: "executive", name: "Locação Executiva", billingProfileId: "profile-daily-taxi-sp", defaultFrequency: "daily", allowExemptions: true, allowHolidayRules: true, operationTypeId: "corporate" }
  ],
  billing_profiles: [
    { id: "profile-daily-taxi-sp", name: "Diária Táxi SP", frequency: "daily", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], holidayPolicy: "exempt", lateFeePercent: 2, graceDays: 1 },
    { id: "profile-daily-taxi-nac", name: "Diária Táxi Nacional", frequency: "daily", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], holidayPolicy: "exempt", lateFeePercent: 2, graceDays: 1 },
    { id: "profile-weekly-app", name: "Semanal Aplicativo", frequency: "weekly", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], holidayPolicy: "ignore", lateFeePercent: 2, graceDays: 2 },
    { id: "profile-monthly-corp", name: "Mensal Corporativo", frequency: "monthly", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], holidayPolicy: "ignore", lateFeePercent: 5, graceDays: 5 },
    { id: "profile-monthly-fleet", name: "Mensal Frota", frequency: "monthly", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], holidayPolicy: "ignore", lateFeePercent: 5, graceDays: 5 },
    { id: "profile-yearly-corp", name: "Anual Corporativo", frequency: "yearly", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], holidayPolicy: "ignore", lateFeePercent: 10, graceDays: 10 }
  ],
  calendar_rules: [
    { id: "cal-nat", date: "2026-12-25", description: "Natal", type: "holiday", priority: 3, action: "exempt", value: 0 },
    { id: "cal-f1", date: "2026-11-08", description: "Fórmula 1 SP", type: "event", priority: 2, action: "surcharge", value: 1.50 },
    { id: "cal-lolla", date: "2026-03-27", description: "Lollapalooza SP", type: "event", priority: 2, action: "surcharge", value: 1.25 },
    { id: "cal-promo-jul", date: "2026-07-15", description: "Promoção de Férias", type: "promo", priority: 1, action: "discount", value: 0.90 }
  ],
  pricing_table_versions: [
    { id: "vlog-1", tableId: "tbl-std", version: 1, changeDescription: "Seed inicial de tarifas da Tabela Padrão", changedBy: "Admin Master", createdAt: new Date().toISOString() }
  ],
  contract_billing: [
    { contractId: "con-1", nextBillingDate: "2026-06-12", frequency: "daily", amount: 150, active: true, billingProfileId: "profile-daily-full" }
  ],
  vehicle_acquisition: [
    {
      id: "acq-1",
      tenantId: "tenant-1",
      vehicleId: "veh-1",
      acquisitionType: "Financiamento",
      purchaseDate: "2022-03-15",
      purchaseValue: 85000,
      fipeAtPurchase: 88000,
      seller: "Concessionária Toyota SP",
      invoiceNumber: "NF-12345",
      bankName: "Banco Bradesco",
      contractNumber: "FIN-2022-09876",
      financedAmount: 60000,
      downPayment: 25000,
      installments: 48,
      installmentValue: 1450,
      interestRate: 1.29,
      startDate: "2022-04-01",
      annualInsuranceCost: 5200,
      annualIpvaCost: 1700,
      currentFipeValue: 55000,
      fipeConsultDate: "2026-06-01",
      admissionMileage: 0,
      notes: "Veículo adquirido para frota de táxi regular"
    },
    {
      id: "acq-2",
      tenantId: "tenant-1",
      vehicleId: "veh-2",
      acquisitionType: "Compra à Vista",
      purchaseDate: "2020-05-10",
      purchaseValue: 45000,
      fipeAtPurchase: 46000,
      seller: "Particular",
      invoiceNumber: "NF-0982",
      annualInsuranceCost: 3200,
      annualIpvaCost: 1100,
      currentFipeValue: 32000,
      fipeConsultDate: "2026-06-01",
      admissionMileage: 0,
      notes: "Adquirido para motorista parceiro"
    }
  ],
  contracts: [
    { 
      id: "con-1", 
      tenantId: "tenant-1", 
      driverId: "drv-1", 
      vehicleId: "veh-1", 
      startDate: "2026-01-01", 
      endDate: "2026-12-31", 
      dailyRate: 150, 
      weeklyRate: 800, 
      monthlyRate: 3200, 
      status: "active", 
      closedBy: "", 
      amountPaid: 7600, 
      type: "Locação", 
      pdfSignedUrl: "", 
      dailyProfileId: "prof-1", 
      dailyAmountSnapshot: 150, 
      dailyProfileNameSnapshot: "Diária Padrão Comercial",
      pricingSnapshot: {
        contractType: "taxi",
        billingProfile: "profile-daily-taxi-sp",
        pricingTable: "tbl-std",
        category: "cat-c",
        subcategory: "",
        dailyRate: 150
      }
    }
  ],
  notifications: [
    { id: "not-1", tenantId: "tenant-1", userId: "uid-driver", title: "Vencimento de CNH", message: "Sua CNH expira em breve. Lembre-se de renovar e enviar a foto atualizada.", read: false, createdAt: new Date().toISOString() },
    { id: "not-2", tenantId: "tenant-1", userId: "all_drivers", title: "Reunião Geral", message: "Próxima terça-feira às 14h teremos um treinamento obrigatório sobre direção defensiva.", read: true, createdAt: new Date().toISOString() }
  ],
  attachments: [
    { id: "att-1", tenantId: "tenant-1", entityType: "vehicle", entityId: "veh-1", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileName: "CRLV_Toyota_Corolla.pdf", uploadedBy: "Luiz Frota", createdAt: new Date().toISOString() }
  ],
  payments: [
    { id: "pay-1", tenantId: "tenant-1", driverId: "drv-1", amount: 3800, dueDate: "2026-06-01", paidDate: "2026-06-01", paymentMethod: "Pix", status: "paid" },
    { id: "pay-2", tenantId: "tenant-1", driverId: "drv-1", amount: 3800, dueDate: "2026-07-01", paidDate: "", paymentMethod: "", status: "pending" },
    { id: "pay-3", tenantId: "tenant-1", driverId: "drv-2", amount: 1500, dueDate: "2026-05-15", paidDate: "", paymentMethod: "", status: "overdue" }
  ],
  maintenance: [
    { id: "maint-1", tenantId: "tenant-1", vehicleId: "veh-2", type: "Preventiva", description: "Troca de óleo e filtros", cost: 350, date: "2026-05-20", mileage: 98000, nextMaintenanceMileage: 108000 },
    { id: "maint-2", tenantId: "tenant-1", vehicleId: "veh-1", type: "Corretiva", description: "Alinhamento e balanceamento", cost: 180, date: "2026-04-10", mileage: 44000, nextMaintenanceMileage: 54000 }
  ],
  driver_ledger: [
    { id: "led-1", tenantId: "tenant-1", driverId: "drv-1", type: "payment", description: "Abertura de saldo - Crédito inicial", amount: 500, createdAt: "2026-06-01T10:00:00Z" },
    { id: "led-2", tenantId: "tenant-1", driverId: "drv-1", type: "daily", description: "Cobrança de diária - Corolla ABC-1234", amount: -120, createdAt: "2026-06-02T08:00:00Z" },
    { id: "led-3", tenantId: "tenant-1", driverId: "drv-1", type: "fine", description: "Multa de trânsito - Excesso de velocidade", amount: -250, createdAt: "2026-06-03T14:30:00Z" },
    { id: "led-4", tenantId: "tenant-1", driverId: "drv-1", type: "bonus", description: "Abono - Indicação de cliente", amount: 50, createdAt: "2026-06-04T12:00:00Z" },
    { id: "led-5", tenantId: "tenant-1", driverId: "drv-2", type: "daily", description: "Cobrança de diária - Prisma XYZ-5678", amount: -120, createdAt: "2026-06-02T08:00:00Z" },
    { id: "led-6", tenantId: "tenant-1", driverId: "drv-2", type: "payment", description: "Pagamento de diária - Pix", amount: 120, createdAt: "2026-06-02T18:00:00Z" },
    { id: "led-7", tenantId: "tenant-1", driverId: "drv-2", type: "daily", description: "Cobrança de diária - Prisma XYZ-5678", amount: -120, createdAt: "2026-06-03T08:00:00Z" }
  ],
  vehicle_assignments: [
    { id: "asg-1", tenantId: "tenant-1", vehicleId: "veh-1", driverId: "drv-1", contractId: "con-1", startDate: "2026-06-01T08:00:00Z", endDate: null, active: true, status: "active" },
    { id: "asg-2", tenantId: "tenant-1", vehicleId: "veh-2", driverId: "drv-2", contractId: "", startDate: "2026-06-01T08:00:00Z", endDate: null, active: true, status: "active" }
  ],
  cashier_sessions: [
    { id: "cash-1", tenantId: "tenant-1", operatorId: "uid-super", openedAt: "2026-06-08T08:00:00Z", closedAt: "2026-06-08T18:00:00Z", openingAmount: 100, closingAmount: 220, difference: 0, status: "closed" }
  ],
  cashier_movements: [
    { id: "mov-1", tenantId: "tenant-1", cashierId: "cash-1", type: "RECEIPT", amount: 120, paymentMethod: "Pix", description: "Recebimento diária - Ana Julia", createdAt: "2026-06-08T12:00:00Z" }
  ],
  maintenance_plan_items: [
    { id: "mpi-1", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Óleo", intervalKm: 10000, lastServiceKm: 40000, nextServiceKm: 50000 },
    { id: "mpi-2", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Velas", intervalKm: 40000, lastServiceKm: 40000, nextServiceKm: 80000 },
    { id: "mpi-3", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Filtros", intervalKm: 10000, lastServiceKm: 40000, nextServiceKm: 50000 },
    { id: "mpi-4", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Pneus", intervalKm: 50000, lastServiceKm: 0, nextServiceKm: 50000 },
    { id: "mpi-5", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Freios", intervalKm: 20000, lastServiceKm: 40000, nextServiceKm: 60000 },
    { id: "mpi-6", tenantId: "tenant-1", vehicleId: "veh-1", itemName: "Alinhamento", intervalKm: 10000, lastServiceKm: 40000, nextServiceKm: 50000 },
    { id: "mpi-7", tenantId: "tenant-1", vehicleId: "veh-2", itemName: "Óleo", intervalKm: 10000, lastServiceKm: 90000, nextServiceKm: 100000 },
    { id: "mpi-8", tenantId: "tenant-1", vehicleId: "veh-2", itemName: "Correia Dentada", intervalKm: 60000, lastServiceKm: 60000, nextServiceKm: 120000 },
    { id: "mpi-9", tenantId: "tenant-1", vehicleId: "veh-2", itemName: "Bateria", intervalKm: 40000, lastServiceKm: 80000, nextServiceKm: 120000 }
  ],
  roles: [
    { id: "role-super-admin", tenantId: "tenant-1", name: "SUPER_ADMIN", description: "Administrador da plataforma com privilégios totais e suporte." },
    { id: "role-owner", tenantId: "tenant-1", name: "OWNER", description: "Proprietário da frota com acesso total às configurações e faturamento." },
    { id: "role-manager", tenantId: "tenant-1", name: "MANAGER", description: "Gestor de frotas com acesso operacional total." },
    { id: "role-supervisor", tenantId: "tenant-1", name: "SUPERVISOR", description: "Supervisor com acesso somente leitura e relatórios estratégicos." },
    { id: "role-financial", tenantId: "tenant-1", name: "FINANCIAL", description: "Financeiro responsável por contas, diárias e movimentações." },
    { id: "role-cashier", tenantId: "tenant-1", name: "CASHIER", description: "Operador de caixa com foco em aberturas, recebimentos e fechamentos." },
    { id: "role-hr", tenantId: "tenant-1", name: "HR", description: "Recursos Humanos focado em motoristas, CNHs e documentação." },
    { id: "role-operational", tenantId: "tenant-1", name: "OPERATIONAL", description: "Operador responsável pela distribuição de veículos e quilometragem." },
    { id: "role-readonly", tenantId: "tenant-1", name: "READONLY", description: "Acesso de apenas leitura a todos os painéis." },
    { id: "role-driver", tenantId: "tenant-1", name: "DRIVER", description: "Motorista com visualização exclusiva do seu próprio extrato e veículo." },
    { id: "role-workshop", tenantId: "tenant-1", name: "WORKSHOP", description: "Oficina parceira externa com acesso apenas ao Portal da Oficina." },
    { id: "role-adjuster", tenantId: "tenant-1", name: "ADJUSTER", description: "Regulador externo de sinistros com acesso apenas ao Portal de Regulagem." }
  ],
  permissions: [
    { id: "drivers.view", module: "drivers", action: "view", description: "Visualizar motoristas" },
    { id: "drivers.create", module: "drivers", action: "create", description: "Criar motoristas" },
    { id: "drivers.edit", module: "drivers", action: "edit", description: "Editar motoristas" },
    { id: "drivers.delete", module: "drivers", action: "delete", description: "Excluir motoristas" },
    { id: "documents.view", module: "documents", action: "view", description: "Visualizar documentos do motorista" },
    { id: "documents.approve", module: "documents", action: "approve", description: "Aprovar documentos do motorista" },
    { id: "vehicles.view", module: "vehicles", action: "view", description: "Visualizar veículos" },
    { id: "vehicles.create", module: "vehicles", action: "create", description: "Criar veículos" },
    { id: "vehicles.edit", module: "vehicles", action: "edit", description: "Editar veículos e atribuições" },
    { id: "vehicles.delete", module: "vehicles", action: "delete", description: "Excluir veículos" },
    { id: "contracts.view", module: "contracts", action: "view", description: "Visualizar contratos" },
    { id: "contracts.create", module: "contracts", action: "create", description: "Criar contratos" },
    { id: "contracts.edit", module: "contracts", action: "edit", description: "Encerrar ou editar contratos" },
    { id: "cashier.view", module: "cashier", action: "view", description: "Visualizar caixa" },
    { id: "cashier.open", module: "cashier", action: "open", description: "Abrir caixa" },
    { id: "cashier.close", module: "cashier", action: "close", description: "Fechar caixa" },
    { id: "cashier.withdraw", module: "cashier", action: "withdraw", description: "Registrar retiradas/sangria" },
    { id: "cashier.receive", module: "cashier", action: "receive", description: "Registrar recebimento de motorista" },
    { id: "financial.view", module: "financial", action: "view", description: "Visualizar financeiro" },
    { id: "financial.edit", module: "financial", action: "edit", description: "Editar faturas do financeiro" },
    { id: "driver_ledger.view", module: "driver_ledger", action: "view", description: "Visualizar conta corrente do motorista" },
    { id: "driver_ledger.edit", module: "driver_ledger", action: "edit", description: "Lançar manual na conta corrente" },
    { id: "maintenance.view", module: "maintenance", action: "view", description: "Visualizar manutenções" },
    { id: "maintenance.edit", module: "maintenance", action: "edit", description: "Registrar e alterar manutenções/planos" },
    { id: "expirations.view", module: "expirations", action: "view", description: "Visualizar vencimentos e alertas" },
    { id: "reports.view", module: "reports", action: "view", description: "Visualizar relatórios e dashboards" },
    { id: "settings.view", module: "settings", action: "view", description: "Visualizar configurações básicas" },
    { id: "settings.edit", module: "settings", action: "edit", description: "Editar perfil corporativo da empresa" },
    { id: "users.manage", module: "users", action: "manage", description: "Gerenciar usuários, cargos e permissões" },
    { id: "billing.view", module: "billing", action: "view", description: "Visualizar Painel e Configurações de Faturamento" },
    { id: "billing.edit", module: "billing", action: "edit", description: "Configurar Perfis, Regras, Calendário e Executar Faturamento" },
    { id: "claims.view", module: "claims", action: "view", description: "Visualizar Painel e Sinistros" },
    { id: "claims.edit", module: "claims", action: "edit", description: "Criar, editar, orçar e faturar sinistros" }
  ],
  role_permissions: [
    // OWNER permissions (all)
    { id: "rp-1", roleId: "role-owner", permissionId: "drivers.view" },
    { id: "rp-2", roleId: "role-owner", permissionId: "drivers.create" },
    { id: "rp-3", roleId: "role-owner", permissionId: "drivers.edit" },
    { id: "rp-4", roleId: "role-owner", permissionId: "drivers.delete" },
    { id: "rp-5", roleId: "role-owner", permissionId: "documents.view" },
    { id: "rp-6", roleId: "role-owner", permissionId: "documents.approve" },
    { id: "rp-7", roleId: "role-owner", permissionId: "vehicles.view" },
    { id: "rp-8", roleId: "role-owner", permissionId: "vehicles.create" },
    { id: "rp-9", roleId: "role-owner", permissionId: "vehicles.edit" },
    { id: "rp-10", roleId: "role-owner", permissionId: "vehicles.delete" },
    { id: "rp-11", roleId: "role-owner", permissionId: "contracts.view" },
    { id: "rp-12", roleId: "role-owner", permissionId: "contracts.create" },
    { id: "rp-13", roleId: "role-owner", permissionId: "contracts.edit" },
    { id: "rp-14", roleId: "role-owner", permissionId: "cashier.view" },
    { id: "rp-15", roleId: "role-owner", permissionId: "cashier.open" },
    { id: "rp-16", roleId: "role-owner", permissionId: "cashier.close" },
    { id: "rp-17", roleId: "role-owner", permissionId: "cashier.withdraw" },
    { id: "rp-18", roleId: "role-owner", permissionId: "cashier.receive" },
    { id: "rp-19", roleId: "role-owner", permissionId: "financial.view" },
    { id: "rp-20", roleId: "role-owner", permissionId: "financial.edit" },
    { id: "rp-21", roleId: "role-owner", permissionId: "driver_ledger.view" },
    { id: "rp-22", roleId: "role-owner", permissionId: "driver_ledger.edit" },
    { id: "rp-23", roleId: "role-owner", permissionId: "maintenance.view" },
    { id: "rp-24", roleId: "role-owner", permissionId: "maintenance.edit" },
    { id: "rp-25", roleId: "role-owner", permissionId: "reports.view" },
    { id: "rp-26", roleId: "role-owner", permissionId: "settings.view" },
    { id: "rp-27", roleId: "role-owner", permissionId: "settings.edit" },
    { id: "rp-28", roleId: "role-owner", permissionId: "users.manage" },

    // MANAGER permissions
    { id: "rp-29", roleId: "role-manager", permissionId: "drivers.view" },
    { id: "rp-30", roleId: "role-manager", permissionId: "drivers.create" },
    { id: "rp-31", roleId: "role-manager", permissionId: "drivers.edit" },
    { id: "rp-32", roleId: "role-manager", permissionId: "documents.view" },
    { id: "rp-33", roleId: "role-manager", permissionId: "documents.approve" },
    { id: "rp-34", roleId: "role-manager", permissionId: "vehicles.view" },
    { id: "rp-35", roleId: "role-manager", permissionId: "vehicles.create" },
    { id: "rp-36", roleId: "role-manager", permissionId: "vehicles.edit" },
    { id: "rp-37", roleId: "role-manager", permissionId: "contracts.view" },
    { id: "rp-38", roleId: "role-manager", permissionId: "contracts.create" },
    { id: "rp-39", roleId: "role-manager", permissionId: "contracts.edit" },
    { id: "rp-40", roleId: "role-manager", permissionId: "cashier.view" },
    { id: "rp-41", roleId: "role-manager", permissionId: "cashier.open" },
    { id: "rp-42", roleId: "role-manager", permissionId: "cashier.close" },
    { id: "rp-43", roleId: "role-manager", permissionId: "cashier.withdraw" },
    { id: "rp-44", roleId: "role-manager", permissionId: "cashier.receive" },
    { id: "rp-45", roleId: "role-manager", permissionId: "financial.view" },
    { id: "rp-46", roleId: "role-manager", permissionId: "driver_ledger.view" },
    { id: "rp-47", roleId: "role-manager", permissionId: "maintenance.view" },
    { id: "rp-48", roleId: "role-manager", permissionId: "maintenance.edit" },
    { id: "rp-49", roleId: "role-manager", permissionId: "reports.view" },
    { id: "rp-50", roleId: "role-manager", permissionId: "settings.view" },

    // SUPERVISOR permissions
    { id: "rp-51", roleId: "role-supervisor", permissionId: "drivers.view" },
    { id: "rp-52", roleId: "role-supervisor", permissionId: "documents.view" },
    { id: "rp-53", roleId: "role-supervisor", permissionId: "vehicles.view" },
    { id: "rp-54", roleId: "role-supervisor", permissionId: "contracts.view" },
    { id: "rp-55", roleId: "role-supervisor", permissionId: "cashier.view" },
    { id: "rp-56", roleId: "role-supervisor", permissionId: "financial.view" },
    { id: "rp-57", roleId: "role-supervisor", permissionId: "driver_ledger.view" },
    { id: "rp-58", roleId: "role-supervisor", permissionId: "maintenance.view" },
    { id: "rp-59", roleId: "role-supervisor", permissionId: "reports.view" },
    { id: "rp-60", roleId: "role-supervisor", permissionId: "settings.view" },

    // FINANCIAL permissions
    { id: "rp-61", roleId: "role-financial", permissionId: "cashier.view" },
    { id: "rp-62", roleId: "role-financial", permissionId: "cashier.receive" },
    { id: "rp-63", roleId: "role-financial", permissionId: "financial.view" },
    { id: "rp-64", roleId: "role-financial", permissionId: "financial.edit" },
    { id: "rp-65", roleId: "role-financial", permissionId: "driver_ledger.view" },
    { id: "rp-66", roleId: "role-financial", permissionId: "driver_ledger.edit" },
    { id: "rp-67", roleId: "role-financial", permissionId: "reports.view" },
    { id: "rp-68", roleId: "role-financial", permissionId: "settings.view" },

    // CASHIER permissions
    { id: "rp-69", roleId: "role-cashier", permissionId: "cashier.view" },
    { id: "rp-70", roleId: "role-cashier", permissionId: "cashier.open" },
    { id: "rp-71", roleId: "role-cashier", permissionId: "cashier.close" },
    { id: "rp-72", roleId: "role-cashier", permissionId: "cashier.withdraw" },
    { id: "rp-73", roleId: "role-cashier", permissionId: "cashier.receive" },
    { id: "rp-74", roleId: "role-cashier", permissionId: "driver_ledger.view" },

    // HR permissions
    { id: "rp-75", roleId: "role-hr", permissionId: "drivers.view" },
    { id: "rp-76", roleId: "role-hr", permissionId: "drivers.create" },
    { id: "rp-77", roleId: "role-hr", permissionId: "drivers.edit" },
    { id: "rp-78", roleId: "role-hr", permissionId: "documents.view" },
    { id: "rp-79", roleId: "role-hr", permissionId: "documents.approve" },

    // OPERATIONAL permissions
    { id: "rp-80", roleId: "role-operational", permissionId: "vehicles.view" },
    { id: "rp-81", roleId: "role-operational", permissionId: "vehicles.create" },
    { id: "rp-82", roleId: "role-operational", permissionId: "vehicles.edit" },
    { id: "rp-83", roleId: "role-operational", permissionId: "maintenance.view" },
    { id: "rp-84", roleId: "role-operational", permissionId: "maintenance.edit" },

    // READONLY permissions
    { id: "rp-85", roleId: "role-readonly", permissionId: "drivers.view" },
    { id: "rp-86", roleId: "role-readonly", permissionId: "documents.view" },
    { id: "rp-87", roleId: "role-readonly", permissionId: "vehicles.view" },
    { id: "rp-88", roleId: "role-readonly", permissionId: "contracts.view" },
    { id: "rp-89", roleId: "role-readonly", permissionId: "cashier.view" },
    { id: "rp-90", roleId: "role-readonly", permissionId: "financial.view" },
    { id: "rp-91", roleId: "role-readonly", permissionId: "driver_ledger.view" },
    { id: "rp-92", roleId: "role-readonly", permissionId: "maintenance.view" },
    { id: "rp-93", roleId: "role-readonly", permissionId: "reports.view" },
    { id: "rp-94", roleId: "role-readonly", permissionId: "settings.view" },

    // DRIVER permissions
    { id: "rp-95", roleId: "role-driver", permissionId: "driver_ledger.view" },
    { id: "rp-96", roleId: "role-driver", permissionId: "maintenance.view" },
    // BILLING permissions
    { id: "rp-97", roleId: "role-owner", permissionId: "billing.view" },
    { id: "rp-98", roleId: "role-owner", permissionId: "billing.edit" },
    { id: "rp-99", roleId: "role-manager", permissionId: "billing.view" },
    { id: "rp-100", roleId: "role-manager", permissionId: "billing.edit" },
    { id: "rp-101", roleId: "role-financial", permissionId: "billing.view" },
    { id: "rp-102", roleId: "role-financial", permissionId: "billing.edit" },
    { id: "rp-103", roleId: "role-owner", permissionId: "claims.view" },
    { id: "rp-104", roleId: "role-owner", permissionId: "claims.edit" },
    { id: "rp-105", roleId: "role-manager", permissionId: "claims.view" },
    { id: "rp-106", roleId: "role-manager", permissionId: "claims.edit" },
    { id: "rp-107", roleId: "role-financial", permissionId: "claims.view" },
    { id: "rp-108", roleId: "role-financial", permissionId: "claims.edit" },
    { id: "rp-109", roleId: "role-supervisor", permissionId: "claims.view" },
    { id: "rp-110", roleId: "role-operational", permissionId: "claims.view" },
    { id: "rp-111", roleId: "role-operational", permissionId: "claims.edit" },
    { id: "rp-112", roleId: "role-owner", permissionId: "expirations.view" },
    { id: "rp-113", roleId: "role-manager", permissionId: "expirations.view" },
    { id: "rp-114", roleId: "role-supervisor", permissionId: "expirations.view" },
    { id: "rp-115", roleId: "role-financial", permissionId: "expirations.view" },
    { id: "rp-116", roleId: "role-readonly", permissionId: "expirations.view" },
    { id: "rp-117", roleId: "role-workshop", permissionId: "maintenance.view" },
    { id: "rp-118", roleId: "role-adjuster", permissionId: "claims.view" }
  ],
  audit_logs: [
    { id: "audit-init-1", tenantId: "tenant-1", userId: "uid-super", userName: "Admin Master", action: "LOGIN", entityType: "auth", entityId: "uid-super", before: null, after: null, createdAt: new Date().toISOString() }
  ],
  activity_timeline: [
    {
      id: "act-1",
      tenantId: "tenant-1",
      entityType: "driver",
      entityId: "drv-1",
      eventType: "admission",
      title: "Admissão Registrada",
      description: "Motorista Carlos Santos foi admitido na frota.",
      metadata: {},
      createdBy: "Admin Master",
      createdAt: "2025-01-15T08:00:00Z"
    },
    {
      id: "act-2",
      tenantId: "tenant-1",
      entityType: "contract",
      entityId: "con-1",
      eventType: "contract_created",
      title: "Contrato Criado",
      description: "Contrato de locação iniciado com taxa de R$ 120/dia.",
      metadata: { dailyRate: 120 },
      createdBy: "Admin Master",
      createdAt: "2026-01-01T09:00:00Z"
    },
    {
      id: "act-3",
      tenantId: "tenant-1",
      entityType: "vehicle",
      entityId: "veh-1",
      eventType: "assignment",
      title: "Veículo Corolla Vinculado",
      description: "O veículo Corolla (ABC-1234) foi vinculado ao motorista Carlos Santos.",
      metadata: { vehicleId: "veh-1", driverId: "drv-1" },
      createdBy: "Admin Master",
      createdAt: "2026-01-01T10:00:00Z"
    }
  ],
  vehicle_assets: [
    { id: "ass-1", tenantId: "tenant-1", vehicleId: "veh-1", assetType: "Taxímetro", serialNumber: "TX-48293-A", installDate: "2025-02-15", status: "active" },
    { id: "ass-2", tenantId: "tenant-1", vehicleId: "veh-1", assetType: "Luminoso", serialNumber: "LM-98231-X", installDate: "2025-02-15", status: "active" },
    { id: "ass-3", tenantId: "tenant-1", vehicleId: "veh-1", assetType: "Rastreador", serialNumber: "RT-74829-M", installDate: "2025-02-15", status: "active" },
    { id: "ass-4", tenantId: "tenant-1", vehicleId: "veh-2", assetType: "Taxímetro", serialNumber: "TX-11823-B", installDate: "2025-05-10", status: "active" },
    { id: "ass-5", tenantId: "tenant-1", vehicleId: "veh-2", assetType: "Rastreador", serialNumber: "RT-28341-N", installDate: "2025-05-10", status: "active" }
  ],
  vehicle_incidents: [
    { id: "inc-1", tenantId: "tenant-1", vehicleId: "veh-1", driverId: "drv-1", date: "2026-03-12", description: "Colisão traseira leve em engarrafamento - arranhão no para-choque", severity: "Leve", repairCost: 450, photoUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=300" }
  ],
  driver_occurrences: [
    { id: "occ-1", tenantId: "tenant-1", driverId: "drv-1", type: "Elogio", description: "Passageiro elogiou a limpeza do veículo e a cordialidade do motorista.", date: "2026-04-18", reportedBy: "Mariana Costa" },
    { id: "occ-2", tenantId: "tenant-1", driverId: "drv-2", type: "Advertência", description: "Atraso no pagamento das diárias acumuladas em mais de 3 dias.", date: "2026-05-20", reportedBy: "Patricia Alves" }
  ],
  checklists: [
    { id: "chk-1", tenantId: "tenant-1", vehicleId: "veh-1", driverId: "drv-1", type: "Entrega", date: "2026-01-01", items: { taximetro: true, luminoso: true, chaveReserva: true, crlv: true, extintor: true, triangulo: true, macaco: true, rastreador: true }, signatureText: "Carlos Santos", signed: true }
  ],
  contract_templates: [
    {
      id: "tpl-1",
      name: "Contrato de Locação Padrão",
      body: "CONTRATO DE LOCAÇÃO DE VEÍCULO\n\nIdentificação do Motorista: {{driver_name}}\nVeículo Vinculado: {{vehicle_plate}}\nTaxa Diária Pactuada: R$ {{daily_rate}},00\nData do Contrato: {{contract_date}}\n\nPor este instrumento, as partes concordam com os termos de locação do ativo acima especificado conforme regras da frota.",
      active: true
    },
    {
      id: "tpl-2",
      name: "Termo de Distrato",
      body: "TERMO DE DISTRATO E DEVOLUÇÃO DE VEÍCULO\n\nIdentificação do Motorista: {{driver_name}}\nVeículo Vinculado: {{vehicle_plate}}\nData do Encerramento: {{contract_date}}\n\nAs partes dão plena, geral e irrevogável quitação aos direitos e deveres oriundos do contrato de locação do referido ativo.",
      active: true
    },
    {
      id: "tpl-3",
      name: "Nota Promissória de Garantia",
      body: "NOTA PROMISSÓRIA OPERACIONAL\n\nAo(s) {{contract_date}}, pagará o Sr(a) {{driver_name}} por esta única via de Nota Promissória a quantia de R$ 3.000,00 (Três mil reais) em favor da Administração de Frotas FleetOS, como garantia contratual do veículo placa {{vehicle_plate}}.",
      active: true
    },
    {
      id: "tpl-4",
      name: "Recibo de Diária",
      body: "RECIBO DE PAGAMENTO DE LOCAÇÃO\n\nRecebemos do Sr(a) {{driver_name}} a importância de R$ {{daily_rate}},00 referente à diária de locação do veículo de placa {{vehicle_plate}} no dia {{contract_date}}.\n\nOperador de Caixa: Admin FleetOS.",
      active: true
    },
    {
      id: "tpl-5",
      name: "Declaração de Responsabilidade",
      body: "DECLARAÇÃO DE VÍNCULO E RESPONSABILIDADE\n\nDeclaro para os devidos fins de direito que o motorista {{driver_name}} está devidamente credenciado e vinculado ao veículo de placa {{vehicle_plate}} sob taxa diária de R$ {{daily_rate}},00, iniciado em {{contract_date}}.\n\nO condutor declara-se ciente e responsável por multas, sinistros e avarias de trânsito durante o período.",
      active: true
    }
  ],
  daily_rate_profiles: [
    { id: "prof-1", tenantId: "tenant-1", name: "Diária Padrão Comercial", amount: 150, description: "Cobrança padrão para diárias de veículos populares da frota.", validFrom: "2026-01-01", validTo: "2026-12-31", createdAt: new Date().toISOString() },
    { id: "prof-2", tenantId: "tenant-1", name: "Diária Premium / Executivo", amount: 220, description: "Cobrança premium para veículos da categoria executiva.", validFrom: "2026-01-01", validTo: null, createdAt: new Date().toISOString() }
  ],
  billing_rules: [
    { 
      id: "rule-1", 
      tenantId: "tenant-1", 
      profileId: "prof-1", 
      calendarId: "default", 
      weekdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      exemptHolidays: true, 
      exemptOptionalDays: true, 
      active: true, 
      createdAt: new Date().toISOString() 
    },
    { 
      id: "rule-2", 
      tenantId: "tenant-1", 
      profileId: "prof-2", 
      calendarId: "default", 
      weekdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
      exemptHolidays: false, 
      exemptOptionalDays: false, 
      active: true, 
      createdAt: new Date().toISOString() 
    }
  ],
  business_calendar: [
    { id: "cal-1", tenantId: "tenant-1", date: "2026-01-01", name: "Confraternização Universal (Ano Novo)", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-2", tenantId: "tenant-1", date: "2026-04-03", name: "Sexta-feira Santa", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-3", tenantId: "tenant-1", date: "2026-05-01", name: "Dia do Trabalho", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-4", tenantId: "tenant-1", date: "2026-09-07", name: "Independência do Brasil", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-5", tenantId: "tenant-1", date: "2026-10-12", name: "Nossa Senhora Aparecida", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-6", tenantId: "tenant-1", date: "2026-11-02", name: "Finados", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-7", tenantId: "tenant-1", date: "2026-11-15", name: "Proclamação da República", type: "holiday", chargeNormally: true, createdAt: new Date().toISOString() },
    { id: "cal-8", tenantId: "tenant-1", date: "2026-12-25", name: "Natal", type: "holiday", chargeNormally: false, createdAt: new Date().toISOString() },
    { id: "cal-9", tenantId: "tenant-1", date: "2026-06-15", name: "Ponto Facultativo Municipal", type: "optional", chargeNormally: false, createdAt: new Date().toISOString() }
  ],
  billing_suspensions: [
    { id: "susp-1", tenantId: "tenant-1", driverId: "drv-1", startDate: "2026-06-04", endDate: "2026-06-05", reason: "Manutenção corretiva do Corolla (ABC-1234)", suspendCharges: true, createdAt: new Date().toISOString() }
  ],
  billing_runs: [],
  billing_run_items: [],
  insurance_claims: [
    {
      id: "claim-1",
      tenantId: "tenant-1",
      claimNumber: "SIN-2026-0001",
      vehicleId: "veh-1",
      driverId: "drv-1",
      contractId: "con-1",
      occurrenceDate: "2026-06-05T14:30",
      status: "under_review",
      severity: "medium",
      location: "Av. Paulista, 1200 - São Paulo, SP",
      description: "Colisão traseira leve em semáforo. Parachoque e lanterna traseira danificados. Sem vítimas.",
      involvedThirdParties: true,
      hasVictims: false,
      vehicleDrivable: true,
      createdBy: "Luiz Frota",
      createdAt: "2026-06-05T15:00:00Z"
    }
  ],
  claim_checklists: [
    {
      id: "cc-1",
      claimId: "claim-1",
      frontPhotos: true,
      rearPhotos: true,
      sidePhotos: true,
      dashboardPhoto: true,
      odometerPhoto: true,
      crlvAttached: true,
      cnhAttached: true,
      updatedAt: "2026-06-05T15:10:00Z"
    }
  ],
  claim_evidences: [
    { id: "ev-1", claimId: "claim-1", fileType: "Foto", fileUrl: "https://images.unsplash.com/photo-1597766353982-f597980302b1?w=400", uploadedAt: "2026-06-05T15:12:00Z" },
    { id: "ev-2", claimId: "claim-1", fileType: "Foto", fileUrl: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=400", uploadedAt: "2026-06-05T15:12:00Z" }
  ],
  claim_reports: [
    { id: "rep-1", claimId: "claim-1", reportNumber: "BO-987654/2026", policeStation: "78º Distrito Policial", reportDate: "2026-06-05", attachmentUrl: "https://example.com/bo_claim_1.pdf" }
  ],
  claim_third_parties: [
    { id: "tp-1", claimId: "claim-1", name: "Marcos Oliveira", cpf: "987.654.321-99", phone: "(11) 98888-2222", plate: "XYZ-9876", vehicle: "Honda Civic Cinza", insurer: "Porto Seguro" }
  ],
  claim_damage_items: [
    { id: "cdi-1", claimId: "claim-1", item: "Parachoque Dianteiro", severity: "medium", estimatedCost: 1200 },
    { id: "cdi-2", claimId: "claim-1", item: "Lanterna Traseira", severity: "light", estimatedCost: 500 }
  ],
  damage_price_table: [
    { id: "p1", item: "Retrovisor", suggestedCost: 300 },
    { id: "p2", item: "Farol", suggestedCost: 800 },
    { id: "p3", item: "Parachoque Dianteiro", suggestedCost: 1200 },
    { id: "p4", item: "Lanterna Traseira", suggestedCost: 500 },
    { id: "p5", item: "Pneu", suggestedCost: 600 },
    { id: "p6", item: "Porta Lateral", suggestedCost: 1500 },
    { id: "p7", item: "Capô", suggestedCost: 1000 },
    { id: "p8", item: "Vidro Parabrisa", suggestedCost: 900 }
  ],
  claim_budgets: [
    { id: "bud-1", claimId: "claim-1", workshopName: "Oficina Auto Centro Paulista", amount: 1650, description: "Reparo de parachoque e troca de lanterna", status: "pending", attachmentUrl: "https://example.com/orcamento_1.pdf" },
    { id: "bud-2", claimId: "claim-1", workshopName: "Funilaria Express Pinheiros", amount: 1550, description: "Recuperação rápida de parachoque e faróis", status: "approved", attachmentUrl: "https://example.com/orcamento_2.pdf" },
    { id: "bud-3", claimId: "claim-1", workshopName: "Concessionária Toyota SP", amount: 2500, description: "Peças novas originais de fábrica", status: "rejected", attachmentUrl: "https://example.com/orcamento_3.pdf" }
  ],
  claim_installments: [],
  claim_approvals: [
    { id: "app-1", claimId: "claim-1", role: "OPERATIONAL", status: "approved", approvedBy: "Roberto Lima", approvedAt: "2026-06-05T16:00:00Z", comments: "Checklist validado e BO anexado." },
    { id: "app-2", claimId: "claim-1", role: "SUPERVISOR", status: "approved", approvedBy: "Gerson Silva", approvedAt: "2026-06-05T16:30:00Z", comments: "Orçamentos condizentes com os danos." }
  ],
  inventory_items: [
    { id: "inv-1", tenantId: "tenant-1", code: "PEA-FLE-01", name: "Pastilha de Freio Dianteira", currentQty: 15, minQty: 5, avgCost: 120, unit: "Jogo", active: true },
    { id: "inv-2", tenantId: "tenant-1", code: "OLE-MOB-01", name: "Óleo Motor 5W30", currentQty: 4, minQty: 8, avgCost: 45, unit: "Litro", active: true },
    { id: "inv-3", tenantId: "tenant-1", code: "FIL-OLE-01", name: "Filtro de Óleo Corolla", currentQty: 10, minQty: 3, avgCost: 35, unit: "Unidade", active: true },
    { id: "inv-4", tenantId: "tenant-1", code: "PNE-FIR-01", name: "Pneu Firestone 175/70 R14", currentQty: 2, minQty: 4, avgCost: 380, unit: "Unidade", active: true }
  ],
  suppliers: [
    { id: "sup-1", tenantId: "tenant-1", name: "Autopeças Jabaquara Ltda", cnpj: "11.222.333/0001-44", phone: "(11) 5562-4444", email: "vendas@autopecasjabaquara.com", address: "Av. Jabaquara, 2500 - São Paulo, SP", active: true },
    { id: "sup-2", tenantId: "tenant-1", name: "Distribuidora LubriMax", cnpj: "22.333.444/0001-55", phone: "(11) 4004-9821", email: "comercial@lubrimax.com.br", address: "Rua das Nações, 89 - Guarulhos, SP", active: true }
  ],
  purchase_orders: [
    { id: "po-1", tenantId: "tenant-1", supplierId: "sup-1", status: "delivered", totalCost: 1800, paymentMethod: "Faturado 30 dias", createdAt: "2026-06-01T10:00:00Z", deliveredAt: "2026-06-03T14:00:00Z" },
    { id: "po-2", tenantId: "tenant-1", supplierId: "sup-2", status: "ordered", totalCost: 900, paymentMethod: "Pix", createdAt: "2026-06-10T11:00:00Z", deliveredAt: "" }
  ],
  purchase_order_items: [
    { id: "poi-1", tenantId: "tenant-1", purchaseOrderId: "po-1", itemId: "inv-1", qty: 10, unitCost: 120, totalCost: 1200 },
    { id: "poi-2", tenantId: "tenant-1", purchaseOrderId: "po-1", itemId: "inv-3", qty: 10, unitCost: 35, totalCost: 350 },
    { id: "poi-3", tenantId: "tenant-1", purchaseOrderId: "po-1", itemId: "inv-2", qty: 5, unitCost: 50, totalCost: 250 }
  ],
  work_orders: [
    { id: "wo-1", tenantId: "tenant-1", vehicleId: "veh-1", status: "completed", description: "Revisão geral de suspensão e freios dianteiros", totalPartsCost: 310, totalLaborCost: 250, totalCost: 560, mileage: 44000, operatorId: "uid-super", createdAt: "2026-06-05T09:00:00Z", completedAt: "2026-06-05T15:00:00Z" },
    { id: "wo-2", tenantId: "tenant-1", vehicleId: "veh-2", status: "in_progress", description: "Diagnóstico de barulho no motor e troca de óleo", totalPartsCost: 0, totalLaborCost: 0, totalCost: 0, mileage: 98100, operatorId: "uid-super", workshopId: "uid-workshop", createdAt: "2026-06-11T08:00:00Z", completedAt: "" }
  ],
  work_order_items: [
    { id: "woi-1", tenantId: "tenant-1", workOrderId: "wo-1", type: "PART", itemId: "inv-1", description: "Pastilha de Freio Dianteira", qty: 2, unitCost: 120, totalCost: 240 },
    { id: "woi-2", tenantId: "tenant-1", workOrderId: "wo-1", type: "PART", itemId: "inv-3", description: "Filtro de Óleo Corolla", qty: 2, unitCost: 35, totalCost: 70 },
    { id: "woi-3", tenantId: "tenant-1", workOrderId: "wo-1", type: "LABOR", itemId: null, description: "Mão de obra mecânica suspensão", qty: 1, unitCost: 250, totalCost: 250 }
  ],
  inventory_movements: [
    { id: "mov-st-1", tenantId: "tenant-1", itemId: "inv-1", type: "IN", qty: 10, unitCost: 120, totalCost: 1200, referenceId: "po-1", referenceType: "purchase_order", notes: "Entrada de compra PO-1", createdAt: "2026-06-03T14:00:00Z" },
    { id: "mov-st-2", tenantId: "tenant-1", itemId: "inv-1", type: "OUT", qty: 2, unitCost: 120, totalCost: 240, referenceId: "wo-1", referenceType: "work_order", notes: "Consumo na OS WO-1", createdAt: "2026-06-05T15:00:00Z" },
    { id: "mov-st-3", tenantId: "tenant-1", itemId: "inv-3", type: "OUT", qty: 2, unitCost: 35, totalCost: 70, referenceId: "wo-1", referenceType: "work_order", notes: "Consumo na OS WO-1", createdAt: "2026-06-05T15:00:00Z" }
  ],
  vehicle_expenses: [
    { id: "exp-1", tenantId: "tenant-1", vehicleId: "veh-1", expenseType: "maintenance", amount: 560, date: "2026-06-05", referenceId: "wo-1", referenceType: "work_order", description: "OS WO-1: Revisão geral de suspensão e freios", createdAt: "2026-06-05T15:00:00Z" },
    { id: "exp-2", tenantId: "tenant-1", vehicleId: "veh-2", expenseType: "maintenance", amount: 350, date: "2026-05-20", referenceId: "maint-1", referenceType: "maintenance_log", description: "Troca de óleo e filtros (Legado)", createdAt: "2026-05-20T10:00:00Z" },
    { id: "exp-3", tenantId: "tenant-1", vehicleId: "veh-1", expenseType: "maintenance", amount: 180, date: "2026-04-10", referenceId: "maint-2", referenceType: "maintenance_log", description: "Alinhamento e balanceamento (Legado)", createdAt: "2026-04-10T10:00:00Z" }
  ],
  inventory_pending_items: [
    {
      id: "pend-1",
      tenantId: "tenant-1",
      workOrderId: "wo-2",
      description: "Mangueira do ar quente Corolla",
      qty: 1,
      requestedBy: "Oficina Jabaquara",
      status: "pending",
      notes: "Vazamento na mangueira de aquecimento interno",
      createdAt: "2026-06-11T10:00:00Z"
    },
    {
      id: "pend-2",
      tenantId: "tenant-1",
      workOrderId: "wo-2",
      description: "Moldura do retrovisor direito",
      qty: 2,
      requestedBy: "Oficina Jabaquara",
      status: "pending",
      notes: "Moldura plástica externa quebrada",
      createdAt: "2026-06-11T10:15:00Z"
    }
  ],
  taxi_points: [
    { id: "point-1", tenantId: "tenant-1", code: "PONTO-87", name: "Aeroporto de Congonhas", address: "Av. Washington Luís, s/n", expirationDate: "2026-11-15", status: "active" },
    { id: "point-2", tenantId: "tenant-1", code: "PONTO-42", name: "Terminal Rodoviário Tietê", address: "Av. Cruzeiro do Sul, 1800", expirationDate: "2026-05-31", status: "active" }
  ],
  regulatory_dispatchers: [
    { id: "dispatcher-1", tenantId: "tenant-1", name: "Despachante Paulista", type: "company", phone: "(11) 3333-4400", email: "operacao@despachantepaulista.com.br", status: "active" },
    { id: "dispatcher-2", tenantId: "tenant-1", name: "Carlos Mendes", type: "internal", phone: "(11) 98888-2200", email: "carlos@fleetos.com", status: "active" }
  ],
  permits: [
    { id: "permit-1", tenantId: "tenant-1", permitNumber: "12345", ownerId: "owner-1", ownerName: "Frota Michelines", permissionHolder: "Frota Michelines", currentVehicleId: "veh-1", pointId: "point-1", expirationDate: "2027-04-30", status: "linked", history: [{ date: "2026-01-01", vehicleId: "veh-1", action: "Vinculado ao veículo" }] },
    { id: "permit-2", tenantId: "tenant-1", permitNumber: "67890", ownerId: "owner-2", ownerName: "Frota Michelines", permissionHolder: "Frota Michelines", currentVehicleId: "veh-2", pointId: "point-2", expirationDate: "2026-10-20", status: "linked", history: [{ date: "2026-01-01", vehicleId: "veh-2", action: "Vinculado ao veículo" }] },
    { id: "permit-3", tenantId: "tenant-1", permitNumber: "11122", ownerId: "owner-3", ownerName: "Frota Michelines", permissionHolder: "Frota Michelines", currentVehicleId: null, pointId: "point-1", expirationDate: "2027-01-15", status: "available", history: [{ date: "2026-05-10", vehicleId: null, action: "Liberado para estoque" }] },
    { id: "permit-4", tenantId: "tenant-1", permitNumber: "33344", ownerId: "owner-4", ownerName: "Frota Michelines", permissionHolder: "Frota Michelines", currentVehicleId: null, pointId: null, expirationDate: "2026-12-01", status: "deposited", history: [{ date: "2026-04-18", vehicleId: null, action: "Depositado sem veículo" }] }
  ],
  regulatory_processes: [
    { id: "reg-process-1", tenantId: "tenant-1", permitId: "permit-1", oldVehicleId: "veh-1", newVehicleId: "veh-3", processType: "replacement", status: "in_progress", stage: "dismantling", workOrderNumber: "OS-REG-2026-0001", dispatcherId: "dispatcher-1", responsibleUser: "Patricia Alves", deadline: "2026-06-30", estimatedCost: 8900, actualCost: 1800, checklist: { removeTaximeter: true, removeIpemSeal: true, closeOperation: true, issueExitDocuments: false, unlinkDtp: false, releasePermit: false } },
    { id: "reg-process-2", tenantId: "tenant-1", permitId: "permit-3", oldVehicleId: null, newVehicleId: "veh-4", processType: "accreditation", status: "in_progress", stage: "preparing_vehicle", workOrderNumber: "OS-REG-2026-0002", dispatcherId: "dispatcher-2", responsibleUser: "Patricia Alves", deadline: "2026-07-05", estimatedCost: 7600, actualCost: 1450, checklist: { invoice: true, detranRegistration: true, plates: true, renavam: true, dtpPreRegistration: false, installTaximeter: false, installNumberKit: false, ipemInspection: false, dtpApproval: false, linkPermit: false } }
  ],
  driver_regulatory: [
    { id: "drg-1", tenantId: "tenant-1", driverId: "drv-1", condutaxNumber: "C-54321", issueDate: "2023-11-20", expirationDate: "2028-11-20", status: "active", cnhExpirationDate: "2029-12-31", courseExpirationDate: "2028-06-15", dtpBlocked: false, observations: "Condutor em situação regular." },
    { id: "drg-2", tenantId: "tenant-1", driverId: "drv-2", condutaxNumber: "C-98765", issueDate: "2021-06-25", expirationDate: "2026-06-25", status: "expired", cnhExpirationDate: "2028-06-15", courseExpirationDate: "2025-06-25", dtpBlocked: false, observations: "CONDUTAX expirado." },
    { id: "drg-3", tenantId: "tenant-1", driverId: "drv-3", condutaxNumber: "C-11223", issueDate: "2024-02-15", expirationDate: "2029-02-15", status: "blocked_dtp", cnhExpirationDate: "2027-10-10", courseExpirationDate: "2029-02-15", dtpBlocked: true, observations: "Bloqueado pelo DTP devido a pendência administrativa." }
  ],
  infractions: [
    { id: "inf-1", tenantId: "tenant-1", vehicleId: "veh-1", driverId: "drv-1", autoNumber: "A-987654", orgao: "DSV/CET", description: "Transitar em velocidade superior à máxima permitida em até 20%", valor: 195.23, pontuacao: 4, vencimento: "2026-07-10", responsavel: "driver", status: "pending", createdAt: new Date().toISOString() },
    { id: "inf-2", tenantId: "tenant-1", vehicleId: "veh-1", driverId: "drv-1", autoNumber: "B-123456", orgao: "DER", description: "Transitar em velocidade superior à máxima permitida de 20% a 50%", valor: 130.15, pontuacao: 3, vencimento: "2026-06-20", responsavel: "company", status: "paid", createdAt: new Date().toISOString() },
    { id: "inf-3", tenantId: "tenant-1", vehicleId: "veh-2", driverId: "drv-2", autoNumber: "C-456789", orgao: "PRF", description: "Não manter acesa a luz baixa de dia, nas rodovias", valor: 880.41, pontuacao: 7, vencimento: "2026-08-01", responsavel: "undetermined", status: "pending", createdAt: new Date().toISOString() }
  ],
  vehicle_lifecycle_processes: [
    { id: "vlp-1", tenantId: "tenant-1", vehicleId: "veh-1", operationType: "taxi", phase: "operation", step: "active", status: "completed", startedAt: "2026-01-01T08:00:00Z", checklistCompletion: 100 },
    { id: "vlp-2", tenantId: "tenant-1", vehicleId: "veh-2", operationType: "taxi", phase: "operation", step: "active", status: "completed", startedAt: "2026-01-01T08:00:00Z", checklistCompletion: 100 },
    { id: "vlp-3", tenantId: "tenant-1", vehicleId: "veh-3", operationType: "taxi", phase: "entry", step: "gnv", status: "in_progress", startedAt: "2026-06-10T10:00:00Z", checklistCompletion: 62 },
    { id: "vlp-4", tenantId: "tenant-1", vehicleId: "veh-4", operationType: "taxi", phase: "entry", step: "taximetro", status: "in_progress", startedAt: "2026-06-12T09:00:00Z", checklistCompletion: 37 }
  ],
  vehicle_compliance_scores: [
    { id: "vcs-1", tenantId: "tenant-1", vehicleId: "veh-1", score: 98, status: "excellent", lastCalculated: new Date().toISOString() },
    { id: "vcs-2", tenantId: "tenant-1", vehicleId: "veh-2", score: 85, status: "warning", lastCalculated: new Date().toISOString() },
    { id: "vcs-3", tenantId: "tenant-1", vehicleId: "veh-3", score: 62, status: "critical", lastCalculated: new Date().toISOString() },
    { id: "vcs-4", tenantId: "tenant-1", vehicleId: "veh-4", score: 37, status: "critical", lastCalculated: new Date().toISOString() }
  ],
  annual_inspections: [
    { id: "ai-1", tenantId: "tenant-1", vehicleId: "veh-1", damspPaid: true, inspectionDate: "2026-02-10", oiaNumber: "OIA-998811", result: "approved", permitIssued: true, year: 2026 },
    { id: "ai-2", tenantId: "tenant-1", vehicleId: "veh-2", damspPaid: true, inspectionDate: "2026-05-18", oiaNumber: "OIA-775533", result: "approved", permitIssued: true, year: 2026 }
  ],
  taximeter_adjustments: [
    { id: "ta-1", tenantId: "tenant-1", vehicleId: "veh-1", tariffVersion: "Tarifa 2026", adjustmentDate: "2026-03-01", workshop: "Taxímetros Jabaquara", status: "completed" },
    { id: "ta-2", tenantId: "tenant-1", vehicleId: "veh-2", tariffVersion: "Tarifa 2026", adjustmentDate: "2026-03-02", workshop: "Taxímetros Lapa", status: "completed" }
  ],
  gnv_registries: [
    { id: "gr-1", tenantId: "tenant-1", vehicleId: "veh-1", cylinderNumber: "GNV-554433", installationCompany: "Gás Tecnologia Ltda", certificationDate: "2026-01-10", expirationDate: "2027-01-10", status: "valid" },
    { id: "gr-2", tenantId: "tenant-1", vehicleId: "veh-2", cylinderNumber: "GNV-998877", installationCompany: "Convertedora Ipiranga", certificationDate: "2025-06-25", expirationDate: "2026-06-25", status: "warning" },
    { id: "gr-3", tenantId: "tenant-1", vehicleId: "veh-3", cylinderNumber: "GNV-112233", installationCompany: "Convertedora Centro", certificationDate: "2024-05-10", expirationDate: "2025-05-10", status: "expired" }
  ]
};

function generateVolumeMocks() {
  const driversList = [...DEFAULT_SEEDS.drivers];
  const vehiclesList = [...DEFAULT_SEEDS.vehicles];
  const contractsList = [...DEFAULT_SEEDS.contracts];
  const ledgerList = [...DEFAULT_SEEDS.driver_ledger];
  const cashierSessionsList = [...DEFAULT_SEEDS.cashier_sessions];
  const cashierMovementsList = [...DEFAULT_SEEDS.cashier_movements];
  const workOrdersList = [...DEFAULT_SEEDS.work_orders];
  const workOrderItemsList = [...DEFAULT_SEEDS.work_order_items];
  const inventoryMovementsList = [...DEFAULT_SEEDS.inventory_movements];
  const vehicleExpensesList = [...DEFAULT_SEEDS.vehicle_expenses];
  const claimsList = [...DEFAULT_SEEDS.insurance_claims];
  const claimChecklistsList = [...DEFAULT_SEEDS.claim_checklists];
  const claimDamageItemsList = [...DEFAULT_SEEDS.claim_damage_items];
  const claimBudgetsList = [...DEFAULT_SEEDS.claim_budgets];
  const maintenanceList = [...DEFAULT_SEEDS.maintenance];
  const appointmentsList: any[] = [];
  const billingRunsList: any[] = [];
  const ledgerEntriesList: any[] = [];

  // Helper generators
  const firstNames = ["Carlos", "Ana", "Roberto", "Mariana", "Gerson", "Juliana", "Felipe", "Sandra", "Rodrigo", "Amanda", "Lucas", "Beatriz", "Paulo", "Camila", "Bruno", "Patricia", "Diego", "Larissa", "Ricardo", "Vanessa"];
  const lastNames = ["Santos", "Silva", "Oliveira", "Costa", "Alves", "Lima", "Souza", "Pereira", "Carvalho", "Rodrigues", "Nascimento", "Gomes", "Martins", "Araujo", "Ribeiro", "Melo", "Almeida", "Cardoso", "Teixeira", "Pinto"];
  
  // 1. Generate 80 Drivers
  for (let i = 10; i <= 90; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const name = `${fn} ${ln}`;
    const id = `drv-${i}`;
    const status = i % 8 === 0 ? "blocked" : "active";
    driversList.push({
      id,
      tenantId: "tenant-1",
      name,
      cpf: `321.${i}56.${i}89-00`,
      rg: `23.${i}45.${i}67-8`,
      phone: `(11) 9${80000000 + i * 12345}`,
      condutax: `C-${50000 + i}`,
      condutaxExpiration: `2027-10-12`,
      alvaraNumber: `A-${100 + i}`,
      alvaraExpiration: `2027-12-20`,
      cnhNumber: `900000000${i}`,
      cnhCategory: i % 5 === 0 ? "D" : "AB",
      cnhExpiration: `2029-05-15`,
      address: `Av. General Rondon, ${100 + i} - São Paulo, SP`,
      addressFull: { street: "Av. General Rondon", number: String(100 + i), zipCode: "02011-000", city: "São Paulo", state: "SP" },
      emergencyContact: `Familiar - (11) 98000-00${i}`,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=150`,
      status,
      activeLocks: status === "blocked" ? ["Financeiro"] : [],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      birthDate: "1990-08-15",
      civilStatus: "Solteiro(a)",
      notes: "Motorista gerado automaticamente para testes de volume e faturamento.",
      admissionDate: "2025-01-10",
      exitDate: ""
    });
  }

  // 2. Generate 50 Vehicles
  const brands = ["Toyota", "Chevrolet", "Fiat", "Volkswagen", "Hyundai", "BYD", "GWM", "Nissan"];
  const models = [
    { brand: "Toyota", model: "Corolla", cat: "cat-c" },
    { brand: "Toyota", model: "Yaris", cat: "cat-b" },
    { brand: "Chevrolet", model: "Onix", cat: "cat-a" },
    { brand: "Chevrolet", model: "Spin", cat: "cat-b" },
    { brand: "Fiat", model: "Cronos", cat: "cat-b" },
    { brand: "Fiat", model: "Mobi", cat: "cat-a" },
    { brand: "Volkswagen", model: "Gol", cat: "cat-a" },
    { brand: "Volkswagen", model: "Virtus", cat: "cat-b" },
    { brand: "Hyundai", model: "HB20", cat: "cat-a" },
    { brand: "BYD", model: "King", cat: "cat-h" },
    { brand: "BYD", model: "Dolphin", cat: "cat-e" },
    { brand: "Nissan", model: "Sentra", cat: "cat-c" }
  ];
  const colors = ["Branco", "Prata", "Preto", "Cinza", "Vermelho"];
  
  for (let i = 10; i <= 60; i++) {
    const mInfo = models[i % models.length];
    const plate = `KPT-${1000 + i}`;
    const id = `veh-${i}`;
    const status = i % 12 === 0 ? "maintenance" : i % 15 === 0 ? "inactive" : "active";
    vehiclesList.push({
      id,
      tenantId: "tenant-1",
      plate,
      model: mInfo.model,
      brand: mInfo.brand,
      year: 2021 + (i % 4),
      renavam: `9876${i}4321`,
      chassis: `9BWCA02X8J9128${i}`,
      fuelType: mInfo.brand === "BYD" ? (mInfo.model === "Dolphin" ? "Elétrico" : "Híbrido") : "Flex",
      mileage: 20000 + i * 1500,
      insuranceExpiration: "2027-05-18",
      registrationExpiration: "2027-10-10",
      status,
      photoUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300",
      color: colors[i % colors.length],
      activeLocks: status === "maintenance" ? ["Manutenção"] : [],
      pricingCategoryId: mInfo.cat,
      defaultPackageId: mInfo.cat === "cat-c" || mInfo.cat === "cat-h" ? "pkg-executive" : "pkg-flex",
      billingProfileId: i % 2 === 0 ? "profile-daily-full" : "profile-daily-work"
    });
  }

  // 3. Generate 35 Contracts
  for (let i = 10; i <= 45; i++) {
    const drvId = `drv-${i}`;
    const vehId = `veh-${i}`;
    const contractId = `con-${i}`;
    const dailyRateVal = 160 + (i % 5) * 10;
    
    contractsList.push({
      id: contractId,
      tenantId: "tenant-1",
      driverId: drvId,
      vehicleId: vehId,
      startDate: "2026-01-10",
      endDate: "2026-12-31",
      dailyRate: dailyRateVal,
      weeklyRate: dailyRateVal * 6,
      monthlyRate: dailyRateVal * 24,
      status: i % 10 === 0 ? "closed" : "active",
      closedBy: "",
      amountPaid: 8400,
      type: "Locação",
      pdfSignedUrl: "",
      dailyProfileId: "prof-1",
      dailyAmountSnapshot: dailyRateVal,
      dailyProfileNameSnapshot: "Diária Padrão Comercial",
      pricingSnapshot: {
        contractType: "taxi",
        billingProfile: "profile-daily-taxi-sp",
        pricingTable: "tbl-std",
        category: i % 3 === 0 ? "cat-a" : "cat-b",
        subcategory: "",
        dailyRate: dailyRateVal
      }
    });

    // 4. Generate Ledger Entries for these contracts
    ledgerList.push({
      id: `led-gen-init-${i}`,
      tenantId: "tenant-1",
      driverId: drvId,
      type: "payment",
      description: "Caução Garantia Inicial - Pix",
      amount: 1000,
      createdAt: "2026-01-10T10:00:00Z"
    });

    for (let d = 1; d <= 8; d++) {
      const chargeDateStr = `2026-06-0${d}`;
      ledgerList.push({
        id: `led-gen-chg-${i}-${d}`,
        tenantId: "tenant-1",
        driverId: drvId,
        type: "daily",
        description: `Diária de Locação - Ref: ${chargeDateStr}`,
        amount: -dailyRateVal,
        createdAt: `${chargeDateStr}T08:00:00Z`
      });
    }

    ledgerList.push({
      id: `led-gen-pay-${i}`,
      tenantId: "tenant-1",
      driverId: drvId,
      type: "payment",
      description: "Pagamento de Diárias - Pix Recebido",
      amount: dailyRateVal * 8,
      createdAt: "2026-06-09T18:00:00Z"
    });
  }

  // 5. Generate 20 Cashier Sessions & Sessions Movements
  for (let i = 1; i <= 20; i++) {
    const cashId = `cash-gen-${i}`;
    const dateStr = `2026-06-${i < 10 ? '0' + i : i}`;
    cashierSessionsList.push({
      id: cashId,
      tenantId: "tenant-1",
      operatorId: "uid-super",
      openedAt: `${dateStr}T08:00:00Z`,
      closedAt: `${dateStr}T18:00:00Z`,
      openingAmount: 100,
      closingAmount: 1100 + i * 50,
      difference: 0,
      status: "closed"
    });

    for (let m = 1; m <= 3; m++) {
      cashierMovementsList.push({
        id: `mov-gen-${i}-${m}`,
        tenantId: "tenant-1",
        cashierId: cashId,
        type: "RECEIPT",
        amount: 300 + m * 80,
        paymentMethod: "Pix",
        description: `Recebimento diárias Lote - Motorista drv-${10 + i * m}`,
        createdAt: `${dateStr}T14:00:00Z`
      });
    }
  }

  // 6. Generate Work Orders and Service logs (25 records)
  for (let i = 10; i <= 35; i++) {
    const woId = `wo-gen-${i}`;
    const vehId = `veh-${i}`;
    const isCompleted = i % 3 !== 0;
    workOrdersList.push({
      id: woId,
      tenantId: "tenant-1",
      vehicleId: vehId,
      status: isCompleted ? "completed" : "in_progress",
      description: i % 2 === 0 ? "Troca de amortecedores e pastilhas" : "Revisão periódica de suspensão e óleo",
      totalPartsCost: 250 + i * 8,
      totalLaborCost: 150 + i * 4,
      totalCost: 400 + i * 12,
      mileage: 35000 + i * 1000,
      operatorId: "uid-super",
      createdAt: `2026-05-${i}T09:00:00Z`,
      completedAt: isCompleted ? `2026-05-${i}T17:00:00Z` : ""
    });

    workOrderItemsList.push({
      id: `woi-gen-${i}-1`,
      tenantId: "tenant-1",
      workOrderId: woId,
      type: "PART",
      itemId: "inv-1",
      description: "Pastilha de Freio Dianteira",
      qty: 1,
      unitCost: 120,
      totalCost: 120
    });

    vehicleExpensesList.push({
      id: `exp-gen-${i}`,
      tenantId: "tenant-1",
      vehicleId: vehId,
      expenseType: "maintenance",
      amount: 400 + i * 12,
      date: `2026-05-${i}`,
      referenceId: woId,
      referenceType: "work_order",
      description: `Manutenção OS: ${isCompleted ? 'Concluída' : 'Em progresso'}`,
      createdAt: `2026-05-${i}T17:00:00Z`
    });

    maintenanceList.push({
      id: `maint-gen-${i}`,
      tenantId: "tenant-1",
      vehicleId: vehId,
      type: i % 2 === 0 ? "Preventiva" : "Corretiva",
      description: i % 2 === 0 ? "Revisão geral com filtros e óleo" : "Alinhamento e rodízio de pneus",
      cost: 400 + i * 12,
      date: `2026-05-${i}`,
      mileage: 35000 + i * 1000,
      nextMaintenanceMileage: 45000 + i * 1000
    });
  }

  // 7. Generate Claims & damaged structures (10 cases)
  for (let i = 1; i <= 10; i++) {
    const claimId = `claim-gen-${i}`;
    const vehId = `veh-${10 + i}`;
    const drvId = `drv-${10 + i}`;
    claimsList.push({
      id: claimId,
      tenantId: "tenant-1",
      claimNumber: `SIN-2026-000${i + 1}`,
      vehicleId: vehId,
      driverId: drvId,
      contractId: `con-${10 + i}`,
      occurrenceDate: `2026-06-0${i}T11:20`,
      status: i % 3 === 0 ? "resolved" : i % 2 === 0 ? "authorized" : "under_review",
      severity: i % 3 === 0 ? "heavy" : "medium",
      location: `Av. Interlagos, ${1000 + i * 100} - São Paulo, SP`,
      description: "Colisão lateral ao tentar mudar de faixa. Danos na lataria lateral e retrovisores.",
      involvedThirdParties: false,
      hasVictims: false,
      vehicleDrivable: true,
      createdBy: "Luiz Frota",
      createdAt: `2026-06-0${i}T12:00:00Z`
    });

    claimDamageItemsList.push({
      id: `cdi-gen-${i}-1`,
      claimId,
      item: "Porta Lateral",
      severity: "medium",
      estimatedCost: 1500
    });

    claimDamageItemsList.push({
      id: `cdi-gen-${i}-2`,
      claimId,
      item: "Retrovisor",
      severity: "light",
      estimatedCost: 300
    });
  }

  return {
    drivers: driversList,
    vehicles: vehiclesList,
    contracts: contractsList,
    driver_ledger: ledgerList,
    cashier_sessions: cashierSessionsList,
    cashier_movements: cashierMovementsList,
    work_orders: workOrdersList,
    work_order_items: workOrderItemsList,
    inventory_movements: inventoryMovementsList,
    vehicle_expenses: vehicleExpensesList,
    insurance_claims: claimsList,
    claim_checklists: claimChecklistsList,
    claim_damage_items: claimDamageItemsList,
    claim_budgets: claimBudgetsList,
    maintenance: maintenanceList
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null);

  // Initialize mock database in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const forceReSeed = !localStorage.getItem("fleetos_volume_seeded_v3") ||
        (localStorage.getItem("fleetos_drivers") && JSON.parse(localStorage.getItem("fleetos_drivers") || "[]").length <= 2);

      if (forceReSeed) {
        // Clear existing keys first to ensure a clean slate
        [
          "companies", "user_profiles", "drivers", "vehicles", "pricing_categories", "pricing_tables", "pricing_rates",
          "billing_event_types", "pricing_packages", "contract_billing_profiles", "pricing_calendar", "pricing_exemptions",
          "pricing_promotions", "operation_types", "pricing_subcategories", "contract_types", "billing_profiles",
          "calendar_rules", "pricing_table_versions", "contract_billing", "vehicle_acquisition", "contracts",
          "notifications", "attachments", "payments", "maintenance", "driver_ledger", "vehicle_assignments",
          "cashier_sessions", "cashier_movements", "maintenance_plan_items", "roles", "permissions", "role_permissions",
          "audit_logs", "activity_timeline", "vehicle_assets", "vehicle_incidents", "driver_occurrences", "checklists",
          "contract_templates", "daily_rate_profiles", "billing_rules", "business_calendar", "billing_suspensions",
          "billing_runs", "billing_run_items", "insurance_claims", "claim_checklists", "claim_evidences",
          "claim_reports", "claim_third_parties", "claim_damage_items", "damage_price_table", "claim_budgets",
          "claim_installments", "claim_approvals", "inventory_items", "suppliers", "purchase_orders",
          "purchase_order_items", "work_orders", "work_order_items", "inventory_movements", "vehicle_expenses",
          "inventory_pending_items", "permits", "regulatory_processes", "regulatory_dispatchers", "taxi_points", "driver_regulatory", "infractions", "vehicle_lifecycle_processes",
          "vehicle_compliance_scores", "annual_inspections", "taximeter_adjustments", "gnv_registries"
        ].forEach(key => localStorage.removeItem(`fleetos_${key}`));
        
        localStorage.setItem("fleetos_volume_seeded_v3", "true");
      }

      const volumeMocks = generateVolumeMocks();
      const mergedSeeds = {
        ...DEFAULT_SEEDS,
        ...volumeMocks
      };

      Object.entries(mergedSeeds).forEach(([key, value]) => {
        if (!localStorage.getItem(`fleetos_${key}`)) {
          localStorage.setItem(`fleetos_${key}`, JSON.stringify(value));
        }
      });

      // Keep other pricing, maintenance, inventory and expenses seeds in sync for existing databases
      [
        "pricing_categories", "pricing_tables", "pricing_rates", "billing_event_types",
        "pricing_packages", "contract_billing_profiles", "pricing_calendar", "pricing_exemptions", "contract_billing",
        "inventory_items", "suppliers", "purchase_orders", "purchase_order_items", "work_orders", "work_order_items", "inventory_movements", "vehicle_expenses",
        "inventory_pending_items", "operation_types", "pricing_subcategories", "contract_types", "billing_profiles",
        "calendar_rules", "pricing_promotions", "pricing_table_versions", "permits", "regulatory_processes", "regulatory_dispatchers", "taxi_points", "driver_regulatory", "infractions",
        "vehicle_lifecycle_processes", "vehicle_compliance_scores", "annual_inspections", "taximeter_adjustments", "gnv_registries"
      ].forEach((key) => {
        if (!localStorage.getItem(`fleetos_${key}`)) {
          localStorage.setItem(`fleetos_${key}`, JSON.stringify(mergedSeeds[key as keyof typeof mergedSeeds]));
        }
      });


      // Keep additive security metadata in sync for existing mock databases.
      ["permissions", "role_permissions"].forEach((key) => {
        const seedItems = DEFAULT_SEEDS[key as keyof typeof DEFAULT_SEEDS] as Array<{ id: string }>;
        const storedItems = JSON.parse(localStorage.getItem(`fleetos_${key}`) || "[]") as Array<{ id: string }>;
        const storedIds = new Set(storedItems.map(item => item.id));
        const missingItems = seedItems.filter(item => !storedIds.has(item.id));
        if (missingItems.length > 0) {
          localStorage.setItem(`fleetos_${key}`, JSON.stringify([...storedItems, ...missingItems]));
        }
      });
      
      // Auto login in mock mode if user saved
      if (isMock) {
        const savedUser = localStorage.getItem("fleetos_current_user");
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
        setLoading(false);
      }
    }
  }, []);

  // Load permissions when current user changes
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!currentUser) {
        setUserPermissions([]);
        return;
      }
      
      if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin") {
        setUserPermissions(["*"]);
        return;
      }

      try {
        if (isMock) {
          const rawRP = localStorage.getItem("fleetos_role_permissions");
          const listRP = rawRP ? JSON.parse(rawRP) : [];
          const matchedPerms = listRP
            .filter((rp: any) => rp.roleId === currentUser.roleId)
            .map((rp: any) => rp.permissionId);
          setUserPermissions(matchedPerms);
        } else {
          const rpRef = collection(fireDb, "role_permissions");
          const q = query(rpRef, where("roleId", "==", currentUser.roleId));
          const snap = await getFireDocs(q);
          const matchedPerms = snap.docs.map(doc => doc.data().permissionId);
          setUserPermissions(matchedPerms);
        }
      } catch (e) {
        console.error("Erro ao carregar permissões do usuário", e);
        setUserPermissions([]);
      }
    };

    loadUserPermissions();
  }, [currentUser]);

  // Load impersonation state on startup if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const orig = localStorage.getItem("fleetos_original_user");
      if (orig) {
        setOriginalUser(JSON.parse(orig));
        setIsImpersonating(true);
      }
    }
  }, []);

  // Monitor Firebase Auth changes if not mock
  useEffect(() => {
    if (!isMock && fireAuth) {
      const unsubscribe = onAuthStateChanged(fireAuth, async (user) => {
        if (user) {
          try {
            // Fetch profile
            const profileSnap = await getDocumentReal("user_profiles", user.uid);
            if (profileSnap) {
              setCurrentUser({
                uid: user.uid,
                email: user.email || "",
                displayName: profileSnap.displayName || user.displayName || "Usuário",
                role: profileSnap.role || "driver",
                roleId: profileSnap.roleId || "role-readonly",
                tenantId: profileSnap.tenantId || "tenant-1",
                photoURL: profileSnap.photoURL || user.photoURL,
                active: profileSnap.active ?? true
              });
            }
          } catch (e) {
            console.error("Erro ao carregar perfil do Firebase", e);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // Firestore Real helper
  const getDocumentReal = async (collectionName: string, docId: string) => {
    const list = await getFireDocs(query(collection(fireDb, collectionName)));
    const found = list.docs.find(d => d.id === docId);
    return found ? { id: found.id, ...found.data() } as any : null;
  };

  // Direct audit logger
  const logDirect = async (action: string, entityType: string, entityId: string, before?: any, after?: any) => {
    if (!currentUser) return;
    
    const enriched = {
      tenantId: currentUser.tenantId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      action,
      entityType,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : null,
      after: after ? JSON.parse(JSON.stringify(after)) : null,
      createdAt: new Date().toISOString()
    };

    try {
      if (isMock) {
        const raw = localStorage.getItem("fleetos_audit_logs");
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: `audit-${Math.random().toString(36).substr(2, 9)}`, ...enriched });
        localStorage.setItem("fleetos_audit_logs", JSON.stringify(list));
      } else {
        await addFireDoc(collection(fireDb, "audit_logs"), enriched);
      }
    } catch (e) {
      console.error("Erro ao registrar log de auditoria", e);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin" || userPermissions.includes("*")) {
      return true;
    }
    return userPermissions.includes(permission);
  };

  const can = (action: string, resource?: any): boolean => {
    if (!currentUser) return false;
    
    // 1. Basic permission check
    if (!hasPermission(action)) return false;
    
    // 2. Resource-level checks
    if (resource) {
      // Isolation check
      if (resource.tenantId && resource.tenantId !== currentUser.tenantId) {
        return false;
      }
      // If user is driver, they can only view or edit their own resources
      if (currentUser.roleId === "role-driver" || currentUser.role === "driver") {
        const resourceDriverId = resource.driverId || resource.id || resource.userId;
        if (resourceDriverId && resourceDriverId !== currentUser.uid && resourceDriverId !== "drv-1") {
          return false;
        }
      }
    }
    
    return true;
  };

  const impersonateUser = async (email: string) => {
    if (!currentUser) return;
    
    if (currentUser.roleId !== "role-super-admin" && currentUser.role !== "super_admin") {
      throw new Error("Apenas super administradores podem impersonar outros usuários.");
    }

    let targetUser: any = null;
    if (isMock) {
      const profilesStr = localStorage.getItem("fleetos_user_profiles");
      const profiles: any[] = profilesStr ? JSON.parse(profilesStr) : [];
      targetUser = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    } else {
      const list = await getFireDocs(query(collection(fireDb, "user_profiles"), where("email", "==", email)));
      if (list.docs.length > 0) {
        targetUser = { id: list.docs[0].id, ...list.docs[0].data() };
      }
    }

    if (!targetUser) {
      throw new Error(`Usuário com o e-mail ${email} não encontrado.`);
    }

    const impersonatedProfile: UserProfile = {
      uid: targetUser.uid || targetUser.id,
      email: targetUser.email,
      displayName: targetUser.displayName,
      role: targetUser.role,
      roleId: targetUser.roleId || "role-readonly",
      tenantId: targetUser.tenantId,
      active: targetUser.active
    };

    // Log the start of impersonation using the original user context
    await logDirect(`Impersonou o usuário ${targetUser.displayName} (${email})`, "auth", targetUser.uid, null, impersonatedProfile);

    localStorage.setItem("fleetos_original_user", JSON.stringify(currentUser));
    localStorage.setItem("fleetos_current_user", JSON.stringify(impersonatedProfile));
    
    setOriginalUser(currentUser);
    setIsImpersonating(true);
    setCurrentUser(impersonatedProfile);
  };

  const stopImpersonation = async () => {
    const orig = localStorage.getItem("fleetos_original_user");
    if (!orig) return;

    const parsedOriginalUser = JSON.parse(orig);

    localStorage.removeItem("fleetos_original_user");
    localStorage.setItem("fleetos_current_user", JSON.stringify(parsedOriginalUser));

    const enriched = {
      tenantId: parsedOriginalUser.tenantId,
      userId: parsedOriginalUser.uid,
      userName: parsedOriginalUser.displayName || parsedOriginalUser.email,
      action: `Parou impersonação do usuário ${currentUser?.displayName}`,
      entityType: "auth",
      entityId: parsedOriginalUser.uid,
      before: currentUser,
      after: parsedOriginalUser,
      createdAt: new Date().toISOString()
    };

    if (isMock) {
      const raw = localStorage.getItem("fleetos_audit_logs");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ id: `audit-${Math.random().toString(36).substr(2, 9)}`, ...enriched });
      localStorage.setItem("fleetos_audit_logs", JSON.stringify(list));
    } else {
      await addFireDoc(collection(fireDb, "audit_logs"), enriched);
    }

    setOriginalUser(null);
    setIsImpersonating(false);
    setCurrentUser(parsedOriginalUser);
  };

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    if (isMock) {
      const profilesStr = localStorage.getItem("fleetos_user_profiles");
      const profiles: any[] = profilesStr ? JSON.parse(profilesStr) : [];
      const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (found && pass === "123456") {
        const profile: UserProfile = {
          uid: found.uid,
          email: found.email,
          displayName: found.displayName,
          role: found.role,
          roleId: found.roleId || "role-readonly",
          tenantId: found.tenantId,
          active: found.active
        };

        // Log login success
        const enriched = {
          tenantId: found.tenantId,
          userId: found.uid,
          userName: found.displayName,
          action: "Efetuou login no sistema",
          entityType: "auth",
          entityId: found.uid,
          before: null,
          after: null,
          createdAt: new Date().toISOString()
        };

        const raw = localStorage.getItem("fleetos_audit_logs");
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: `audit-${Math.random().toString(36).substr(2, 9)}`, ...enriched });
        localStorage.setItem("fleetos_audit_logs", JSON.stringify(list));

        setCurrentUser(profile);
        localStorage.setItem("fleetos_current_user", JSON.stringify(profile));
        return profile;
      } else {
        // Log login failure
        const enriched = {
          tenantId: "tenant-1",
          userId: "unknown",
          userName: email,
          action: "Tentativa de login inválida",
          entityType: "auth",
          entityId: "unknown",
          before: null,
          after: null,
          createdAt: new Date().toISOString()
        };
        const raw = localStorage.getItem("fleetos_audit_logs");
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: `audit-${Math.random().toString(36).substr(2, 9)}`, ...enriched });
        localStorage.setItem("fleetos_audit_logs", JSON.stringify(list));

        throw new Error("Credenciais inválidas. Use a senha padrão '123456'.");
      }
    } else {
      const userCred = await signInWithEmailAndPassword(fireAuth, email, pass);
      const profileSnap = await getDocumentReal("user_profiles", userCred.user.uid);
      if (!profileSnap) {
        throw new Error("Perfil não encontrado no Firestore.");
      }
      return {
        uid: userCred.user.uid,
        email: userCred.user.email || "",
        displayName: profileSnap.displayName || "Usuário",
        role: profileSnap.role,
        roleId: profileSnap.roleId || "role-readonly",
        tenantId: profileSnap.tenantId,
        active: profileSnap.active ?? true
      };
    }
  };

  const signOutUser = async () => {
    if (currentUser) {
      await logDirect("Efetuou logout do sistema", "auth", currentUser.uid);
    }
    if (isMock) {
      setCurrentUser(null);
      localStorage.removeItem("fleetos_current_user");
    } else {
      await fireSignOut(fireAuth);
      setCurrentUser(null);
    }
  };

  // MULTI-TENANT FILTERED COLLECTION
  const getCollection = async (collName: string): Promise<any[]> => {
    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      if (!currentUser) return [];
      if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin") return list;
      return list.filter((item: any) => item.tenantId === currentUser.tenantId);
    } else {
      if (!currentUser) return [];
      const collRef = collection(fireDb, collName);
      let q;
      if (currentUser.roleId === "role-super-admin" || currentUser.role === "super_admin") {
        q = collRef;
      } else {
        q = query(collRef, where("tenantId", "==", currentUser.tenantId));
      }
      const snap = await getFireDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  };

  const addDocument = async (collName: string, data: any): Promise<any> => {
    const enrichedData = {
      ...data,
      tenantId: currentUser?.tenantId || "tenant-1",
      createdAt: new Date().toISOString()
    };

    let newDoc: any;
    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      newDoc = { id: `doc-${Math.random().toString(36).substr(2, 9)}`, ...enrichedData };
      list.push(newDoc);
      localStorage.setItem(`fleetos_${collName}`, JSON.stringify(list));
    } else {
      const docRef = await addFireDoc(collection(fireDb, collName), enrichedData);
      newDoc = { id: docRef.id, ...enrichedData };
    }

    if (collName !== "audit_logs" && currentUser) {
      let description = `Adicionou registro em ${collName}`;
      if (data.name) description = `Criou motorista/entidade: ${data.name}`;
      else if (data.plate) description = `Criou veículo placa: ${data.plate}`;
      else if (data.description) description = `Criou lançamento/manutenção: ${data.description}`;
      
      await logDirect(description, collName, newDoc.id, null, newDoc);
    }

    return newDoc;
  };

  const updateDocument = async (collName: string, docId: string, data: any): Promise<void> => {
    let beforeData: any = null;
    
    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      beforeData = list.find((item: any) => item.id === docId);
    } else {
      beforeData = await getDocumentReal(collName, docId);
    }

    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      const index = list.findIndex((item: any) => item.id === docId);
      if (index !== -1) {
        list[index] = { ...list[index], ...data };
        localStorage.setItem(`fleetos_${collName}`, JSON.stringify(list));
      }
    } else {
      const docRef = doc(fireDb, collName, docId);
      await updateFireDoc(docRef, data);
    }

    let afterData: any = null;
    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      afterData = list.find((item: any) => item.id === docId);
    } else {
      afterData = await getDocumentReal(collName, docId);
    }

    if (collName !== "audit_logs" && currentUser) {
      let description = `Atualizou registro em ${collName}`;
      if (beforeData) {
        const identifier = beforeData.name || beforeData.plate || beforeData.description || docId;
        description = `Atualizou ${collName}: ${identifier}`;
      }
      await logDirect(description, collName, docId, beforeData, afterData);
    }
  };

  const deleteDocument = async (collName: string, docId: string): Promise<void> => {
    let beforeData: any = null;
    
    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      beforeData = list.find((item: any) => item.id === docId);
    } else {
      beforeData = await getDocumentReal(collName, docId);
    }

    if (isMock) {
      const raw = localStorage.getItem(`fleetos_${collName}`);
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((item: any) => item.id !== docId);
      localStorage.setItem(`fleetos_${collName}`, JSON.stringify(filtered));
    } else {
      const docRef = doc(fireDb, collName, docId);
      await deleteFireDoc(docRef);
    }

    if (collName !== "audit_logs" && currentUser) {
      let description = `Excluiu registro em ${collName}`;
      if (beforeData) {
        const identifier = beforeData.name || beforeData.plate || beforeData.description || docId;
        description = `Excluiu ${collName}: ${identifier}`;
      }
      await logDirect(description, collName, docId, beforeData, null);
    }
  };

  const getNextSequence = async (sequenceName: string, minimumValue = 0): Promise<number> => {
    if (!currentUser) throw new Error("Usuário não autenticado.");

    const tenantId = currentUser.tenantId;
    const counterId = `${tenantId}_${sequenceName}`;

    if (isMock) {
      const storageKey = "fleetos_tenant_counters";
      const counters = JSON.parse(localStorage.getItem(storageKey) || "[]") as Array<{
        id: string;
        tenantId: string;
        sequenceName: string;
        value: number;
      }>;
      const index = counters.findIndex(counter => counter.id === counterId);
      const currentValue = index >= 0 ? Number(counters[index].value || 0) : 0;
      const nextValue = Math.max(currentValue, minimumValue) + 1;
      const nextCounter = { id: counterId, tenantId, sequenceName, value: nextValue };

      if (index >= 0) counters[index] = nextCounter;
      else counters.push(nextCounter);

      localStorage.setItem(storageKey, JSON.stringify(counters));
      return nextValue;
    }

    const counterRef = doc(fireDb, "tenant_counters", counterId);
    return runTransaction(fireDb, async transaction => {
      const snapshot = await transaction.get(counterRef);
      const nextValue = Math.max(Number(snapshot.data()?.value || 0), minimumValue) + 1;
      transaction.set(counterRef, {
        tenantId,
        sequenceName,
        value: nextValue,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return nextValue;
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isMockMode: isMock,
      signIn,
      signOutUser,
      getCollection,
      addDocument,
      updateDocument,
      deleteDocument,
      getNextSequence,
      hasPermission,
      can,
      impersonateUser,
      stopImpersonation,
      isImpersonating,
      originalUser,
      logDirect
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado com um AuthProvider");
  return context;
}
