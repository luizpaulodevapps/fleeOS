"use client";

import React, { useState } from "react";
import { 
  AccountsReceivable, 
  FinancialTransaction, 
  WithdrawalRequest, 
  DriverCreditScore 
} from "../_lib/types";
import { PAYMENT_METHODS, GATEWAY_PROVIDERS } from "../_lib/constants";
import { 
  Lock, 
  Unlock, 
  User, 
  Search, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  QrCode, 
  Printer, 
  X, 
  FileText, 
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RotateCcw
} from "lucide-react";

interface CashierConsoleProps {
  activeSession: any | null;
  sessions: any[];
  movements: any[];
  drivers: any[];
  contracts: any[];
  receivables: AccountsReceivable[];
  transactions: FinancialTransaction[];
  withdrawalRequests: WithdrawalRequest[];
  vehicles: any[];
  ledger: any[];
  openCashier: (openingAmount: number) => Promise<any>;
  closeCashier: (sessionId: string, physicalCount: number, expectedBalance: number, justification: string) => Promise<void>;
  createAR: (driverId: string, contractId: string, amount: number, type: AccountsReceivable["titleType"], dueDate: string) => Promise<any>;
  submitTransaction: (
    arId: string,
    driverId: string,
    amount: number,
    method: FinancialTransaction["method"],
    gateway: FinancialTransaction["gateway"],
    surplusDestination?: "credit" | "auto_fines" | "auto_all",
    partialTreatment?: "keep_partial" | "force_paid_debit"
  ) => Promise<any>;
  webhookApproveTransaction: (txId: string) => Promise<void>;
  voidTransaction: (txId: string, reason: string, approvedBy: string) => Promise<void>;
  requestWithdrawal: (amount: number, type: string, description: string) => Promise<any>;
  approveWithdrawal: (wdrId: string, approvedBy: string) => Promise<void>;
  getDriverCreditScore: (driverId: string) => DriverCreditScore;
  reload: () => Promise<void>;
}

