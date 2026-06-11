"use client";

import React from "react";
import { X, AlertCircle } from "lucide-react";
import { PurchaseOrderFormData, POItemInput } from "../_lib/types";
import { PAYMENT_METHODS } from "../_lib/constants";

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: PurchaseOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseOrderFormData>>;
  newPoItem: POItemInput;
  setNewPoItem: React.Dispatch<React.SetStateAction<POItemInput>>;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  suppliers: any[];
  inventoryItems: any[];
  loading?: boolean;
}

export function PurchaseOrderModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  newPoItem,
  setNewPoItem,
  onAddItem,
  onRemoveItem,
  suppliers,
  inventoryItems,
  loading = false
}: PurchaseOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-background border border-outline-variant rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="text-lg font-bold text-primary font-geist">Lançar Compra / Entrada de Peças</h3>
            <p className="text-xs text-on-surface-variant mt-1">Registrar ordem de compra de estoque. A entrada física ocorre após marcar a compra como Entregue.</p>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Fornecedor</label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-semibold"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Condição de Pagamento</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-semibold"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PO ITEMS SECTION */}
          <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl space-y-3">
            <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider block">
              📦 Selecionar Peças Compradas
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 rounded-lg border border-outline-variant/60">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-bold text-outline uppercase mb-1">Peça / Insumo</label>
                <select
                  value={newPoItem.itemId}
                  onChange={(e) => {
                    const part = inventoryItems.find(i => i.id === e.target.value);
                    setNewPoItem(prev => ({
                      ...prev,
                      itemId: e.target.value,
                      unitCost: part?.avgCost || 0
                    }));
                  }}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none font-semibold"
                >
                  {inventoryItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-outline uppercase mb-1">Qtd Comprada</label>
                <input
                  type="number"
                  value={newPoItem.qty}
                  onChange={(e) => setNewPoItem(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                  className="w-full px-2 py-1 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-outline uppercase mb-1">Valor Unitário (R$)</label>
                <input
                  type="number"
                  value={newPoItem.unitCost}
                  onChange={(e) => setNewPoItem(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                  className="w-full px-2 py-1 bg-slate-50 border border-outline-variant rounded text-[11px] outline-none"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="button"
                  onClick={onAddItem}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded font-bold text-[10px]"
                >
                  Adicionar Item
                </button>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2">Peça</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Vl Unit</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 text-right">Remover</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center italic text-slate-400">Nenhum item adicionado à compra.</td>
                    </tr>
                  ) : (
                    formData.items.map((item, idx) => {
                      const itemName = inventoryItems.find(i => i.id === item.itemId)?.name || "Item desconhecido";
                      const itemCode = inventoryItems.find(i => i.id === item.itemId)?.code || "-";
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-slate-700">
                            [{itemCode}] {itemName}
                          </td>
                          <td className="p-2 text-right font-mono">{item.qty}</td>
                          <td className="p-2 text-right font-mono">
                            {item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-800">
                            {(item.qty * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => onRemoveItem(idx)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-extrabold uppercase">Total da Ordem de Compra:</span>
              <span className="text-lg font-black text-primary font-mono">
                {formData.items.reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
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
              {loading ? "Emitindo..." : "Emitir Compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
