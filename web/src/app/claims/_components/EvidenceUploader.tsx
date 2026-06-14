"use client";

import React, { useState } from "react";
import { ClaimEvidence } from "../_lib/types";
import { Upload, Camera, FileText, Image as ImageIcon, Video, Mic, Trash2, Link2 } from "lucide-react";

interface EvidenceUploaderProps {
  evidences: ClaimEvidence[];
  onAddEvidence: (fileType: string, fileUrl: string) => Promise<void>;
  readOnly?: boolean;
}

export function EvidenceUploader({ evidences, onAddEvidence, readOnly = false }: EvidenceUploaderProps) {
  const [fileType, setFileType] = useState("Foto Frente");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const mandatorySlots = [
    { label: "Foto Frente", key: "Foto Frente" },
    { label: "Foto Traseira", key: "Foto Traseira" },
    { label: "Foto Lateral Esq.", key: "Foto Lateral Esq." },
    { label: "Foto Lateral Dir.", key: "Foto Lateral Dir." },
    { label: "Painel & Odômetro", key: "Painel & Odômetro" },
    { label: "CNH Condutor", key: "CNH Condutor" }
  ];

  const handleMockUpload = async (slotKey: string) => {
    if (readOnly) return;
    setUploading(true);
    // Generate a beautiful mock Unsplash or file URL for testing
    const randomId = Math.floor(Math.random() * 1000);
    let mockUrl = `https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=60`;
    
    if (slotKey.includes("Odômetro") || slotKey.includes("Painel")) {
      mockUrl = `https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=60`;
    } else if (slotKey.includes("CNH")) {
      mockUrl = `https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60`;
    }

    setTimeout(async () => {
      await onAddEvidence(slotKey, mockUrl);
      setUploading(false);
    }, 600);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) return;
    setUploading(true);
    await onAddEvidence(fileType, fileUrl.trim());
    setFileUrl("");
    setUploading(false);
  };

  const getSlotEvidence = (slotKey: string) => {
    return evidences.filter((ev) => ev.fileType === slotKey);
  };

  const getFileIcon = (type: string) => {
    if (type.toLowerCase().includes("vídeo") || type.toLowerCase().includes("video")) return <Video className="w-4 h-4 text-rose-500" />;
    if (type.toLowerCase().includes("áudio") || type.toLowerCase().includes("audio")) return <Mic className="w-4 h-4 text-emerald-500" />;
    if (type.toLowerCase().includes("pdf") || type.toLowerCase().includes("cnh") || type.toLowerCase().includes("documento")) return <FileText className="w-4 h-4 text-blue-500" />;
    return <ImageIcon className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4.5 h-4.5 text-primary" />
          <span>Evidências, Mídias & Documentos</span>
        </h3>
        <span className="text-[10px] text-on-surface-variant font-mono">
          Anexe fotos, vídeos do local do acidente, CNH e comprovantes
        </span>
      </div>

      {/* Mandatory Photos Grid */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase text-outline">Fotos e Documentações Obrigatórias</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {mandatorySlots.map((slot) => {
            const slotEvs = getSlotEvidence(slot.key);
            const hasEv = slotEvs.length > 0;
            return (
              <div
                key={slot.key}
                className={`border rounded-lg p-3 flex flex-col justify-between text-center relative min-h-[140px] transition-all overflow-hidden ${
                  hasEv
                    ? "bg-slate-50 border-emerald-500/30"
                    : "bg-slate-100/40 border-dashed border-outline-variant hover:bg-slate-100"
                }`}
              >
                {hasEv ? (
                  <>
                    <div className="w-full h-16 rounded overflow-hidden mb-1.5 bg-slate-200">
                      <img src={slotEvs[slotEvs.length - 1].fileUrl} alt={slot.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 block">{slot.label}</span>
                    <span className="text-[8px] text-outline block font-mono mt-0.5">Enviado</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-between h-full py-1">
                    <Camera className="w-5 h-5 text-outline mb-1" />
                    <span className="text-[9px] font-bold text-on-surface">{slot.label}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleMockUpload(slot.key)}
                        disabled={uploading}
                        className="mt-1 px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-[8px] rounded uppercase"
                      >
                        Simular Foto
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Files Form & List */}
      {!readOnly && (
        <form onSubmit={handleCustomSubmit} className="bg-slate-50 border p-4 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Tipo de Documento / Evidência
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            >
              <option value="Foto Ocorrência">Foto Ocorrência</option>
              <option value="BO PDF">Laudo / BO (PDF)</option>
              <option value="Vídeo Sinistro">Vídeo do Acidente</option>
              <option value="Oitiva Áudio">Áudio de Testemunha</option>
              <option value="Orçamento Oficina">Orçamento de Funilaria</option>
              <option value="Documento CRLV">CRLV Veículo</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
              Link URL do Arquivo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-outline">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <input
                type="url"
                required
                placeholder="https://exemplo.com/arquivo.png"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Salvando..." : "Anexar Evidência"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Evidences List */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase text-outline">Mídias do Dossiê ({evidences.length})</p>
        {evidences.length === 0 ? (
          <p className="text-[11px] italic text-outline text-center py-4 bg-slate-50 border rounded-lg">
            Nenhuma evidência anexada ao dossiê.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {evidences.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="flex items-center justify-between p-3 bg-slate-50 border border-outline-variant/60 rounded-xl text-[11px] hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 bg-white rounded-lg border border-outline-variant/40 shrink-0">
                    {getFileIcon(ev.fileType)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-primary block truncate">{ev.fileType}</span>
                    <a
                      href={ev.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline font-mono truncate block max-w-[150px]"
                    >
                      {ev.fileUrl}
                    </a>
                  </div>
                </div>
                <span className="text-[8px] font-mono text-outline shrink-0">
                  {new Date(ev.uploadedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
