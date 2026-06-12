"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  CategoryFormState,
  SubcategoryFormState,
  OperationFormState,
  TableFormState,
  RateFormState,
  CalendarFormState,
  PackageFormState,
  ExemptionFormState,
  PromotionFormState,
  ContractTypeFormState,
  BillingProfileFormState,
  TableVersionFormState
} from "../_lib/types";

export function usePricing() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument, can } = useAuth();

  // Navigation & UI filter states
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(true);
  const [selectedOperationFilter, setSelectedOperationFilter] = useState("");

  // Collections state
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [operationTypes, setOperationTypes] = useState<any[]>([]);
  const [contractTypes, setContractTypes] = useState<any[]>([]);
  const [billingProfiles, setBillingProfiles] = useState<any[]>([]);
  const [calendarRules, setCalendarRules] = useState<any[]>([]);
  const [exemptions, setExemptions] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [tableVersions, setTableVersions] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [contractBillings, setContractBillings] = useState<any[]>([]);

  // Load all collections
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        cat,
        sub,
        ops,
        ctypes,
        bprofs,
        calrules,
        ex,
        promos,
        tvers,
        tbl,
        rat,
        pkg,
        veh,
        con,
        drv,
        led,
        cbill
      ] = await Promise.all([
        getCollection("pricing_categories"),
        getCollection("pricing_subcategories"),
        getCollection("operation_types"),
        getCollection("contract_types"),
        getCollection("billing_profiles"),
        getCollection("calendar_rules"),
        getCollection("pricing_exemptions"),
        getCollection("pricing_promotions"),
        getCollection("pricing_table_versions"),
        getCollection("pricing_tables"),
        getCollection("pricing_rates"),
        getCollection("pricing_packages"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("drivers"),
        getCollection("driver_ledger"),
        getCollection("contract_billing")
      ]);
      
      setCategories(cat);
      setSubcategories(sub);
      setOperationTypes(ops);
      setContractTypes(ctypes);
      setBillingProfiles(bprofs);
      setCalendarRules(calrules);
      setExemptions(ex);
      setPromotions(promos);
      setTableVersions(tvers);
      setTables(tbl);
      setRates(rat);
      setPackages(pkg);
      setVehicles(veh);
      setContracts(con);
      setDrivers(drv);
      setLedger(led);
      setContractBillings(cbill);
    } catch (e) {
      console.error("Erro ao carregar dados do Pricing Engine 2.0", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormState>({ code: "", name: "", description: "", operationTypeId: "" });

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [subForm, setSubForm] = useState<SubcategoryFormState>({ categoryId: "", code: "", name: "", description: "", amountOverride: undefined });

  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<any | null>(null);
  const [opForm, setOpForm] = useState<OperationFormState>({ id: "", name: "", description: "", active: true });

  const [isTblModalOpen, setIsTblModalOpen] = useState(false);
  const [editingTbl, setEditingTbl] = useState<any | null>(null);
  const [tblForm, setTblForm] = useState<TableFormState>({ name: "", description: "", active: true });

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateForm, setRateForm] = useState<RateFormState>({ tableId: "", categoryId: "", subcategoryId: "", billingFrequency: "daily", amount: 150 });

  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [editingCal, setEditingCal] = useState<any | null>(null);
  const [calForm, setCalForm] = useState<CalendarFormState>({ date: new Date().toISOString().split("T")[0], pricingTableId: "", description: "", type: "holiday", priority: 1, action: "exempt", value: 0 });

  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [pkgForm, setPkgForm] = useState<PackageFormState>({ name: "", pricingCategoryId: "", includedKm: 250, extraKmPrice: 1.50, includedServicesText: "Seguro, Suporte 24h", allowReserveVehicle: true, roadsideAssistance: true, operationTypeId: "" });

  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<any | null>(null);
  const [exForm, setExForm] = useState<ExemptionFormState>({ name: "", targetType: "driver", targetId: "", exemptionType: "percentage", percentage: 10, value: 0, freeDaysCount: 0, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [promoForm, setPromoForm] = useState<PromotionFormState>({ name: "", pricingCategoryId: "", discountPercentage: 10, validFrom: new Date().toISOString().split("T")[0], validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], active: true });

  const [isCtypeModalOpen, setIsCtypeModalOpen] = useState(false);
  const [editingCtype, setEditingCtype] = useState<any | null>(null);
  const [ctypeForm, setCtypeForm] = useState<ContractTypeFormState>({ id: "", name: "", billingProfileId: "", defaultFrequency: "daily", allowExemptions: true, allowHolidayRules: true, operationTypeId: "" });

  const [isBprofModalOpen, setIsBprofModalOpen] = useState(false);
  const [editingBprof, setEditingBprof] = useState<any | null>(null);
  const [bprofForm, setBprofForm] = useState<BillingProfileFormState>({ id: "", name: "", frequency: "daily", chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], holidayPolicy: "exempt", lateFeePercent: 2, graceDays: 1 });

  // Simulator States
  const [projCategory, setProjCategory] = useState("cat-a");
  const [projSubcategory, setProjSubcategory] = useState("");
  const [projRate, setProjRate] = useState(170);
  const [projOccupancy, setProjOccupancy] = useState(85);

  const [simDriverId, setSimDriverId] = useState("");
  const [simStartDate, setSimStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [simEndDate, setSimEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [simResults, setSimResults] = useState<any | null>(null);

  // CRUD Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await updateDocument("pricing_categories", editingCat.id, { ...catForm, updatedAt: new Date().toISOString() });
        alert("Categoria atualizada com sucesso!");
      } else {
        await addDocument("pricing_categories", { ...catForm, active: true, createdAt: new Date().toISOString() });
        alert("Categoria criada com sucesso!");
      }
      setIsCatModalOpen(false);
      setEditingCat(null);
      setCatForm({ code: "", name: "", description: "", operationTypeId: "" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Deseja mesmo remover esta categoria?")) {
      await deleteDocument("pricing_categories", id);
      loadData();
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...subForm,
        amountOverride: subForm.amountOverride ? Number(subForm.amountOverride) : undefined
      };
      if (editingSub) {
        await updateDocument("pricing_subcategories", editingSub.id, payload);
        alert("Subcategoria atualizada com sucesso!");
      } else {
        await addDocument("pricing_subcategories", payload);
        alert("Subcategoria criada com sucesso!");
      }
      setIsSubModalOpen(false);
      setEditingSub(null);
      setSubForm({ categoryId: "", code: "", name: "", description: "", amountOverride: undefined });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm("Deseja remover esta subcategoria?")) {
      await deleteDocument("pricing_subcategories", id);
      loadData();
    }
  };

  const handleSaveOperationType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOp) {
        await updateDocument("operation_types", editingOp.id, opForm);
        alert("Tipo de operação atualizado!");
      } else {
        await addDocument("operation_types", opForm);
        alert("Tipo de operação cadastrado!");
      }
      setIsOpModalOpen(false);
      setEditingOp(null);
      setOpForm({ id: "", name: "", description: "", active: true });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOperationType = async (id: string) => {
    if (confirm("Deseja mesmo remover este tipo de operação?")) {
      await deleteDocument("operation_types", id);
      loadData();
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTbl) {
        await updateDocument("pricing_tables", editingTbl.id, tblForm);
        alert("Tabela tarifária atualizada!");
      } else {
        await addDocument("pricing_tables", tblForm);
        alert("Tabela tarifária cadastrada!");
      }
      setIsTblModalOpen(false);
      setEditingTbl(null);
      setTblForm({ name: "", description: "", active: true });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm("Deseja mesmo remover esta tabela?")) {
      await deleteDocument("pricing_tables", id);
      loadData();
    }
  };

  const logTableVersion = async (tableId: string, desc: string) => {
    try {
      const matchLogs = tableVersions.filter(v => v.tableId === tableId);
      const nextVer = matchLogs.length + 1;
      await addDocument("pricing_table_versions", {
        tableId,
        version: nextVer,
        changeDescription: desc,
        changedBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Erro ao registrar log de versão da tabela", err);
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tableId: rateForm.tableId,
        categoryId: rateForm.categoryId,
        subcategoryId: rateForm.subcategoryId || null,
        billingFrequency: rateForm.billingFrequency,
        amount: Number(rateForm.amount),
        active: true
      };

      const existing = rates.find(
        r =>
          r.tableId === rateForm.tableId &&
          r.categoryId === rateForm.categoryId &&
          (r.subcategoryId || null) === (rateForm.subcategoryId || null) &&
          r.billingFrequency === rateForm.billingFrequency
      );

      const table = tables.find(t => t.id === rateForm.tableId);
      const cat = categories.find(c => c.id === rateForm.categoryId);
      const sub = subcategories.find(s => s.id === rateForm.subcategoryId);
      const label = sub ? `Subcategoria ${sub.name}` : `Categoria ${cat?.name}`;
      const desc = existing
        ? `Atualizou valor de diária de ${label} na tabela ${table?.name} para R$ ${payload.amount.toFixed(2)}`
        : `Definiu preço de ${label} na tabela ${table?.name} no valor de R$ ${payload.amount.toFixed(2)}`;

      if (existing) {
        await updateDocument("pricing_rates", existing.id, { amount: payload.amount });
      } else {
        await addDocument("pricing_rates", payload);
      }

      await logTableVersion(rateForm.tableId, desc);
      alert("Tarifa configurada com sucesso!");
      setIsRateModalOpen(false);
      setRateForm({ tableId: "", categoryId: "", subcategoryId: "", billingFrequency: "daily", amount: 150 });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (confirm("Remover esta configuração de preço?")) {
      const rate = rates.find(r => r.id === id);
      if (rate) {
        await deleteDocument("pricing_rates", id);
        const table = tables.find(t => t.id === rate.tableId);
        await logTableVersion(rate.tableId, `Removeu tarifa da tabela ${table?.name}`);
      }
      loadData();
    }
  };

  const handleSaveCal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        date: calForm.date,
        pricingTableId: calForm.pricingTableId || null,
        description: calForm.description,
        type: calForm.type,
        priority: Number(calForm.priority),
        action: calForm.action,
        value: Number(calForm.value)
      };

      if (editingCal) {
        await updateDocument("calendar_rules", editingCal.id, payload);
        alert("Regra de calendário especial atualizada!");
      } else {
        await addDocument("calendar_rules", payload);
        alert("Regra de calendário especial gravada!");
      }
      setIsCalModalOpen(false);
      setEditingCal(null);
      setCalForm({ date: new Date().toISOString().split("T")[0], pricingTableId: "", description: "", type: "holiday", priority: 1, action: "exempt", value: 0 });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchHolidays = async () => {
    try {
      setLoading(true);
      const mockHolidays = [
        { date: "2026-01-01", description: "Ano Novo", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-04-21", description: "Tiradentes", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-05-01", description: "Dia do Trabalhador", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-09-07", description: "Independência do Brasil", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-10-12", description: "Nossa Senhora Aparecida", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-11-02", description: "Finados", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-11-15", description: "Proclamação da República", type: "holiday", priority: 3, action: "exempt", value: 0 },
        { date: "2026-12-25", description: "Natal", type: "holiday", priority: 3, action: "exempt", value: 0 }
      ];

      for (const h of mockHolidays) {
        const exists = calendarRules.some(c => c.date === h.date);
        if (!exists) {
          await addDocument("calendar_rules", h);
        }
      }
      alert("Feriados Nacionais carregados e integrados com sucesso!");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: pkgForm.name,
        pricingCategoryId: pkgForm.pricingCategoryId,
        includedKm: Number(pkgForm.includedKm),
        extraKmPrice: Number(pkgForm.extraKmPrice),
        includedServices: pkgForm.includedServicesText.split(",").map(s => s.trim()),
        allowReserveVehicle: pkgForm.allowReserveVehicle,
        roadsideAssistance: pkgForm.roadsideAssistance,
        operationTypeId: pkgForm.operationTypeId || null,
        active: true
      };

      if (editingPkg) {
        await updateDocument("pricing_packages", editingPkg.id, payload);
        alert("Pacote atualizado!");
      } else {
        await addDocument("pricing_packages", payload);
        alert("Pacote criado!");
      }
      setIsPkgModalOpen(false);
      setEditingPkg(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveExemption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...exForm,
        percentage: Number(exForm.percentage),
        value: Number(exForm.value),
        freeDaysCount: Number(exForm.freeDaysCount)
      };
      if (editingEx) {
        await updateDocument("pricing_exemptions", editingEx.id, payload);
        alert("Isenção atualizada com sucesso!");
      } else {
        await addDocument("pricing_exemptions", payload);
        alert("Isenção vinculada com sucesso!");
      }
      setIsExModalOpen(false);
      setEditingEx(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...promoForm,
        discountPercentage: Number(promoForm.discountPercentage)
      };
      if (editingPromo) {
        await updateDocument("pricing_promotions", editingPromo.id, payload);
        alert("Promoção atualizada com sucesso!");
      } else {
        await addDocument("pricing_promotions", payload);
        alert("Campanha de Promoção cadastrada com sucesso!");
      }
      setIsPromoModalOpen(false);
      setEditingPromo(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveContractType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCtype) {
        await updateDocument("contract_types", editingCtype.id, ctypeForm);
        alert("Tipo de contrato atualizado!");
      } else {
        await addDocument("contract_types", ctypeForm);
        alert("Tipo de contrato cadastrado!");
      }
      setIsCtypeModalOpen(false);
      setEditingCtype(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContractType = async (id: string) => {
    if (confirm("Remover este tipo de contrato?")) {
      await deleteDocument("contract_types", id);
      loadData();
    }
  };

  const handleSaveBillingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...bprofForm,
        lateFeePercent: Number(bprofForm.lateFeePercent),
        graceDays: Number(bprofForm.graceDays)
      };
      if (editingBprof) {
        await updateDocument("billing_profiles", editingBprof.id, payload);
        alert("Perfil de cobrança atualizado!");
      } else {
        await addDocument("billing_profiles", payload);
        alert("Perfil de cobrança cadastrado!");
      }
      setIsBprofModalOpen(false);
      setEditingBprof(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBillingProfile = async (id: string) => {
    if (confirm("Remover este perfil de cobrança?")) {
      await deleteDocument("billing_profiles", id);
      loadData();
    }
  };

  // ROI revenue projection calculation by category & subcategory
  const projectionResults = useMemo(() => {
    const daily = Number(projRate);
    const occupancy = Number(projOccupancy) / 100;
    
    // Filter vehicles by category and subcategory (if selected)
    const catVehicles = vehicles.filter(v => {
      const matchCat = v.pricingCategoryId === projCategory;
      const matchSub = projSubcategory ? v.pricingSubcategoryId === projSubcategory : true;
      return matchCat && matchSub;
    });
    
    const totalVehicles = catVehicles.length || 1;
    const monthlyPotential = daily * 30 * totalVehicles;
    const monthlyExpected = monthlyPotential * occupancy;
    const annualExpected = monthlyExpected * 12;

    return {
      totalVehicles,
      monthlyPotential,
      monthlyExpected,
      annualExpected
    };
  }, [projCategory, projSubcategory, projRate, projOccupancy, vehicles]);

  // Simulator Engine 2.0 (with 5-Level Priority & Subcategory Rate Inheritance)
  const handleRunSimulation = () => {
    if (!simDriverId) {
      alert("Selecione um motorista.");
      return;
    }
    const driver = drivers.find(d => d.id === simDriverId);
    const contract = contracts.find(c => c.driverId === simDriverId && (c.status === "active" || c.status === "Ativo"));
    
    if (!contract) {
      setSimResults({ error: "Nenhum contrato ativo encontrado para este motorista." });
      return;
    }

    const vehicle = vehicles.find(v => v.id === contract.vehicleId);
    const contractType = contractTypes.find(ct => ct.id === contract.contractTypeId || ct.id === contract.pricingSnapshot?.contractType);
    const billingProfile = billingProfiles.find(bp => bp.id === contract.billingProfileId || bp.id === contract.pricingSnapshot?.billingProfile);
    
    const categoryId = contract.pricingSnapshot?.category || vehicle?.pricingCategoryId || "";
    const subcategoryId = contract.pricingSnapshot?.subcategory || vehicle?.pricingSubcategoryId || "";
    const pricingTableId = contract.pricingSnapshot?.pricingTable || contract.pricingTableId || "tbl-std";
    
    const baseContractRate = contract.pricingSnapshot?.dailyRate || contract.dailyRate || 150;
    
    const start = new Date(`${simStartDate}T12:00:00`);
    const end = new Date(`${simEndDate}T12:00:00`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let items: any[] = [];
    let total = 0;

    const current = new Date(start);
    for (let i = 0; i < days; i++) {
      const dateStr = current.toISOString().split("T")[0];
      const weekdayIndex = current.getDay();
      const weekdaysEn = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const weekdaysPt = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      
      const currentDayEn = weekdaysEn[weekdayIndex];
      const currentDayPt = weekdaysPt[weekdayIndex];

      // Step A: Check Weekday Mask in Billing Profile
      const isDayChargeable = billingProfile ? billingProfile.chargeDays.includes(currentDayEn) : true;
      
      if (!isDayChargeable) {
        items.push({
          date: dateStr,
          dayOfWeek: currentDayPt,
          amount: 0,
          reason: `Isento (${currentDayPt} não cobrável)`
        });
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Step B: Resolve base rate (Inheritance logic)
      let resolvedRate = baseContractRate;
      let rateReason = "Valor Base";

      if (categoryId) {
        // 1. Search subcategory override rate in rates
        let rateMatch = null;
        if (subcategoryId) {
          rateMatch = rates.find(r => r.tableId === pricingTableId && r.categoryId === categoryId && r.subcategoryId === subcategoryId && r.billingFrequency === "daily");
        }
        
        if (rateMatch) {
          resolvedRate = rateMatch.amount;
          rateReason = `Tarifa Subcategoria (${subcategoryId})`;
        } else {
          // 2. Search subcategory metadata override in DB
          const subMeta = subcategories.find(s => s.id === subcategoryId);
          if (subMeta && subMeta.amountOverride !== undefined && subMeta.amountOverride !== null) {
            resolvedRate = subMeta.amountOverride;
            rateReason = `Override da Subcategoria`;
          } else {
            // 3. Inherit parent category standard rate
            const catRateMatch = rates.find(r => r.tableId === pricingTableId && r.categoryId === categoryId && !r.subcategoryId && r.billingFrequency === "daily");
            if (catRateMatch) {
              resolvedRate = catRateMatch.amount;
              rateReason = `Herdou Categoria (${categories.find(c => c.id === categoryId)?.name || categoryId})`;
            }
          }
        }
      }

      let currentPrice = resolvedRate;
      let stepsLog: string[] = [`Tarifa Base Resolvida: R$ ${resolvedRate.toFixed(2)} (${rateReason})`];

      // --- 5-Level Priority Calculation Engine ---
      
      // LEVEL 5: Tabela Tarifária / Valor Base (computed in Step B)

      // LEVEL 4: Tabela Tarifária Sazonal check
      const calRule = calendarRules.find(c => c.date === dateStr);

      // LEVEL 3: Feriado Policy
      let isHolidayExempt = false;
      let holidayMultiplier = 1;
      let holidayActionLog = "";

      if (calRule && calRule.type === "holiday" && contractType?.allowHolidayRules !== false) {
        const policy = billingProfile?.holidayPolicy || "exempt";
        if (policy === "exempt") {
          isHolidayExempt = true;
          holidayActionLog = "Feriado Isento por Perfil";
        } else if (policy === "surcharge") {
          holidayMultiplier = calRule.value || 1.25;
          holidayActionLog = `Sobretaxa Feriado: +${((holidayMultiplier - 1) * 100).toFixed(0)}%`;
        } else {
          holidayActionLog = "Feriado Ignorado por Perfil";
        }
      }

      // LEVEL 2: Evento Especial check
      let eventMultiplier = 1;
      let eventActionLog = "";
      if (calRule && (calRule.type === "event" || calRule.type === "seasonal")) {
        if (calRule.action === "exempt") {
          isHolidayExempt = true;
          eventActionLog = `Isenção Evento: ${calRule.description}`;
        } else if (calRule.action === "surcharge") {
          eventMultiplier = calRule.value || 1.25;
          eventActionLog = `Sobretaxa Evento (${calRule.description}): +${((eventMultiplier - 1) * 100).toFixed(0)}%`;
        } else if (calRule.action === "discount") {
          eventMultiplier = calRule.value || 0.90;
          eventActionLog = `Desconto Evento (${calRule.description}): -${((1 - eventMultiplier) * 100).toFixed(0)}%`;
        }
      }

      // LEVEL 1: Promoção Manual Check
      let promoDiscountPercent = 0;
      let promoActionLog = "";
      
      // Look up campaigns promotions in DB
      const dbPromo = promotions.find(p => p.active && p.pricingCategoryId === categoryId && dateStr >= p.validFrom && dateStr <= p.validTo);
      if (dbPromo) {
        promoDiscountPercent = dbPromo.discountPercentage;
        promoActionLog = `Campanha: ${dbPromo.name} (${promoDiscountPercent}% OFF)`;
      }

      // Look up calendar promotion
      if (calRule && calRule.type === "promo") {
        const calDiscount = calRule.value ? (1 - calRule.value) * 100 : 10;
        if (calDiscount > promoDiscountPercent) {
          promoDiscountPercent = calDiscount;
          promoActionLog = `Promo Calendário: ${calRule.description} (${calDiscount.toFixed(0)}% OFF)`;
        }
      }

      // Apply modifiers in order of priority
      if (promoDiscountPercent > 0) {
        const discount = currentPrice * (promoDiscountPercent / 100);
        currentPrice -= discount;
        stepsLog.push(`[L1: Promoção] Aplicado ${promoActionLog} - Nova diária: R$ ${currentPrice.toFixed(2)}`);
      }

      if (eventMultiplier !== 1 || eventActionLog) {
        if (isHolidayExempt) {
          currentPrice = 0;
          stepsLog.push(`[L2: Evento] Isento por regra do evento.`);
        } else {
          currentPrice *= eventMultiplier;
          stepsLog.push(`[L2: Evento] Aplicado ${eventActionLog} - Nova diária: R$ ${currentPrice.toFixed(2)}`);
        }
      }

      if ((calRule && calRule.type === "holiday" && holidayActionLog) || isHolidayExempt) {
        if (isHolidayExempt) {
          currentPrice = 0;
          stepsLog.push(`[L3: Feriado] Isento pelo feriado.`);
        } else {
          currentPrice *= holidayMultiplier;
          stepsLog.push(`[L3: Feriado] Aplicado ${holidayActionLog} - Nova diária: R$ ${currentPrice.toFixed(2)}`);
        }
      }

      // Apply granular exemptions (Level 7 in overall specs, applied on final daily charge)
      if (contractType?.allowExemptions !== false && currentPrice > 0) {
        const activeExempts = exemptions.filter(
          ex =>
            dateStr <= ex.validUntil &&
            (
              (ex.targetType === "driver" && ex.targetId === simDriverId) ||
              (ex.targetType === "contract" && ex.targetId === contract.id) ||
              (ex.targetType === "vehicle" && ex.targetId === vehicle?.id) ||
              (ex.targetType === "category" && ex.targetId === categoryId)
            )
        );

        if (activeExempts.length > 0) {
          // Find max percentage discount or flat discount
          let maxPct = 0;
          let maxVal = 0;
          let hasFreeDay = false;
          let selectedExName = "";

          activeExempts.forEach(ex => {
            if (ex.exemptionType === "percentage" && ex.percentage > maxPct) {
              maxPct = ex.percentage;
              selectedExName = ex.name;
            } else if (ex.exemptionType === "fixed" && ex.value > maxVal) {
              maxVal = ex.value;
              selectedExName = ex.name;
            } else if (ex.exemptionType === "free_days") {
              hasFreeDay = true;
              selectedExName = ex.name;
            }
          });

          if (hasFreeDay) {
            currentPrice = 0;
            stepsLog.push(`[Isenção] Isento por isenção comercial: ${selectedExName}`);
          } else if (maxPct > 0) {
            const discount = currentPrice * (maxPct / 100);
            currentPrice -= discount;
            stepsLog.push(`[Isenção] Desconto ${maxPct}% por isenção: ${selectedExName} - Nova diária: R$ ${currentPrice.toFixed(2)}`);
          } else if (maxVal > 0) {
            currentPrice = Math.max(0, currentPrice - maxVal);
            stepsLog.push(`[Isenção] Desconto fixo de R$ ${maxVal.toFixed(2)} por isenção: ${selectedExName} - Nova diária: R$ ${currentPrice.toFixed(2)}`);
          }
        }
      }

      total += currentPrice;
      items.push({
        date: dateStr,
        dayOfWeek: currentDayPt,
        amount: currentPrice,
        reason: stepsLog.join(" | ")
      });

      current.setDate(current.getDate() + 1);
    }

    setSimResults({
      driverName: driver?.name,
      contractId: contract.id,
      categoryName: categories.find(c => c.id === categoryId)?.name || "Econômicos",
      dailyBase: baseContractRate || 150,
      days,
      totalAmount: total,
      details: items
    });
  };

  // Execute Billing Run and record outputs
  const handleExecuteBilling = async () => {
    if (!simResults) return;

    try {
      setLoading(true);
      const runLog = await addDocument("billing_runs", {
        driverId: simDriverId,
        startDate: simStartDate,
        endDate: simEndDate,
        daysCharged: simResults.days,
        totalAmount: simResults.totalAmount,
        executedBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });

      for (const item of simResults.details) {
        if (item.amount > 0) {
          await addDocument("driver_ledger", {
            driverId: simDriverId,
            operationType: "daily_charge",
            amount: -Number(item.amount),
            referenceId: runLog.id,
            referenceType: "billing_run",
            createdAt: item.date + "T08:00:00Z"
          });
        }
      }

      const billSchedule = contractBillings.find(cb => cb.contractId === simResults.contractId);
      if (billSchedule) {
        const d = new Date(simEndDate);
        d.setDate(d.getDate() + 1);
        await updateDocument("contract_billing", billSchedule.id, {
          nextBillingDate: d.toISOString().split("T")[0]
        });
      } else {
        const d = new Date(simEndDate);
        d.setDate(d.getDate() + 1);
        await addDocument("contract_billing", {
          contractId: simResults.contractId,
          nextBillingDate: d.toISOString().split("T")[0],
          frequency: "daily",
          amount: simResults.dailyBase,
          active: true
        });
      }

      alert("Faturamento executado com sucesso e lançado no extrato do motorista!");
      setSimResults(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao executar faturamento.");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Nav & Status
    activeTab,
    setActiveTab,
    loading,
    setLoading,
    can,
    loadData,
    deleteDocument,
    selectedOperationFilter,
    setSelectedOperationFilter,

    // Database states
    categories,
    subcategories,
    operationTypes,
    contractTypes,
    billingProfiles,
    calendarRules,
    exemptions,
    promotions,
    tableVersions,
    tables,
    rates,
    packages,
    vehicles,
    contracts,
    drivers,
    ledger,
    contractBillings,

    // Modal state handlers
    isCatModalOpen,
    setIsCatModalOpen,
    editingCat,
    setEditingCat,
    catForm,
    setCatForm,

    isSubModalOpen,
    setIsSubModalOpen,
    editingSub,
    setEditingSub,
    subForm,
    setSubForm,

    isOpModalOpen,
    setIsOpModalOpen,
    editingOp,
    setEditingOp,
    opForm,
    setOpForm,

    isTblModalOpen,
    setIsTblModalOpen,
    editingTbl,
    setEditingTbl,
    tblForm,
    setTblForm,

    isRateModalOpen,
    setIsRateModalOpen,
    rateForm,
    setRateForm,

    isCalModalOpen,
    setIsCalModalOpen,
    editingCal,
    setEditingCal,
    calForm,
    setCalForm,

    isPkgModalOpen,
    setIsPkgModalOpen,
    editingPkg,
    setEditingPkg,
    pkgForm,
    setPkgForm,

    isExModalOpen,
    setIsExModalOpen,
    editingEx,
    setEditingEx,
    exForm,
    setExForm,

    isPromoModalOpen,
    setIsPromoModalOpen,
    editingPromo,
    setEditingPromo,
    promoForm,
    setPromoForm,

    isCtypeModalOpen,
    setIsCtypeModalOpen,
    editingCtype,
    setEditingCtype,
    ctypeForm,
    setCtypeForm,

    isBprofModalOpen,
    setIsBprofModalOpen,
    editingBprof,
    setEditingBprof,
    bprofForm,
    setBprofForm,

    // Simulator states
    projCategory,
    setProjCategory,
    projSubcategory,
    setProjSubcategory,
    projRate,
    setProjRate,
    projOccupancy,
    setProjOccupancy,
    projectionResults,

    simDriverId,
    setSimDriverId,
    simStartDate,
    setSimStartDate,
    simEndDate,
    setSimEndDate,
    simResults,
    setSimResults,

    // Operations
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveSubcategory,
    handleDeleteSubcategory,
    handleSaveOperationType,
    handleDeleteOperationType,
    handleSaveTable,
    handleDeleteTable,
    handleSaveRate,
    handleDeleteRate,
    handleSaveCal,
    handleFetchHolidays,
    handleSavePackage,
    handleSaveExemption,
    handleSavePromo,
    handleSaveContractType,
    handleDeleteContractType,
    handleSaveBillingProfile,
    handleDeleteBillingProfile,
    handleRunSimulation,
    handleExecuteBilling
  };
}
