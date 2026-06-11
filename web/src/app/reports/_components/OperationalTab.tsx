"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MaintenanceTypeBreakdown } from "../_lib/types";
import { Wrench, Search, ShieldCheck, ShieldAlert, HeartCrack } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OperationalTabProps {
  maintenanceBreakdown: MaintenanceTypeBreakdown;
  filteredVehicles: any[];
  vehicleSearchTerm: string;
  setVehicleSearchTerm: (val: string) => void;
  vehicleStatusFilter: string;
  setVehicleStatusFilter: (val: string) => void;
}

export function OperationalTab({
  maintenanceBreakdown,
  filteredVehicles,
  vehicleSearchTerm,
  setVehicleSearchTerm,
  vehicleStatusFilter,
  setVehicleStatusFilter
}: OperationalTabProps) {
  const { getCollection } = useAuth();
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const list = await getCollection("inventory_pending_items");
        setPendingItems(list || []);
      } catch (e) {
        console.error("Erro ao carregar itens provisórios para relatórios", e);
      }
    };
    fetchPending();
  }, [getCollection]);

  const topRequestedProvisional = useMemo(() => {
    const counts: Record<string, { description: string; count: number; qtySum: number }> = {};
    pendingItems.forEach(item => {
      const desc = item.description || "";
      const cleaned = desc.trim().toLowerCase();
      if (!cleaned) return;
      if (!counts[cleaned]) {
        counts[cleaned] = { description: item.description, count: 0, qtySum: 0 };
      }
      counts[cleaned].count += 1;
      counts[cleaned].qtySum += Number(item.qty || 1);
    });

    return Object.values(counts)
      .sort((a, b) => b.qtySum - a.qtySum)
      .slice(0, 5); // top 5
  }, [pendingItems]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const totalMaintCount = 
    maintenanceBreakdown.preventiveCount + 
    maintenanceBreakdown.correctiveCount + 
    maintenanceBreakdown.sinisterCount;

  const totalMaintCost = 
    maintenanceBreakdown.preventiveCost + 
    maintenanceBreakdown.correctiveCost + 
    maintenanceBreakdown.sinisterCost;

  const typeMetrics = [
    {
      title: "Preventivas",
      count: maintenanceBreakdown.preventiveCount,
      cost: maintenanceBreakdown.preventiveCost,
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      progressBg: "bg-emerald-500"
    },
    {
      title: "Corretivas",
      count: maintenanceBreakdown.correctiveCount,
      cost: maintenanceBreakdown.correctiveCost,
      icon: HeartCrack,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      progressBg: "bg-amber-500"
    },
    {
      title: "Sinistros (Avarias)",
      count: maintenanceBreakdown.sinisterCount,
      cost: maintenanceBreakdown.sinisterCost,
      icon: ShieldAlert,
      color: "text-red-600 bg-red-50 border-red-100",
      progressBg: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance breakdown charts/cards */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Distribuição de Manutenção da Frota</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant">Preventiva vs. corretiva para otimização de custo por KM.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {typeMetrics.map((type, idx) => {
              const Icon = type.icon;
              const pct = totalMaintCost > 0 ? (type.cost / totalMaintCost) * 100 : 0;
              return (
                <div key={idx} className="bg-slate-50 border border-outline-variant/60 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-primary">{type.title}</span>
                    <div className={`p-1.5 rounded-lg border ${type.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-black text-primary font-geist">{type.count} O.S.</span>
                      <span className="text-xs font-extrabold text-primary">{formatCurrency(type.cost)}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${type.progressBg}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Requested Provisional Parts */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Insumos Provisórios Mais Solicitados</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant">Itens não catalogados mais frequentes na oficina.</p>
          </div>

          <div className="space-y-2.5">
            {topRequestedProvisional.length === 0 ? (
              <p className="text-center italic text-outline text-[11px] py-6 font-geist">Nenhuma peça provisória registrada.</p>
            ) : (
              topRequestedProvisional.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-outline-variant/60 p-2.5 rounded-lg text-xs font-mono">
                  <div className="font-sans font-bold text-primary line-clamp-1 max-w-[160px]" title={item.description}>
                    {item.description}
                  </div>
                  <div className="flex items-center gap-1.5 font-sans font-extrabold text-[10px]">
                    <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                      {item.qtySum} un
                    </span>
                    <span className="text-on-surface-variant font-medium">({item.count} OS)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fleet table list with filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-geist font-bold text-primary uppercase tracking-wider">Detalhamento Físico da Frota</h4>
            <p className="text-[10px] text-on-surface-variant">Busca rápida e status geral de circulação e licenciamento.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-outline" />
              <input
                type="text"
                placeholder="Pesquisar placa ou modelo..."
                value={vehicleSearchTerm}
                onChange={(e) => setVehicleSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-outline-variant rounded-lg outline-none focus:border-primary text-xs w-48 font-sans"
              />
            </div>
            
            {/* Status select filter */}
            <select
              value={vehicleStatusFilter}
              onChange={(e) => setVehicleStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg outline-none focus:border-primary text-xs font-semibold text-primary font-sans"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo (Locado/Livre)</option>
              <option value="maintenance">Manutenção (Oficina)</option>
              <option value="locked">Bloqueado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 font-semibold text-outline uppercase tracking-wider">Veículo Placa</th>
                <th className="px-6 py-3 font-semibold text-outline uppercase tracking-wider">Odômetro</th>
                <th className="px-6 py-3 font-semibold text-outline uppercase tracking-wider">Combustível</th>
                <th className="px-6 py-3 font-semibold text-outline uppercase tracking-wider">Venc. Licenciamento</th>
                <th className="px-6 py-3 font-semibold text-outline uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-outline italic">Nenhum veículo encontrado com os filtros selecionados.</td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-bold text-primary">{v.brand} {v.model} ({v.plate})</td>
                    <td className="px-6 py-3.5 font-mono text-on-surface-variant">{(v.mileage || 0).toLocaleString("pt-BR")} km</td>
                    <td className="px-6 py-3.5 text-on-surface-variant">{v.fuelType}</td>
                    <td className="px-6 py-3.5 text-on-surface-variant font-mono">
                      {v.registrationExpiration ? new Date(v.registrationExpiration).toLocaleDateString("pt-BR") : "N/A"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {v.status === "active" ? "Ativo" : "Oficina"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
