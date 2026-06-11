"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { DOCUMENT_TEMPLATES, CATEGORY_META } from "../_lib/templates";
import type { DocumentCategory, DocumentTemplate } from "../_lib/types";
import { GenerateDocumentModal } from "./GenerateDocumentModal";
import { DocumentPrintView } from "./DocumentPrintView";

const CATEGORIES: DocumentCategory[] = [
  "Operação",
  "Financeiro",
  "Sinistros",
  "Compliance",
  "Patrimônio",
  "Encerramento",
];

export function DocumentsPageContent() {
  const { currentUser, getCollection } = useAuth();

  const [contracts, setContracts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "Todos">("Todos");
  const [search, setSearch] = useState("");
  const [generatingTemplate, setGeneratingTemplate] = useState<DocumentTemplate | null>(null);
  const [printData, setPrintData] = useState<{
    resolvedBody: string;
    templateName: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [conList, drvList, vehList, settingsList] = await Promise.all([
          getCollection("contracts"),
          getCollection("drivers"),
          getCollection("vehicles"),
          getCollection("settings").catch(() => []),
        ]);
        setContracts(conList || []);
        setDrivers(drvList || []);
        setVehicles(vehList || []);
        // Company settings — try to find a "company" or "empresa" document
        const companyDoc = settingsList?.find(
          (s: any) => s.id === "company" || s.id === "empresa" || s.type === "company"
        );
        setCompany(companyDoc || null);
      } catch (e) {
        console.error("Erro ao carregar dados para documentos:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter((t) => {
      const matchCategory = activeCategory === "Todos" || t.category === activeCategory;
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat] = DOCUMENT_TEMPLATES.filter((t) => t.category === cat).length;
    }
    return counts;
  }, []);

  const handleGenerate = (resolvedBody: string) => {
    if (!generatingTemplate) return;
    setPrintData({
      resolvedBody,
      templateName: generatingTemplate.name,
      category: generatingTemplate.category,
    });
    setGeneratingTemplate(null);
  };

  // Show print view
  if (printData) {
    return (
      <DocumentPrintView
        resolvedBody={printData.resolvedBody}
        templateName={printData.templateName}
        category={printData.category}
        companyName={company?.name || "FleetOS"}
        generatedAt={new Date().toLocaleString("pt-BR")}
        generatedBy={currentUser?.displayName || "Operador"}
        onBack={() => setPrintData(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-primary">article</span>
            Central de Documentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {DOCUMENT_TEMPLATES.length} templates disponíveis em {CATEGORIES.length} categorias — geração automática com dados do sistema
          </p>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? "Todos" : cat)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                isActive
                  ? `${meta.bg} ${meta.border} ${meta.color} shadow-sm`
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? meta.color : "text-slate-400"}`}>
                {meta.icon}
              </span>
              <span className="text-[10px] font-bold leading-tight">{cat}</span>
              <span className={`text-lg font-black leading-none ${isActive ? meta.color : "text-slate-700"}`}>
                {countByCategory[cat]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Active Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        {activeCategory !== "Todos" && (
          <button
            onClick={() => setActiveCategory("Todos")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            {activeCategory}
          </button>
        )}
        <span className="text-xs text-slate-400 ml-auto">
          {filteredTemplates.length} documento{filteredTemplates.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-[48px] mb-3 block">search_off</span>
          <p className="text-sm font-semibold">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(activeCategory === "Todos" ? CATEGORIES : [activeCategory]).map((cat) => {
            const catTemplates = filteredTemplates.filter((t) => t.category === cat);
            if (catTemplates.length === 0) return null;
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 ${meta.bg} ${meta.border} border px-3 py-1.5 rounded-full`}>
                    <span className={`material-symbols-outlined text-[16px] ${meta.color}`}>{meta.icon}</span>
                    <span className={`text-xs font-black uppercase tracking-wide ${meta.color}`}>{cat}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">{catTemplates.length} documentos</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catTemplates.map((template) => (
                    <DocumentCard
                      key={template.id}
                      template={template}
                      meta={meta}
                      onGenerate={() => setGeneratingTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      {generatingTemplate && (
        <GenerateDocumentModal
          template={generatingTemplate}
          contracts={contracts}
          drivers={drivers}
          vehicles={vehicles}
          company={company}
          currentUserName={currentUser?.displayName || "Operador"}
          onClose={() => setGeneratingTemplate(null)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}

function DocumentCard({
  template,
  meta,
  onGenerate,
}: {
  template: DocumentTemplate;
  meta: { color: string; bg: string; border: string; icon: string };
  onGenerate: () => void;
}) {
  const varCount = (template.body.match(/\{\{/g) || []).length;
  const extraCount = template.extraFields?.length || 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined text-[20px] ${meta.color}`}>{template.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 leading-tight">{template.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="material-symbols-outlined text-[13px]">data_object</span>
          {varCount} variáveis
        </div>
        {extraCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="material-symbols-outlined text-[13px]">edit</span>
            {extraCount} campos extras
          </div>
        )}
        <button
          onClick={onGenerate}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm group-hover:shadow"
        >
          <span className="material-symbols-outlined text-[15px]">add_circle</span>
          Gerar
        </button>
      </div>
    </div>
  );
}
