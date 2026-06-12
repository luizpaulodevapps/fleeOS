"use client";

import React, { useMemo } from "react";
import { Plus, DollarSign, Trash2 } from "lucide-react";
import { TableFormState, RateFormState } from "../_lib/types";

interface RatesTabProps {
  rates: any[];
  tables: any[];
  categories: any[];
  subcategories: any[];
  isTblModalOpen: boolean;
  setIsTblModalOpen: (open: boolean) => void;
  editingTbl: any | null;
  setEditingTbl: (tbl: any | null) => void;
  tblForm: TableFormState;
  setTblForm: React.Dispatch<React.SetStateAction<TableFormState>>;
  isRateModalOpen: boolean;
  setIsRateModalOpen: (open: boolean) => void;
  rateForm: RateFormState;
  setRateForm: React.Dispatch<React.SetStateAction<RateFormState>>;
  handleSaveTable: (e: React.FormEvent) => void;
  handleDeleteTable: (id: string) => void;
  handleSaveRate: (e: React.FormEvent) => void;
  handleDeleteRate: (id: string) => void;
}

export const RatesTab: React.FC<RatesTabProps> = ({
  rates,
  tables,
  categories,
  subcategories,
  isTblModalOpen,
  setIsTblModalOpen,
  setEditingTbl,
  tblForm,
  setTblForm,
  isRateModalOpen,
  setIsRateModalOpen,
  rateForm,
  setRateForm,
  handleSaveTable,
  handleSaveRate,
  handleDeleteRate
}) => {

  const matchSubcategories = useMemo(() => {
    return subcategories.filter(s => s.categoryId === rateForm.categoryId);
  }, [subcategories, rateForm.categoryId]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Tabelas Tarifárias & Taxas</h3>
          <p className="text-[11px] text-on-surface-variant">Configure os valores padrão diários, semanais e mensais para cada categoria ou subcategoria.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTbl(null);
              setTblForm({ name: "", description: "", active: true });
              setIsTblModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-primary font-bold rounded-lg text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tabela</span>
          </button>

          <button
            onClick={() => {
              setRateForm({
                tableId: tables[0]?.id || "",
                categoryId: categories[0]?.id || "",
                subcategoryId: "",
                billingFrequency: "daily",
                amount: 150
              });
              setIsRateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <DollarSign className="w-4 h-4" />
            <span>Definir Preço</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Tabela Tarifária</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Categoria / Classe</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Frequência</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase">Tarifa Cobrada</th>
              <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {rates.map(rate => {
              const tbl = tables.find(t => t.id === rate.tableId);
              const cat = categories.find(c => c.id === rate.categoryId);
              const sub = rate.subcategoryId ? subcategories.find(s => s.id === rate.subcategoryId) : null;
              return (
                <tr key={rate.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-primary">{tbl?.name || "Tabela Padrão"}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono font-black text-[9px] rounded mr-1">
                      {cat?.code}
                    </span>
                    <span>{cat?.name}</span>
                    {sub && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 font-mono font-black text-[9px] rounded">
                        👉 {sub.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize font-semibold text-slate-500">{rate.billingFrequency}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-primary">R$ {rate.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteRate(rate.id)}
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

      {/* Table Creation Modal */}
      {isTblModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveTable} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Cadastrar Tabela</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={tblForm.name}
                  onChange={(e) => setTblForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome da Tabela (ex: Tabela Aeroporto)</label>
              </div>
              <div className="floating-label-group">
                <textarea
                  value={tblForm.description}
                  onChange={(e) => setTblForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs py-2 min-h-[64px]"
                  required
                />
                <label className="text-xs font-semibold text-outline">Descrição / Regra Comercial</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsTblModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rate Config Modal */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveRate} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">Configurar Preço</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <select
                  value={rateForm.tableId}
                  onChange={(e) => setRateForm(prev => ({ ...prev, tableId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Selecione a Tabela</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={rateForm.categoryId}
                  onChange={(e) => setRateForm(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: "" }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Categoria de Veículos</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={rateForm.subcategoryId || ""}
                  onChange={(e) => setRateForm(prev => ({ ...prev, subcategoryId: e.target.value || undefined }))}
                  className="w-full pl-3 pr-3 text-xs"
                >
                  <option value="">Todas (Padrão da Categoria)</option>
                  {matchSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Subcategoria (Opcional)</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={rateForm.billingFrequency}
                  onChange={(e) => setRateForm(prev => ({ ...prev, billingFrequency: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
                <label className="text-xs font-semibold text-outline">Frequência da Cobrança</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="number"
                  value={rateForm.amount}
                  onChange={(e) => setRateForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  required
                />
                <label className="text-xs font-semibold text-outline">Valor Tarifado (R$)</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsRateModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Salvar Tarifa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
