"use client";

import React, { useState } from "react";
import { AccountsReceivable, PaymentPlan, FinancialSettlement } from "../_lib/types";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  User, 
  Search, 
  TrendingDown, 
  CheckCircle, 
  X, 
  Layers, 
  DollarSign, 
  Percent, 
  Scale, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface CollectionsEngineProps {
  receivables: AccountsReceivable[];
  drivers: any[];
  paymentPlans: PaymentPlan[];
  settlements: FinancialSettlement[];
  reload: () => Promise<void>;
}

export function CollectionsEngine({
  receivables,
  drivers,
  paymentPlans,
  settlements,
  reload
}: CollectionsEngineProps) {
  const { addDocument, updateDocument } = useAuth();
  
  // Search Driver
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // Plan Creator Form
  const [selectedArIds, setSelectedArIds] = useState<string[]>([]);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [finePercentage, setFinePercentage] = useState<string>("0");

  const getDriverName = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.name : "N/A";
  };

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const driverOpenReceivables = receivables.filter(
    r => r.driverId === selectedDriverId && (r.status === "open" || r.status === "overdue")
  );

  // Filtered drivers for search
  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.cpf?.includes(q);
  });

  // Toggle AR selection
  const handleToggleArSelection = (id: string) => {
    setSelectedArIds(prev => 
      prev.includes(id) ? prev.filter(arId => arId !== id) : [...prev, id]
    );
  };

  // Calculations for settlement
  const originalDebt = driverOpenReceivables
    .filter(r => selectedArIds.includes(r.id))
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const discountVal = Number(discountAmount) || 0;
  const finePct = Number(finePercentage) || 0;
  const fineVal = (originalDebt * finePct) / 100;
  
  const settledAmount = Math.max(0, originalDebt + fineVal - discountVal);
  const monthlyAmount = installmentsCount > 0 ? (settledAmount / installmentsCount) : settledAmount;

  // Submit Settlement
  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || selectedArIds.length === 0) {
      alert("Por favor, selecione ao menos um título de débito.");
      return;
    }

    try {
      // 1. Create FinancialSettlement document
      const settlement = await addDocument("financial_settlements", {
        driverId: selectedDriverId,
        originalDebt,
        settledAmount,
        installments: installmentsCount,
        status: "signed",
        createdAt: new Date().toISOString()
      });

      // 2. Create PaymentPlan linked to settlement
      await addDocument("payment_plans", {
        driverId: selectedDriverId,
        arId: selectedArIds.join(","), // list of consolidated AR ids
        totalAmount: settledAmount,
        installmentsCount,
        monthlyAmount,
        status: "active"
      });

      // 3. Mark original AR titles as "cancelled" / Negotiated
      for (const arId of selectedArIds) {
        await updateDocument("accounts_receivable", arId, {
          status: "cancelled"
        });
      }

      // 4. Create new installment AR titles
      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i); // Next month

        await addDocument("accounts_receivable", {
          driverId: selectedDriverId,
          contractId: "settlement-" + settlement.id.substring(0,6),
          dueDate: dueDate.toISOString().split("T")[0],
          amount: monthlyAmount,
          titleType: "adjustment",
          status: "open",
          paidAmount: 0,
          createdAt: new Date().toISOString()
        });
      }

      setSelectedArIds([]);
      setDiscountAmount("0");
      setFinePercentage("0");
      setInstallmentsCount(3);
      alert("Acordo de cobrança assinado e parcelamento gerado com sucesso!");
      await reload();
    } catch (e) {
      console.error("Erro ao gerar acordo", e);
    }
  };

  // Lists of plans/settlements for this driver (or general)
  const activePlans = paymentPlans.filter(p => !selectedDriverId || p.driverId === selectedDriverId);
  const signedSettlements = settlements.filter(s => !selectedDriverId || s.driverId === selectedDriverId);

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Header Card */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-primary font-geist flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-primary" />
            <span>Módulo de Acordos & Cobrança de Devedores</span>
          </h3>
          <p className="text-on-surface-variant text-[11px]">Consolide múltiplas diárias atrasadas ou franquias de sinistros de motoristas em planos de parcelamento renegociados.</p>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-outline absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar motorista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
          />
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 z-30 bg-background border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-32 overflow-y-auto mt-1">
              {filteredDrivers.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDriverId(d.id);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors font-medium flex justify-between"
                >
                  <span>{d.name}</span>
                  <span className="text-outline font-mono text-[9px]">{d.cpf}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Renegotiation Wizard */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <div className="border-b pb-2 flex justify-between items-center">
            <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist">Criar Acordo de Parcelamento</p>
            {selectedDriver && (
              <span className="text-[10px] font-bold text-primary">Motorista: {selectedDriver.name}</span>
            )}
          </div>

          {!selectedDriver ? (
            <div className="p-10 text-center text-on-surface-variant space-y-2">
              <User className="w-10 h-10 text-outline mx-auto" />
              <p className="font-bold">Nenhum motorista selecionado</p>
              <p className="text-[10px]">Use o campo de busca acima para selecionar um devedor e renegociar suas dívidas.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateSettlement} className="space-y-4">
              {/* Overdue titles list checkboxes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-outline">1. Selecione as Faturas em Aberto para Consolidar</label>
                <div className="border border-outline-variant rounded-lg divide-y max-h-48 overflow-y-auto">
                  {driverOpenReceivables.length === 0 ? (
                    <p className="p-4 text-center text-outline italic">Este motorista não possui diárias ou cobranças em atraso.</p>
                  ) : (
                    driverOpenReceivables.map(ar => (
                      <label key={ar.id} className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer font-medium">
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={selectedArIds.includes(ar.id)}
                            onChange={() => handleToggleArSelection(ar.id)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                          />
                          <div>
                            <span className="font-bold text-primary capitalize">{ar.titleType === "rent" ? "Aluguel" : ar.titleType === "fine" ? "Multa" : "Franquia"}</span>
                            <span className="text-outline text-[10px] block mt-0.5">Vence: {new Date(ar.dueDate).toLocaleDateString("pt-BR")} | ID: #{ar.id.substring(0,8).toUpperCase()}</span>
                          </div>
                        </div>
                        <span className="font-black text-primary font-mono">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ar.amount - ar.paidAmount)}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {selectedArIds.length > 0 && (
                <div className="space-y-4 pt-3 border-t">
                  <p className="block text-[10px] font-black uppercase text-outline">2. Termos do Acordo & Taxas</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-outline font-semibold mb-1">Parcelas (Vezes)</label>
                      <select
                        value={installmentsCount}
                        onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <option key={n} value={n}>{n}x parcelas</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-outline font-semibold mb-1">Acréscimo/Multa (%)</label>
                      <input
                        type="number"
                        value={finePercentage}
                        onChange={(e) => setFinePercentage(e.target.value)}
                        className="w-full px-2.5 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-outline font-semibold mb-1">Desconto (R$)</label>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-full px-2.5 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="bg-slate-50 border border-outline-variant/60 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-outline">Dívida Consolidada:</span>
                      <span className="font-bold text-primary font-mono">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(originalDebt)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-outline">Acréscimo de Juros:</span>
                      <span className="font-bold text-red-600 font-mono">
                        +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(fineVal)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-outline">Abatimento / Desconto:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(discountVal)}
                      </span>
                    </div>
                    <div className="flex justify-between font-black border-t pt-2 text-sm">
                      <span className="text-primary uppercase tracking-wider text-[10px]">Valor Renegociado Total:</span>
                      <span className="text-primary font-mono">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(settledAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1">
                      <span className="text-outline">Parcelas Mensais:</span>
                      <span className="text-emerald-600 font-mono">
                        {installmentsCount}x de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:opacity-90 font-black text-xs text-on-primary rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Assinar Acordo & Emitir Carnê</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Active renegotiations logs */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <p className="font-extrabold text-[11px] text-primary uppercase tracking-wider font-geist">Acordos de Cobrança em Vigor</p>
          
          <div className="space-y-4 divide-y divide-outline-variant/60 max-h-96 overflow-y-auto pr-1">
            {signedSettlements.length === 0 ? (
              <p className="text-center text-outline italic py-8">Nenhum acordo ativo de parcelamento.</p>
            ) : (
              signedSettlements.map((set, idx) => (
                <div key={set.id} className={`pt-3 flex flex-col space-y-1.5 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                  <div className="flex justify-between font-bold">
                    <span className="text-primary">Acordo #{set.id.substring(0, 6).toUpperCase()}</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px] bg-emerald-50 border border-emerald-200 px-1.5 rounded">
                      Assinado
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-on-surface-variant font-medium space-y-0.5">
                    <p>Devedor: <strong className="text-primary">{getDriverName(set.driverId)}</strong></p>
                    <p>Dívida Original: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(set.originalDebt)}</p>
                    <p>Dívida Consolidada: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(set.settledAmount)} ({set.installments}x parcelas)</p>
                    <p className="flex items-center gap-1 text-[9px] text-outline font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      Emitido em: {new Date(set.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
