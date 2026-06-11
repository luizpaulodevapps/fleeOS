"use client";

import React from "react";

interface VehicleDriversTabProps {
  selectedVehicle: any;
  assignments: any[];
  drivers: any[];
  isReadOnly: (vehicle: any) => boolean;
  setSelectedDriverIdForAssign: (driverId: string) => void;
  setIsAssignModalOpen: (isOpen: boolean) => void;
  getDriverName: (driverId: string) => string;
}

export function VehicleDriversTab({
  selectedVehicle,
  assignments,
  drivers,
  isReadOnly,
  setSelectedDriverIdForAssign,
  setIsAssignModalOpen,
  getDriverName
}: VehicleDriversTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      {/* Active Driver Assignment */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Vínculo Ativo Atual</h4>
        {assignments.some(a => a.active && a.vehicleId === selectedVehicle.id) ? (
          assignments.filter(a => a.active && a.vehicleId === selectedVehicle.id).map(a => (
            <div key={a.id} className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 p-4 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-emerald-900">Motorista Responsável</p>
                <p className="text-primary font-bold text-base mt-1">{getDriverName(a.driverId)}</p>
                <p className="text-[10px] text-on-surface-variant font-mono">Iniciado em: {new Date(a.startDate).toLocaleString()}</p>
              </div>
              
              {!readOnly && (
                <button
                  onClick={() => {
                    setSelectedDriverIdForAssign("");
                    setIsAssignModalOpen(true);
                  }}
                  className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded transition-colors"
                >
                  Liberar Carro (Desvincular)
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl flex justify-between items-center text-xs">
            <span className="text-outline italic">Veículo livre na frota operacional.</span>
            
            {!readOnly && (
              <button
                onClick={() => {
                  setSelectedDriverIdForAssign(drivers[0]?.id || "");
                  setIsAssignModalOpen(true);
                }}
                className="bg-primary text-on-primary text-xs font-bold px-3.5 py-1.5 rounded hover:opacity-90 transition-opacity"
              >
                Vincular Motorista
              </button>
            )}
          </div>
        )}
      </div>

      {/* Historical Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Histórico de Uso e Vínculos Anteriores</h4>
        <div className="overflow-x-auto border border-outline-variant rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr className="font-bold text-on-surface-variant">
                <th className="p-3">Motorista</th>
                <th className="p-3">Início Uso</th>
                <th className="p-3">Devolução</th>
                <th className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {assignments.filter(a => a.vehicleId === selectedVehicle.id).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center italic text-on-surface-variant">Nenhum vínculo registrado no histórico.</td>
                </tr>
              ) : (
                assignments.filter(a => a.vehicleId === selectedVehicle.id).slice().reverse().map(a => (
                  <tr key={a.id} className="border-t border-outline-variant/60">
                    <td className="p-3 font-semibold text-primary">{getDriverName(a.driverId)}</td>
                    <td className="p-3 font-mono">{new Date(a.startDate).toLocaleDateString()}</td>
                    <td className="p-3 font-mono">{a.endDate ? new Date(a.endDate).toLocaleDateString() : "-"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        a.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {a.active ? "Ativo" : "Devolvido"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
