"use client";

import React from "react";
import { ShoppingCart, Check } from "lucide-react";
import { PurchaseOrder } from "../_lib/types";
import { generatePurchaseOrderCode, getPOStatusLabel, getPOStatusColor } from "../_lib/helpers";

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: any[];
  onDeliver?: (po: PurchaseOrder) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PurchaseOrdersTable({
  purchaseOrders,
  suppliers,
  onDeliver,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhuma compra registrada."
}: PurchaseOrdersTableProps) {
  const getSupplierName = (supplierId: string) => {
    const sup = suppliers.find(s => s.id === supplierId);
    return sup ? sup.name : "Fornecedor não encontrado";
  };

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
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span>Ordens de Compra & Reposição</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/60 border-b border-outline-variant">
            <tr className="font-bold text-on-surface-variant">
              <th className="px-6 py-3">Nº Pedido</th>
              <th className="px-6 py-3">Fornecedor</th>
              <th className="px-6 py-3">Pagamento</th>
              <th className="px-6 py-3">Emissão</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Valor Total</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-outline italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              purchaseOrders
                .slice()
                .reverse()
                .map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      {generatePurchaseOrderCode(po.id)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {getSupplierName(po.supplierId)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {po.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {new Date(po.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      {po.status === "delivered" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                          Entregue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[9px] border border-amber-200">
                          Emitido / Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      {po.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {po.status === "ordered" && canEdit ? (
                        <button
                          onClick={() => onDeliver?.(po)}
                          className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-obsidian-950 font-bold text-[10px] shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Receber</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">
                          Recebido em {new Date(po.deliveredAt || "").toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
