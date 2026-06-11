"use client";

import { Layers } from "lucide-react";
import { formatDate } from "../../_lib/utils";
import type { AddendumFormState } from "../../_lib/types";

type Props = {
  contract: any;
  addendums: any[];
  addendumForm: AddendumFormState;
  setAddendumForm: React.Dispatch<React.SetStateAction<AddendumFormState>>;
  onAddAddendum: (e: React.FormEvent) => void;
};

export function AddendumsTab({ contract, addendums, addendumForm, setAddendumForm, onAddAddendum }: Props) {
  const cAdd = addendums.filter((a) => a.contractId === contract.id);

  return (
  <div className="space-y-5">
    {cAdd.length === 0 ? (
      <p className="italic text-on-surface-variant bg-slate-50 border border-outline-variant p-4 rounded-xl">Nenhum aditivo registrado.</p>
    ) : (
      <div className="space-y-3">
        {cAdd.slice().reverse().map((add: any) => (
          <div key={add.id} className="bg-slate-50 border border-outline-variant rounded-xl p-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-bold text-primary">{add.type}</span>
              <span className="font-mono text-[10px] text-on-surface-variant">{new Date(add.issuedAt).toLocaleString("pt-BR")}</span>
            </div>
            <p>{add.description}</p>
            <div className="flex gap-4 text-[10px] text-on-surface-variant">
              {add.newEndDate && <span>Novo vencimento: {formatDate(add.newEndDate)}</span>}
              {add.newDailyRate && <span>Nova diária: R$ {add.newDailyRate}</span>}
              <span>Token: {add.signatureToken}</span>
            </div>
          </div>
        ))}
      </div>
    )}

    {contract.status !== "Encerrado" && contract.status !== "Rescindido" && (
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-3">
        <h4 className="font-bold uppercase text-primary text-[10px] flex items-center gap-1">
          <Layers className="w-4 h-4" /> Registrar Aditivo Contratual
        </h4>
        <form onSubmit={onAddAddendum} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Tipo de Aditivo</label>
              <select value={addendumForm.type} onChange={e => setAddendumForm({...addendumForm, type: e.target.value})}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
                {["Renovação","Alteração de Valor","Extensão","Outro"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Novo Vencimento (opcional)</label>
              <input type="date" value={addendumForm.newEndDate} onChange={e => setAddendumForm({...addendumForm, newEndDate: e.target.value})}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nova Diária (R$) (opcional)</label>
              <input type="number" min={0} step={0.01} placeholder="0.00" value={addendumForm.newDailyRate}
                onChange={e => setAddendumForm({...addendumForm, newDailyRate: e.target.value})}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Token Assinatura *</label>
              <input required type="text" placeholder="Token de validação" value={addendumForm.signatureToken}
                onChange={e => setAddendumForm({...addendumForm, signatureToken: e.target.value})}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Descrição *</label>
              <textarea required rows={2} value={addendumForm.description} onChange={e => setAddendumForm({...addendumForm, description: e.target.value})}
                placeholder="Descreva as alterações contempladas neste aditivo..."
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs hover:opacity-90">
              Registrar Aditivo
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
  );
}