export function CashierConsole({
  activeSession,
  sessions,
  movements,
  drivers,
  contracts,
  receivables,
  transactions,
  withdrawalRequests,
  vehicles,
  ledger,
  openCashier,
  closeCashier,
  createAR,
  submitTransaction,
  webhookApproveTransaction,
  voidTransaction,
  requestWithdrawal,
  approveWithdrawal,
  getDriverCreditScore,
  reload
}: CashierConsoleProps) {
  // Cashier State
  const [openingAmount, setOpeningAmount] = useState<string>("100");
  const [physicalCount, setPhysicalCount] = useState<string>("");
  const [closeJustification, setCloseJustification] = useState<string>("");

  // Search Driver
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // New AR Title form
  const [showNewArModal, setShowNewArModal] = useState(false);
  const [newArData, setNewArData] = useState({
    amount: "",
    type: "rent" as AccountsReceivable["titleType"],
    dueDate: new Date().toISOString().split("T")[0],
    contractId: ""
  });

  // Payment checkout state
  const [selectedAr, setSelectedAr] = useState<AccountsReceivable | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction["method"]>("pix");
  const [gatewayProvider, setGatewayProvider] = useState<FinancialTransaction["gateway"]>("mercado_pago");
  const [activePendingTx, setActivePendingTx] = useState<FinancialTransaction | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Custom Receipt Form States
  const [receiptAmount, setReceiptAmount] = useState<string>("");
  const [allocationDestination, setAllocationDestination] = useState<string>("auto_rent");
  const [surplusDestination, setSurplusDestination] = useState<"credit" | "auto_fines" | "auto_all">("credit");
  const [partialTreatment, setPartialTreatment] = useState<"keep_partial" | "force_paid_debit">("keep_partial");

  // Withdrawals Form
  const [wdrAmount, setWdrAmount] = useState("");
  const [wdrDescription, setWdrDescription] = useState("");
  const [wdrType, setWdrType] = useState("WITHDRAWAL"); // WITHDRAWAL (Sangria) or SUPPLY (Suprimento)

  // Void/Estorno states
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [txToVoid, setTxToVoid] = useState<FinancialTransaction | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidSupervisor, setVoidSupervisor] = useState("");

  // Helper calculations for cashier
  const cashierMovements = movements.filter(m => m.cashierId === activeSession?.id);
  const cashierReceiptsSum = cashierMovements
    .filter(m => m.type === "RECEIPT")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const cashierWithdrawalsSum = cashierMovements
    .filter(m => m.type === "WITHDRAWAL")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
  
  const expectedBalance = activeSession 
    ? Number(activeSession.openingAmount || 0) + cashierReceiptsSum - cashierWithdrawalsSum
    : 0;

  // Filtered drivers for search (supporting Name, CPF and Vehicle Plate / Prefix search)
  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, ""); // strip punctuation for flexible lookup
    if (!q) return false;
    
    // Match driver name
    const nameMatch = d.name?.toLowerCase().includes(q) || d.name?.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q);
    // Match driver CPF (stripped of punctuation)
    const cpfMatch = d.cpf?.replace(/[^a-z0-9]/g, "").includes(q);
    
    // Match vehicle plate associated with driver via contracts
    const vehicleMatch = contracts.some(c => {
      if (c.driverId !== d.id) return false;
      const v = vehicles.find(veh => veh.id === c.vehicleId);
      if (!v) return false;
      const plateMatch = v.plate?.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q);
      const prefixMatch = v.prefix?.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q) || 
                          v.internalCode?.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q);
      const brandModelMatch = `${v.brand} ${v.model}`.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q);
      return plateMatch || prefixMatch || brandModelMatch;
    });

    return nameMatch || cpfMatch || vehicleMatch;
  });

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const selectedDriverContracts = contracts.filter(c => c.driverId === selectedDriverId);
  const selectedDriverAR = receivables.filter(r => r.driverId === selectedDriverId && r.status !== "paid" && r.status !== "cancelled");
  const selectedDriverScore = selectedDriverId ? getDriverCreditScore(selectedDriverId) : null;

  // Driver Account Balance & Debt calculations
  const driverLedgerEntries = selectedDriverId ? ledger.filter(l => l.driverId === selectedDriverId) : [];
  const driverLedgerBalance = driverLedgerEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  const driverOpenDiariasSum = selectedDriverAR
    .filter(r => r.titleType === "rent")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const driverTotalDebtSum = selectedDriverAR.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  // Recent transactions to show
  const recentTransactions = transactions
    .filter(t => t.cashierSessionId === activeSession?.id || t.driverId === selectedDriverId)
    .slice()
    .reverse()
    .slice(0, 5);

  const getDriverName = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.name : "N/A";
  };

  const handleOpenCashier = async () => {
    const amt = Number(openingAmount);
    if (isNaN(amt) || amt < 0) {
      alert("Valor inválido");
      return;
    }
    await openCashier(amt);
    setOpeningAmount("100");
  };

  const handleCloseCashier = async () => {
    if (!activeSession) return;
    const phys = Number(physicalCount);
    if (isNaN(phys) || phys < 0) {
      alert("Insira a contagem física do dinheiro em caixa.");
      return;
    }

    const diff = phys - expectedBalance;
    if (diff !== 0 && !closeJustification) {
      alert("Aviso: Há diferença no caixa. Justificativa é obrigatória.");
      return;
    }

    if (confirm("Confirma o fechamento deste turno de caixa?")) {
      await closeCashier(activeSession.id, phys, expectedBalance, closeJustification);
      setPhysicalCount("");
      setCloseJustification("");
    }
  };

  const handleCreateAr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    const amt = Number(newArData.amount);
    if (isNaN(amt) || amt <= 0) {
      alert("Insira um valor válido.");
      return;
    }
    await createAR(selectedDriverId, newArData.contractId, amt, newArData.type, newArData.dueDate);
    setShowNewArModal(false);
    setNewArData({
      amount: "",
      type: "rent",
      dueDate: new Date().toISOString().split("T")[0],
      contractId: ""
    });
  };

  const handleInitiatePayment = async (amountOverride?: number, destinationOverride?: string) => {
    if (!selectedDriverId) return;

    // Determine target amount and target destination/arId
    const finalAmount = amountOverride !== undefined 
      ? amountOverride 
      : Number(receiptAmount || (selectedAr ? selectedAr.amount - selectedAr.paidAmount : 0));
      
    const finalDestination = destinationOverride !== undefined
      ? destinationOverride
      : (selectedAr ? selectedAr.id : allocationDestination);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Por favor, preencha um valor de pagamento válido.");
      return;
    }

    const defaultGateway = (paymentMethod === "cash" || paymentMethod === "transfer") ? "manual" : gatewayProvider;
    
    // If destination is 'general', we pass empty string (general credit)
    const arId = finalDestination === "general" ? "" : finalDestination;

    const tx = await submitTransaction(
      arId,
      selectedDriverId,
      finalAmount,
      paymentMethod,
      defaultGateway,
      surplusDestination,
      partialTreatment
    );
    if (tx) {
      setActivePendingTx(tx);
      setShowCheckout(true);
      // Reset custom form state
      setReceiptAmount("");
    }
  };

  const simulateWebhookConfirmation = async () => {
    if (!activePendingTx) return;
    await webhookApproveTransaction(activePendingTx.id);
    setShowCheckout(false);
    setActivePendingTx(null);
    setSelectedAr(null);
    alert("Transação aprovada via Simulação de Webhook!");
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(wdrAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Valor inválido");
      return;
    }
    await requestWithdrawal(amt, wdrType, wdrDescription);
    setWdrAmount("");
    setWdrDescription("");
    alert(`Solicitação de ${wdrType === "WITHDRAWAL" ? "Sangria" : "Suprimento"} enviada para autorização.`);
  };

  const handleVoidTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txToVoid || !voidReason || !voidSupervisor) {
      alert("Campos obrigatórios faltando.");
      return;
    }
    await voidTransaction(txToVoid.id, voidReason, voidSupervisor);
    setShowVoidModal(false);
    setTxToVoid(null);
    setVoidReason("");
    setVoidSupervisor("");
    alert("Lançamento estornado com sucesso!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-on-surface">
      
      {/* LEFT COLUMN: Cashier Turn Operations */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Cashier State Card */}
        {!activeSession ? (
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-primary font-geist">Caixa Fechado</h3>
              <p className="text-on-surface-variant text-[11px] mt-1">
                Abra o caixa físico de atendimento para iniciar a recepção de valores e sangrias.
              </p>
            </div>
            <div className="pt-2 max-w-xs mx-auto">
              <label className="block text-[10px] font-bold uppercase text-outline text-left mb-1.5">Fundo de Troco Inicial (R$)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-outline">R$</span>
                <input
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              onClick={handleOpenCashier}
              className="w-full py-2.5 bg-emerald-600 text-on-primary rounded-lg font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Caixa / Iniciar Turno</span>
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-extrabold text-primary text-sm font-geist">Caixa Aberto (Operação)</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                Ativo
              </span>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 border border-outline-variant/60 rounded-lg font-medium text-[11px]">
              <div>
                <span className="text-outline block text-[9px] uppercase font-bold">Operador</span>
                <span className="text-primary font-bold">{activeSession.operatorId}</span>
              </div>
              <div>
                <span className="text-outline block text-[9px] uppercase font-bold">Abertura</span>
                <span className="font-mono text-primary">
                  {new Date(activeSession.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-outline block text-[9px] uppercase font-bold">Troco Inicial</span>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(activeSession.openingAmount)}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-outline block text-[9px] uppercase font-bold">Entradas do Turno</span>
                <span className="font-bold text-emerald-600">
                  +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cashierReceiptsSum)}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-outline block text-[9px] uppercase font-bold">Retiradas / Sangrias</span>
                <span className="font-bold text-red-600">
                  -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cashierWithdrawalsSum)}
                </span>
              </div>
              <div className="mt-2 border-t pt-2 col-span-2 flex justify-between items-center text-xs font-black">
                <span className="text-primary uppercase tracking-wider text-[10px]">Saldo Estimado em Caixa:</span>
                <span className="text-primary font-mono">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(expectedBalance)}
                </span>
              </div>
            </div>

            {/* Request Withdrawal / Supply */}
            <form onSubmit={handleRequestWithdrawal} className="space-y-3 border-t pt-4">
              <p className="font-bold text-[10px] text-outline uppercase tracking-wider">Solicitar Sangria / Retirada Física</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-outline font-semibold mb-1">Tipo</label>
                  <select
                    value={wdrType}
                    onChange={(e) => setWdrType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  >
                    <option value="WITHDRAWAL">Sangria (Retirada)</option>
                    <option value="SUPPLY">Suprimento (Adicionar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-outline font-semibold mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={wdrAmount}
                    onChange={(e) => setWdrAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-outline font-semibold mb-1">Finalidade / Justificativa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Depósito bancário / Troco adicional"
                  value={wdrDescription}
                  onChange={(e) => setWdrDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-[11px]"
              >
                Registrar Movimentação
              </button>
            </form>

            {/* cashier closing form */}
            <div className="border-t pt-4 space-y-3">
              <p className="font-bold text-[10px] text-red-600 uppercase tracking-wider">Fechamento do Turno (Auditoria Física)</p>
              
              <div>
                <label className="block text-[9px] text-outline font-semibold mb-1">Valor Contado em Caixa (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-outline">R$</span>
                  <input
                    type="number"
                    required
                    placeholder="Digite o saldo físico final"
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  />
                </div>
              </div>

              {physicalCount && Number(physicalCount) !== expectedBalance && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg space-y-2 text-amber-800 text-[11px]">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Divergência Detectada!</span>
                  </div>
                  <p>
                    Diferença de:{" "}
                    <span className="font-extrabold font-mono">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(physicalCount) - expectedBalance)}
                    </span>
                  </p>
                  <div>
                    <label className="block text-[9px] text-amber-800 font-bold mb-1 uppercase">Justificativa da Quebra de Caixa</label>
                    <textarea
                      required
                      value={closeJustification}
                      onChange={(e) => setCloseJustification(e.target.value)}
                      placeholder="Descreva o motivo da discrepância de valores."
                      className="w-full p-2 bg-background border border-amber-500/20 rounded-md text-xs outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleCloseCashier}
                className="w-full py-2.5 bg-red-600 text-on-primary font-black rounded-lg hover:bg-red-700 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Encerrar Turno & Fechar Caixa</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent turn operations / transactions log */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-3.5 shadow-sm">
          <p className="font-bold text-[10px] text-outline uppercase tracking-wider">Histórico de Transações Recentes</p>
          <div className="divide-y divide-outline-variant/60">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-outline italic py-4">Nenhuma transação efetuada neste caixa.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex justify-between items-center text-[11px]">
                  <div>
                    <p className="font-bold text-primary">{tx.transactionNumber}</p>
                    <p className="text-on-surface-variant text-[10px] mt-0.5">
                      {getDriverName(tx.driverId)} • {tx.method.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${tx.status === "approved" ? "text-emerald-600" : tx.status === "pending" ? "text-amber-600" : "text-red-500"}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount)}
                    </span>
                    <div className="flex items-center space-x-1.5 justify-end mt-0.5">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                        tx.status === "approved" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                          : tx.status === "pending" 
                          ? "bg-amber-50 text-amber-600 border-amber-200" 
                          : "bg-red-50 text-red-500 border-red-200"
                      }`}>
                        {tx.status === "approved" ? "Aprovado" : tx.status === "pending" ? "Pendente" : "Estornado"}
                      </span>
                      {tx.status === "approved" && (
                        <button
                          onClick={() => {
                            setTxToVoid(tx);
                            setShowVoidModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-[9px] underline uppercase"
                        >
                          Estornar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Client Selection & Settle Accounts Receivable */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Search Driver Cockpit */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-primary font-geist">Recepção e Liquidação de Contas</h3>
            <p className="text-on-surface-variant text-[11px]">Pesquise pelo CPF ou Nome do motorista corporativo para carregar o extrato de faturas e score de adimplência.</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar motorista por CPF ou Nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {searchQuery && (
            <div className="bg-background border border-outline-variant rounded-lg divide-y divide-outline-variant/60 max-h-40 overflow-y-auto">
              {filteredDrivers.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDriverId(d.id);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex justify-between items-center font-medium"
                >
                  <span>{d.name}</span>
                  <span className="text-outline font-mono text-[10px]">{d.cpf}</span>
                </button>
              ))}
              {filteredDrivers.length === 0 && (
                <div className="p-3 text-center text-outline italic">Nenhum motorista correspondente.</div>
              )}
            </div>
          )}
        </div>

        {/* Selected Driver Cockpit */}
        {selectedDriver ? (
          <div className="space-y-6">
            
            {/* Driver Financial Profile & Credit Score */}
            {selectedDriverScore && (
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="text-sm font-black text-primary font-geist">{selectedDriver.name}</h4>
                      <p className="text-on-surface-variant text-[10px] font-mono mt-0.5">CPF: {selectedDriver.cpf} | CNH: {selectedDriver.cnh}</p>
                    </div>
                  </div>
                  
                  {/* Financial Balance Summary badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2 border rounded bg-slate-50 text-[10px]">
                      <span className="text-outline block text-[8px] font-black uppercase">Saldo em Conta</span>
                      <span className={`font-mono font-black ${driverLedgerBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(driverLedgerBalance)}
                      </span>
                    </div>
                    <div className="p-2 border rounded bg-slate-50 text-[10px]">
                      <span className="text-outline block text-[8px] font-black uppercase">Diárias em Aberto</span>
                      <span className="font-mono font-black text-slate-800">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(driverOpenDiariasSum)}
                      </span>
                    </div>
                    <div className="p-2 border rounded bg-slate-50 text-[10px]">
                      <span className="text-outline block text-[8px] font-black uppercase">Total em Débito</span>
                      <span className="font-mono font-black text-red-650">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(driverTotalDebtSum)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score rating meter */}
                <div className="md:col-span-5 bg-slate-50 border border-outline-variant p-4 rounded-lg text-center space-y-1.5 relative overflow-hidden">
                  <span className="text-[9px] text-outline font-black uppercase tracking-wider block">Credit Score do Motorista</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-primary font-geist">{selectedDriverScore.score}</span>
                    <span className="text-outline font-bold text-[10px]">/1000</span>
                  </div>
                  <div className="inline-flex px-2 py-0.5 text-[9px] font-black rounded uppercase border bg-white shadow-sm border-outline-variant">
                    Grau:{" "}
                    <span className={`ml-1 font-black ${
                      ["AAA", "AA", "A"].includes(selectedDriverScore.grade) ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {selectedDriverScore.grade}
                    </span>
                  </div>
                  <div className="text-[9px] text-on-surface-variant pt-1 font-semibold flex items-center justify-center gap-1">
                    <span>Compromisso: {selectedDriverScore.paymentComplianceRate}%</span>
                    <span>•</span>
                    <span>Multas: {selectedDriverScore.finesCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lançar Novo Recebimento Form */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1.5 border-b pb-2">
                <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
                <span>Registrar Recebimento de Valores</span>
              </h4>

              {activeSession ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInitiatePayment();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-outline mb-1">1. Valor Recebido (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-bold text-outline">R$</span>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={receiptAmount}
                          onChange={(e) => setReceiptAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-outline mb-1">2. Destinação / Alocação do Pagamento</label>
                      <select
                        value={allocationDestination}
                        onChange={(e) => setAllocationDestination(e.target.value)}
                        className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                      >
                        <option value="auto_rent">Quitar Diárias em Aberto (Mais antigas primeiro)</option>
                        <option value="auto_all">Quitar Todos os Débitos (Mais antigos primeiro)</option>
                        <option value="general">Apenas Crédito Geral (Conta Corrente)</option>
                        {selectedDriverAR.length > 0 && (
                          <optgroup label="Títulos de Débito Específicos">
                            {selectedDriverAR.map(ar => (
                              <option key={ar.id} value={ar.id}>
                                {ar.titleType === "rent" ? "Diária" : ar.titleType === "fine" ? "Multa" : "Dano"} #{ar.id.substring(0,8).toUpperCase()} (Restante: R$ {(ar.amount - ar.paidAmount).toFixed(2)})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-outline mb-1">3. Método de Pagamento</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                      >
                        {PAYMENT_METHODS.map(m => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    {(paymentMethod === "pix" || paymentMethod === "card") && (
                      <div>
                        <label className="block text-[10px] font-black uppercase text-outline mb-1">4. Gateway de Adquirência</label>
                        <select
                          value={gatewayProvider}
                          onChange={(e) => setGatewayProvider(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                        >
                          {GATEWAY_PROVIDERS.filter(g => g.id !== "manual").map(g => (
                            <option key={g.id} value={g.id}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Custom surplus and partial payment selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        5. Destino de Saldo Excedente
                      </label>
                      <select
                        value={surplusDestination}
                        onChange={(e) => setSurplusDestination(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                      >
                        <option value="credit">Acumular Crédito (Conta Corrente)</option>
                        <option value="auto_fines">Deduzir das Multas (Mais antigas)</option>
                        <option value="auto_all">Deduzir de Qualquer Outro Débito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        6. Baixa de Diária Parcial
                      </label>
                      <select
                        value={partialTreatment}
                        onChange={(e) => setPartialTreatment(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none text-primary"
                      >
                        <option value="keep_partial">Manter diária pendente (Recomendado)</option>
                        <option value="force_paid_debit">Quitar diária & lançar saldo devedor</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 text-on-primary font-black rounded-lg hover:opacity-90 transition-all text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Lançar e Iniciar Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-center space-y-2">
                  <Lock className="w-5 h-5 text-red-500 mx-auto" />
                  <p className="font-bold text-red-700">Caixa Fechado</p>
                  <p className="text-[10px] text-outline">
                    Abra o turno de caixa no painel esquerdo para registrar recebimentos.
                  </p>
                </div>
              )}
            </div>

            {/* List of Open Billing Titles */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-geist">Títulos Pendentes em Aberto</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowNewArModal(true)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-all text-[10px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lançar Título Avulso</span>
                  </button>
                  {selectedDriverId && (
                    <button
                      onClick={() => setSelectedDriverId("")}
                      className="px-2.5 py-1 bg-surface-container text-on-surface border border-outline-variant rounded hover:bg-surface-container-high transition-all text-[10px]"
                    >
                      Limpar Seleção
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-outline-variant/60 max-h-80 overflow-y-auto pr-1">
                {selectedDriverAR.length === 0 ? (
                  <p className="text-center text-outline italic py-8">Este motorista não possui títulos pendentes em aberto.</p>
                ) : (
                  selectedDriverAR.map((ar) => {
                    const remaining = ar.amount - ar.paidAmount;
                    const isOverdue = new Date(ar.dueDate) < new Date();
                    return (
                      <div key={ar.id} className="py-3 flex justify-between items-center hover:bg-slate-50/40 px-2 rounded-lg transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border ${
                              ar.titleType === "rent" 
                                ? "bg-slate-100 text-slate-700 border-slate-300"
                                : ar.titleType === "fine"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : ar.titleType === "claim_deductible"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            }`}>
                              {ar.titleType === "rent" ? "Diária" : ar.titleType === "fine" ? "Multa" : "Dano"} #{ar.id.substring(0,8).toUpperCase()}
                            </span>
                            <span className="font-bold text-primary text-[11px]">Vencimento: {new Date(ar.dueDate).toLocaleDateString("pt-BR")}</span>
                            {isOverdue && (
                              <span className="text-[9px] bg-red-100 border border-red-200 text-red-600 px-1.5 py-0.2 rounded font-black uppercase flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Atrasado</span>
                              </span>
                            )}
                          </div>
                          <p className="text-on-surface-variant text-[10px]">
                            ID Fatura: {ar.id.substring(0, 8).toUpperCase()} • Valor Original: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ar.amount)}
                          </p>
                        </div>
                        <div className="text-right flex items-center space-x-4">
                          <div>
                            <p className="text-[10px] text-outline font-bold">Saldo Devedor</p>
                            <p className="font-black text-primary font-mono text-xs">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(remaining)}
                            </p>
                          </div>
                          {activeSession && (
                            <button
                              onClick={() => {
                                setReceiptAmount(String(remaining));
                                setAllocationDestination(ar.id);
                              }}
                              className="px-2.5 py-1.5 bg-surface-container hover:bg-slate-200 border border-outline-variant text-primary rounded font-bold transition-all text-[10px]"
                            >
                              Preencher Formulário
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant p-10 rounded-xl shadow-sm text-center text-on-surface-variant">
            <User className="w-[45px] h-[45px] text-outline mx-auto mb-4" />
            <h4 className="text-base font-extrabold text-primary font-geist">Selecione um Motorista</h4>
            <p className="text-xs mt-1.5">
              Utilize o campo de busca acima para selecionar um motorista corporativo e visualizar suas pendências financeiras.
            </p>
          </div>
        )}
      </div>

      {/* WEBHOOK SIMULATOR GATEWAY DIALOG */}
      {showCheckout && activePendingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-primary/5 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-primary font-geist uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-5 h-5 text-primary" />
                  <span>Terminal de Cobrança Integrado</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Gateway: {activePendingTx.gateway.toUpperCase()}</p>
              </div>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setActivePendingTx(null);
                }}
                className="p-1.5 rounded hover:bg-surface-container"
              >
                <X className="w-4 h-4 text-outline" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-center">
              {/* QR Code Graphic for Pix or Terminal spinner */}
              {activePendingTx.method === "pix" ? (
                <div className="space-y-4">
                  <div className="w-44 h-44 bg-slate-50 border border-outline-variant rounded-xl mx-auto flex items-center justify-center p-4 shadow-inner relative">
                    <span className="material-symbols-outlined text-[130px] text-primary">qr_code_2</span>
                    <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-30 animate-pulse"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-primary font-mono select-all break-all bg-slate-100 p-2 rounded border border-outline-variant/60">
                      00020101021226930014br.gov.bcb.pix2571pix.mercadopago.com/qr/{activePendingTx.id}
                    </p>
                    <p className="text-[9px] text-outline font-semibold uppercase">Copia e Cola Pix gerado automaticamente</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-6">
                  <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-semibold text-primary">Aguardando inserção/aprovação do cartão na maquininha física...</p>
                </div>
              )}

              <div className="bg-slate-50 p-4 border border-outline-variant/60 rounded-xl space-y-1.5 text-xs text-left">
                <div className="flex justify-between font-medium">
                  <span className="text-outline">Número da Transação:</span>
                  <span className="font-bold font-mono text-primary">{activePendingTx.transactionNumber}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-outline">Motorista:</span>
                  <span className="font-bold text-primary">{getDriverName(activePendingTx.driverId)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t">
                  <span className="text-primary uppercase tracking-wider text-[10px]">Valor da Operação:</span>
                  <span className="font-mono text-emerald-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(activePendingTx.amount)}
                  </span>
                </div>
              </div>

              {/* Simulation triggers (Anti-Fraud Simulator) */}
              <div className="space-y-2.5 pt-2 border-t border-outline-variant">
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-[10px] text-amber-800 text-left flex gap-2">
                  <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold uppercase block">Simulação de Callback de Produção</span>
                    Esta área permite disparar a webhook simulada que o Mercado Pago ou Stripe enviaria ao FleetOS após o pagamento do cliente.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setActivePendingTx(null);
                      alert("Processo cancelado pelo operador.");
                    }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-outline-variant font-bold text-xs rounded-lg transition-all"
                  >
                    Abortar Cobrança
                  </button>
                  <button
                    onClick={simulateWebhookConfirmation}
                    className="py-2.5 bg-emerald-600 hover:opacity-90 font-black text-xs text-on-primary rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Disparar Webhook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW ACCOUNTS RECEIVABLE TITLE MODAL */}
      {showNewArModal && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl relative">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-primary font-geist uppercase tracking-wider">Lançar Novo Título Financeiro (Fatura)</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Motorista: {selectedDriver.name}</p>
              </div>
              <button
                onClick={() => setShowNewArModal(false)}
                className="p-1 rounded hover:bg-surface-container"
              >
                <X className="w-4 h-4 text-outline" />
              </button>
            </div>

            <form onSubmit={handleCreateAr} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Valor do Título (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newArData.amount}
                    onChange={(e) => setNewArData({ ...newArData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Tipo de Faturamento</label>
                  <select
                    value={newArData.type}
                    onChange={(e) => setNewArData({ ...newArData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  >
                    <option value="rent">Aluguel / Diária</option>
                    <option value="fine">Multa de Trânsito</option>
                    <option value="claim_deductible">Franquia de Acidente</option>
                    <option value="adjustment">Ajuste / Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={newArData.dueDate}
                    onChange={(e) => setNewArData({ ...newArData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Vincular Contrato</label>
                  <select
                    value={newArData.contractId}
                    onChange={(e) => setNewArData({ ...newArData, contractId: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  >
                    <option value="">Nenhum Contrato</option>
                    {selectedDriverContracts.map(c => (
                      <option key={c.id} value={c.id}>Contrato #{c.id.substring(0,8).toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewArModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-outline-variant rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90"
                >
                  Confirmar Faturamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTORNO/VOID TRANSACTION MODAL */}
      {showVoidModal && txToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl relative">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>Estornar Transação Confirmada</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Código: {txToVoid.transactionNumber}</p>
              </div>
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setTxToVoid(null);
                }}
                className="p-1 rounded hover:bg-surface-container"
              >
                <X className="w-4 h-4 text-outline" />
              </button>
            </div>

            <form onSubmit={handleVoidTx} className="p-6 space-y-4 text-xs">
              <div className="bg-red-500/10 border border-red-500/20 text-red-800 p-3.5 rounded-lg">
                <p className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Aviso de Risco & Segurança</span>
                </p>
                Esta ação reverterá o saldo pago no título, retirará o crédito do caixa ativo e aplicará um débito compensatório no livro-razão do motorista.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Assinatura do Supervisor Coautor (Dual-Auth)</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Supervisor Financeiro"
                  value={voidSupervisor}
                  onChange={(e) => setVoidSupervisor(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Justificativa Operacional do Estorno</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva o motivo pelo qual este lançamento está sendo cancelado."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowVoidModal(false);
                    setTxToVoid(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-outline-variant rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-on-primary font-bold rounded-lg hover:bg-red-700"
                >
                  Confirmar Estorno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
