"use client";

import React from "react";
import { Package, Trash2 } from "lucide-react";
import { InventoryItem } from "../_lib/types";
import { isStockLow } from "../_lib/helpers";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function InventoryTable({
  items,
  onEdit,
  onDelete,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhuma peça cadastrada no estoque."
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant text-xs">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-outline-variant">
        <span className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span>Inventário de Peças & Insumos</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/60 border-b border-outline-variant">
            <tr className="font-bold text-on-surface-variant">
              <th className="px-6 py-3">Cód Peça</th>
              <th className="px-6 py-3">Nome do Item</th>
              <th className="px-6 py-3">Unidade</th>
              <th className="px-6 py-3 text-right">Qtd em Estoque</th>
              <th className="px-6 py-3 text-right">Qtd Mínima</th>
              <th className="px-6 py-3 text-right">Custo Médio</th>
              <th className="px-6 py-3 text-right">Valor Total Estocado</th>
              <th className="px-6 py-3 text-right">Status Estoque</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-outline italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map(item => {
                const isLow = isStockLow(item.currentQty, item.minQty);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold">{item.code}</td>
                    <td className="px-6 py-4 font-bold text-primary">{item.name}</td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{item.currentQty}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">{item.minQty}</td>
                    <td className="px-6 py-4 text-right font-mono">
                      {item.avgCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      {((item.currentQty || 0) * (item.avgCost || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[9px] border border-red-200">
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                          Adequado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="px-2 py-1 rounded bg-surface-container border border-outline-variant hover:bg-surface-container-high text-primary font-bold text-[10px]"
                      >
                        Editar
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => onDelete?.(item.id)}
                          className="p-1 text-outline hover:text-error rounded inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
