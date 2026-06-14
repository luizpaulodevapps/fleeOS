"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface OperationalBlockProps {
  vehicles: any[];
  groupedAlerts: any;
}

export function OperationalBlock({ vehicles, groupedAlerts }: OperationalBlockProps) {
  const router = useRouter();

  return (
    <div className="space-y-stack-lg animate-fade-in">
      
      {/* Shortcuts */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm bg-white">
        <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary mb-4">Centro de Operações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => router.push("/assignments")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">input</span>
            <span className="text-[11px] font-bold text-primary">Nova Entrega</span>
          </button>
          <button 
            onClick={() => router.push("/assignments")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">output</span>
            <span className="text-[11px] font-bold text-primary">Nova Devolução</span>
          </button>
          <button 
            onClick={() => router.push("/assignments")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">swap_horiz</span>
            <span className="text-[11px] font-bold text-primary">Nova Troca</span>
          </button>
          <button 
            onClick={() => router.push("/claims")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">shield</span>
            <span className="text-[11px] font-bold text-primary">Abrir Sinistro</span>
          </button>
          <button 
            onClick={() => router.push("/maintenance")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">build</span>
            <span className="text-[11px] font-bold text-primary">Abrir OS Oficina</span>
          </button>
          <button 
            onClick={() => router.push("/contracts")}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl hover:border-primary hover:bg-slate-50 transition-all group bg-white"
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-2 group-hover:scale-110 transition-transform">edit_document</span>
            <span className="text-[11px] font-bold text-primary">Novo Contrato</span>
          </button>
        </div>
      </section>

      {/* Warnings & Alerts Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm bg-white space-y-4">
        <div className="border-b border-outline-variant pb-3">
          <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary">Fila de Alertas e Vencimentos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Documentos */}
          <div>
            <span className="text-[10px] text-error font-extrabold uppercase tracking-wider block mb-2 font-mono">🚨 Documentos ({groupedAlerts.docs.length})</span>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {groupedAlerts.docs.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Sem pendências</p>
              ) : (
                groupedAlerts.docs.map((a: any) => (
                  <div key={a.id} className="p-3 bg-error/5 border border-error/10 rounded-xl text-xs">
                    <p className="font-bold text-primary">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{a.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financeiro */}
          <div>
            <span className="text-[10px] text-error font-extrabold uppercase tracking-wider block mb-2 font-mono">🚨 Financeiro ({groupedAlerts.fin.length})</span>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {groupedAlerts.fin.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Sem pendências</p>
              ) : (
                groupedAlerts.fin.map((a: any) => (
                  <div key={a.id} className="p-3 bg-error/5 border border-error/10 rounded-xl text-xs">
                    <p className="font-bold text-primary">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{a.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Oficina */}
          <div>
            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block mb-2 font-mono">🚨 Oficina ({groupedAlerts.maint.length})</span>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {groupedAlerts.maint.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Sem pendências</p>
              ) : (
                groupedAlerts.maint.map((a: any) => (
                  <div key={a.id} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs">
                    <p className="font-bold text-primary">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{a.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Almoxarifado */}
          <div>
            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block mb-2 font-mono">🚨 Almoxarifado ({groupedAlerts.est.length})</span>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {groupedAlerts.est.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Sem pendências</p>
              ) : (
                groupedAlerts.est.map((a: any) => (
                  <div key={a.id} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs">
                    <p className="font-bold text-primary">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{a.desc}</p>
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
