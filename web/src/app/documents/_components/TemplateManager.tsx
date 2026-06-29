"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { DOCUMENT_TEMPLATES, CATEGORY_META } from "../_lib/templates";
import type { DocumentCategory, DocumentTemplate, DocumentTemplateVersion, DocumentExtraField } from "../_lib/types";
import { buildVariableMap, resolveVariables } from "../_lib/engine";

const TAG_GROUPS: { label: string; tags: string[] }[] = [
  {
    label: "Motorista",
    tags: [
      "driver_name", "driver_cpf", "driver_rg", "driver_cnh",
      "driver_cnh_category", "driver_cnh_expiration",
      "driver_condutax", "driver_condutax_expiration",
      "driver_phone", "driver_address",
    ],
  },
  {
    label: "Veículo",
    tags: [
      "vehicle_model", "vehicle_brand", "vehicle_year", "vehicle_plate",
      "vehicle_renavam", "vehicle_chassis", "vehicle_prefix", "vehicle_color",
      "vehicle_permit", "vehicle_permit_expiration", "vehicle_mileage",
    ],
  },
  {
    label: "Contrato",
    tags: [
      "contract_number", "contract_start_date", "contract_end_date",
      "contract_date", "daily_rate", "weekly_rate", "monthly_rate", "km_rodados",
    ],
  },
  {
    label: "Empresa",
    tags: ["company_name", "company_cnpj", "company_address", "company_phone", "company_email"],
  },
  {
    label: "Taxímetro",
    tags: ["taximeter_number", "taximeter_brand", "taximeter_calibration"],
  },
  {
    label: "Financeiro (Extenso)",
    tags: [
      "daily_rate_extenso", "weekly_rate_extenso", "monthly_rate_extenso",
      "contract_date_extenso", "caucao_amount_extenso", "debt_amount_extenso",
      "promissory_amount_extenso",
    ],
  },
];

const EXTRA_FIELD_TYPES = ["text", "textarea", "number", "date", "select"] as const;

type Props = {
  contracts: any[];
  drivers: any[];
  vehicles: any[];
  company: any;
  currentUserName: string;
};

const CATEGORIES_ORDER: DocumentCategory[] = [
  "Operação", "Financeiro", "Sinistros", "Compliance", "Patrimônio", "Encerramento",
];

