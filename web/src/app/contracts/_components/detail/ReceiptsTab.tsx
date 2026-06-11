"use client";

import { Ban, FilePlus, Printer } from "lucide-react";
import { formatDate } from "../../_lib/utils";
import type { PaymentMethod, ReceiptFormState } from "../../_lib/types";

type Props = {
  contract: any;
  receipts: any[];
  receiptForm: ReceiptFormState;
  setReceiptForm: React.Dispatch<React.SetStateAction<ReceiptFormState>>;
  can: (action: string, resource?: any) => boolean;
  onPrintReceipt: (receipt: any) => void;
  onCancelReceipt: (receipt: any) => void;
  onAddReceipt: (e: React.FormEvent) => void;
};

export function ReceiptsTab({
  contract,
  receipts,
  receiptForm,
  setReceiptForm,
  can,
  onPrintReceipt,
  onCancelReceipt,
  onAddReceipt,
}: Props) {
  const cReceipts = receipts.filter((r) => r.contractId === contract.id);
  const issuedReceipts = cReceipts.filter((receipt) => receipt.status !== "Cancelado");
  const total = issuedReceipts.reduce((amount, receipt) => amount + Number(receipt.amount || 0), 0);

  return (
  <div className="space-y-5">
    {/* Summary */}
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-3 text-center">
        <p className="text-[9px] font-bold uppercase text-outline">Total Recibos</p>
        <p className="text-xl font-black text-primary font-mono">{issuedReceipts.length}</p>
      </div>
      <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3 text-center col-span-2">
        <p className="text-[9px] font-bold uppercase text-outline">Total Arrecadado</p>
        <p className="text-xl font-black text-emerald-700 font-mono">R$ {total.toFixed(2)}</p>
      </div>
    </div>

    {/* List */}
    <div>
      <h4 className="font-bold uppercase text-outline text-[10px] mb-2">Histórico de Recibos</h4>
      {cReceipts.length === 0 ? (
        <p className="italic text-on-surface-variant bg-slate-50 border border-outline-variant p-4 rounded-xl">Nenhum recibo emitido ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr className="text-on-surface-variant font-bold text-[10px] uppercase">
                <th className="p-2 text-left">Nº</th><th className="p-2">Data</th><th className="p-2">Tipo</th>
                <th className="p-2">Forma</th><th className="p-2">Período</th><th className="p-2 text-right">Valor</th>
                <th className="p-2 text-center">Status</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {cReceipts.slice().reverse().map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className={`p-2 font-mono font-bold ${r.status === "Cancelado" ? "text-slate-400 line-through" : "text-primary"}`}>{r.receiptNumber}</td>
                  <td className="p-2 font-mono">{formatDate(r.date)}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.paymentMethod}</td>
                  <td className="p-2">{r.period}</td>
                  <td className={`p-2 text-right font-mono font-bold ${r.status === "Cancelado" ? "text-slate-400 line-through" : "text-emerald-700"}`}>R$ {Number(r.amount).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${r.status === "Cancelado" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{r.status || "Emitido"}</span>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <button onClick={() => onPrintReceipt(r)} className="p-1 rounded border border-outline-variant text-primary hover:bg-slate-100" title="Imprimir">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {r.status !== "Cancelado" && can("contracts.edit", contract) && (
                      <button onClick={() => onCancelReceipt(r)} className="p-1 ml-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Cancelar recibo">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Form */}
    {contract.status !== "Encerrado" && contract.status !== "Rescindido" && (
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-3">
        <h4 className="font-bold uppercase text-primary text-[10px] flex items-center gap-1">
          <FilePlus className="w-4 h-4" /> Emitir Novo Recibo
        </h4>
        <form onSubmit={onAddReceipt} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nº do Recibo</label>
              <div className="w-full px-3 py-1.5 bg-slate-100 border border-outline-variant rounded text-xs font-mono text-on-surface-variant">
                REC-{new Date(`${receiptForm.date}T12:00:00`).getFullYear()}-### · automático por empresa
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Data</label>
              <input type="date" value={receiptForm.date} onChange={e => setReceiptForm(current => ({...current, date: e.target.value}))}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Valor (R$) *</label>
              <input required type="number" min={0} step={0.01} placeholder="0.00" value={receiptForm.amount}
                onChange={e => setReceiptForm(current => ({...current, amount: e.target.value}))}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Tipo</label>
              <select value={receiptForm.type} onChange={e => setReceiptForm(current => ({...current, type: e.target.value}))}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
                {["Diária","Semanal","Mensal","Avulso"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Forma Pgto</label>
              <select value={receiptForm.paymentMethod} onChange={e => setReceiptForm(current => ({...current, paymentMethod: e.target.value as PaymentMethod}))}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
                {["Dinheiro","PIX","Débito","Crédito","Cheque"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Período Ref.</label>
              <input type="text" placeholder="Ex: Jun/2026" value={receiptForm.period}
                onChange={e => setReceiptForm(current => ({...current, period: e.target.value}))}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
            </div>
            <div className="col-span-3">
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Observação</label>
              <input type="text" value={receiptForm.notes} onChange={e => setReceiptForm(current => ({...current, notes: e.target.value}))}
                placeholder="Opcional..." className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700">
              Emitir Recibo
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
  );
}
