"use client";

import React from "react";
import { X } from "lucide-react";
import { InventoryFormData } from "../_lib/types";
import { INVENTORY_UNITS } from "../_lib/constants";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: InventoryFormData;
  setFormData: (data: InventoryFormData) => void;
  selectedItem?: any;
  generatePartCode?: () => string;
  loading?: boolean;
}

export function InventoryModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  selectedItem,
  generatePartCode,
  loading = false
}: InventoryModalProps) {
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

        <h3 className="text-base font-bold text-primary mb-2 font-geist">
          {selectedItem ? "Editar Peça / Insumo" : "Cadastrar Nova Peça no Estoque"}
        </h3>
        <p className="text-xs text-on-surface-variant mb-5">Insira os dados técnicos do insumo para controle de estoque mínimo e custo médio.</p>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Código Técnico</label>
            <input
              type="text"
              required
              placeholder="Ex: PEA-FRE-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Nome do Item</label>
            <input
              type="text"
              required
              placeholder="Ex: Pastilha de Freio Corolla"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Unidade</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
              >
                {INVENTORY_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Estoque Mínimo</label>
              <input
                type="number"
                required
                value={formData.minQty}
                onChange={(e) => setFormData({ ...formData, minQty: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
              />
            </div>
          </div>

          {!selectedItem && (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-outline-variant/60">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Estoque Inicial</label>
                <input
                  type="number"
                  required
                  value={formData.currentQty}
                  onChange={(e) => setFormData({ ...formData, currentQty: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none text-on-surface font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Custo Médio Inicial</label>
                <input
                  type="number"
                  required
                  value={formData.avgCost}
                  onChange={(e) => setFormData({ ...formData, avgCost: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none text-on-surface font-bold text-primary"
                />
              </div>
            </div>
          )}

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
              {loading ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
