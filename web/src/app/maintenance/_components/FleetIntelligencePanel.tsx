"use client";

import React from "react";
import { VehicleAlertSummary } from "../_lib/maintenanceEngine";
import { ProcedureAlert, AlertStatus } from "../_lib/types";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";

interface FleetIntelligencePanelProps {
  vehicleSummaries: VehicleAlertSummary[];
  allAlerts: ProcedureAlert[];
  vehicleExpenses: any[];
  vehicles: any[];
  onViewVehicleAlerts: (vehicleId: string) => void;
  onGenerateWorkOrder: (alert: ProcedureAlert) => void;
  canEdit: boolean;
}

const STATUS_RING: Record<AlertStatus, string> = {
  overdue: "border-red-400 shadow-red-100",
  due_soon: "border-amber-400 shadow-amber-100",
  ok: "border-emerald-400 shadow-emerald-100",
};

const STATUS_DOT: Record<AlertStatus, string> = {
  overdue: "bg-red-500",
  due_soon: "bg-amber-400",
  ok: "bg-emerald-400",
};

const STATUS_LABEL: Record<AlertStatus, string> = {
  overdue: "Atenção Crítica",
  due_soon: "Revisão Próxima",
  ok: "Em Dia",
};

export function FleetIntelligencePanel({
  vehicleSummaries,
  allAlerts,
  vehicleExpenses,
  vehicles,
  onViewVehicleAlerts,
  onGenerateWorkOrder,
  canEdit,
}: FleetIntelligencePanelProps) {
  // KPIs
  const overdueTotal = allAlerts.filter((a) => a.status === "overdue").length;
  const dueSoonTotal = allAlerts.filter((a) => a.status === "due_soon").length;
  const okTotal = allAlerts.filter((a) => a.status === "ok").length;

  // Custo estimado total dos procedimentos vencidos
  const estimatedUrgentCost = allAlerts
    .filter((a) => a.status === "overdue")
    .reduce((sum, a) => sum + a.estimatedCost, 0);

  // Top 3 alertas mais urgentes
  const topAlerts = allAlerts.filter((a) => a.status !== "ok").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </span>
            <span className="text-[10px] font-bold text-red-500 uppercase">Vencidos</span>
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">{overdueTotal}</div>
          <div className="text-[10px] text-outline mt-1">Procedimentos críticos</div>
        </div>

        <div className="bg-surface-container-lowest border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">Próximos</span>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{dueSoonTotal}</div>
          <div className="text-[10px] text-outline mt-1">Nos próximos 1.000 km</div>
        </div>

        <div className="bg-surface-container-lowest border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Em Dia</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{okTotal}</div>
          <div className="text-[10px] text-outline mt-1">Procedimentos OK</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="p-1.5 bg-violet-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </span>
            <span className="text-[10px] font-bold text-violet-500 uppercase">Custo Estimado</span>
          </div>
          <div className="text-xl font-black text-primary font-mono">
            {estimatedUrgentCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div className="text-[10px] text-outline mt-1">Revisões em atraso</div>
        </div>
      </div>

      {/* Linha: Grid de veículos + Top Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cards dos veículos */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Resumo por Veículo
          </h3>

          {vehicleSummaries.length === 0 ? (
            <p className="text-outline text-xs italic">Nenhum veículo com plano vinculado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicleSummaries.map((summary) => {
                const vehicle = vehicles.find((v) => v.id === summary.vehicleId);
                return (
                  <button
                    key={summary.vehicleId}
                    onClick={() => onViewVehicleAlerts(summary.vehicleId)}
                    className={`text-left p-4 bg-surface-container-lowest border-2 rounded-xl shadow-sm hover:shadow-md transition-all ${STATUS_RING[summary.overallStatus]}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-black text-primary text-base font-mono">{summary.vehiclePlate}</div>
                        <div className="text-outline text-[10px]">{summary.vehicleBrand} {summary.vehicleModel}</div>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${STATUS_DOT[summary.overallStatus]}`} />
                    </div>

                    <div className="text-[10px] font-bold mb-2 text-on-surface-variant uppercase tracking-wider">
                      {STATUS_LABEL[summary.overallStatus]}
                    </div>

                    {vehicle && (
                      <div className="text-[10px] text-outline font-mono mb-3">
                        {Number(vehicle.mileage || 0).toLocaleString("pt-BR")} km
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {summary.overdueCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {summary.overdueCount} vencido{summary.overdueCount > 1 ? "s" : ""}
                        </span>
                      )}
                      {summary.dueSoonCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-2.5 h-2.5" />
                          {summary.dueSoonCount} próximo{summary.dueSoonCount > 1 ? "s" : ""}
                        </span>
                      )}
                      {summary.okCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {summary.okCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 3 Alertas Urgentes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ação Imediata
          </h3>

          {topAlerts.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-600 font-bold text-xs">Frota em dia!</p>
              <p className="text-emerald-500 text-[10px] mt-1">Nenhuma ação urgente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topAlerts.map((alert) => (
                <div
                  key={`${alert.vehicleId}-${alert.procedureId}`}
                  className={`p-3 rounded-xl border shadow-sm ${
                    alert.status === "overdue"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-black text-primary font-mono text-xs">{alert.vehiclePlate}</div>
                      <div className={`text-[10px] font-bold ${alert.status === "overdue" ? "text-red-600" : "text-amber-600"}`}>
                        {alert.procedureName}
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => onGenerateWorkOrder(alert)}
                        className="flex items-center gap-1 px-2 py-1 bg-primary text-on-primary rounded-lg text-[9px] font-bold hover:opacity-90 transition-all ml-2 shrink-0"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        OS
                      </button>
                    )}
                  </div>
                  {alert.status === "overdue" && alert.intervalKm && (
                    <div className="text-[10px] text-red-600 font-bold">
                      +{alert.kmOverdue.toLocaleString("pt-BR")} km em atraso
                    </div>
                  )}
                  {alert.status === "due_soon" && alert.nextDueKm && (
                    <div className="text-[10px] text-amber-600 font-bold">
                      Faltam {(alert.nextDueKm - alert.vehicleMileage).toLocaleString("pt-BR")} km
                    </div>
                  )}
                  {alert.estimatedCost > 0 && (
                    <div className="text-[10px] text-outline mt-0.5 font-mono">
                      Est.: {alert.estimatedCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
