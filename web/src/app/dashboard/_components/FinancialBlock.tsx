"use client";

import React from "react";
import { DollarSign, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinancialBlockProps {
  calculations: any;
  cashierMovements: any[];
}

export function FinancialBlock({ calculations, cashierMovements }: FinancialBlockProps) {
  const router = useRouter();

  return (
    <div className="space-y-stack-lg animate-fade-in">
      
      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black">Mensal</span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.receitaContratada)}
          </div>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1 block">Receita Contratada</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
            <span className="text-[9px] bg-accent-green/10 text-accent-green px-2 py-0.5 rounded font-black">Acumulado</span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.receitaRecebida)}
          </div>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1 block">Receita Recebida (Realizada)</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-error-container/20 rounded-lg text-error">
              <span className="material-symbols-outlined text-[20px]">warning_amber</span>
            </span>
            <span className="text-[9px] bg-error/10 text-error px-2 py-0.5 rounded font-black uppercase tracking-wider">Atrasado</span>
          </div>
          <div className="text-2xl font-black font-geist text-error">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.inadimplencia)}
          </div>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1 block">Inadimplência Acumulada</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </span>
            <span className={calculations.openCashier ? "text-[9px] bg-accent-green/10 text-accent-green px-2 py-0.5 rounded font-black uppercase" : "text-[9px] bg-outline-variant text-outline px-2 py-0.5 rounded font-black uppercase"}>
              {calculations.openCashier ? "Aberto" : "Fechado"}
            </span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {calculations.openCashier 
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.openCashier.openingAmount + cashierMovements.reduce((sum, m) => sum + m.amount, 0))
              : "R$ 0,00"}
          </div>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1 block">Frente de Caixa (Saldo Atual)</span>
        </div>
      </div>

      {/* Financial Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Costs Breakdown */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-error" />
              💸 Centro de Custos do Mês
            </h3>
            <span className="text-[9px] bg-error/10 text-error px-2 py-0.5 rounded font-black">Saídas</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Oficina & Mão de Obra</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.manutencao.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Peças & Insumos</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.pecas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Trocas de Pneus</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.pneus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Consertos de Sinistros</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.sinistros.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Multas Pagas</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.multas.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Seguro & Administrativo</span>
              <span className="font-bold text-primary">R$ {calculations.costsBreakdown.administrativo.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-outline-variant/60 pt-2 text-xs font-bold text-error">
              <span>Total Operacional</span>
              <span>R$ {calculations.totalMaintCosts.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Drivers Account */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              👤 Conta Corrente dos Motoristas
            </h3>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black font-mono">Consolidado</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-accent-green/5 border border-accent-green/10 p-3 rounded-lg text-center">
              <span className="text-[9px] text-outline font-bold uppercase block">Saldo Credor (+)</span>
              <span className="text-xl font-black text-accent-green">{calculations.driversPos}</span>
              <p className="text-[8px] text-on-surface-variant mt-0.5">motoristas com crédito</p>
            </div>
            <div className="bg-error/5 border border-error/10 p-3 rounded-lg text-center">
              <span className="text-[9px] text-outline font-bold uppercase block">Saldo Devedor (-)</span>
              <span className="text-xl font-black text-error">{calculations.driversNeg}</span>
              <p className="text-[8px] text-on-surface-variant mt-0.5">motoristas com débito</p>
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant p-3 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Total Pendente a Receber</span>
              <span className="text-lg font-black text-primary">R$ {calculations.totalReceivables.toLocaleString()}</span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-outline">payments</span>
          </div>
        </div>

        {/* Cashier Movements */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary">Movimentações de Caixa Recentes</h3>
            <div className="divide-y divide-outline-variant/60 max-h-[160px] overflow-y-auto mt-2">
              {cashierMovements.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-4 text-center">Nenhuma movimentação no caixa hoje.</p>
              ) : (
                cashierMovements.slice(0, 3).map((mov, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-[11px]">
                    <div>
                      <p className="font-bold text-primary">{mov.description}</p>
                      <p className="text-on-surface-variant text-[9px]">{new Date(mov.createdAt).toLocaleTimeString()} • {mov.paymentMethod}</p>
                    </div>
                    <span className={mov.type === "RECEIPT" ? "font-bold text-accent-green" : "font-bold text-error"}>
                      {mov.type === "RECEIPT" ? "+" : "-"} R$ {mov.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button
            onClick={() => router.push("/financial?tab=cashier")}
            className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 transition-all text-center mt-3"
          >
            Abrir Frente de Caixa
          </button>
        </div>
      </div>
    </div>
  );
}