export function TemplateManager({ contracts, drivers, vehicles, company, currentUserName }: Props) {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [templateVersions, setTemplateVersions] = useState<DocumentTemplateVersion[]>([]);
  const [customTemplates, setCustomTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editExtraFields, setEditExtraFields] = useState<DocumentExtraField[]>([]);
  const [changeLog, setChangeLog] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContractId, setPreviewContractId] = useState("");
  const [expandedTagGroup, setExpandedTagGroup] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showNewExtraField, setShowNewExtraField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<DocumentExtraField["type"]>("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // ─── New Template Modal ──────────────────────────────────────────────
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<DocumentCategory>("Operação");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  // ─── Load Data ───────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      getCollection("document_template_versions"),
      getCollection("custom_document_templates"),
    ]).then(([versions, customs]) => {
      setTemplateVersions(versions || []);
      setCustomTemplates(customs || []);
    });
  }, [getCollection]);

  // ─── All Templates (hardcoded + custom) ──────────────────────────────
  const allTemplates = useMemo(() => {
    return [...DOCUMENT_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId);

  const templateVersionList = useMemo(() => {
    return templateVersions
      .filter((v) => v.templateId === selectedTemplateId)
      .sort((a, b) => b.version - a.version);
  }, [templateVersions, selectedTemplateId]);

  const latestVersion: DocumentTemplateVersion | null = templateVersionList[0] || null;
  const versionStatus = latestVersion?.status;

  useEffect(() => {
    if (!selectedTemplate) return;
    if (latestVersion) {
      setEditBody(latestVersion.body);
      setEditExtraFields(latestVersion.extraFields || []);
    } else {
      setEditBody(selectedTemplate.body);
      setEditExtraFields(selectedTemplate.extraFields || []);
    }
    setChangeLog("");
    setShowPreview(false);
    setPreviewContractId("");
  }, [selectedTemplateId, latestVersion, selectedTemplate]);

  const filteredTemplates = useMemo(() => {
    const q = search.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [search, allTemplates]);

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, DocumentTemplate[]> = {};
    for (const cat of CATEGORIES_ORDER) {
      const items = filteredTemplates.filter((t) => t.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [filteredTemplates]);

  const insertTag = useCallback(
    (tag: string) => {
      const ta = textareaRef.current;
      if (!ta) {
        setEditBody((prev) => prev + `{{${tag}}}`);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = editBody.substring(0, start);
      const after = editBody.substring(end);
      const insertion = `{{${tag}}}`;
      setEditBody(before + insertion + after);
      requestAnimationFrame(() => {
        const pos = start + insertion.length;
        ta.selectionStart = pos;
        ta.selectionEnd = pos;
        ta.focus();
      });
    },
    [editBody]
  );

  // ─── Extra Fields ────────────────────────────────────────────────────
  const handleAddExtraField = () => {
    if (!newFieldKey || !newFieldLabel) return;
    setEditExtraFields((prev) => [
      ...prev,
      {
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        type: newFieldType,
        options: newFieldType === "select" ? newFieldOptions.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        required: newFieldRequired,
      },
    ]);
    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setNewFieldRequired(false);
    setShowNewExtraField(false);
  };

  const handleRemoveExtraField = (key: string) => {
    setEditExtraFields((prev) => prev.filter((f) => f.key !== key));
  };

  // ─── CRUD Operations ─────────────────────────────────────────────────
  const saveDraft = async () => {
    if (!selectedTemplate) return;
    if (!changeLog.trim()) {
      alert("Descreva brevemente a alteração (change log).");
      return;
    }
    setSaving(true);
    try {
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
      await addDocument("document_template_versions", {
        templateId: selectedTemplate.id,
        version: nextVersion,
        body: editBody,
        extraFields: editExtraFields,
        changeLog: changeLog.trim(),
        status: "draft",
        createdBy: currentUserName,
        createdAt: new Date().toISOString(),
      });
      setChangeLog("");
      const list = await getCollection("document_template_versions");
      setTemplateVersions(list || []);
    } catch (e) {
      console.error("Erro ao salvar rascunho:", e);
      alert("Erro ao salvar rascunho.");
    } finally {
      setSaving(false);
    }
  };

  const approveLatest = async () => {
    if (!latestVersion || latestVersion.status !== "draft") return;
    setSaving(true);
    try {
      await updateDocument("document_template_versions", latestVersion.id, {
        status: "approved",
        approvedBy: currentUserName,
        approvedAt: new Date().toISOString(),
      });
      const list = await getCollection("document_template_versions");
      setTemplateVersions(list || []);
    } catch (e) {
      console.error("Erro ao aprovar versão:", e);
      alert("Erro ao aprovar versão.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      alert("Preencha nome e corpo do template.");
      return;
    }
    setSaving(true);
    try {
      const id = `custom-${Date.now()}`;
      const newTemplate: DocumentTemplate = {
        id,
        name: newTemplateName.trim(),
        category: newTemplateCategory,
        description: newTemplateDescription.trim() || `Template personalizado: ${newTemplateName.trim()}`,
        icon: CATEGORY_META[newTemplateCategory].icon,
        body: newTemplateBody,
        extraFields: [],
      };
      await addDocument("custom_document_templates", {
        ...newTemplate,
        tenantId: currentUser?.tenantId || "default",
        createdBy: currentUserName,
        createdAt: new Date().toISOString(),
      });
      const list = await getCollection("custom_document_templates");
      setCustomTemplates(list || []);
      setShowNewTemplateModal(false);
      setNewTemplateName("");
      setNewTemplateCategory("Operação");
      setNewTemplateDescription("");
      setNewTemplateBody("");
      setSelectedTemplateId(id);
    } catch (e) {
      console.error("Erro ao criar template:", e);
      alert("Erro ao criar template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    setSaving(true);
    try {
      await deleteDocument("custom_document_templates", templateId);
      const list = await getCollection("custom_document_templates");
      setCustomTemplates(list || []);
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
      }
    } catch (e) {
      console.error("Erro ao excluir template:", e);
      alert("Erro ao excluir template.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveVersion = async (versionId: string) => {
    if (!confirm("Arquivar esta versão?")) return;
    setSaving(true);
    try {
      await updateDocument("document_template_versions", versionId, {
        status: "archived",
      });
      const list = await getCollection("document_template_versions");
      setTemplateVersions(list || []);
    } catch (e) {
      console.error("Erro ao arquivar versão:", e);
    } finally {
      setSaving(false);
    }
  };

  // ─── Preview ─────────────────────────────────────────────────────────
  const { currentUser } = useAuth();
  const previewContract = contracts.find((c) => c.id === previewContractId);
  const previewDriver = drivers.find((d) => d.id === previewContract?.driverId);
  const previewVehicle = vehicles.find((v) => v.id === previewContract?.vehicleId);

  const resolvedBody = useMemo(() => {
    if (!previewContract) return editBody;
    const vars = buildVariableMap(previewContract, previewDriver, previewVehicle, company, {});
    return resolveVariables(editBody, vars);
  }, [editBody, previewContract, previewDriver, previewVehicle, company]);

  const hasUnresolved = resolvedBody?.includes("⚠️[") ?? false;

  const isCustomTemplate = selectedTemplateId?.startsWith("custom-");

  return (
    <div className="flex gap-0 min-h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* ─── Left sidebar ──────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-3 border-b border-slate-200 space-y-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <button
            onClick={() => setShowNewTemplateModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Novo Template
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {CATEGORIES_ORDER.map((cat) => {
            const items = groupedTemplates[cat];
            if (!items) return null;
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className={`sticky top-0 z-10 px-3 py-1.5 ${meta.bg} flex items-center gap-2`}>
                  <span className={`material-symbols-outlined text-[14px] ${meta.color}`}>{meta.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${meta.color}`}>{cat}</span>
                  <span className={`text-[9px] font-bold ml-auto ${meta.color}`}>{items.length}</span>
                </div>
                {items.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  const tplVersion = templateVersions
                    .filter((v) => v.templateId === tpl.id)
                    .sort((a, b) => b.version - a.version)[0];
                  const isCustom = tpl.id.startsWith("custom-");
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`w-full text-left px-3 py-2.5 transition-colors border-l-2 ${
                        isSelected
                          ? "bg-white border-primary"
                          : "border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-800 truncate leading-tight flex-1">{tpl.name}</p>
                        {isCustom && (
                          <span className="text-[7px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">CUSTOM</span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{tpl.description}</p>
                      {tplVersion && (
                        <span className={`inline-block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          tplVersion.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : tplVersion.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          v{tplVersion.version} {tplVersion.status === "approved" ? "✓" : tplVersion.status === "draft" ? "⌛" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedTemplate ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] mb-3 block">description</span>
              <p className="text-sm font-semibold">Selecione um modelo para editar</p>
              <p className="text-xs mt-1">Clique em um modelo à esquerda ou crie um novo</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${CATEGORY_META[selectedTemplate.category].bg} border ${CATEGORY_META[selectedTemplate.category].border} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-[18px] ${CATEGORY_META[selectedTemplate.category].color}`}>{selectedTemplate.icon}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900 truncate">{selectedTemplate.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold ${CATEGORY_META[selectedTemplate.category].color}`}>{selectedTemplate.category}</span>
                    {versionStatus === "approved" && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                        v{latestVersion!.version} Aprovado
                      </span>
                    )}
                    {versionStatus === "draft" && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        v{latestVersion!.version} Rascunho
                      </span>
                    )}
                    {!latestVersion && (
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        Original
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCustomTemplate && (
                  <button
                    onClick={() => handleDeleteTemplate(selectedTemplateId!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Excluir
                  </button>
                )}
                <button
                  onClick={() => setShowVersionHistory((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Histórico
                </button>
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {showPreview ? "Ocultar Preview" : "Preview"}
                </button>
              </div>
            </div>

            {/* ── Toolbar + Editor ──────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">
              {/* ── Editor ────────────────────────────────────────────────── */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Tag inserter */}
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-2">Inserir Tag</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_GROUPS.map((group) => (
                      <div key={group.label} className="relative">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setExpandedTagGroup(expandedTagGroup === group.label ? null : group.label);
                          }}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-colors ${
                            expandedTagGroup === group.label
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {group.label}
                          <span className="ml-1 text-[8px] opacity-60">{group.tags.length}</span>
                        </button>
                        {expandedTagGroup === group.label && (
                          <div
                            className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-2 w-56 max-h-48 overflow-y-auto grid grid-cols-2 gap-1"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {group.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => {
                                  insertTag(tag);
                                  setExpandedTagGroup(null);
                                }}
                                className="text-[9px] font-mono text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 truncate"
                              >
                                {`{{${tag}}}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="flex-1 p-6 pt-4">
                  <textarea
                    ref={textareaRef}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full h-full min-h-[300px] text-xs font-mono leading-relaxed text-slate-800 bg-white border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    spellCheck={false}
                  />
                </div>

                {/* Extra Fields */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Campos Extras ({editExtraFields.length})
                    </p>
                    <button
                      onClick={() => setShowNewExtraField((v) => !v)}
                      className="flex items-center gap-1 text-[9px] font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px]">add</span>
                      Adicionar
                    </button>
                  </div>
                  {showNewExtraField && (
                    <div className="flex flex-wrap items-end gap-2 mb-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Key</label>
                        <input value={newFieldKey} onChange={(e) => setNewFieldKey(e.target.value)} placeholder="ex: protocol_number" className="w-full h-7 px-2 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:border-primary" />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Label</label>
                        <input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} placeholder="ex: Nº do Protocolo" className="w-full h-7 px-2 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:border-primary" />
                      </div>
                      <div className="w-20">
                        <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Tipo</label>
                        <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)} className="w-full h-7 px-1 text-[10px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary">
                          {EXTRA_FIELD_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      </div>
                      {newFieldType === "select" && (
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Opções (separadas por vírgula)</label>
                          <input value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)} placeholder="Opção A, Opção B" className="w-full h-7 px-2 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                      )}
                      <label className="flex items-center gap-1 text-[9px] text-slate-600 cursor-pointer pb-1">
                        <input type="checkbox" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} className="w-3 h-3" />
                        Obrigatório
                      </label>
                      <button onClick={handleAddExtraField} className="h-7 px-3 bg-primary text-white text-[9px] font-bold rounded-lg hover:bg-primary/90 transition-colors">
                        Adicionar
                      </button>
                    </div>
                  )}
                  {editExtraFields.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {editExtraFields.map((field) => (
                        <div key={field.key} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                          <span className="text-[9px] font-mono font-bold text-slate-600 min-w-[80px]">{field.key}</span>
                          <span className="text-[9px] text-slate-500 flex-1 truncate">{field.label}</span>
                          <span className="text-[8px] text-slate-400 bg-slate-100 px-1.5 rounded">{field.type}</span>
                          {field.required && <span className="text-[8px] text-red-500 font-bold">*</span>}
                          <button
                            onClick={() => handleRemoveExtraField(field.key)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview */}
                {showPreview && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-white">
                    <div className="mb-3">
                      <select
                        value={previewContractId}
                        onChange={(e) => setPreviewContractId(e.target.value)}
                        className="w-full max-w-xs h-8 px-3 text-[10px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Selecione um contrato para preview...</option>
                        {contracts.map((c) => {
                          const drv = drivers.find((d) => d.id === c.driverId);
                          const veh = vehicles.find((v) => v.id === c.vehicleId);
                          return (
                            <option key={c.id} value={c.id}>
                              {drv?.name || "?"} — {veh?.plate || "?"}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {previewContract && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {resolvedBody}
                        </pre>
                        {hasUnresolved && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            Existem variáveis não preenchidas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <div className="flex-1">
                    <input
                      value={changeLog}
                      onChange={(e) => setChangeLog(e.target.value)}
                      placeholder="Descreva a alteração (change log)..."
                      className="w-full max-w-md h-8 px-3 text-[10px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {versionStatus === "draft" && (
                      <button
                        onClick={approveLatest}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Aprovar Versão
                      </button>
                    )}
                    <button
                      onClick={saveDraft}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">save</span>
                      {saving ? "Salvando..." : "Salvar Rascunho"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Version History sidebar ─────────────────────────────────── */}
              {showVersionHistory && (
                <div className="w-56 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Versões</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{templateVersionList.length} registro(s)</p>
                  </div>
                  {templateVersionList.length === 0 && (
                    <div className="px-4 py-6 text-center text-[10px] text-slate-400">
                      Nenhuma versão salva ainda.
                    </div>
                  )}
                  <div className="divide-y divide-slate-100">
                    {templateVersionList.map((ver) => (
                      <div key={ver.id} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">v{ver.version}</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              ver.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : ver.status === "draft"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {ver.status === "approved" ? "Aprovado" : ver.status === "draft" ? "Rascunho" : "Arquivado"}
                            </span>
                            {ver.status !== "archived" && (
                              <button
                                onClick={() => handleArchiveVersion(ver.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                                title="Arquivar"
                              >
                                <span className="material-symbols-outlined text-[12px]">archive</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{ver.changeLog}</p>
                        <p className="text-[8px] text-slate-400 mt-1">
                          {ver.createdBy} · {new Date(ver.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── New Template Modal ─────────────────────────────────────────────── */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Novo Template</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Crie um template personalizado do zero</p>
              </div>
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Nome do Template</label>
                <input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ex: Termo de Responsabilidade por Equipamento"
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Categoria</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value as DocumentCategory)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES_ORDER.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Descrição</label>
                  <input
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Breve descrição..."
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Corpo do Template</label>
                <textarea
                  value={newTemplateBody}
                  onChange={(e) => setNewTemplateBody(e.target.value)}
                  placeholder="Cole ou digite o corpo do template aqui. Use {{variavel}} para campos dinâmicos."
                  rows={10}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  spellCheck={false}
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Variáveis Disponíveis</p>
                <div className="flex flex-wrap gap-1">
                  {TAG_GROUPS.flatMap((g) => g.tags).map((tag) => (
                    <span key={tag} className="text-[8px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                      {`{{${tag}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="px-4 py-2 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={saving || !newTemplateName.trim() || !newTemplateBody.trim()}
                className="px-4 py-2 text-[10px] font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-40 rounded-lg transition-colors"
              >
                {saving ? "Criando..." : "Criar Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
