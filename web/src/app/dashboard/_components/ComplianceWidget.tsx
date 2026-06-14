"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, CalendarClock, Gauge, AlertOctagon, 
  HelpCircle, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle 
} from "lucide-react";

interface ComplianceWidgetProps {
  calculations: {
    activeAlvaras: number;
    alvarasExpiring30: number;
    gnvExpiring60: number;
    irregularTaximeters: number;
    blockedRegulatory: number;
    expiredCondutax?: number;
    complianceExcellent?: number;
    complianceWarning?: number;
    complianceCritical?: number;
  };
}

export function ComplianceWidget({ calculations }: ComplianceWidgetProps) {
  const {
    activeAlvaras = 0,
    alvarasExpiring30 = 0,
    gnvExpiring60 = 0,
    irregularTaximeters = 0,
    blockedRegulatory = 0,
    expiredCondutax = 0,
    complianceExcellent = 0,
    complianceWarning = 0,
    complianceCritical = 0
  } = calculations;

  return (
    <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Widget Header */}
      <div className="border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="font-geist text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-indigo-600" />
            🚨 Compliance & Centro Regulatório
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Monitoramento de scores de conformidade de frota, vistorias DTP, GNV, multas e Condutax.
          </p>
        </div>
        <Link 
          href="/dispatcher" 
          className="text-[10px] bg-indigo-650 hover:bg-indigo-700 text-white font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-auto transition-all shadow-sm shrink-0"
        >
          <span>Painel de Controle</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid: Compliance Score Distribution & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Score Categories (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Distribuição de Scores da Frota</span>
          
          <div className="grid grid-cols-3 gap-2">
            
            {/* Excellent */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-lg font-black text-emerald-950 block mt-1.5">{complianceExcellent}</span>
              <span className="text-[8px] font-bold text-emerald-800 uppercase block tracking-wide">Excelente</span>
            </div>

            {/* Warning */}
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
              <span className="text-lg font-black text-amber-950 block mt-1.5">{complianceWarning}</span>
              <span className="text-[8px] font-bold text-amber-800 uppercase block tracking-wide">Atenção</span>
            </div>

            {/* Critical */}
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-center">
              <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />
              <span className="text-lg font-black text-red-950 block mt-1.5">{complianceCritical}</span>
              <span className="text-[8px] font-bold text-red-800 uppercase block tracking-wide">Crítico</span>
            </div>

          </div>
          <p className="text-[9px] text-slate-500 text-center font-medium italic mt-1.5">
            Scores atualizados diariamente com base em pendências de vistoria, multas e Condutax.
          </p>
        </div>

        {/* Right Side: Alerts list (3 Cols) */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3.5">
          
          {/* Alert 1: Alvarás Expiring */}
          <div className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all ${
            alvarasExpiring30 > 0 ? "bg-amber-50 border-amber-250/60" : "bg-slate-50/50 border-slate-100"
          }`}>
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">Alvarás (30d)</span>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className={`text-xl font-black ${alvarasExpiring30 > 0 ? "text-amber-900" : "text-slate-800"}`}>
                {alvarasExpiring30}
              </span>
              <CalendarClock className={`w-4.5 h-4.5 ${alvarasExpiring30 > 0 ? "text-amber-500" : "text-slate-400"}`} />
            </div>
          </div>

          {/* Alert 2: GNV Expiring */}
          <div className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all ${
            gnvExpiring60 > 0 ? "bg-orange-50/60 border-orange-250/60" : "bg-slate-50/50 border-slate-100"
          }`}>
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">GNV (60d)</span>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className={`text-xl font-black ${gnvExpiring60 > 0 ? "text-orange-900" : "text-slate-800"}`}>
                {gnvExpiring60}
              </span>
              <HelpCircle className={`w-4.5 h-4.5 ${gnvExpiring60 > 0 ? "text-orange-500" : "text-slate-400"}`} />
            </div>
          </div>

          {/* Alert 3: Condutax Expired */}
          <div className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all ${
            expiredCondutax > 0 ? "bg-rose-50 border-rose-250/60" : "bg-slate-50/50 border-slate-100"
          }`}>
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">Condutax Vencidos</span>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className={`text-xl font-black ${expiredCondutax > 0 ? "text-rose-900" : "text-slate-800"}`}>
                {expiredCondutax}
              </span>
              <AlertCircle className={`w-4.5 h-4.5 ${expiredCondutax > 0 ? "text-rose-500" : "text-slate-400"}`} />
            </div>
          </div>

          {/* Alert 4: Blocked Regulatory */}
          <div className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all ${
            blockedRegulatory > 0 ? "bg-red-50 border-red-250/60 animate-pulse-subtle" : "bg-slate-50/50 border-slate-100"
          }`}>
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">Carros Bloqueados</span>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className={`text-xl font-black ${blockedRegulatory > 0 ? "text-red-900" : "text-slate-800"}`}>
                {blockedRegulatory}
              </span>
              <AlertOctagon className={`w-4.5 h-4.5 ${blockedRegulatory > 0 ? "text-red-500" : "text-slate-400"}`} />
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
