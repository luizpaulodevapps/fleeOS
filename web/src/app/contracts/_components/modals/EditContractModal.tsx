"use client";

import { X, Edit2 } from "lucide-react";
import type { ContractStatus, ContractType, EditFormState } from "../../_lib/types";

type Props = {
  editingContract: any;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  driverName: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function EditContractModal({ editingContract, editForm, setEditForm, driverName, onClose, onSubmit }: Props) {
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
  <div className="w-full max-w-2xl bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
    <div className="p-5 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
      <div>
        <h3 className="font-bold text-primary flex items-center gap-2"><Edit2 className="w-5 h-5" /> Editar Contrato</h3>
        <p className="text-[10px] text-on-surface-variant mt-1">#{editingContract.id.substring(0, 8)} · {driverName}</p>
      </div>
      <button onClick={() => onClose()} className="p-1.5 rounded text-outline hover:text-primary"><X className="w-5 h-5" /></button>
    </div>
    <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Status</label>
          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as ContractStatus})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none">
            {["Rascunho","Ativo","Suspenso","Encerrado","Rescindido"].map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Tipo</label>
          <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as ContractType})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none">
            {["Locação","Comodato","Substituição","Temporário"].map(type => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Data de Início</label>
          <input required type="date" value={editForm.startDate} onChange={e => setEditForm({...editForm, startDate: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Data de Término</label>
          <input type="date" value={editForm.endDate} onChange={e => setEditForm({...editForm, endDate: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Diária (R$)</label>
          <input required min="0" step="0.01" type="number" value={editForm.dailyRate} onChange={e => setEditForm({...editForm, dailyRate: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-mono outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Semanal (R$)</label>
          <input required min="0" step="0.01" type="number" value={editForm.weeklyRate} onChange={e => setEditForm({...editForm, weeklyRate: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-mono outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Mensal (R$)</label>
          <input required min="0" step="0.01" type="number" value={editForm.monthlyRate} onChange={e => setEditForm({...editForm, monthlyRate: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-mono outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold uppercase text-outline mb-1">Observações</label>
          <textarea rows={3} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none resize-none" />
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-300/50 rounded-lg p-3 text-[10px] text-amber-800">
        Alterar para Encerrado ou Rescindido libera o veículo e finaliza o vínculo operacional ativo.
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => onClose()} className="px-4 py-2 border border-outline-variant rounded-lg font-semibold">Cancelar</button>
        <button type="submit" className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold">Salvar Alterações</button>
      </div>
    </form>
  </div>
</div>
  );
}
