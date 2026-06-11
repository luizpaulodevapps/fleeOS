"use client";

import React from "react";
import { ExpirationAlert } from "../_lib/types";
import { AlertTriangle, Clock, Search, ShieldAlert, CheckCircle, Bell } from "lucide-react";

interface AlertsTabProps {
  alerts: ExpirationAlert[];
  alertSearchTerm: string;
  setAlertSearchTerm: (val: string) => void;
  alertTypeFilter: string;
  setAlertTypeFilter: (val: string) => void;
}

export function AlertsTab({
  alerts,
  alertSearchTerm,
  setAlertSearchTerm,
  alertTypeFilter,
  setAlertTypeFilter
}: AlertsTabProps) {

  const expiredCount = alerts.filter(a => a.days < 0).length;
  const criticalCount = alerts.filter(a => a.days >= 0 && a.days <= 10).length;
  const warningCount = alerts.filter(a => a.days > 10).length;

  return (
    <div className="space-y-6">
      {/* Overview summaries of alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-650 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-outline font-bold uppercase">Vencidos / Irregulares</p>
            <p className="text-xl font-black text-red-650 font-geist mt-0.5">{expiredCount} alertas</p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-outline font-bold uppercase">Críticos (&lt; 10 dias)</p>
            <p className="text-xl font-black text-amber-600 font-geist mt-0.5">{criticalCount} alertas</p>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-outline font-bold uppercase">Atenção (30 dias)</p>
            <p className="text-xl font-black text-blue-600 font-geist mt-0.5">{warningCount} alertas</p>
          </div>
        </div>
      </div>

      {/* Main Alerts Queue panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4 text-xs font-semibold">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Pesquisar por motorista ou veículo..."
              value={alertSearchTerm}
              onChange={(e) => setAlertSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:border-primary focus:bg-white text-on-surface font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", name: "Todos" },
              { id: "CNH", name: "CNH Condutor" },
              { id: "Seguro", name: "Seguro Frota" },
              { id: "Licenciamento", name: "Licenciamento" }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAlertTypeFilter(type.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  alertTypeFilter === type.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts check queue feed */}
        {alerts.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
            <p className="text-base font-bold text-primary">Tudo em conformidade!</p>
            <p className="text-xs">Nenhum vencimento de CNH, Seguro ou Licenciamento pendente.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {alerts.map((alert, idx) => {
              const isExpired = alert.days < 0;
              const isCritical = alert.days >= 0 && alert.days <= 10;
              return (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <span className={`p-2 rounded-xl border ${
                      isExpired 
                        ? "bg-red-500/10 text-red-650 border-red-500/20" 
                        : isCritical
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}>
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="font-bold text-primary text-sm">{alert.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-semibold mt-0.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-outline-variant/60 text-[9px] uppercase tracking-wider text-outline font-bold">
                          {alert.type}
                        </span>
                        <span>•</span>
                        <span>Vencimento: {new Date(alert.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      {isExpired ? (
                        <span className="px-2 py-1 rounded bg-red-500 text-white font-bold text-[9px]">
                          EXPIRADO HÁ {Math.abs(alert.days)} DIAS
                        </span>
                      ) : alert.days === 0 ? (
                        <span className="px-2 py-1 rounded bg-amber-500 text-obsidian-950 font-bold text-[9px]">
                          VENCE HOJE
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded font-bold text-[9px] border ${
                          isCritical
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}>
                          Vence em {alert.days} dias
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => window.alert(`Notificação enviada para o responsável: ${alert.name}`)}
                      className="p-2 bg-white border border-outline-variant rounded-lg text-outline hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
                      title="Notificar Responsável"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
