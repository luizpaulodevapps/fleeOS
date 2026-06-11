"use client";

import React from "react";
import { Activity, Trash2 } from "lucide-react";
import { MaintenancePlanItem } from "../_lib/types";
import { calculateWearPercentage, calculateKmsRemaining } from "../_lib/helpers";

interface MaintenancePlansTableProps {
  planItems: MaintenancePlanItem[];
  vehicles: any[];
  onPerformService?: (item: MaintenancePlanItem) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function MaintenancePlansTable({
  planItems,
  vehicles,
  onPerformService,
  onDelete,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhum plano preventivo configurado para os veículos selecionados."
}: MaintenancePlansTableProps) {
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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant">Veículo</th>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant">Item de Revisão</th>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant">Intervalo Técnico</th>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant">Último Serviço / KM</th>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant">Desgaste Estimado</th>
              <th className="px-6 py-3.5 font-bold text-on-surface-variant text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {planItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-outline italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              planItems.map((item) => {
                const veh = vehicles.find(v => v.id === item.vehicleId);
                const currentKm = veh ? Number(veh.mileage || 0) : 0;
                const lastKm = Number(item.lastServiceKm || 0);
                const nextKm = Number(item.nextServiceKm || 0);
                const wearPct = calculateWearPercentage(currentKm, lastKm, item.intervalKm);
                const kmsRemaining = calculateKmsRemaining(nextKm, currentKm);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-primary">{getVehicleInfo(item.vehicleId)}</td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      <span className="bg-primary/5 px-2.5 py-1 rounded border border-primary/10 text-primary">
                        {item.itemName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono">A cada {item.intervalKm?.toLocaleString('pt-BR')} km</td>
                    <td className="px-6 py-4 text-on-surface-variant flex flex-col text-[11px]">
                      <span className="font-semibold text-primary">Último: {lastKm?.toLocaleString('pt-BR')} km</span>
                      <span className="text-[9px] text-outline">Próximo: {nextKm?.toLocaleString('pt-BR')} km</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[150px] space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-outline">
                          <span>{wearPct.toFixed(0)}% desgaste</span>
                          {kmsRemaining <= 0 ? (
                            <span className="text-red-650 font-black">VENCIDO</span>
                          ) : (
                            <span>-{kmsRemaining.toLocaleString('pt-BR')} km</span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-outline-variant/40">
                          <div
                            style={{ width: `${wearPct}%` }}
                            className={`h-full rounded-full ${
                              wearPct >= 100 ? "bg-red-500" : wearPct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onPerformService?.(item)}
                            className="px-2.5 py-1.5 rounded bg-primary text-on-primary font-bold hover:opacity-90 text-[10px] transition-all"
                          >
                            Registrar Revisão
                          </button>
                          <button
                            onClick={() => onDelete?.(item.id)}
                            className="p-1 text-outline hover:text-error rounded transition-all inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
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
