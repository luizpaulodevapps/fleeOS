"use client";

import {
  X, Key, ShieldAlert, FileCheck, FileText,
} from "lucide-react";
import { DRIVER_LOCK_BLOCKS } from "../../_lib/constants";
import type { ContractType, NewContractFormState } from "../../_lib/types";
import { formatBillingRuleLabel } from "@/lib/billingEngine";

type Props = {
  formData: NewContractFormState;
  setFormData: React.Dispatch<React.SetStateAction<NewContractFormState>>;
  drivers: any[];
  vehicles: any[];
  templates: any[];
  profiles: any[];
  billingRules: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getDriverLocks: (id: string) => string[];
  getInterpolatedBody: (templateId: string, driverId: string, vehicleId: string, dailyRate: number) => string;
};

export function NewContractModal({
  formData,
  setFormData,
  drivers,
  vehicles,
  templates,
  profiles,
  billingRules,
  onClose,
  onSubmit,
  getDriverLocks,
  getInterpolatedBody,
}: Props) {
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
  <div className="w-full max-w-4xl bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
    <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
      <div>
        <h3 className="text-lg font-bold text-primary font-geist flex items-center gap-1.5">
          <Key className="w-5 h-5" /><span>Novo Contrato & Assinatura Digital</span>
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">Preencha, revise o modelo e assine digitalmente via token.</p>
      </div>
      <button onClick={() => onClose()} className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container">
        <X className="w-5 h-5" />
      </button>
    </div>
    <form onSubmit={onSubmit} className="flex-1 flex overflow-hidden min-h-0 text-xs">
      <div className="w-1/2 p-6 border-r border-outline-variant/65 space-y-4 overflow-y-auto">

        {formData.driverId && getDriverLocks(formData.driverId).some(l => ["Documentação","CNH Suspensa","Financeiro","Conduta"].includes(l)) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /><span>Restrições ativas. Assinatura bloqueada.</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Tipo do Contrato</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ContractType})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
            <option value="Locação">Locação Comercial (Padrão)</option>
            <option value="Comodato">Comodato Operacional</option>
            <option value="Substituição">Termo de Substituição Temporária</option>
            <option value="Temporário">Locação Temporária / Eventual</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Modelo Regulatório</label>
          <select value={formData.templateId} onChange={e => setFormData({...formData, templateId: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
            <option value="">Sem modelo</option>
            {templates.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Motorista</label>
            <select required value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
              <option value="">Selecione...</option>
              {drivers.filter(d => d.status !== "archived").map(d => {
                const locks = d.activeLocks || [];
                const blocked = locks.some((l: string) => ["Documentação","CNH Suspensa","Financeiro","Conduta"].includes(l));
                return <option key={d.id} value={d.id} disabled={blocked}>{d.name}{blocked ? " 🔒" : ""}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Veículo Livre</label>
            <select required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
              <option value="">Selecione...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Data Início</label>
            <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Vencimento</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Perfil de Diária</label>
            <select value={formData.dailyProfileId} onChange={e => {
              const p = profiles.find(p => p.id === e.target.value);
              const autoRule = billingRules.find(r => r.profileId === e.target.value && r.active !== false);
              setFormData({
                ...formData,
                dailyProfileId: e.target.value,
                dailyRate: p ? p.amount : formData.dailyRate,
                billingRuleId: autoRule ? autoRule.id : formData.billingRuleId,
              });
            }} className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
              <option value="">Personalizado</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.amount})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Taxa Diária (R$)</label>
            <input type="number" required value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: Number(e.target.value)})}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Tabela de Cobrança</label>
          <select value={formData.billingRuleId} onChange={e => setFormData({...formData, billingRuleId: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none">
            <option value="">Padrão (Seg–Sex • Isenta feriados)</option>
            {billingRules.filter(r => r.active !== false).map(r => (
              <option key={r.id} value={r.id}>{formatBillingRuleLabel(r)}</option>
            ))}
          </select>
          <p className="text-[10px] text-outline mt-1">Define em quais dias da semana o contrato é cobrado e quais feriados/facultativos isentam.</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Observações do Contrato</label>
          <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            placeholder="Condições especiais, cláusulas adicionais..."
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none resize-none" />
        </div>

        <div className="bg-slate-50 p-4 border border-outline-variant/60 rounded-xl space-y-2">
          <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1.5">
            <Key className="w-4 h-4" /><span>Token de Assinatura Digital</span>
          </p>
          <input type="text" required placeholder="Token do motorista (ex: 123456)"
            value={formData.signatureToken} onChange={e => setFormData({...formData, signatureToken: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none font-mono" />
        </div>

        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-[10px] text-primary font-semibold space-y-0.5">
          <p>📊 Diária: R$ {Number(formData.dailyRate).toFixed(2)}</p>
          <p>📊 Semanal: R$ {(Number(formData.dailyRate) * 7 * 0.9).toFixed(2)} (desc. 10%)</p>
          <p>📊 Mensal: R$ {(Number(formData.dailyRate) * 30 * 0.85).toFixed(2)} (desc. 15%)</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => onClose()}
            className="px-4 py-2 bg-surface-container text-on-surface-variant border border-outline-variant rounded-lg font-semibold">Cancelar</button>
          <button type="submit"
            className="px-6 py-2 rounded-lg font-bold text-white bg-primary hover:opacity-90">
            Validar & Assinar Contrato
          </button>
        </div>
      </div>

      <div className="w-1/2 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto">
        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3 flex items-center gap-1">
          <FileCheck className="w-4 h-4 text-emerald-600" /><span>Pré-visualização do Termo</span>
        </p>
        {formData.templateId ? (
          <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed flex-1">
            {getInterpolatedBody(formData.templateId, formData.driverId, formData.vehicleId, formData.dailyRate)}
          </div>
        ) : (
          <div className="border border-dashed border-outline/70 bg-white/50 rounded-xl p-12 text-center flex-1 flex flex-col justify-center items-center text-outline">
            <FileText className="w-10 h-10 mb-2" /><span>Selecione um modelo regulatório.</span>
          </div>
        )}
      </div>
    </form>
  </div>
</div>
  );
}
