"use client";

import React from "react";
import { OverviewMetrics } from "../_lib/types";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Car, 
  Users, 
  Wrench, 
  ShieldAlert 
} from "lucide-react";

interface OverviewTabProps {
  metrics: OverviewMetrics;
}

export function OverviewTab({ metrics }: OverviewTabProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const kpis = [
    {
      title: "Ocupação da Frota",
      value: `${metrics.utilizationRate.toFixed(0)}%`,
      subtitle: `${metrics.activeContractsCount} de ${metrics.totalVehicles} carros locados`,
      icon: Activity,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Receita Faturada",
      value: formatCurrency(metrics.totalRevenue),
      subtitle: "Valores liquidados no sistema",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Faturamento Pendente",
      value: formatCurrency(metrics.totalPending),
      subtitle: "Contratos e diárias a receber",
      icon: ClockIconPlaceholder, // Clock icon defined below
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Despesas de Oficina",
      value: formatCurrency(metrics.totalMaintCost),
      subtitle: "Gasto acumulado em manutenção",
      icon: Wrench,
      color: "text-red-600 bg-red-500/10 border-red-500/20",
    },
    {
      title: "Resultado Líquido",
      value: formatCurrency(metrics.netProfit),
      subtitle: "Receita líquida menos custos",
      icon: TrendingUp,
      color: metrics.netProfit >= 0 
        ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" 
        : "text-red-600 bg-red-500/10 border-red-500/20",
    },
    {
      title: "Sinistros Ativos",
      value: metrics.activeClaimsCount.toString(),
      subtitle: "Veículos com sinistro em aberto",
      icon: ShieldAlert,
      color: "text-red-650 bg-red-500/10 border-red-500/20",
    }
  ];

  // Max scale for financial ratios
  const maxVal = Math.max(metrics.totalRevenue, metrics.totalPending, metrics.totalMaintCost, 1000);
  const pctRevenue = (metrics.totalRevenue / maxVal) * 100;
  const pctPending = (metrics.totalPending / maxVal) * 100;
  const pctMaint = (metrics.totalMaintCost / maxVal) * 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={index} 
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{kpi.title}</span>
                <p className="text-2xl font-black text-primary font-geist tracking-tight">{kpi.value}</p>
                <p className="text-[10px] text-on-surface-variant font-semibold">{kpi.subtitle}</p>
              </div>
              <div className={`p-3.5 rounded-2xl border ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced charts/ratios summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Balance Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Comparação de Balanço</h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Visão gráfica dos fluxos de caixa e custos no período consolidado.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-outline uppercase">
                <span>Receita Liquidada (Pix/Dinheiro)</span>
                <span className="text-emerald-600">{formatCurrency(metrics.totalRevenue)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-outline-variant/30">
                <div style={{ width: `${pctRevenue}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-outline uppercase">
                <span>Contratos Pendentes / A Receber</span>
                <span className="text-amber-600">{formatCurrency(metrics.totalPending)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-outline-variant/30">
                <div style={{ width: `${pctPending}%` }} className="bg-amber-500 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-outline uppercase">
                <span>Custos Operacionais de Manutenção</span>
                <span className="text-red-650">{formatCurrency(metrics.totalMaintCost)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-outline-variant/30">
                <div style={{ width: `${pctMaint}%` }} className="bg-red-500 h-full rounded-full transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Ratios Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Métricas Gerais de Frota</h4>
            <p className="text-[10px] text-on-surface-variant">Eficiência média e dimensionamento operacional.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-slate-50 border border-outline-variant/50 p-4 rounded-xl text-center space-y-1">
              <Car className="w-5 h-5 mx-auto text-primary" />
              <p className="text-xl font-black text-primary font-geist">{(metrics.averageMileage).toFixed(0)} km</p>
              <span className="block text-[9px] font-bold uppercase text-outline">Quilometragem Média</span>
            </div>

            <div className="bg-slate-50 border border-outline-variant/50 p-4 rounded-xl text-center space-y-1">
              <Users className="w-5 h-5 mx-auto text-primary" />
              <p className="text-xl font-black text-primary font-geist">{metrics.totalDriversCount}</p>
              <span className="block text-[9px] font-bold uppercase text-outline">Motoristas Cadastrados</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-outline-variant/60 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <span className="font-semibold text-on-surface-variant">Status da Operação</span>
            </div>
            <span className="font-bold text-primary">Normal / Conforme</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIconPlaceholder(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
