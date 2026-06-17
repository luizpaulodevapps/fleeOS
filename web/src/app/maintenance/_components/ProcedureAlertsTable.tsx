"use client";

import React, { useState } from "react";
import { ProcedureAlert, AlertStatus } from "../_lib/types";
import { PROCEDURE_CATEGORY_LABELS } from "../_lib/maintenanceEngine";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Package,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";

interface ProcedureAlertsTableProps {
  alerts: ProcedureAlert[];
  inventoryItems: any[];
  onGenerateWorkOrder: (alert: ProcedureAlert) => void;
  canEdit: boolean;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  overdue: {
    label: "Vencido",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
  },
  due_soon: {
    label: "Próximo",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  ok: {
    label: "Em dia",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
};

function StatusBadge({ status }: { status: AlertStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function KmBar({ alert }: { alert: ProcedureAlert }) {
  if (!alert.nextDueKm || !alert.intervalKm) return null;

  const lastKm = alert.lastExecutedKm ?? (alert.nextDueKm - alert.intervalKm);
  const totalInterval = alert.nextDueKm - lastKm;
  const traveled = alert.vehicleMileage - lastKm;
  const pct = Math.min(100, Math.max(0, (traveled / totalInterval) * 100));

  const barColor =
    alert.status === "overdue"
      ? "bg-red-500"
      : alert.status === "due_soon"
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div className="w-full">
      <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5 text-[9px] text-outline font-mono">
        <span>{lastKm.toLocaleString("pt-BR")} km</span>
        <span>{alert.nextDueKm.toLocaleString("pt-BR")} km</span>
      </div>
    </div>
  );
}

export function ProcedureAlertsTable({
  alerts,
  inventoryItems,
  onGenerateWorkOrder,
  canEdit,
  isLoading,
}: ProcedureAlertsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  const vehicles = Array.from(
    new Map(alerts.map((a) => [a.vehicleId, { id: a.vehicleId, plate: a.vehiclePlate, model: a.vehicleModel }])).values()
  );

  const filtered = alerts.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (vehicleFilter !== "all" && a.vehicleId !== vehicleFilter) return false;
    return true;
  });

  const toggleRow = (key: string) =>
    setExpandedRow((prev) => (prev === key ? null : key));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-xs">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        Calculando alertas da frota...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filters */}
        {(["all", "overdue", "due_soon", "ok"] as const).map((s) => {
          const cfg = s === "all" ? null : STATUS_CONFIG[s];
          const count = s === "all" ? alerts.length : alerts.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                statusFilter === s
                  ? s === "overdue"
                    ? "bg-red-600 text-white border-red-600"
                    : s === "due_soon"
                    ? "bg-amber-500 text-white border-amber-500"
                    : s === "ok"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-primary text-on-primary border-primary"
                  : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {cfg && <cfg.icon className="w-3 h-3" />}
              {s === "all" ? "Todos" : cfg?.label}
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${
                statusFilter === s ? "bg-white/20" : "bg-outline-variant/30"
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        <div className="ml-auto">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold text-on-surface"
          >
            <option value="all">Todos os Veículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} — {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant text-xs">
          <CheckCircle className="w-10 h-10 mb-3 text-emerald-400" />
          <p className="font-bold text-sm text-emerald-600">Frota em dia!</p>
          <p className="mt-1">Nenhum procedimento vencido ou próximo do vencimento.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-bold text-on-surface-variant w-8" />
                  <th className="px-4 py-3 font-bold text-on-surface-variant">Veículo</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant">Procedimento</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant">Situação</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant">Progresso</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant text-right">Estimado</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant text-center">Estoque</th>
                  {canEdit && (
                    <th className="px-4 py-3 font-bold text-on-surface-variant text-center">Ação</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.map((alert) => {
                  const rowKey = `${alert.vehicleId}-${alert.procedureId}`;
                  const isExpanded = expandedRow === rowKey;
                  const cfg = STATUS_CONFIG[alert.status];

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        className={`hover:bg-surface-container/50 transition-colors cursor-pointer ${
                          alert.status === "overdue" ? "bg-red-50/40" : ""
                        }`}
                        onClick={() => toggleRow(rowKey)}
                      >
                        {/* Expand icon */}
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-outline" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-outline" />
                          )}
                        </td>

                        {/* Veículo */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-primary font-mono">{alert.vehiclePlate}</div>
                          <div className="text-outline text-[10px]">{alert.vehicleBrand} {alert.vehicleModel}</div>
                          <div className="text-outline text-[10px] font-mono mt-0.5">
                            {alert.vehicleMileage.toLocaleString("pt-BR")} km
                          </div>
                        </td>

                        {/* Procedimento */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-on-surface">{alert.procedureName}</div>
                          <div className="mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-container rounded text-outline uppercase tracking-wider">
                              {PROCEDURE_CATEGORY_LABELS[alert.procedureCategory]}
                            </span>
                          </div>
                          {alert.estimatedDurationMinutes > 0 && (
                            <div className="text-[10px] text-outline mt-0.5">
                              ~{alert.estimatedDurationMinutes} min
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={alert.status} />
                          {alert.status === "overdue" && alert.intervalKm && (
                            <div className="text-[10px] text-red-600 font-bold mt-1">
                              +{alert.kmOverdue.toLocaleString("pt-BR")} km vencido
                            </div>
                          )}
                          {alert.status === "due_soon" && alert.nextDueKm && (
                            <div className="text-[10px] text-amber-600 font-bold mt-1">
                              Faltam {(alert.nextDueKm - alert.vehicleMileage).toLocaleString("pt-BR")} km
                            </div>
                          )}
                          {alert.nextDueDate && (
                            <div className="text-[10px] text-outline mt-0.5">
                              Prazo: {new Date(alert.nextDueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </td>

                        {/* Progresso */}
                        <td className="px-4 py-3 min-w-[140px]">
                          <KmBar alert={alert} />
                        </td>

                        {/* Custo estimado */}
                        <td className="px-4 py-3 text-right">
                          {alert.estimatedCost > 0 ? (
                            <span className="font-mono font-bold text-primary">
                              {alert.estimatedCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          ) : (
                            <span className="text-outline text-[10px]">—</span>
                          )}
                        </td>

                        {/* Estoque */}
                        <td className="px-4 py-3 text-center">
                          {alert.partKit.length === 0 ? (
                            <span className="text-outline text-[10px]">—</span>
                          ) : alert.hasPartsInStock ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600 text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3" />
                              OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-amber-600 text-[10px] font-bold">
                              <Package className="w-3 h-3" />
                              Baixo
                            </span>
                          )}
                        </td>

                        {/* Ação */}
                        {canEdit && (
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            {alert.status !== "ok" && (
                              <button
                                onClick={() => onGenerateWorkOrder(alert)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:opacity-90 transition-all whitespace-nowrap mx-auto"
                              >
                                <Zap className="w-3 h-3" />
                                Gerar OS
                              </button>
                            )}
                          </td>
                        )}
                      </tr>

                      {/* Linha expandida — Kit de peças */}
                      {isExpanded && (
                        <tr className="bg-surface-container/30">
                          <td colSpan={canEdit ? 8 : 7} className="px-6 py-4">
                            <div className="flex gap-8">
                              {/* Kit de peças */}
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  Kit de Peças
                                </p>
                                {alert.partKit.length === 0 ? (
                                  <p className="text-outline text-[11px] italic">Sem kit de peças cadastrado para este procedimento.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {alert.partKit.map((item, idx) => {
                                      const invItem = item.inventoryItemId
                                        ? inventoryItems.find((i) => i.id === item.inventoryItemId)
                                        : null;
                                      const inStock = invItem ? invItem.currentQty >= item.qty : null;
                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between text-[11px] bg-surface-container-low px-3 py-1.5 rounded-lg"
                                        >
                                          <span className="font-semibold text-on-surface">
                                            {item.qty} {item.unit} — {item.description}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            {invItem && (
                                              <span className="text-outline font-mono">
                                                Estoque: {invItem.currentQty} {item.unit}
                                              </span>
                                            )}
                                            {inStock === true && (
                                              <span className="text-emerald-600 font-bold">✓</span>
                                            )}
                                            {inStock === false && (
                                              <span className="text-red-500 font-bold">⚠</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Histórico */}
                              <div className="min-w-[200px]">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Wrench className="w-3 h-3" />
                                  Último Serviço
                                </p>
                                {alert.lastExecutedDate ? (
                                  <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                      <span className="text-outline">Data:</span>
                                      <span className="font-semibold">
                                        {new Date(alert.lastExecutedDate + "T00:00:00").toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                    {alert.lastExecutedKm && (
                                      <div className="flex justify-between">
                                        <span className="text-outline">KM:</span>
                                        <span className="font-mono font-semibold">
                                          {alert.lastExecutedKm.toLocaleString("pt-BR")} km
                                        </span>
                                      </div>
                                    )}
                                    {alert.nextDueKm && (
                                      <div className="flex justify-between">
                                        <span className="text-outline">Próximo:</span>
                                        <span className={`font-mono font-bold ${alert.status === "overdue" ? "text-red-600" : "text-primary"}`}>
                                          {alert.nextDueKm.toLocaleString("pt-BR")} km
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-outline text-[11px] italic">Nunca realizado neste veículo.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
