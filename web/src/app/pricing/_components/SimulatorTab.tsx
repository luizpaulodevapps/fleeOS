"use client";

import React, { useMemo } from "react";
import { Calculator, Sliders, AlertTriangle, CheckCircle, BarChart3, TrendingUp, Sparkles, FolderKanban, ShieldCheck } from "lucide-react";

interface SimulatorTabProps {
  drivers: any[];
  contracts: any[];
  vehicles: any[];
  categories: any[];
  subcategories: any[];
  tables: any[];
  packages: any[];
  simDriverId: string;
  setSimDriverId: (id: string) => void;
  simStartDate: string;
  setSimStartDate: (date: string) => void;
  simEndDate: string;
  setSimEndDate: (date: string) => void;
  simResults: any | null;
  handleRunSimulation: () => void;
  handleExecuteBilling: () => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  drivers,
  contracts,
  vehicles,
  categories,
  subcategories,
  tables,
  packages,
  simDriverId,
  setSimDriverId,
  simStartDate,
  setSimStartDate,
  simEndDate,
  setSimEndDate,
  simResults,
  handleRunSimulation,
  handleExecuteBilling
}) => {

  // Dynamic operational ROI Projection Report based on Active contracts
  const roiReport = useMemo(() => {
    const activeContracts = contracts.filter(c => c.status === "active" || c.status === "Ativo");
    
    const revenueByCategory: Record<string, number> = {};
    const countByCategory: Record<string, number> = {};
    const revenueBySubcategory: Record<string, number> = {};
    const countBySubcategory: Record<string, number> = {};
    const revenueByPackage: Record<string, number> = {};
    const countByPackage: Record<string, number> = {};
    const revenueByTable: Record<string, number> = {};
    const countByTable: Record<string, number> = {};
    let totalMonthlyRevenue = 0;

    activeContracts.forEach(contract => {
      const vehicle = vehicles.find(v => v.id === contract.vehicleId);
      const catId = contract.pricingSnapshot?.category || vehicle?.pricingCategoryId || "";
      const subId = contract.pricingSnapshot?.subcategory || vehicle?.pricingSubcategoryId || "";
      const tableId = contract.pricingSnapshot?.pricingTable || contract.pricingTableId || "tbl-std";
      const pkgId = contract.pricingPackageId || "standard";
      
      const dailyRate = contract.pricingSnapshot?.dailyRate || contract.dailyRate || 150;
      const monthlyRevenue = dailyRate * 30;
      totalMonthlyRevenue += monthlyRevenue;
      
      if (catId) {
        revenueByCategory[catId] = (revenueByCategory[catId] || 0) + monthlyRevenue;
        countByCategory[catId] = (countByCategory[catId] || 0) + 1;
      }
      if (subId) {
        revenueBySubcategory[subId] = (revenueBySubcategory[subId] || 0) + monthlyRevenue;
        countBySubcategory[subId] = (countBySubcategory[subId] || 0) + 1;
      }
      if (pkgId) {
        revenueByPackage[pkgId] = (revenueByPackage[pkgId] || 0) + monthlyRevenue;
        countByPackage[pkgId] = (countByPackage[pkgId] || 0) + 1;
      }
      if (tableId) {
        revenueByTable[tableId] = (revenueByTable[tableId] || 0) + monthlyRevenue;
        countByTable[tableId] = (countByTable[tableId] || 0) + 1;
      }
    });

    return {
      activeCount: activeContracts.length,
      totalMonthlyRevenue,
      revenueByCategory,
      countByCategory,
      revenueBySubcategory,
      countBySubcategory,
      revenueByPackage,
      countByPackage,
      revenueByTable,
      countByTable
    };
  }, [contracts, vehicles]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-primary font-geist">Simulador de Diárias e Faturamento</h3>
        <p className="text-[11px] text-on-surface-variant">Simule o extrato de um motorista para um período específico e audite o cálculo de prioridade.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Config Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4 h-fit">
          <h4 className="text-xs font-black text-primary font-geist flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-outline" />
            <span>Parâmetros de Simulação</span>
          </h4>

          <div className="floating-label-group">
            <select
              value={simDriverId}
              onChange={(e) => setSimDriverId(e.target.value)}
              className="w-full pl-3 pr-3 text-xs"
            >
              <option value="">Selecione o motorista...</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <label className="text-xs font-semibold text-outline">Motorista</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="floating-label-group">
              <input
                type="date"
                value={simStartDate}
                onChange={(e) => setSimStartDate(e.target.value)}
                className="w-full pl-3 pr-3 text-xs"
              />
              <label className="text-xs font-semibold text-outline">Data Início</label>
            </div>
            <div className="floating-label-group">
              <input
                type="date"
                value={simEndDate}
                onChange={(e) => setSimEndDate(e.target.value)}
                className="w-full pl-3 pr-3 text-xs"
              />
              <label className="text-xs font-semibold text-outline">Data Término</label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 transition-all shadow-md"
          >
            <Calculator className="w-4 h-4" />
            <span>Simular Faturamento</span>
          </button>
        </div>

        {/* Results display panel */}
        <div className="lg:col-span-2 space-y-4">
          {simResults ? (
            simResults.error ? (
              <div className="p-6 text-center border border-red-200 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600 animate-bounce" />
                <span>{simResults.error}</span>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex justify-between items-start border-b pb-3 border-outline-variant">
                  <div>
                    <h4 className="text-sm font-black text-primary font-geist">{simResults.driverName}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Grupo: <strong>{simResults.categoryName}</strong> | Diária Contrato: <strong>R$ {simResults.dailyBase.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-outline font-bold uppercase">Total do Período</p>
                    <h3 className="text-xl font-extrabold text-primary font-geist mt-0.5">R$ {simResults.totalAmount.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {simResults.details.map((item: any, idx: number) => {
                    const steps = item.reason.split(" | ");
                    return (
                      <div key={idx} className="p-3 border border-outline-variant rounded-xl bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">
                            {new Date(item.date + "T12:00:00").toLocaleDateString("pt-BR")}
                            <span className="text-[10px] text-slate-500 ml-2 font-normal">({item.dayOfWeek})</span>
                          </span>
                          <span className="font-mono font-black text-red-600">-R$ {item.amount.toFixed(2)}</span>
                        </div>
                        {/* Timeline logs of pricing rules engine */}
                        <div className="space-y-1 pl-2.5 border-l border-primary/20">
                          {steps.map((step: string, sidx: number) => (
                            <p key={sidx} className="text-[9.5px] text-on-surface-variant leading-tight flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-primary shrink-0" />
                              <span>{step}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleExecuteBilling}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Processar Faturamento e Lançar no Extrato</span>
                </button>
              </div>
            )
          ) : (
            <div className="p-12 text-center border border-outline-variant rounded-2xl bg-slate-50/50 text-on-surface-variant text-xs">
              <Sliders className="w-8 h-8 text-outline mx-auto mb-3" />
              <p className="font-bold text-primary">Aguardando Parâmetros</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Selecione o motorista e as datas na barra lateral para auditar o motor de regras.</p>
            </div>
          )}
        </div>
      </div>

      {/* ROI & Operational Projections section */}
      <div className="border-t border-slate-200 pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5">
            <span>Faturamento Estimado & ROI da Frota Ativa</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-black font-mono">
              PROJEÇÃO 30 DIAS
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-outline">Receita Mensal Estimada</span>
            <h3 className="text-xl font-extrabold text-primary font-mono flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              R$ {roiReport.totalMonthlyRevenue.toFixed(2)}
            </h3>
            <span className="text-[9px] text-on-surface-variant font-medium block">
              Frota Faturando: <strong>{roiReport.activeCount} contratos ativos</strong>
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-outline">Ticket Médio Contrato</span>
            <h3 className="text-xl font-extrabold text-primary font-mono">
              R$ {roiReport.activeCount > 0 ? (roiReport.totalMonthlyRevenue / roiReport.activeCount).toFixed(2) : "0.00"}
            </h3>
            <span className="text-[9px] text-on-surface-variant font-medium block">Mensalizado por motorista</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-outline">Veículos Rentabilizados</span>
            <h3 className="text-xl font-extrabold text-primary font-mono">{roiReport.activeCount} / {vehicles.length}</h3>
            <span className="text-[9px] text-on-surface-variant font-medium block">
              Taxa de Ocupação: <strong>{vehicles.length > 0 ? ((roiReport.activeCount / vehicles.length) * 100).toFixed(0) : 0}%</strong>
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-outline">Média Diária por Ativo</span>
            <h3 className="text-xl font-extrabold text-primary font-mono">
              R$ {roiReport.activeCount > 0 ? (roiReport.totalMonthlyRevenue / (roiReport.activeCount * 30)).toFixed(2) : "0.00"}
            </h3>
            <span className="text-[9px] text-on-surface-variant font-medium block">Retorno médio diário</span>
          </div>
        </div>

        {/* Breakdown by Categorias, Subcategorias, Tabelas, Pacotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Categories & Subcategories breakdown */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 border-b pb-1.5 border-outline-variant">
              <FolderKanban className="w-4 h-4 text-outline" />
              <span>Detalhamento por Categorias & Subcategorias</span>
            </h4>
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {Object.keys(roiReport.revenueByCategory).map(catId => {
                const cat = categories.find(c => c.id === catId);
                const amt = roiReport.revenueByCategory[catId];
                const count = roiReport.countByCategory[catId];
                return (
                  <div key={catId} className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-800">{cat?.name || catId}</strong>
                      <span className="text-[10px] text-slate-500 ml-1.5">({count} ativo)</span>
                    </div>
                    <strong className="font-mono text-primary">R$ {amt.toFixed(2)}</strong>
                  </div>
                );
              })}
              {Object.keys(roiReport.revenueByCategory).length === 0 && (
                <p className="text-xs italic text-on-surface-variant">Sem dados para projetar.</p>
              )}
            </div>
          </div>

          {/* Tables & Packages breakdown */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 border-b pb-1.5 border-outline-variant">
              <ShieldCheck className="w-4 h-4 text-outline" />
              <span>Detalhamento por Tabelas & Pacotes</span>
            </h4>
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {Object.keys(roiReport.revenueByTable).map(tableId => {
                const tbl = tables.find(t => t.id === tableId);
                const amt = roiReport.revenueByTable[tableId];
                const count = roiReport.countByTable[tableId];
                return (
                  <div key={tableId} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-700 font-semibold">{tbl?.name || tableId}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">({count} contr.)</span>
                    </div>
                    <strong className="font-mono text-primary">R$ {amt.toFixed(2)}</strong>
                  </div>
                );
              })}
              {Object.keys(roiReport.revenueByTable).length === 0 && (
                <p className="text-xs italic text-on-surface-variant">Sem dados para projetar.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
