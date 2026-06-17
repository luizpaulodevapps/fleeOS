"use client";

import React, { useState, useEffect } from "react";
import {
  X, Plus, Trash2, ChevronDown, BookOpen, Wrench,
} from "lucide-react";
import {
  VehicleCatalog,
  VehicleCatalogFormData,
  VehicleCatalogSpec,
  CatalogSpecType,
  CATALOG_SPEC_LABELS,
  CATALOG_SPEC_ICONS,
  VehicleCategory,
  MaintenancePlan,
} from "../_lib/types";
import { VEHICLE_CATEGORY_LABELS } from "../_lib/maintenanceEngine";

interface VehicleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: VehicleCatalogFormData, specs: VehicleCatalogSpec[]) => Promise<void>;
  selected: VehicleCatalog | null;
  plans: MaintenancePlan[];
}

const BLANK_FORM: VehicleCatalogFormData = {
  make: "",
  model: "",
  engine: "",
  yearFrom: String(new Date().getFullYear() - 2),
  yearTo: "",
  category: "flex",
  defaultPlanId: "",
  notes: "",
};

const BLANK_SPEC: VehicleCatalogSpec = {
  type: "oil",
  description: "",
  partNumber: "",
  quantity: 1,
  unit: "unidade",
  inventoryItemId: null,
  notes: "",
};

const SPEC_UNIT_OPTIONS: Record<CatalogSpecType, string[]> = {
  oil: ["litros", "mililitros"],
  filter_oil: ["unidade"],
  filter_air: ["unidade"],
  filter_cabin: ["unidade"],
  brake_fluid: ["litros", "mililitros"],
  coolant: ["litros"],
  spark_plug: ["unidade", "jogo"],
  belt: ["kit", "unidade"],
  transmission_fluid: ["litros"],
  tire_spec: ["unidade"],
  hybrid_fluid: ["litros"],
  other: ["unidade", "litros", "kit", "metro"],
};

