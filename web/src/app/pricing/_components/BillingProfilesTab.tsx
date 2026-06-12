"use client";

import React from "react";
import { Plus, Settings, Trash2, Edit2, Calendar } from "lucide-react";
import { BillingProfileFormState } from "../_lib/types";

interface BillingProfilesTabProps {
  billingProfiles: any[];
  isBprofModalOpen: boolean;
  setIsBprofModalOpen: (open: boolean) => void;
  editingBprof: any | null;
  setEditingBprof: (bprof: any | null) => void;
  bprofForm: BillingProfileFormState;
  setBprofForm: React.Dispatch<React.SetStateAction<BillingProfileFormState>>;
  handleSaveBillingProfile: (e: React.FormEvent) => void;
  handleDeleteBillingProfile: (id: string) => void;
}

const WEEKDAYS = [
  { value: "monday", label: "Seg" },
  { value: "tuesday", label: "Ter" },
  { value: "wednesday", label: "Qua" },
  { value: "thursday", label: "Qui" },
  { value: "friday", label: "Sex" },
  { value: "saturday", label: "Sáb" },
  { value: "sunday", label: "Dom" }
];

export const BillingProfilesTab: React.FC<BillingProfilesTabProps> = ({
  billingProfiles,
  isBprofModalOpen,
  setIsBprofModalOpen,
  editingBprof,
  setEditingBprof,
  bprofForm,
  setBprofForm,
  handleSaveBillingProfile,
  handleDeleteBillingProfile
}) => {

  const toggleDay = (day: string) => {
    setBprofForm(prev => {
      const exists = prev.chargeDays.includes(day);
      if (exists) {
        return { ...prev, chargeDays: prev.chargeDays.filter(d => d !== day) };
      } else {
        return { ...prev, chargeDays: [...prev.chargeDays, day] };
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Perfis de Cobrança</h3>
          <p className="text-[11px] text-on-surface-variant">Configure regras automáticas de cobrança por dia de semana e feriados.</p>
        </div>
        <button
          onClick={() => {
            setEditingBprof(null);
            setBprofForm({
              id: "",
              name: "",
              frequency: "daily",
              chargeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
              holidayPolicy: "exempt",
              lateFeePercent: 2,
              graceDays: 1
            });
            setIsBprofModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Perfil</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {billingProfiles.map(bprof => {
          return (
            <div key={bprof.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex justify-between items-start">
              <div className="space-y-2 w-full pr-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary">{bprof.name}</h4>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-black rounded uppercase">
                    {bprof.frequency}
                  </span>
                </div>
                
                <div className="text-[11px] space-y-1 text-slate-600">
                  <div>
                    <span className="font-semibold">Dias Cobráveis:</span>
                    <div className="flex gap-1 mt-1">
                      {WEEKDAYS.map(day => {
                        const isCharged = bprof.chargeDays.includes(day.value);
                        return (
                          <span
                            key={day.value}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isCharged
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                          >
                            {day.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="pt-1">🔹 Regra Feriados: <strong className="capitalize text-slate-800">
                    {bprof.holidayPolicy === "exempt" ? "Isentar diária" : bprof.holidayPolicy === "surcharge" ? "Aplicar Sobretaxa" : "Cobrar Normalmente"}
                  </strong></p>
                  <p>🔹 Multa Atraso: <strong className="text-slate-800">{bprof.lateFeePercent}%</strong></p>
                  <p>🔹 Carência Limite: <strong className="text-slate-800">{bprof.graceDays} dia(s)</strong></p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setEditingBprof(bprof);
                    setBprofForm({
                      id: bprof.id,
                      name: bprof.name,
                      frequency: bprof.frequency,
                      chargeDays: bprof.chargeDays || [],
                      holidayPolicy: bprof.holidayPolicy || "exempt",
                      lateFeePercent: bprof.lateFeePercent || 2,
                      graceDays: bprof.graceDays || 1
                    });
                    setIsBprofModalOpen(true);
                  }}
                  className="p-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-slate-700 rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBillingProfile(bprof.id)}
                  className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isBprofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveBillingProfile} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingBprof ? "Editar Perfil" : "Novo Perfil de Cobrança"}</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={bprofForm.name}
                  onChange={(e) => setBprofForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome do Perfil (ex: Diária Táxi SP)</label>
              </div>

              {!editingBprof && (
                <div className="floating-label-group">
                  <input
                    type="text"
                    value={bprofForm.id}
                    onChange={(e) => setBprofForm(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    placeholder="ex: diaria_taxi_sp"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Identificador Único (ID)</label>
                </div>
              )}

              <div className="floating-label-group">
                <select
                  value={bprofForm.frequency}
                  onChange={(e) => setBprofForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
                <label className="text-xs font-semibold text-outline">Frequência</label>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline uppercase block">Dias da semana faturáveis</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {WEEKDAYS.map(day => {
                    const isChecked = bprofForm.chargeDays.includes(day.value);
                    return (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all border ${
                          isChecked
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="floating-label-group">
                <select
                  value={bprofForm.holidayPolicy}
                  onChange={(e) => setBprofForm(prev => ({ ...prev, holidayPolicy: e.target.value as any }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="exempt">Isentar Diária (R$ 0,00)</option>
                  <option value="ignore">Cobrar Normalmente</option>
                  <option value="surcharge">Aplicar Sobretaxa (Multiplicador do Calendário)</option>
                </select>
                <label className="text-xs font-semibold text-outline">Política em Feriados</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={bprofForm.lateFeePercent}
                    onChange={(e) => setBprofForm(prev => ({ ...prev, lateFeePercent: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Multa Atraso (%)</label>
                </div>

                <div className="floating-label-group">
                  <input
                    type="number"
                    value={bprofForm.graceDays}
                    onChange={(e) => setBprofForm(prev => ({ ...prev, graceDays: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Carência (Dias)</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsBprofModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Gravar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
