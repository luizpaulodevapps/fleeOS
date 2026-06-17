"use client";

import React, { useState } from "react";
import {
  MaintenanceProcedure,
  MaintenanceProcedureFormData,
  ProcedurePartKit,
  ProcedurePartKitItem,
  ProcedureCategory,
} from "../_lib/types";
import { PROCEDURE_CATEGORY_LABELS } from "../_lib/maintenanceEngine";
import { X, Plus, Trash2, Settings, Package } from "lucide-react";

interface ProcedureCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    formData: MaintenanceProcedureFormData,
    kitItems: ProcedurePartKitItem[]
  ) => Promise<void>;
  selected: MaintenanceProcedure | null;
  existingKit: ProcedurePartKit | null;
  inventoryItems: any[];
}

const defaultProcedureForm = (): MaintenanceProcedureFormData => ({
  name: "",
  category: "other",
  intervalKm: "",
  intervalDays: "",
  estimatedDurationMinutes: "30",
  mandatory: false,
  notes: "",
});

const emptyKitItem = (): ProcedurePartKitItem => ({
  inventoryItemId: null,
  description: "",
  qty: 1,
  unit: "unidade",
});

const UNITS = ["unidade", "jogo", "litros", "metros", "kg", "par"];

export function ProcedureCatalogModal({
  isOpen,
  onClose,
  onSave,
  selected,
  existingKit,
  inventoryItems,
}: ProcedureCatalogModalProps) {
  const [formData, setFormData] = useState<MaintenanceProcedureFormData>(
    selected
      ? {
          name: selected.name,
          category: selected.category,
          intervalKm: selected.intervalKm?.toString() || "",
          intervalDays: selected.intervalDays?.toString() || "",
          estimatedDurationMinutes: selected.estimatedDurationMinutes.toString(),
          mandatory: selected.mandatory,
          notes: selected.notes,
        }
      : defaultProcedureForm()
  );

  const [kitItems, setKitItems] = useState<ProcedurePartKitItem[]>(
    existingKit?.items || []
  );
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name,
        category: selected.category,
        intervalKm: selected.intervalKm?.toString() || "",
        intervalDays: selected.intervalDays?.toString() || "",
        estimatedDurationMinutes: selected.estimatedDurationMinutes.toString(),
        mandatory: selected.mandatory,
        notes: selected.notes,
      });
      setKitItems(existingKit?.items || []);
    } else {
      setFormData(defaultProcedureForm());
      setKitItems([]);
    }
  }, [selected, existingKit]);

  const addKitItem = () => setKitItems((prev) => [...prev, emptyKitItem()]);

  const removeKitItem = (idx: number) =>
    setKitItems((prev) => prev.filter((_, i) => i !== idx));

  const updateKitItem = (
    idx: number,
    field: keyof ProcedurePartKitItem,
    value: any
  ) => {
    setKitItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]: value,
              // Auto-fill description when picking from inventory
              ...(field === "inventoryItemId" && value
                ? {
                    description:
                      inventoryItems.find((inv) => inv.id === value)?.name ||
                      item.description,
                  }
                : {}),
            }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await onSave(formData, kitItems);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-violet-100 rounded-lg">
              <Settings className="w-5 h-5 text-violet-600" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-primary font-geist">
                {selected ? "Editar Procedimento" : "Novo Procedimento"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Catálogo reutilizável de procedimentos de manutenção
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Nome do Procedimento *
            </label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Troca de Óleo"
              required
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(PROCEDURE_CATEGORY_LABELS) as [ProcedureCategory, string][]).map(([cat, label]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, category: cat }))}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    formData.category === cat
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervalos */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Intervalo (km)
              </label>
              <input
                type="number"
                value={formData.intervalKm}
                onChange={(e) => setFormData((p) => ({ ...p, intervalKm: e.target.value }))}
                placeholder="10000"
                min={0}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Intervalo (dias)
              </label>
              <input
                type="number"
                value={formData.intervalDays}
                onChange={(e) => setFormData((p) => ({ ...p, intervalDays: e.target.value }))}
                placeholder="365"
                min={0}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Duração (min)
              </label>
              <input
                type="number"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => setFormData((p) => ({ ...p, estimatedDurationMinutes: e.target.value }))}
                placeholder="30"
                min={0}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Obrigatório */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mandatory}
              onChange={(e) => setFormData((p) => ({ ...p, mandatory: e.target.checked }))}
              className="rounded border-outline-variant text-primary"
            />
            <span className="text-xs font-semibold text-on-surface">Procedimento Obrigatório</span>
          </label>

          {/* Kit de Peças */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" />
                Kit de Peças
              </label>
              <button
                type="button"
                onClick={addKitItem}
                className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Adicionar Peça
              </button>
            </div>

            {kitItems.length === 0 ? (
              <p className="text-outline text-[11px] italic px-1">
                Nenhuma peça no kit. Clique em "Adicionar Peça" para vincular insumos.
              </p>
            ) : (
              <div className="space-y-2">
                {kitItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-surface-container p-2 rounded-lg border border-outline-variant">
                    {/* Peça do estoque (opcional) */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={item.inventoryItemId || ""}
                        onChange={(e) => updateKitItem(idx, "inventoryItemId", e.target.value || null)}
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant rounded text-[10px] text-on-surface mb-1"
                      >
                        <option value="">— Sem vínculo ao estoque —</option>
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            [{inv.code}] {inv.name}
                          </option>
                        ))}
                      </select>
                      <input
                        value={item.description}
                        onChange={(e) => updateKitItem(idx, "description", e.target.value)}
                        placeholder="Descrição da peça *"
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant rounded text-[10px] text-on-surface"
                      />
                    </div>

                    <div className="flex gap-1 items-center shrink-0">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateKitItem(idx, "qty", Number(e.target.value))}
                        min={0.01}
                        step={0.01}
                        className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant rounded text-[10px] text-on-surface text-right"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateKitItem(idx, "unit", e.target.value)}
                        className="px-2 py-1.5 bg-surface-container-low border border-outline-variant rounded text-[10px] text-on-surface"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeKitItem(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Observações Técnicas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              placeholder="Ex: Utilizar óleo especificado pelo fabricante."
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container">
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
            className="px-5 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            {selected ? "Salvar" : "Criar Procedimento"}
          </button>
        </div>
      </div>
    </div>
  );
}
