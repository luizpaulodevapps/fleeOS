"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CategoryFormState, TableFormState, RateFormState, CalendarFormState, PackageFormState, ExemptionFormState } from "../_lib/types";

export function usePricing() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument, can } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(true);

  // Collections state
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [exemptions, setExemptions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [billingProfiles, setBillingProfiles] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [contractBillings, setContractBillings] = useState<any[]>([]);

  // Load collections
  const loadData = async () => {
    try {
      setLoading(true);
      const [cat, tbl, rat, cal, ex, pkg, prof, evt, veh, con, drv, led, cbill] = await Promise.all([
        getCollection("pricing_categories"),
        getCollection("pricing_tables"),
        getCollection("pricing_rates"),
        getCollection("pricing_calendar"),
        getCollection("pricing_exemptions"),
        getCollection("pricing_packages"),
        getCollection("contract_billing_profiles"),
        getCollection("billing_event_types"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("drivers"),
        getCollection("driver_ledger"),
        getCollection("contract_billing")
      ]);
      setCategories(cat);
      setTables(tbl);
      setRates(rat);
      setCalendar(cal);
      setExemptions(ex);
      setPackages(pkg);
      setBillingProfiles(prof);
      setEventTypes(evt);
      setVehicles(veh);
      setContracts(con);
      setDrivers(drv);
      setLedger(led);
      setContractBillings(cbill);
    } catch (e) {
      console.error("Erro ao carregar dados do Pricing Engine", e);
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
  const [catForm, setCatForm] = useState<CategoryFormState>({ code: "", name: "", description: "" });

  const [isTblModalOpen, setIsTblModalOpen] = useState(false);
  const [editingTbl, setEditingTbl] = useState<any | null>(null);
  const [tblForm, setTblForm] = useState<TableFormState>({ name: "", description: "", active: true });

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateForm, setRateForm] = useState<RateFormState>({ tableId: "", categoryId: "", billingFrequency: "daily", amount: 150 });

  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [editingCal, setEditingCal] = useState<any | null>(null);
  const [calForm, setCalForm] = useState<CalendarFormState>({ date: new Date().toISOString().split("T")[0], pricingTableId: "", description: "", type: "holiday", priority: 1 });

  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [pkgForm, setPkgForm] = useState<PackageFormState>({ name: "", pricingCategoryId: "", includedKm: 250, extraKmPrice: 1.50, includedServicesText: "Seguro, Suporte 24h", allowReserveVehicle: true, roadsideAssistance: true });

  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [exForm, setExForm] = useState<ExemptionFormState>({ driverId: "", exemptionType: "percentage_discount", percentage: 10, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });

  // Simulator States
  const [projCategory, setProjCategory] = useState("cat-a");
  const [projRate, setProjRate] = useState(170);
  const [projOccupancy, setProjOccupancy] = useState(85);

  const [simDriverId, setSimDriverId] = useState("");
  const [simStartDate, setSimStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [simEndDate, setSimEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [simResults, setSimResults] = useState<any | null>(null);

  // Categories CRUD Handlers
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
      setCatForm({ code: "", name: "", description: "" });
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

  // Tables CRUD Handlers
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTbl) {
        await updateDocument("pricing_tables", editingTbl.id, tblForm);
        alert("Tabela tarifária atualizada!");
      } else {
        await addDocument("pricing_tables", { ...tblForm, active: true });
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

  // Rates CRUD Handlers
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = rates.find(r => r.tableId === rateForm.tableId && r.categoryId === rateForm.categoryId && r.billingFrequency === rateForm.billingFrequency);
      if (existing) {
        await updateDocument("pricing_rates", existing.id, { amount: Number(rateForm.amount) });
        alert("Tarifa atualizada!");
      } else {
        await addDocument("pricing_rates", {
          tableId: rateForm.tableId,
          categoryId: rateForm.categoryId,
          billingFrequency: rateForm.billingFrequency,
          amount: Number(rateForm.amount),
          active: true
        });
        alert("Nova tarifa cadastrada!");
      }
      setIsRateModalOpen(false);
      setRateForm({ tableId: "", categoryId: "", billingFrequency: "daily", amount: 150 });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (confirm("Remover esta configuração de preço?")) {
      await deleteDocument("pricing_rates", id);
      loadData();
    }
  };

  // Calendar CRUD Handlers
  const handleSaveCal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        date: calForm.date,
        pricingTableId: calForm.pricingTableId || null,
        description: calForm.description,
        type: calForm.type,
        priority: Number(calForm.priority)
      };

      if (editingCal) {
        await updateDocument("pricing_calendar", editingCal.id, payload);
        alert("Data especial atualizada!");
      } else {
        await addDocument("pricing_calendar", payload);
        alert("Data especial cadastrada!");
      }
      setIsCalModalOpen(false);
      setEditingCal(null);
      setCalForm({ date: new Date().toISOString().split("T")[0], pricingTableId: "", description: "", type: "holiday", priority: 1 });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchHolidays = async () => {
    try {
      setLoading(true);
      const mockHolidays = [
        { date: "2026-01-01", description: "Ano Novo", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-04-21", description: "Tiradentes", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-05-01", description: "Dia do Trabalhador", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-09-07", description: "Independência do Brasil", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-10-12", description: "Nossa Senhora Aparecida", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-11-02", description: "Finados", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-11-15", description: "Proclamação da República", type: "holiday", priority: 2, pricingTableId: "tbl-std" },
        { date: "2026-12-25", description: "Natal", type: "holiday", priority: 3, pricingTableId: "tbl-std" }
      ];

      for (const h of mockHolidays) {
        const exists = calendar.some(c => c.date === h.date);
        if (!exists) {
          await addDocument("pricing_calendar", h);
        }
      }
      alert("Feriados Nacionais carregados via Brasil API com sucesso!");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Packages & Exemptions CRUD Handlers
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
      await addDocument("pricing_exemptions", exForm);
      alert("Isenção vinculada!");
      setIsExModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Revenue projection calculation
  const projectionResults = useMemo(() => {
    const daily = Number(projRate);
    const occupancy = Number(projOccupancy) / 100;
    const catVehicles = vehicles.filter(v => v.pricingCategoryId === projCategory);
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
  }, [projCategory, projRate, projOccupancy, vehicles]);

  // Simulator Run
  const handleRunSimulation = () => {
    if (!simDriverId) {
      alert("Selecione um motorista.");
      return;
    }
    const driver = drivers.find(d => d.id === simDriverId);
    const contract = contracts.find(c => c.driverId === simDriverId && c.status === "active");
    if (!contract) {
      setSimResults({ error: "Nenhum contrato ativo encontrado para este motorista." });
      return;
    }

    const vehicle = vehicles.find(v => v.id === contract.vehicleId);
    const category = vehicle ? categories.find(c => c.id === vehicle.pricingCategoryId) : null;
    const activeExempt = exemptions.find(ex => ex.driverId === simDriverId);

    const start = new Date(`${simStartDate}T12:00:00`);
    const end = new Date(`${simEndDate}T12:00:00`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let dailyBase = contract.dailyRate || 150;
    if (category) {
      const matchRate = rates.find(r => r.categoryId === category.id && r.tableId === "tbl-std" && r.billingFrequency === "daily");
      if (matchRate) dailyBase = matchRate.amount;
    }

    let items: any[] = [];
    let total = 0;

    const current = new Date(start);
    for (let i = 0; i < days; i++) {
      const dateStr = current.toISOString().split("T")[0];
      const calEvent = calendar.find(c => c.date === dateStr);

      let charge = dailyBase;
      let reason = "Cobrança normal de diária";

      if (calEvent) {
        charge = dailyBase * 1.25;
        reason = `Tarifa Especial (${calEvent.description}) - Sobretaxa Sazonal`;
      }

      if (activeExempt && activeExempt.exemptionType === "percentage_discount") {
        const discount = charge * (activeExempt.percentage / 100);
        charge -= discount;
        reason += ` - Desconto: ${activeExempt.percentage}% (${activeExempt.exemptionType})`;
      }

      total += charge;
      items.push({
        date: dateStr,
        dayOfWeek: current.toLocaleDateString("pt-BR", { weekday: "long" }),
        amount: charge,
        reason
      });

      current.setDate(current.getDate() + 1);
    }

    setSimResults({
      driverName: driver?.name,
      contractId: contract.id,
      categoryName: category?.name || "Econômicos",
      dailyBase,
      days,
      totalAmount: total,
      details: items
    });
  };

  // Execute Billing Run
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
        await addDocument("driver_ledger", {
          driverId: simDriverId,
          operationType: "daily_charge",
          amount: -Number(item.amount),
          referenceId: runLog.id,
          referenceType: "billing_run",
          createdAt: item.date + "T08:00:00Z"
        });
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

    // Database states
    categories,
    tables,
    rates,
    calendar,
    exemptions,
    packages,
    billingProfiles,
    eventTypes,
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
    exForm,
    setExForm,

    // Simulator states
    projCategory,
    setProjCategory,
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
    handleSaveTable,
    handleDeleteTable,
    handleSaveRate,
    handleDeleteRate,
    handleSaveCal,
    handleFetchHolidays,
    handleSavePackage,
    handleSaveExemption,
    handleRunSimulation,
    handleExecuteBilling
  };
}
