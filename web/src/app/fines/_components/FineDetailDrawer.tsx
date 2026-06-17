"use client";

import React from "react";
import { X, CheckCircle2, Clock, FileText, AlertTriangle } from "lucide-react";
import {
  TrafficFine,
  FineTimelineEvent,
  FineCategoryLabels,
  FineCategoryColors,
  FineStatusLabels,
  FineStatusColors,
  ResponsiblePartyLabels,
} from "../_lib/types";

const money = (v = 0) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const dateStr = (v?: string) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "—";

const dtStr = (v?: string) =>
  v ? new Date(v).toLocaleString("pt-BR") : "—";

interface Props {
  fine: TrafficFine;
  getEffectiveAmount: (fine: TrafficFine) => number;
  onClose: () => void;
  onConfirmDriver: () => void;
  onCharge: () => void;
  onAppeal: () => void;
  onDispatcherTask: () => void;
}

export function FineDetailDrawer({
  fine,
  getEffectiveAmount,
  onClose,
  onConfirmDriver,
  onCharge,
  onAppeal,
  onDispatcherTask,
}: Props) {
  const effective = getEffectiveAmount(fine);
  const hasDiscount = effective < fine.originalAmount;
  const today = new Date().toISOString().substring(0, 10);
  const discountActive = fine.discountDeadline && fine.discountDeadline >= today;
  const daysToDiscount = fine.discountDeadline
    ? Math.ceil((new Date(fine.discountDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-950/35 flex justify-end"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside className="w-full max-w-lg h-full bg-[#fcfafb] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${FineCategoryColors[fine.fineCategory]}`}
              >
                {FineCategoryLabels[fine.fineCategory]}
              </span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${FineStatusColors[fine.status]}`}>
                {FineStatusLabels[fine.status]}
              </span>
            </div>
            <p className="font-geist text-lg font-black mt-1 text-slate-900">{fine.description}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">AIT {fine.noticeNumber} · {fine.issuingAgency} · {fine.plate}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl grid place-items-center hover:bg-slate-100 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Valores */}
          <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-[9px] font-black uppercase tracking-wide text-slate-400">Valores</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Valor Original</p>
                <p className="font-geist text-lg font-black text-slate-900">{money(fine.originalAmount)}</p>
              </div>
              {hasDiscount && (
                <div>
                  <p className="text-[9px] text-emerald-600 uppercase font-bold">Com Desconto</p>
                  <p className="font-geist text-lg font-black text-emerald-600">{money(effective)}</p>
                  {discountActive && daysToDiscount !== null && (
                    <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                      ⏱ Expira em {daysToDiscount}d ({dateStr(fine.discountDeadline)})
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px] pt-2 border-t border-slate-100">
              <div>
                <p className="text-slate-400 font-bold">Vencimento</p>
                <p className="font-bold text-slate-800">{dateStr(fine.dueDate)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Pontos CNH</p>
                <p className={`font-black ${fine.points >= 7 ? "text-red-600" : "text-slate-800"}`}>
                  {fine.points} pts
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold">Responsável</p>
                <p className="font-bold text-slate-800">{ResponsiblePartyLabels[fine.responsibleParty]}</p>
              </div>
            </div>
          </section>

          {/* Condutor */}
          <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-wide text-slate-400">Condutor</h3>
            {fine.driverName ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-black text-slate-800">{fine.driverName}</p>
                  <p className="text-[9px] text-slate-400">
                    Identificado via {fine.identificationMethod === "auto" ? "cruzamento de vínculos" : "identificação manual"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-xs font-bold">Condutor não identificado</p>
              </div>
            )}
          </section>

          {/* Ações */}
          <section className="space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-wide text-slate-400">Ações</h3>
            <div className="grid grid-cols-2 gap-2">
              {!fine.driverId && (
                <button
                  onClick={onConfirmDriver}
                  className="h-10 rounded-xl bg-blue-600 text-white text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-blue-700"
                >
                  Identificar Condutor
                </button>
              )}
              {fine.driverId && fine.status === "driver_identified" && (
                <button
                  onClick={onCharge}
                  className="h-10 rounded-xl bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-indigo-700"
                >
                  Cobrar Motorista
                </button>
              )}
              {fine.status !== "paid" && fine.status !== "archived" && fine.status !== "appeal_granted" && (
                <button
                  onClick={onAppeal}
                  className="h-10 rounded-xl border border-purple-200 text-purple-700 bg-purple-50 text-[10px] font-black hover:bg-purple-100"
                >
                  Abrir Recurso
                </button>
              )}
              {fine.fineCategory === "dtp" && !fine.dispatcherTaskId && (
                <button
                  onClick={onDispatcherTask}
                  className="h-10 rounded-xl border border-orange-200 text-orange-700 bg-orange-50 text-[10px] font-black hover:bg-orange-100"
                >
                  Enviar ao Despachante
                </button>
              )}
              {fine.noticePdf && (
                <a
                  href={fine.noticePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 rounded-xl border border-slate-200 text-slate-700 bg-white text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-slate-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ver AIT (PDF)
                </a>
              )}
            </div>
            {fine.dispatcherTaskId && (
              <p className="text-[9px] text-orange-600 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Tarefa DTP enviada ao despachante
              </p>
            )}
            {fine.arId && (
              <p className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Débito gerado — aparece no caixa do motorista
              </p>
            )}
          </section>

          {/* Timeline jurídica */}
          <section className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="text-[9px] font-black uppercase tracking-wide text-slate-400 mb-4">Timeline</h3>
            {(!fine.timeline || fine.timeline.length === 0) ? (
              <p className="text-xs text-slate-400">Nenhum evento registrado.</p>
            ) : (
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-1 bottom-0 w-px bg-slate-200" />
                {fine.timeline.map((event, i) => (
                  <TimelineItem key={i} event={event} isLast={i === fine.timeline.length - 1} />
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function TimelineItem({ event, isLast }: { event: FineTimelineEvent; isLast: boolean }) {
  const dtStr = (v?: string) =>
    v ? new Date(v).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  return (
    <div className={`relative flex gap-3 ${!isLast ? "pb-4" : ""}`}>
      <div className="absolute -left-3.5 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-900">{event.label}</p>
        {event.detail && <p className="text-[9px] text-slate-500 mt-0.5">{event.detail}</p>}
        <div className="flex gap-2 mt-0.5 text-[8px] text-slate-400">
          <span>{dtStr(event.date)}</span>
          {event.actor && <span>· {event.actor}</span>}
        </div>
      </div>
    </div>
  );
}
