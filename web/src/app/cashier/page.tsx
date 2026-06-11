"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  computeContractDailies,
  resolveProfile,
  resolveRule,
  type DailyItem,
  type DailyProfile,
  type BillingRule,
} from "@/lib/billingEngine";
import { 
  Lock, 
  Unlock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  CheckCircle, 
  X, 
  User, 
  CreditCard, 
  AlertCircle,
  FileText,
  CalendarOff,
  CalendarCheck
} from "lucide-react";

interface DriverLedger {
  id: string;
  driverId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function CashierManager() {
  const { currentUser, getCollection, addDocument, updateDocument, can } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [billingRules, setBillingRules] = useState<any[]>([]);
  const [businessCalendar, setBusinessCalendar] = useState<any[]>([]);
  const [billingSuspensions, setBillingSuspensions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  type PendingBilling = {
    contract: any;
    profile: DailyProfile;
    rule: BillingRule;
    items: DailyItem[];        // pending only (already-charged dates filtered out)
    chargedCount: number;
    exemptCount: number;
    pendingAmount: number;
    fromDate: string;
    toDate: string;
  };
  const [pendingBilling, setPendingBilling] = useState<PendingBilling | null>(null);

  // Forms
  const [openingAmount, setOpeningAmount] = useState("");
  
  // 3-Click Payment Form
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driverBalance, setDriverBalance] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  
  // Skimming Form
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("WITHDRAWAL");
  const [withdrawalDesc, setWithdrawalDesc] = useState("");

  // Closing Form
  const [physicalCount, setPhysicalCount] = useState("");

  // Modals / Overlay
  const [receiptToShow, setReceiptToShow] = useState<any | null>(null);
  const [borderoToShow, setBorderoToShow] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessions, drvList, ledList, movList, conList, profList, brList, bcList, bsList] = await Promise.all([
        getCollection("cashier_sessions"),
        getCollection("drivers"),
        getCollection("driver_ledger"),
        getCollection("cashier_movements"),
        getCollection("contracts"),
        getCollection("daily_rate_profiles"),
        getCollection("billing_rules"),
        getCollection("business_calendar"),
        getCollection("billing_suspensions"),
      ]);

      setDrivers(drvList);
      setLedger(ledList);
      setContracts(conList);
      setProfiles(profList);
      setBillingRules(brList);
      setBusinessCalendar(bcList);
      setBillingSuspensions(bsList);

      // Find if there is an open session for today/operator
      const openSession = sessions.find(s => s.status === "open");
      if (openSession) {
        setActiveSession(openSession);
        // Load movements for this session
        const sessionMovements = movList.filter(m => m.cashierId === openSession.id);
        setMovements(sessionMovements);
      } else {
        setActiveSession(null);
        setMovements([]);
      }

