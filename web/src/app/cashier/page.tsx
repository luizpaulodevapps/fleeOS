"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
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
  MinusCircle,
  Printer,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
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

export default function CashierPage() {
  const hub = useFinancialHub();
  const { updateDocument, currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedArIds, setSelectedArIds] = useState<string[]>([]);
  const [amountReceived, setAmountReceived] = useState("");
  const [method, setMethod] = useState<FinancialTransaction["method"]>("pix");
  const [step, setStep] = useState<CheckoutStep>("ready");
  const [pendingTransaction, setPendingTransaction] = useState<FinancialTransaction | null>(null);
  const [receipt, setReceipt] = useState<FinancialTransaction | null>(null);
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedDriver = hub.drivers.find((driver) => driver.id === selectedDriverId);
  const driverContracts = hub.contracts.filter((contract) => contract.driverId === selectedDriverId && contract.status !== "closed");
  const activeContract = driverContracts[0];
  const activeVehicle = hub.vehicles.find((vehicle) => vehicle.id === activeContract?.vehicleId);
  const score = selectedDriverId ? hub.getDriverCreditScore(selectedDriverId) : null;

  const openDebts = useMemo(() => hub.receivables
    .filter((item) => item.driverId === selectedDriverId && item.status !== "paid" && item.status !== "cancelled")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [hub.receivables, selectedDriverId]);

  useEffect(() => {
    setSelectedArIds(openDebts.map((item) => item.id));
  }, [selectedDriverId, hub.receivables.length]);

  const selectedDebts = openDebts.filter((item) => selectedArIds.includes(item.id));
  const selectedTotal = selectedDebts.reduce((total, item) => total + Number(item.amount || 0) - Number(item.paidAmount || 0), 0);
  const receivedValue = Number(amountReceived || selectedTotal || 0);
  const difference = receivedValue - selectedTotal;

  useEffect(() => {
    if (selectedTotal > 0) setAmountReceived(selectedTotal.toFixed(2));
  }, [selectedTotal]);

  const ledger = useMemo(() => hub.ledger
    .filter((entry) => entry.driverId === selectedDriverId)
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()), [hub.ledger, selectedDriverId]);

  const ledgerBalance = ledger.reduce((total, entry) => total + Number(entry.amount || 0), 0);

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

  const receivePayment = async () => {
    if (!selectedDriverId || selectedArIds.length === 0 || receivedValue <= 0 || !hub.activeSession) return;
    setSaving(true);
    try {
      const gateway = method === "pix" ? "mercado_pago" : method === "card" ? "stripe" : "manual";
      const transaction = await hub.submitTransaction(
        selectedArIds.length === 1 ? selectedArIds[0] : "auto_all",
        selectedDriverId,
        receivedValue,
        method,
        gateway,
        "credit",
        "keep_partial",
        selectedArIds
      );
      if (!transaction) return;
      setPendingTransaction(transaction);
      if (method === "pix") {
        setStep("pix_pending");
      } else {
        await hub.webhookApproveTransaction(transaction.id, transaction);
        setReceipt({ ...transaction, status: "approved" });
        setStep("approved");
        setSelectedArIds([]);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmPix = async () => {
    if (!pendingTransaction) return;
    setSaving(true);
    try {
      await hub.webhookApproveTransaction(pendingTransaction.id, pendingTransaction);
      setReceipt({ ...pendingTransaction, status: "approved" });
      setStep("approved");
      setSelectedArIds([]);
    } finally {
      setSaving(false);
    }
  };

  const blockDriver = async () => {
    if (!selectedDriver || !confirm(`Bloquear ${selectedDriver.name} para novas retiradas de veículo?`)) return;
    await updateDocument("drivers", selectedDriver.id, { status: "blocked_financial", financialBlockedAt: new Date().toISOString(), financialBlockedBy: currentUser?.displayName || "Caixa" });
    await hub.reload();
  };

  if (hub.loading) {
    return <div className="min-h-[560px] flex flex-col items-center justify-center gap-3"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /><p className="text-xs font-semibold text-slate-500">Preparando checkout...</p></div>;
  }

  return (
    <div className="min-w-0 text-slate-900">
      <header className="flex items-center justify-between gap-4 mb-5">
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">Frente de atendimento</p><h1 className="font-geist text-2xl font-black tracking-tight mt-1">Checkout</h1></div>
        <button onClick={() => setCashDrawerOpen(true)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-xs font-bold hover:border-indigo-300 hover:text-indigo-700 shadow-sm"><Menu className="w-4 h-4" /> Caixa <span className={`w-2 h-2 rounded-full ${hub.activeSession ? "bg-emerald-500" : "bg-red-500"}`} /></button>
      </header>

      <section className="relative z-20 mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar motorista por nome, CPF, placa ou prefixo do táxi" className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium outline-none shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
        {query && <div className="absolute left-0 right-0 top-[62px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">{searchResults.map((driver) => { const contract = hub.contracts.find((item) => item.driverId === driver.id && item.status !== "closed"); const vehicle = hub.vehicles.find((item) => item.id === contract?.vehicleId); return <button key={driver.id} onClick={() => selectDriver(driver.id)} className="w-full px-4 py-3 flex items-center justify-between text-left border-b last:border-0 border-slate-100 hover:bg-indigo-50"><div><p className="text-xs font-bold text-slate-900">{driver.name}</p><p className="text-[10px] text-slate-500 mt-0.5">{driver.cpf || "CPF não informado"} · {vehicle?.plate || "Sem veículo ativo"}</p></div><ChevronRight className="w-4 h-4 text-slate-400" /></button>})}{searchResults.length === 0 && <p className="p-5 text-xs text-slate-400 text-center">Nenhum motorista encontrado.</p>}</div>}
      </section>

      {!selectedDriver ? (
        <EmptyCheckout />
      ) : (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
          <main className="space-y-4">
            <DriverCard driver={selectedDriver} vehicle={activeVehicle} score={score} balance={ledgerBalance} onReceive={() => setStep("ready")} onInstallment={() => setInstallmentOpen(true)} onStatement={() => setStatementOpen(true)} onBlock={blockDriver} />

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-geist text-sm font-black">Débitos</h2><p className="text-[10px] text-slate-500 mt-0.5">Selecione exatamente o que será quitado.</p></div><button onClick={() => setSelectedArIds(selectedArIds.length === openDebts.length ? [] : openDebts.map((item) => item.id))} className="text-[10px] font-bold text-indigo-600">{selectedArIds.length === openDebts.length ? "Limpar seleção" : "Selecionar todos"}</button></div>
              <div className="divide-y divide-slate-100">
                {openDebts.map((item) => <DebtRow key={item.id} item={item} selected={selectedArIds.includes(item.id)} onToggle={() => toggleDebt(item.id)} />)}
                {openDebts.length === 0 && <div className="py-12 text-center"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" /><p className="text-sm font-bold text-slate-700 mt-3">Nenhum débito em aberto</p><p className="text-xs text-slate-400 mt-1">A conta deste motorista está em dia.</p></div>}
              </div>
              <div className="px-5 py-4 bg-slate-50 flex items-center justify-between"><span className="text-xs font-bold text-slate-500">Total selecionado</span><strong className="font-geist text-xl font-black text-slate-950">{money(selectedTotal)}</strong></div>
            </section>

            {openDebts.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4"><div><h2 className="font-geist text-sm font-black">Recebimento</h2><p className="text-[10px] text-slate-500 mt-0.5">Informe o valor e escolha como o motorista vai pagar.</p></div><WalletCards className="w-5 h-5 text-indigo-500" /></div>
                <div className="grid md:grid-cols-[1fr_1.5fr] gap-4">
                  <label><span className="block text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1.5">Valor recebido</span><div className="relative"><span className="absolute left-3 top-3 text-xs font-bold text-slate-400">R$</span><input type="number" min="0" step="0.01" value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} className="checkout-input pl-9 font-geist font-black text-base" /></div></label>
                  <div><span className="block text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1.5">Forma de pagamento</span><div className="grid grid-cols-4 gap-2">{([{ id: "pix", label: "PIX", icon: QrCode }, { id: "card", label: "Cartão", icon: CreditCard }, { id: "cash", label: "Dinheiro", icon: Banknote }, { id: "transfer", label: "Transfer.", icon: Landmark }] as const).map((option) => <button key={option.id} onClick={() => setMethod(option.id)} className={`h-[44px] rounded-xl border flex items-center justify-center gap-1.5 text-[10px] font-bold transition-colors ${method === option.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}><option.icon className="w-3.5 h-3.5" /> {option.label}</button>)}</div></div>
                </div>
                <div className={`mt-4 rounded-xl px-4 py-3 flex items-center justify-between ${difference >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className="text-[10px] font-bold">{difference > 0 ? "Crédito restante na conta" : difference < 0 ? "Saldo que continuará em aberto" : "Valor exato dos débitos"}</span><strong className="text-xs">{money(Math.abs(difference))}</strong></div>
                {!hub.activeSession && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-[10px] font-bold text-red-700"><LockKeyhole className="w-4 h-4" /> Abra o caixa antes de receber pagamentos.</div>}
                <button disabled={!hub.activeSession || selectedTotal <= 0 || receivedValue <= 0 || saving} onClick={receivePayment} className="w-full h-12 mt-4 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-40"><HandCoins className="w-4 h-4" /> {saving ? "Processando..." : `Receber ${money(receivedValue)}`}</button>
              </section>
            )}
          </main>

          <StatementPanel entries={ledger} />
        </div>
      )}

      {step === "pix_pending" && pendingTransaction && <PixModal amount={pendingTransaction.amount} transaction={pendingTransaction.transactionNumber} saving={saving} onConfirm={confirmPix} onClose={() => setStep("ready")} />}
      {step === "approved" && receipt && <ReceiptModal transaction={receipt} driver={selectedDriver} method={method} onClose={() => { setStep("ready"); setReceipt(null); }} />}
      {cashDrawerOpen && <CashDrawer hub={hub} onClose={() => setCashDrawerOpen(false)} />}
      {installmentOpen && <InstallmentModal debts={selectedDebts.length ? selectedDebts : openDebts} driver={selectedDriver} createPaymentPlan={hub.createPaymentPlan} onClose={() => setInstallmentOpen(false)} />}
      {statementOpen && <StatementModal entries={ledger} driver={selectedDriver} onClose={() => setStatementOpen(false)} />}
      <style jsx global>{`.checkout-input{width:100%;height:44px;border:1px solid #e2e8f0;border-radius:.75rem;padding-right:.75rem;background:#fff;outline:none}.checkout-input:focus{border-color:#818cf8;box-shadow:0 0 0 3px #eef2ff}@media print{.receipt-print{position:fixed;inset:0;background:white;z-index:999;padding:32px}.receipt-print button{display:none}}`}</style>
    </div>
  );
}

function EmptyCheckout() {
  return <div className="min-h-[480px] rounded-3xl border border-dashed border-slate-300 bg-white/60 flex flex-col items-center justify-center text-center p-8"><div className="w-16 h-16 rounded-2xl bg-indigo-50 grid place-items-center"><UserRound className="w-7 h-7 text-indigo-500" /></div><h2 className="font-geist text-lg font-black text-slate-800 mt-5">Quem está pagando?</h2><p className="text-xs text-slate-500 max-w-sm mt-2">Busque o motorista acima. Os débitos, saldo e últimas movimentações aparecem imediatamente.</p><div className="flex items-center gap-5 mt-6 text-[10px] font-bold text-slate-400"><span>Nome</span><span>CPF</span><span>Placa</span><span>Prefixo</span></div></div>;
}

function DriverCard({ driver, vehicle, score, balance, onReceive, onInstallment, onStatement, onBlock }: any) {
  const grade = score?.grade || "A";
  const healthy = ["AAA", "AA", "A"].includes(grade);
  const critical = ["C", "D"].includes(grade);
  const status = healthy ? "Excelente" : critical ? "Inadimplente" : "Atenção";
  const scoreClass = healthy ? "bg-emerald-50 border-emerald-200 text-emerald-700" : critical ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700";
  return <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div className="flex items-center gap-3 min-w-0"><div className="w-11 h-11 rounded-xl bg-slate-950 text-white grid place-items-center font-geist font-black">{String(driver.name || "?").split(" ").slice(0, 2).map((part: string) => part[0]).join("")}</div><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">Motorista</p><h2 className="font-geist text-lg font-black truncate">{driver.name}</h2><p className="text-[10px] text-slate-500 mt-0.5">{vehicle ? `${vehicle.prefix || vehicle.internalCode || "Táxi"} · ${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : "Sem veículo ativo"}</p></div></div><div className="flex gap-2"><div className={`rounded-xl px-3 py-2 border ${scoreClass}`}><p className="text-[9px] font-black uppercase">{status}</p><p className="font-geist text-lg font-black leading-none mt-1">{grade}</p></div><div className="rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 text-right"><p className="text-[9px] font-black uppercase text-slate-400">Saldo</p><p className={`font-geist text-base font-black mt-1 ${balance < 0 ? "text-red-600" : "text-emerald-600"}`}>{money(balance)}</p></div></div></div><div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100"><QuickButton icon={HandCoins} label="Receber" primary onClick={onReceive} /><QuickButton icon={CalendarDays} label="Parcelar" onClick={onInstallment} /><QuickButton icon={Sparkles} label="Negociar" onClick={onInstallment} /><QuickButton icon={FileText} label="Extrato" onClick={onStatement} /><QuickButton icon={Ban} label="Bloquear" danger onClick={onBlock} /></div></section>;
}

function QuickButton({ icon: Icon, label, primary, danger, onClick }: any) {
  return <button onClick={onClick} className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold ${primary ? "bg-indigo-600 border-indigo-600 text-white" : danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Icon className="w-3.5 h-3.5" /> {label}</button>;
}

function DebtRow({ item, selected, onToggle }: { item: AccountsReceivable; selected: boolean; onToggle: () => void }) {
  const remaining = Number(item.amount || 0) - Number(item.paidAmount || 0);
  const overdue = new Date(item.dueDate).getTime() < Date.now();
  return <button onClick={onToggle} className="w-full px-5 py-3.5 grid grid-cols-[24px_1fr_auto] gap-3 items-center text-left hover:bg-slate-50"><span className={`w-5 h-5 rounded-md border grid place-items-center ${selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>{selected && <Check className="w-3.5 h-3.5" />}</span><span><strong className="block text-xs text-slate-800">{titleLabels[item.titleType] || "Cobrança"}</strong><span className={`text-[10px] mt-0.5 block ${overdue ? "text-red-500" : "text-slate-400"}`}>{overdue ? "Vencido" : "Vence"} em {date(item.dueDate)}{item.status === "partial" ? " · pagamento parcial" : ""}</span></span><strong className="font-geist text-sm text-slate-900">{money(remaining)}</strong></button>;
}

function StatementPanel({ entries }: { entries: any[] }) {
  return <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden xl:sticky xl:top-4"><div className="px-4 py-4 border-b border-slate-100"><h2 className="font-geist text-sm font-black">Extrato</h2><p className="text-[10px] text-slate-500 mt-0.5">Últimos movimentos da conta.</p></div><div className="divide-y divide-slate-100 max-h-[610px] overflow-y-auto">{entries.slice(0, 12).map((entry) => <StatementRow key={entry.id} entry={entry} />)}{entries.length === 0 && <p className="p-8 text-center text-xs text-slate-400">Sem movimentações.</p>}</div></aside>;
}

function StatementRow({ entry }: { entry: any }) {
  const credit = Number(entry.amount || 0) >= 0;
  return <div className="p-4 flex items-center gap-3"><span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${credit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{credit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-700 truncate">{entry.description}</p><p className="text-[9px] text-slate-400 mt-0.5">{date(entry.createdAt)}</p></div><strong className={`text-xs ${credit ? "text-emerald-600" : "text-slate-800"}`}>{credit ? "+" : "-"}{money(Math.abs(entry.amount))}</strong></div>;
}

function PixModal({ amount, transaction, saving, onConfirm, onClose }: any) {
  return <Modal onClose={onClose}><div className="text-center"><div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mx-auto"><QrCode className="w-6 h-6" /></div><h2 className="font-geist text-xl font-black mt-4">Pagamento via PIX</h2><p className="text-2xl font-black mt-2">{money(amount)}</p><div className="w-44 h-44 mx-auto my-5 rounded-2xl bg-white border-8 border-slate-950 p-3 grid grid-cols-5 gap-1">{Array.from({ length: 25 }).map((_, index) => <span key={index} className={`${[0,1,2,5,7,10,11,12,14,16,18,20,22,23,24].includes(index) ? "bg-slate-950" : "bg-white"}`} />)}</div><div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600"><Clock3 className="w-4 h-4 animate-pulse" /> Aguardando pagamento...</div><p className="text-[9px] text-slate-400 font-mono mt-2">{transaction}</p><button disabled={saving} onClick={onConfirm} className="w-full h-11 rounded-xl bg-emerald-600 text-white text-xs font-black mt-5 disabled:opacity-50">{saving ? "Confirmando..." : "Simular webhook aprovado"}</button></div></Modal>;
}

function ReceiptModal({ transaction, driver, method, onClose }: any) {
  return <Modal onClose={onClose}><div className="receipt-print text-center"><CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" /><h2 className="font-geist text-xl font-black mt-3">Pagamento aprovado</h2><p className="text-3xl font-black mt-3">{money(transaction.amount)}</p><div className="my-5 border-y border-dashed border-slate-300 py-4 text-left space-y-2 text-xs"><p className="flex justify-between"><span className="text-slate-400">Motorista</span><strong>{driver?.name}</strong></p><p className="flex justify-between"><span className="text-slate-400">Forma</span><strong className="uppercase">{method}</strong></p><p className="flex justify-between"><span className="text-slate-400">Recibo</span><strong className="font-mono">{transaction.transactionNumber}</strong></p><p className="flex justify-between"><span className="text-slate-400">Data</span><strong>{new Date().toLocaleString("pt-BR")}</strong></p></div><button onClick={() => window.print()} className="w-full h-11 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-2"><Printer className="w-4 h-4" /> Imprimir recibo</button><button onClick={onClose} className="w-full h-10 text-xs font-bold text-slate-500 mt-1">Concluir atendimento</button></div></Modal>;
}

function CashDrawer({ hub, onClose }: any) {
  const [opening, setOpening] = useState("100");
  const [physical, setPhysical] = useState("");
  const [justification, setJustification] = useState("");
  const [movementType, setMovementType] = useState("WITHDRAWAL");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementDescription, setMovementDescription] = useState("");
  const sessionMovements = hub.movements.filter((item: any) => item.cashierId === hub.activeSession?.id);
  const receipts = sessionMovements.filter((item: any) => item.type === "RECEIPT").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const withdrawals = sessionMovements.filter((item: any) => item.type === "WITHDRAWAL").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const supplies = sessionMovements.filter((item: any) => item.type === "SUPPLY").reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const expected = Number(hub.activeSession?.openingAmount || 0) + receipts + supplies - withdrawals;
  const submitMovement = async () => { if (Number(movementAmount) <= 0) return; await hub.requestWithdrawal(Number(movementAmount), movementType, movementDescription); setMovementAmount(""); setMovementDescription(""); };
  const closeCashier = () => { const counted = Number(physical); if (!physical || counted < 0) return alert("Informe o valor contado fisicamente."); if (counted !== expected && !justification.trim()) return alert("Informe uma justificativa para a diferença de caixa."); hub.closeCashier(hub.activeSession.id, counted, expected, justification); };
  return <div className="fixed inset-0 z-[80] bg-slate-950/35 flex justify-end" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="w-full max-w-md h-full bg-[#fcfafb] overflow-y-auto shadow-2xl"><div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between z-10"><div><p className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Gestão do turno</p><h2 className="font-geist text-xl font-black mt-1">Caixa</h2></div><button onClick={onClose} className="w-9 h-9 rounded-xl grid place-items-center hover:bg-slate-100"><X className="w-5 h-5" /></button></div><div className="p-5 space-y-4">{!hub.activeSession ? <section className="bg-white border border-slate-200 rounded-2xl p-5 text-center"><LockKeyhole className="w-8 h-8 text-red-500 mx-auto" /><h3 className="font-geist font-black mt-3">Caixa fechado</h3><p className="text-xs text-slate-500 mt-1">Informe o fundo de troco para iniciar o turno.</p><input type="number" value={opening} onChange={(event) => setOpening(event.target.value)} className="checkout-input mt-5 px-3 text-center font-bold" /><button onClick={() => hub.openCashier(Number(opening))} className="w-full h-11 mt-3 rounded-xl bg-emerald-600 text-white text-xs font-black">Abrir caixa</button></section> : <><section className="rounded-2xl bg-slate-950 text-white p-5"><div className="flex items-center gap-2 text-emerald-400 text-xs font-black"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> Caixa aberto</div><p className="text-[10px] text-slate-400 mt-1">Operador: {hub.activeSession.operatorId}</p><div className="grid grid-cols-2 gap-3 mt-5"><CashMetric label="Entradas" value={money(receipts + supplies)} positive /><CashMetric label="Retiradas" value={money(withdrawals)} /><CashMetric label="Fundo inicial" value={money(hub.activeSession.openingAmount)} /><CashMetric label="Saldo esperado" value={money(expected)} positive /></div></section><section className="bg-white border border-slate-200 rounded-2xl p-5"><h3 className="text-xs font-black">Sangria ou suprimento</h3><div className="grid grid-cols-2 gap-2 mt-4"><button onClick={() => setMovementType("WITHDRAWAL")} className={`h-9 rounded-lg border text-[10px] font-bold ${movementType === "WITHDRAWAL" ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200"}`}>Sangria</button><button onClick={() => setMovementType("SUPPLY")} className={`h-9 rounded-lg border text-[10px] font-bold ${movementType === "SUPPLY" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200"}`}>Suprimento</button></div><input type="number" value={movementAmount} onChange={(event) => setMovementAmount(event.target.value)} placeholder="Valor" className="checkout-input px-3 mt-3" /><input value={movementDescription} onChange={(event) => setMovementDescription(event.target.value)} placeholder="Finalidade / justificativa" className="checkout-input px-3 mt-2" /><button onClick={submitMovement} className="w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-bold mt-3">Registrar solicitação</button></section><section className="bg-white border border-slate-200 rounded-2xl p-5"><h3 className="text-xs font-black text-red-600">Fechar caixa</h3><input type="number" value={physical} onChange={(event) => setPhysical(event.target.value)} placeholder="Valor contado fisicamente" className="checkout-input px-3 mt-4" /><input value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Justificativa para diferença, se houver" className="checkout-input px-3 mt-2" /><button onClick={closeCashier} className="w-full h-10 rounded-xl border border-red-200 text-red-600 text-xs font-bold mt-3 hover:bg-red-50">Encerrar turno</button></section></>}</div></aside></div>;
}

function CashMetric({ label, value, positive }: any) { return <div className="rounded-xl bg-white/5 p-3"><p className="text-[9px] uppercase text-slate-400 font-bold">{label}</p><p className={`text-sm font-black mt-1 ${positive ? "text-emerald-400" : "text-white"}`}>{value}</p></div>; }

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
