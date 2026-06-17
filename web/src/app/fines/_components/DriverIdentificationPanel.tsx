"use client";

import React, { useState } from "react";
import { UserCheck, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TrafficFine } from "../_lib/types";

interface Props {
  fine: TrafficFine;
  suggestion: { driver: any; confidence: "high" | "medium" | "low" } | null;
  allDrivers: any[];
  onConfirm: (driverId: string, driverName: string, method: "auto" | "manual") => Promise<void>;
  onClose: () => void;
}

export function DriverIdentificationPanel({ fine, suggestion, allDrivers, onConfirm, onClose }: Props) {
  const [saving, setSaving] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualDriver, setManualDriver] = useState<any | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">(suggestion ? "auto" : "manual");

  const filteredDrivers = allDrivers.filter((d) => {
    const q = manualQuery.toLowerCase();
    return (
      q.length >= 2 &&
      (d.name?.toLowerCase().includes(q) || d.cpf?.includes(q))
    );
  }).slice(0, 6);

  const handleConfirm = async (driverId: string, driverName: string, method: "auto" | "manual") => {
    setSaving(true);
    try {
      await onConfirm(driverId, driverName, method);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const confidenceLabel = {
    high: { label: "Alta confiança", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    medium: { label: "Média confiança", color: "text-amber-600 bg-amber-50 border-amber-200" },
    low: { label: "Baixa confiança", color: "text-red-600 bg-red-50 border-red-200" },
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#fcfafb] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <h2 className="font-geist text-lg font-black">Identificação do Condutor</h2>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] space-y-1">
          <p className="font-bold text-slate-700">{fine.description}</p>
          <p className="text-slate-500">
            🚘 {fine.plate} · Ocorrência: {new Date(fine.occurrenceDate).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {suggestion && (
            <button
              onClick={() => setMode("auto")}
              className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-colors ${
                mode === "auto" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
              }`}
            >
              Sugestão Automática
            </button>
          )}
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-colors ${
              mode === "manual" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Busca Manual
          </button>
        </div>

        {mode === "auto" && suggestion && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-black text-slate-900">{suggestion.driver.name}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  CPF: {suggestion.driver.cpf || "Não informado"}
                </p>
                <span
                  className={`mt-1.5 inline-block text-[8px] font-black px-1.5 py-0.5 rounded border ${
                    confidenceLabel[suggestion.confidence].color
                  }`}
                >
                  {confidenceLabel[suggestion.confidence].label} — vinculado ao veículo na data da infração
                </span>
              </div>
            </div>
            <button
              disabled={saving}
              onClick={() => handleConfirm(suggestion.driver.id, suggestion.driver.name, "auto")}
              className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-black disabled:opacity-40 hover:bg-blue-700"
            >
              {saving ? "Confirmando..." : `Confirmar — ${suggestion.driver.name}`}
            </button>
            <button
              onClick={() => setMode("manual")}
              className="w-full text-xs text-slate-400 font-bold hover:text-slate-600"
            >
              Motorista diferente? Buscar manualmente
            </button>
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                autoFocus
                value={manualQuery}
                onChange={(e) => { setManualQuery(e.target.value); setManualDriver(null); }}
                placeholder="Buscar motorista por nome ou CPF..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {filteredDrivers.length > 0 && !manualDriver && (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {filteredDrivers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setManualDriver(d); setManualQuery(d.name); }}
                    className="w-full px-4 py-2.5 text-left text-[10px] hover:bg-slate-50"
                  >
                    <p className="font-bold text-slate-800">{d.name}</p>
                    <p className="text-slate-400">{d.cpf || "CPF não informado"}</p>
                  </button>
                ))}
              </div>
            )}
            {manualDriver && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[9px] text-amber-700 font-bold">
                    Identificação manual — será registrada na timeline com seu nome como responsável.
                  </p>
                </div>
                <button
                  disabled={saving}
                  onClick={() => handleConfirm(manualDriver.id, manualDriver.name, "manual")}
                  className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-black disabled:opacity-40 hover:bg-blue-700"
                >
                  {saving ? "Confirmando..." : `Confirmar — ${manualDriver.name}`}
                </button>
              </>
            )}
          </div>
        )}

        <button onClick={onClose} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </div>
    </div>
  );
}
