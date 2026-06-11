"use client";

import React, { useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { MaintenanceFormData } from "../_lib/types";
import { MAINTENANCE_TYPES, CRASH_SEVERITY } from "../_lib/constants";

interface MaintenanceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
  vehicles: any[];
  loading?: boolean;
}

export function MaintenanceLogModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  vehicles,
  loading = false
}: MaintenanceLogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary font-geist">Lançamento Avulso de Manutenção</h3>
            <p className="text-xs text-on-surface-variant mt-1">Registrar manutenções executadas ou sinistros avulsos no ativo.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Veículo</label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => {
                const veh = vehicles.find(v => v.id === e.target.value);
                setFormData({
                  ...formData,
                  vehicleId: e.target.value,
                  mileage: veh?.mileage?.toString() || "0",
                  nextMaintenanceMileage: veh?.mileage ? (veh.mileage + 10000).toString() : "10000"
                });
              }}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Tipo de Reparo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              >
                {MAINTENANCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Custo do Serviço (R$)</label>
              <input
                type="number"
                required
                placeholder="Ex: 350"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          {formData.type === "Sinistro" && (
            <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/25 space-y-3">
              <p className="font-bold text-orange-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Detalhes do Sinistro / Colisão</span>
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">Gravidade do Acidente</label>
                <select
                  value={formData.crashSeverity}
                  onChange={(e) => setFormData({ ...formData, crashSeverity: e.target.value as any })}
                  className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                >
                  {CRASH_SEVERITY.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Data do Lançamento</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-2">KM no Lançamento</label>
              <input
                type="number"
                required
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-2">Próxima Revisão (KM)</label>
              <input
                type="number"
                required
                value={formData.nextMaintenanceMileage}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceMileage: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Descrição dos Serviços executados</label>
            <textarea
              required
              rows={3}
              placeholder={formData.type === "Sinistro" ? "Detalhe como ocorreu o sinistro, partes danificadas..." : "Troca de óleo, pastilhas de freio..."}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>

          <div className="flex items-center space-x-2.5 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
            <input
              type="checkbox"
              id="putInMaint"
              checked={formData.putInMaintenanceStatus}
              onChange={(e) => setFormData({ ...formData, putInMaintenanceStatus: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="putInMaint" className="text-xs font-semibold text-primary cursor-pointer select-none">
              Colocar veículo em status "Em Manutenção" na frota?
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant">
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
              className="px-6 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
