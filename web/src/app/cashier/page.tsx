"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  HandCoins,
  Landmark,
  LockKeyhole,
  Menu,
  Printer,
  QrCode,
  ReceiptText,
  Search,
  ShieldAlert,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFinancialHub } from "../financial/_hooks/useFinancialHub";
import { AccountsReceivable, FinancialTransaction } from "../financial/_lib/types";

type CheckoutStep = "ready" | "pix_pending" | "approved";

const money = (value = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const date = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const titleLabels: Record<string, string> = {
  rent: "Diária",
  fine: "Multa",
  claim_deductible: "Franquia de sinistro",
  adjustment: "Ajuste",
};

const methodLabel = (m: string) => ({
  pix: "PIX",
  card: "Cartão",
  cash: "Dinheiro",
  transfer: "Transferência",
  account_balance: "Conta Corrente",
}[m] || m);

export default function CashierPage() {
  const hub = useFinancialHub();
  const { updateDocument, currentUser, getCollection } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedArIds, setSelectedArIds] = useState<string[]>([]);
  const [amountReceived, setAmountReceived] = useState("");
  const [method, setMethod] = useState<FinancialTransaction["method"] | "account_balance">("pix");
  const [step, setStep] = useState<CheckoutStep>("ready");
  const [pendingTransaction, setPendingTransaction] = useState<FinancialTransaction | null>(null);
  const [receipt, setReceipt] = useState<FinancialTransaction | null>(null);
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentTerminalMode, setPaymentTerminalMode] = useState<"integrated" | "manual">("integrated");
  const [unclosedWarningOpen, setUnclosedWarningOpen] = useState(false);
  const [kmInput, setKmInput] = useState("");
  const [kmUpdating, setKmUpdating] = useState(false);
  const [liquidationModalOpen, setLiquidationModalOpen] = useState(false);
  const [kmLastValue, setKmLastValue] = useState<number | null>(null);
  const [kmLastUpdate, setKmLastUpdate] = useState<string | null>(null);
  const [maintenancePlanItems, setMaintenancePlanItems] = useState<any[]>([]);
  const [gnvRegistries, setGnvRegistries] = useState<any[]>([]);
  const [taximeterAdjustments, setTaximeterAdjustments] = useState<any[]>([]);
  const [annualInspections, setAnnualInspections] = useState<any[]>([]);
  const [driverRegulatory, setDriverRegulatory] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [infracoes, setInfracoes] = useState<any[]>([]);
  const [taxiPoints, setTaxiPoints] = useState<any[]>([]);

  const selectedDriver = hub.drivers.find((driver) => driver.id === selectedDriverId);
  const driverContracts = hub.contracts.filter((contract) => contract.driverId === selectedDriverId && contract.status !== "closed");
  const activeContract = driverContracts[0];
  const activeVehicle = hub.vehicles.find((vehicle) => vehicle.id === activeContract?.vehicleId);
  const score = selectedDriverId ? hub.getDriverCreditScore(selectedDriverId) : null;
  const isManualTerminalMode = paymentTerminalMode === "manual";

  const currentKm = activeVehicle?.mileage || 0;
  const todayKm = currentKm - (kmLastValue || currentKm);
  const avgKmPerDay = (() => {
    if (!kmLastUpdate || kmLastValue == null) return null;
    const daysSince = Math.max(1, (Date.now() - new Date(kmLastUpdate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.round(todayKm / daysSince);
  })();

  const maintAlerts = useMemo(() => {
    if (!maintenancePlanItems.length || !currentKm) return [];
    return maintenancePlanItems.map((item: any) => {
      const kmsSinceLast = currentKm - (item.lastServiceKm || 0);
      const pct = item.intervalKm > 0 ? Math.min(Math.max((kmsSinceLast / item.intervalKm) * 100, 0), 100) : 0;
      const kmsRemaining = (item.nextServiceKm || 0) - currentKm;
      return { ...item, wearPct: Math.round(pct), kmsRemaining, expired: kmsRemaining <= 0 };
    }).filter((a: any) => a.wearPct >= 80);
  }, [maintenancePlanItems, currentKm]);

  const openDebts = useMemo(() => hub.receivables
    .filter((item) => item.driverId === selectedDriverId && item.status !== "paid" && item.status !== "cancelled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [hub.receivables, selectedDriverId]);

  useEffect(() => {
    setSelectedArIds(openDebts.map((item) => item.id));
  }, [selectedDriverId, hub.receivables.length]);

  const selectedDebts = openDebts.filter((item) => selectedArIds.includes(item.id));
  const selectedTotal = selectedDebts.reduce((total, item) => total + Number(item.amount || 0) - Number(item.paidAmount || 0), 0);

  const debtsByType = useMemo(() => {
    const groups: Record<string, AccountsReceivable[]> = {};
    for (const debt of openDebts) {
      const key = debt.titleType || "other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(debt);
    }
    return groups;
  }, [openDebts]);

  const obligationsTotal = openDebts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const lastPayment = useMemo(() => {
    const paid = hub.ledger
      .filter((e: any) => e.driverId === selectedDriverId && Number(e.amount) > 0)
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return paid[0]?.createdAt || null;
  }, [hub.ledger, selectedDriverId]);

  const rodagemStatus = avgKmPerDay == null ? null
    : avgKmPerDay > 350 ? "excesso"
    : avgKmPerDay > 300 ? "atencao"
    : "normal";

  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of openDebts) { counts[d.titleType] = (counts[d.titleType] || 0) + 1; }
    return counts;
  }, [openDebts]);

  useEffect(() => {
    const loadTenantSettings = async () => {
      try {
        const companies = await getCollection("companies");
        const company = companies[0];
        if (company?.paymentTerminalMode === "manual" || company?.paymentTerminalMode === "integrated") {
          setPaymentTerminalMode(company.paymentTerminalMode);
        } else {
          setPaymentTerminalMode("integrated");
        }
      } catch (e) {
        console.error("Erro ao carregar configuração de terminal de pagamento", e);
      }
    };
    loadTenantSettings();
  }, [getCollection]);

  useEffect(() => {
    if (!activeVehicle?.id) { setMaintenancePlanItems([]); return; }
    getCollection("maintenance_plan_items").then(items => {
      setMaintenancePlanItems(items.filter((i: any) => i.vehicleId === activeVehicle.id));
    }).catch(() => {});
    if (activeVehicle?.lastKmValue != null) {
      setKmLastValue(activeVehicle.lastKmValue);
      setKmLastUpdate(activeVehicle.lastKmUpdate || null);
    } else {
      setKmLastValue(null);
      setKmLastUpdate(null);
    }
    setKmInput(String(activeVehicle?.mileage || ""));
  }, [activeVehicle?.id, getCollection]);

  useEffect(() => {
    if (!activeVehicle?.id || !selectedDriverId) return;
    const vehicleId = activeVehicle.id;
    Promise.all([
      getCollection("gnv_registries").then(list => list.filter((i: any) => i.vehicleId === vehicleId)),
      getCollection("taximeter_adjustments").then(list => list.filter((i: any) => i.vehicleId === vehicleId)),
      getCollection("annual_inspections").then(list => list.filter((i: any) => i.vehicleId === vehicleId)),
      getCollection("driver_regulatory").then(list => list.filter((i: any) => i.driverId === selectedDriverId)),
      getCollection("permits").then(list => list.filter((i: any) => i.currentVehicleId === vehicleId)),
      getCollection("infractions").then(list => list.filter((i: any) => i.vehicleId === vehicleId || i.driverId === selectedDriverId)),
      getCollection("taxi_points"),
    ]).then(([gnv, tax, insp, drg, perm, inf, points]) => {
      setGnvRegistries(gnv);
      setTaximeterAdjustments(tax);
      setAnnualInspections(insp);
      setDriverRegulatory(drg);
      setPermits(perm);
      setInfracoes(inf);
      setTaxiPoints(points);
    }).catch(() => {});
  }, [activeVehicle?.id, selectedDriverId, getCollection]);

  const ledger = useMemo(() => hub.ledger
    .filter((entry) => entry.driverId === selectedDriverId)
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()), [hub.ledger, selectedDriverId]);

  const ledgerBalance = ledger.reduce((total, entry) => total + Number(entry.amount || 0), 0);

  const accountBalance = Math.max(0, ledgerBalance);
  const isAccountBalanceMethod = method === "account_balance";
  const cashAmount = isAccountBalanceMethod ? 0 : Number(amountReceived || 0);
  const balanceUsed = isAccountBalanceMethod ? Math.min(accountBalance, selectedTotal) : 0;
  const totalPaymentValue = cashAmount + balanceUsed;
  const receiptCredit = Math.max(0, totalPaymentValue - selectedTotal);
  const balanceAfter = accountBalance - balanceUsed + receiptCredit;
  const difference = totalPaymentValue - selectedTotal;
  const receiptRemainingDebt = Math.max(0, selectedTotal - totalPaymentValue);

  const distribution = useMemo(() => {
    let remaining = totalPaymentValue;
    return selectedDebts.map(debt => {
      const owing = debt.amount - (debt.paidAmount || 0);
      const allocated = Math.min(owing, Math.max(0, remaining));
      remaining -= allocated;
      return { ...debt, allocated, owing, fullyPaid: allocated >= owing };
    });
  }, [selectedDebts, totalPaymentValue]);

  const remainingAfterDistrib = Math.max(0, totalPaymentValue - distribution.reduce((s, d) => s + d.allocated, 0));

  useEffect(() => {
    if (method === "account_balance") {
      setAmountReceived("0");
    } else if (selectedTotal > 0) {
      setAmountReceived(selectedTotal.toFixed(2));
    }
  }, [selectedTotal, method]);

  const searchResults = useMemo(() => {
    const normalized = query.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized) return [];
    return hub.drivers.filter((driver) => {
      const name = String(driver.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const cpf = String(driver.cpf || "").replace(/[^a-z0-9]/g, "");
      const contract = hub.contracts.find((item) => item.driverId === driver.id && item.status !== "closed");
      const vehicle = hub.vehicles.find((item) => item.id === contract?.vehicleId);
      const vehicleTerms = `${vehicle?.plate || ""}${vehicle?.prefix || ""}${vehicle?.internalCode || ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");
      return name.includes(normalized) || cpf.includes(normalized) || vehicleTerms.includes(normalized);
    }).slice(0, 8);
  }, [query, hub.drivers, hub.contracts, hub.vehicles]);

  const maintDisplayItems = useMemo(() => {
    if (!maintenancePlanItems.length || !currentKm) return [];
    return maintenancePlanItems.map((item: any) => {
      const kmsSinceLast = currentKm - (item.lastServiceKm || 0);
      if (kmsSinceLast <= 0) return null;
      const pct = item.intervalKm > 0 ? Math.min(Math.max((kmsSinceLast / item.intervalKm) * 100, 0), 100) : 0;
      const kmsRemaining = (item.nextServiceKm || 0) - currentKm;
      return { ...item, wearPct: Math.round(pct), kmsRemaining, expired: kmsRemaining <= 0 };
    }).filter(Boolean);
  }, [maintenancePlanItems, currentKm]);

  const permitInfo = useMemo(() => {
    if (!activeVehicle) return null;
    return permits.find(p => p.currentVehicleId === activeVehicle.id) || null;
  }, [permits, activeVehicle]);

  const pointInfo = useMemo(() => {
    if (!permitInfo?.pointId) return null;
    return taxiPoints.find(p => p.id === permitInfo.pointId) || null;
  }, [permitInfo, taxiPoints]);

  const docStatuses = useMemo(() => {
    const result: { label: string; date: string | null; status: string }[] = [];
    if (activeVehicle?.registrationExpiration) result.push({ label: "CRLV", date: activeVehicle.registrationExpiration, status: new Date(activeVehicle.registrationExpiration) > new Date() ? "valid" : "expired" });
    if (activeVehicle?.insuranceExpiration) result.push({ label: "Seguro", date: activeVehicle.insuranceExpiration, status: new Date(activeVehicle.insuranceExpiration) > new Date() ? "valid" : "expired" });
    if (gnvRegistries.length > 0) {
      const latest = gnvRegistries.sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime())[0];
      result.push({ label: "GNV", date: latest.expirationDate, status: latest.status !== "expired" && new Date(latest.expirationDate) > new Date() ? "valid" : "expired" });
    }
    if (taximeterAdjustments.length > 0) {
      const latest = taximeterAdjustments.sort((a, b) => new Date(b.adjustmentDate).getTime() - new Date(a.adjustmentDate).getTime())[0];
      result.push({ label: "Taxímetro", date: latest.adjustmentDate, status: "valid" });
    }
    const currentYear = new Date().getFullYear();
    const currentInsp = annualInspections.find(i => i.year === currentYear);
    if (currentInsp) result.push({ label: "Vistoria", date: currentInsp.inspectionDate, status: currentInsp.result === "approved" ? "valid" : "expired" });
    return result;
  }, [activeVehicle, gnvRegistries, taximeterAdjustments, annualInspections]);

  const dtpStatuses = useMemo(() => {
    const daysUntil = (d?: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
    const result: { label: string; date: string | null; status: string; daysLeft: number; name?: string }[] = [];
    if (selectedDriver?.alvaraExpiration) result.push({ label: "Alvará", date: selectedDriver.alvaraExpiration, status: new Date(selectedDriver.alvaraExpiration) > new Date() ? "valid" : "expired", daysLeft: daysUntil(selectedDriver.alvaraExpiration) });
    const drg = driverRegulatory[0];
    if (drg) result.push({ label: "Condutax", date: drg.expirationDate, status: drg.status === "active" && new Date(drg.expirationDate) > new Date() ? "valid" : "expired", daysLeft: daysUntil(drg.expirationDate) });
    if (permitInfo?.expirationDate) result.push({ label: "Ponto Táxi", date: permitInfo.expirationDate, status: new Date(permitInfo.expirationDate) > new Date() ? "valid" : "expired", daysLeft: daysUntil(permitInfo.expirationDate), name: pointInfo?.name });
    return result;
  }, [selectedDriver, driverRegulatory, permitInfo, pointInfo]);

  const vehicleHealthScore = useMemo(() => {
    const docItems = [
      activeVehicle?.registrationExpiration ? new Date(activeVehicle.registrationExpiration) > new Date() : false,
      activeVehicle?.insuranceExpiration ? new Date(activeVehicle.insuranceExpiration) > new Date() : false,
      gnvRegistries.some(g => g.status !== "expired" && new Date(g.expirationDate) > new Date()),
      annualInspections.some(i => i.year === new Date().getFullYear() && i.result === "approved"),
      selectedDriver?.alvaraExpiration ? new Date(selectedDriver.alvaraExpiration) > new Date() : false,
      driverRegulatory.some(d => d.status === "active" && new Date(d.expirationDate) > new Date()),
      selectedDriver?.cnhExpiration ? new Date(selectedDriver.cnhExpiration) > new Date() : false,
    ];
    const docScore = (docItems.filter(Boolean).length / docItems.length) * 100;
    const maintItems = maintenancePlanItems.filter(i => currentKm > (i.lastServiceKm || 0));
    const maintScore = maintItems.length > 0
      ? (maintItems.filter(i => { const k = currentKm - (i.lastServiceKm || 0); return i.intervalKm > 0 ? (k / i.intervalKm) * 100 < 90 : true; }).length / maintItems.length) * 100
      : 100;
    const pendingInfracoes = infracoes.filter(i => i.status === "pending" && (i.driverId === selectedDriverId || i.vehicleId === activeVehicle?.id)).length;
    const conformidadeScore = Math.max(0, 100 - pendingInfracoes * 15);
    const total = Math.round(docScore * 0.4 + maintScore * 0.35 + conformidadeScore * 0.25);
    return { total, docScore: Math.round(docScore), maintScore: Math.round(maintScore), conformidadeScore: Math.round(conformidadeScore) };
  }, [activeVehicle, gnvRegistries, annualInspections, selectedDriver, driverRegulatory, maintenancePlanItems, currentKm, infracoes, selectedDriverId]);

  const blockingReasons = useMemo(() => {
    const reasons: { label: string; severity: "blocked" | "alert" }[] = [];
    if (!activeVehicle || !selectedDriver) return reasons;
    const daysUntil = (d?: string) => d ? Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
    if (activeVehicle.registrationExpiration) { const d = daysUntil(activeVehicle.registrationExpiration); if (d <= 0) reasons.push({ label: "CRLV vencido", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `CRLV vence em ${d}d`, severity: "alert" }); }
    if (activeVehicle.insuranceExpiration) { const d = daysUntil(activeVehicle.insuranceExpiration); if (d <= 0) reasons.push({ label: "Seguro vencido", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `Seguro vence em ${d}d`, severity: "alert" }); }
    gnvRegistries.forEach(g => { const d = daysUntil(g.expirationDate); if (g.status === "expired" || d <= 0) reasons.push({ label: "GNV vencido", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `GNV vence em ${d}d`, severity: "alert" }); });
    const currentYearInsp = annualInspections.find(i => i.year === new Date().getFullYear());
    if (!currentYearInsp || currentYearInsp.result !== "approved") reasons.push({ label: "Vistoria anual pendente", severity: "blocked" });
    if (selectedDriver.alvaraExpiration) { const d = daysUntil(selectedDriver.alvaraExpiration); if (d <= 0) reasons.push({ label: "Alvará vencido", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `Alvará vence em ${d}d`, severity: "alert" }); }
    const drg = driverRegulatory[0];
    if (drg) { const d = daysUntil(drg.expirationDate); if (drg.status === "expired" || d <= 0) reasons.push({ label: "Condutax vencido", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `Condutax vence em ${d}d`, severity: "alert" }); }
    if (selectedDriver.cnhExpiration) { const d = daysUntil(selectedDriver.cnhExpiration); if (d <= 0) reasons.push({ label: "CNH vencida", severity: "blocked" }); else if (d <= 30) reasons.push({ label: `CNH vence em ${d}d`, severity: "alert" }); }
    maintAlerts.filter(a => a.expired).forEach(a => reasons.push({ label: `${a.itemName} vencido(a)`, severity: "blocked" }));
    maintAlerts.filter(a => !a.expired).forEach(a => reasons.push({ label: `${a.itemName} — ${a.kmsRemaining.toLocaleString()} km`, severity: "alert" }));
    if (rodagemStatus === "excesso") reasons.push({ label: `Excesso de rodagem — média ${avgKmPerDay} km/d`, severity: "alert" });
    else if (rodagemStatus === "atencao") reasons.push({ label: `Rodagem em atenção — média ${avgKmPerDay} km/d`, severity: "alert" });
    return reasons;
  }, [activeVehicle, selectedDriver, gnvRegistries, annualInspections, driverRegulatory, selectedDriverId, maintAlerts, rodagemStatus, avgKmPerDay]);

  const operacaoStatus = useMemo(() => {
    if (blockingReasons.some(r => r.severity === "blocked")) return "bloqueada";
    if (blockingReasons.some(r => r.severity === "alert")) return "atencao";
    return "liberada";
  }, [blockingReasons]);

  const infracoesSummary = useMemo(() => {
    const pending = infracoes.filter(i => i.status === "pending" && (i.driverId === selectedDriverId || i.vehicleId === activeVehicle?.id));
    const total = pending.reduce((s, i) => s + Number(i.valor || 0), 0);
    const last = pending.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
    return { count: pending.length, total, last };
  }, [infracoes, selectedDriverId, activeVehicle?.id]);

  const selectDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    setQuery("");
    setStep("ready");
    setReceipt(null);
    setPendingTransaction(null);
  };

  const toggleDebt = (id: string) => {
    setSelectedArIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleKmUpdate = async () => {
    if (!activeVehicle || !kmInput || !selectedDriverId) return;
    const newKm = Number(kmInput);
    if (!newKm || newKm <= 0) return alert("Informe a KM atual.");
    if (newKm <= currentKm) return alert("KM atual deve ser maior que a anterior.");
    setKmUpdating(true);
    try {
      await updateDocument("vehicles", activeVehicle.id, {
        mileage: newKm,
        lastKmValue: currentKm,
        lastKmUpdate: new Date().toISOString()
      });
      setKmLastValue(currentKm);
      setKmLastUpdate(new Date().toISOString());
      await hub.reload();
    } catch (e) { alert("Erro ao atualizar KM."); }
    finally { setKmUpdating(false); }
  };

  const receivePayment = async () => {
    if (!selectedDriverId || selectedArIds.length === 0 || totalPaymentValue <= 0 || !hub.activeSession) return;
    const txMethod: FinancialTransaction["method"] = method === "account_balance" ? "transfer" : method as FinancialTransaction["method"];
    setSaving(true);
    setPaymentError(null);
    try {
      const gateway = isManualTerminalMode ? "manual" : method === "pix" ? "mercado_pago" : method === "card" ? "stripe" : "manual";
      const transaction = await hub.submitTransaction(
        selectedArIds.length === 1 ? selectedArIds[0] : "auto_all",
        selectedDriverId,
        totalPaymentValue,
        txMethod,
        gateway,
        "credit",
        "keep_partial",
        selectedArIds,
        balanceUsed,
        cashAmount,
        method
      );
      if (!transaction) {
        setPaymentError("Não foi possível criar a transação. Tente novamente ou verifique a conexão.");
        return;
      }
      setPendingTransaction(transaction);
      if (method === "pix" && !isManualTerminalMode) {
        setStep("pix_pending");
      } else {
        await hub.webhookApproveTransaction(transaction.id, transaction);
        setReceipt({ ...transaction, status: "approved" });
        setStep("approved");
        setSelectedArIds([]);
      }
    } catch (err: any) {
      console.error("[Caixa] Erro ao processar pagamento:", err);
      setPaymentError(
        err?.message
          ? `Erro: ${err.message}`
          : "Falha inesperada ao processar o pagamento. O lançamento não foi confirmado — tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmPix = async () => {
    if (!pendingTransaction) return;
    setSaving(true);
    setPaymentError(null);
    try {
      await hub.webhookApproveTransaction(pendingTransaction.id, pendingTransaction);
      setReceipt({ ...pendingTransaction, status: "approved" });
      setStep("approved");
      setSelectedArIds([]);
    } catch (err: any) {
      console.error("[Caixa] Erro ao confirmar PIX:", err);
      setPaymentError(
        err?.message
          ? `Erro ao confirmar PIX: ${err.message}`
          : "Falha ao confirmar o pagamento PIX. Verifique o gateway e tente novamente."
      );
      setStep("ready");
    } finally {
      setSaving(false);
    }
  };

  if (hub.loading) {
    return <div className="min-h-[560px] flex flex-col items-center justify-center gap-3"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /><p className="text-xs font-semibold text-slate-500">Preparando checkout...</p></div>;
  }

  return (
    <div className="min-w-0 text-slate-900">
      <header className="flex items-center justify-between gap-4 mb-5">
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">Central de atendimento</p><h1 className="font-geist text-2xl font-black tracking-tight mt-1">Atendimento Financeiro</h1></div>
        <div className="flex items-center gap-2">
          {hub.abandonedSession && (
            <button onClick={() => setUnclosedWarningOpen(true)} className="h-10 px-4 rounded-xl border border-amber-300 bg-amber-50 flex items-center gap-2 text-xs font-bold text-amber-700 hover:bg-amber-100 shadow-sm">
              <ShieldAlert className="w-4 h-4" /> Caixa pendente
            </button>
          )}
          <button onClick={() => setCashDrawerOpen(true)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-xs font-bold hover:border-indigo-300 hover:text-indigo-700 shadow-sm"><Menu className="w-4 h-4" /> Caixa <span className={`w-2 h-2 rounded-full ${hub.activeSession ? "bg-emerald-500" : "bg-red-500"}`} /></button>
        </div>
      </header>

      <section className="relative z-20 mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Prefixo, placa, nome ou CPF" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium outline-none shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
        {query && <div className="absolute left-0 right-0 top-[62px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">{searchResults.map((driver) => { const contract = hub.contracts.find((item) => item.driverId === driver.id && item.status !== "closed"); const vehicle = hub.vehicles.find((item) => item.id === contract?.vehicleId); return <button key={driver.id} onClick={() => selectDriver(driver.id)} className="w-full px-4 py-3 flex items-center justify-between text-left border-b last:border-0 border-slate-100 hover:bg-indigo-50"><div><p className="text-xs font-bold text-slate-900">{driver.name}</p><p className="text-[10px] text-slate-500 mt-0.5">{driver.cpf || "CPF não informado"} · {vehicle?.plate || "Sem veículo ativo"}</p></div><ChevronRight className="w-4 h-4 text-slate-400" /></button>})}{searchResults.length === 0 && <p className="p-5 text-xs text-slate-400 text-center">Nenhum motorista encontrado.</p>}</div>}
      </section>

      {!selectedDriver ? (
        <EmptyCheckout />
      ) : (
        <div className="grid xl:grid-cols-[300px_1fr_340px] gap-4 items-start">

          {/* ═══ LEFT COLUMN — IDENTIFICAÇÃO + KM + ALERTAS ═══ */}
          <div className="space-y-3">

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white grid place-items-center font-geist font-black shrink-0 text-sm">
                  {String(selectedDriver.name || "?").split(" ").slice(0, 2).map((p: string) => p[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black tracking-wide text-indigo-600">
                      {activeVehicle?.prefix || activeVehicle?.internalCode || "Táxi"}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeVehicle?.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                  </div>
                  <p className="font-geist text-sm font-black truncate">{selectedDriver.name}</p>
                  <p className="text-[9px] text-slate-500 truncate">
                    {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model} · ${activeVehicle.plate}` : "Sem veículo ativo"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[8px] font-black uppercase tracking-wide text-slate-400">KM</span>
                {rodagemStatus && (
                  <span className={`ml-auto text-[8px] font-black px-1.5 py-0.5 rounded ${
                    rodagemStatus === "normal" ? "bg-emerald-50 text-emerald-700"
                    : rodagemStatus === "atencao" ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                  }`}>
                    {rodagemStatus === "normal" ? "Normal" : rodagemStatus === "atencao" ? "Atenção" : "Excesso"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-slate-400">KM</span>
                  <input type="number" value={kmInput} onChange={(e) => setKmInput(e.target.value)}
                    className="checkout-input pl-8 font-geist font-black text-sm h-9" />
                </div>
                <button onClick={handleKmUpdate} disabled={kmUpdating}
                  className="h-9 px-3 rounded-xl bg-slate-950 text-white text-[10px] font-black flex items-center gap-1 disabled:opacity-40 shrink-0">
                  <Check className="w-3 h-3" /> {kmUpdating ? "..." : "Atualizar"}
                </button>
              </div>
              {kmLastValue != null && (
                <div className="flex gap-3 mt-2 text-[9px]">
                  <span><span className="text-slate-400">Hoje:</span> <strong>{todayKm.toLocaleString()} km</strong></span>
                  {avgKmPerDay != null && (
                    <span><span className="text-slate-400">Média:</span> <strong>{avgKmPerDay} km/d</strong></span>
                  )}
                </div>
              )}
            </section>

            {/* SITUAÇÃO OPERACIONAL DO VEÍCULO */}
            {selectedDriverId && activeVehicle && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">

                {/* Header + Bloqueio */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black tracking-wide text-indigo-600">
                      {activeVehicle?.prefix || activeVehicle?.internalCode || "Táxi"}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeVehicle?.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                  </div>
                  <p className="font-geist text-sm font-black">{activeVehicle?.brand} {activeVehicle?.model}</p>
                  <p className="text-[9px] text-slate-500">{activeVehicle?.plate}</p>

                  <div className={`mt-2 rounded-xl p-3 ${
                    operacaoStatus === "liberada" ? "bg-emerald-50 border border-emerald-200"
                    : operacaoStatus === "atencao" ? "bg-amber-50 border border-amber-200"
                    : "bg-red-50 border border-red-200"
                  }`}>
                    <div className={`flex items-center gap-1.5 text-[10px] font-black ${
                      operacaoStatus === "liberada" ? "text-emerald-700"
                      : operacaoStatus === "atencao" ? "text-amber-700"
                      : "text-red-700"
                    }`}>
                      {operacaoStatus === "liberada" ? <CheckCircle2 className="w-3.5 h-3.5" />
                        : <AlertCircle className="w-3.5 h-3.5" />}
                      {operacaoStatus === "liberada" ? "OPERAÇÃO LIBERADA"
                        : operacaoStatus === "atencao" ? "OPERAÇÃO COM RESSALVAS"
                        : "OPERAÇÃO BLOQUEADA"}
                    </div>
                    {blockingReasons.filter(r => r.severity === "blocked").length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {blockingReasons.filter(r => r.severity === "blocked").map((r, i) => (
                          <p key={i} className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" /> {r.label}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* RESUMO */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-wide">Resumo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <span className="text-[8px] font-bold uppercase text-slate-500">KM Atual</span>
                      <p className="font-geist font-black text-sm mt-0.5">{currentKm.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <span className="text-[8px] font-bold uppercase text-slate-500">Score</span>
                      <p className={`font-geist font-black text-sm mt-0.5 ${
                        vehicleHealthScore.total >= 80 ? "text-emerald-600"
                        : vehicleHealthScore.total >= 50 ? "text-amber-600"
                        : "text-red-600"
                      }`}>{vehicleHealthScore.total}</p>
                    </div>
                    {avgKmPerDay != null && (
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="text-[8px] font-bold uppercase text-slate-500">Média</span>
                        <p className="font-geist font-black text-sm mt-0.5">{avgKmPerDay} km/d</p>
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <span className="text-[8px] font-bold uppercase text-slate-500">Limite</span>
                      <p className="font-geist font-black text-sm mt-0.5">300 km/d</p>
                    </div>
                  </div>
                  {kmLastValue != null && (
                    <p className="text-[8px] text-slate-400 mt-1.5">
                      Hoje: <strong>{todayKm.toLocaleString()} km</strong>
                      {kmLastUpdate && <> · Última em: {new Date(kmLastUpdate).toLocaleDateString("pt-BR")}</>}
                    </p>
                  )}
                </div>

                {/* REGULARIDADE DTP */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-600">
                    <UserRound className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-wide">Regularidade DTP</span>
                  </div>
                  <div className="space-y-1.5">
                    {dtpStatuses.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1 h-1 rounded-full shrink-0 ${
                            item.status === "valid" ? "bg-emerald-500"
                            : item.status === "expired" ? "bg-red-500"
                            : "bg-slate-300"
                          }`} />
                          <span className="font-bold truncate">{item.label}</span>
                          {item.name && <span className="text-slate-400 truncate">· {item.name}</span>}
                        </div>
                        <span className={`shrink-0 ml-2 text-[8px] font-black px-1.5 py-0.5 rounded ${
                          item.status === "valid"
                            ? (item.daysLeft != null && item.daysLeft <= 30 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")
                            : item.status === "expired" ? "bg-red-50 text-red-700"
                            : "bg-slate-50 text-slate-500"
                        }`}>
                          {item.status === "valid"
                            ? (item.daysLeft != null && item.daysLeft <= 30 ? `${item.daysLeft}d` : "OK")
                            : item.status === "expired" ? "Vencido"
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MANUTENÇÃO */}
                {maintDisplayItems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                      <span className="text-[8px] font-black uppercase tracking-wide">Manutenção</span>
                    </div>
                    <div className="space-y-2">
                      {maintDisplayItems.map((item: any) => (
                        <div key={item.id}>
                          <div className="flex items-center justify-between text-[10px] mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${item.expired ? "bg-red-500" : item.wearPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} />
                              <span className="font-bold">{item.itemName}</span>
                            </div>
                            <span className={`text-[8px] font-black ${
                              item.expired ? "text-red-600"
                              : item.wearPct >= 80 ? "text-amber-600"
                              : "text-emerald-600"
                            }`}>
                              {item.wearPct}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${
                              item.expired ? "bg-red-500"
                              : item.wearPct >= 80 ? "bg-amber-500"
                              : "bg-emerald-500"
                            }`} style={{ width: `${Math.min(item.wearPct, 100)}%` }} />
                          </div>
                          <p className="text-[8px] text-slate-400 mt-0.5">
                            {item.expired ? "Vencido" : `${item.kmsRemaining.toLocaleString()} km restantes`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DOCUMENTAÇÃO */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                    <FileText className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-wide">Documentação</span>
                  </div>
                  <div className="space-y-1.5">
                    {docStatuses.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1 h-1 rounded-full shrink-0 ${
                            item.status === "valid" ? "bg-emerald-500"
                            : item.status === "expired" ? "bg-red-500"
                            : "bg-slate-300"
                          }`} />
                          <span className="font-bold truncate">{item.label}</span>
                          {item.date && <span className="text-slate-400">· {date(item.date)}</span>}
                        </div>
                        <span className={`shrink-0 ml-2 text-[8px] font-black px-1.5 py-0.5 rounded ${
                          item.status === "valid" ? "bg-emerald-50 text-emerald-700"
                          : item.status === "expired" ? "bg-red-50 text-red-700"
                          : "bg-slate-50 text-slate-500"
                        }`}>
                          {item.status === "valid" ? "OK" : item.status === "expired" ? "Vencido" : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INFRAÇÕES */}
                {infracoesSummary.count > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-wide">Infrações</span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-red-700">Pendentes: {infracoesSummary.count}</span>
                        <span className="font-geist font-black text-red-700">{money(infracoesSummary.total)}</span>
                      </div>
                      {infracoesSummary.last && (
                        <p className="text-[8px] text-red-600">
                          Última: {infracoesSummary.last.description} · {new Date(infracoesSummary.last.createdAt || infracoesSummary.last.vencimento).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </section>
            )}

          </div>

          {/* ═══ CENTER COLUMN — SITUAÇÃO FINANCEIRA ═══ */}
          <div className="space-y-3">

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-geist text-sm font-black">Situação Financeira</h2>
                </div>
                {score && (
                  <div className={`rounded-lg px-2 py-0.5 border text-[9px] font-black ${
                    ["AAA","AA","A"].includes(score.grade) ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : ["C","D"].includes(score.grade) ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}>
                    Score {score.grade}
                  </div>
                )}
              </div>

              <div className="p-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Saldo atual</span>
                <span className={`font-geist text-base font-black text-right ${ledgerBalance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {money(ledgerBalance)}
                </span>
                <span className="text-slate-400 font-bold uppercase">Diárias pendentes</span>
                <span className="font-bold text-right">{pendingCounts.rent || 0}</span>
                <span className="text-slate-400 font-bold uppercase">Multas</span>
                <span className="font-bold text-right">{pendingCounts.fine || 0}</span>
                <span className="text-slate-400 font-bold uppercase">Sinistros</span>
                <span className="font-bold text-right">{pendingCounts.claim_deductible || 0}</span>
                <span className="text-slate-400 font-bold uppercase">Conta Corrente</span>
                <span className={`font-geist text-base font-black text-right ${accountBalance > 0 ? "text-emerald-600" : "text-slate-400"}`}>{money(accountBalance)}</span>
                <span className="text-slate-400 font-bold uppercase">Último pagamento</span>
                <span className="font-bold text-right">{lastPayment ? date(lastPayment) : "—"}</span>
              </div>

              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wide">Total de obrigações</span>
                <strong className="font-geist text-lg font-black">{money(obligationsTotal)}</strong>
              </div>
            </section>

            {Object.entries(debtsByType).map(([type, debts]) => {
              const total = debts.reduce((s, d) => s + (d.amount - (d.paidAmount || 0)), 0);
              const label = titleLabels[type] || "Cobrança";
              const colors = type === "rent" ? "text-indigo-700 bg-indigo-50"
                : type === "fine" ? "text-red-700 bg-red-50"
                : type === "claim_deductible" ? "text-amber-700 bg-amber-50"
                : "text-slate-700 bg-slate-50";
              return (
                <section key={type} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${colors}`}>
                      {label} · {debts.length} título{debts.length > 1 ? "s" : ""}
                    </span>
                    <strong className="text-sm font-black">{money(total)}</strong>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {debts.map((debt) => (
                      <label key={debt.id}
                        className="px-4 py-2.5 flex items-center justify-between text-[10px] cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-2 min-w-0">
                          <input type="checkbox" checked={selectedArIds.includes(debt.id)}
                            onChange={() => toggleDebt(debt.id)}
                            className="w-3 h-3 rounded border-slate-300 text-indigo-600 shrink-0" />
                          <span className="text-slate-600 truncate">
                            {date(debt.dueDate)}
                            {debt.status === "partial" && <span className="text-amber-600 font-bold ml-1">(parcial)</span>}
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0 ml-2">
                          {money(debt.amount - (debt.paidAmount || 0))}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* CONTA CORRENTE */}
            {selectedDriverId && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5">
                  <ReceiptText className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[8px] font-black uppercase tracking-wide text-slate-500">Conta corrente</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-bold">Conta Corrente</span>
                    <span className={`font-geist font-black ${accountBalance > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                      {money(accountBalance)}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-bold">Saldo devedor</span>
                    <span className={`font-geist font-black ${obligationsTotal > 0 ? "text-red-600" : "text-slate-400"}`}>
                      {money(obligationsTotal)}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-bold">Situação</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                      accountBalance > 0 ? "bg-emerald-50 text-emerald-700"
                      : obligationsTotal === 0 ? "bg-slate-50 text-slate-500"
                      : "bg-amber-50 text-amber-700"
                    }`}>
                      {accountBalance > 0 ? "Saldo positivo" : obligationsTotal === 0 ? "Neutro" : "Devedor"}
                    </span>
                  </div>
                  {ledger.slice(0, 3).map((entry: any) => (
                    <div key={entry.id} className="px-4 py-2 flex items-center justify-between text-[10px]">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-700 truncate">{entry.description || "Lançamento"}</p>
                        <p className="text-[8px] text-slate-400">{date(entry.createdAt)}</p>
                      </div>
                      <span className={`font-bold shrink-0 ml-2 ${Number(entry.amount) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {Number(entry.amount) >= 0 ? "+" : ""}{money(entry.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                {ledger.length > 3 && (
                  <button onClick={() => setStatementOpen(true)}
                    className="w-full px-4 py-2.5 text-[9px] font-bold text-indigo-600 hover:bg-indigo-50 border-t border-slate-100">
                    Ver extrato completo ({ledger.length} lançamentos)
                  </button>
                )}
              </section>
            )}

            {/* COBRANÇAS RECORRENTES */}
            {(() => {
              const activePlans = hub.paymentPlans.filter((p: any) => p.driverId === selectedDriverId && p.status === "active");
              const signedSettlements = hub.settlements.filter((s: any) => s.driverId === selectedDriverId && s.status === "signed");
              if (activePlans.length === 0 && signedSettlements.length === 0) return null;
              return (
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-black uppercase tracking-wide">Cobranças recorrentes</span>
                  </div>
                  {activePlans.map((plan: any) => {
                    const pct = plan.installmentsCount > 0 ? Math.round((plan.paidInstallments || 0) / plan.installmentsCount * 100) : 0;
                    return (
                      <div key={plan.id} className="flex items-center justify-between gap-2 text-[10px]">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800">{plan.installmentsCount}x de {money(plan.monthlyAmount)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500">{pct}%</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">Ativo</span>
                      </div>
                    );
                  })}
                  {signedSettlements.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-[10px]">
                      <div>
                        <p className="font-bold text-slate-800">Acordo · {s.installments}x</p>
                        <p className="text-[8px] text-slate-500">{money(s.originalDebt)} → {money(s.settledAmount)}</p>
                      </div>
                      <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Vigente</span>
                    </div>
                  ))}
                </section>
              );
            })()}

          </div>

          {/* ═══ RIGHT COLUMN — AÇÕES + PAGAMENTO + DISTRIBUIÇÃO ═══ */}
          <div className="xl:sticky xl:top-4 space-y-3">

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3">
              <div className="grid grid-cols-2 gap-1.5">
                <QuickButton icon={HandCoins} label="Receber" primary onClick={() => document.getElementById("payment-value")?.focus()} />
                <QuickButton icon={CalendarDays} label="Parcelar" onClick={() => setInstallmentOpen(true)} />
                <QuickButton icon={Sparkles} label="Negociar" onClick={() => setInstallmentOpen(true)} />
                <QuickButton icon={FileText} label="Extrato" onClick={() => setStatementOpen(true)} />
                <QuickButton icon={Ban} label="Bloquear" danger onClick={async () => {
                  if (!selectedDriver || !confirm(`Bloquear ${selectedDriver.name} para novas retiradas?`)) return;
                  await updateDocument("drivers", selectedDriver.id, { status: "blocked_financial", financialBlockedAt: new Date().toISOString(), financialBlockedBy: currentUser?.displayName || "Caixa" });
                  await hub.reload();
                }} />
              </div>
            </section>



            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <HandCoins className="w-3.5 h-3.5 text-indigo-500" />
                <h2 className="font-geist text-xs font-black">Pagamento</h2>
              </div>

              <div className="flex gap-2">
                {!isAccountBalanceMethod && (
                  <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-slate-400">R$</span>
                    <input id="payment-value" type="number" min="0" step="0.01" value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="checkout-input pl-7 font-geist font-black text-sm h-9" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1">
                  {([
                    { id: "pix" as const, label: "PIX", icon: QrCode },
                    { id: "card" as const, label: "Cartão", icon: CreditCard },
                    { id: "cash" as const, label: "Dinheiro", icon: Banknote },
                    { id: "transfer" as const, label: "T", icon: Landmark },
                    ...(accountBalance > 0 ? [{ id: "account_balance" as const, label: "Conta Corrente", icon: ReceiptText }] : []),
                  ]).map((opt) => (
                      <button key={opt.id} type="button" onClick={() => setMethod(opt.id)}
                        className={`h-9 px-2 rounded-lg border flex items-center justify-center gap-1 text-[9px] font-bold transition-colors ${
                          method === opt.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}>
                        <opt.icon className="w-3 h-3" /> {opt.label}
                      </button>
                    ))}
                </div>
              </div>

              {totalPaymentValue > 0 && selectedDebts.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                  <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-slate-500">
                    <ArrowDownRight className="w-3 h-3" /> Distribuição
                  </div>
                  {distribution.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {d.allocated > 0 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate text-slate-600">
                          {titleLabels[d.titleType]} {date(d.dueDate)}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-1">
                        {d.allocated > 0 && <span className="font-bold text-emerald-700">{money(d.allocated)}</span>}
                        {d.allocated > 0 && d.fullyPaid && <span className="text-[8px] text-emerald-500 ml-0.5">✓</span>}
                        {d.allocated > 0 && !d.fullyPaid && <span className="text-[8px] text-amber-500 ml-0.5">parc</span>}
                        {d.allocated <= 0 && <span className="text-slate-300">—</span>}
                      </div>
                    </div>
                  ))}
                  {balanceAfter > 0 && (
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 pt-1.5 border-t border-slate-200">
                      <span>Conta Corrente final</span>
                      <span>{money(balanceAfter)}</span>
                    </div>
                  )}
                  {balanceUsed > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-indigo-600 font-bold pt-1 border-t border-slate-200">
                      <span>Conta Corrente utilizado</span>
                      <span>-{money(balanceUsed)}</span>
                    </div>
                  )}
                  {selectedDebts.some(d => (d.amount - (d.paidAmount || 0)) > 0) && remainingAfterDistrib <= 0 && totalPaymentValue < obligationsTotal && (
                    <div className="text-[9px] text-amber-700 font-bold pt-1.5 border-t border-slate-200">
                      Resta: {money(obligationsTotal - totalPaymentValue)}
                    </div>
                  )}
                </div>
              )}

              {isManualTerminalMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[9px] text-amber-800">
                  <strong className="block text-[10px] font-bold">Terminal físico</strong>
                  Registre no POS e confirme manualmente.
                </div>
              )}

              {!hub.activeSession && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-1.5 text-[9px] font-bold text-red-700">
                  <LockKeyhole className="w-3 h-3" /> Abra o caixa primeiro.
                </div>
              )}

              {paymentError && (
                <div className="rounded-xl bg-red-50 border border-red-300 p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-red-700 uppercase tracking-wide">Falha no pagamento</p>
                    <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">{paymentError}</p>
                  </div>
                  <button
                    onClick={() => setPaymentError(null)}
                    className="shrink-0 w-5 h-5 rounded grid place-items-center hover:bg-red-100 text-red-400 hover:text-red-600"
                    aria-label="Fechar aviso"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button disabled={!hub.activeSession || totalPaymentValue <= 0 || saving || selectedArIds.length === 0}
                onClick={() => setLiquidationModalOpen(true)}
                className="w-full h-10 rounded-xl bg-slate-950 text-white text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-40">
                <HandCoins className="w-3.5 h-3.5" />
                {saving ? "Processando..." : "Confirmar Liquidação"}
              </button>
            </section>

          </div>

        </div>
      )}

      {liquidationModalOpen && !saving && (
        <LiquidationModal
          driver={selectedDriver}
          vehicle={activeVehicle}
          cashAmount={cashAmount}
          balanceUsed={balanceUsed}
          totalPaymentValue={totalPaymentValue}
          distribution={distribution}
          method={method}
          balanceAfter={balanceAfter}
          selectedDebts={selectedDebts}
          obligationsTotal={obligationsTotal}
          onConfirm={receivePayment}
          onClose={() => setLiquidationModalOpen(false)}
        />
      )}
      {step === "pix_pending" && pendingTransaction && <PixModal amount={pendingTransaction.amount} transaction={pendingTransaction.transactionNumber} saving={saving} onConfirm={confirmPix} onClose={() => setStep("ready")} />}
      {step === "approved" && receipt && <ReceiptModal transaction={receipt} driver={selectedDriver} vehicle={activeVehicle} method={method} remainingDebt={receiptRemainingDebt} credit={receiptCredit} balanceAfter={balanceAfter} onClose={() => { setStep("ready"); setReceipt(null); }} />}
      {cashDrawerOpen && <CashDrawer hub={hub} getCollection={getCollection} currentUser={currentUser} onClose={() => setCashDrawerOpen(false)} />}
      {unclosedWarningOpen && <UnclosedSessionWarning hub={hub} getCollection={getCollection} currentUser={currentUser} onClose={() => setUnclosedWarningOpen(false)} onContinue={() => { setUnclosedWarningOpen(false); setCashDrawerOpen(true); }} />}
      {installmentOpen && <InstallmentModal debts={selectedDebts.length ? selectedDebts : openDebts} driver={selectedDriver} createPaymentPlan={hub.createPaymentPlan} onClose={() => setInstallmentOpen(false)} />}
      {statementOpen && <StatementModal entries={ledger} driver={selectedDriver} onClose={() => setStatementOpen(false)} />}
      <style jsx global>{`.checkout-input{width:100%;height:44px;border:1px solid #e2e8f0;border-radius:.75rem;padding-right:.75rem;background:#fff;outline:none}.checkout-input:focus{border-color:#818cf8;box-shadow:0 0 0 3px #eef2ff}@media print{.receipt-print{position:fixed;inset:0;background:white;z-index:999;padding:32px}.receipt-print button{display:none}}@media print{.session-report{position:fixed;inset:0;background:white;z-index:9999;padding:40px;font-size:12px}.session-report button{display:none}.session-report h1{font-size:20px;margin-bottom:8px}.session-report table{width:100%;border-collapse:collapse;margin-top:12px}.session-report td,.session-report th{padding:6px 8px;border:1px solid #ddd;text-align:left}.session-report .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold;color:white;background:#dc2626}}@media print{.bordero-print{position:fixed;inset:0;background:white;z-index:99999;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0;overflow:visible}.bordero-print button,.bordero-print [role=button]{display:none!important}.bordero-print .overflow-y-auto{overflow:visible!important;max-height:none!important}}`}</style>
    </div>
  );
}

function EmptyCheckout() {
  return <div className="min-h-[480px] rounded-3xl border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center text-center p-8"><div className="w-16 h-16 rounded-2xl bg-indigo-50 grid place-items-center"><UserRound className="w-7 h-7 text-indigo-500" /></div><h2 className="font-geist text-lg font-black text-slate-800 mt-5">Quem está pagando?</h2><p className="text-xs text-slate-500 max-w-sm mt-2">Busque o motorista acima. Os débitos, saldo e últimas movimentações aparecem imediatamente.</p><div className="flex items-center gap-5 mt-6 text-[10px] font-bold text-slate-400"><span>Nome</span><span>CPF</span><span>Placa</span><span>Prefixo</span></div></div>;
}

function QuickButton({ icon: Icon, label, primary, danger, onClick }: any) {
  return <button onClick={onClick} className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold ${primary ? "bg-indigo-600 border-indigo-600 text-white" : danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Icon className="w-3.5 h-3.5" /> {label}</button>;
}

function StatementRow({ entry }: { entry: any }) {
  const credit = Number(entry.amount || 0) >= 0;
  return <div className="p-4 flex items-center gap-3"><span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${credit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{credit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-700 truncate">{entry.description}</p><p className="text-[9px] text-slate-400 mt-0.5">{date(entry.createdAt)}</p></div><strong className={`text-xs ${credit ? "text-emerald-600" : "text-slate-800"}`}>{credit ? "+" : "-"}{money(Math.abs(entry.amount))}</strong></div>;
}

function PixModal({ amount, transaction, saving, onConfirm, onClose }: any) {
  return <Modal onClose={onClose}><div className="text-center"><div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mx-auto"><QrCode className="w-6 h-6" /></div><h2 className="font-geist text-xl font-black mt-4">Pagamento via PIX</h2><p className="text-2xl font-black mt-2">{money(amount)}</p><div className="w-44 h-44 mx-auto my-5 rounded-2xl bg-white border-8 border-slate-950 p-3 grid grid-cols-5 gap-1">{Array.from({ length: 25 }).map((_, index) => <span key={index} className={`${[0,1,2,5,7,10,11,12,14,16,18,20,22,23,24].includes(index) ? "bg-slate-950" : "bg-white"}`} />)}</div><div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600"><Clock3 className="w-4 h-4 animate-pulse" /> Aguardando pagamento...</div><p className="text-[9px] text-slate-400 font-mono mt-2">{transaction}</p><button disabled={saving} onClick={onConfirm} className="w-full h-11 rounded-xl bg-emerald-600 text-white text-xs font-black mt-5 disabled:opacity-50">{saving ? "Confirmando..." : "Simular webhook aprovado"}</button></div></Modal>;
}

function ReceiptModal({ transaction, driver, vehicle, method, remainingDebt, credit, balanceAfter, onClose }: any) {
  const vehicleLabel = vehicle ? `${vehicle.plate || "---"} · ${vehicle.prefix || vehicle.internalCode || "---"}` : "Sem veículo ativo";
  return <Modal onClose={onClose}><div className="receipt-print text-center"><CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" /><h2 className="font-geist text-xl font-black mt-3">Pagamento aprovado</h2><p className="text-3xl font-black mt-3">{money(transaction.amount)}</p><div className="my-5 border-y border-dashed border-slate-300 py-4 text-left space-y-2 text-xs"><p className="flex justify-between"><span className="text-slate-400">Motorista</span><strong>{driver?.name}</strong></p><p className="flex justify-between"><span className="text-slate-400">Veículo</span><strong>{vehicleLabel}</strong></p><p className="flex justify-between"><span className="text-slate-400">Forma</span><strong className="uppercase">{methodLabel(method)}</strong></p><p className="flex justify-between"><span className="text-slate-400">Valor recebido</span><strong>{money(transaction.amount)}</strong></p><p className="flex justify-between"><span className="text-slate-400">Saldo devedor</span><strong>{remainingDebt > 0 ? money(remainingDebt) : "R$ 0,00"}</strong></p><p className="flex justify-between"><span className="text-slate-400">Excesso (Conta Corrente)</span><strong className="text-emerald-600">{credit > 0 ? `+${money(credit)}` : "R$ 0,00"}</strong></p><p className="flex justify-between"><span className="text-slate-400">Saldo Conta Corrente</span><strong>{money(balanceAfter)}</strong></p><p className="flex justify-between"><span className="text-slate-400">Recibo</span><strong className="font-mono">{transaction.transactionNumber}</strong></p><p className="flex justify-between"><span className="text-slate-400">Data</span><strong>{new Date().toLocaleString("pt-BR")}</strong></p></div><button onClick={() => window.print()} className="w-full h-11 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Imprimir recibo</button><button onClick={onClose} className="w-full h-10 text-xs font-bold text-slate-500 mt-1">Concluir atendimento</button></div></Modal>;
}

function LiquidationModal({ driver, vehicle, cashAmount, balanceUsed, totalPaymentValue, distribution, method, balanceAfter, selectedDebts, obligationsTotal, onConfirm, onClose }: any) {
  const [saving, setSaving] = useState(false);
  const vehicleLabel = vehicle ? `${vehicle.plate || "---"} · ${vehicle.prefix || vehicle.internalCode || "---"}` : "Sem veículo ativo";
  const totalAllocated = distribution.reduce((s: number, d: any) => s + d.allocated, 0);
  const remainingDebt = Math.max(0, obligationsTotal - totalPaymentValue);
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative w-full max-w-lg rounded-2xl bg-[#fcfafb] shadow-2xl p-6">
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><ReceiptText className="w-5 h-5" /></div>
          <div>
            <h2 className="font-geist text-lg font-black">Resumo da Liquidação</h2>
            <p className="text-[10px] text-slate-500">Comprovante prévio · verifique antes de confirmar</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-1.5 mb-4">
          <p className="text-[9px] uppercase font-bold text-slate-400">Motorista</p>
          <p className="font-geist font-black">{driver?.name}</p>
          <p className="text-[9px] text-slate-400">{vehicleLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500">Valor recebido</span>
            <strong>{money(cashAmount)}</strong>
          </div>
          {balanceUsed > 0 && (
            <div className="flex justify-between text-[10px]">
              <span className="text-indigo-600">Conta Corrente utilizado</span>
              <strong className="text-indigo-700">{money(balanceUsed)}</strong>
            </div>
          )}
          <div className="flex justify-between text-xs font-black pt-2 border-t border-slate-200">
            <span>Total aplicado</span>
            <span>{money(totalPaymentValue)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-2 mb-4">
          <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Baixas</p>
          {distribution.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                {d.allocated > 0 ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate">{titleLabels[d.titleType]} {date(d.dueDate)}</span>
              </div>
              <span className="font-bold shrink-0 ml-2">
                {d.allocated > 0 ? money(d.allocated) : "—"}
                {d.fullyPaid && <span className="text-emerald-500 ml-0.5">✓</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] bg-emerald-50 rounded-xl px-4 py-2.5 mb-4">
          <span className="font-bold text-emerald-700">Conta Corrente final</span>
          <span className="font-geist font-black text-emerald-700">{money(balanceAfter)}</span>
        </div>

        {remainingDebt > 0 && (
          <div className="flex items-center justify-between text-[10px] bg-amber-50 rounded-xl px-4 py-2.5 mb-4">
            <span className="font-bold text-amber-700">Saldo devedor restante</span>
            <span className="font-geist font-black text-amber-700">{money(remainingDebt)}</span>
          </div>
        )}

        {method === "pix" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[9px] text-amber-800 mb-4">
            <strong className="block text-[10px] font-bold">Pagamento via PIX</strong>
            O QR Code será gerado após a confirmação.
          </div>
        )}
        {method === "account_balance" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[9px] text-emerald-800 mb-4">
            <strong className="block text-[10px] font-bold">Pagamento via saldo em conta</strong>
            Nenhum valor será recebido em caixa. O saldo do motorista será debitado automaticamente.
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button disabled={saving} onClick={async () => { setSaving(true); try { await onConfirm(); } finally { setSaving(false); } }}
            className="flex-1 h-10 rounded-xl bg-slate-950 text-white text-xs font-black hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? "Liquidando..." : "Confirmar Liquidação"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CashDrawer({ hub, getCollection, currentUser, onClose }: any) {
  const [opening, setOpening] = useState("100");
  const [movementType, setMovementType] = useState("WITHDRAWAL");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementDescription, setMovementDescription] = useState("");
  const [showUnclosedWarning, setShowUnclosedWarning] = useState(false);
  const [borderoOpen, setBorderoOpen] = useState(false);
  const sessionMovements = hub.movements.filter((item: any) => item.cashierId === hub.activeSession?.id);
  const receipts = sessionMovements.filter((item: any) => item.type === "RECEIPT").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const withdrawals = sessionMovements.filter((item: any) => item.type === "WITHDRAWAL").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const supplies = sessionMovements.filter((item: any) => item.type === "SUPPLY").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const expected = Number(hub.activeSession?.openingAmount || 0) + receipts + supplies - withdrawals;
  const cashExpected = sessionMovements.filter((item: any) => item.type === "RECEIPT" && item.paymentMethod === "Dinheiro").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const ccTotal = sessionMovements.filter((item: any) => item.type === "RECEIPT" && item.paymentMethod === "Conta Corrente").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const receiptsCount = sessionMovements.filter((item: any) => item.type === "RECEIPT").length;
  const submitMovement = async () => { if (Number(movementAmount) <= 0) return; await hub.requestWithdrawal(Number(movementAmount), movementType, movementDescription); setMovementAmount(""); setMovementDescription(""); };
  const handleOpenClick = async () => {
    if (hub.abandonedSession) {
      setShowUnclosedWarning(true);
    } else {
      await hub.openCashier(Number(opening));
    }
  };
  if (showUnclosedWarning) {
    return <UnclosedSessionWarning hub={hub} getCollection={getCollection} currentUser={currentUser} onClose={onClose} onContinue={async () => { setShowUnclosedWarning(false); await hub.openCashier(Number(opening)); }} />;
  }

  const movementsSection = !hub.activeSession ? (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
      <LockKeyhole className="w-8 h-8 text-red-500 mx-auto" />
      <h3 className="font-geist font-black mt-3">Caixa fechado</h3>
      <p className="text-xs text-slate-500 mt-1">Informe o fundo de troco para iniciar o turno.</p>
      <input type="number" value={opening} onChange={(event) => setOpening(event.target.value)} className="checkout-input mt-5 px-3 text-center font-bold" />
      <button onClick={handleOpenClick} className="w-full h-11 mt-3 rounded-xl bg-emerald-600 text-white text-xs font-black">Abrir caixa</button>
      {hub.abandonedSession && <p className="text-[10px] text-amber-600 font-bold mt-3 flex items-center justify-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Há uma sessão anterior não encerrada</p>}
    </section>
  ) : (
    <>
      <section className="rounded-2xl bg-slate-950 text-white p-5">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" /> Caixa aberto
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Operador: {hub.activeSession.openedByName || hub.activeSession.operatorId}</p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <CashMetric label="Entradas" value={money(receipts + supplies)} positive />
          <CashMetric label="Retiradas" value={money(withdrawals)} />
          <CashMetric label="Fundo inicial" value={money(hub.activeSession.openingAmount)} />
          <CashMetric label="Saldo esperado" value={money(expected)} positive />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-geist text-sm font-black">Movimentações</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Tipo</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="checkout-input px-3">
                <option value="WITHDRAWAL">Sangria (Retirada)</option>
                <option value="SUPPLY">Suprimento (Adicionar)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Valor</label>
              <input type="number" value={movementAmount} onChange={(e) => setMovementAmount(e.target.value)} placeholder="0,00" className="checkout-input px-3" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Descrição</label>
            <input type="text" value={movementDescription} onChange={(e) => setMovementDescription(e.target.value)} placeholder="Ex: Depósito bancário" className="checkout-input px-3" />
          </div>
          <button onClick={submitMovement} className="w-full h-10 rounded-xl bg-indigo-600 text-white text-xs font-bold">Registrar Movimentação</button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h3 className="font-geist text-sm font-black">Bordero de Fechamento</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-[8px] font-bold uppercase text-slate-500">Esperado (Dinheiro)</span>
            <p className="text-base font-black text-slate-900 mt-0.5">{money(cashExpected)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-[8px] font-bold uppercase text-slate-500">Conta Corrente</span>
            <p className="text-base font-black text-indigo-600 mt-0.5">{money(ccTotal)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-[8px] font-bold uppercase text-slate-500">Recebimentos</span>
            <p className="text-base font-black text-slate-900 mt-0.5">{receiptsCount} transações</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-[8px] font-bold uppercase text-slate-500">Saldo esperado</span>
            <p className="text-base font-black text-emerald-600 mt-0.5">{money(expected)}</p>
          </div>
        </div>
        <button onClick={() => setBorderoOpen(true)}
          className="w-full h-11 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center gap-2">
          📋 Gerar Bordero de Fechamento
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-geist text-sm font-black mb-3">Movimentações do turno</h3>
        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {sessionMovements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhuma movimentação.</p>
          ) : (
            sessionMovements.map((mov: any) => (
              <div key={mov.id} className="py-2 flex items-center justify-between text-[11px]">
                <div>
                  <p className="font-bold text-slate-700">{mov.type === "RECEIPT" ? "Recebimento" : mov.type === "WITHDRAWAL" ? "Sangria" : "Suprimento"}</p>
                  <p className="text-[9px] text-slate-400">{mov.description}</p>
                </div>
                <span className={`font-bold ${mov.type === "RECEIPT" || mov.type === "SUPPLY" ? "text-emerald-600" : "text-red-500"}`}>
                  {mov.type === "RECEIPT" || mov.type === "SUPPLY" ? "+" : "-"}{money(mov.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/35 flex justify-end" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="w-full max-w-md h-full bg-[#fcfafb] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between z-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Gestão do turno</p>
            <h2 className="font-geist text-xl font-black mt-1">Caixa</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl grid place-items-center hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {movementsSection}
        </div>
      </aside>
      {borderoOpen && (
        <BorderoChecklist
          activeSession={hub.activeSession}
          sessionMovements={sessionMovements}
          hub={hub}
          onClose={() => setBorderoOpen(false)}
          onConfirmClose={onClose}
        />
      )}
    </div>
  );
}
function BorderoChecklist({ activeSession, sessionMovements, hub, onClose, onConfirmClose }: any) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [physicalCount, setPhysicalCount] = useState("");
  const [justification, setJustification] = useState("");
  const [saving, setSaving] = useState(false);

  const receipts = sessionMovements.filter((m: any) => m.type === "RECEIPT");
  const withdrawals = sessionMovements.filter((m: any) => m.type === "WITHDRAWAL").reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const supplies = sessionMovements.filter((m: any) => m.type === "SUPPLY").reduce((s: number, m: any) => s + Number(m.amount || 0), 0);

  const cashItems = receipts.filter((m: any) => m.paymentMethod === "Dinheiro");
  const pixItems = receipts.filter((m: any) => m.paymentMethod === "Pix");
  const cardItems = receipts.filter((m: any) => m.paymentMethod === "Cartão");
  const transferItems = receipts.filter((m: any) => m.paymentMethod === "Transferência");
  const ccItems = receipts.filter((m: any) => m.paymentMethod === "Conta Corrente");

  const cashExpected = cashItems.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const pixTotal = pixItems.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const cardTotal = cardItems.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const transferTotal = transferItems.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const ccTotal = ccItems.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const digitalTotal = pixTotal + cardTotal + transferTotal;
  const totalReceipts = receipts.reduce((s: number, m: any) => s + Number(m.amount || 0), 0);
  const allCashChecked = cashItems.length > 0 && cashItems.every((m: any) => checkedIds.has(m.id));
  const counted = Number(physicalCount || 0);
  const discrepancy = counted - cashExpected;
  const expected = Number(activeSession?.openingAmount || 0) + totalReceipts + supplies - withdrawals;

  const sessionTxs = (hub.transactions || []).filter((tx: any) => tx.cashierSessionId === activeSession?.id && tx.status === "approved");
  const driversCount = new Set(sessionTxs.map((tx: any) => tx.driverId)).size;
  const avgTicket = receipts.length > 0 ? totalReceipts / receipts.length : 0;

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleClose = async () => {
    if (cashItems.length > 0 && !allCashChecked) return alert("Confira todos os recebimentos em dinheiro antes de encerrar.");
    if (!physicalCount || counted < 0) return alert("Informe o valor contado fisicamente.");
    if (discrepancy !== 0 && !justification.trim()) return alert("Informe uma justificativa para a diferença de caixa.");
    setSaving(true);
    try {
      await hub.closeCashier(activeSession.id, counted, expected, justification);
      onConfirmClose();
    } finally {
      setSaving(false);
    }
  };

  const methodRow = (icon: string, label: string, items: any[], total: number, indent = false, isChecklist = false) => (
    <div className={`${indent ? "ml-2" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
          <span className="text-[9px] text-slate-400 font-bold">{items.length} transações</span>
        </div>
        <strong className={`text-xs ${isChecklist ? "text-slate-900" : ""}`}>{money(total)}</strong>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic py-1.5 pl-1">Nenhuma movimentação.</p>
      ) : (
        <div className="space-y-1">
          {items.map((m: any) => {
            const checked = checkedIds.has(m.id);
            return (
              <div key={m.id} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[10px] ${isChecklist ? "hover:bg-slate-50 cursor-pointer" : ""} ${checked ? "bg-emerald-50 border border-emerald-200" : ""}`}
                onClick={() => isChecklist && toggleCheck(m.id)}>
                {isChecklist && (
                  <div className={`w-4 h-4 rounded border-2 shrink-0 grid place-items-center transition-colors ${checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                    {checked && <Check className="w-3 h-3" />}
                  </div>
                )}
                {!isChecklist && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-800">{money(m.amount)}</span>
                  <span className="text-slate-400 ml-2">{m.description}</span>
                </div>
                {!isChecklist && <span className="text-slate-400 font-mono">{new Date(m.createdAt || m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
                {isChecklist && (
                  <span className={`text-[8px] font-bold uppercase ${checked ? "text-emerald-600" : "text-slate-400"}`}>
                    {checked ? "Conferido" : "Pendente"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/50 backdrop-blur-sm grid place-items-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bordero-print w-full max-w-2xl max-h-[90vh] bg-[#fcfafb] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Bordero de Fechamento</p>
            <h2 className="font-geist text-xl font-black mt-0.5">Conciliação do Turno</h2>
            <p className="text-[10px] text-slate-500 mt-1">
              Operador: <strong>{activeSession?.openedByName || "—"}</strong>
              <span className="mx-2">·</span>
              Abertura: {activeSession?.openedAt ? new Date(activeSession.openedAt).toLocaleString("pt-BR") : "—"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-900 text-white rounded-xl p-3.5">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Recebimentos</p>
              <p className="text-lg font-black mt-1">{receipts.length}</p>
              <p className="text-[9px] text-slate-400">{driversCount} motoristas</p>
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-3.5">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Médio por tx</p>
              <p className="text-lg font-black mt-1">{money(avgTicket)}</p>
              <p className="text-[9px] text-slate-400">{totalReceipts > 0 ? "valor médio" : "—"}</p>
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-3.5">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Fundo inicial</p>
              <p className="text-lg font-black mt-1">{money(activeSession?.openingAmount || 0)}</p>
              <p className="text-[9px] text-slate-400">+ supr. {money(supplies)}</p>
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-3.5">
              <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Saldo esperado</p>
              <p className="text-lg font-black mt-1 text-emerald-400">{money(expected)}</p>
              <p className="text-[9px] text-slate-400">- sangr. {money(withdrawals)}</p>
            </div>
          </div>

          {/* Method breakdown cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-amber-800">{money(cashExpected)}</p>
              <p className="text-[8px] font-bold uppercase text-amber-600 mt-0.5">💵 Dinheiro</p>
              <p className="text-[8px] text-amber-500">{cashItems.length} transações</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-indigo-800">{money(pixTotal)}</p>
              <p className="text-[8px] font-bold uppercase text-indigo-600 mt-0.5">💳 PIX</p>
              <p className="text-[8px] text-indigo-500">{pixItems.length} transações</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-sky-800">{money(cardTotal)}</p>
              <p className="text-[8px] font-bold uppercase text-sky-600 mt-0.5">💳 Cartão</p>
              <p className="text-[8px] text-sky-500">{cardItems.length} transações</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-violet-800">{money(ccTotal)}</p>
              <p className="text-[8px] font-bold uppercase text-violet-600 mt-0.5">🏦 C. Corrente</p>
              <p className="text-[8px] text-violet-500">{ccItems.length} transações</p>
            </div>
          </div>

          {/* Cash checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">💵</span>
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">Dinheiro — confira o valor físico no caixa</span>
              {cashItems.length > 0 && (
                <span className={`ml-auto text-[8px] font-bold uppercase ${allCashChecked ? "text-emerald-600" : "text-amber-600"}`}>
                  {checkedIds.size} de {cashItems.length} conferidos
                </span>
              )}
            </div>
            {methodRow("", "", cashItems, cashExpected, false, true)}
          </div>

          {/* Digital: PIX + Cartão + Transferência */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💳</span>
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">Recebimentos Digitais — confira nos aplicativos</span>
              <strong className="ml-auto text-xs">{money(digitalTotal)}</strong>
            </div>
            {pixItems.length > 0 && <div>{methodRow("", "PIX", pixItems, pixTotal, false)}</div>}
            {cardItems.length > 0 && <div>{methodRow("", "Cartão", cardItems, cardTotal, false)}</div>}
            {transferItems.length > 0 && <div>{methodRow("", "Transferência", transferItems, transferTotal, false)}</div>}
            {digitalTotal === 0 && <p className="text-[10px] text-slate-400 italic">Nenhum recebimento digital neste turno.</p>}
          </div>

          {/* Conta Corrente */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏦</span>
              <span className="text-[9px] font-black uppercase tracking-wide text-violet-600">Conta Corrente — sem movimentação física</span>
              <strong className="ml-auto text-xs text-violet-700">{money(ccTotal)}</strong>
            </div>
            <div className="bg-white/60 rounded-lg px-3 py-2 text-[9px] text-violet-700 font-bold flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              ⚠️ Estes valores foram quitados utilizando saldo em conta corrente. Não há dinheiro físico correspondente no caixa.
            </div>
            {ccItems.length > 0 ? (
              <div className="space-y-1">
                {ccItems.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/40 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
                    <span className="font-semibold text-violet-900">{money(m.amount)}</span>
                    <span className="text-violet-500 ml-1">{m.description}</span>
                    <span className="ml-auto text-violet-400 font-mono">{new Date(m.createdAt || m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-violet-400 italic">Nenhuma movimentação por Conta Corrente.</p>
            )}
          </div>

          {/* Physical count + discrepancy */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="font-geist text-sm font-black flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white grid place-items-center text-xs font-black">#</span>
              Contagem Física do Caixa
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Valor contado fisicamente</label>
                <input type="number" value={physicalCount} onChange={(e) => setPhysicalCount(e.target.value)} placeholder="0,00" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400" />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[8px] font-bold uppercase text-slate-500">Total esperado em dinheiro</span>
                <strong className="text-lg font-black text-slate-900">{money(cashExpected)}</strong>
              </div>
            </div>
            {physicalCount && counted >= 0 && (
              <div className={`rounded-xl p-3 ${discrepancy === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">{discrepancy === 0 ? "✅ Sem divergência" : "❌ Divergência detectada"}</span>
                  <strong className={`text-sm ${discrepancy === 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {discrepancy >= 0 ? "+" : ""}{money(discrepancy)}
                  </strong>
                </div>
                {discrepancy !== 0 && (
                  <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Justificativa obrigatória para a diferença" className="w-full mt-2 p-2.5 border border-red-200 rounded-lg text-xs outline-none resize-none" rows={2} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center gap-3">
          <button onClick={() => window.print()} className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir Bordero
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
            Voltar
          </button>
          <button disabled={saving} onClick={handleClose} className="h-10 px-6 rounded-xl bg-red-600 text-white text-xs font-black disabled:opacity-40 flex items-center gap-2">
            {saving ? "Encerrando..." : "🔒 Encerrar Turno"}
          </button>
        </div>
      </div>
    </div>
  );
}
function CashMetric({ label, value, positive }: any) { return <div className="rounded-xl bg-white/5 p-3"><p className="text-[9px] uppercase text-slate-400 font-bold">{label}</p><p className={`text-sm font-black mt-1 ${positive ? "text-emerald-400" : "text-white"}`}>{value}</p></div>; }

function UnclosedSessionWarning({ hub, getCollection, currentUser, onClose, onContinue }: any) {
  const session = hub.abandonedSession;
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorFound, setSupervisorFound] = useState<any>(null);
  const [step, setStep] = useState<"warning" | "assume" | "success">("warning");
  const [users, setUsers] = useState<any[]>([]);

  const hoursOpen = session ? Math.round((Date.now() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60)) : 0;

  useEffect(() => {
    if (supervisorSearch.length < 3) { setSupervisorFound(null); return; }
    const found = users.filter((u: any) => {
      const hasPin = u.supervisorPin && u.supervisorPin.length > 0;
      const nameMatch = u.displayName?.toLowerCase().includes(supervisorSearch.toLowerCase());
      const emailMatch = u.email?.toLowerCase().includes(supervisorSearch.toLowerCase());
      return hasPin && (nameMatch || emailMatch);
    });
    if (found.length === 1) setSupervisorFound(found[0]);
    else setSupervisorFound(null);
  }, [supervisorSearch, users]);

  useEffect(() => {
    getCollection("user_profiles").then(setUsers).catch(() => {});
  }, []);

  const handleAssumeClosure = async () => {
    if (!supervisorFound) { setError("Supervisor não encontrado. Verifique o nome ou email."); return; }
    if (!supervisorPin) { setError("Informe o PIN de autorização do supervisor."); return; }
    if (supervisorPin !== supervisorFound.supervisorPin) { setError("PIN inválido."); return; }
    setSaving(true);
    setError("");
    try {
      const success = await hub.forceCloseSession(session.id, supervisorFound.uid, supervisorFound.displayName);
      if (success) {
        setStep("success");
      } else {
        setError("Erro ao processar fechamento forçado.");
      }
    } catch (e) {
      setError("Erro ao processar fechamento forçado.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  if (step === "success") {
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-geist text-lg font-black mt-4">Ocorrência Criada</h2>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mt-4 text-left text-[11px] space-y-1">
            <p className="flex justify-between"><span className="text-slate-500">Tipo:</span><strong className="text-red-700">Procedimento não executado</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Categoria:</span><strong>Caixa</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Severidade:</span><strong>Média</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Risco:</span><strong className="text-red-700">Alto</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Responsável:</span><strong>{session.openedByName}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Fechado por:</span><strong>{currentUser?.displayName}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Autorizado por:</span><strong>{supervisorFound?.displayName}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Advertência:</span><strong className="text-red-600">Emitida</strong></p>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handlePrint} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50"><Printer className="w-3.5 h-3.5" /> Imprimir</button>
            <button onClick={onContinue} className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700">Abrir novo caixa</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <div className="session-report" style={{ display: 'none' }}>
        <h1>Relatório de Sessão - Caixa Não Encerrado</h1>
        <p>Gerado em: {new Date().toLocaleString("pt-BR")}</p>
        <table>
          <tr><th>Campo</th><th>Valor</th></tr>
          <tr><td>Operador</td><td>{session?.openedByName}</td></tr>
          <tr><td>Abertura</td><td>{new Date(session?.openedAt).toLocaleString("pt-BR")}</td></tr>
          <tr><td>Tempo em aberto</td><td>{hoursOpen}h</td></tr>
          <tr><td>Status</td><td><span className="badge">ABANDONADA</span></td></tr>
          <tr><td>Valor inicial</td><td>{money(session?.openingAmount)}</td></tr>
          <tr><td>Quem fechou</td><td>{currentUser?.displayName}</td></tr>
          <tr><td>Autorizado por</td><td>{supervisorFound?.displayName || "—"}</td></tr>
          <tr><td>Tipo de fechamento</td><td>Forçado (sessão abandonada)</td></tr>
          <tr><td>Ocorrência</td><td>ADVERTÊNCIA REGISTRADA</td></tr>
        </table>
        <p style={{ marginTop: 16, fontSize: 10, color: '#666' }}>Este relatório é um documento de compliance interno.</p>
      </div>
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-geist text-lg font-black mt-4">Caixa anterior não encerrado</h2>
          <p className="text-[11px] text-slate-500 mt-1">O operador anterior não finalizou o turno. Gere uma ocorrência disciplinar.</p>

          <div className="bg-slate-50 rounded-xl p-4 mt-5 text-left text-[11px] space-y-2 border border-slate-200">
            <p className="flex justify-between"><span className="text-slate-500">Operador:</span><strong>{session?.openedByName}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Abertura:</span><strong>{new Date(session?.openedAt).toLocaleString("pt-BR")}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Tempo em aberto:</span><strong className="text-amber-600">{hoursOpen}h</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Valor inicial:</span><strong>{money(session?.openingAmount)}</strong></p>
            <p className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500">Reincidência do operador:</span><strong className="text-red-600">{hub.getEmployeeOccurrences?.(session?.openedBy)?.length || 0} ocorrência(s)</strong></p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 text-[10px] text-amber-800 text-left flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Ao assumir, uma <strong>ocorrência disciplinar</strong> será registrada contra <strong>{session?.openedByName}</strong> e uma <strong>advertência</strong> será emitida.</span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="text-left">
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Supervisor responsável</label>
              <input type="text" placeholder="Digite o nome ou email do supervisor" value={supervisorSearch} onChange={(e) => setSupervisorSearch(e.target.value)} className="checkout-input px-3" />
              {supervisorFound && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ {supervisorFound.displayName} ({supervisorFound.email})</p>}
            </div>
            <div className="text-left">
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">PIN de autorização</label>
              <input type="password" maxLength={4} placeholder="• • • •" value={supervisorPin} onChange={(e) => setSupervisorPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="checkout-input px-3 text-center tracking-[8px] font-bold text-lg" />
            </div>
            {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handlePrint} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50"><Printer className="w-3.5 h-3.5" /> Imprimir relatório</button>
            <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50">Cancelar</button>
          </div>
          <button disabled={saving || !supervisorFound || !supervisorPin} onClick={handleAssumeClosure} className="w-full h-11 rounded-xl bg-amber-600 text-white text-xs font-black mt-3 flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-amber-700">
            {saving ? "Processando..." : "Assumir Fechamento"}
          </button>
        </div>
      </Modal>
    </>
  );
}

function InstallmentModal({ debts, driver, createPaymentPlan, onClose }: any) {
  const total = debts.reduce((sum: number, item: AccountsReceivable) => sum + item.amount - item.paidAmount, 0);
  const [entry, setEntry] = useState("0");
  const [installments, setInstallments] = useState("6");
  const [saving, setSaving] = useState(false);
  const installmentValue = (total - Number(entry || 0)) / Math.max(1, Number(installments || 1));
  const submit = async () => { setSaving(true); try { await createPaymentPlan(driver.id, debts.map((item: any) => item.id), total, Number(entry || 0), Number(installments)); onClose(); } finally { setSaving(false); } };
  return <Modal onClose={onClose}><CalendarDays className="w-7 h-7 text-indigo-600" /><h2 className="font-geist text-xl font-black mt-3">Gerar acordo</h2><p className="text-xs text-slate-500 mt-1">Parcelamento para {driver.name}</p><div className="rounded-2xl bg-slate-950 text-white p-4 mt-5"><p className="text-[9px] uppercase font-bold text-slate-400">Dívida total</p><p className="text-3xl font-black mt-1">{money(total)}</p></div><label className="block mt-4"><span className="text-[9px] font-black uppercase text-slate-400">Entrada hoje</span><input type="number" min="0" max={total} value={entry} onChange={(event) => setEntry(event.target.value)} className="checkout-input px-3 mt-1.5" /></label><label className="block mt-3"><span className="text-[9px] font-black uppercase text-slate-400">Parcelas</span><select value={installments} onChange={(event) => setInstallments(event.target.value)} className="checkout-input px-3 mt-1.5">{[2,3,4,5,6,8,10,12].map((count) => <option key={count} value={count}>{count}x</option>)}</select></label><div className="rounded-xl bg-indigo-50 text-indigo-800 p-4 mt-4 flex justify-between text-xs"><span>{installments} parcelas</span><strong>{money(installmentValue)}</strong></div><button disabled={saving || total <= 0} onClick={submit} className="w-full h-11 rounded-xl bg-indigo-600 text-white text-xs font-black mt-4 disabled:opacity-40">{saving ? "Gerando acordo..." : "Gerar acordo"}</button></Modal>;
}

function StatementModal({ entries, driver, onClose }: any) { return <Modal onClose={onClose} wide><div className="flex items-center justify-between"><div><h2 className="font-geist text-xl font-black">Conta corrente</h2><p className="text-xs text-slate-500 mt-1">{driver.name}</p></div><ReceiptText className="w-7 h-7 text-indigo-500" /></div><div className="mt-5 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">{entries.map((entry: any) => <StatementRow key={entry.id} entry={entry} />)}</div></Modal>; }

function Modal({ onClose, children, wide = false }: any) { return <div className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className={`relative w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-2xl bg-[#fcfafb] shadow-2xl p-6`}><button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100"><X className="w-4 h-4" /></button>{children}</div></div>; }
