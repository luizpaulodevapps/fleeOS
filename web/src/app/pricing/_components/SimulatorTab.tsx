"use client";

import React from "react";
import { Calculator, Sliders, AlertTriangle, CheckCircle } from "lucide-react";

interface SimulatorTabProps {
  drivers: any[];
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
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-primary font-geist">Simulador de Diárias e Faturamento</h3>
        <p className="text-[11px] text-on-surface-variant">Simule o extrato de um motorista para um período específico e execute os lançamentos em lote.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simulation Config Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-black text-primary font-geist">Períão de Simulação</h4>

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
        <div className="md:col-span-2 space-y-4">
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
                      Categoria de Ativo: <strong>{simResults.categoryName}</strong> | Diária Base: <strong>R$ {simResults.dailyBase.toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-outline font-bold uppercase">Total do Período</p>
                    <h3 className="text-xl font-extrabold text-primary font-geist mt-0.5">R$ {simResults.totalAmount.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="space-y-3 h-44 overflow-y-auto">
                  {simResults.details.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-700">{new Date(item.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                        <span className="text-[10px] text-slate-500 ml-2">({item.dayOfWeek})</span>
                        <p className="text-[10px] text-outline mt-0.5">{item.reason}</p>
                      </div>
                      <span className="font-mono font-black text-red-600">-R$ {item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleExecuteBilling}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Processar em Lote e Gravar no Extrato</span>
                </button>
              </div>
            )
          ) : (
            <div className="p-12 text-center border border-outline-variant rounded-2xl bg-slate-50/50 text-on-surface-variant text-xs">
              <Sliders className="w-8 h-8 text-outline mx-auto mb-3" />
              <p className="font-bold text-primary">Aguardando Parâmetros</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Selecione o motorista e as datas na barra lateral para projetar ou faturar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
