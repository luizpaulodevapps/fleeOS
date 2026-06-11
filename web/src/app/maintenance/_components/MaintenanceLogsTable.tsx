"use client";

import React from "react";
import { Car, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { MaintenanceLog } from "../_lib/types";
import { getMaintenanceTypeColor, formatMaintenanceType } from "../_lib/helpers";

interface MaintenanceLogsTableProps {
  maintenanceLogs: MaintenanceLog[];
  vehicles: any[];
  onEdit?: (log: MaintenanceLog) => void;
  onDelete?: (id: string) => void;
  onFinish?: (log: MaintenanceLog) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function MaintenanceLogsTable({
  maintenanceLogs,
  vehicles,
  onEdit,
  onDelete,
  onFinish,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado."
}: MaintenanceLogsTableProps) {
  const getVehicleInfo = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo Não Encontrado";
  };

  const getVehiclePlate = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh ? veh.plate : "-";
  };

  const getVehicleStatus = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh?.status;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant text-xs">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/60 border-b border-outline-variant sticky top-0">
            <tr>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">Veículo Placa</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">Categoria</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">Descrição / Evento</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">Custo</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">KM Lançado</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant">Data</th>
              <th className="px-6 py-3 font-semibold text-on-surface-variant text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {maintenanceLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-outline italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              maintenanceLogs
                .slice()
                .reverse()
                .map(m => {
                  const isMaintActive = getVehicleStatus(m.vehicleId) === "maintenance";
                  const typeColor = getMaintenanceTypeColor(m.type);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-primary flex items-center space-x-2">
                        <Car className="w-3.5 h-3.5 text-outline" />
                        <span>{getVehicleInfo(m.vehicleId)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.type === "Preventiva"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : m.type === "Sinistro"
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {formatMaintenanceType(m.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-xs truncate" title={m.description}>
                        {m.description}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {m.cost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-on-surface-variant">
                        {m.mileage?.toLocaleString('pt-BR')} km
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {isMaintActive && m.type !== "Sinistro" ? (
                          canEdit ? (
                            <button
                              onClick={() => onFinish?.(m)}
                              className="px-2 py-1 rounded bg-amber-500 text-obsidian-950 font-bold hover:bg-amber-600 transition-all text-[10px]"
                            >
                              Liberar
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                              Oficina
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                            Liberado
                          </span>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => onDelete?.(m.id)}
                            className="p-1 text-outline hover:text-error rounded transition-all inline-flex items-center"
                            title="Deletar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
