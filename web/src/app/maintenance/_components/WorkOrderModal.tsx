"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Plus } from "lucide-react";
import { WorkOrderFormData, WorkOrderItemInput } from "../_lib/types";
import { WORK_ORDER_STATUS } from "../_lib/constants";
import { VehicleSearchSelect } from "./VehicleSearchSelect";

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: WorkOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<WorkOrderFormData>>;
  newWoItem: WorkOrderItemInput;
  setNewWoItem: React.Dispatch<React.SetStateAction<WorkOrderItemInput>>;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  vehicles: any[];
  inventoryItems: any[];
  selectedWo?: any;
  loading?: boolean;
}

export function WorkOrderModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  newWoItem,
  setNewWoItem,
  onAddItem,
  onRemoveItem,
  vehicles,
  inventoryItems,
  selectedWo,
  loading = false
}: WorkOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-background border border-outline-variant rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="text-lg font-bold text-primary font-geist">
              {selectedWo ? `Visualizar / Editar OS-${selectedWo.id.substring(0, 5).toUpperCase()}` : "Abrir Nova Ordem de Serviço (OS)"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Registrar insumos, mão de obra, odômetro e status técnico do veículo.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-grow overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Veículo</label>
              <VehicleSearchSelect
                vehicles={vehicles}
                value={formData.vehicleId}
                onChange={(vehicleId) => {
                  const veh = vehicles.find(v => v.id === vehicleId);
                  setFormData(prev => ({
                    ...prev,
                    vehicleId,
                    mileage: veh?.mileage?.toString() || "0"
                  }));
                }}
                disabled={selectedWo && selectedWo.status === "completed"}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Quilometragem OS (KM)</label>
              <input
                type="number"
                required
                disabled={selectedWo && selectedWo.status === "completed"}
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Descrição da OS (Motivo / Diagnóstico)</label>
            <input
              type="text"
              required
              disabled={selectedWo && selectedWo.status === "completed"}
              placeholder="Ex: Troca de pastilhas de freio dianteiras e barulho na suspensão"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Status da OS</label>
            <select
              disabled={selectedWo && selectedWo.status === "completed"}
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-semibold"
            >
              {WORK_ORDER_STATUS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* OS ITEMS SECTION */}
          <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl space-y-4">
            <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider block">
              🛠️ Itens da Ordem de Serviço (Peças & Mão de Obra)
            </span>

            {(!selectedWo || selectedWo.status !== "completed") && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 rounded-lg border border-outline-variant/60">
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-1">Tipo</label>
                  <select
                    value={newWoItem.type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      const defaultPart = inventoryItems[0];
                      setNewWoItem(prev => ({
                        ...prev,
                        type,
                        itemId: type === "PART" ? (defaultPart?.id || "") : "",
                        unitCost: type === "PART" ? (defaultPart?.avgCost || 0) : 0,
                        description: type === "PART" ? (defaultPart?.name || "") : ""
                      }));
                    }}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                  >
                    <option value="PART">Peça / Insumo</option>
                    <option value="LABOR">Mão de Obra (Serviço)</option>
                  </select>
                </div>

                {newWoItem.type === "PART" ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-outline uppercase mb-1">Selecionar Peça</label>
                    <select
                      value={newWoItem.itemId}
                      onChange={(e) => {
                        const part = inventoryItems.find(i => i.id === e.target.value);
                        setNewWoItem(prev => ({
                          ...prev,
                          itemId: e.target.value,
                          unitCost: part?.avgCost || 0,
                          description: part?.name || ""
                        }));
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none font-semibold"
                    >
                      {inventoryItems.filter(i => i.active).map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.code}) - Custo: R${i.avgCost}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-outline uppercase mb-1">Descrição do Serviço</label>
                    <input
                      type="text"
                      placeholder="Mão de obra suspensão, retífica..."
                      value={newWoItem.description}
                      onChange={(e) => setNewWoItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-1">Qtd</label>
                    <input
                      type="number"
                      value={newWoItem.qty}
                      onChange={(e) => setNewWoItem(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                      className="w-full px-2 py-1 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-1">Vl Unit</label>
                    <input
                      type="number"
                      value={newWoItem.unitCost}
                      onChange={(e) => setNewWoItem(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                      className="w-full px-2 py-1 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onAddItem}
                    className="px-3 py-1.5 bg-primary text-on-primary rounded font-bold text-[10px]"
                  >
                    Inserir na OS
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2">Item / Descrição</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Vl Unit</th>
                    <th className="p-2 text-right">Subtotal</th>
                    {(!selectedWo || selectedWo.status !== "completed") && <th className="p-2 text-right">Remover</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center italic text-slate-400">Nenhum item adicionado.</td>
                    </tr>
                  ) : (
                    formData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-700">
                          {item.itemId ? `[${item.itemId.substring(0, 4)}] ` : ""}
                          {item.description}
                        </td>
                        <td className="p-2">
                          {item.type === "PART" ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[8px] font-bold border border-emerald-100">PEÇA</span>
                          ) : (
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[8px] font-bold border border-blue-100">SERVIÇO</span>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono">{item.qty}</td>
                        <td className="p-2 text-right font-mono">
                          {item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {(item.qty * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        {(!selectedWo || selectedWo.status !== "completed") && (
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => onRemoveItem(idx)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotals & Totals */}
            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px]">
                  Peças: {formData.items.filter(i => i.type === "PART").reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-slate-500 text-[10px]">
                  Mão de Obra: {formData.items.filter(i => i.type === "LABOR").reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px]">Custo Total da OS</p>
                <p className="text-lg font-black text-primary">
                  {formData.items.reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>

          {/* Warning on Status Change to Completed */}
          {formData.status === "completed" && (!selectedWo || selectedWo.status !== "completed") && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 font-bold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Atenção: Ao salvar a OS como CONCLUÍDA, o estoque será debitado e o custo será imputado ao ROI do veículo de forma irreversível.</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold"
            >
              Cancelar
            </button>
            {(!selectedWo || selectedWo.status !== "completed") && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Ordem de Serviço"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
