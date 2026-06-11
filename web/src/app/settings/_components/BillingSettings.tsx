"use client";

import React from "react";

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-4">
        <h3 className="text-base font-bold text-primary font-geist">Assinatura do FleetOS</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Consulte faturas de uso, limite de licenças e mude de plano corporativo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan details */}
        <div className="p-5 bg-surface-container-low border border-outline-variant rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">PLANO ATIVO</span>
            <h4 className="text-xl font-extrabold text-primary font-geist">Plano Corporativo Pro</h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">Gestão para frotas de até 50 veículos ativos.</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black text-primary font-geist">R$ 290,00 <span className="text-xs text-outline font-normal">/ mês</span></p>
            <p className="text-[9px] text-outline">Próxima renovação automática em 15/06/2026.</p>
          </div>
        </div>

        {/* Billing list */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Histórico de Cobranças</h4>
          <div className="border border-outline-variant rounded-xl overflow-hidden bg-white text-xs">
            <div className="grid grid-cols-4 bg-slate-50 p-3 font-semibold text-outline border-b border-outline-variant">
              <span>Vencimento</span>
              <span>Referência</span>
              <span>Valor BRL</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-outline-variant/60">
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono">15/06/2026</span>
                <span className="text-primary font-bold">Mensalidade Jun/26</span>
                <span className="font-mono">R$ 290,00</span>
                <span className="text-right font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded w-fit ml-auto border border-amber-500/20 text-[10px]">Aberto</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono">15/05/2026</span>
                <span className="text-primary font-bold">Mensalidade Mai/26</span>
                <span className="font-mono">R$ 290,00</span>
                <span className="text-right font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded w-fit ml-auto border border-emerald-500/20 text-[10px]">Pago</span>
              </div>
              <div className="grid grid-cols-4 p-3 items-center">
                <span className="font-mono">15/04/2026</span>
                <span className="text-primary font-bold">Mensalidade Abr/26</span>
                <span className="font-mono">R$ 290,00</span>
                <span className="text-right font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded w-fit ml-auto border border-emerald-500/20 text-[10px]">Pago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
