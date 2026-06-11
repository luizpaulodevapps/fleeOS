"use client";

import { Archive } from "lucide-react";
import type { CloseFormState } from "../../_lib/types";

type Props = {
  contract: any;
  driverName: string;
  vehicleInfo: string;
  closeForm: CloseFormState;
  setCloseForm: React.Dispatch<React.SetStateAction<CloseFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function CloseContractModal({ contract, driverName, vehicleInfo, closeForm, setCloseForm, onClose, onSubmit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl p-6 shadow-2xl space-y-4">
        <h3 className="font-bold text-primary text-base flex items-center gap-2"><Archive className="w-5 h-5 text-red-500" /> Encerrar Contrato</h3>
        <p className="text-xs text-on-surface-variant">Motorista: <strong>{driverName}</strong> | Veículo: <strong>{vehicleInfo}</strong></p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1">Valor Total Pago (R$)</label>
            <input type="number" value={closeForm.amountPaid} onChange={e => setCloseForm({ ...closeForm, amountPaid: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded text-xs font-mono outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-outline mb-1">Observações</label>
            <textarea rows={2} value={closeForm.notes} onChange={e => setCloseForm({ ...closeForm, notes: e.target.value })}
              placeholder="Condições de devolução, pendências..."
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-surface-container border border-outline-variant rounded text-xs font-semibold">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded font-bold text-xs">Confirmar Encerramento</button>
          </div>
        </form>
      </div>
    </div>
  );
}
