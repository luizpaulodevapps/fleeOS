"use client";

type Props = {
  printingChecklist: any;
  driver: any;
  vehicle: any;
  onBack: () => void;
};

export function ChecklistPrintView({ printingChecklist, driver, vehicle, onBack }: Props) {
  return (
  <div className="contract-print-view bg-white min-h-screen p-8 font-sans text-slate-900">
    <div className="flex justify-between items-center mb-6 print:hidden">
      <button onClick={() => onBack()} className="text-sm font-bold text-slate-600 hover:underline">← Voltar</button>
      <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-bold">🖨️ Imprimir</button>
    </div>
    <div className="max-w-2xl mx-auto border-2 border-slate-900 rounded-xl p-8 space-y-5">
      <div className="border-b-2 border-slate-900 pb-4">
        <h1 className="text-xl font-black uppercase tracking-widest">Termo de Vistoria — {printingChecklist.type}</h1>
        <p className="text-xs font-mono mt-1">Gerado em: {new Date(printingChecklist.signedAt).toLocaleString("pt-BR")}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Motorista</p>
          <p className="font-bold">{driver?.name}</p><p className="text-slate-600">CPF: {driver?.cpf}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Veículo</p>
          <p className="font-bold">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "—"}</p>
          <p className="text-slate-600">Placa: {vehicle?.plate}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">KM no Evento</p>
          <p className="font-bold font-mono">{printingChecklist.mileageAtEvent?.toLocaleString("pt-BR")} km</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Nível Combustível</p>
          <p className="font-bold">{printingChecklist.fuelLevel}</p>
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
            <th className="p-2 text-left border border-slate-300">Item Verificado</th>
            <th className="p-2 border border-slate-300 w-16 text-center">OK</th>
            <th className="p-2 border border-slate-300 text-left">Observação</th>
          </tr>
        </thead>
        <tbody>
          {(printingChecklist.items || []).map((item: any, i: number) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="p-2 border border-slate-300">{item.label}</td>
              <td className="p-2 border border-slate-300 text-center font-bold">{item.checked ? "✓" : "✗"}</td>
              <td className="p-2 border border-slate-300 text-xs text-slate-600">{item.observation || item.obs || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {printingChecklist.observations && <p className="text-sm text-slate-700 italic">Observações Gerais: {printingChecklist.observations}</p>}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300">
        <div className="text-center">
          <div className="border-t border-slate-400 mt-10 pt-1 text-xs text-slate-500">Assinatura do Operador</div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-400 mt-10 pt-1 text-xs text-slate-500">Assinatura do Motorista</div>
        </div>
      </div>
    </div>
  </div>
  );
}
