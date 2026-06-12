"use client";

import React from "react";
import { Plus, Edit2, Trash2, Car, Settings } from "lucide-react";
import { CategoryFormState, SubcategoryFormState } from "../_lib/types";

interface CategoriesTabProps {
  categories: any[];
  subcategories: any[];
  vehicles: any[];
  operationTypes: any[];
  selectedOperationFilter: string;
  isCatModalOpen: boolean;
  setIsCatModalOpen: (open: boolean) => void;
  editingCat: any | null;
  setEditingCat: (cat: any | null) => void;
  catForm: CategoryFormState;
  setCatForm: React.Dispatch<React.SetStateAction<CategoryFormState>>;
  handleSaveCategory: (e: React.FormEvent) => void;
  handleDeleteCategory: (id: string) => void;

  isSubModalOpen: boolean;
  setIsSubModalOpen: (open: boolean) => void;
  editingSub: any | null;
  setEditingSub: (sub: any | null) => void;
  subForm: SubcategoryFormState;
  setSubForm: React.Dispatch<React.SetStateAction<SubcategoryFormState>>;
  handleSaveSubcategory: (e: React.FormEvent) => void;
  handleDeleteSubcategory: (id: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  subcategories,
  vehicles,
  operationTypes,
  selectedOperationFilter,
  isCatModalOpen,
  setIsCatModalOpen,
  editingCat,
  setEditingCat,
  catForm,
  setCatForm,
  handleSaveCategory,
  handleDeleteCategory,

  isSubModalOpen,
  setIsSubModalOpen,
  editingSub,
  setEditingSub,
  subForm,
  setSubForm,
  handleSaveSubcategory,
  handleDeleteSubcategory
}) => {
  
  const filteredCategories = categories.filter(cat => {
    if (!selectedOperationFilter) return true;
    return cat.operationTypeId === selectedOperationFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Categorias e Subcategorias</h3>
          <p className="text-[11px] text-on-surface-variant">Configure os grupos de tarifas e suas subcategorias/classes específicas.</p>
        </div>
        <button
          onClick={() => {
            setEditingCat(null);
            setCatForm({ code: "", name: "", description: "", operationTypeId: selectedOperationFilter || operationTypes[0]?.id || "" });
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
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-xs italic">
              Nenhuma categoria encontrada para o filtro de operação atual.
            </div>
          ) : (
            filteredCategories.map(cat => {
              const associatedVehicles = vehicles.filter(v => v.pricingCategoryId === cat.id);
              const matchSubs = subcategories.filter(sub => sub.categoryId === cat.id);
              const op = operationTypes.find(o => o.id === cat.operationTypeId);

              return (
                <div key={cat.id} className="p-4 border border-outline-variant rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono font-black text-[10px] rounded">
                          {cat.code}
                        </span>
                        <h4 className="text-xs font-bold text-primary">{cat.name}</h4>
                        {op && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[8px] rounded uppercase font-bold">
                            {op.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{cat.description}</p>
                      <span className="inline-block text-[10px] text-outline font-semibold">
                        {associatedVehicles.length} veículo(s) mapeado(s)
                      </span>
                    </div>
                    
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setCatForm({ code: cat.code, name: cat.name, description: cat.description, operationTypeId: cat.operationTypeId || "" });
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

                  {/* Subcategories Subsection */}
                  <div className="mt-3 pl-4 border-l-2 border-primary/20 space-y-2 bg-white/50 p-2 rounded-r-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-outline">Subcategorias</span>
                      <button
                        onClick={() => {
                          setEditingSub(null);
                          setSubForm({ categoryId: cat.id, code: `${cat.code}.1`, name: "", description: "", amountOverride: undefined });
                          setIsSubModalOpen(true);
                        }}
                        className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Sub
                      </button>
                    </div>
                    {matchSubs.length === 0 ? (
                      <p className="text-[10px] text-on-surface-variant italic">Nenhuma subcategoria cadastrada.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {matchSubs.map(sub => {
                          const subVehicles = vehicles.filter(v => v.pricingSubcategoryId === sub.id);
                          return (
                            <div key={sub.id} className="flex justify-between items-center text-[11px] bg-white border border-outline-variant p-2 rounded-lg shadow-sm">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono text-[9px] rounded font-bold">
                                    {sub.code}
                                  </span>
                                  <span className="font-semibold text-slate-800">{sub.name}</span>
                                  {sub.amountOverride !== undefined && sub.amountOverride !== null ? (
                                    <span className="text-emerald-600 font-mono font-bold text-[9px]">
                                      (R$ {Number(sub.amountOverride).toFixed(2)})
                                    </span>
                                  ) : (
                                    <span className="text-on-surface-variant text-[9px] italic">
                                      (Herdado)
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-on-surface-variant mt-0.5">{sub.description}</p>
                                <span className="text-[8px] text-outline font-medium block">
                                  {subVehicles.length} veículo(s) associado(s)
                                </span>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingSub(sub);
                                    setSubForm({
                                      categoryId: sub.categoryId,
                                      code: sub.code,
                                      name: sub.name,
                                      description: sub.description,
                                      amountOverride: sub.amountOverride
                                    });
                                    setIsSubModalOpen(true);
                                  }}
                                  className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  className="p-1 hover:bg-red-50 text-red-600 rounded"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Visual breakdown card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Car className="w-4 h-4 text-outline" />
            <span>Distribuição da Frota por Categoria</span>
          </h4>
          <div className="space-y-3">
            {filteredCategories.map(cat => {
              const matchCount = vehicles.filter(v => v.pricingCategoryId === cat.id).length;
              const percent = vehicles.length > 0 ? (matchCount / vehicles.length) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 font-bold">{cat.name}</span>
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

      {/* Category Create Modal */}
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
                <select
                  value={catForm.operationTypeId || ""}
                  onChange={(e) => setCatForm(prev => ({ ...prev, operationTypeId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="">Selecione a operação...</option>
                  {operationTypes.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Tipo de Operação</label>
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

      {/* Subcategory Create Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveSubcategory} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingSub ? "Editar Subcategoria" : "Nova Subcategoria"}</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={subForm.code}
                  onChange={(e) => setSubForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs uppercase"
                  required
                />
                <label className="text-xs font-semibold text-outline">Código (ex: CAT-A.1)</label>
              </div>
              
              <div className="floating-label-group">
                <input
                  type="text"
                  value={subForm.name}
                  onChange={(e) => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome do Modelo/Versão</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="number"
                  value={subForm.amountOverride === undefined ? "" : subForm.amountOverride}
                  onChange={(e) => setSubForm(prev => ({ ...prev, amountOverride: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full pl-3 pr-3 text-xs font-mono"
                  placeholder="ex: 180"
                />
                <label className="text-xs font-semibold text-outline">Tarifa Especial R$ (Opcional)</label>
              </div>

              <div className="floating-label-group">
                <textarea
                  value={subForm.description}
                  onChange={(e) => setSubForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs py-2 min-h-[64px]"
                  required
                />
                <label className="text-xs font-semibold text-outline">Especificações / Detalhes</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsSubModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg text-xs">
                Salvar Subcategoria
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
