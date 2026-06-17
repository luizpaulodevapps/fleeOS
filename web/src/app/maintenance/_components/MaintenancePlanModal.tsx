"use client";

import React from "react";
import { X } from "lucide-react";
import { PlanFormData } from "../_lib/types";
import { REVISION_ITEMS, REVISION_LABELS } from "../_lib/constants";
import { VehicleSearchSelect } from "./VehicleSearchSelect";

interface MaintenancePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: PlanFormData;
  setFormData: (data: PlanFormData) => void;
  vehicles: any[];
  loading?: boolean;
}

export function MaintenancePlanModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  vehicles,
  loading = false
}: MaintenancePlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background border border-outline-variant rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-primary mb-2 font-geist">Cadastrar Item de Revisão Preventiva</h3>
        <p className="text-xs text-on-surface-variant mb-5">
          Defina as regras de alerta de quilometragem por item de desgaste.
        </p>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Veículo Alvo</label>
            <VehicleSearchSelect
              vehicles={vehicles}
              value={formData.vehicleId}
              onChange={(vehicleId) => {
                const veh = vehicles.find(v => v.id === vehicleId);
                setFormData({
                  ...formData,
                  vehicleId,
                  lastServiceKm: veh?.mileage?.toString() || "0"
                });
              }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Nome do Item de Revisão</label>
            <select
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            >
              {REVISION_ITEMS.map(item => (
                <option key={item} value={item}>{REVISION_LABELS[item]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-2">Intervalo Técnico (KM)</label>
              <input
                type="number"
                required
                placeholder="Ex: 10000"
                value={formData.intervalKm}
                onChange={(e) => setFormData({ ...formData, intervalKm: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-2">Última Revisão (KM)</label>
              <input
                type="number"
                required
                value={formData.lastServiceKm}
                onChange={(e) => setFormData({ ...formData, lastServiceKm: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
