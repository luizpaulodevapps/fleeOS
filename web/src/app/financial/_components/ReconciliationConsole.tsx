"use client";

import React, { useState } from "react";
import { FinancialTransaction } from "../_lib/types";
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  UploadCloud, 
  FileCheck, 
  Search, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Calendar,
  X
} from "lucide-react";

interface ReconciliationConsoleProps {
  transactions: FinancialTransaction[];
  drivers: any[];
  reload: () => Promise<void>;
}

// Simulated Imported Bank Statement Line
interface BankStatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  matchedTxId: string | null;
}

export function ReconciliationConsole({ transactions, drivers }: ReconciliationConsoleProps) {
  const [bankStatement, setBankStatement] = useState<BankStatementLine[]>([
    { id: "stmt_001", date: "2026-06-13", description: "PIX RECEBIDO - LUIZ SILVA", amount: 150.00, type: "credit", matchedTxId: null },
    { id: "stmt_002", date: "2026-06-13", description: "PIX RECEBIDO - CARLOS SOUZA", amount: 300.00, type: "credit", matchedTxId: null },
    { id: "stmt_003", date: "2026-06-12", description: "TARIFA BANCARIA PJ", amount: 9.90, type: "debit", matchedTxId: null },
    { id: "stmt_004", date: "2026-06-12", description: "PIX RECEBIDO - MARIANA COSTA", amount: 120.00, type: "credit", matchedTxId: null },
    { id: "stmt_005", date: "2026-06-11", description: "PGTO CARTAO CREDITO - REDE", amount: 450.00, type: "credit", matchedTxId: null },
    { id: "stmt_006", date: "2026-06-11", description: "PIX RECEBIDO - FERNANDO PEREIRA", amount: 80.00, type: "credit", matchedTxId: null }
  ]);

  const [selectedStmtLine, setSelectedStmtLine] = useState<BankStatementLine | null>(null);
  const [searchTxQuery, setSearchTxQuery] = useState("");

  const approvedTransactions = transactions.filter(t => t.status === "approved");

  const getDriverName = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.name : "N/A";
  };

  // Auto-Match engine (simulates matching logic based on exact values)
  const handleAutoMatch = () => {
    let matchedCount = 0;
    const updatedStmt = bankStatement.map(line => {
      if (line.matchedTxId) return line;

      // Find an unmatched system transaction with exact amount
      const candidate = approvedTransactions.find(t => 
        t.amount === line.amount && 
        !bankStatement.some(l => l.matchedTxId === t.id)
      );

      if (candidate) {
        matchedCount++;
        return { ...line, matchedTxId: candidate.id };
      }
      return line;
    });

    setBankStatement(updatedStmt);
    alert(`Algoritmo Smart-Match: ${matchedCount} lançamentos correspondidos automaticamente!`);
  };

  const handleManualMatch = (txId: string) => {
    if (!selectedStmtLine) return;
    setBankStatement(prev => prev.map(line => 
      line.id === selectedStmtLine.id ? { ...line, matchedTxId: txId } : line
    ));
    setSelectedStmtLine(null);
    setSearchTxQuery("");
    alert("Correspondência manual efetuada com sucesso!");
  };

  const handleUnmatch = (lineId: string) => {
    setBankStatement(prev => prev.map(line => 
      line.id === lineId ? { ...line, matchedTxId: null } : line
    ));
  };

  // Filtered approved system transactions
  const filteredTxs = approvedTransactions.filter(t => {
    const term = searchTxQuery.toLowerCase();
    const drvName = getDriverName(t.driverId).toLowerCase();
    return t.transactionNumber.toLowerCase().includes(term) || drvName.includes(term) || String(t.amount).includes(term);
  });

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-primary font-geist flex items-center gap-1.5">
            <FileCheck className="w-5 h-5 text-primary" />
            <span>Painel de Conciliação de Extratos Bancários</span>
          </h3>
          <p className="text-on-surface-variant text-[11px]">Compare os lançamentos do seu banco (OFX/PIX Feed) com os pagamentos registrados no FleetOS para auditar fraudes e duplicidades.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAutoMatch}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-on-primary font-bold rounded-lg hover:opacity-90 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Executar Smart-Match</span>
          </button>
          <button
            onClick={() => alert("Upload de arquivo de extrato bancário .OFX / .CSV")}
            className="flex items-center space-x-1.5 px-4 py-2 bg-surface-container text-on-surface border border-outline-variant rounded-lg hover:bg-slate-200 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importar Extrato OFX</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Bank Feed */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist">Extrato do Banco Importado</p>
          
          <div className="divide-y divide-outline-variant/60">
            {bankStatement.map(line => {
              const matchedTx = transactions.find(t => t.id === line.matchedTxId);
              return (
                <div key={line.id} className="py-3.5 flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${line.type === "credit" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className="font-bold text-primary">{line.description}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {new Date(line.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span>•</span>
                      <span className="font-bold">ID: {line.id}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <span className={`font-mono font-black text-sm block ${line.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                      {line.type === "credit" ? "+" : "-"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(line.amount)}
                    </span>

                    {/* Matched system info */}
                    {matchedTx ? (
                      <div className="flex items-center space-x-2 justify-end">
                        <div className="text-[10px] text-right font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Conciliado ({matchedTx.transactionNumber})
                        </div>
                        <button
                          onClick={() => handleUnmatch(line.id)}
                          className="text-red-500 font-bold hover:underline"
                        >
                          Desfazer
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 justify-end">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Pendente</span>
                        </span>
                        <button
                          onClick={() => setSelectedStmtLine(line)}
                          className="px-2.5 py-1 bg-primary text-on-primary font-bold rounded hover:opacity-90"
                        >
                          Vincular
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Manual Reconciliation Linker */}
        <div className="lg:col-span-5 space-y-6">
          {selectedStmtLine ? (
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-extrabold text-primary font-geist uppercase tracking-wider text-[10px]">Vincular Lançamento Manual</h4>
                <button onClick={() => setSelectedStmtLine(null)} className="text-outline hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 border border-outline-variant/60 p-4 rounded-lg space-y-1">
                <span className="text-outline uppercase text-[9px] font-bold">Lançamento do Banco</span>
                <p className="font-bold text-primary">{selectedStmtLine.description}</p>
                <p className="font-black text-emerald-600 font-mono text-sm">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedStmtLine.amount)}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase text-outline">Pesquise o Pagamento no Sistema</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Número da Transação, valor ou motorista..."
                    value={searchTxQuery}
                    onChange={(e) => setSearchTxQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-outline-variant/60 max-h-52 overflow-y-auto pr-1">
                {filteredTxs.length === 0 ? (
                  <p className="text-center text-outline italic py-6">Nenhum pagamento correspondente encontrado no sistema.</p>
                ) : (
                  filteredTxs.map(tx => (
                    <div key={tx.id} className="py-2.5 flex justify-between items-center hover:bg-slate-50 px-1.5 rounded transition-all">
                      <div>
                        <p className="font-bold text-primary">{tx.transactionNumber}</p>
                        <p className="text-on-surface-variant text-[10px] mt-0.5">
                          {getDriverName(tx.driverId)} • {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <span className="font-bold font-mono text-primary">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount)}
                        </span>
                        <button
                          onClick={() => handleManualMatch(tx.id)}
                          className="px-2 py-1 bg-emerald-600 text-on-primary rounded hover:bg-emerald-700 font-bold text-[10px]"
                        >
                          Vincular
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm text-center text-on-surface-variant">
              <HelpCircle className="w-12 h-12 text-outline mx-auto mb-3" />
              <h4 className="text-xs font-black text-primary font-geist uppercase tracking-wider">Conciliação Ativa</h4>
              <p className="text-on-surface-variant mt-1.5 leading-relaxed">
                Clique no botão <strong>Vincular</strong> de qualquer lançamento pendente no extrato bancário para localizar o respectivo pagamento e auditar sua liquidação.
              </p>
            </div>
          )}

          {/* KPI Mini card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm space-y-3.5">
            <h4 className="font-bold text-[10px] text-outline uppercase tracking-wider">Resumo do Mapeamento</h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-outline">Conciliados (Banco):</span>
                <span className="font-bold text-emerald-600">
                  {bankStatement.filter(l => l.matchedTxId !== null).length} / {bankStatement.length}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(bankStatement.filter(l => l.matchedTxId !== null).length / bankStatement.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between font-medium pt-1 border-t text-[11px]">
                <span className="text-outline">Discrepâncias de Caixa:</span>
                <span className="font-bold text-red-500">0 detectadas</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
