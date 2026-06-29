"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, Save, PlusCircle, Trash, AlertTriangle, 
  Clock, CheckCircle, HelpCircle, FilePlus, ChevronRight 
} from "lucide-react";

interface ContractTemplatesSettingsProps {
  driversList: any[];
}

export function ContractTemplatesSettings({ driversList }: ContractTemplatesSettingsProps) {
  const { getCollection, addDocument, updateDocument, deleteDocument, currentUser } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<"templates" | "aditivos" | "alerts">("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("Locação");
  const [isSaving, setIsSaving] = useState(false);

  // Seeding/Mock Target for Preview
  const [contracts, setContracts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedPreviewContractId, setSelectedPreviewContractId] = useState("");

  // Addendums (Aditivos) State
  const [aditivos, setAditivos] = useState<any[]>([]);
  const [selectedContractForAditivo, setSelectedContractForAditivo] = useState("");
  const [aditivoType, setAditivoType] = useState("Vigência");
  const [aditivoNotes, setAditivoNotes] = useState("");

  // Alerts State
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [alertDaysBefore, setAlertDaysBefore] = useState(7);
  const [alertChannel, setAlertChannel] = useState("sms_whatsapp");
  const [alertRoleToNotify, setAlertRoleToNotify] = useState("role-operator");

  // Tag helper configuration
  const modalTags = [
    { label: "Nome Motorista", tag: "driver_name", desc: "Nome completo do cliente" },
    { label: "CPF Motorista", tag: "driver_cpf", desc: "CPF formatado" },
    { label: "CNH Motorista", tag: "driver_cnh", desc: "Número da habilitação" },
    { label: "Placa Veículo", tag: "vehicle_plate", desc: "Placa do carro locado" },
    { label: "Modelo Veículo", tag: "vehicle_model", desc: "Modelo do carro" },
    { label: "Marca Veículo", tag: "vehicle_brand", desc: "Marca do carro" },
    { label: "Diária Contrato", tag: "daily_rate", desc: "Valor da taxa diária" },
    { label: "Número Contrato", tag: "contract_number", desc: "ID abreviado do contrato" },
    { label: "Data Contrato", tag: "contract_date", desc: "Data de emissão" },
  ];

  const loadAll = async () => {
    try {
      const [tplList, conList, vehList, aditList, ruleList] = await Promise.all([
        getCollection("contract_templates"),
        getCollection("contracts"),
        getCollection("vehicles"),
        getCollection("contract_aditivos").catch(() => []),
        getCollection("saas_alert_rules").catch(() => [])
      ]);
      setTemplates(tplList || []);
      setContracts(conList || []);
      setVehicles(vehList || []);
      setAditivos(aditList || []);
      setAlertRules(ruleList || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (activeTemplate) {
      setTemplateBody(activeTemplate.body || "");
      setTemplateName(activeTemplate.name || "");
      setTemplateCategory(activeTemplate.category || "Locação");
    } else {
      setTemplateBody("");
      setTemplateName("");
      setTemplateCategory("Locação");
    }
  }, [selectedTemplateId, activeTemplate]);

  // Insert tag helper
  const insertTag = (tag: string) => {
    const textarea = document.getElementById("admin-template-textarea") as HTMLTextAreaElement;
    if (!textarea) {
      setTemplateBody(prev => prev + `{{${tag}}}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    setTemplateBody(before + `{{${tag}}}` + after);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tag.length + 4;
      textarea.focus();
    }, 50);
  };

  // Compile variable map for real-time preview
  const compiledPreview = useMemo(() => {
    if (!templateBody) return "";
    const previewContract = contracts.find(c => c.id === selectedPreviewContractId);
    const previewDriver = previewContract ? driversList.find(d => d.id === previewContract.driverId) : null;
    const previewVehicle = previewContract ? vehicles.find(v => v.id === previewContract.vehicleId) : null;

    const todayStr = new Date().toLocaleDateString("pt-BR");
    let compiled = templateBody
      .replace(/{{contract_date}}/g, todayStr);

    if (previewDriver) {
      compiled = compiled
        .replace(/{{driver_name}}/g, previewDriver.name)
        .replace(/{{driver_cpf}}/g, previewDriver.cpf || "---.---.----##")
        .replace(/{{driver_cnh}}/g, previewDriver.cnhNumber || "---------");
    } else {
      compiled = compiled
        .replace(/{{driver_name}}/g, "NOME_DO_MOTORISTA_PREVIA")
        .replace(/{{driver_cpf}}/g, "000.000.000-00")
        .replace(/{{driver_cnh}}/g, "0000000000");
    }

    if (previewVehicle) {
      compiled = compiled
        .replace(/{{vehicle_plate}}/g, previewVehicle.plate)
        .replace(/{{vehicle_model}}/g, previewVehicle.model)
        .replace(/{{vehicle_brand}}/g, previewVehicle.brand);
    } else {
      compiled = compiled
        .replace(/{{vehicle_plate}}/g, "ABC-1234")
        .replace(/{{vehicle_model}}/g, "Sedan Exemplo")
        .replace(/{{vehicle_brand}}/g, "Marca Exemplo");
    }

    if (previewContract) {
      compiled = compiled
        .replace(/{{daily_rate}}/g, previewContract.dailyRate.toString())
        .replace(/{{contract_number}}/g, previewContract.id.slice(0, 8).toUpperCase());
    } else {
      compiled = compiled
        .replace(/{{daily_rate}}/g, "120.00")
        .replace(/{{contract_number}}/g, "CONTRATO_EXEMPLO");
    }

    return compiled;
  }, [templateBody, selectedPreviewContractId, contracts, driversList, vehicles]);

  // Create new template
  const handleCreateNewTemplate = async () => {
    const nameInput = prompt("Digite o nome do novo modelo de documento:");
    if (!nameInput) return;
    setIsSaving(true);
    try {
      const added = await addDocument("contract_templates", {
        name: nameInput,
        category: "Locação",
        body: "Texto base do novo modelo..."
      });
      alert("Modelo criado com sucesso!");
      await loadAll();
      setSelectedTemplateId(added.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Save template edits
  const handleSaveTemplate = async () => {
    if (!selectedTemplateId) return;
    setIsSaving(true);
    try {
      await updateDocument("contract_templates", selectedTemplateId, {
        name: templateName,
        category: templateCategory,
        body: templateBody
      });
      alert("Alterações salvas com sucesso!");
      await loadAll();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;
    if (!confirm("Tem certeza que deseja remover este modelo de documento?")) return;
    setIsSaving(true);
    try {
      await deleteDocument("contract_templates", selectedTemplateId);
      alert("Modelo removido.");
      setSelectedTemplateId("");
      await loadAll();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Addendums Creation
  const handleAddAditivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractForAditivo) {
      alert("Selecione um contrato.");
      return;
    }
    const contract = contracts.find(c => c.id === selectedContractForAditivo);
    const driver = contract ? driversList.find(d => d.id === contract.driverId) : null;
    const vehicle = contract ? vehicles.find(v => v.id === contract.vehicleId) : null;

    const aditivoBody = `ADITIVO DE CONTRATO DE LOCAÇÃO - TIPO: ${aditivoType.toUpperCase()}
Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}
Contrato Base ID: ${contract.id.slice(0, 8).toUpperCase()}
Locatário/Motorista: ${driver ? driver.name : "N/A"}
Veículo Placa: ${vehicle ? vehicle.plate : "N/A"}

DETALHES DO ADITIVO:
${aditivoNotes || "Alterações gerais acordadas entre as partes."}

Assinatura: _____________________________
Assinatura Locatário: _____________________`;

    try {
      await addDocument("contract_aditivos", {
        contractId: selectedContractForAditivo,
        driverName: driver ? driver.name : "N/A",
        vehiclePlate: vehicle ? vehicle.plate : "N/A",
        type: aditivoType,
        notes: aditivoNotes,
        body: aditivoBody,
        issuedBy: currentUser?.displayName || "Operador",
        issuedAt: new Date().toISOString()
      });
      alert("Termo Aditivo gerado e logado com sucesso!");
      setAditivoNotes("");
      setSelectedContractForAditivo("");
      loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  // Alert Policy creation
  const handleAddAlertRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDocument("saas_alert_rules", {
        daysBefore: alertDaysBefore,
        channel: alertChannel,
        roleToNotify: alertRoleToNotify,
        active: true
      });
      alert("Regra de alerta de vencimento ativada!");
      loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "templates" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Modelos de Contratos
          </button>
          <button
            onClick={() => setActiveSubTab("aditivos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "aditivos" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Termos Aditivos (Aditivos)
          </button>
          <button
            onClick={() => setActiveSubTab("alerts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "alerts" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Alertas & Validade
          </button>
        </div>

        {activeSubTab === "templates" && (
          <button
            onClick={handleCreateNewTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg active:scale-95 transition-all shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Modelo</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: TEMPLATES MANAGER */}
      {activeSubTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Templates list sidebar */}
          <div className="lg:col-span-1 border border-outline-variant rounded-xl overflow-hidden bg-slate-50/50 flex flex-col h-[500px]">
            <div className="p-3 border-b bg-white">
              <span className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider">Modelos Disponíveis</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-150">
              {templates.length === 0 ? (
                <p className="p-4 italic text-slate-400 text-xs">Nenhum modelo cadastrado.</p>
              ) : (
                templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`w-full text-left p-3 hover:bg-slate-100 transition-all flex flex-col gap-0.5 border-l-2 ${
                      selectedTemplateId === t.id ? "bg-white border-primary" : "border-transparent"
                    }`}
                  >
                    <span className="font-bold text-slate-800 leading-tight">{t.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">{t.category}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Edit & Preview area */}
          <div className="lg:col-span-3 space-y-4 min-w-0">
            {selectedTemplateId ? (
              <div className="space-y-4">
                
                {/* Meta details inputs */}
                <div className="grid grid-cols-2 gap-3 bg-white border border-outline-variant p-4 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome do Documento</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">Categoria / Módulo</label>
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                    >
                      <option value="Locação">Locação / Contratos</option>
                      <option value="Recibo">Recibos / Finanças</option>
                      <option value="Notificação">Notificações / Infrações</option>
                      <option value="Declaração">Declarações / Regulação</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Tag helper shelf */}
                <div className="bg-white border border-outline-variant rounded-xl p-4 space-y-2">
                  <span className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Inserir Variáveis Clicáveis</span>
                  <div className="flex flex-wrap gap-1.5">
                    {modalTags.map(t => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag(t.tag)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold rounded-lg transition-all"
                        title={t.desc}
                      >
                        {t.label} <code className="text-[8px] opacity-70 ml-0.5">{`{{${t.tag}}}`}</code>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor & Live side-by-side preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider">Texto Base do Modelo</label>
                    <textarea
                      id="admin-template-textarea"
                      rows={14}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      className="w-full p-3 bg-white border border-outline-variant rounded-xl text-xs font-mono outline-none focus:border-primary leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider">Prévia do Layout Interpolado</label>
                      
                      {/* Seeding target selector */}
                      <select
                        value={selectedPreviewContractId}
                        onChange={(e) => setSelectedPreviewContractId(e.target.value)}
                        className="h-6 px-2 text-[9px] border border-outline-variant rounded bg-white outline-none"
                      >
                        <option value="">Selecione um contrato teste...</option>
                        {contracts.map(c => {
                          const drv = driversList.find(d => d.id === c.driverId);
                          return (
                            <option key={c.id} value={c.id}>Locação: {drv ? drv.name : c.id.slice(0,6)}</option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="w-full h-[278px] p-4 bg-white border border-outline-variant rounded-xl text-[10px] font-mono leading-relaxed whitespace-pre-wrap overflow-y-auto text-slate-700">
                      {compiledPreview || <span className="text-slate-400 italic">Preencha o modelo para visualizar a prévia.</span>}
                    </div>
                  </div>
                </div>

                {/* Footer Save & Delete controls */}
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={handleDeleteTemplate}
                    className="flex items-center gap-1 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-lg border border-red-200"
                  >
                    <Trash className="w-4 h-4" />
                    <span>Excluir Modelo</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveTemplate}
                    className="flex items-center gap-1.5 px-5 py-2 bg-primary text-on-primary font-bold rounded-lg shadow active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-400 italic">
                Selecione um modelo de contrato na barra lateral para começar a configurar.
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: ADDENDUMS MANAGER (ADITIVOS) */}
      {activeSubTab === "aditivos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Addendum Generation Form */}
          <div className="lg:col-span-1 bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-primary" />
                <span>Gerar Termo Aditivo</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Adicionar termos extraordinários a locação</p>
            </div>

            <form onSubmit={handleAddAditivo} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Contrato Relacionado</label>
                <select
                  value={selectedContractForAditivo}
                  onChange={(e) => setSelectedContractForAditivo(e.target.value)}
                  required
                  className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                >
                  <option value="">Selecione o contrato...</option>
                  {contracts.map(c => {
                    const drv = driversList.find(d => d.id === c.driverId);
                    return (
                      <option key={c.id} value={c.id}>Locação: {drv ? drv.name : c.id.slice(0,8)}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Tipo de Alteração</label>
                <select
                  value={aditivoType}
                  onChange={(e) => setAditivoType(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                >
                  <option value="Vigência">Prorrogação de Vigência</option>
                  <option value="Preço">Reajuste de Diária/Tarifas</option>
                  <option value="Restrições">Alteração de Regras / Limites de KM</option>
                  <option value="Substituição">Substituição de Veículo Vinculado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Cláusulas e Anotações do Aditivo</label>
                <textarea
                  rows={5}
                  value={aditivoNotes}
                  required
                  onChange={(e) => setAditivoNotes(e.target.value)}
                  placeholder="Ex: Fica acordado entre as partes a prorrogação do vencimento do contrato original por mais 30 dias..."
                  className="w-full p-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-950 transition-colors text-xs active:scale-95"
              >
                Efetivar e Registrar Aditivo
              </button>
            </form>
          </div>

          {/* Registered Addendums history log */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-outline-variant">
                <span className="font-extrabold text-[10px] text-slate-650 uppercase tracking-wider">Histórico de Aditivos de Contrato</span>
              </div>
              <div className="divide-y divide-slate-150">
                {aditivos.length === 0 ? (
                  <p className="p-4 italic text-slate-450">Nenhum termo aditivo registrado no sistema.</p>
                ) : (
                  aditivos.map(adit => (
                    <div key={adit.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{adit.driverName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-50 text-indigo-650 border border-indigo-150">
                            {adit.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Ref Contrato: {adit.contractId ? adit.contractId.slice(0, 8).toUpperCase() : "N/A"} · Veículo: {adit.vehiclePlate}
                        </p>
                        <p className="text-[10px] text-slate-600 bg-slate-50 p-2.5 border rounded-lg italic mt-1.5 whitespace-pre-wrap leading-relaxed">
                          {adit.notes}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          Emitido por {adit.issuedBy} em {new Date(adit.issuedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          const w = window.open("", "_blank");
                          if (w) {
                            w.document.write(`
                              <html>
                                <head><title>Aditivo de Locação | FleetOS</title></head>
                                <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; white-space: pre-wrap;">${adit.body}</body>
                              </html>
                            `);
                            w.document.close();
                            w.print();
                          }
                        }}
                        className="p-1 text-slate-450 hover:text-slate-700 border rounded-lg border-slate-200"
                        title="Imprimir Termo Aditivo"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: ALERTS POLICY MANAGER */}
      {activeSubTab === "alerts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Rule creator */}
          <div className="lg:col-span-1 bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Nova Regra de Alerta</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Notificar proximidade de vencimento</p>
            </div>

            <form onSubmit={handleAddAlertRule} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Dias Antecipados</label>
                <input
                  type="number"
                  value={alertDaysBefore}
                  required
                  onChange={(e) => setAlertDaysBefore(parseInt(e.target.value) || 7)}
                  className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Canal de Envio</label>
                <select
                  value={alertChannel}
                  onChange={(e) => setAlertChannel(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                >
                  <option value="sms_whatsapp">Notificação SMS & WhatsApp</option>
                  <option value="system">Notificação Interna (Sistema)</option>
                  <option value="email">Notificação por E-mail Corporativo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Perfil a Notificar</label>
                <select
                  value={alertRoleToNotify}
                  onChange={(e) => setAlertRoleToNotify(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs"
                >
                  <option value="role-operator">Operadores de Frota</option>
                  <option value="role-driver">Motorista Locatário</option>
                  <option value="role-admin">Administradores Gerais</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-950 transition-colors text-xs active:scale-95"
              >
                Ativar Política de Alerta
              </button>
            </form>
          </div>

          {/* Active rules list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-xs">
              <h4 className="font-extrabold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">Políticas de Alerta de Contrato Ativas</h4>
              
              <div className="space-y-3">
                {alertRules.length === 0 ? (
                  <div className="flex items-center gap-1.5 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 italic">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Nenhum alerta de expiração ativo. O sistema usará os dias padrão (7 dias).</span>
                  </div>
                ) : (
                  alertRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">
                          Aviso de Vencimento com {rule.daysBefore} dias de antecedência
                        </p>
                        <p className="text-[10px] text-slate-450 font-mono">
                          Canal: {rule.channel === "sms_whatsapp" ? "WhatsApp/SMS" : rule.channel === "system" ? "Interno" : "E-mail"} · Destinatário: {rule.roleToNotify === "role-operator" ? "Operador" : "Locatário"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          Ativa
                        </span>
                        
                        <button
                          onClick={async () => {
                            if (!confirm("Remover esta regra de alerta?")) return;
                            try {
                              await deleteDocument("saas_alert_rules", rule.id);
                              loadAll();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remover regra"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
