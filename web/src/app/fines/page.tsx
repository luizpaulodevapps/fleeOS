"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  FileWarning,
  LayoutDashboard,
  Plus,
  Receipt,
  Scale,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import { useTrafficFines } from "./_hooks/useTrafficFines";
import { FinesDashboard } from "./_components/FinesDashboard";
import { FinesList } from "./_components/FinesList";
import { FineDetailDrawer } from "./_components/FineDetailDrawer";
import { DriverIdentificationPanel } from "./_components/DriverIdentificationPanel";
import { AppealCreateModal, AppealManager } from "./_components/AppealManager";
import { FinesReports } from "./_components/FinesReports";
import {
  TrafficFine,
  FineCategory,
  ResponsibleParty,
} from "./_lib/types";

type Tab = "dashboard" | "fines" | "identification" | "appeals" | "dispatcher" | "financial" | "reports";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "fines", label: "Infrações", icon: FileWarning },
  { id: "identification", label: "Indicação de Condutor", icon: UserCheck },
  { id: "appeals", label: "Recursos", icon: Scale },
  { id: "dispatcher", label: "Despachante", icon: Truck },
  { id: "financial", label: "Financeiro", icon: Receipt },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
];

export default function FinesPage() {
  const hub = useTrafficFines();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedFine, setSelectedFine] = useState<TrafficFine | null>(null);
  const [idPanelOpen, setIdPanelOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [newFineOpen, setNewFineOpen] = useState(false);

  // ─── Pending identification tab ──────────────────────────────────────────
  const pendingId = hub.fines.filter((f) => !f.driverId || f.status === "pending_driver_id");
  const dtpFines = hub.fines.filter(
    (f) => f.fineCategory === "dtp" && f.status !== "paid" && f.status !== "archived"
  );
  const chargedFines = hub.fines.filter((f) => f.arId);

  const openDrawer = (fine: TrafficFine) => {
    setSelectedFine(fine);
    setIdPanelOpen(false);
    setAppealModalOpen(false);
  };

  if (hub.loading) {
    return (
      <div className="min-h-[560px] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Carregando Central de Infrações...</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 text-slate-900 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Módulo de Primeira Classe</p>
          <h1 className="font-geist text-2xl font-black tracking-tight mt-1">
            🚨 Central de Infrações & Penalidades
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recebimento · Responsabilização · Defesa / Recurso · Recuperação Financeira
          </p>
        </div>
        <button
          onClick={() => setNewFineOpen(true)}
          className="h-10 px-4 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Nova Infração
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 flex-wrap border-b border-slate-200 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => {
          let badge = 0;
          if (id === "identification") badge = pendingId.length;
          if (id === "appeals") badge = hub.appeals.filter((a) => a.status === "pending").length;
          if (id === "dispatcher") badge = dtpFines.filter((f) => !f.dispatcherTaskId).length;

          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-black border-b-2 transition-colors -mb-px ${
                tab === id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <div>
        {tab === "dashboard" && (
          <FinesDashboard
            kpis={hub.kpis}
            fines={hub.fines}
            getDriverPoints={hub.getDriverPoints}
            drivers={hub.drivers}
          />
        )}

        {tab === "fines" && (
          <FinesList
            fines={hub.fines}
            getEffectiveAmount={hub.getEffectiveAmount}
            onSelect={openDrawer}
          />
        )}

        {tab === "identification" && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500">
              {pendingId.length} infração{pendingId.length !== 1 ? "ões" : ""} aguardando identificação
            </p>
            {pendingId.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <UserCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-slate-600 mt-3">Todas as infrações têm condutor identificado. ✅</p>
              </div>
            ) : (
              <FinesList
                fines={pendingId}
                getEffectiveAmount={hub.getEffectiveAmount}
                onSelect={openDrawer}
              />
            )}
          </div>
        )}

        {tab === "appeals" && (
          <AppealManager
            appeals={hub.appeals}
            onResolve={hub.resolveAppeal}
          />
        )}

        {tab === "dispatcher" && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500">
              Multas DTP que requerem defesa junto ao órgão regulador
            </p>
            {dtpFines.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400 mt-3">Nenhuma multa DTP pendente.</p>
              </div>
            ) : (
              <FinesList
                fines={dtpFines}
                getEffectiveAmount={hub.getEffectiveAmount}
                onSelect={openDrawer}
              />
            )}
          </div>
        )}

        {tab === "financial" && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500">
              {chargedFines.length} infração{chargedFines.length !== 1 ? "ões" : ""} com débito gerado no caixa
            </p>
            <FinesList
              fines={chargedFines}
              getEffectiveAmount={hub.getEffectiveAmount}
              onSelect={openDrawer}
            />
          </div>
        )}

        {tab === "reports" && (
          <FinesReports
            fines={hub.fines}
            drivers={hub.drivers}
            getEffectiveAmount={hub.getEffectiveAmount}
            getDriverPoints={hub.getDriverPoints}
          />
        )}
      </div>

      {/* Drawer de detalhes */}
      {selectedFine && !idPanelOpen && !appealModalOpen && (
        <FineDetailDrawer
          fine={selectedFine}
          getEffectiveAmount={hub.getEffectiveAmount}
          onClose={() => setSelectedFine(null)}
          onConfirmDriver={() => setIdPanelOpen(true)}
          onCharge={async () => {
            try {
              await hub.chargeDriver(selectedFine.id);
              await hub.reload();
              setSelectedFine(null);
            } catch (e: any) {
              alert(e?.message || "Erro ao gerar cobrança.");
            }
          }}
          onAppeal={() => setAppealModalOpen(true)}
          onDispatcherTask={async () => {
            try {
              await hub.createDispatcherTask(selectedFine.id);
              await hub.reload();
            } catch (e: any) {
              alert(e?.message || "Erro ao criar tarefa.");
            }
          }}
        />
      )}

      {/* Painel de identificação */}
      {selectedFine && idPanelOpen && (
        <DriverIdentificationPanel
          fine={selectedFine}
          suggestion={hub.suggestDriver(selectedFine)}
          allDrivers={hub.drivers}
          onConfirm={async (driverId, driverName, method) => {
            await hub.confirmDriver(selectedFine.id, driverId, driverName, method);
            setIdPanelOpen(false);
            setSelectedFine(null);
          }}
          onClose={() => setIdPanelOpen(false)}
        />
      )}

      {/* Modal de recurso */}
      {selectedFine && appealModalOpen && (
        <AppealCreateModal
          fineId={selectedFine.id}
          onSubmit={hub.createAppeal}
          onClose={() => {
            setAppealModalOpen(false);
            setSelectedFine(null);
          }}
        />
      )}

      {/* Modal de nova infração */}
      {newFineOpen && (
        <NewFineModal
          vehicles={hub.vehicles}
          drivers={hub.drivers}
          suggestDriver={hub.suggestDriver}
          onSubmit={async (payload) => {
            await hub.createFine(payload);
            setNewFineOpen(false);
          }}
          onConfirmDriver={hub.confirmDriver}
          onClose={() => setNewFineOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Modal de cadastro de nova infração ──────────────────────────────────────

function NewFineModal({ vehicles, drivers, suggestDriver, onSubmit, onConfirmDriver, onClose }: {
  vehicles: any[];
  drivers: any[];
  suggestDriver: (fine: any) => { driver: any; confidence: "high" | "medium" | "low" } | null;
  onSubmit: (payload: any) => Promise<void>;
  onConfirmDriver: (fineId: string, driverId: string, driverName: string, method: "auto" | "manual") => Promise<void>;
  onClose: () => void;
}) {
  const today = new Date().toISOString().substring(0, 10);
  const [saving, setSaving] = useState(false);
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [form, setForm] = useState({
    noticeNumber: "",
    issuingAgency: "DER-SP",
    vehicleId: "",
    plate: "",
    prefix: "",
    infractionCode: "",
    description: "",
    fineCategory: "transit" as FineCategory,
    occurrenceDate: today,
    receivedDate: today,
    originalAmount: "",
    discountAmount: "0",
    discountDeadline: "",
    dueDate: "",
    points: "0",
    responsibleParty: "driver" as ResponsibleParty,
    notes: "",
  });
  const [driverSuggestion, setDriverSuggestion] = useState<{ driver: any; confidence: "high" | "medium" | "low" } | null>(null);
  const [driverConfirmed, setDriverConfirmed] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const vehicleSearchResults = useMemo(() => {
    const normalized = vehicleQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized || vehicleQuery.length < 2) return [];
    return vehicles.filter((v) => {
      const plate = String(v.plate || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const prefix = String(v.prefix || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const code = String(v.internalCode || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return plate.includes(normalized) || prefix.includes(normalized) || code.includes(normalized);
    }).slice(0, 8);
  }, [vehicleQuery, vehicles]);

  // Auto-suggest driver when vehicle + occurrence date are set
  useEffect(() => {
    if (!form.vehicleId || !form.occurrenceDate) {
      setDriverSuggestion(null);
      setDriverConfirmed(false);
      return;
    }
    const suggestion = suggestDriver({
      vehicleId: form.vehicleId,
      occurrenceDate: form.occurrenceDate,
    } as any);
    setDriverSuggestion(suggestion);
    setDriverConfirmed(false);
  }, [form.vehicleId, form.occurrenceDate, suggestDriver]);

  const selectVehicle = (v: any) => {
    setForm((f) => ({ ...f, vehicleId: v.id, plate: v.plate || "", prefix: v.prefix || "" }));
    setVehicleQuery(`${v.plate || ""} ${v.prefix || v.internalCode || ""}`.trim());
    setShowResults(false);
  };

  const submit = async () => {
    if (!form.noticeNumber || !form.vehicleId || !form.description || !form.originalAmount || !form.dueDate) {
      return alert("Preencha os campos obrigatórios: AIT, veículo, descrição, valor e vencimento.");
    }
    setSaving(true);
    try {
      const originalAmount = Number(form.originalAmount);
      const discountAmount = Number(form.discountAmount || 0);
      const payload: any = {
        ...form,
        originalAmount,
        discountAmount,
        currentAmount: originalAmount - discountAmount,
        points: Number(form.points || 0),
        timeline: [],
        identificationMethod: "pending",
      };

      // If driver was identified, set it already
      if (driverSuggestion && driverConfirmed) {
        payload.driverId = driverSuggestion.driver.id;
        payload.driverName = driverSuggestion.driver.name;
        payload.identificationMethod = driverSuggestion.confidence === "high" ? "auto" : "manual";
        payload.status = "driver_identified";
      }

      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4 overflow-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-[#fcfafb] rounded-2xl shadow-2xl p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h2 className="font-geist text-lg font-black">Nova Infração</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Número do AIT *" value={form.noticeNumber} onChange={(v) => set("noticeNumber", v)} placeholder="5A1234567" />
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Órgão Autuador *</label>
            <select value={form.issuingAgency} onChange={(e) => set("issuingAgency", e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400">
              {["DER-SP", "DETRAN-SP", "SPTrans", "SMT", "PRF", "PMSP", "Outro"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle search — busca por placa/prefixo */}
        <div className="relative">
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Veículo *</label>
          <input
            type="text"
            value={vehicleQuery}
            onChange={(e) => { setVehicleQuery(e.target.value); setShowResults(true); if (!e.target.value) setForm((f) => ({ ...f, vehicleId: "", plate: "", prefix: "" })); }}
            onFocus={() => setShowResults(true)}
            placeholder="Buscar por placa ou prefixo..."
            className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400"
          />
          {showResults && vehicleQuery.length >= 2 && (
            <div className="absolute left-0 right-0 top-[68px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10">
              {vehicleSearchResults.length === 0 ? (
                <p className="p-3 text-[10px] text-slate-400 text-center">Nenhum veículo encontrado.</p>
              ) : (
                vehicleSearchResults.map((v) => {
                  const contract = null; // we don't need this here
                  return (
                    <button key={v.id} onClick={() => selectVehicle(v)}
                      className="w-full px-3 py-2 flex items-center justify-between text-left border-b last:border-0 border-slate-100 hover:bg-indigo-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-900">{v.plate}</p>
                        <p className="text-[8px] text-slate-500">{v.brand} {v.model} · {v.prefix || v.internalCode || "sem prefixo"}</p>
                      </div>
                      {v.prefix && <span className="text-[8px] font-black text-indigo-600">{v.prefix}</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
          {selectedVehicle && (
            <div className="mt-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 flex items-center justify-between">
              <div className="text-[10px]">
                <span className="font-bold text-indigo-800">{selectedVehicle.plate}</span>
                <span className="text-indigo-600"> · {selectedVehicle.brand} {selectedVehicle.model}</span>
                {selectedVehicle.prefix && <span className="text-indigo-500 ml-1">· {selectedVehicle.prefix}</span>}
              </div>
              <button onClick={() => { setVehicleQuery(""); setForm((f) => ({ ...f, vehicleId: "", plate: "", prefix: "" })); }}
                className="w-4 h-4 rounded grid place-items-center hover:bg-indigo-200 text-indigo-400">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="col-span-2 -mt-1">
          <Field label="Descrição da Infração *" value={form.description} onChange={(v) => set("description", v)} placeholder="Avanço de sinal vermelho" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Categoria *</label>
            <select value={form.fineCategory} onChange={(e) => set("fineCategory", e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400">
              <option value="transit">Trânsito</option>
              <option value="dtp">DTP / Táxi</option>
              <option value="operational">Operacional</option>
              <option value="contractual">Contratual</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Responsável</label>
            <select value={form.responsibleParty} onChange={(e) => set("responsibleParty", e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400">
              <option value="driver">Motorista</option>
              <option value="company">Empresa</option>
              <option value="dispatcher">Despachante</option>
              <option value="shared">Compartilhado</option>
            </select>
          </div>
          <Field label="Código da Infração" value={form.infractionCode} onChange={(v) => set("infractionCode", v)} placeholder="7455-3" />
          <Field label="Pontos CNH" type="number" value={form.points} onChange={(v) => set("points", v)} placeholder="0" />
          <Field label="Data da Ocorrência *" type="datetime-local" value={form.occurrenceDate} onChange={(v) => set("occurrenceDate", v)} />
          <Field label="Data de Recebimento" type="date" value={form.receivedDate} onChange={(v) => set("receivedDate", v)} />
          <Field label="Valor Original (R$) *" type="number" value={form.originalAmount} onChange={(v) => set("originalAmount", v)} placeholder="293,47" />
          <Field label="Desconto (R$)" type="number" value={form.discountAmount} onChange={(v) => set("discountAmount", v)} placeholder="0" />
          <Field label="Prazo do Desconto" type="date" value={form.discountDeadline} onChange={(v) => set("discountDeadline", v)} />
          <Field label="Vencimento Final *" type="date" value={form.dueDate} onChange={(v) => set("dueDate", v)} />
        </div>

        {/* Driver identification — inteligente */}
        {form.vehicleId && form.occurrenceDate && (
          <div className={`rounded-xl border p-3 space-y-2 ${
            driverSuggestion
              ? driverConfirmed
                ? "border-emerald-200 bg-emerald-50"
                : "border-indigo-200 bg-indigo-50"
              : "border-amber-200 bg-amber-50"
          }`}>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[8px] font-black uppercase tracking-wide text-slate-500">Identificação do Condutor</span>
            </div>

            {driverSuggestion ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white grid place-items-center font-geist font-black text-[10px] text-slate-800 shrink-0 border border-slate-200">
                      {String(driverSuggestion.driver.name || "?").split(" ").slice(0, 2).map((p: string) => p[0]).join("")}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">{driverSuggestion.driver.name}</p>
                      <p className="text-[8px] text-slate-500">{driverSuggestion.driver.cpf || "CPF não informado"}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                    driverSuggestion.confidence === "high"
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-amber-200 text-amber-800"
                  }`}>
                    {driverSuggestion.confidence === "high" ? "Alta confiança" : "Média confiança"}
                  </span>
                </div>
                {!driverConfirmed && (
                  <button onClick={() => setDriverConfirmed(true)}
                    className="w-full h-8 rounded-lg bg-white border border-indigo-200 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5">
                    <Check className="w-3 h-3" /> Confirmar condutor
                  </button>
                )}
                {driverConfirmed && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Condutor confirmado para esta infração
                  </div>
                )}
              </>
            ) : (
              <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Nenhum condutor encontrado para este veículo na data da ocorrência
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Observações</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none resize-none"
            placeholder="Informações adicionais..."
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className="flex-1 h-10 rounded-xl bg-slate-950 text-white text-xs font-black disabled:opacity-40 hover:bg-indigo-700"
          >
            {saving ? "Registrando..." : "Registrar Infração"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
