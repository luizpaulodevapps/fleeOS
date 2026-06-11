"use client";

import { PauseCircle } from "lucide-react";

type Props = {
  contract: any;
  driverName: string;
  suspendReason: string;
  setSuspendReason: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function SuspendContractModal({ contract, driverName, suspendReason, setSuspendReason, onClose, onSubmit }: Props) {
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
  <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl p-6 shadow-2xl space-y-4">
    <h3 className="font-bold text-primary text-base flex items-center gap-2"><PauseCircle className="w-5 h-5 text-amber-500" /> Suspender Contrato</h3>
    <p className="text-xs text-on-surface-variant">Contrato: <strong>#{contract.id.substring(0,8)}</strong> — {driverName}</p>
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-[10px] font-bold uppercase text-outline mb-1">Motivo da Suspensão *</label>
        <textarea required rows={3} value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
          placeholder="Descreva o motivo da suspensão temporária..."
          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs outline-none resize-none" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { onClose(); }}
          className="px-4 py-2 bg-surface-container border border-outline-variant rounded text-xs font-semibold">Cancelar</button>
        <button type="submit" className="px-5 py-2 bg-amber-500 text-white rounded font-bold text-xs">Suspender</button>
      </div>
    </form>
  </div>
</div>
  );
}
