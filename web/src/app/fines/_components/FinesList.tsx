"use client";

import React, { useMemo, useState } from "react";
import { Search, Filter, ChevronRight } from "lucide-react";
import {
  TrafficFine,
  FineCategory,
  TrafficFineStatus,
  FineCategoryLabels,
  FineCategoryColors,
  FineStatusLabels,
  FineStatusColors,
  ResponsiblePartyLabels,
} from "../_lib/types";

const money = (v = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const dateStr = (v?: string) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "—";

interface Props {
  fines: TrafficFine[];
  getEffectiveAmount: (fine: TrafficFine) => number;
  onSelect: (fine: TrafficFine) => void;
}

const ALL = "all";

export function FinesList({ fines, getEffectiveAmount, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FineCategory | typeof ALL>(ALL);
  const [statusFilter, setStatusFilter] = useState<TrafficFineStatus | typeof ALL>(ALL);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return fines.filter((f) => {
      const matchQ =
        !q ||
        f.plate.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.noticeNumber.toLowerCase().includes(q) ||
        (f.driverName || "").toLowerCase().includes(q);
      const matchCat = categoryFilter === ALL || f.fineCategory === categoryFilter;
      const matchStatus = statusFilter === ALL || f.status === statusFilter;
      return matchQ && matchCat && matchStatus;
    });
  }, [fines, query, categoryFilter, statusFilter]);

  const categories: (FineCategory | typeof ALL)[] = [ALL, "transit", "dtp", "operational", "contractual"];
  const statuses: (TrafficFineStatus | typeof ALL)[] = [
    ALL, "received", "pending_driver_id", "driver_identified", "charged", "appealing", "paid",
  ];

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por placa, AIT, motorista..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`h-8 px-3 rounded-lg border text-[9px] font-black transition-colors ${
                categoryFilter === cat
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
              }`}
            >
              {cat === ALL ? "Todas" : FineCategoryLabels[cat as FineCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5 flex-wrap">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`h-7 px-2.5 rounded-lg border text-[9px] font-black transition-colors ${
              statusFilter === st
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-slate-200 text-slate-500 hover:border-indigo-300 bg-white"
            }`}
          >
            {st === ALL ? "Todos status" : FineStatusLabels[st as TrafficFineStatus]}
          </button>
        ))}
      </div>

      {/* Contagem */}
      <p className="text-[10px] text-slate-400 font-bold">
        {filtered.length} infração{filtered.length !== 1 ? "ões" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">Nenhuma infração encontrada.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((fine) => {
              const effective = getEffectiveAmount(fine);
              const hasDiscount = effective < fine.originalAmount;
              const today = new Date().toISOString().substring(0, 10);
              const daysToDiscount = fine.discountDeadline
                ? Math.ceil(
                    (new Date(fine.discountDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <button
                  key={fine.id}
                  onClick={() => onSelect(fine)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                >
                  {/* Categoria badge */}
                  <div className="shrink-0">
                    <span
                      className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                        FineCategoryColors[fine.fineCategory]
                      }`}
                    >
                      {FineCategoryLabels[fine.fineCategory]}
                    </span>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-slate-900 truncate">{fine.description}</p>
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${FineStatusColors[fine.status]}`}
                      >
                        {FineStatusLabels[fine.status]}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-[9px] text-slate-400 flex-wrap">
                      <span>🚘 {fine.plate}</span>
                      <span>AIT {fine.noticeNumber}</span>
                      <span>{fine.issuingAgency}</span>
                      {fine.driverName && <span>👤 {fine.driverName}</span>}
                      <span>{fine.points}pts CNH</span>
                      <span>Ocorr. {dateStr(fine.occurrenceDate)}</span>
                    </div>
                    {hasDiscount && daysToDiscount !== null && daysToDiscount >= 0 && (
                      <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                        🏷 Desconto disponível por mais {daysToDiscount}d
                      </p>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="text-right shrink-0">
                    {hasDiscount && (
                      <p className="text-[9px] text-slate-400 line-through">
                        {money(fine.originalAmount)}
                      </p>
                    )}
                    <p className="text-sm font-black text-slate-900">{money(effective)}</p>
                    <p className="text-[8px] text-slate-400">
                      Vence {dateStr(fine.dueDate)}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
