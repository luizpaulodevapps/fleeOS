"use client";

import { Check, ClipboardCheck, Fuel, Gauge, Printer } from "lucide-react";
import type { ChecklistItemForm } from "../../_lib/types";

type Props = {
  contract: any;
  checklists: any[];
  checklistType: "Entrega" | "Devolução";
  setChecklistType: (value: "Entrega" | "Devolução") => void;
  checklistMileage: string;
  setChecklistMileage: (value: string) => void;
  checklistFuel: string;
  setChecklistFuel: (value: string) => void;
  checklistItems: ChecklistItemForm[];
  setChecklistItems: React.Dispatch<React.SetStateAction<ChecklistItemForm[]>>;
  checklistObs: string;
  setChecklistObs: (value: string) => void;
  onPrintChecklist: (checklist: any) => void;
  onSubmitChecklist: (e: React.FormEvent) => void;
};

export function ChecklistTab({
  contract,
  checklists,
  checklistType,
  setChecklistType,
  checklistMileage,
  setChecklistMileage,
  checklistFuel,
  setChecklistFuel,
  checklistItems,
  setChecklistItems,
  checklistObs,
  setChecklistObs,
  onPrintChecklist,
  onSubmitChecklist,
}: Props) {
  const cChk = checklists.filter((c) => c.contractId === contract.id);

  return (
  <div className="space-y-5">
    {/* Existing checklists */}
    {cChk.length > 0 && (
      <div>
        <h4 className="font-bold uppercase text-outline text-[10px] mb-2">Vistorias Registradas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cChk.slice().reverse().map((chk: any) => {
            const okCount = (chk.items || []).filter((i: any) => i.checked).length;
            return (
              <div key={chk.id} className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${chk.type === "Entrega" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {chk.type}
                  </span>
                  <button onClick={() => onPrintChecklist(chk)} className="p-1 rounded border border-outline-variant text-primary hover:bg-slate-100" title="Imprimir">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">{new Date(chk.signedAt).toLocaleString("pt-BR")}</p>
                <div className="flex gap-4 text-[10px]">
                  <span><Gauge className="inline w-3 h-3 mr-0.5" />{chk.mileageAtEvent?.toLocaleString("pt-BR")} km</span>
                  <span><Fuel className="inline w-3 h-3 mr-0.5" />{chk.fuelLevel}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(okCount / (chk.items?.length || 1)) * 100}%` }} />
                </div>
                <p className="text-[9px] text-on-surface-variant">{okCount}/{chk.items?.length} itens OK</p>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* New checklist form */}
    {contract.status !== "Encerrado" && contract.status !== "Rescindido" && (
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-4">
        <h4 className="font-bold uppercase text-primary text-[10px] flex items-center gap-1">
          <ClipboardCheck className="w-4 h-4" /> Registrar Nova Vistoria Formal
        </h4>
        <form onSubmit={onSubmitChecklist} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Tipo</label>
              <select value={checklistType} onChange={e => setChecklistType(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
                <option value="Entrega">Entrega do Veículo</option>
                <option value="Devolução">Devolução do Veículo</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">KM no Evento</label>
              <input type="number" value={checklistMileage} onChange={e => setChecklistMileage(e.target.value)}
                placeholder="Ex: 45000" className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Combustível</label>
              <select value={checklistFuel} onChange={e => setChecklistFuel(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none">
                {["Vazio","1/4","1/2","3/4","Cheio"].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase text-outline">Itens de Vistoria</p>
            {checklistItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-outline-variant rounded p-2">
                <button type="button" onClick={() => setChecklistItems(prev => prev.map((it, j) => j === i ? {...it, checked: !it.checked} : it))}
                  className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${item.checked ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                  {item.checked ? <Check className="w-3 h-3" /> : <span className="w-3 h-3" />}
                </button>
                <span className="flex-1 text-[10px]">{item.label}</span>
                <input type="text" placeholder="Obs..." value={item.obs}
                  onChange={e => setChecklistItems(prev => prev.map((it, j) => j === i ? {...it, obs: e.target.value} : it))}
                  className="w-28 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] outline-none" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Observações Gerais</label>
            <textarea rows={2} value={checklistObs} onChange={e => setChecklistObs(e.target.value)}
              placeholder="Danos visíveis, pendências, condições gerais..."
              className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none resize-none" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
              Salvar Checklist Formal
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
  );
}
