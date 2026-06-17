"use client";

import React from "react";
import {
  AlertTriangle,
  FileWarning,
  Scale,
  TrendingUp,
  Clock,
  Percent,
  Star,
} from "lucide-react";
import { TrafficFine, FineStatusColors, FineStatusLabels } from "../_lib/types";

const money = (v = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface Props {
  kpis: {
    totalReceived: number;
    pendingId: number;
    totalToCollect: number;
    inAppeal: number;
    expiringIn5Days: number;
    discountExpiring: number;
    totalPoints: number;
  };
  fines: TrafficFine[];
  getDriverPoints: (driverId: string) => number;
  drivers: any[];
}

export function FinesDashboard({ kpis, fines, getDriverPoints, drivers }: Props) {
  const date = (v?: string) =>
    v ? new Date(v).toLocaleDateString("pt-BR") : "—";

  // Ranking de motoristas por pontos
  const driverRanking = drivers
    .map((d) => ({ driver: d, points: getDriverPoints(d.id) }))
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  // Multas com desconto expirando
  const discountUrgent = fines
    .filter((f) => {
      if (!f.discountDeadline) return false;
      const days = (new Date(f.discountDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 3;
    })
    .slice(0, 4);

  // Multas vencendo em 5 dias
  const dueSoon = fines
    .filter((f) => {
      if (f.status === "paid" || f.status === "archived" || f.status === "appeal_granted") return false;
      const days = (new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 5;
    })
    .slice(0, 4);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={FileWarning}
          label="A Identificar"
          value={String(kpis.pendingId)}
          sub="condutores pendentes"
          color="amber"
        />
        <KpiCard
          icon={TrendingUp}
          label="A Cobrar"
          value={money(kpis.totalToCollect)}
          sub="identificadas, sem AR"
          color="indigo"
        />
        <KpiCard
          icon={Scale}
          label="Em Recurso"
          value={String(kpis.inAppeal)}
          sub="aguardando julgamento"
          color="purple"
        />
        <KpiCard
          icon={Star}
          label="Pontos em Risco"
          value={String(kpis.totalPoints)}
          sub="pontos CNH acumulados"
          color={kpis.totalPoints >= 15 ? "red" : kpis.totalPoints >= 10 ? "amber" : "green"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Vencendo em breve */}
        <section className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black text-red-700">Vencendo em 5 dias</h3>
            {kpis.expiringIn5Days > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {kpis.expiringIn5Days}
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {dueSoon.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhuma vencendo em breve. ✅</p>
            ) : (
              dueSoon.map((f) => (
                <div key={f.id} className="px-4 py-3 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{f.description}</span>
                    <span className="font-black text-red-600 shrink-0 ml-2">
                      {money(f.currentAmount)}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    {f.plate} · Vence {date(f.dueDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Desconto expirando */}
        <section className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-amber-700">Desconto Expirando</h3>
            {kpis.discountExpiring > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {kpis.discountExpiring}
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {discountUrgent.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum desconto expirando. ✅</p>
            ) : (
              discountUrgent.map((f) => (
                <div key={f.id} className="px-4 py-3 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{f.description}</span>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-slate-400 line-through text-[9px]">{money(f.originalAmount)}</p>
                      <p className="font-black text-emerald-600">{money(f.currentAmount)}</p>
                    </div>
                  </div>
                  <p className="text-amber-600 font-bold mt-0.5">
                    Desconto até {date(f.discountDeadline)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Ranking CNH */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-black text-slate-700">Pontuação CNH</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {driverRanking.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum motorista com pontos.</p>
            ) : (
              driverRanking.map(({ driver, points }) => (
                <div key={driver.id} className="px-4 py-3 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-800 truncate">{driver.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        points >= 20
                          ? "bg-red-100 text-red-700"
                          : points >= 15
                          ? "bg-orange-100 text-orange-700"
                          : points >= 10
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {points} pts
                    </span>
                    {points >= 20 && (
                      <span className="text-[8px] font-black text-red-600">SUSPENSÃO</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  color: "amber" | "indigo" | "purple" | "red" | "green";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400 mt-3">{label}</p>
      <p className="font-geist text-xl font-black text-slate-900 mt-0.5">{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
