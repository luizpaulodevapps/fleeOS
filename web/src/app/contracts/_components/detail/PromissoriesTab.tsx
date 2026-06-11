"use client";

import { CreditCard } from "lucide-react";
import { formatDate } from "../../_lib/utils";
import type { PromissoryFormState, PromissoryStatus } from "../../_lib/types";

type Props = {
  contract: any;
  promissories: any[];
  promissoryForm: PromissoryFormState;
  setPromissoryForm: React.Dispatch<React.SetStateAction<PromissoryFormState>>;
  can: (action: string, resource?: any) => boolean;
  onPromissoryStatus: (promissory: any, status: PromissoryStatus) => void;
  onAddPromissory: (e: React.FormEvent) => void;
};

export function PromissoriesTab({
  contract,
  promissories,
  promissoryForm,
  setPromissoryForm,
  can,
  onPromissoryStatus,
  onAddPromissory,
}: Props) {
  const cProm = promissories.filter((p) => p.contractId === contract.id);
  const pending = cProm.filter((p) => p.status === "Pendente");

  return (
  <div className="space-y-5">
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Total", value: cProm.length, cls: "" },
        { label: "Pendentes", value: pending.length, cls: "text-amber-700" },
        { label: "Total (R$)", value: `R$ ${cProm.reduce((a,p) => a+(p.amount||0),0).toFixed(2)}`, cls: "text-primary" },
      ].map((s,i) => (
        <div key={i} className="bg-slate-50 border border-outline-variant rounded-xl p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-outline">{s.label}</p>
          <p className={`text-xl font-black font-mono ${s.cls || "text-primary"}`}>{s.value}</p>
        </div>
      ))}
    </div>

    {cProm.length === 0 ? (
      <p className="italic text-on-surface-variant bg-slate-50 border border-outline-variant p-4 rounded-xl">Nenhuma promissória registrada.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-outline-variant">
            <tr className="text-on-surface-variant font-bold text-[10px] uppercase">
              <th className="p-2 text-left">Nº</th><th className="p-2">Vencimento</th>
              <th className="p-2">Banco</th><th className="p-2">Cheque</th>
              <th className="p-2 text-right">Valor</th><th className="p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {cProm.slice().reverse().map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="p-2 font-mono font-bold">{p.promissoryNumber}</td>
                <td className="p-2 font-mono">{formatDate(p.dueDate)}</td>
                <td className="p-2">{p.bankName || "—"}</td>
                <td className="p-2 font-mono">{p.checkNumber || "—"}</td>
                <td className="p-2 text-right font-mono font-bold text-primary">R$ {Number(p.amount).toFixed(2)}</td>
                <td className="p-2 text-center">
                  {can("contracts.edit", contract) ? (
                    <select value={p.status} onChange={event => onPromissoryStatus(p, event.target.value as PromissoryStatus)}
                      className={`px-2 py-1 rounded text-[9px] font-bold border-0 outline-none ${
                        p.status === "Compensado" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "Devolvido" ? "bg-red-100 text-red-700" :
                        p.status === "Cancelado" ? "bg-slate-200 text-slate-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                      {["Pendente","Compensado","Devolvido","Cancelado"].map(status => <option key={status}>{status}</option>)}
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.status === "Compensado" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "Devolvido" ? "bg-red-100 text-red-700" :
                      p.status === "Cancelado" ? "bg-slate-200 text-slate-600" :
                      "bg-amber-100 text-amber-700"
                    }`}>{p.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {contract.status !== "Encerrado" && contract.status !== "Rescindido" && (
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-3">
        <h4 className="font-bold uppercase text-primary text-[10px] flex items-center gap-1">
          <CreditCard className="w-4 h-4" /> Registrar Promissória / Cheque
        </h4>
        <div className="bg-amber-50 border border-amber-400/25 rounded-lg p-2 text-[9px] text-amber-700 font-semibold">
          ⚡ Se status = "Pendente", um alerta será criado automaticamente no módulo de Vencimentos.
        </div>
        <form onSubmit={onAddPromissory} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nº Promissória *</label>
            <input required type="text" placeholder="Ex: PROM-001" value={promissoryForm.promissoryNumber}
              onChange={e => setPromissoryForm(current => ({...current, promissoryNumber: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Vencimento *</label>
            <input required type="date" value={promissoryForm.dueDate}
              onChange={e => setPromissoryForm(current => ({...current, dueDate: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Valor (R$) *</label>
            <input required type="number" min={0} step={0.01} placeholder="0.00" value={promissoryForm.amount}
              onChange={e => setPromissoryForm(current => ({...current, amount: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Status</label>
            <select value={promissoryForm.status} onChange={e => setPromissoryForm(current => ({...current, status: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
              {["Pendente","Compensado","Devolvido","Cancelado"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nº Cheque</label>
            <input type="text" placeholder="Ex: 000123" value={promissoryForm.checkNumber}
              onChange={e => setPromissoryForm(current => ({...current, checkNumber: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Banco</label>
            <input type="text" placeholder="Ex: Bradesco, Itaú..." value={promissoryForm.bankName}
              onChange={e => setPromissoryForm(current => ({...current, bankName: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Descrição</label>
            <input type="text" placeholder="Ex: Cheque pré-datado referente ao mês de Junho/2026" value={promissoryForm.description}
              onChange={e => setPromissoryForm(current => ({...current, description: e.target.value}))}
              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="px-5 py-2 rounded bg-amber-500 text-white font-bold text-xs hover:bg-amber-600">
              Registrar Promissória
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
  );
}
