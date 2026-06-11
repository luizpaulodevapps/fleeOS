"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { buildVariableMap, resolveVariables } from "@/app/documents/_lib/engine";
import { DeliveryFormState, ReturnFormState, SwapFormState } from "../_lib/types";

export function useOperations() {
  const { currentUser, getCollection, addDocument, updateDocument, can } = useAuth();

  // Collections state
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [dailyProfiles, setDailyProfiles] = useState<any[]>([]);
  const [cashierSessions, setCashierSessions] = useState<any[]>([]);
  const [contractTemplates, setContractTemplates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  // Pricing collections state
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [billingProfiles, setBillingProfiles] = useState<any[]>([]);
  const [exemptions, setExemptions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeWizard, setActiveWizard] = useState<"delivery" | "return" | "swap" | null>(null);

  // General audit log or timeline to display
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Load database
  const loadData = async () => {
    try {
      setLoading(true);
      const [drv, veh, con, prof, cash, tpl, asg, comp, act, cat, tbl, rat, pkg, bprof, ex] = await Promise.all([
        getCollection("drivers"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("daily_rate_profiles"),
        getCollection("cashier_sessions"),
        getCollection("contract_templates"),
        getCollection("vehicle_assignments"),
        getCollection("companies"),
        getCollection("activity_timeline"),
        getCollection("pricing_categories"),
        getCollection("pricing_tables"),
        getCollection("pricing_rates"),
        getCollection("pricing_packages"),
        getCollection("contract_billing_profiles"),
        getCollection("pricing_exemptions")
      ]);
      setDrivers(drv);
      setVehicles(veh);
      setContracts(con);
      setDailyProfiles(prof);
      setCashierSessions(cash);
      setContractTemplates(tpl);
      setAssignments(asg);
      setCompanies(comp);
      setRecentActivities(act.slice(-8)); // last 8 timeline activities
      setCategories(cat);
      setTables(tbl);
      setRates(rat);
      setPackages(pkg);
      setBillingProfiles(bprof);
      setExemptions(ex);
    } catch (e) {
      console.error("Erro ao carregar dados na Central de Operações", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check if there is an active cashier session
  const openCashier = cashierSessions.find(s => s.status === "open" || s.status === "aberto");
  const companyProfile = companies[0] || { companyName: "Táxi Amarelo S.A.", document: "12.345.678/0001-90", address: "Av. Paulista, 1000 - São Paulo, SP" };

  // ==========================================
  // WIZARD STATE - DELIVERY (ENTREGA)
  // ==========================================
  const [delStep, setDelStep] = useState(1);
  const [delForm, setDelForm] = useState<DeliveryFormState>({
    driverId: "",
    vehicleId: "",
    dailyProfileId: "",
    pricingCategoryId: "",
    packageId: "",
    billingProfileId: "",
    pricingTableId: "tbl-std",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    depositAmount: 3000,
    initialPayment: 0,
    paymentMethod: "Pix",
    signatureText: "",
    signatureImage: "",
    checklist: {
      taximetro: true,
      luminoso: true,
      chaveReserva: true,
      crlv: true,
      extintor: true,
      triangulo: true,
      macaco: true,
      rastreador: true
    },
    mileage: "",
    fuelLevel: "Cheio",
    damages: {
      dianteira: false,
      traseira: false,
      lateralEsquerda: false,
      lateralDireita: false,
      interior: false
    },
    damageNotes: "",
    photos: {
      frente: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
      traseira: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
      painel: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400",
      odometro: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400"
    }
  });

  // Selected driver / vehicle profiles for validation
  const selectedDelDriver = drivers.find(d => d.id === delForm.driverId);
  const selectedDelVehicle = vehicles.find(v => v.id === delForm.vehicleId);
  const selectedDelProfile = dailyProfiles.find(p => p.id === delForm.dailyProfileId);

  const computedDailyRate = useMemo(() => {
    if (!selectedDelVehicle) return 150;
    const catId = selectedDelVehicle.pricingCategoryId;
    const tableId = delForm.pricingTableId || "tbl-std";
    const rate = rates.find(r => r.categoryId === catId && r.tableId === tableId && r.billingFrequency === "daily");
    if (rate) return rate.amount;
    if (selectedDelProfile) return selectedDelProfile.amount;
    return 150;
  }, [selectedDelVehicle, delForm.pricingTableId, rates, selectedDelProfile]);

  const computedDailyProfileName = useMemo(() => {
    if (selectedDelVehicle && selectedDelVehicle.pricingCategoryId) {
      const cat = categories.find(c => c.id === selectedDelVehicle.pricingCategoryId);
      const tbl = tables.find(t => t.id === delForm.pricingTableId);
      const pkg = packages.find(p => p.id === delForm.packageId);
      return `${cat?.name || "Econômicos"} (${tbl?.name || "Tabela Padrão"})${pkg ? ` - ${pkg.name}` : ""}`;
    }
    if (selectedDelProfile) return selectedDelProfile.name;
    return "Diária Padrão";
  }, [selectedDelVehicle, delForm.pricingTableId, delForm.packageId, categories, tables, packages, selectedDelProfile]);

  // Validations for step progression
  const validateDelStep = (step: number): { valid: boolean; reason?: string } => {
    if (step === 1) {
      if (!delForm.driverId) return { valid: false, reason: "Selecione um motorista." };
      const driver = selectedDelDriver;
      if (!driver) return { valid: false };
      // Expired CNH
      if (new Date(driver.cnhExpiration) < new Date()) {
        return { valid: false, reason: "CNH do motorista está vencida!" };
      }
      // Expired CONDUTAX
      if (driver.condutaxExpiration && new Date(driver.condutaxExpiration) < new Date()) {
        return { valid: false, reason: "CONDUTAX do motorista está vencido!" };
      }
      // Locks
      if (driver.activeLocks && driver.activeLocks.length > 0) {
        return { valid: false, reason: `Motorista bloqueado operativamente: ${driver.activeLocks.join(", ")}` };
      }
      // Active binding
      const hasActive = assignments.some(a => a.active === true && a.driverId === driver.id);
      if (hasActive) {
        return { valid: false, reason: "Este motorista já possui um veículo vinculado!" };
      }
    }
    if (step === 2) {
      if (!delForm.vehicleId) return { valid: false, reason: "Selecione um veículo." };
      const vehicle = selectedDelVehicle;
      if (!vehicle) return { valid: false };
      if (vehicle.status !== "active") {
        return { valid: false, reason: `O veículo está indisponível (Status: ${vehicle.status})` };
      }
      if (vehicle.activeLocks && vehicle.activeLocks.length > 0) {
        return { valid: false, reason: `Veículo com bloqueios mecânicos/ativos: ${vehicle.activeLocks.join(", ")}` };
      }
      if (new Date(vehicle.insuranceExpiration) < new Date()) {
        return { valid: false, reason: "Seguro do veículo vencido!" };
      }
      if (new Date(vehicle.registrationExpiration) < new Date()) {
        return { valid: false, reason: "CRLV / Licenciamento vencido!" };
      }
      const hasActiveAsg = assignments.some(a => a.active === true && a.vehicleId === vehicle.id);
      if (hasActiveAsg) {
        return { valid: false, reason: "Este veículo já possui um vínculo ativo." };
      }
    }
    if (step === 3) {
      if (!selectedDelVehicle?.pricingCategoryId && !delForm.dailyProfileId) {
        return { valid: false, reason: "Selecione um perfil de diária." };
      }
      if (selectedDelVehicle?.pricingCategoryId) {
        if (!delForm.pricingTableId) return { valid: false, reason: "Selecione uma tabela tarifária." };
        if (!delForm.billingProfileId) return { valid: false, reason: "Selecione um perfil de faturamento." };
      }
      if (!delForm.startDate) return { valid: false, reason: "Defina uma data de início." };
    }
    if (step === 4) {
      if (!delForm.mileage) return { valid: false, reason: "Preencha a quilometragem atual." };
      const mileageNum = Number(delForm.mileage);
      if (selectedDelVehicle && mileageNum < selectedDelVehicle.mileage) {
        return { valid: false, reason: `A quilometragem não pode ser menor do que a atual do veículo (${selectedDelVehicle.mileage} km).` };
      }
    }
    if (step === 6) {
      if (!delForm.signatureImage) return { valid: false, reason: "Desenhe a assinatura no painel." };
    }
    if (step === 7) {
      if (delForm.initialPayment > 0 && !openCashier) {
        return { valid: false, reason: "Para registrar entrada em dinheiro/Pix, o caixa do operador deve estar aberto." };
      }
    }
    return { valid: true };
  };

  const handleDelNext = () => {
    const check = validateDelStep(delStep);
    if (!check.valid) {
      alert(check.reason || "Erro na validação do passo.");
      return;
    }
    // Pre-populate mileage on step 2 transition
    if (delStep === 2 && selectedDelVehicle && !delForm.mileage) {
      setDelForm(prev => ({ ...prev, mileage: String(selectedDelVehicle.mileage) }));
    }
    setDelStep(prev => prev + 1);
  };

  const handleDelPrev = () => {
    setDelStep(prev => Math.max(1, prev - 1));
  };

  // Resolve contract template text
  const deliveryContractText = useMemo(() => {
    if (!selectedDelDriver || !selectedDelVehicle) return "";
    if (!selectedDelVehicle.pricingCategoryId && !selectedDelProfile) return "";
    const contractMock = {
      id: "MOCK-CONTRATO",
      startDate: delForm.startDate,
      endDate: delForm.endDate,
      dailyRate: computedDailyRate,
      weeklyRate: computedDailyRate * 7 * 0.9,
      monthlyRate: computedDailyRate * 30 * 0.8,
      initialMileage: delForm.mileage
    };
    const resolvedVars = buildVariableMap(
      contractMock,
      selectedDelDriver,
      selectedDelVehicle,
      companyProfile,
      { contract_date: new Date().toLocaleDateString("pt-BR") }
    );
    const template = contractTemplates.find(t => t.id === "tpl-1") || { body: "CONTRATO DE LOCAÇÃO..." };
    return resolveVariables(template.body, resolvedVars);
  }, [delForm.driverId, delForm.vehicleId, delForm.dailyProfileId, delForm.pricingTableId, delForm.packageId, delStep, computedDailyRate]);

  // Save Delivery Flow
  const submitDelivery = async () => {
    if (!selectedDelDriver || !selectedDelVehicle) return;
    if (!selectedDelVehicle.pricingCategoryId && !selectedDelProfile) return;

    try {
      setLoading(true);

      // 1. Create Contract
      const newContract = await addDocument("contracts", {
        driverId: delForm.driverId,
        vehicleId: delForm.vehicleId,
        startDate: delForm.startDate,
        endDate: delForm.endDate,
        dailyRate: Number(computedDailyRate),
        weeklyRate: Number(computedDailyRate) * 7 * 0.9,
        monthlyRate: Number(computedDailyRate) * 30 * 0.8,
        status: "active",
        closedBy: "",
        amountPaid: delForm.initialPayment,
        type: "Locação",
        pdfSignedUrl: "",
        dailyProfileId: delForm.dailyProfileId || "",
        dailyAmountSnapshot: Number(computedDailyRate),
        dailyProfileNameSnapshot: computedDailyProfileName,
        pricingCategoryId: selectedDelVehicle.pricingCategoryId || "",
        packageId: delForm.packageId || "",
        billingProfileId: delForm.billingProfileId || "",
        pricingTableId: delForm.pricingTableId || ""
      });

      // 2. Create Assignment
      const newAsg = await addDocument("vehicle_assignments", {
        driverId: delForm.driverId,
        vehicleId: delForm.vehicleId,
        contractId: newContract.id,
        startDate: delForm.startDate + "T08:00:00Z",
        endDate: null,
        active: true,
        status: "active"
      });

      // 3. Create Checklist
      const checklistPayload = {
        assignmentId: newAsg.id,
        vehicleId: delForm.vehicleId,
        driverId: delForm.driverId,
        type: "Entrega",
        date: delForm.startDate,
        items: delForm.checklist,
        signatureText: delForm.signatureText || selectedDelDriver.name,
        signatureImage: delForm.signatureImage,
        photos: delForm.photos,
        signed: true,
        mileage: Number(delForm.mileage),
        fuelLevel: delForm.fuelLevel,
        damages: delForm.damages,
        damageNotes: delForm.damageNotes
      };
      await addDocument("checklists", checklistPayload);

      // 4. Update Vehicle
      await updateDocument("vehicles", delForm.vehicleId, {
        status: "locado",
        mileage: Number(delForm.mileage)
      });

      // 5. Debit Security Deposit (Caução)
      await addDocument("driver_ledger", {
        driverId: delForm.driverId,
        type: "fine",
        operationType: "deposit_charge",
        description: `Cobrança de Caução Contratual - Contrato ${newContract.id.substring(0, 8).toUpperCase()}`,
        amount: -Number(delForm.depositAmount),
        createdAt: new Date().toISOString()
      });

      // 5.5. Initialize Contract Billing Schedule
      await addDocument("contract_billing", {
        contractId: newContract.id,
        nextBillingDate: new Date(new Date(delForm.startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        frequency: "daily",
        amount: computedDailyRate,
        active: true,
        billingProfileId: delForm.billingProfileId || "profile-daily-full"
      });

      // 6. Record initial payment if done
      if (delForm.initialPayment > 0) {
        await addDocument("driver_ledger", {
          driverId: delForm.driverId,
          type: "payment",
          operationType: "payment",
          description: `Depósito/Entrada da Caução Contratual via ${delForm.paymentMethod}`,
          amount: Number(delForm.initialPayment),
          createdAt: new Date().toISOString()
        });

        if (openCashier) {
          await addDocument("cashier_movements", {
            cashierId: openCashier.id,
            type: "RECEIPT",
            amount: Number(delForm.initialPayment),
            paymentMethod: delForm.paymentMethod,
            description: `Entrada da Caução Contratual - Motorista ${selectedDelDriver.name}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // 7. Timeline activity logs
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: delForm.vehicleId,
        eventType: "assignment",
        title: "Entrega Completa de Veículo",
        description: `Veículo entregue ao motorista ${selectedDelDriver.name} com vistoria digital e caução configurada.`,
        metadata: { driverId: delForm.driverId, contractId: newContract.id, assignmentId: newAsg.id },
        createdBy: currentUser?.displayName || "Operador"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: delForm.driverId,
        eventType: "assignment",
        title: "Veículo Entregue via Wizard",
        description: `Motorista assumiu a condução do ativo de placa ${selectedDelVehicle.plate}.`,
        metadata: { vehicleId: delForm.vehicleId, contractId: newContract.id },
        createdBy: currentUser?.displayName || "Operador"
      });

      alert("Processo de entrega concluído com sucesso!");
      resetDelForm();
      setActiveWizard(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o processo de entrega.");
    } finally {
      setLoading(false);
    }
  };

  const resetDelForm = () => {
    setDelStep(1);
    setDelForm({
      driverId: "",
      vehicleId: "",
      dailyProfileId: "",
      pricingCategoryId: "",
      packageId: "",
      billingProfileId: "",
      pricingTableId: "tbl-std",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      depositAmount: 3000,
      initialPayment: 0,
      paymentMethod: "Pix",
      signatureText: "",
      signatureImage: "",
      checklist: {
        taximetro: true,
        luminoso: true,
        chaveReserva: true,
        crlv: true,
        extintor: true,
        triangulo: true,
        macaco: true,
        rastreador: true
      },
      mileage: "",
      fuelLevel: "Cheio",
      damages: {
        dianteira: false,
        traseira: false,
        lateralEsquerda: false,
        lateralDireita: false,
        interior: false
      },
      damageNotes: "",
      photos: {
        frente: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
        traseira: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
        painel: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400",
        odometro: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400"
      }
    });
  };

  // ==========================================
  // WIZARD STATE - RETURN (DEVOLUÇÃO)
  // ==========================================
  const [retStep, setRetStep] = useState(1);
  const [retForm, setRetForm] = useState<ReturnFormState>({
    vehicleId: "",
    endDate: new Date().toISOString().split("T")[0],
    checklist: {
      taximetro: true,
      luminoso: true,
      chaveReserva: true,
      crlv: true,
      extintor: true,
      triangulo: true,
      macaco: true,
      rastreador: true
    },
    mileage: "",
    fuelLevel: "Cheio",
    vehicleStatusAfter: "active",
    damages: {
      dianteira: false,
      traseira: false,
      lateralEsquerda: false,
      lateralDireita: false,
      interior: false
    },
    damageNotes: "",
    dailyCharges: 0,
    fuelCharge: 0,
    damageCharge: 0,
    deductFromDeposit: true,
    signatureText: "",
    signatureImage: "",
    photos: {
      frente: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
      traseira: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
      painel: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400",
      odometro: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400"
    }
  });

  const selectedRetVehicle = vehicles.find(v => v.id === retForm.vehicleId);
  const activeAssignment = assignments.find(a => a.active === true && a.vehicleId === retForm.vehicleId);
  const activeContract = activeAssignment ? contracts.find(c => c.id === activeAssignment.contractId) : null;
  const activeDriver = activeAssignment ? drivers.find(d => d.id === activeAssignment.driverId) : null;

  const validateRetStep = (step: number): { valid: boolean; reason?: string } => {
    if (step === 1) {
      if (!retForm.vehicleId) return { valid: false, reason: "Selecione o veículo sendo devolvido." };
      if (!activeAssignment) return { valid: false, reason: "Este veículo não possui vínculo ativo para devolução." };
    }
    if (step === 2) {
      if (!retForm.mileage) return { valid: false, reason: "Preencha a quilometragem final." };
      const mileageNum = Number(retForm.mileage);
      if (selectedRetVehicle && mileageNum < selectedRetVehicle.mileage) {
        return { valid: false, reason: `A quilometragem final não pode ser menor do que a inicial do veículo (${selectedRetVehicle.mileage} km).` };
      }
    }
    if (step === 5) {
      if (!retForm.signatureImage) return { valid: false, reason: "Desenhe a assinatura de quitação." };
    }
    return { valid: true };
  };

  const handleRetNext = () => {
    const check = validateRetStep(retStep);
    if (!check.valid) {
      alert(check.reason || "Erro na validação do passo.");
      return;
    }
    // Pre-populate mileage on transition
    if (retStep === 1 && selectedRetVehicle && !retForm.mileage) {
      setRetForm(prev => ({ ...prev, mileage: String(selectedRetVehicle.mileage) }));
    }
    // Calculate simple mock costs on transition to financial details
    if (retStep === 3) {
      // Calculate days in operation
      if (activeAssignment) {
        const start = new Date(activeAssignment.startDate);
        const end = new Date(retForm.endDate);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const dailyRate = activeContract ? activeContract.dailyRate : 150;
        setRetForm(prev => ({
          ...prev,
          dailyCharges: days * dailyRate,
          fuelCharge: prev.fuelLevel !== "Cheio" ? 180 : 0,
          damageCharge: Object.values(prev.damages).some(d => d) ? 650 : 0
        }));
      }
    }
    setRetStep(prev => prev + 1);
  };

  const handleRetPrev = () => {
    setRetStep(prev => Math.max(1, prev - 1));
  };

  const returnContractText = useMemo(() => {
    if (!activeDriver || !selectedRetVehicle || !activeContract) return "";
    const resolvedVars = buildVariableMap(
      activeContract,
      activeDriver,
      selectedRetVehicle,
      companyProfile,
      {
        contract_date: new Date().toLocaleDateString("pt-BR"),
        return_mileage: retForm.mileage
      }
    );
    const template = contractTemplates.find(t => t.id === "tpl-2") || { body: "TERMO DE DISTRATO..." };
    return resolveVariables(template.body, resolvedVars);
  }, [retForm.vehicleId, retForm.mileage, retStep, activeDriver, selectedRetVehicle, activeContract]);

  // Submit Devolução
  const submitReturn = async () => {
    if (!activeAssignment || !selectedRetVehicle || !activeContract || !activeDriver) return;

    try {
      setLoading(true);

      // 1. Terminate Assignment
      await updateDocument("vehicle_assignments", activeAssignment.id, {
        active: false,
        endDate: retForm.endDate + "T18:00:00Z",
        status: "completed"
      });

      // 2. Create Checklist
      const checklistPayload = {
        assignmentId: activeAssignment.id,
        vehicleId: activeAssignment.vehicleId,
        driverId: activeAssignment.driverId,
        type: "Devolução",
        date: retForm.endDate,
        items: retForm.checklist,
        signatureText: retForm.signatureText || activeDriver.name,
        signatureImage: retForm.signatureImage,
        photos: retForm.photos,
        signed: true,
        mileage: Number(retForm.mileage),
        fuelLevel: retForm.fuelLevel,
        damages: retForm.damages,
        damageNotes: retForm.damageNotes
      };
      await addDocument("checklists", checklistPayload);

      // 3. Update Vehicle status and mileage
      const finalStatus = Object.values(retForm.damages).some(d => d) ? "maintenance" : retForm.vehicleStatusAfter;
      await updateDocument("vehicles", activeAssignment.vehicleId, {
        status: finalStatus,
        mileage: Number(retForm.mileage)
      });

      // 4. Close Contract
      await updateDocument("contracts", activeContract.id, {
        status: "closed",
        endDate: retForm.endDate,
        closedBy: currentUser?.displayName || "Central de Operações"
      });

      // 4.5. Deactivate Contract Billing Schedule
      const billingSchedules = await getCollection("contract_billing");
      const matchSchedule = billingSchedules.find(cb => cb.contractId === activeContract.id);
      if (matchSchedule) {
        await updateDocument("contract_billing", matchSchedule.id, {
          active: false
        });
      }

      // 5. Debit Financial Charges on return (separated by event types)
      if (retForm.dailyCharges > 0) {
        await addDocument("driver_ledger", {
          driverId: activeAssignment.driverId,
          type: "daily",
          operationType: "daily_charge",
          description: `Cobrança de Encerramento (Diárias) - Extrato Contrato ${activeContract.id.substring(0, 8).toUpperCase()}`,
          amount: -Number(retForm.dailyCharges),
          createdAt: new Date().toISOString()
        });
      }
      if (retForm.fuelCharge > 0) {
        await addDocument("driver_ledger", {
          driverId: activeAssignment.driverId,
          type: "fine",
          operationType: "fuel_charge",
          description: `Cobrança de Combustível Faltante - Extrato Contrato ${activeContract.id.substring(0, 8).toUpperCase()}`,
          amount: -Number(retForm.fuelCharge),
          createdAt: new Date().toISOString()
        });
      }
      if (retForm.damageCharge > 0) {
        await addDocument("driver_ledger", {
          driverId: activeAssignment.driverId,
          type: "fine",
          operationType: "damage_charge",
          description: `Cobrança de Avarias de Devolução - Extrato Contrato ${activeContract.id.substring(0, 8).toUpperCase()}`,
          amount: -Number(retForm.damageCharge),
          createdAt: new Date().toISOString()
        });
      }

      // If they request to deduct from deposit / return deposit balance
      if (retForm.deductFromDeposit) {
        const totalDue = retForm.dailyCharges + retForm.fuelCharge + retForm.damageCharge;
        const driverLedgerMovements = await getCollection("driver_ledger");
        const contractDepositCharge = driverLedgerMovements.find(m => m.driverId === activeAssignment.driverId && m.operationType === "deposit_charge");
        const depositPaid = contractDepositCharge ? Math.abs(contractDepositCharge.amount) : 3000;
        
        // Let's credit back paid security deposit release minus extra charges
        const refundAmount = Math.max(0, depositPaid - totalDue);
        if (refundAmount > 0) {
          await addDocument("driver_ledger", {
            driverId: activeAssignment.driverId,
            type: "payment",
            operationType: "payment",
            description: `Devolução / Restituição parcial da Caução Contratual`,
            amount: Number(refundAmount),
            createdAt: new Date().toISOString()
          });
        }
      }

      // 6. Create draft claim if damaged
      if (Object.values(retForm.damages).some(d => d)) {
        await addDocument("insurance_claims", {
          claimNumber: `SIN-OPS-${Math.floor(Math.random()*90000) + 10000}`,
          vehicleId: activeAssignment.vehicleId,
          driverId: activeAssignment.driverId,
          contractId: activeContract.id,
          occurrenceDate: retForm.endDate + "T12:00",
          status: "under_review",
          severity: "medium",
          location: "Devolução na Base - Vistoria Técnica",
          description: `Novas avarias encontradas durante vistoria de devolução. Notas: ${retForm.damageNotes}`,
          involvedThirdParties: false,
          hasVictims: false,
          vehicleDrivable: finalStatus !== "sinistrado",
          createdBy: currentUser?.displayName || "Operador",
          createdAt: new Date().toISOString()
        });
      }

      // 7. Timeline logs
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: activeAssignment.vehicleId,
        eventType: "release",
        title: `Devolução Registrada (${finalStatus})`,
        description: `Veículo devolvido por ${activeDriver.name}. Odômetro: ${retForm.mileage} km.`,
        metadata: { driverId: activeAssignment.driverId, contractId: activeContract.id },
        createdBy: currentUser?.displayName || "Operador"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: activeAssignment.driverId,
        eventType: "release",
        title: "Veículo Devolvido",
        description: `Motorista encerrou seu uso do ativo placa ${selectedRetVehicle.plate}.`,
        metadata: { vehicleId: activeAssignment.vehicleId },
        createdBy: currentUser?.displayName || "Operador"
      });

      alert("Processo de devolução concluído com sucesso!");
      resetRetForm();
      setActiveWizard(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao registrar devolução.");
    } finally {
      setLoading(false);
    }
  };

  const resetRetForm = () => {
    setRetStep(1);
    setRetForm({
      vehicleId: "",
      endDate: new Date().toISOString().split("T")[0],
      checklist: {
        taximetro: true,
        luminoso: true,
        chaveReserva: true,
        crlv: true,
        extintor: true,
        triangulo: true,
        macaco: true,
        rastreador: true
      },
      mileage: "",
      fuelLevel: "Cheio",
      vehicleStatusAfter: "active",
      damages: {
        dianteira: false,
        traseira: false,
        lateralEsquerda: false,
        lateralDireita: false,
        interior: false
      },
      damageNotes: "",
      dailyCharges: 0,
      fuelCharge: 0,
      damageCharge: 0,
      deductFromDeposit: true,
      signatureText: "",
      signatureImage: "",
      photos: {
        frente: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
        traseira: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
        painel: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400",
        odometro: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400"
      }
    });
  };

  // ==========================================
  // WIZARD STATE - SWAP (TROCA DE VEÍCULO)
  // ==========================================
  const [swapStep, setSwapStep] = useState(1);
  const [swapForm, setSwapForm] = useState<SwapFormState>({
    driverId: "",
    oldVehicleId: "",
    newVehicleId: "",
    swapDate: new Date().toISOString().split("T")[0],
    oldMileage: "",
    oldFuelLevel: "Cheio",
    oldChecklist: {
      taximetro: true,
      luminoso: true,
      chaveReserva: true,
      crlv: true,
      extintor: true,
      triangulo: true,
      macaco: true,
      rastreador: true
    },
    oldDamages: {
      dianteira: false,
      traseira: false,
      lateralEsquerda: false,
      lateralDireita: false,
      interior: false
    },
    oldDamageNotes: "",
    newMileage: "",
    newFuelLevel: "Cheio",
    newChecklist: {
      taximetro: true,
      luminoso: true,
      chaveReserva: true,
      crlv: true,
      extintor: true,
      triangulo: true,
      macaco: true,
      rastreador: true
    },
    signatureText: "",
    signatureImage: "",
    chargeExtraFee: false,
    extraFeeAmount: 0
  });

  const selectedSwapDriver = drivers.find(d => d.id === swapForm.driverId);
  const selectedOldVehicle = vehicles.find(v => v.id === swapForm.oldVehicleId);
  const selectedNewVehicle = vehicles.find(v => v.id === swapForm.newVehicleId);
  const activeSwapAssignment = assignments.find(a => a.active === true && a.driverId === swapForm.driverId);
  const activeSwapContract = activeSwapAssignment ? contracts.find(c => c.id === activeSwapAssignment.contractId) : null;

  // Filter drivers who currently have a vehicle locado
  const driversWithVehicles = drivers.filter(d =>
    assignments.some(a => a.active === true && a.driverId === d.id)
  );

  const validateSwapStep = (step: number): { valid: boolean; reason?: string } => {
    if (step === 1) {
      if (!swapForm.driverId) return { valid: false, reason: "Selecione o motorista." };
      if (!activeSwapAssignment) return { valid: false, reason: "O motorista selecionado não possui um veículo ativo." };
    }
    if (step === 2) {
      if (!swapForm.oldMileage) return { valid: false, reason: "Preencha a quilometragem final do carro antigo." };
      const mileageNum = Number(swapForm.oldMileage);
      if (selectedOldVehicle && mileageNum < selectedOldVehicle.mileage) {
        return { valid: false, reason: `A quilometragem não pode ser menor do que a registrada anteriormente (${selectedOldVehicle.mileage} km).` };
      }
    }
    if (step === 3) {
      if (!swapForm.newVehicleId) return { valid: false, reason: "Selecione o novo veículo." };
      if (selectedNewVehicle && selectedNewVehicle.status !== "active") {
        return { valid: false, reason: "O veículo selecionado não está disponível." };
      }
    }
    if (step === 4) {
      if (!swapForm.newMileage) return { valid: false, reason: "Preencha a quilometragem inicial do novo veículo." };
      const mileageNum = Number(swapForm.newMileage);
      if (selectedNewVehicle && mileageNum < selectedNewVehicle.mileage) {
        return { valid: false, reason: `A quilometragem não pode ser menor do que a cadastrada para o veículo (${selectedNewVehicle.mileage} km).` };
      }
    }
    if (step === 5) {
      if (!swapForm.signatureImage) return { valid: false, reason: "Desenhe a assinatura para validar a troca." };
    }
    return { valid: true };
  };

  const handleSwapNext = () => {
    const check = validateSwapStep(swapStep);
    if (!check.valid) {
      alert(check.reason || "Erro na validação do passo.");
      return;
    }
    // Set old vehicle ID based on selected driver's assignment
    if (swapStep === 1 && activeSwapAssignment) {
      setSwapForm(prev => ({
        ...prev,
        oldVehicleId: activeSwapAssignment.vehicleId,
        oldMileage: String(vehicles.find(v => v.id === activeSwapAssignment.vehicleId)?.mileage || "")
      }));
    }
    // Pre-populate new mileage on transition to new checklist
    if (swapStep === 3 && selectedNewVehicle && !swapForm.newMileage) {
      setSwapForm(prev => ({ ...prev, newMileage: String(selectedNewVehicle.mileage) }));
    }
    setSwapStep(prev => prev + 1);
  };

  const handleSwapPrev = () => {
    setSwapStep(prev => Math.max(1, prev - 1));
  };

  // Submit Swap Flow
  const submitSwap = async () => {
    if (!selectedSwapDriver || !selectedOldVehicle || !selectedNewVehicle || !activeSwapAssignment || !activeSwapContract) return;

    try {
      setLoading(true);

      // 1. Terminate old assignment
      await updateDocument("vehicle_assignments", activeSwapAssignment.id, {
        active: false,
        endDate: swapForm.swapDate + "T12:00:00Z",
        status: "completed"
      });

      // 2. Create return checklist for old vehicle
      await addDocument("checklists", {
        assignmentId: activeSwapAssignment.id,
        vehicleId: selectedOldVehicle.id,
        driverId: swapForm.driverId,
        type: "Devolução",
        date: swapForm.swapDate,
        items: swapForm.oldChecklist,
        signatureText: swapForm.signatureText || selectedSwapDriver.name,
        signatureImage: swapForm.signatureImage,
        photos: {},
        signed: true,
        mileage: Number(swapForm.oldMileage),
        fuelLevel: swapForm.oldFuelLevel,
        damages: swapForm.oldDamages,
        damageNotes: swapForm.oldDamageNotes
      });

      // 3. Update old vehicle status (maintenance if avarias)
      const oldVehicleStatus = Object.values(swapForm.oldDamages).some(d => d) ? "maintenance" : "active";
      await updateDocument("vehicles", selectedOldVehicle.id, {
        status: oldVehicleStatus,
        mileage: Number(swapForm.oldMileage)
      });

      // 4. Create new assignment
      const newAsg = await addDocument("vehicle_assignments", {
        driverId: swapForm.driverId,
        vehicleId: selectedNewVehicle.id,
        contractId: activeSwapContract.id,
        startDate: swapForm.swapDate + "T12:00:00Z",
        endDate: null,
        active: true,
        status: "active"
      });

      // 5. Create delivery checklist for new vehicle
      await addDocument("checklists", {
        assignmentId: newAsg.id,
        vehicleId: selectedNewVehicle.id,
        driverId: swapForm.driverId,
        type: "Entrega",
        date: swapForm.swapDate,
        items: swapForm.newChecklist,
        signatureText: swapForm.signatureText || selectedSwapDriver.name,
        signatureImage: swapForm.signatureImage,
        photos: {},
        signed: true,
        mileage: Number(swapForm.newMileage),
        fuelLevel: swapForm.newFuelLevel
      });

      // 6. Update new vehicle status
      await updateDocument("vehicles", selectedNewVehicle.id, {
        status: "locado",
        mileage: Number(swapForm.newMileage)
      });

      // 7. Update contract to reference new vehicle
      await updateDocument("contracts", activeSwapContract.id, {
        vehicleId: selectedNewVehicle.id
      });

      // 8. Charge swap fee if enabled
      if (swapForm.chargeExtraFee && swapForm.extraFeeAmount > 0) {
        await addDocument("driver_ledger", {
          driverId: swapForm.driverId,
          type: "daily",
          description: `Taxa operacional de substituição de veículo (Troca de Veículo)`,
          amount: -Number(swapForm.extraFeeAmount),
          createdAt: new Date().toISOString()
        });
      }

      // 9. Timeline logs
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedOldVehicle.id,
        eventType: "release",
        title: "Veículo Substituído (Saída)",
        description: `Troca efetuada. Devolução de veículo placa ${selectedOldVehicle.plate} concluída.`,
        metadata: { driverId: swapForm.driverId },
        createdBy: currentUser?.displayName || "Operador"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedNewVehicle.id,
        eventType: "assignment",
        title: "Veículo Substituído (Entrada)",
        description: `Troca efetuada. Entrega de veículo placa ${selectedNewVehicle.plate} concluída.`,
        metadata: { driverId: swapForm.driverId },
        createdBy: currentUser?.displayName || "Operador"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: swapForm.driverId,
        eventType: "assignment",
        title: "Substituição de Ativo Realizada",
        description: `Motorista efetuou a troca do veículo ${selectedOldVehicle.plate} pelo ${selectedNewVehicle.plate}.`,
        metadata: { oldVehicleId: selectedOldVehicle.id, newVehicleId: selectedNewVehicle.id },
        createdBy: currentUser?.displayName || "Operador"
      });

      alert("Processo de substituição de veículo concluído!");
      resetSwapForm();
      setActiveWizard(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao registrar a substituição do veículo.");
    } finally {
      setLoading(false);
    }
  };

  const resetSwapForm = () => {
    setSwapStep(1);
    setSwapForm({
      driverId: "",
      oldVehicleId: "",
      newVehicleId: "",
      swapDate: new Date().toISOString().split("T")[0],
      oldMileage: "",
      oldFuelLevel: "Cheio",
      oldChecklist: {
        taximetro: true,
        luminoso: true,
        chaveReserva: true,
        crlv: true,
        extintor: true,
        triangulo: true,
        macaco: true,
        rastreador: true
      },
      oldDamages: {
        dianteira: false,
        traseira: false,
        lateralEsquerda: false,
        lateralDireita: false,
        interior: false
      },
      oldDamageNotes: "",
      newMileage: "",
      newFuelLevel: "Cheio",
      newChecklist: {
        taximetro: true,
        luminoso: true,
        chaveReserva: true,
        crlv: true,
        extintor: true,
        triangulo: true,
        macaco: true,
        rastreador: true
      },
      signatureText: "",
      signatureImage: "",
      chargeExtraFee: false,
      extraFeeAmount: 0
    });
  };

  // Helper for drivers/vehicles lists
  const availableDrivers = drivers.filter(d =>
    d.status === "active" &&
    !assignments.some(a => a.active === true && a.driverId === d.id)
  );

  const availableVehicles = vehicles.filter(v =>
    v.status === "active" &&
    !assignments.some(a => a.active === true && a.vehicleId === v.id)
  );

  return {
    // DB collections
    drivers,
    vehicles,
    contracts,
    dailyProfiles,
    cashierSessions,
    contractTemplates,
    assignments,
    companies,
    categories,
    tables,
    rates,
    packages,
    billingProfiles,
    exemptions,
    
    // Status/UI
    loading,
    activeWizard,
    recentActivities,
    openCashier,
    companyProfile,
    can,

    // Step state handlers
    setActiveWizard,
    
    // Delivery states & helpers
    delStep,
    setDelStep,
    delForm,
    setDelForm,
    selectedDelDriver,
    selectedDelVehicle,
    selectedDelProfile,
    computedDailyRate,
    computedDailyProfileName,
    deliveryContractText,
    handleDelNext,
    handleDelPrev,
    submitDelivery,
    resetDelForm,
    availableDrivers,
    availableVehicles,

    // Return states & helpers
    retStep,
    setRetStep,
    retForm,
    setRetForm,
    selectedRetVehicle,
    activeAssignment,
    activeContract,
    activeDriver,
    returnContractText,
    handleRetNext,
    handleRetPrev,
    submitReturn,
    resetRetForm,

    // Swap states & helpers
    swapStep,
    setSwapStep,
    swapForm,
    setSwapForm,
    selectedSwapDriver,
    selectedOldVehicle,
    selectedNewVehicle,
    activeSwapAssignment,
    activeSwapContract,
    driversWithVehicles,
    handleSwapNext,
    handleSwapPrev,
    submitSwap,
    resetSwapForm
  };
}
