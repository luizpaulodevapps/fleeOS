"use client";

import React from "react";
import { Plus, FileText, Trash2, Edit2 } from "lucide-react";
import { ContractTypeFormState } from "../_lib/types";

interface ContractTypesTabProps {
  contractTypes: any[];
  billingProfiles: any[];
  operationTypes: any[];
  selectedOperationFilter: string;
  isCtypeModalOpen: boolean;
  setIsCtypeModalOpen: (open: boolean) => void;
  editingCtype: any | null;
  setEditingCtype: (ctype: any | null) => void;
  ctypeForm: ContractTypeFormState;
  setCtypeForm: React.Dispatch<React.SetStateAction<ContractTypeFormState>>;
  handleSaveContractType: (e: React.FormEvent) => void;
  handleDeleteContractType: (id: string) => void;
}

export const ContractTypesTab: React.FC<ContractTypesTabProps> = ({
  contractTypes,
  billingProfiles,
  operationTypes,
  selectedOperationFilter,
  isCtypeModalOpen,
  setIsCtypeModalOpen,
  editingCtype,
  setEditingCtype,
  ctypeForm,
  setCtypeForm,
  handleSaveContractType,
  handleDeleteContractType
}) => {
  const filteredCtypes = contractTypes.filter(ct => {
    if (!selectedOperationFilter) return true;
    return ct.operationTypeId === selectedOperationFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary font-geist">Tipos de Contrato</h3>
          <p className="text-[11px] text-on-surface-variant">Configure os modelos de contrato de locação por operação.</p>
        </div>
        <button
          onClick={() => {
            setEditingCtype(null);
            setCtypeForm({
              id: "",
              name: "",
              billingProfileId: billingProfiles[0]?.id || "",
              defaultFrequency: "daily",
              allowExemptions: true,
              allowHolidayRules: true,
              operationTypeId: selectedOperationFilter || operationTypes[0]?.id || ""
            });
            setIsCtypeModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Tipo de Contrato</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCtypes.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center border border-outline-variant rounded-xl bg-slate-50/50 text-on-surface-variant text-xs italic">
            Nenhum tipo de contrato encontrado para a operação selecionada.
          </div>
        ) : (
          filteredCtypes.map(ctype => {
            const profile = billingProfiles.find(p => p.id === ctype.billingProfileId);
            const op = operationTypes.find(o => o.id === ctype.operationTypeId);
            return (
              <div key={ctype.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-primary">{ctype.name}</h4>
                    {op && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">
                        {op.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600">
                    <p>🔹 Frequência Padrão: <strong className="capitalize text-slate-800">{ctype.defaultFrequency}</strong></p>
                    <p>🔹 Perfil de Cobrança: <strong className="text-slate-800">{profile?.name || ctype.billingProfileId || "Não definido"}</strong></p>
                    <p>🔹 Isenções Comerciais: <span className={`font-semibold ${ctype.allowExemptions ? "text-emerald-600" : "text-amber-600"}`}>{ctype.allowExemptions ? "Permitido" : "Bloqueado"}</span></p>
                    <p>🔹 Regras de Feriados: <span className={`font-semibold ${ctype.allowHolidayRules ? "text-emerald-600" : "text-amber-600"}`}>{ctype.allowHolidayRules ? "Ativas" : "Ignoradas"}</span></p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCtype(ctype);
                      setCtypeForm({
                        id: ctype.id,
                        name: ctype.name,
                        billingProfileId: ctype.billingProfileId,
                        defaultFrequency: ctype.defaultFrequency,
                        allowExemptions: ctype.allowExemptions,
                        allowHolidayRules: ctype.allowHolidayRules,
                        operationTypeId: ctype.operationTypeId
                      });
                      setIsCtypeModalOpen(true);
                    }}
                    className="p-1.5 bg-white border border-outline-variant hover:bg-slate-100 text-slate-700 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteContractType(ctype.id)}
                    className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isCtypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSaveContractType} className="bg-white border border-outline-variant rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-black text-primary font-geist">{editingCtype ? "Editar Tipo de Contrato" : "Novo Tipo de Contrato"}</h3>
            <div className="space-y-3">
              <div className="floating-label-group">
                <input
                  type="text"
                  value={ctypeForm.name}
                  onChange={(e) => setCtypeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                />
                <label className="text-xs font-semibold text-outline">Nome do Tipo de Contrato (ex: Locação Táxi)</label>
              </div>

              {!editingCtype && (
                <div className="floating-label-group">
                  <input
                    type="text"
                    value={ctypeForm.id}
                    onChange={(e) => setCtypeForm(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                    className="w-full pl-3 pr-3 text-xs font-mono"
                    placeholder="ex: locacao_taxi"
                    required
                  />
                  <label className="text-xs font-semibold text-outline">Identificador Único (ID)</label>
                </div>
              )}

              <div className="floating-label-group">
                <select
                  value={ctypeForm.operationTypeId}
                  onChange={(e) => setCtypeForm(prev => ({ ...prev, operationTypeId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="">Selecione a operação...</option>
                  {operationTypes.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Tipo de Operação</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={ctypeForm.billingProfileId}
                  onChange={(e) => setCtypeForm(prev => ({ ...prev, billingProfileId: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="">Selecione o perfil...</option>
                  {billingProfiles.map(bp => <option key={bp.id} value={bp.id}>{bp.name}</option>)}
                </select>
                <label className="text-xs font-semibold text-outline">Perfil de Cobrança</label>
              </div>

              <div className="floating-label-group">
                <select
                  value={ctypeForm.defaultFrequency}
                  onChange={(e) => setCtypeForm(prev => ({ ...prev, defaultFrequency: e.target.value }))}
                  className="w-full pl-3 pr-3 text-xs"
                  required
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
                <label className="text-xs font-semibold text-outline">Frequência Padrão</label>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctypeForm.allowExemptions}
                    onChange={(e) => setCtypeForm(prev => ({ ...prev, allowExemptions: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="font-semibold text-slate-700 text-[10px]">Permitir Isenções</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctypeForm.allowHolidayRules}
                    onChange={(e) => setCtypeForm(prev => ({ ...prev, allowHolidayRules: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="font-semibold text-slate-700 text-[10px]">Regras de Feriado</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsCtypeModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">
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
