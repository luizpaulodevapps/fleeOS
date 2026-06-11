"use client";

import React from "react";
import { X } from "lucide-react";

interface AssignDriverModalProps {
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (isOpen: boolean) => void;
  selectedVehicle: any | null;
  selectedDriverIdForAssign: string;
  setSelectedDriverIdForAssign: (driverId: string) => void;
  drivers: any[];
  handleAssignDriver: (e: React.FormEvent) => Promise<void>;
}

export function AssignDriverModal({
  isAssignModalOpen,
  setIsAssignModalOpen,
  selectedVehicle,
  selectedDriverIdForAssign,
  setSelectedDriverIdForAssign,
  drivers,
  handleAssignDriver
}: AssignDriverModalProps) {
  if (!isAssignModalOpen || !selectedVehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background border border-outline-variant rounded-xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setIsAssignModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-primary mb-2 font-geist">Vincular Motorista</h3>
        <p className="text-xs text-on-surface-variant mb-5">
          Associe o carro placa <span className="text-primary font-bold">{selectedVehicle.plate}</span> a um motorista.
        </p>

        <form onSubmit={handleAssignDriver} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
              Motorista Selecionado
            </label>
            <select
              value={selectedDriverIdForAssign}
              onChange={(e) => setSelectedDriverIdForAssign(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary appearance-none font-sans"
            >
              <option value="">-- Sem Motorista (Liberar veículo) --</option>
              {drivers.filter(d => d.status === "active").map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Confirmar Vínculo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
