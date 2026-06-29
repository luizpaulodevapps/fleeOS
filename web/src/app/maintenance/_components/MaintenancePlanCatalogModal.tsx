"use client";

import React, { useState } from "react";
import {
  MaintenancePlan,
  MaintenanceProcedure,
  MaintenancePlanFormData,
  VehicleCategory,
} from "../_lib/types";
import {
  PROCEDURE_CATEGORY_LABELS,
  VEHICLE_CATEGORY_LABELS,
} from "../_lib/maintenanceEngine";
import { X, Plus, Trash2, FileText } from "lucide-react";

interface MaintenancePlanCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: MaintenancePlanFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  selected: MaintenancePlan | null;
  procedures: MaintenanceProcedure[];
}

const defaultForm = (): MaintenancePlanFormData => ({
  name: "",
  manufacturer: "",
  category: "flex",
  applicableModels: "",
  procedures: [],
  isDefault: false,
  notes: "",
});

export function MaintenancePlanCatalogModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selected,
  procedures,
}: MaintenancePlanCatalogModalProps) {
  const [formData, setFormData] = useState<MaintenancePlanFormData>(
    selected
      ? {
          name: selected.name,
          manufacturer: selected.manufacturer,
          category: selected.category,
          applicableModels: selected.applicableModels.join(", "),
          procedures: selected.procedures,
          isDefault: selected.isDefault,
          notes: selected.notes,
        }
      : defaultForm()
  );
  const [saving, setSaving] = useState(false);

  // Reset when selected changes
  React.useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name,
        manufacturer: selected.manufacturer,
        category: selected.category,
        applicableModels: selected.applicableModels.join(", "),
        procedures: selected.procedures,
        isDefault: selected.isDefault,
        notes: selected.notes,
      });
    } else {
      setFormData(defaultForm());
    }
  }, [selected]);

  const toggleProcedure = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      procedures: prev.procedures.includes(id)
        ? prev.procedures.filter((p) => p !== id)
        : [...prev.procedures, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (formData.procedures.length === 0) {
      alert("Selecione pelo menos um procedimento para o plano.");
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Group procedures by category
  const grouped = procedures.reduce<Record<string, MaintenanceProcedure[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-primary font-geist">
                {selected ? "Editar Plano" : "Novo Plano de Manutenção"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Catálogo reutilizável por modelo / categoria de veículo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Nome e Fabricante */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Nome do Plano *
              </label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Toyota Corolla Hybrid"
                required
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Fabricante
              </label>
              <input
                value={formData.manufacturer}
                onChange={(e) => setFormData((p) => ({ ...p, manufacturer: e.target.value }))}
                placeholder="Ex: Toyota, Genérico..."
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Categoria do Veículo
            </label>
            <div className="flex flex-wrap gap-2">
              {(["flex", "gnv", "hybrid", "ev", "diesel", "other"] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, category: cat }))}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    formData.category === cat
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {VEHICLE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Modelos aplicáveis */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Modelos Aplicáveis (separados por vírgula)
            </label>
            <input
              value={formData.applicableModels}
              onChange={(e) => setFormData((p) => ({ ...p, applicableModels: e.target.value }))}
              placeholder="Ex: Corolla Altis Hybrid, Corolla XEI Hybrid"
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Procedimentos */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Procedimentos do Plano *{" "}
              <span className="text-primary">({formData.procedures.length} selecionados)</span>
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([category, procs]) => (
                <div key={category}>
                  <div className="text-[9px] font-bold text-outline uppercase tracking-wider mb-1 px-1">
                    {PROCEDURE_CATEGORY_LABELS[category]}
                  </div>
                  <div className="space-y-1">
                    {procs.map((proc) => {
                      const selected = formData.procedures.includes(proc.id);
                      return (
                        <button
                          key={proc.id}
                          type="button"
                          onClick={() => toggleProcedure(proc.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all text-xs ${
                            selected
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              selected ? "bg-primary border-primary" : "border-outline-variant"
                            }`}>
                              {selected && <span className="text-white text-[10px]">✓</span>}
                            </span>
                            <span>{proc.name}</span>
                            {proc.mandatory && (
                              <span className="text-[9px] bg-red-100 text-red-600 border border-red-200 px-1 rounded font-bold">
                                Obrig.
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-outline ml-2 shrink-0">
                            {proc.intervalKm
                              ? `${proc.intervalKm.toLocaleString("pt-BR")} km`
                              : proc.intervalDays
                              ? `${proc.intervalDays} dias`
                              : "—"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opções */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData((p) => ({ ...p, isDefault: e.target.checked }))}
                className="rounded border-outline-variant text-primary"
              />
              <span className="text-xs font-semibold text-on-surface">Plano Padrão</span>
            </label>
            <span className="text-[10px] text-outline">
              (Sugerido automaticamente para novos veículos desta categoria)
            </span>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-outline-variant bg-surface-container">
          <div>
            {selected && onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Deseja excluir o plano "${selected.name}"? Esta ação não pode ser desfeita.`)) {
                    onDelete(selected.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Plano
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              {selected ? "Salvar Alterações" : "Criar Plano"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
