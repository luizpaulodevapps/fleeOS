"use client";

import React from "react";
import { FileText, Trash2 } from "lucide-react";
import { WorkOrder } from "../_lib/types";
import { getWorkOrderStatusLabel, getWorkOrderStatusColor, generateWorkOrderCode } from "../_lib/helpers";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  vehicles: any[];
  inventoryItems: any[];
  onEdit?: (wo: WorkOrder) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function WorkOrdersTable({
  workOrders,
  vehicles,
  inventoryItems,
  onEdit,
  onDelete,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhuma Ordem de Serviço encontrada."
}: WorkOrdersTableProps) {
  const getVehicleInfo = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo Não Encontrado";
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
      <div className="p-4 bg-slate-50 border-b border-outline-variant flex justify-between items-center">
        <span className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Ordens de Serviço Técnico (OS)</span>
        </span>
        <span className="text-[10px] text-slate-500 font-semibold">{workOrders.length} registros ativos</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/60 border-b border-outline-variant">
            <tr className="font-bold text-on-surface-variant">
              <th className="px-6 py-3">Cód OS</th>
              <th className="px-6 py-3">Veículo</th>
              <th className="px-6 py-3">Descrição do Serviço</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">KM</th>
              <th className="px-6 py-3 text-right">Peças</th>
              <th className="px-6 py-3 text-right">Mão de Obra</th>
              <th className="px-6 py-3 text-right">Custo Total</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-outline italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              workOrders
                .slice()
                .reverse()
                .map(wo => {
                  const statusColor = getWorkOrderStatusColor(wo.status);
                  const statusLabel = getWorkOrderStatusLabel(wo.status);

                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-primary">
                        {generateWorkOrderCode(wo.id)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {getVehicleInfo(wo.vehicleId)}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-700" title={wo.description}>
                        {wo.description}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            wo.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : wo.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        {wo.mileage?.toLocaleString('pt-BR')} km
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        {wo.totalPartsCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        {wo.totalLaborCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                        {wo.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => onEdit?.(wo)}
                          className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant hover:bg-surface-container-high text-primary font-bold text-[10px]"
                        >
                          {wo.status === "completed" ? "Ver Detalhes" : "Editar / Concluir"}
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onDelete?.(wo.id)}
                            className="p-1 text-outline hover:text-error rounded transition-all inline-flex items-center"
                            title="Deletar OS"
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
