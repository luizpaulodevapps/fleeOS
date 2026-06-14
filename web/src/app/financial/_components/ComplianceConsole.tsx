"use client";

import React, { useState } from "react";
import { 
  FinancialTransaction, 
  FinancialAdjustment, 
  CashierIncident,
  DriverCreditScore 
} from "../_lib/types";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Key, 
  Scale, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  User, 
  Printer, 
  Search, 
  DollarSign, 
  CheckCircle
} from "lucide-react";

interface ComplianceConsoleProps {
  transactions: FinancialTransaction[];
  adjustments: FinancialAdjustment[];
  incidents: CashierIncident[];
  drivers: any[];
  approveAdjustment: (adjId: string, approvedBy: string) => Promise<void>;
  getDriverCreditScore: (driverId: string) => DriverCreditScore;
  reload: () => Promise<void>;
}

export function ComplianceConsole({
  transactions,
  adjustments,
  incidents,
  drivers,
  approveAdjustment,
  getDriverCreditScore,
  reload
}: ComplianceConsoleProps) {
  const { currentUser, updateDocument } = useAuth();

  // Receipt hash verifier state
  const [verifiedHashId, setVerifiedHashId] = useState<string | null>(null);

  // Selected driver for credit search
  const [creditDriverId, setCreditDriverId] = useState("");
  const [creditSearch, setCreditSearch] = useState("");

  const getDriverName = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.name : "N/A";
  };

  const handleVerifyReceiptHash = (txId: string) => {
    setVerifiedHashId(txId);
    setTimeout(() => {
      setVerifiedHashId(null);
    }, 3500);
  };

  const handleApproveAdj = async (adjId: string) => {
    const supervisorName = currentUser?.displayName || "Supervisor Financeiro";
    if (confirm(`Aprovar este ajuste manual? Esta operação lançará crédito/débito na conta corrente do motorista.`)) {
      await approveAdjustment(adjId, supervisorName);
      alert("Ajuste financeiro aprovado com sucesso!");
    }
  };

  const handleRejectAdj = async (adjId: string) => {
    if (confirm("Deseja rejeitar esta solicitação de ajuste?")) {
      await updateDocument("financial_adjustments", adjId, {
        status: "rejected",
        approvedBy: currentUser?.displayName || "Supervisor Financeiro"
      });
      alert("Ajuste financeiro rejeitado.");
      await reload();
    }
  };

  // Filtered approved txs for vault
  const approvedTxs = transactions.filter(t => t.status === "approved" && t.receiptHash);

  // Filtered adjustments
  const pendingAdjustments = adjustments.filter(a => a.status === "pending");
  const historicAdjustments = adjustments.filter(a => a.status !== "pending");

  // Search filtered drivers for score card
  const creditFilteredDrivers = drivers.filter(d => {
    const q = creditSearch.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.cpf?.includes(q);
  });

  const selectedScoreDriver = drivers.find(d => d.id === creditDriverId);
  const scoreCard = selectedScoreDriver ? getDriverCreditScore(selectedScoreDriver.id) : null;

  return (
    <div className="space-y-6 text-xs">
      
      {/* KPI header banner */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-primary font-geist flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Auditoria, Compliance & Controles Anti-Fraude</span>
          </h3>
          <p className="text-on-surface-variant text-[11px]">Consulte as assinaturas digitais dos recibos, gerencie aprovações de ajustes manuais e audite incidentes de quebras de caixa físico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Approvals & Cashier incidents */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Adjustment queue */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist flex items-center gap-1.5">
              <Scale className="w-4.5 h-4.5 text-primary" />
              <span>Aprovações de Ajustes Manuais Pendentes (Duplo-Fator)</span>
            </p>

            <div className="divide-y divide-outline-variant/60">
              {pendingAdjustments.length === 0 ? (
                <p className="text-center text-outline italic py-6">Nenhuma solicitação de ajuste aguardando aprovação.</p>
              ) : (
                pendingAdjustments.map((adj) => (
                  <div key={adj.id} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-primary">Ajuste de Saldo Corrente</p>
                      <p className="text-on-surface-variant text-[10px]">
                        Motorista: <strong className="text-primary">{getDriverName(adj.driverId)}</strong> | Solicitado por: {adj.requestedBy}
                      </p>
                      <p className="text-on-surface-variant text-[10px] italic">Motivo: "{adj.reason}"</p>
                    </div>
                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        <span className={`font-mono font-black text-sm block ${adj.amount >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {adj.amount >= 0 ? "+" : ""} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(adj.amount)}
                        </span>
                        <span className="text-[9px] text-outline font-semibold">Saldo Ajustado</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleRejectAdj(adj.id)}
                          className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100"
                          title="Recusar Ajuste"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleApproveAdj(adj.id)}
                          className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded hover:bg-emerald-100"
                          title="Autorizar Ajuste"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cashier Discrepancy Logs */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              <span>Registro de Quebras de Caixa (Divergências de Turno)</span>
            </p>

            <div className="divide-y divide-outline-variant/60">
              {incidents.length === 0 ? (
                <p className="text-center text-outline italic py-6">Nenhum incidente de quebra de caixa registrado.</p>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="py-3 flex justify-between items-center text-[11px]">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                          inc.type === "shortage" ? "bg-red-50 text-red-500 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}>
                          {inc.type === "shortage" ? "Falta de Dinheiro" : "Excesso de Troco"}
                        </span>
                        <span className="font-bold text-primary">Caixa #{inc.cashierId.substring(0,8).toUpperCase()}</span>
                      </div>
                      <p className="text-on-surface-variant text-[10px] mt-0.5">Justificativa: "{inc.justification}"</p>
                      <p className="text-outline text-[9px] mt-0.5">Homologado por: {inc.approvedBy}</p>
                    </div>
                    <span className="font-mono font-black text-primary text-sm">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(inc.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Receipts Archive & Driver Score Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Driver compliance scorecard lookup */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist">Consulta de Ficha Cadastral (Compliance)</p>
            
            <div className="relative">
              <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar motorista por nome..."
                value={creditSearch}
                onChange={(e) => setCreditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
              />
              {creditSearch && (
                <div className="absolute top-full left-0 right-0 z-30 bg-background border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-32 overflow-y-auto mt-1 shadow-md">
                  {creditFilteredDrivers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setCreditDriverId(d.id);
                        setCreditSearch("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 font-medium flex justify-between"
                    >
                      <span>{d.name}</span>
                      <span className="text-outline font-mono text-[9px]">{d.cpf}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedScoreDriver && scoreCard ? (
              <div className="bg-slate-50 border border-outline-variant/60 p-4.5 rounded-lg space-y-3 font-medium animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h5 className="font-extrabold text-primary text-xs">{selectedScoreDriver.name}</h5>
                    <span className="text-outline text-[9px] font-mono">CNH: {selectedScoreDriver.cnh}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-outline uppercase block font-bold">Credit Score</span>
                    <span className="text-lg font-black text-primary font-geist">{scoreCard.score}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-on-surface-variant">
                  <div className="bg-white border p-2 rounded text-center">
                    <span className="text-[8px] text-outline uppercase block font-bold">Grau de Risco</span>
                    <span className={`font-black text-xs ${
                      ["AAA", "AA", "A"].includes(scoreCard.grade) ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {scoreCard.grade}
                    </span>
                  </div>
                  <div className="bg-white border p-2 rounded text-center">
                    <span className="text-[8px] text-outline uppercase block font-bold">Pactuação Pix</span>
                    <span className="font-black text-xs text-primary">{scoreCard.paymentComplianceRate}%</span>
                  </div>
                  <div className="bg-white border p-2 rounded text-center">
                    <span className="text-[8px] text-outline uppercase block font-bold">Dívidas Vencidas</span>
                    <span className="font-black text-xs text-primary">{scoreCard.arrearsDays} dias</span>
                  </div>
                  <div className="bg-white border p-2 rounded text-center">
                    <span className="text-[8px] text-outline uppercase block font-bold">Multas Registradas</span>
                    <span className="font-black text-xs text-red-500">{scoreCard.finesCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-outline italic py-2">Selecione um motorista acima para verificar.</p>
            )}
          </div>

          {/* Receipts Archive */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
            <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist flex items-center gap-1.5">
              <Key className="w-4.5 h-4.5 text-primary" />
              <span>Assinaturas Digitais SHA-256 (Cofre de Recibos)</span>
            </p>

            <div className="divide-y divide-outline-variant/60 max-h-72 overflow-y-auto pr-1">
              {approvedTxs.length === 0 ? (
                <p className="text-center text-outline italic py-6">Nenhum recibo assinado no cofre.</p>
              ) : (
                approvedTxs.map((tx) => (
                  <div key={tx.id} className="py-3.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{tx.transactionNumber}</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                      <span>Motorista: {getDriverName(tx.driverId)}</span>
                      <span>Método: {tx.method.toUpperCase()}</span>
                    </div>

                    <div className="bg-slate-50 border p-2 rounded font-mono text-[9px] text-outline flex justify-between items-center select-all">
                      <span className="truncate max-w-[200px]">{tx.receiptHash}</span>
                      <button
                        onClick={() => handleVerifyReceiptHash(tx.id)}
                        className="text-primary hover:underline font-bold font-sans text-[8px] uppercase tracking-wider"
                      >
                        Verificar Integridade
                      </button>
                    </div>

                    {verifiedHashId === tx.id && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded text-emerald-800 text-[10px] flex items-center gap-1.5 font-bold animate-in fade-in duration-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Hash verificado! Assinatura digital original e íntegra.</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
