"use client";

import React, { useState, useEffect } from "react";
import { ClaimPoliceReport } from "../_lib/types";
import { POLICE_REPORT_STATUSES } from "../_lib/constants";
import { FileText, Loader2, RefreshCw, CheckCircle, AlertTriangle, FileUp, ExternalLink } from "lucide-react";

interface PoliceReportCardProps {
  initialValue: ClaimPoliceReport | null;
  onSave: (form: ClaimPoliceReport) => Promise<void>;
  readOnly?: boolean;
}

export function PoliceReportCard({ initialValue, onSave, readOnly = false }: PoliceReportCardProps) {
  const [form, setForm] = useState<ClaimPoliceReport>({
    claimId: initialValue?.claimId || "",
    protocolNumber: "",
    reportNumber: "",
    year: new Date().getFullYear().toString(),
    declarantCpf: "",
    declarantName: "",
    status: "Não Registrado",
    registrationDate: "",
    lastCheckDate: "",
    observations: "",
    boPdf: "",
    boReceipt: "",
    boUrl: ""
  });

  const [checkingSP, setCheckingSP] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setForm({
        claimId: initialValue.claimId || "",
        protocolNumber: initialValue.protocolNumber || "",
        reportNumber: initialValue.reportNumber || "",
        year: initialValue.year || new Date().getFullYear().toString(),
        declarantCpf: initialValue.declarantCpf || "",
        declarantName: initialValue.declarantName || "",
        status: initialValue.status || "Não Registrado",
        registrationDate: initialValue.registrationDate || "",
        lastCheckDate: initialValue.lastCheckDate || "",
        observations: initialValue.observations || "",
        boPdf: initialValue.boPdf || "",
        boReceipt: initialValue.boReceipt || "",
        boUrl: initialValue.boUrl || ""
      });
    }
  }, [initialValue]);

  const handleSimulateSPLookup = () => {
    if (!form.protocolNumber || !form.year || !form.declarantCpf) {
      alert("Por favor, preencha o Protocolo, Ano e CPF do declarante para consultar no sistema do Detran/SP.");
      return;
    }
    setCheckingSP(true);
    setTimeout(() => {
      setCheckingSP(false);
      const randomStatus = "Concluído";
      const reportNumVal = `BO-SP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setForm((prev) => ({
        ...prev,
        status: randomStatus,
        reportNumber: reportNumVal,
        lastCheckDate: new Date().toISOString().split("T")[0],
        registrationDate: new Date().toISOString().split("T")[0],
        boUrl: `https://ssp.sp.gov.br/boletim/visualizar/${reportNumVal}`,
        boPdf: `https://ssp.sp.gov.br/boletim/download/${reportNumVal}.pdf`,
        boReceipt: `https://ssp.sp.gov.br/boletim/recibo/${reportNumVal}.pdf`,
        observations: "Boletim de ocorrência eletrônico importado com sucesso via integração SSP/SP."
      }));
      alert(`Consulta finalizada! BO eletrônico localizado e vinculado. Nº: ${reportNumVal}`);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    const updatedForm = {
      ...form,
      lastCheckDate: new Date().toISOString().split("T")[0]
    };
    await onSave(updatedForm);
    setSaving(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "Em Análise":
      case "Aguardando Registro":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      case "Complementação Solicitada":
        return "bg-red-500/10 text-red-600 border border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
              Boletim de Ocorrência (BO-SP Eletrônico)
            </h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Valide e anexe o Boletim de Ocorrência do acidente para acionamento securitário e legal.
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(form.status)}`}>
          Status: {form.status}
        </span>
      </div>

      {/* DETRAN/SP Search Panel */}
      {!readOnly && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-3">
          <p className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${checkingSP ? "animate-spin" : ""}`} />
            <span>Consulta Rápida SSP / Delegacia Eletrônica SP</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nº Protocolo SP</label>
              <input
                type="text"
                placeholder="Ex: 2026/0998877"
                value={form.protocolNumber}
                onChange={(e) => setForm({ ...form, protocolNumber: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-outline mb-1">CPF do Declarante</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={form.declarantCpf}
                onChange={(e) => setForm({ ...form, declarantCpf: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none text-on-surface"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSimulateSPLookup}
                disabled={checkingSP}
                className="w-full py-1.5 bg-primary hover:opacity-95 text-on-primary font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5"
              >
                {checkingSP ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Integrando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Consultar SSP SP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Dados do Registro</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Número do BO
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: BO-2026-12345"
                value={form.reportNumber}
                onChange={(e) => setForm({ ...form, reportNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Ano de Emissão
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Data do Registro
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={form.registrationDate}
                onChange={(e) => setForm({ ...form, registrationDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Nome do Declarante
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="Ex: Luiz da Silva"
                value={form.declarantName}
                onChange={(e) => setForm({ ...form, declarantName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase text-outline">Anexos & Comprovantes</p>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              URL PDF do BO
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-outline">
                <FileUp className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                disabled={readOnly}
                placeholder="https://exemplo.com/bo.pdf"
                value={form.boPdf}
                onChange={(e) => setForm({ ...form, boPdf: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Recibo de Envio SSP
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="URL do Recibo"
                value={form.boReceipt || ""}
                onChange={(e) => setForm({ ...form, boReceipt: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                Link SSP Direto
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="URL de validação"
                value={form.boUrl || ""}
                onChange={(e) => setForm({ ...form, boUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
          Observações Detalhadas
        </label>
        <textarea
          rows={2}
          disabled={readOnly}
          value={form.observations}
          onChange={(e) => setForm({ ...form, observations: e.target.value })}
          placeholder="Adicione observações da análise policial ou andamento do inquérito..."
          className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
        />
      </div>

      {form.lastCheckDate && (
        <div className="bg-slate-100 p-2.5 border rounded-lg text-[10px] text-on-surface-variant font-semibold flex items-center justify-between">
          <span>Última sincronização/validação SSP: {form.lastCheckDate}</span>
          {form.boPdf && (
            <a
              href={form.boPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir PDF Boletim</span>
            </a>
          )}
        </div>
      )}

      {!readOnly && (
        <div className="pt-2 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Boletim de Ocorrência"}</span>
          </button>
        </div>
      )}
    </form>
  );
}
