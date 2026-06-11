"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { MaintFormState } from "../_lib/types";

interface VehicleMaintTabProps {
  selectedVehicle: any;
  maintenancePlan: any[];
  maintenances: any[];
  maintForm: MaintFormState;
  setMaintForm: React.Dispatch<React.SetStateAction<MaintFormState>>;
  handleAddMaintenance: (e: React.FormEvent) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
}

export function VehicleMaintTab({
  selectedVehicle,
  maintenancePlan,
  maintenances,
  maintForm,
  setMaintForm,
  handleAddMaintenance,
  isReadOnly
}: VehicleMaintTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      {/* Preventive Checklist / Plan */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Plano de Manutenção Preventiva por KM</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {maintenancePlan.filter(p => p.vehicleId === selectedVehicle.id).map(item => {
            const kmDiff = item.nextServiceKm - selectedVehicle.mileage;
            const isOverdue = kmDiff <= 0;
            return (
              <div key={item.id} className={`p-3 rounded-xl border text-xs space-y-1 ${
                isOverdue ? "bg-red-50 border-red-200" : "bg-slate-50 border-outline-variant"
              }`}>
                <p className="font-bold text-primary">{item.itemName}</p>
                <p className="text-[10px] text-on-surface-variant">Próxima: <span className="font-bold font-mono">{item.nextServiceKm} KM</span></p>
                <p className={`text-[10px] font-bold ${isOverdue ? "text-error text-red-650" : "text-emerald-650"}`}>
                  {isOverdue ? `Atrasado há ${Math.abs(kmDiff)} km` : `Faltam ${kmDiff} km`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical OS visits */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Histórico de Ordens de Serviço (Oficina)</h4>
        <div className="overflow-x-auto border border-outline-variant rounded-xl max-h-[200px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant sticky top-0">
              <tr className="font-bold text-on-surface-variant">
                <th className="p-3">Data</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Serviço/Peças</th>
                <th className="p-3 text-right">KM</th>
                <th className="p-3 text-right">Custo total</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.filter(m => m.vehicleId === selectedVehicle.id).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center italic text-on-surface-variant">Nenhuma ida à oficina registrada.</td>
                </tr>
              ) : (
                maintenances.filter(m => m.vehicleId === selectedVehicle.id).slice().reverse().map(m => (
                  <tr key={m.id} className="border-t border-outline-variant/60 font-mono">
                    <td className="p-3 font-sans text-on-surface-variant">{new Date(m.date).toLocaleDateString()}</td>
                    <td className="p-3 font-sans font-bold">{m.type}</td>
                    <td className="p-3 font-sans text-primary">{m.description}</td>
                    <td className="p-3 text-right">{m.mileage} km</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">R$ {m.cost?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OS Form */}
      {!readOnly && (
        <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-primary" />
            <span>Registrar OS / Visita Oficina</span>
          </h4>

          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Classificação</label>
                <select
                  value={maintForm.type}
                  onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                >
                  <option value="Preventiva">Preventiva (Revisão/Troca Óleo)</option>
                  <option value="Corretiva">Corretiva (Quebra/Defeito)</option>
                  <option value="Pintura/Funilaria">Funilaria / Pintura</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Custo Total (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={maintForm.cost}
                  onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">KM do Ativo</label>
                <input
                  type="number"
                  placeholder={`Odômetro atual: ${selectedVehicle.mileage} KM`}
                  value={maintForm.mileage}
                  onChange={(e) => setMaintForm({ ...maintForm, mileage: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5 font-bold">Descrição dos Serviços e Peças</label>
              <input
                type="text"
                required
                placeholder="Ex: Substituição de pastilhas de freio dianteiras e alinhamento"
                value={maintForm.description}
                onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Confirmar Entrada Oficina
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
