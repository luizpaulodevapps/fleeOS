"use client";

import React from "react";
import { Plus, Edit2, Trash2, Car } from "lucide-react";
import { CategoryFormState } from "../_lib/types";

interface CategoriesTabProps {
  categories: any[];
  vehicles: any[];
  isCatModalOpen: boolean;
  setIsCatModalOpen: (open: boolean) => void;
  editingCat: any | null;
  setEditingCat: (cat: any | null) => void;
  catForm: CategoryFormState;
  setCatForm: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  handleSaveCategory: (e: React.FormEvent) => void;
  handleDeleteCategory: (id: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  vehicles,
  isCatModalOpen,
  setIsCatModalOpen,
  editingCat,
  setEditingCat,
  catForm,
  setCatForm,
  handleSaveCategory,
  handleDeleteCategory
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Categorias de Veículos</h3>
          <p className="text-[11px] text-on-surface-variant">Configure os grupos tarifários para agrupar modelos e apurar custos.</p>
        </div>
        <button
          onClick={() => {
            setEditingCat(null);
            setCatForm({ code: "", name: "", description: "" });
            setIsCatModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm space-y-4">
          {categories.map(cat => {
            const associatedVehicles = vehicles.filter(v => v.pricingCategoryId === cat.id);
            return (
              <div key={cat.id} className="p-4 border border-outline-variant rounded-xl bg-slate-50/50 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono font-black text-[10px] rounded">
                      {cat.code}
                    </span>
                    <h4 className="text-xs font-bold text-primary">{cat.name}</h4>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{cat.description}</p>
                  <span className="inline-block text-[10px] text-outline font-semibold">
                    {associatedVehicles.length} veículo(s) mapeado(s)
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCat(cat);
                      setCatForm({ code: cat.code, name: cat.name, description: cat.description });
                      setIsCatModalOpen(true);
                    }}
                    className="p-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-slate-700 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual breakdown card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Car className="w-4 h-4 text-outline" />
            <span>Distribuição da Frota por Categoria</span>
          </h4>
          <div className="space-y-3">
            {categories.map(cat => {
              const matchCount = vehicles.filter(v => v.pricingCategoryId === cat.id).length;
              const percent = vehicles.length > 0 ? (matchCount / vehicles.length) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">{cat.name}</span>
                    <span className="text-slate-900 font-mono">{matchCount} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveCategory} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingCat ? "Editar Categoria" : "Nova Categoria"}</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={catForm.code}
                  onChange={(e) => setCatForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs uppercase"
                  required
                />
                <label className="text-xs font-semibold text-outline">Código (ex: CAT-A)</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome da Categoria</label>
              </div>
              <div className="floating-label-group">
                <textarea
                  value={catForm.description}
                  onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs py-2 min-h-[64px]"
                  required
                />
                <label className="text-xs font-semibold text-outline">Descrição</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
