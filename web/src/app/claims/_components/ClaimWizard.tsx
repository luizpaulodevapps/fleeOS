"use client";

import React, { useState, useMemo, useEffect } from "react";
import { NewClaimForm, TpForm } from "../_lib/types";
import { ACCIDENT_TYPES } from "../_lib/constants";
import { VehicleDamageMap } from "./VehicleDamageMap";
import { Search, ShieldAlert, Car, User, FileText, CheckCircle, ArrowRight, ArrowLeft, RefreshCw, Loader2, MapPin } from "lucide-react";

interface ClaimWizardProps {
  drivers: any[];
  vehicles: any[];
  contracts: any[];
  onSubmit: (form: NewClaimForm) => Promise<void>;
  onCancel: () => void;
}

export function ClaimWizard({ drivers, vehicles, contracts, onSubmit, onCancel }: ClaimWizardProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSP, setCheckingSP] = useState(false);

  // Search States
  const [driverQuery, setDriverQuery] = useState("");
  const [searchedDrivers, setSearchedDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Form State
  const [form, setForm] = useState<NewClaimForm>({
    vehicleId: "",
    driverId: "",
    occurrenceDate: new Date().toISOString().slice(0, 16),
    severity: "medium",
    location: "",
    description: "",
    involvedThirdParties: false,
    hasVictims: false,
    vehicleDrivable: true,

    // checklist batida fields
    startsEngine: true,
    vehicleMoves: true,
    steeringOk: true,
    brakesOk: true,
    coolingSystemOk: true,
    electricalSystemOk: true,
    airbagsDeployed: false,
    fluidLeak: false,
    suspensionDamage: false,
    wheelDamage: false,
    windshieldDamage: false,
    headlightDamage: false,

    needsTowTruck: false,
    towTruckRequested: false,
    vehicleCanContinue: true,
    reserveVehicleRequired: false,
    accidentType: "Colisão Frontal",
    damageMap: [],

    // Third party
    thirdPartyName: "",
    thirdPartyPhone: "",
    thirdPartyVehicle: "",
    thirdPartyPlate: "",
    thirdPartyInsurer: "",
    thirdPartyPolicyNumber: "",
    evidencePhotos: [],

    // 2.0 digital dossier parameters
    lat: -23.62601,
    lng: -46.65802,
    culprit: "unknown",
    accidentReason: "",
    accidentDynamics: "",

    // wizard initial BO parameters
    boProtocolNumber: "",
    boReportNumber: "",
    boYear: new Date().getFullYear().toString(),
    boDeclarantCpf: "",
    boDeclarantName: "",
    boStatus: "Não Registrado",
    boObservations: "",
    boPdf: "",
    boReceipt: "",
    boUrl: ""
  });

  // Auto-calculated severity engine based on checklist answers
  const calculatedSeverity = useMemo(() => {
    if (form.airbagsDeployed || form.fluidLeak) {
      return "total_loss";
    }
    if (form.suspensionDamage || !form.vehicleMoves || !form.steeringOk) {
      return "severe";
    }
    if (form.windshieldDamage || form.headlightDamage || !form.startsEngine) {
      return "medium";
    }
    return "light";
  }, [
    form.airbagsDeployed,
    form.fluidLeak,
    form.suspensionDamage,
    form.vehicleMoves,
    form.steeringOk,
    form.windshieldDamage,
    form.headlightDamage,
    form.startsEngine
  ]);

  // Sync checklist changes with severity field
  useEffect(() => {
    if (step === 3) {
      setForm((prev) => ({ ...prev, severity: calculatedSeverity }));
    }
  }, [calculatedSeverity, step]);

  // Search drivers by name or document
  const handleDriverSearch = () => {
    if (!driverQuery.trim()) {
      setSearchedDrivers([]);
      return;
    }
    const q = driverQuery.toLowerCase().trim();
    const results = drivers.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.cpf?.replace(/[.-]/g, "").includes(q) ||
        d.cpf?.includes(q)
    );
    setSearchedDrivers(results);
  };

  const handleSelectDriver = (driver: any) => {
    setSelectedDriver(driver);
    setForm((prev) => ({ ...prev, driverId: driver.id }));
    setDriverQuery("");
    setSearchedDrivers([]);

    // Auto load contract vehicle
    const activeContract = contracts.find((c) => c.driverId === driver.id && c.status === "Ativo");
    if (activeContract && activeContract.vehicleId) {
      setForm((prev) => ({ ...prev, vehicleId: activeContract.vehicleId }));
    } else {
      const linkVeh = vehicles.find((v) => v.driverId === driver.id || v.status === "locado");
      if (linkVeh) {
        setForm((prev) => ({ ...prev, vehicleId: linkVeh.id }));
      } else {
        setForm((prev) => ({ ...prev, vehicleId: "" }));
      }
    }
  };

  const handleSimulateSPLookup = () => {
    if (!form.boProtocolNumber || !form.boYear || !form.boDeclarantCpf) {
      alert("Por favor, preencha o Protocolo, Ano e CPF do declarante para consultar no sistema do Detran/SP.");
      return;
    }
    setCheckingSP(true);
    setTimeout(() => {
      setCheckingSP(false);
      const reportNumVal = `BO-SP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setForm((prev) => ({
        ...prev,
        boStatus: "Concluído",
        boReportNumber: reportNumVal,
        boUrl: `https://ssp.sp.gov.br/boletim/visualizar/${reportNumVal}`,
        boPdf: `https://ssp.sp.gov.br/boletim/download/${reportNumVal}.pdf`,
        boReceipt: `https://ssp.sp.gov.br/boletim/recibo/${reportNumVal}.pdf`,
        boObservations: "Boletim de ocorrência eletrônico importado com sucesso via integração SSP/SP."
      }));
      alert(`Consulta finalizada! BO eletrônico localizado e vinculado. Nº: ${reportNumVal}`);
    }, 1500);
  };

  const activeContract = useMemo(() => {
    if (!selectedDriver) return null;
    return contracts.find((c) => c.driverId === selectedDriver.id && c.status === "Ativo");
  }, [selectedDriver, contracts]);

  const selectedVehicle = useMemo(() => {
    if (!form.vehicleId) return null;
    return vehicles.find((v) => v.id === form.vehicleId);
  }, [form.vehicleId, vehicles]);

  // Validation per step
  const canGoNext = () => {
    if (step === 1) return !!form.driverId && !!form.vehicleId;
    if (step === 2) return !!form.occurrenceDate && !!form.location && !!form.description;
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setStep((prev) => prev + 1);
    } else {
      alert("Por favor, preencha todos os campos obrigatórios da etapa atual.");
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleDamageMapChange = (newDamageMap: any[]) => {
    setForm((prev) => ({ ...prev, damageMap: newDamageMap }));
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const submissionForm = {
        ...form,
        accidentDynamics: form.description
      };
      await onSubmit(submissionForm);
      onCancel();
    } catch (err) {
      console.error(err);
      alert("Erro ao abrir sinistro.");
    } finally {
      setSubmitting(false);
    }
  };

  const severityLabels = {
    light: "Leve (Estético)",
    medium: "Moderado (Funcional)",
    severe: "Grave (Mecânico)",
    total_loss: "Perda Total (Integral)"
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto flex flex-col">
      {/* Wizard Header */}
      <div className="p-6 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary font-geist flex items-center gap-1.5">
            <ShieldAlert className="w-5.5 h-5.5 text-primary" />
            <span>📋 Wizard de Registro de Sinistro</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Cadastro de dossiê digital completo de ocorrência de sinistro e batidas.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-outline hover:text-primary font-bold hover:underline"
        >
          Voltar para Lista
        </button>
      </div>

      {/* Steps indicator (7 Steps) */}
      <div className="border-b border-outline-variant bg-slate-50/50 flex flex-wrap justify-between p-4 px-8 text-[11px] font-bold text-outline">
        {[
          { label: "Condutor & Veículo", active: step === 1, done: step > 1 },
          { label: "Dados Ocorrência", active: step === 2, done: step > 2 },
          { label: "Checklist Técnico", active: step === 3, done: step > 3 },
          { label: "Avarias & Evidências", active: step === 4, done: step > 4 },
          { label: "Terceiros", active: step === 5, done: step > 5 },
          { label: "Boletim Ocorrência", active: step === 6, done: step > 6 },
          { label: "Revisão Final", active: step === 7, done: false }
        ].map((item, index) => (
          <div key={item.label} className="flex items-center gap-1.5 py-1">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border ${
                item.active
                  ? "bg-primary text-white border-primary"
                  : item.done
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-slate-400 border-slate-300"
              }`}
            >
              {index + 1}
            </span>
            <span className={item.active ? "text-primary font-extrabold" : item.done ? "text-emerald-600" : ""}>
              {item.label}
            </span>
            {index < 6 && <span className="text-slate-300 ml-2 hidden sm:inline">➔</span>}
          </div>
        ))}
      </div>

      {/* Wizard Step Body */}
      <div className="p-6 flex-1 text-xs">
        {/* STEP 1: Driver & Vehicle Search */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Search className="w-4 h-4 text-primary" />
                <span>Pesquisar Condutor Relacionado</span>
              </h3>
              <p className="text-[10px] text-on-surface-variant">
                Pesquise o condutor pelo Nome Completo ou CPF para carregar automaticamente o veículo e o contrato ativo vinculados.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pesquisar por CPF ou Nome..."
                  value={driverQuery}
                  onChange={(e) => setDriverQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDriverSearch()}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
                <button
                  type="button"
                  onClick={handleDriverSearch}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all"
                >
                  Pesquisar
                </button>
              </div>

              {searchedDrivers.length > 0 && (
                <div className="border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant/60 bg-white max-h-48 overflow-y-auto">
                  {searchedDrivers.map((drv) => (
                    <div
                      key={drv.id}
                      onClick={() => handleSelectDriver(drv)}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-primary block">{drv.name}</span>
                        <span className="text-[10px] text-outline font-mono">CPF: {drv.cpf}</span>
                      </div>
                      <span className="text-[10px] text-primary font-bold hover:underline">Selecionar</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDriver && (
              <div className="bg-slate-50 border p-5 rounded-xl space-y-4">
                <p className="font-bold text-primary uppercase text-[10px]">Vínculo Identificado</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-outline block">Condutor Selecionado</span>
                    <span className="font-semibold text-primary block">{selectedDriver.name}</span>
                    <span className="text-[10px] text-on-surface-variant block font-mono">CPF: {selectedDriver.cpf}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-outline block">Contrato Ativo</span>
                    <span className="font-semibold text-primary block">
                      {activeContract ? `Contrato: ${activeContract.code || "Ativo"}` : "Sem contrato ativo"}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">
                      {activeContract ? `Plano: ${activeContract.planNameSnapshot || "Locação"}` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-outline block mb-1.5">Veículo do Sinistro</span>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold text-primary"
                  >
                    <option value="">Selecione o veículo...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.plate}) {v.id === activeContract?.vehicleId ? "(Vinculado ao Contrato)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: General Occurence Info (QUANDO, ONDE, QUEM, COMO, POR QUE) */}
        {step === 2 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
              Dados Gerais da Ocorrência
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Data e Hora do Ocorrido (QUANDO)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.occurrenceDate}
                  onChange={(e) => setForm({ ...form, occurrenceDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Tipo do Sinistro / Acidente
                </label>
                <select
                  value={form.accidentType}
                  onChange={(e) => setForm({ ...form, accidentType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-bold"
                >
                  {ACCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Endereço do Ocorrido (ONDE)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Geolocalização (Lat/Lng)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Lat"
                    value={form.lat || ""}
                    onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                    className="w-full px-2 py-2.5 bg-slate-50 border border-outline-variant rounded text-[11px] font-mono outline-none"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Lng"
                    value={form.lng || ""}
                    onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                    className="w-full px-2 py-2.5 bg-slate-50 border border-outline-variant rounded text-[11px] font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, lat: -23.626012, lng: -46.658023 }))}
                    className="px-2 bg-slate-200 hover:bg-slate-300 font-bold rounded flex items-center justify-center text-[10px] text-slate-700 shrink-0"
                    title="Simular coordenadas da batida"
                  >
                    📍 Simular
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Responsável / Culpabilidade (QUEM)
                </label>
                <select
                  value={form.culprit}
                  onChange={(e) => setForm({ ...form, culprit: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-bold text-primary"
                >
                  <option value="unknown">Em Análise / Investigação</option>
                  <option value="driver">Condutor Frota (Carlos / Paulo / etc.)</option>
                  <option value="third_party">Terceiro Envolvido</option>
                  <option value="none">Sem Culpados / Caso Fortuito ou Força Maior</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Causa do Acidente (POR QUE)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pista molhada, estouro de pneu, distração do terceiro..."
                  value={form.accidentReason || ""}
                  onChange={(e) => setForm({ ...form, accidentReason: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-100 p-3 rounded-lg border">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-primary">Envolveu Terceiros?</span>
                <input
                  type="checkbox"
                  checked={form.involvedThirdParties}
                  onChange={(e) => setForm({ ...form, involvedThirdParties: e.target.checked })}
                  className="w-4 h-4 text-primary border-outline rounded ml-2"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-primary">Possui Vítimas?</span>
                <input
                  type="checkbox"
                  checked={form.hasVictims}
                  onChange={(e) => setForm({ ...form, hasVictims: e.target.checked })}
                  className="w-4 h-4 text-primary border-outline rounded ml-2"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-primary">Veículo Rodando?</span>
                <input
                  type="checkbox"
                  checked={form.vehicleDrivable}
                  onChange={(e) => setForm({ ...form, vehicleDrivable: e.target.checked })}
                  className="w-4 h-4 text-primary border-outline rounded ml-2"
                />
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Dinâmica do Sinistro (COMO)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Descreva detalhadamente a mecânica da colisão, direção dos carros e fatores determinantes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Checklist Técnico & Tow / Reserve */}
        {step === 3 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
              Checklist Técnico Pós-Impacto
            </h3>

            {/* Severity Suggestion Alert Banner */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-primary">Inteligência de Gravidade</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                  Com base nos dados fornecidos abaixo, o motor de sinistros sugere a gravidade:
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-extrabold text-xs uppercase shadow-sm">
                {severityLabels[form.severity]}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 border-r border-outline-variant/60 pr-4 text-on-surface">
                <p className="text-[10px] font-bold uppercase text-outline mb-1">Mapeamento Técnico de Danos</p>
                {[
                  { key: "startsEngine", label: "Motor dá partida?" },
                  { key: "vehicleMoves", label: "Veículo traciona/anda?" },
                  { key: "steeringOk", label: "Direção alinhada/OK?" },
                  { key: "brakesOk", label: "Freios operacionais?" },
                  { key: "coolingSystemOk", label: "Radiador/Arrefecimento OK?" },
                  { key: "electricalSystemOk", label: "Faróis/Sistema elétrico OK?" },
                  { key: "airbagsDeployed", label: "Airbags acionados?" },
                  { key: "fluidLeak", label: "Vazamento de fluidos?" },
                  { key: "suspensionDamage", label: "Suspensão afetada/danificada?" },
                  { key: "wheelDamage", label: "Rodas/Pneus afetados?" },
                  { key: "windshieldDamage", label: "Vidros/Pára-brisa trincados?" },
                  { key: "headlightDamage", label: "Faróis ou Lanternas quebrados?" }
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between cursor-pointer py-1 border-b border-dashed border-outline-variant/40 text-[11px]">
                    <span className="font-semibold">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(form as any)[item.key]}
                      onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                      className="w-4 h-4 text-primary border-outline rounded"
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-4 pl-2">
                <p className="text-[10px] font-bold uppercase text-outline">Logística Operacional de Assistência</p>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between cursor-pointer py-1 text-[11px]">
                    <span className="font-semibold">Necessita Reboque / Guincho?</span>
                    <input
                      type="checkbox"
                      checked={form.needsTowTruck}
                      onChange={(e) => setForm({ ...form, needsTowTruck: e.target.checked, towTruckRequested: e.target.checked })}
                      className="w-4 h-4 text-primary border-outline rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1 text-[11px]">
                    <span className="font-semibold">Veículo pode continuar viagem?</span>
                    <input
                      type="checkbox"
                      checked={form.vehicleCanContinue}
                      onChange={(e) => setForm({ ...form, vehicleCanContinue: e.target.checked })}
                      className="w-4 h-4 text-primary border-outline rounded"
                    />
                  </label>

                  <div className="pt-2 border-t">
                    <label className="flex items-center justify-between cursor-pointer py-1 text-[11px]">
                      <span className="font-bold text-primary">Necessita Carro Reserva?</span>
                      <input
                        type="checkbox"
                        checked={form.reserveVehicleRequired}
                        onChange={(e) => setForm({ ...form, reserveVehicleRequired: e.target.checked })}
                        className="w-4 h-4 text-primary border-outline rounded"
                      />
                    </label>
                    <p className="text-[9px] text-on-surface-variant italic mt-1 leading-relaxed">
                      Se ativado, o sistema disparará o wizard de alocação de veículo reserva na frota disponível.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Avarias Map & Evidências slots */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto">
            <VehicleDamageMap 
              value={form.damageMap || []} 
              onChange={handleDamageMapChange} 
              photos={form.evidencePhotos || []}
              onPhotosChange={(newPhotos) => setForm({ ...form, evidencePhotos: newPhotos })}
            />
          </div>
        )}

        {/* STEP 5: Third Party Details */}
        {step === 5 && (
          <div className="space-y-4 max-w-xl mx-auto">
            {form.involvedThirdParties ? (
              <div className="space-y-4">
                <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
                  Dados de Terceiros Envolvidos
                </h3>
                <p className="text-[10px] text-on-surface-variant">
                  Insira as informações básicas coletadas no local do acidente para ressarcimento jurídico.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                      Nome do Terceiro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos de Souza"
                      value={form.thirdPartyName}
                      onChange={(e) => setForm({ ...form, thirdPartyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                        Contato / Telefone
                      </label>
                      <input
                        type="text"
                        placeholder="(11) 98888-7777"
                        value={form.thirdPartyPhone}
                        onChange={(e) => setForm({ ...form, thirdPartyPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                        Modelo do Veículo
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Honda Civic"
                        value={form.thirdPartyVehicle}
                        onChange={(e) => setForm({ ...form, thirdPartyVehicle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                        Placa
                      </label>
                      <input
                        type="text"
                        placeholder="ABC1D23"
                        value={form.thirdPartyPlate}
                        onChange={(e) => setForm({ ...form, thirdPartyPlate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                        Seguradora Terceiro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Porto"
                        value={form.thirdPartyInsurer}
                        onChange={(e) => setForm({ ...form, thirdPartyInsurer: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                        Nº Apólice
                      </label>
                      <input
                        type="text"
                        placeholder="Nº Apólice"
                        value={form.thirdPartyPolicyNumber}
                        onChange={(e) => setForm({ ...form, thirdPartyPolicyNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-100/50 border border-dashed rounded-lg space-y-2 text-outline">
                <User className="w-8 h-8 mx-auto text-outline" />
                <p className="text-[11px] font-semibold">Sem envolvimento de terceiros.</p>
                <p className="text-[10px]">
                  Você configurou a etapa anterior indicando que apenas o veículo da frota foi avariado.
                  Avance para o Boletim de Ocorrência.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Boletim de Ocorrência (BO-SP Eletrônico) */}
        {step === 6 && (
          <div className="space-y-4 max-w-xl mx-auto">
            <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
              🚔 Boletim de Ocorrência Eletrônico
            </h3>
            <p className="text-[10px] text-on-surface-variant">
              BO Eletrônico é obrigatório para acionamento das coberturas de seguradoras e faturamento de franquias de condutores.
            </p>

            {/* DETRAN/SP Quick Query Panel */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-3">
              <p className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${checkingSP ? "animate-spin" : ""}`} />
                <span>Consulta SSP / Delegacia Eletrônica São Paulo</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-black uppercase text-outline mb-1">Nº Protocolo SSP</label>
                  <input
                    type="text"
                    placeholder="Ex: 2026/0998"
                    value={form.boProtocolNumber || ""}
                    onChange={(e) => setForm({ ...form, boProtocolNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-[11px] outline-none text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-outline mb-1">CPF Declarante</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.boDeclarantCpf || ""}
                    onChange={(e) => setForm({ ...form, boDeclarantCpf: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-[11px] outline-none text-on-surface font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSimulateSPLookup}
                    disabled={checkingSP}
                    className="w-full py-1.5 bg-primary hover:opacity-95 text-on-primary font-bold text-[11px] rounded transition-all flex items-center justify-center gap-1"
                  >
                    {checkingSP ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Sincronizando...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Consultar SSP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Número do BO</label>
                <input
                  type="text"
                  placeholder="Gerado na integração ou manual..."
                  value={form.boReportNumber || ""}
                  onChange={(e) => setForm({ ...form, boReportNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-bold text-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Ano Boletim</label>
                <input
                  type="text"
                  value={form.boYear || ""}
                  onChange={(e) => setForm({ ...form, boYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Nome Declarante</label>
                <input
                  type="text"
                  placeholder="Nome do declarante do BO"
                  value={form.boDeclarantName || ""}
                  onChange={(e) => setForm({ ...form, boDeclarantName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Status BO</label>
                <select
                  value={form.boStatus}
                  onChange={(e) => setForm({ ...form, boStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-bold"
                >
                  <option value="Não Registrado">Não Registrado</option>
                  <option value="Aguardando Registro">Aguardando Registro</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Concluído">Concluído (Confirmado)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Observações Policiais / Delegacia</label>
              <textarea
                rows={2}
                placeholder="Observações do boletim de ocorrência eletrônico..."
                value={form.boObservations || ""}
                onChange={(e) => setForm({ ...form, boObservations: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
              />
            </div>
          </div>
        )}

        {/* STEP 7: Review & Final Confirmation */}
        {step === 7 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-slate-50 border p-5 rounded-xl space-y-4">
              <h3 className="font-bold text-primary text-xs border-b pb-2 flex justify-between items-center">
                <span>Resumo Geral do Registro</span>
                <span className="text-[10px] text-emerald-600 font-extrabold font-mono flex items-center gap-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Pronto para Envio
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-outline block text-[10px]">Condutor Sinistrado</span>
                  <span className="font-semibold text-primary">{selectedDriver?.name}</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Veículo Envolvido</span>
                  <span className="font-semibold text-primary">
                    {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.plate})` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Data e Hora</span>
                  <span className="font-semibold text-primary font-mono">{form.occurrenceDate}</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Tipo de Ocorrência</span>
                  <span className="font-semibold text-primary">{form.accidentType}</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Endereço</span>
                  <span className="font-semibold text-primary">{form.location || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div>
                    <span className="text-outline block text-[10px]">Geolocalização (GPS)</span>
                    <span className="font-semibold text-primary font-mono">{form.lat}, {form.lng}</span>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black font-mono">
                    📍 Mapeado
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Culpabilidade</span>
                  <span className="font-semibold text-primary capitalize font-bold">
                    {form.culprit === "driver" ? "Condutor Frota" : form.culprit === "third_party" ? "Terceiro" : form.culprit === "none" ? "Sem Culpado" : "Em Análise"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Gravidade Determinada</span>
                  <span className="font-semibold text-primary capitalize">{form.severity === "light" ? "Leve" : form.severity === "medium" ? "Média" : form.severity === "severe" ? "Grave" : "Perda Total"}</span>
                </div>
              </div>

              <div className="pt-2.5 border-t text-[10.5px]">
                <span className="text-outline block text-[10px] mb-1.5 font-bold uppercase tracking-wider">Mapeamento Técnico de Danos</span>
                <div className="grid grid-cols-2 gap-2 text-primary font-bold">
                  <div>• Motor liga: <span className={form.startsEngine ? "text-emerald-600" : "text-red-500"}>{form.startsEngine ? "Sim" : "Não"}</span></div>
                  <div>• Veículo se move: <span className={form.vehicleMoves ? "text-emerald-600" : "text-red-500"}>{form.vehicleMoves ? "Sim" : "Não"}</span></div>
                  <div>• Direção operacional: <span className={form.steeringOk ? "text-emerald-600" : "text-red-500"}>{form.steeringOk ? "Sim" : "Não"}</span></div>
                  <div>• Freios funcionais: <span className={form.brakesOk ? "text-emerald-600" : "text-red-500"}>{form.brakesOk ? "Sim" : "Não"}</span></div>
                  <div>• Radiador/Arrefecimento: <span className={form.coolingSystemOk ? "text-emerald-600" : "text-red-500"}>{form.coolingSystemOk ? "Sim" : "Não"}</span></div>
                  <div>• Sistema elétrico: <span className={form.electricalSystemOk ? "text-emerald-600" : "text-red-500"}>{form.electricalSystemOk ? "Sim" : "Não"}</span></div>
                  <div>• Vazamento de fluídos: <span className={form.fluidLeak ? "text-red-500 font-extrabold" : "text-emerald-600"}>{form.fluidLeak ? "Sim" : "Não"}</span></div>
                  <div>• Airbags disparados: <span className={form.airbagsDeployed ? "text-red-500 font-extrabold" : "text-emerald-600"}>{form.airbagsDeployed ? "Sim" : "Não"}</span></div>
                </div>
              </div>

              <div className="pt-2.5 border-t text-[10.5px]">
                <span className="text-outline block text-[10px] mb-1.5 font-bold uppercase tracking-wider">Boletim de Ocorrência (BO SP)</span>
                <div className="grid grid-cols-2 gap-2 text-primary font-bold font-mono">
                  <div>• Número BO: <span className="font-semibold text-primary">{form.boReportNumber || "Não cadastrado"}</span></div>
                  <div>• Protocolo SSP: <span className="font-semibold text-primary">{form.boProtocolNumber || "N/A"}</span></div>
                  <div>• CPF/Ano: <span className="font-semibold text-primary">{form.boDeclarantCpf || "N/A"} ({form.boYear})</span></div>
                  <div>• Status do BO: <span className="font-semibold text-primary">{form.boStatus}</span></div>
                </div>
              </div>

              {form.involvedThirdParties && (
                <div className="pt-2.5 border-t text-[10.5px]">
                  <span className="text-outline block text-[10px] mb-1.5 font-bold uppercase tracking-wider">Terceiro Envolvido</span>
                  <div className="grid grid-cols-2 gap-2 text-primary font-bold">
                    <div>• Nome: <span className="font-semibold text-primary">{form.thirdPartyName || "N/A"}</span></div>
                    <div>• Telefone: <span className="font-semibold text-primary">{form.thirdPartyPhone || "N/A"}</span></div>
                    <div>• Veículo/Placa: <span className="font-semibold text-primary">{form.thirdPartyVehicle || "N/A"} {form.thirdPartyPlate ? `(${form.thirdPartyPlate})` : ""}</span></div>
                    <div>• Seguradora/Apólice: <span className="font-semibold text-primary">{form.thirdPartyInsurer || "N/A"} {form.thirdPartyPolicyNumber ? `(#${form.thirdPartyPolicyNumber})` : ""}</span></div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <span className="text-outline block text-[10px] mb-1">Avarias Mapeadas</span>
                {form.damageMap && form.damageMap.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {form.damageMap.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-600 border border-red-500/20 font-bold rounded-full text-[9px] uppercase">
                        {d.region} ({d.severity})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="font-semibold text-primary">Nenhuma avaria estrutural selecionada.</span>
                )}
              </div>

              <div className="pt-2 border-t">
                <span className="text-outline block text-[10px] mb-1">Fotos Anexadas (Evidências)</span>
                {form.evidencePhotos && form.evidencePhotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {form.evidencePhotos.map((photo, i) => (
                      <div key={i} className="border rounded p-1 text-center bg-white shadow-sm font-mono text-[8px]">
                        <img src={photo.fileUrl} alt={photo.fileType} className="w-full h-10 object-cover rounded" />
                        <span className="text-[8px] font-bold text-outline block mt-0.5 truncate">{photo.fileType}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="font-semibold text-primary">Nenhuma foto de evicência anexada.</span>
                )}
              </div>

              <div className="pt-2 border-t">
                <span className="text-outline block text-[10px]">Causa Provável</span>
                <p className="text-primary mt-1 leading-relaxed bg-white border p-3 rounded-lg font-bold font-mono">{form.accidentReason || "Não informada"}</p>
              </div>

              <div className="pt-2 border-t">
                <span className="text-outline block text-[10px]">Dinâmica da Colisão</span>
                <p className="text-primary mt-1 leading-relaxed bg-white border p-3 rounded-lg font-mono">{form.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer controls */}
      <div className="p-6 border-t border-outline-variant bg-slate-50 flex justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={handleBack}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg border text-outline font-bold hover:bg-slate-100 disabled:opacity-50 transition-all text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {step < 7 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <span>Avançar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleWizardSubmit}
            className="flex items-center space-x-1 px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all text-xs shadow"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? "Registrando..." : "Registrar Sinistro & Abrir Dossiê"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