      if (drvList.length > 0 && !selectedDriverId) {
        setSelectedDriverId(drvList[0].id);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do caixa", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recompute balance + pending dailies whenever the selected driver or any
  // engine input changes. Materialization happens only on payment submit.
  useEffect(() => {
    if (!selectedDriverId) {
      setDriverBalance(0);
      setPendingBilling(null);
      setReceiveAmount("0");
      return;
    }

    const driverEntries = ledger.filter(entry => entry.driverId === selectedDriverId);
    const balance = driverEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    setDriverBalance(balance);

    const contract = contracts.find(c => c.driverId === selectedDriverId && c.status === "Ativo");
    let pendingAmount = 0;

    if (contract) {
      const profile = resolveProfile(contract, profiles);
      const rule = resolveRule(contract, profile, billingRules);
      const today = new Date().toISOString().split("T")[0];
      const fromDate = contract.startDate || today;

      const result = computeContractDailies({
        contract,
        profile,
        rule,
        calendar: businessCalendar,
        suspensions: billingSuspensions,
        fromDate,
        toDate: today,
      });

      // Idempotency: filter out days already materialized in the ledger.
      const chargedSet = new Set(
        ledger
          .filter(e => e.driverId === selectedDriverId && e.type === "daily" && e.contractId === contract.id)
          .map(e => e.referenceDate)
          .filter(Boolean)
      );
      const pendingItems = result.items.filter(i => !chargedSet.has(i.date));
      const pendingCharged = pendingItems.filter(i => i.isCharged);
      pendingAmount = pendingCharged.reduce((s, i) => s + i.rate, 0);

      setPendingBilling({
        contract,
        profile,
        rule,
        items: pendingItems,
        chargedCount: pendingCharged.length,
        exemptCount: pendingItems.length - pendingCharged.length,
        pendingAmount,
        fromDate,
        toDate: today,
      });
    } else {
      setPendingBilling(null);
    }

    // Pre-fill: total devido = saldo devedor (se ledger negativo) + pendências ainda não materializadas
    const totalOwed = pendingAmount + Math.max(0, -balance);
    setReceiveAmount(totalOwed > 0 ? totalOwed.toFixed(2) : "0");
  }, [selectedDriverId, ledger, contracts, profiles, billingRules, businessCalendar, billingSuspensions]);

  // Open cashier
  const handleOpenCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const initialAmt = Number(openingAmount) || 0;
      const newSession = await addDocument("cashier_sessions", {
        operatorId: currentUser?.displayName || "Operador",
        openedAt: new Date().toISOString(),
        closedAt: null,
        openingAmount: initialAmt,
        closingAmount: 0,
        difference: 0,
        status: "open"
      });
      setOpeningAmount("");
      loadData();
    } catch (e) {
      console.error("Erro ao abrir caixa", e);
    }
  };

  // 3-Click Receive Payment
  const handleReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !selectedDriverId) return;

    try {
      const value = Number(receiveAmount);
      if (value <= 0) {
        alert("Insira um valor maior que zero.");
        return;
      }

      const driverObj = drivers.find(d => d.id === selectedDriverId);
      const driverName = driverObj ? driverObj.name : "Motorista";

      // 0. Materialize pending dailies as ledger entries (idempotent — pendingBilling
      //    was already filtered against existing referenceDates).
      let materializedCount = 0;
      let materializedTotal = 0;
      if (pendingBilling) {
        for (const item of pendingBilling.items) {
          if (!item.isCharged) continue;
          await addDocument("driver_ledger", {
            driverId: selectedDriverId,
            contractId: pendingBilling.contract.id,
            referenceDate: item.date,
            type: "daily",
            amount: -item.rate,
            description: `Diária ${item.date} (${item.dayOfWeek}) — ${pendingBilling.profile.name}`,
          });
          materializedCount++;
          materializedTotal += item.rate;
        }
      }

      // 1. Create cashier movement
      const movement = await addDocument("cashier_movements", {
        cashierId: activeSession.id,
        type: "RECEIPT",
        amount: value,
        paymentMethod: paymentMethod,
        description: materializedCount > 0
          ? `Recebimento de ${materializedCount} diária(s) + ajuste — ${driverName}`
          : `Recebimento — ${driverName}`,
      });

      // 2. Update driver ledger (Credit entry — the actual payment)
      await addDocument("driver_ledger", {
        driverId: selectedDriverId,
        type: "payment",
        amount: value,
        description: `Recebimento Caixa (${paymentMethod})`,
      });

      // Show receipt popup
      setReceiptToShow({
        driverName,
        value,
        paymentMethod,
        operator: activeSession.operatorId,
        date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR"),
        id: movement.id
      });

      // Reload
      loadData();
    } catch (e) {
      console.error("Erro ao receber diária", e);
    }
  };

  // Withdraw / Skimming (Sangria)
  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    try {
      const value = Number(withdrawalAmount);
      if (value <= 0) {
        alert("Insira um valor de retirada válido.");
        return;
      }

      await addDocument("cashier_movements", {
        cashierId: activeSession.id,
        type: withdrawalType,
        amount: value,
        paymentMethod: "Dinheiro",
        description: withdrawalDesc || "Sangria operacional"
      });

      setWithdrawalAmount("");
      setWithdrawalDesc("");
      loadData();
      alert("Retirada registrada com sucesso!");
    } catch (e) {
      console.error("Erro ao realizar sangria", e);
    }
  };

  // Close Cashier
  const handleCloseCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    try {
      const physicalCountAmt = Number(physicalCount);
      const expectedBalance = getExpectedBalance();
      const difference = physicalCountAmt - expectedBalance;

      // Close cashier session
      const updatedSession = {
        ...activeSession,
        closedAt: new Date().toISOString(),
        closingAmount: physicalCountAmt,
        difference: difference,
        status: "closed"
      };

      await updateDocument("cashier_sessions", activeSession.id, updatedSession);

      // Create Bordero Data for the Receipt Modal
      const pixTotal = movements.filter(m => m.paymentMethod === "Pix" && m.type === "RECEIPT").reduce((s, m) => s + m.amount, 0);
      const cardTotal = movements.filter(m => m.paymentMethod === "Cartão" && m.type === "RECEIPT").reduce((s, m) => s + m.amount, 0);
      const cashReceipts = movements.filter(m => m.paymentMethod === "Dinheiro" && m.type === "RECEIPT").reduce((s, m) => s + m.amount, 0);
      const transferTotal = movements.filter(m => m.paymentMethod === "Transferência" && m.type === "RECEIPT").reduce((s, m) => s + m.amount, 0);
      
      const withdrawals = movements.filter(m => m.type !== "RECEIPT").reduce((s, m) => s + m.amount, 0);

      setBorderoToShow({
        operator: activeSession.operatorId,
        openedAt: new Date(activeSession.openedAt).toLocaleString("pt-BR"),
        closedAt: new Date().toLocaleString("pt-BR"),
        openingAmount: activeSession.openingAmount,
        totalPix: pixTotal,
        totalCard: cardTotal,
        totalCash: cashReceipts,
        totalTransfer: transferTotal,
        totalWithdrawals: withdrawals,
        expectedBalance,
        physicalCount: physicalCountAmt,
        difference,
        movements: [...movements]
      });

      setPhysicalCount("");
      setActiveSession(null);
      loadData();
    } catch (e) {
      console.error("Erro ao fechar caixa", e);
    }
  };

  // Calculate expected cashier balance dynamically
  const getExpectedBalance = () => {
    if (!activeSession) return 0;
    const opening = Number(activeSession.openingAmount || 0);
    const receipts = movements.filter(m => m.type === "RECEIPT").reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const withdrawals = movements.filter(m => m.type !== "RECEIPT").reduce((sum, m) => sum + Number(m.amount || 0), 0);
    return opening + receipts - withdrawals;
  };

  const expectedBalance = getExpectedBalance();

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:bg-white print:text-black">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs print:hidden">
        <span className="hover:text-primary cursor-pointer">Financeiro</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Frente de Caixa</span>
      </nav>

      {/* Header */}
      <div className="border-b border-outline-variant pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist">
            Operação de Caixa
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Receba diárias de motoristas em tempo real, registre sangrias e faça fechamentos com borderôs automatizados.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs">Carregando fluxo de caixa...</p>
        </div>
      ) : !activeSession ? (
        /* CLOSED CASHIER PANEL */
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant p-8 rounded-xl text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary font-geist">Caixa Fechado</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              O caixa atual está fechado. Para receber valores ou lançar sangrias, insira o saldo de abertura e inicie o turno.
            </p>
          </div>

          <form onSubmit={handleOpenCashier} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                Fundo de Caixa Inicial (Abertura R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-outline">R$</span>
                <input
                  type="number"
                  required
                  placeholder="0,00"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>
            </div>

            {can("cashier.open") ? (
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs flex items-center justify-center space-x-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Abrir Caixa Operacional</span>
              </button>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Você não tem permissão para abrir o caixa.</span>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* OPEN CASHIER OPERATIONAL GRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {/* Main Actions Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operator info and general KPIs */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <Unlock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Operador Ativo</p>
                  <p className="text-xs font-bold text-primary">{activeSession.operatorId}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-outline uppercase font-bold">Aberto em</p>
                <p className="text-xs font-semibold text-on-surface-variant">
                  {new Date(activeSession.openedAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })} ({new Date(activeSession.openedAt).toLocaleDateString("pt-BR")})
                </p>
              </div>

              <div>
                <p className="text-[10px] text-outline uppercase font-bold">Saldo de Caixa Esperado</p>
                <p className="text-lg font-black text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedBalance)}
                </p>
              </div>
            </div>

            {/* PENDING DAILIES PANEL */}
            {selectedDriverId && pendingBilling && (
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider font-geist flex items-center space-x-2">
                    <CalendarCheck className="w-5 h-5 text-amber-500" />
                    <span>Pendências de Diária</span>
                  </h2>
                  <span className="text-[10px] font-semibold text-outline">
                    Período: {pendingBilling.fromDate} → {pendingBilling.toDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3">
                    <p className="text-[10px] text-outline uppercase font-bold mb-0.5">Contrato / Tarifa</p>
                    <p className="font-bold text-on-surface">{pendingBilling.profile.name}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      R$ {Number(pendingBilling.profile.amount).toFixed(2)} / diária
                    </p>
                    {pendingBilling.contract.billingRuleNameSnapshot && (
                      <p className="text-[10px] text-on-surface-variant mt-1 italic">
                        {pendingBilling.contract.billingRuleNameSnapshot}
                      </p>
                    )}
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-emerald-700 uppercase font-bold mb-0.5">A Cobrar</p>
                    <p className="text-2xl font-black text-emerald-600">{pendingBilling.chargedCount}</p>
                    <p className="text-[10px] text-emerald-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingBilling.pendingAmount)}
                    </p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-amber-700 uppercase font-bold mb-0.5">Isentas no período</p>
                    <p className="text-2xl font-black text-amber-600">{pendingBilling.exemptCount}</p>
                    <p className="text-[10px] text-amber-700">fim de semana / feriado / suspensão</p>
                  </div>
                </div>

                {pendingBilling.items.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold text-primary hover:underline">
                      Ver detalhamento dia a dia ({pendingBilling.items.length} dias)
                    </summary>
                    <div className="mt-3 max-h-48 overflow-y-auto border border-outline-variant rounded-lg">
                      <table className="w-full text-[11px]">
                        <thead className="bg-surface-container-low text-outline sticky top-0">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-semibold">Data</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Dia</th>
                            <th className="px-3 py-1.5 text-left font-semibold">Status</th>
                            <th className="px-3 py-1.5 text-right font-semibold">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingBilling.items.map((it, idx) => (
                            <tr key={idx} className="border-t border-outline-variant/40">
                              <td className="px-3 py-1.5 font-mono">{it.date}</td>
                              <td className="px-3 py-1.5">{it.dayOfWeek}</td>
                              <td className={`px-3 py-1.5 ${it.isCharged ? "text-emerald-600 font-semibold" : "text-amber-600"}`}>
                                {it.reason}
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono">
                                {it.isCharged ? `R$ ${it.rate.toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}

                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <div className="text-xs">
                    <p className="text-[10px] text-outline uppercase font-bold">Total Devido</p>
                    <p className="text-[10px] text-on-surface-variant">
                      Diárias pendentes
                      {driverBalance < 0 && ` + saldo devedor (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(driverBalance))})`}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      pendingBilling.pendingAmount + Math.max(0, -driverBalance)
                    )}
                  </p>
                </div>
              </div>
            )}

            {selectedDriverId && !pendingBilling && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 flex items-center gap-2">
                <CalendarOff className="w-4 h-4" />
                <span>Motorista sem contrato ativo. Apenas o saldo do livro-razão será considerado.</span>
              </div>
            )}

            {/* FAST 3-CLICK RECEIPT WIDGET */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-6">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider font-geist flex items-center space-x-2 border-b border-outline-variant pb-3">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Recebimento de Diária Rápido</span>
              </h2>

              <form onSubmit={handleReceivePayment} className="grid grid-cols-1 sm:grid-cols-12 gap-gutter items-end">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Motorista
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Saldo Atual
                  </label>
                  <div className={`px-2 py-2.5 rounded-lg border text-center font-bold text-xs ${
                    driverBalance >= 0 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  }`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(driverBalance)}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Valor a Receber (R$)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0,00"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Meio
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>

                <div className="sm:col-span-12">
                  {can("cashier.receive") ? (
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Recebimento & Gerar Recibo</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>Sem permissão para receber diárias.</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* CASHIER MOVEMENTS SUMMARY */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline-variant bg-slate-50 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">Histórico de Lançamentos do Turno</h3>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-2.5 font-semibold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-2.5 font-semibold text-on-surface-variant uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-2.5 font-semibold text-on-surface-variant uppercase tracking-wider">Forma</th>
                      <th className="px-6 py-2.5 font-semibold text-on-surface-variant uppercase tracking-wider">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-outline italic">Nenhum lançamento registrado neste turno.</td>
                      </tr>
                    ) : (
                      movements.slice().reverse().map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              m.type === "RECEIPT"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                            }`}>
                              {m.type === "RECEIPT" ? "Entrada" : m.type === "WITHDRAWAL" ? "Sangria" : m.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-medium text-primary">{m.description}</td>
                          <td className="px-6 py-3 text-on-surface-variant">{m.paymentMethod}</td>
                          <td className="px-6 py-3 font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Forms Column (Skimming & Closing) */}
          <div className="space-y-6">
            {/* SANGRIAS / RETIRADAS */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline border-b border-outline-variant pb-2 flex items-center space-x-2">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span>Registrar Sangria / Retirada</span>
              </h3>

              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Valor da Retirada</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-outline">R$</span>
                    <input
                      type="number"
                      required
                      placeholder="0,00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Tipo de Saída</label>
                  <select
                    value={withdrawalType}
                    onChange={(e) => setWithdrawalType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  >
                    <option value="WITHDRAWAL">Sangria (Dinheiro Físico)</option>
                    <option value="TRANSFER">Transferência para Conta</option>
                    <option value="ADJUSTMENT">Ajuste de Saldo Negativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Descrição/Destino</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Depósito boca de caixa"
                    value={withdrawalDesc}
                    onChange={(e) => setWithdrawalDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                </div>

                {can("cashier.withdraw") ? (
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Lançar Retirada</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold text-center">
                    Sem permissão para lançar sangria.
                  </div>
                )}
              </form>
            </div>

            {/* FECHAMENTO DE CAIXA */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline border-b border-outline-variant pb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Fechamento do Caixa</span>
              </h3>

              <form onSubmit={handleCloseCashier} className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 border border-outline-variant/40">
                  <div className="flex justify-between">
                    <span className="text-outline font-semibold">Abertura:</span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeSession.openingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline font-semibold">Total Lançado (Líquido):</span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedBalance - activeSession.openingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-outline-variant/60 pt-2 text-sm">
                    <span className="text-primary font-bold">Saldo Esperado:</span>
                    <span className="font-black text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedBalance)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                    Saldo Físico Contado (Dinheiro/Contas)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-outline">R$</span>
                    <input
                      type="number"
                      required
                      placeholder="0,00"
                      value={physicalCount}
                      onChange={(e) => setPhysicalCount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    />
                  </div>
                </div>

                {can("cashier.close") ? (
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Fechar Caixa & Gerar Borderô</span>
                  </button>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold text-center">
                    Sem permissão para fechar o caixa.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT POPUP MODAL */}
      {receiptToShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-background border border-outline-variant rounded-xl p-6 relative shadow-2xl space-y-4 print:p-0 print:border-none print:shadow-none">
            {/* Modal Close Button (Hidden on Print) */}
            <button
              onClick={() => setReceiptToShow(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Recibo Printable Container */}
            <div className="text-center space-y-4 border border-outline-variant p-4 rounded-xl print:border-none">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary font-geist">Recibo de Recebimento</h2>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div className="text-xs space-y-2 text-left bg-slate-50 p-3 rounded-lg">
                <p><span className="text-outline font-semibold">Motorista:</span> <span className="font-bold text-primary">{receiptToShow.driverName}</span></p>
                <p><span className="text-outline font-semibold">Valor Recebido:</span> <span className="font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receiptToShow.value)}</span></p>
                <p><span className="text-outline font-semibold">Forma de Pago:</span> <span className="font-semibold text-primary">{receiptToShow.paymentMethod}</span></p>
                <p><span className="text-outline font-semibold">Operador:</span> <span className="text-on-surface-variant font-medium">{receiptToShow.operator}</span></p>
                <p><span className="text-outline font-semibold">Data/Hora:</span> <span className="text-on-surface-variant font-mono">{receiptToShow.date}</span></p>
              </div>

              <p className="text-[10px] text-outline leading-relaxed italic">Comprovante gerado digitalmente pela plataforma FleetOS.</p>
            </div>

            {/* Print Button (Hidden on Print) */}
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center space-x-1.5 print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Via Motorista</span>
            </button>
          </div>
        </div>
      )}

      {/* BORDERÔ POPUP MODAL */}
      {borderoToShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background border border-outline-variant rounded-xl p-6 relative shadow-2xl space-y-4 print:p-0 print:border-none print:shadow-none">
            {/* Close Button (Hidden on print) */}
            <button
              onClick={() => setBorderoToShow(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bordero printable container */}
            <div className="space-y-4 border border-outline-variant p-5 rounded-xl print:border-none">
              <div className="text-center border-b border-outline-variant/60 pb-3">
                <h2 className="text-base font-black uppercase tracking-wider text-primary font-geist">Borderô de Fechamento de Caixa</h2>
                <p className="text-[10px] text-outline mt-0.5">FleetOS Enterprise Fleet Admin</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <p className="text-outline font-semibold">Operador:</p>
                  <p className="font-bold text-primary">{borderoToShow.operator}</p>
                </div>
                <div>
                  <p className="text-outline font-semibold">Status do Caixa:</p>
                  <p className="font-bold text-red-600">Encerrado</p>
                </div>
                <div>
                  <p className="text-outline font-semibold">Abertura:</p>
                  <p className="font-medium text-on-surface-variant font-mono">{borderoToShow.openedAt}</p>
                </div>
                <div>
                  <p className="text-outline font-semibold">Fechamento:</p>
                  <p className="font-medium text-on-surface-variant font-mono">{borderoToShow.closedAt}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-primary uppercase text-[10px] tracking-wider border-b border-outline-variant/40 pb-1">Movimentações consolidadas</p>
                <div className="grid grid-cols-2 gap-y-1.5">
                  <span className="text-outline">Fundo de Caixa (Abertura):</span>
                  <span className="font-semibold text-right text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.openingAmount)}</span>
                  
                  <span className="text-outline">Recebimentos em Pix:</span>
                  <span className="font-semibold text-right text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.totalPix)}</span>
                  
                  <span className="text-outline">Recebimentos em Cartão:</span>
                  <span className="font-semibold text-right text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.totalCard)}</span>
                  
                  <span className="text-outline">Recebimentos em Dinheiro:</span>
                  <span className="font-semibold text-right text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.totalCash)}</span>

                  <span className="text-outline">Recebimentos em Transferências:</span>
                  <span className="font-semibold text-right text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.totalTransfer)}</span>
                  
                  <span className="text-outline">Total Retiradas / Sangrias:</span>
                  <span className="font-semibold text-right text-red-600">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.totalWithdrawals)}</span>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg grid grid-cols-3 gap-2 text-xs text-center font-bold">
                <div>
                  <p className="text-[9px] text-outline uppercase">Saldo Esperado</p>
                  <p className="text-primary mt-0.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.expectedBalance)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-outline uppercase">Saldo Contado</p>
                  <p className="text-primary mt-0.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.physicalCount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-outline uppercase">Diferença/Quebra</p>
                  <p className={`mt-0.5 ${borderoToShow.difference === 0 ? "text-accent-green" : borderoToShow.difference > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(borderoToShow.difference)}
                  </p>
                </div>
              </div>

              {/* Signature Lines */}
              <div className="pt-8 grid grid-cols-2 gap-4 text-[10px] text-center border-t border-outline-variant/60">
                <div>
                  <div className="border-b border-outline-variant w-full h-8 mb-1"></div>
                  <p className="text-outline">Assinatura Operador</p>
                </div>
                <div>
                  <div className="border-b border-outline-variant w-full h-8 mb-1"></div>
                  <p className="text-outline">Assinatura Gerência / Conferência</p>
                </div>
              </div>
            </div>

            {/* Print Button (Hidden on Print) */}
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center justify-center space-x-1.5 print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Fechamento e Borderô</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
