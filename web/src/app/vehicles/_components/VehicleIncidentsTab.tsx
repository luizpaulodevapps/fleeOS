"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { IncidentFormState } from "../_lib/types";

interface VehicleIncidentsTabProps {
  selectedVehicle: any;
  incidents: any[];
  drivers: any[];
  incidentForm: IncidentFormState;
  setIncidentForm: React.Dispatch<React.SetStateAction<IncidentFormState>>;
  handleAddIncident: (e: React.FormEvent) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
  getDriverName: (driverId: string) => string;
}

export function VehicleIncidentsTab({
  selectedVehicle,
  incidents,
  drivers,
  incidentForm,
  setIncidentForm,
  handleAddIncident,
  isReadOnly,
  getDriverName
}: VehicleIncidentsTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Histórico de Sinistros e Avarias Estéticas</h4>
        <div className="space-y-3">
          {incidents.filter(i => i.vehicleId === selectedVehicle.id).length === 0 ? (
            <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
              Nenhum sinistro ou dano estético anotado para este veículo.
            </p>
          ) : (
            incidents.filter(i => i.vehicleId === selectedVehicle.id).slice().reverse().map(i => (
              <div key={i.id} className="bg-slate-50 border border-outline-variant p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                    i.severity === "Grave" ? "bg-red-100 text-red-750" : i.severity === "Média" ? "bg-amber-100 text-amber-750" : "bg-slate-100 text-slate-600"
                  }`}>
                    Gravidade: {i.severity}
                  </span>
                  <p className="font-bold text-primary">{i.description}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    Condutor: {getDriverName(i.driverId)} • Data: {new Date(i.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] text-outline uppercase font-bold">Custo de Reparo</p>
                  <p className="font-mono font-bold text-primary">R$ {i.repairCost?.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Incident Form */}
      {!readOnly && (
        <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-primary" />
            <span>Lançar Nova Avaria / Sinistro</span>
          </h4>

          <form onSubmit={handleAddIncident} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Condutor Envolvido</label>
                <select
                  value={incidentForm.driverId}
                  onChange={(e) => setIncidentForm({ ...incidentForm, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data Ocorrência</label>
                <input
                  type="date"
                  required
                  value={incidentForm.date}
                  onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Gravidade</label>
                <select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                >
                  <option value="Leve">Leve (Arranhão/Amassado leve)</option>
                  <option value="Média">Média (Parachoque/Farol quebrado)</option>
                  <option value="Grave">Grave (Colisão mecânica afetada)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Custo Estimado de Reparo (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={incidentForm.repairCost}
                  onChange={(e) => setIncidentForm({ ...incidentForm, repairCost: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Descrição Detalhada do Dano</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Batida traseira, trincou lanterna esquerda"
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Lançar Sinistro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
