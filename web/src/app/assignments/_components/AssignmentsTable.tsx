"use client";

import React from "react";
import { User, Car, FileCheck, Unlink } from "lucide-react";
import { Assignment, Checklist } from "../_lib/types";

interface AssignmentsTableProps {
  assignments: Assignment[];
  drivers: any[];
  vehicles: any[];
  checklists: Checklist[];
  onOpenChecklist: (checklist: Checklist) => void;
  onCloseAssignment: (assignment: Assignment) => void;
  canEdit?: boolean;
}

export function AssignmentsTable({
  assignments,
  drivers,
  vehicles,
  checklists,
  onOpenChecklist,
  onCloseAssignment,
  canEdit = false
}: AssignmentsTableProps) {
  const getDriverName = (id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.name : `Motorista (${id.substring(0, 6)})`;
  };

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : `Veículo (${id.substring(0, 6)})`;
  };

  const getDriverLocks = (id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.activeLocks || [] : [];
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Motorista</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Veículo Placa</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Início do Vínculo</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Término/Devolução</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Inspeção</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Situação</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {assignments.map((asg) => {
              const driverLocks = getDriverLocks(asg.driverId);
              const hasLocks = driverLocks.length > 0;
              
              const handoverCheck = checklists.find(
                c => c.assignmentId === asg.id && c.type === "Entrega"
              ) || checklists.find(
                c => c.vehicleId === asg.vehicleId && c.driverId === asg.driverId && c.type === "Entrega"
              );

              const returnCheck = checklists.find(
                c => c.assignmentId === asg.id && c.type === "Devolução"
              ) || checklists.find(
                c => c.vehicleId === asg.vehicleId && c.driverId === asg.driverId && c.type === "Devolução"
              );

              return (
                <tr key={asg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-outline" />
                      <div>
                        <p className="font-bold text-primary">{getDriverName(asg.driverId)}</p>
                        {hasLocks && (
                          <span className="inline-flex items-center text-[9px] bg-red-500/10 text-red-500 font-bold px-1 py-0.5 rounded mt-0.5 border border-red-500/15">
                            Bloqueio: {driverLocks.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 font-bold text-primary">
                      <Car className="w-4 h-4 text-outline" />
                      <span>{getVehicleInfo(asg.vehicleId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-on-surface-variant">
                    {new Date(asg.startDate).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 font-mono text-on-surface-variant">
                    {asg.endDate ? (
                      new Date(asg.endDate).toLocaleString("pt-BR")
                    ) : (
                      <span className="italic text-outline">Em andamento</span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-1.5">
                    {handoverCheck && (
                      <button
                        onClick={() => onOpenChecklist(handoverCheck)}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 hover:bg-emerald-500/20"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Entrega</span>
                      </button>
                    )}
                    {returnCheck && (
                      <button
                        onClick={() => onOpenChecklist(returnCheck)}
                        className="bg-blue-500/10 border border-blue-500/20 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 hover:bg-blue-500/20"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Devolução</span>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      asg.active 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {asg.active ? "Ativo" : "Devolvido"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {asg.active && canEdit && (
                      <button
                        onClick={() => onCloseAssignment(asg)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 border border-red-600 rounded shadow-sm flex items-center space-x-1.5 ml-auto"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Recolher (Desvincular)</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
