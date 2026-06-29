"use client";

import React, { useState, useEffect } from "react";
import { MaintenancePlan, VehicleMaintenancePlan } from "../_lib/types";
import { VEHICLE_CATEGORY_LABELS } from "../_lib/maintenanceEngine";
import { X, Link, CheckSquare, Square, Layers, Truck } from "lucide-react";

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
  const [assignmentMode, setAssignmentMode] = useState<"single" | "bulk">("single");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [fuelFilter, setFuelFilter] = useState<string>("all");
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      setVehicleId(vehicles[0]?.id || "");
      setPlanId(plans[0]?.id || "");
      setSelectedVehicleIds([]);
      setFuelFilter("all");
      setNotes("");
    }
  }, [isOpen, vehicles, plans]);

  const handleFuelFilterChange = (fuel: string) => {
    setFuelFilter(fuel);
    if (fuel === "all") {
      setSelectedVehicleIds([]);
    } else {
      const matched = vehicles.filter(v => {
        const norm = (v.fuelType || "").toLowerCase();
        if (fuel === "flex") return norm.includes("flex") || norm === "flex/gasolina" || norm === "";
        if (fuel === "gnv") return norm.includes("gnv");
        if (fuel === "hybrid") return norm.includes("híbrido") || norm.includes("hibrido");
        if (fuel === "ev") return norm.includes("elétrico") || norm.includes("eletrico");
        if (fuel === "diesel") return norm.includes("diesel");
        return false;
      }).map(v => v.id);
      setSelectedVehicleIds(matched);
    }
  };

  const toggleVehicleSelection = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedVehicleIds(vehicles.map(v => v.id));
  };

  const handleDeselectAll = () => {
    setSelectedVehicleIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    const targets = assignmentMode === "single" ? [vehicleId] : selectedVehicleIds;
    if (targets.length === 0) {
      alert("Selecione pelo menos um veículo.");
      return;
    }

    setSaving(true);
    try {
      // Loop over assignments in bulk
      await Promise.all(targets.map(vid => onAssign(vid, planId, notes)));
      onClose();
    } catch (err) {
      console.error("Erro na vinculação de planos", err);
      alert("Ocorreu um erro ao vincular os planos.");
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-lg">
              <Link className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-primary font-geist">
                Vincular Plano de Manutenção
              </h2>
              <p className="text-xs text-on-surface-variant">
                Associa planos preventivos a um ou mais veículos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>

        {/* Tab Selector for Single/Bulk Mode */}
        <div className="flex border-b border-outline-variant bg-surface-container-low p-1 gap-1">
          <button
            type="button"
            onClick={() => setAssignmentMode("single")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              assignmentMode === "single"
                ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30"
                : "text-outline hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Único Veículo</span>
          </button>
          <button
            type="button"
            onClick={() => setAssignmentMode("bulk")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              assignmentMode === "bulk"
                ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30"
                : "text-outline hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vincular em Lote</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Mode 1: Single Vehicle */}
          {assignmentMode === "single" && (
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
                    {v.plate} — {v.brand} {v.model} ({Number(v.mileage || 0).toLocaleString("pt-BR")} km) — {v.fuelType || "Flex"}
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
          )}

          {/* Mode 2: Bulk Vehicles */}
          {assignmentMode === "bulk" && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container p-3 rounded-xl border border-outline-variant">
                <div>
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Pré-selecionar por Combustível
                  </span>
                  <span className="text-[10px] text-outline">Selecione todos os carros de uma categoria</span>
                </div>
                <select
                  value={fuelFilter}
                  onChange={(e) => handleFuelFilterChange(e.target.value)}
                  className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs outline-none"
                >
                  <option value="all">Limpar Seleção</option>
                  <option value="flex">Flex / Gasolina</option>
                  <option value="gnv">GNV (Gas Natural)</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="ev">Elétrico (EV)</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Veículos ({selectedVehicleIds.length} selecionados) *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[9px] font-bold text-primary hover:underline uppercase"
                    >
                      Todos
                    </button>
                    <span className="text-outline text-[9px]">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[9px] font-bold text-outline hover:underline uppercase"
                    >
                      Nenhum
                    </button>
                  </div>
                </div>

                <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant/60 max-h-[160px] overflow-y-auto bg-surface-container-lowest">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleIds.includes(v.id);
                    const linkedPlan = vehiclePlans.find(vp => vp.vehicleId === v.id);
                    const linkedPlanName = linkedPlan ? plans.find(p => p.id === linkedPlan.planId)?.name : null;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleVehicleSelection(v.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors text-xs ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-outline flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-primary truncate">
                              {v.plate} — {v.brand} {v.model}
                            </p>
                            <p className="text-[9px] text-outline">
                              Combustível: {v.fuelType || "Flex"} · {Number(v.mileage || 0).toLocaleString("pt-BR")} km
                            </p>
                          </div>
                        </div>
                        {linkedPlanName && (
                          <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[120px]" title={`Já possui o plano: ${linkedPlanName}`}>
                            {linkedPlanName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
              placeholder="Ex: Vinculação em lote para novos veículos da frota."
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
              disabled={saving || !planId || (assignmentMode === "single" ? !vehicleId : selectedVehicleIds.length === 0)}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Link className="w-3.5 h-3.5" />
              )}
              <span>
                {assignmentMode === "single" ? "Vincular Plano" : `Vincular em Lote (${selectedVehicleIds.length})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
