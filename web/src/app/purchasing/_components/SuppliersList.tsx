"use client";

import React from "react";
import { Building } from "lucide-react";
import { Supplier } from "../_lib/types";

interface SuppliersListProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function SuppliersList({
  suppliers,
  onEdit,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhum fornecedor cadastrado."
}: SuppliersListProps) {
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
          <Building className="w-4 h-4 text-primary" />
          <span>Fornecedores Homologados</span>
        </span>
      </div>

      <div className="divide-y divide-outline-variant/60">
        {suppliers.length === 0 ? (
          <p className="p-4 text-center italic text-outline text-xs">{emptyMessage}</p>
        ) : (
          suppliers.map(sup => (
            <div key={sup.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-start text-xs">
              <div className="space-y-1">
                <p className="font-bold text-primary text-sm">{sup.name}</p>
                <p className="font-mono text-slate-500 text-[11px]">CNPJ: {sup.cnpj}</p>
                <p className="text-slate-600 text-[11px]">Fone: {sup.phone}</p>
                <p className="text-slate-500 font-semibold text-[11px]">{sup.email}</p>
                <p className="text-[10px] text-slate-400">{sup.address}</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => onEdit?.(sup)}
                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold text-[10px] whitespace-nowrap"
                >
                  Editar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
