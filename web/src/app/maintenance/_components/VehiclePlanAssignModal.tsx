"use client";

import React, { useState } from "react";
import { MaintenancePlan, VehicleMaintenancePlan } from "../_lib/types";
import { VEHICLE_CATEGORY_LABELS } from "../_lib/maintenanceEngine";
import { X, Link, Truck } from "lucide-react";

interface VehiclePlanAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (vehicleId: string, planId: string, notes: string) => Promise<void>;
  vehicles: any[];
  plans: MaintenancePlan[];
  vehiclePlans: VehicleMaintenancePlan[];
}

export function VehiclePlanAssignModal({
  isOpen,
  onClose,
  onAssign,
  vehicles,
  plans,
  vehiclePlans,
}: VehiclePlanAssignModalProps) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !planId) return;
    setSaving(true);
    try {
      await onAssign(vehicleId, planId, notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const currentPlanLink = vehiclePlans.find((vp) => vp.vehicleId === vehicleId);
  const currentPlan = currentPlanLink
    ? plans.find((p) => p.id === currentPlanLink.planId)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-lg">
              <Link className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-primary font-geist">
                Vincular Plano ao Veículo
              </h2>
              <p className="text-xs text-on-surface-variant">
                Associa um plano de manutenção a um veículo da frota
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Veículo */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Veículo *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model} ({Number(v.mileage || 0).toLocaleString("pt-BR")} km)
                </option>
              ))}
            </select>

            {currentPlan && (
              <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] text-amber-700 font-bold">
                  Plano atual: {currentPlan.name}
                </p>
                <p className="text-[9px] text-amber-600 mt-0.5">
                  Ao salvar, o plano atual será substituído.
                </p>
              </div>
            )}
          </div>

          {/* Plano */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Plano de Manutenção *
            </label>
            <div className="space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanId(plan.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    planId === plan.id
                      ? "bg-primary/10 border-primary"
                      : "bg-surface-container border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    planId === plan.id ? "border-primary" : "border-outline-variant"
                  }`}>
                    {planId === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${planId === plan.id ? "text-primary" : "text-on-surface"}`}>
                        {plan.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-surface-container-low border border-outline-variant rounded font-bold text-outline uppercase">
                        {VEHICLE_CATEGORY_LABELS[plan.category]}
                      </span>
                      {plan.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 border border-primary/30 rounded font-bold text-primary uppercase">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-outline mt-0.5">
                      {plan.procedures.length} procedimentos
                      {plan.applicableModels.length > 0 && ` · ${plan.applicableModels.slice(0, 2).join(", ")}${plan.applicableModels.length > 2 ? "..." : ""}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Observações (opcional)
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Revisão inicial adaptada para uso urbano intenso."
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !vehicleId || !planId}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Link className="w-3 h-3" />
              )}
              Vincular Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
