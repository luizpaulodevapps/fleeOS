import React from "react";
import { Printer, ShieldAlert } from "lucide-react";
import { Driver, LedgerEntry, Occurrence, Attachment } from "../_lib/types";

interface DossierViewProps {
  driver: Driver;
  ledger: LedgerEntry[];
  occurrences: Occurrence[];
  assignments: any[];
  attachments: Attachment[];
  timeline: any[];
  vehicles: any[];
  balance: number;
  onClose: () => void;
}

export function DossierView({
  driver,
  ledger,
  occurrences,
  assignments,
  attachments,
  timeline,
  vehicles,
  balance,
  onClose
}: DossierViewProps) {
  const drvLed = ledger.filter(l => l.driverId === driver.id);
  const drvOcc = occurrences.filter(o => o.driverId === driver.id);
  const drvTimeline = timeline.filter(t => t.entityType === "driver" && t.entityId === driver.id);

  return (
    <div className="bg-white text-slate-900 p-8 min-h-screen font-sans">
      {/* Floating print actions */}
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-200 mb-8 print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-slate-700" />
          <span className="font-bold text-sm text-slate-700">Dossiê Técnico Consolidado do Motorista</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            Imprimir PDF
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-350"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Print Dossier Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b-2 border-slate-950 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight uppercase">Dossiê Operacional do Motorista</h1>
            <p className="text-xs text-slate-500 font-mono">
              ID: {driver.id} • Emissão: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block text-xs font-bold border-2 border-slate-900 px-3 py-1 uppercase rounded bg-slate-50">
              Status: {driver.status === "active" ? "Ativo" : driver.status === "blocked" ? "Bloqueado" : driver.status}
            </span>
          </div>
        </div>

        {/* Profile & General Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <img
              src={driver.photoUrl}
              alt={driver.name}
              className="w-full aspect-square object-cover rounded-lg border-2 border-slate-900"
            />
          </div>
          <div className="md:col-span-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">Nome Completo</p>
              <p className="font-bold text-base text-slate-900">{driver.name}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">CPF</p>
              <p className="font-mono font-bold text-slate-900">{driver.cpf}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">RG</p>
              <p className="font-mono text-slate-900">{driver.rg || "N/A"}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">Telefone</p>
              <p className="text-slate-900">{driver.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="font-bold text-slate-500 uppercase text-[9px]">Endereço</p>
              <p className="text-slate-900">{driver.address}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">Contato de Emergência</p>
              <p className="text-slate-900">{driver.emergencyContact}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">Data Admissão</p>
              <p className="text-slate-900">
                {driver.admissionDate ? new Date(driver.admissionDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-700">
            Documentação
          </h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border">
              <p className="font-bold text-[9px] text-slate-500 uppercase">CNH (Habilitação)</p>
              <p className="font-bold font-mono">
                Nº {driver.cnhNumber} - Cat {driver.cnhCategory || "AB"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Validade: {driver.cnhExpiration ? new Date(driver.cnhExpiration).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-[10px] text-slate-500">Pontuação: {driver.cnhPoints || 0} pts</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border">
              <p className="font-bold text-[9px] text-slate-500 uppercase">CONDUTAX</p>
              <p className="font-bold font-mono">{driver.condutax || "N/A"}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Validade: {driver.condutaxExpiration ? new Date(driver.condutaxExpiration).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Active Locks */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-700">
            Bloqueios & Trava Reguladora
          </h2>
          {driver.activeLocks && driver.activeLocks.length > 0 ? (
            <div className="bg-red-550/5 p-3 rounded border border-red-200 text-xs space-y-2">
              <p className="font-bold text-red-700 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                <span>BLOQUEIOS OPERACIONAIS ATIVOS: {driver.activeLocks.join(", ")}</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-600 font-mono text-[10px]">
                {Object.entries(driver.lockJustification || {}).map(([lock, just]: any) => (
                  <li key={lock}>
                    <strong>{lock}</strong>: {just}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 border border-emerald-100 rounded">
              ✓ Regularizado: Nenhuma restrição ou pendência regulatória registrada no dossiê.
            </p>
          )}
        </div>

        {/* Ledger/Current Account Extract */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Conta Corrente</h2>
            <span className={`text-xs font-bold ${balance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              Saldo Consolidado: R$ {balance.toFixed(2)}
            </span>
          </div>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
                <th className="p-2">Data Lançamento</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Descrição</th>
                <th className="p-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {drvLed.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center italic text-slate-400">
                    Nenhuma movimentação financeira registrada.
                  </td>
                </tr>
              ) : (
                drvLed.map((led: any) => (
                  <tr key={led.id}>
                    <td className="p-2 font-mono">{new Date(led.createdAt).toLocaleString()}</td>
                    <td className="p-2 uppercase font-semibold text-[10px]">{led.type}</td>
                    <td className="p-2">{led.description}</td>
                    <td
                      className={`p-2 text-right font-bold font-mono ${
                        led.amount >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      R$ {led.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Disciplinary Occurrences */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-700">
            Histórico Disciplinar e Ocorrências
          </h2>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
                <th className="p-2">Data</th>
                <th className="p-2">Classificação</th>
                <th className="p-2">Descrição Detalhada</th>
                <th className="p-2">Auditado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {drvOcc.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center italic text-slate-400">
                    Nenhuma ocorrência registrada.
                  </td>
                </tr>
              ) : (
                drvOcc.map((occ: any) => (
                  <tr key={occ.id}>
                    <td className="p-2 font-mono">{new Date(occ.date).toLocaleDateString()}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          occ.type === "Elogio" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {occ.type}
                      </span>
                    </td>
                    <td className="p-2">{occ.description}</td>
                    <td className="p-2 font-semibold">{occ.reportedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Timeline audit log */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 text-slate-700">
            Histórico de Atividades e Auditoria
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {drvTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhuma atividade registrada.</p>
            ) : (
              drvTimeline.map((t: any) => (
                <div key={t.id} className="text-[10px] font-mono border-l-2 border-slate-900 pl-3 py-1">
                  <p className="font-bold text-slate-800">
                    {new Date(t.createdAt).toLocaleString()} - {t.title}
                  </p>
                  <p className="text-slate-600">
                    {t.description} (Por: {t.createdBy})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
