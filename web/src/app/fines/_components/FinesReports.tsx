"use client";

import React, { useMemo } from "react";
import { BarChart3, TrendingDown, TrendingUp, Award } from "lucide-react";
import { TrafficFine, FineCategoryLabels, FineCategory } from "../_lib/types";

const money = (v = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface Props {
  fines: TrafficFine[];
  drivers: any[];
  getEffectiveAmount: (fine: TrafficFine) => number;
  getDriverPoints: (driverId: string) => number;
}

export function FinesReports({ fines, drivers, getEffectiveAmount, getDriverPoints }: Props) {
  // Ranking de motoristas por número de multas
  const driverFineCount = useMemo(() => {
    const counts: Record<string, { driver: any; count: number; total: number; points: number }> = {};
    for (const f of fines) {
      if (!f.driverId) continue;
      if (!counts[f.driverId]) {
        const driver = drivers.find((d) => d.id === f.driverId);
        counts[f.driverId] = { driver, count: 0, total: 0, points: 0 };
      }
      counts[f.driverId].count++;
      counts[f.driverId].total += getEffectiveAmount(f);
      counts[f.driverId].points += f.points || 0;
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [fines, drivers]);

  // Por categoria
  const byCategory = useMemo(() => {
    const cats: Record<string, { count: number; total: number }> = {};
    for (const f of fines) {
      if (!cats[f.fineCategory]) cats[f.fineCategory] = { count: 0, total: 0 };
      cats[f.fineCategory].count++;
      cats[f.fineCategory].total += getEffectiveAmount(f);
    }
    return Object.entries(cats).sort((a, b) => b[1].total - a[1].total);
  }, [fines]);

  // Valores: recuperados vs perdidos
  const recovered = fines
    .filter((f) => f.status === "appeal_granted")
    .reduce((s, f) => s + f.originalAmount, 0);
  const paid = fines
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + getEffectiveAmount(f), 0);
  const open = fines
    .filter((f) => !["paid", "archived", "appeal_granted"].includes(f.status))
    .reduce((s, f) => s + getEffectiveAmount(f), 0);

  // Tempo médio de encerramento (received → paid, em dias)
  const closedFines = fines.filter((f) => f.status === "paid" && f.createdAt);
  const avgCloseDays =
    closedFines.length > 0
      ? Math.round(
          closedFines.reduce((sum, f) => {
            const created = new Date(f.createdAt).getTime();
            const updated = new Date(f.updatedAt || f.createdAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / closedFines.length
        )
      : null;

  // Pontos por motorista
  const pointsRanking = drivers
    .map((d) => ({ driver: d, points: getDriverPoints(d.id) }))
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Sumário financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Em Aberto" value={money(open)} icon={TrendingDown} color="red" />
        <SummaryCard label="Pago" value={money(paid)} icon={TrendingUp} color="green" />
        <SummaryCard label="Recuperado (Recurso)" value={money(recovered)} icon={Award} color="purple" />
        <SummaryCard
          label="Tempo Médio de Encerramento"
          value={avgCloseDays !== null ? `${avgCloseDays} dias` : "—"}
          icon={BarChart3}
          color="indigo"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Ranking motoristas */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-700">Ranking — Motoristas por Multas</h3>
          </div>
          {driverFineCount.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Nenhuma multa atribuída a motoristas.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {driverFineCount.map(({ driver, count, total, points }, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {driver?.name || "Desconhecido"}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {count} multa{count !== 1 ? "s"  : ""} · {points} pts CNH
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-900 shrink-0">{money(total)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Por categoria */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-700">Multas por Categoria</h3>
          </div>
          {byCategory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Sem dados.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {byCategory.map(([cat, data]) => {
                const maxTotal = Math.max(...byCategory.map(([, d]) => d.total), 1);
                const pct = (data.total / maxTotal) * 100;
                return (
                  <div key={cat} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700">
                        {FineCategoryLabels[cat as FineCategory] || cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{data.count}x</span>
                        <span className="font-black text-slate-900">{money(data.total)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Pontuação CNH */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-700">Pontuação CNH por Motorista</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">Suspensão a partir de 20 pontos em 12 meses</p>
        </div>
        {pointsRanking.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Nenhum motorista com pontos acumulados. ✅</p>
        ) : (
          <div className="p-4 space-y-2">
            {pointsRanking.map(({ driver, points }) => {
              const pct = Math.min((points / 20) * 100, 100);
              return (
                <div key={driver.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 truncate">{driver.name}</span>
                    <span
                      className={`font-black ${
                        points >= 20 ? "text-red-600" : points >= 15 ? "text-orange-600" : "text-amber-600"
                      }`}
                    >
                      {points}/20 pts
                      {points >= 20 && " ⚠ SUSPENSÃO"}
                      {points >= 15 && points < 20 && " ⚠ RISCO ALTO"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        points >= 20 ? "bg-red-500" : points >= 15 ? "bg-orange-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-500",
    green: "bg-emerald-50 text-emerald-500",
    purple: "bg-purple-50 text-purple-500",
    indigo: "bg-indigo-50 text-indigo-500",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400 mt-3">{label}</p>
      <p className="font-geist text-base font-black text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}
