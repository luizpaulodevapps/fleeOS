"use client";

import React, { useState } from "react";
import { Scale, Clock, CheckCircle2, XCircle } from "lucide-react";
import { FineAppeal, AppealType, AppealTypeLabels } from "../_lib/types";

interface CreateProps {
  fineId: string;
  onSubmit: (fineId: string, payload: { type: AppealType; grounds: string; deadline: string }) => Promise<void>;
  onClose: () => void;
}

export function AppealCreateModal({ fineId, onSubmit, onClose }: CreateProps) {
  const [type, setType] = useState<AppealType>("1st_instance");
  const [grounds, setGrounds] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!grounds.trim() || !deadline) return;
    setSaving(true);
    try {
      await onSubmit(fineId, { type, grounds, deadline });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#fcfafb] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          <h2 className="font-geist text-lg font-black">Abrir Recurso</h2>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Instância</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["1st_instance", "jari", "cetran", "judicial"] as AppealType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`h-9 rounded-xl border text-[10px] font-black transition-colors ${
                  type === t
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-purple-300"
                }`}
              >
                {AppealTypeLabels[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Prazo para Resposta</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Fundamentação</label>
          <textarea
            rows={4}
            value={grounds}
            onChange={(e) => setGrounds(e.target.value)}
            placeholder="Descreva os fundamentos do recurso..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            disabled={saving || !grounds.trim() || !deadline}
            onClick={submit}
            className="flex-1 h-10 rounded-xl bg-purple-600 text-white text-xs font-black disabled:opacity-40 hover:bg-purple-700"
          >
            {saving ? "Protocolando..." : "Protocolar Recurso"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ListProps {
  appeals: FineAppeal[];
  onResolve: (appealId: string, result: "granted" | "denied", notes: string) => Promise<void>;
}

export function AppealManager({ appeals, onResolve }: ListProps) {
  const [resolving, setResolving] = useState<string | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleResolve = async (appealId: string, result: "granted" | "denied") => {
    setSaving(true);
    try {
      await onResolve(appealId, result, resultNotes);
      setResolving(null);
      setResultNotes("");
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();

  return (
    <div className="space-y-3">
      {appeals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Scale className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-400 mt-3">Nenhum recurso registrado.</p>
        </div>
      ) : (
        appeals.map((appeal) => {
          const deadlineDate = new Date(appeal.deadline);
          const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysUntil <= 5 && appeal.status === "pending";
          const isPast = daysUntil < 0;

          return (
            <div
              key={appeal.id}
              className={`bg-white border rounded-2xl p-4 space-y-3 shadow-sm ${
                isUrgent ? "border-red-300" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-black text-slate-800">
                    {AppealTypeLabels[appeal.type]}
                  </span>
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                      appeal.status === "pending"
                        ? "bg-purple-100 text-purple-700"
                        : appeal.status === "granted"
                        ? "bg-emerald-100 text-emerald-700"
                        : appeal.status === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {appeal.status === "pending"
                      ? "Pendente"
                      : appeal.status === "granted"
                      ? "Deferido"
                      : appeal.status === "denied"
                      ? "Indeferido"
                      : "Retirado"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span
                    className={`font-bold ${
                      isUrgent ? "text-red-600" : isPast ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {isPast
                      ? `Prazo vencido há ${Math.abs(daysUntil)}d`
                      : `Prazo em ${daysUntil}d (${deadlineDate.toLocaleDateString("pt-BR")})`}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 leading-relaxed">{appeal.grounds}</p>

              {appeal.result && (
                <div className="bg-slate-50 rounded-lg p-2.5 text-[9px] text-slate-600 border border-slate-200">
                  <span className="font-bold">Resultado: </span>{appeal.result}
                </div>
              )}

              {appeal.status === "pending" && (
                <>
                  {resolving === appeal.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={resultNotes}
                        onChange={(e) => setResultNotes(e.target.value)}
                        placeholder="Resultado do julgamento..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={saving}
                          onClick={() => handleResolve(appeal.id, "granted")}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 text-white text-[10px] font-black disabled:opacity-40 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Deferido
                        </button>
                        <button
                          disabled={saving}
                          onClick={() => handleResolve(appeal.id, "denied")}
                          className="flex-1 h-9 rounded-xl bg-red-600 text-white text-[10px] font-black disabled:opacity-40 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Indeferido
                        </button>
                        <button
                          onClick={() => setResolving(null)}
                          className="h-9 px-3 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolving(appeal.id)}
                      className="w-full h-8 rounded-lg border border-purple-200 text-purple-700 text-[10px] font-black hover:bg-purple-50"
                    >
                      Registrar Resultado
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
