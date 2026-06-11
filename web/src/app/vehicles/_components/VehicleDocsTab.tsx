"use client";

import React from "react";
import { Paperclip, PlusCircle } from "lucide-react";
import { DocFormState } from "../_lib/types";

interface VehicleDocsTabProps {
  selectedVehicle: any;
  attachments: any[];
  docForm: DocFormState;
  setDocForm: React.Dispatch<React.SetStateAction<DocFormState>>;
  handleUploadDoc: (e: React.FormEvent) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
}

export function VehicleDocsTab({
  selectedVehicle,
  attachments,
  docForm,
  setDocForm,
  handleUploadDoc,
  isReadOnly
}: VehicleDocsTabProps) {
  const readOnly = isReadOnly(selectedVehicle);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Documentos Oficiais e Apólices</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.filter(a => a.entityType === "vehicle" && a.entityId === selectedVehicle.id).length === 0 ? (
            <p className="col-span-2 text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
              Sem apólices ou laudos cadastrados para este veículo.
            </p>
          ) : (
            attachments.filter(a => a.entityType === "vehicle" && a.entityId === selectedVehicle.id).map(a => (
              <div key={a.id} className="bg-slate-50 border border-outline-variant p-3 rounded-xl flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-outline" />
                  <div>
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
                      {a.fileName}
                    </a>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Inserido por: {a.uploadedBy}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attachment Add */}
      {!readOnly && (
        <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-primary" />
            <span>Indexar Novo Laudo / Apólice CRLV</span>
          </h4>

          <form onSubmit={handleUploadDoc} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Identificação</label>
              <input
                type="text"
                required
                placeholder="Ex: Laudo_Vistoria_2026.pdf"
                value={docForm.fileName}
                onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">URL do Arquivo</label>
              <input
                type="text"
                required
                placeholder="https://example.com/doc.pdf"
                value={docForm.fileUrl}
                onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Efetivar Anexo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
