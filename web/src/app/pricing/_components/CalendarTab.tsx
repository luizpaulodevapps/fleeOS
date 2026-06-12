"use client";

import React from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { CalendarFormState } from "../_lib/types";

interface CalendarTabProps {
  calendar: any[];
  tables: any[];
  isCalModalOpen: boolean;
  setIsCalModalOpen: (open: boolean) => void;
  editingCal: any | null;
  setEditingCal: (cal: any | null) => void;
  calForm: CalendarFormState;
  setCalForm: React.Dispatch<React.SetStateAction<CalendarFormState>>;
  handleSaveCal: (e: React.FormEvent) => void;
  handleFetchHolidays: () => void;
  handleDeleteCal: (id: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  calendar,
  tables,
  isCalModalOpen,
  setIsCalModalOpen,
  setEditingCal,
  calForm,
  setCalForm,
  handleSaveCal,
  handleFetchHolidays,
  handleDeleteCal
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Calendário Tarifário & Regras Especiais</h3>
          <p className="text-[11px] text-on-surface-variant">Configure feriados, eventos e promoções sazonais que alteram o preço das diárias.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFetchHolidays}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-primary font-bold rounded-lg text-xs transition-all shadow-sm animate-pulse"
          >
            <Calendar className="w-4 h-4" />
            <span>Brasil API (Feriados Nacionais)</span>
          </button>

          <button
            onClick={() => {
              setEditingCal(null);
              setCalForm({
                date: new Date().toISOString().split("T")[0],
                pricingTableId: "",
                description: "",
                type: "holiday",
                priority: 3,
                action: "exempt",
                value: 0
              });
              setIsCalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Data Especial Manual</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Data</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Descrição</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Tipo</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Prioridade</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Ação da Regra</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Ajuste</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {calendar.slice().sort((a,b) => b.priority - a.priority || a.date.localeCompare(b.date)).map(c => {
              return (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    {new Date(c.date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{c.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 font-black text-[9px] uppercase rounded ${
                      c.type === "holiday" ? "bg-red-100 text-red-700" : c.type === "promo" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                    }`}>{c.type === "holiday" ? "Feriado" : c.type === "promo" ? "Promoção" : "Evento"}</span>
                  </td>
                  <td className="px-6 py-4 font-bold font-mono text-slate-600">Lvl {c.priority}</td>
                  <td className="px-6 py-4 font-semibold capitalize text-slate-600">
                    {c.action === "exempt" ? "Isentar" : c.action === "surcharge" ? "Sobretaxa" : "Desconto"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-primary">
                    {c.action === "exempt" ? "R$ 0.00" : c.action === "surcharge" ? `+${((c.value - 1) * 100).toFixed(0)}%` : `-${((1 - c.value) * 100).toFixed(0)}%`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteCal(c.id)}
                      className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calendar Special Date Modal */}
      {isCalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveCal} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Configurar Regra de Calendário</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="date"
                  value={calForm.date}
                  onChange={(e) => setCalForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Data</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="text"
                  value={calForm.description}
                  onChange={(e) => setCalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Descrição (ex: Aniversário da Cidade)</label>
              </div>
              
              <div className="floating-label-group">
                <select
                  value={calForm.type}
                  onChange={(e) => setCalForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="holiday">Feriado Oficial</option>
                  <option value="event">Evento Especial / Show</option>
                  <option value="promo">Campanha / Promoção Sazonal</option>
                </select>
                <label className="text-xs font-semibold text-outline">Tipo de Regra</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={calForm.action}
                  onChange={(e) => setCalForm(prev => ({ ...prev, action: e.target.value, value: e.target.value === "exempt" ? 0 : e.target.value === "surcharge" ? 1.25 : 0.90 }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="exempt">Isentar Diária (R$ 0,00)</option>
                  <option value="surcharge">Aplicar Sobretaxa (Aumento)</option>
                  <option value="discount">Aplicar Desconto (Redução)</option>
                </select>
                <label className="text-xs font-semibold text-outline">Ação Tarifária</label>
              </div>

              {calForm.action !== "exempt" && (
                <div className="floating-label-group">
                  <input
                    type="number"
                    value={calForm.value}
                    onChange={(e) => setCalForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    step="0.01"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">
                    {calForm.action === "surcharge" ? "Multiplicador (ex: 1.25 para +25%)" : "Multiplicador (ex: 0.90 para -10%)"}
                  </label>
                </div>
              )}

              <div className="floating-label-group">
                <input
                  type="number"
                  value={calForm.priority}
                  onChange={(e) => setCalForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Prioridade da Regra (1-5, maior = ganha)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={calForm.pricingTableId}
                  onChange={(e) => setCalForm(prev => ({ ...prev, pricingTableId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                >
                  <option value="">Aplica em todas as tabelas</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Vincular a Tabela Específica</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCalModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Gravar Regra
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
