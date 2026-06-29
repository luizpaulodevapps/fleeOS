"use client";

import React, { useState, useMemo } from "react";
import { Building } from "lucide-react";
import { Supplier } from "../_lib/types";

interface SuppliersListProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

const TYPE_LABELS: Record<string, string> = {
  peças: "Distribuidor / Peças",
  mecanica: "Oficina Mecânica",
  funilaria: "Funilaria & Pintura",
  retifica: "Retífica de Motores",
  eletrica: "Auto-Elétrica",
  outro: "Outro Prestador",
};

const TYPE_COLORS: Record<string, string> = {
  peças: "bg-emerald-50 text-emerald-700 border-emerald-200",
  mecanica: "bg-violet-50 text-violet-700 border-violet-200",
  funilaria: "bg-cyan-50 text-cyan-700 border-cyan-200",
  retifica: "bg-orange-50 text-orange-700 border-orange-200",
  eletrica: "bg-amber-50 text-amber-700 border-amber-200",
  outro: "bg-slate-100 text-slate-650 border-slate-200",
};

export function SuppliersList({
  suppliers,
  onEdit,
  canEdit = false,
  isLoading = false,
  emptyMessage = "Nenhum parceiro ou oficina cadastrado."
}: SuppliersListProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => filterType === "all" || (sup.type || "peças") === filterType);
  }, [suppliers, filterType]);

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
          <span>Parceiros Homologados e Oficinas</span>
        </span>
      </div>

      {/* Type Filter Buttons */}
      <div className="px-4 py-3 border-b border-outline-variant flex gap-1.5 overflow-x-auto print:hidden bg-slate-50/50">
        {[
          { id: "all", label: "Todos" },
          { id: "peças", label: "Peças / Insumos" },
          { id: "mecanica", label: "Oficinas" },
          { id: "funilaria", label: "Funilaria" },
          { id: "retifica", label: "Retíficas" },
          { id: "eletrica", label: "Elétrica" },
          { id: "outro", label: "Outros" }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilterType(item.id)}
            className={`h-7 px-2.5 rounded-lg font-bold border transition-all text-[10px] whitespace-nowrap ${
              filterType === item.id
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white border-outline-variant text-outline hover:text-on-surface"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-outline-variant/60">
        {filteredSuppliers.length === 0 ? (
          <p className="p-4 text-center italic text-outline text-xs">{emptyMessage}</p>
        ) : (
          filteredSuppliers.map(sup => (
            <div key={sup.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-start text-xs">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-bold text-primary text-sm">{sup.name}</p>
                  <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${TYPE_COLORS[sup.type || "peças"]}`}>
                    {TYPE_LABELS[sup.type || "peças"]}
                  </span>
                </div>
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
