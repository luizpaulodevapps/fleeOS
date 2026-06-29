"use client";

import { useState, useMemo } from "react";
import { FileText, Plus, Trash2, Eye, Clock } from "lucide-react";
import { DOCUMENT_TEMPLATES, CATEGORY_META } from "@/app/documents/_lib/templates";
import { buildVariableMap, resolveVariables } from "@/app/documents/_lib/engine";
import type { DocumentCategory } from "@/app/documents/_lib/types";

type Props = {
  contract: any;
  drivers: any[];
  vehicles: any[];
  company: any;
  generatedDocuments: any[];
  onGenerate: (templateId: string) => void;
  onDelete: (docId: string) => void;
  onView: (doc: any) => void;
  currentUserName: string;
};

const CATEGORIES_ORDER: DocumentCategory[] = [
  "Operação", "Financeiro", "Sinistros", "Compliance", "Patrimônio", "Encerramento",
];

export function DocumentsTab({
  contract,
  drivers,
  vehicles,
  company,
  generatedDocuments,
  onGenerate,
  onDelete,
  onView,
  currentUserName,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const driver = drivers.find((d) => d.id === contract?.driverId);
  const vehicle = vehicles.find((v) => v.id === contract?.vehicleId);

  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter((t) => {
      const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchSearch = search === "" || t.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const contractDocs = generatedDocuments.filter((d) => d.contractId === contract?.id);

  return (
    <div className="space-y-6">
      {/* ─── Generated Documents List ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Documentos Gerados
            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {contractDocs.length}
            </span>
          </h3>
        </div>

        {contractDocs.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum documento gerado para este contrato</p>
            <p className="text-[10px] text-slate-400 mt-1">Selecione um template abaixo para gerar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contractDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${CATEGORY_META[doc.category]?.bg || "bg-slate-100"} flex items-center justify-center`}>
                  <FileText className={`w-4 h-4 ${CATEGORY_META[doc.category]?.color || "text-slate-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{doc.templateName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400">
                      {new Date(doc.generatedAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-[9px] text-slate-400">•</span>
                    <span className="text-[9px] text-slate-400">{doc.generatedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Template Selection ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Gerar Novo Documento
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar template..."
            className="flex-1 h-8 px-3 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="h-8 px-3 text-[10px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">Todas categorias</option>
            {CATEGORIES_ORDER.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {filteredTemplates.map((tpl) => {
            const meta = CATEGORY_META[tpl.category];
            return (
              <button
                key={tpl.id}
                onClick={() => onGenerate(tpl.id)}
                className="flex items-center gap-3 p-3 text-left bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-[16px] ${meta.color}`}>{tpl.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                    {tpl.name}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">{tpl.description}</p>
                </div>
                <Plus className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