export function VehicleCatalogModal({
  isOpen,
  onClose,
  onSave,
  selected,
  plans,
}: VehicleCatalogModalProps) {
  const [form, setForm] = useState<VehicleCatalogFormData>(BLANK_FORM);
  const [specs, setSpecs] = useState<VehicleCatalogSpec[]>([]);
  const [newSpec, setNewSpec] = useState<VehicleCatalogSpec>(BLANK_SPEC);
  const [saving, setSaving] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (selected) {
        setForm({
          make: selected.make,
          model: selected.model,
          engine: selected.engine,
          yearFrom: String(selected.yearFrom),
          yearTo: selected.yearTo ? String(selected.yearTo) : "",
          category: selected.category,
          defaultPlanId: selected.defaultPlanId || "",
          notes: selected.notes,
        });
        setSpecs(selected.specs ? [...selected.specs] : []);
      } else {
        setForm(BLANK_FORM);
        setSpecs([]);
      }
      setNewSpec(BLANK_SPEC);
      setExpandedSpec(null);
    }
  }, [isOpen, selected]);

  const handleAddSpec = () => {
    if (!newSpec.description.trim()) return;
    setSpecs((prev) => [...prev, { ...newSpec }]);
    setNewSpec({ ...BLANK_SPEC, type: newSpec.type });
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
    if (expandedSpec === idx) setExpandedSpec(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) return;
    try {
      setSaving(true);
      await onSave(form, specs);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const specTypeOptions = (Object.keys(CATALOG_SPEC_LABELS) as CatalogSpecType[]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-primary text-sm">
              {selected ? "Editar Catálogo Técnico" : "Novo Catálogo Técnico"}
            </h2>
          </div>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              Identificação do Veículo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                  Montadora *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Toyota"
                  value={form.make}
                  onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                  Modelo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Corolla"
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                Versão / Motor *
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 1.8 Hybrid / 2.0 Flex / 1.0 Turbo"
                value={form.engine}
                onChange={(e) => setForm((f) => ({ ...f, engine: e.target.value }))}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                  Ano Início *
                </label>
                <input
                  required
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.yearFrom}
                  onChange={(e) => setForm((f) => ({ ...f, yearFrom: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                  Ano Fim (vazio = atual)
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  placeholder="atual"
                  value={form.yearTo}
                  onChange={(e) => setForm((f) => ({ ...f, yearTo: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as VehicleCategory }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  {(Object.entries(VEHICLE_CATEGORY_LABELS) as [VehicleCategory, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                Plano de Manutenção Padrão
              </label>
              <select
                value={form.defaultPlanId}
                onChange={(e) => setForm((f) => ({ ...f, defaultPlanId: e.target.value }))}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">— Nenhum —</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Notas técnicas gerais sobre o modelo..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Especificações Técnicas ({specs.length})
              </h3>
            </div>

            {/* Existing specs list */}
            {specs.length > 0 && (
              <div className="space-y-1.5">
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="border border-outline-variant rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSpec(expandedSpec === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">
                          {CATALOG_SPEC_ICONS[spec.type]}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-on-surface">
                            {spec.description}
                          </span>
                          {spec.partNumber && (
                            <span className="ml-2 text-[9px] font-mono text-outline bg-surface-container-lowest px-1 py-0.5 rounded border border-outline-variant">
                              {spec.partNumber}
                            </span>
                          )}
                          <span className="ml-2 text-[10px] text-primary font-semibold font-mono">
                            {spec.quantity} {spec.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveSpec(idx); }}
                          className="p-1 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-outline transition-transform ${expandedSpec === idx ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {expandedSpec === idx && (
                      <div className="px-4 py-3 bg-surface-container-lowest border-t border-outline-variant grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Descrição</label>
                          <input
                            type="text"
                            value={spec.description}
                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, description: e.target.value } : s))}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Part Number / SKU</label>
                          <input
                            type="text"
                            value={spec.partNumber}
                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, partNumber: e.target.value } : s))}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Quantidade</label>
                          <input
                            type="number"
                            step="0.01"
                            value={spec.quantity}
                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, quantity: Number(e.target.value) } : s))}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Observações</label>
                          <input
                            type="text"
                            value={spec.notes}
                            onChange={(e) => setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, notes: e.target.value } : s))}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add spec row */}
            <div className="bg-surface-container/50 border border-dashed border-outline-variant rounded-xl p-4 space-y-3">
              <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">
                + Adicionar Especificação
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Tipo</label>
                  <select
                    value={newSpec.type}
                    onChange={(e) => {
                      const t = e.target.value as CatalogSpecType;
                      const units = SPEC_UNIT_OPTIONS[t];
                      setNewSpec((s) => ({ ...s, type: t, unit: units[0] }));
                    }}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    {specTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {CATALOG_SPEC_ICONS[t]} {CATALOG_SPEC_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Descrição *</label>
                  <input
                    type="text"
                    placeholder="Ex: Óleo Motor 0W20 SP"
                    value={newSpec.description}
                    onChange={(e) => setNewSpec((s) => ({ ...s, description: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Part Number / SKU</label>
                  <input
                    type="text"
                    placeholder="Ex: 90915-YZZF2"
                    value={newSpec.partNumber}
                    onChange={(e) => setNewSpec((s) => ({ ...s, partNumber: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Qtd</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newSpec.quantity}
                      onChange={(e) => setNewSpec((s) => ({ ...s, quantity: Number(e.target.value) }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Unidade</label>
                    <select
                      value={newSpec.unit}
                      onChange={(e) => setNewSpec((s) => ({ ...s, unit: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                    >
                      {SPEC_UNIT_OPTIONS[newSpec.type].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Observação técnica</label>
                <input
                  type="text"
                  placeholder="Ex: Usar somente 0W20 no motor híbrido."
                  value={newSpec.notes}
                  onChange={(e) => setNewSpec((s) => ({ ...s, notes: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSpec}
                disabled={!newSpec.description.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface-variant font-bold rounded-lg text-xs hover:bg-surface-container-high transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.make || !form.model}
              className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? "Salvando..." : selected ? "Salvar Alterações" : "Criar Catálogo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
