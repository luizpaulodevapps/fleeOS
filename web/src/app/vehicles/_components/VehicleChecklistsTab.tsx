"use client";

import React from "react";

interface VehicleChecklistsTabProps {
  selectedVehicle: any;
  checklists: any[];
  getDriverName: (driverId: string) => string;
}

export function VehicleChecklistsTab({
  selectedVehicle,
  checklists,
  getDriverName
}: VehicleChecklistsTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Histórico de Inspeções Técnicas</h4>
      <div className="space-y-3">
        {checklists.filter(c => c.vehicleId === selectedVehicle.id).length === 0 ? (
          <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
            Nenhuma vistoria ou checklist registrado.
          </p>
        ) : (
          checklists.filter(c => c.vehicleId === selectedVehicle.id).slice().reverse().map(c => (
            <div key={c.id} className="bg-slate-50 border border-outline-variant p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b pb-2 border-outline-variant/30">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    c.type === "Entrega" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    Vistoria de {c.type}
                  </span>
                  <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Condutor: {getDriverName(c.driverId)} • {c.date}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                  Assinado: {c.signatureText}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-primary">
                {Object.entries(c.items || {}).map(([k, v]: any) => (
                  <div key={k} className="flex items-center space-x-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${v ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="capitalize">{k === "crlv" ? "CRLV / Doc" : k.replace(/([A-Z])/g, " $1")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
