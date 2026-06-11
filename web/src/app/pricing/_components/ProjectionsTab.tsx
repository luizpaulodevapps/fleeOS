"use client";

import React from "react";

interface ProjectionsTabProps {
  categories: any[];
  projCategory: string;
  setProjCategory: (cat: string) => void;
  projRate: number;
  setProjRate: (rate: number) => void;
  projOccupancy: number;
  setProjOccupancy: (occ: number) => void;
  projectionResults: {
    totalVehicles: number;
    monthlyPotential: number;
    monthlyExpected: number;
    annualExpected: number;
  };
}

export const ProjectionsTab: React.FC<ProjectionsTabProps> = ({
  categories,
  projCategory,
  setProjCategory,
  projRate,
  setProjRate,
  projOccupancy,
  setProjOccupancy,
  projectionResults
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-primary font-geist">Módulo de Projeção de Receita</h3>
        <p className="text-[11px] text-on-surface-variant">Calcule o potencial de ROI e faturamento de ativos por categoria em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Config Card */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-black text-primary font-geist">Simulação de Cenários</h4>
          
          <div className="floating-label-group">
            <select
              value={projCategory}
              onChange={(e) => setProjCategory(e.target.value)}
              className="w-full pl-3 pr-3 text-xs"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="text-xs font-semibold text-outline">Categoria do Veículo</label>
          </div>

          <div className="floating-label-group">
            <input
              type="number"
              value={projRate}
              onChange={(e) => setProjRate(Number(e.target.value))}
              className="w-full pl-3 pr-3 text-xs font-mono"
            />
            <label className="text-xs font-semibold text-outline">Diária Média Simulada (R$)</label>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Taxa de Ocupação da Frota:</span>
              <span className="font-bold text-primary">{projOccupancy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={projOccupancy}
              onChange={(e) => setProjOccupancy(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Calculations Display Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Veículos nesta Categoria</p>
              <h3 className="text-3xl font-extrabold text-primary font-geist mt-1">{projectionResults.totalVehicles} ativos</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Contagem em tempo real de carros associados ao grupo tarifário selecionado na frota FleetOS.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Receita Mensal Esperada</p>
              <h3 className="text-3xl font-extrabold text-primary font-geist mt-1">
                R$ {projectionResults.monthlyExpected.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] text-outline font-medium">Potencial 100% ocupado: R$ {projectionResults.monthlyPotential.toLocaleString("pt-BR")}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Faturamento projetado considerando a taxa de ocupação de {projOccupancy}%. Receita anual esperada: <strong>R$ {projectionResults.annualExpected.toLocaleString("pt-BR")}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
