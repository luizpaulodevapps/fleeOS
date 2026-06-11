"use client";

import { formatDate } from "../../_lib/utils";

type Props = {
  printingReceipt: any;
  driver: any;
  vehicle: any;
  onBack: () => void;
};

export function ReceiptPrintView({ printingReceipt, driver, vehicle, onBack }: Props) {
  return (
  <div className="contract-print-view bg-white min-h-screen p-8 font-sans text-slate-900">
    <div className="flex justify-between items-center mb-6 print:hidden">
      <button onClick={onBack} className="text-sm font-bold text-slate-600 hover:underline">← Voltar</button>
      <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-bold">🖨️ Imprimir</button>
    </div>
    <div className="max-w-2xl mx-auto border-2 border-slate-900 rounded-xl p-8 space-y-6">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Recibo de Pagamento</h1>
          <p className="text-sm font-mono mt-1">Nº {printingReceipt.receiptNumber}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">Data: {formatDate(printingReceipt.date)}</p>
          <p className="text-slate-600">Emitido por: {printingReceipt.issuedBy}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">Motorista</p>
          <p className="font-bold text-base mt-0.5">{driver?.name}</p>
          <p className="text-slate-600">CPF: {driver?.cpf || "—"}</p>
          <p className="text-slate-600">Condutax: {driver?.condutax || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">Veículo</p>
          <p className="font-bold text-base mt-0.5">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</p>
          <p className="text-slate-600">Placa: {vehicle?.plate || "—"}</p>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 text-center">
        <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Valor Recebido</p>
        <p className="text-4xl font-black font-mono">R$ {Number(printingReceipt.amount).toFixed(2)}</p>
        <p className="text-sm text-slate-600 mt-1">{printingReceipt.paymentMethod} — {printingReceipt.type}</p>
        <p className="text-sm text-slate-600">Período: {printingReceipt.period}</p>
      </div>
      {printingReceipt.notes && <p className="text-sm text-slate-600 italic">Obs: {printingReceipt.notes}</p>}
      <div className="border-t-2 border-dashed border-slate-400 pt-4 flex justify-between text-xs text-slate-500">
        <p>Contrato: #{printingReceipt.contractId?.substring(0, 8)}</p>
        <p>Status: {printingReceipt.status}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300">
        <div className="text-center">
          <div className="border-t border-slate-400 mt-8 pt-1 text-xs text-slate-500">Assinatura do Locador</div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-400 mt-8 pt-1 text-xs text-slate-500">Assinatura do Locatário</div>
        </div>
      </div>
    </div>
  </div>
  );
}
