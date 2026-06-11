"use client";

import { Edit2, FileText } from "lucide-react";
import { STATUS_STYLES } from "../../_lib/constants";
import { formatDate } from "../../_lib/utils";
import { getDriver, getVehicle } from "../../_lib/helpers";

type Props = {
  contract: any;
  drivers: any[];
  vehicles: any[];
  can: (action: string, resource?: any) => boolean;
  onEdit: (contract: any) => void;
};

export function OverviewTab({ contract, drivers, vehicles, can, onEdit }: Props) {
  return (
  <div className="space-y-5">
    {can("contracts.edit", contract) && (
      <div className="flex justify-end">
        <button onClick={() => onEdit(contract)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-primary font-bold hover:bg-surface-container">
          <Edit2 className="w-3.5 h-3.5" /> Editar dados do contrato
        </button>
      </div>
    )}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Início", value: formatDate(contract.startDate) },
        { label: "Vencimento", value: contract.endDate ? formatDate(contract.endDate) : "Sem término" },
        { label: "Diária", value: `R$ ${contract.dailyRate}` },
        { label: "Mensal", value: `R$ ${contract.monthlyRate?.toFixed(2)}` },
      ].map((item, i) => (
        <div key={i} className="bg-slate-50 border border-outline-variant rounded-xl p-3 text-center">
          <p className="text-[9px] font-bold uppercase text-outline">{item.label}</p>
          <p className="font-bold text-primary mt-0.5">{item.value}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-2">
        <h4 className="text-[10px] font-bold uppercase text-outline">Motorista</h4>
        {(() => { const d = getDriver(drivers, contract.driverId); return (
          <div className="space-y-0.5">
            <p className="font-bold text-primary">{d?.name}</p>
            <p className="text-on-surface-variant">CPF: {d?.cpf || "—"}</p>
            <p className="text-on-surface-variant">CNH: {d?.cnhNumber || "—"} (cat. {d?.cnhCategory || "—"})</p>
            <p className="text-on-surface-variant">CONDUTAX: {d?.condutax || "—"}</p>
          </div>
        ); })()}
      </div>
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-2">
        <h4 className="text-[10px] font-bold uppercase text-outline">Veículo</h4>
        {(() => { const v = getVehicle(vehicles, contract.vehicleId); return (
          <div className="space-y-0.5">
            <p className="font-bold text-primary">{v ? `${v.brand} ${v.model}` : "—"}</p>
            <p className="text-on-surface-variant">Placa: {v?.plate || "—"}</p>
            <p className="text-on-surface-variant">Renavam: {v?.renavam || "—"}</p>
            <p className="text-on-surface-variant">Cor: {v?.color || "—"} | Ano: {v?.year || "—"}</p>
          </div>
        ); })()}
      </div>
    </div>
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 font-mono text-[10px] space-y-0.5">
      <p className="font-bold text-emerald-700 text-[11px]">✓ Assinado Digitalmente</p>
      <p className="text-slate-600">Token: {contract.signatureToken || "—"}</p>
      <p className="text-slate-600">Criado por: {contract.createdBy || "—"}</p>
      {contract.closedBy && <p className="text-red-600 font-bold">Encerrado por: {contract.closedBy}</p>}
      {contract.suspendReason && <p className="text-amber-600">Motivo suspensão: {contract.suspendReason}</p>}
    </div>
    {contract.notes && (
      <div className="bg-slate-50 border border-outline-variant rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase text-outline mb-1">Observações</p>
        <p className="text-on-surface">{contract.notes}</p>
      </div>
    )}
  </div>
  );
}
