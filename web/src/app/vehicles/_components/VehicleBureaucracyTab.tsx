"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Printer, Save, CheckCircle, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface VehicleBureaucracyTabProps {
  selectedVehicle: any;
  contracts: any[];
  drivers: any[];
  isReadOnly: (vehicle: any) => boolean;
}

export function VehicleBureaucracyTab({
  selectedVehicle,
  contracts,
  drivers,
  isReadOnly
}: VehicleBureaucracyTabProps) {
  const { getCollection, addDocument, updateDocument, currentUser } = useAuth();
  const readOnly = isReadOnly(selectedVehicle);

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [emittedContent, setEmittedContent] = useState("");
  const [printedDocs, setPrintedDocs] = useState<any[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch templates & printed logs
  const loadTemplatesAndLogs = async () => {
    try {
      const [tpls, logs] = await Promise.all([
        getCollection("contract_templates"),
        getCollection("printed_documents")
      ]);
      setTemplates(tpls || []);
      
      const filteredLogs = (logs || [])
        .filter((l: any) => l.vehicleId === selectedVehicle.id)
        .sort((a: any, b: any) => b.printedAt.localeCompare(a.printedAt));
      setPrintedDocs(filteredLogs);
    } catch (e) {
      console.error("Erro ao carregar dados de burocracia", e);
    }
  };

  useEffect(() => {
    loadTemplatesAndLogs();
  }, [selectedVehicle]);

  // Set default body when template is chosen
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (activeTemplate) {
      setTemplateBody(activeTemplate.body || "");
      setEmittedContent("");
    }
  }, [selectedTemplateId, activeTemplate]);

  const modalTags = [
    { label: "Nome Motorista", tag: "driver_name" },
    { label: "CPF Motorista", tag: "driver_cpf" },
    { label: "CNH Motorista", tag: "driver_cnh" },
    { label: "Placa Veículo", tag: "vehicle_plate" },
    { label: "Modelo Veículo", tag: "vehicle_model" },
    { label: "Marca Veículo", tag: "vehicle_brand" },
    { label: "Cor Veículo", tag: "vehicle_color" },
    { label: "Ano Veículo", tag: "vehicle_year" },
    { label: "Diária Contrato", tag: "daily_rate" },
    { label: "Número Contrato", tag: "contract_number" },
    { label: "Data Contrato", tag: "contract_date" },
  ];

  const insertTag = (tag: string) => {
    const textarea = document.getElementById("template-textarea") as HTMLTextAreaElement;
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

  // 2. Active contract for this vehicle
  const activeContract = useMemo(() => {
    return contracts.find(c => c.vehicleId === selectedVehicle.id && c.status === "active");
  }, [contracts, selectedVehicle]);

  const activeDriver = useMemo(() => {
    if (!activeContract) return null;
    return drivers.find(d => d.id === activeContract.driverId);
  }, [activeContract, drivers]);
  const compiledPreview = useMemo(() => {
    if (!templateBody) return "";
    const todayStr = new Date().toLocaleDateString("pt-BR");
    let compiled = templateBody
      .replace(/{{vehicle_model}}/g, selectedVehicle.model || "N/A")
      .replace(/{{vehicle_brand}}/g, selectedVehicle.brand || "N/A")
      .replace(/{{vehicle_plate}}/g, selectedVehicle.plate || "N/A")
      .replace(/{{vehicle_color}}/g, selectedVehicle.color || "N/A")
      .replace(/{{vehicle_year}}/g, selectedVehicle.year ? selectedVehicle.year.toString() : "N/A")
      .replace(/{{contract_date}}/g, todayStr);

    if (activeDriver) {
      compiled = compiled
        .replace(/{{driver_name}}/g, activeDriver.name)
        .replace(/{{driver_cpf}}/g, activeDriver.cpf || "N/A")
        .replace(/{{driver_cnh}}/g, activeDriver.cnhNumber || "N/A");
    } else {
      compiled = compiled
        .replace(/{{driver_name}}/g, "NOME_DO_MOTORISTA_AUSENTE")
        .replace(/{{driver_cpf}}/g, "---.---.---.---")
        .replace(/{{driver_cnh}}/g, "---------");
    }

    if (activeContract) {
      compiled = compiled
        .replace(/{{daily_rate}}/g, activeContract.dailyRate.toString())
        .replace(/{{contract_number}}/g, activeContract.id.slice(0, 8).toUpperCase());
    }

    return compiled;
  }, [templateBody, selectedVehicle, activeDriver, activeContract]);
  // 3. Expiration Queue (Fila de Vencimentos) for this vehicle
  const expirations = useMemo(() => {
    const today = new Date();
    const list = [];

    // CRLV Licensing
    if (selectedVehicle.licensingExpiration) {
      const expDate = new Date(selectedVehicle.licensingExpiration);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      list.push({
        name: "Licenciamento Anual (CRLV)",
        date: new Date(selectedVehicle.licensingExpiration).toLocaleDateString("pt-BR"),
        status: diffDays < 0 ? "expired" : diffDays <= 30 ? "warning" : "ok",
        label: diffDays < 0 ? "Vencido" : diffDays <= 30 ? `Vence em ${diffDays}d` : "Regular"
      });
    }

    // Permit Expiration
    if (selectedVehicle.permitExpiration) {
      const expDate = new Date(selectedVehicle.permitExpiration);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      list.push({
        name: "Alvará Municipal / Outorga",
        date: new Date(selectedVehicle.permitExpiration).toLocaleDateString("pt-BR"),
        status: diffDays < 0 ? "expired" : diffDays <= 30 ? "warning" : "ok",
        label: diffDays < 0 ? "Vencido" : diffDays <= 30 ? `Vence em ${diffDays}d` : "Regular"
      });
    }

    // Insurance Policy (Apólice Sinistros)
    if (selectedVehicle.insuranceExpiration) {
      const expDate = new Date(selectedVehicle.insuranceExpiration);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      list.push({
        name: "Apólice de Seguro Frota",
        date: new Date(selectedVehicle.insuranceExpiration).toLocaleDateString("pt-BR"),
        status: diffDays < 0 ? "expired" : diffDays <= 30 ? "warning" : "ok",
        label: diffDays < 0 ? "Vencido" : diffDays <= 30 ? `Vence em ${diffDays}d` : "Regular"
      });
    }

    // Contract Expiry (if active)
    if (activeContract && activeContract.endDate) {
      const expDate = new Date(activeContract.endDate);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      list.push({
        name: "Contrato de Locação Vigente",
        date: new Date(activeContract.endDate).toLocaleDateString("pt-BR"),
        status: diffDays < 0 ? "expired" : diffDays <= 15 ? "warning" : "ok",
        label: diffDays < 0 ? "Expirado" : diffDays <= 15 ? `Expira em ${diffDays}d` : "Ativo"
      });
    }

    return list;
  }, [selectedVehicle, activeContract]);

  // 4. Save template text
  const handleSaveTemplateBody = async () => {
    if (!selectedTemplateId || !activeTemplate) return;
    setIsSaving(true);
    try {
      await updateDocument("contract_templates", selectedTemplateId, {
        body: templateBody
      });
      alert("Modelo de documento atualizado com sucesso!");
      setIsEditingTemplate(false);
      await loadTemplatesAndLogs();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar alterações no modelo.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Compile template variables
  const handleEmitDocument = () => {
    if (!activeTemplate) return;
    const todayStr = new Date().toLocaleDateString("pt-BR");
    
    let compiled = templateBody
      .replace(/{{vehicle_model}}/g, selectedVehicle.model || "N/A")
      .replace(/{{vehicle_brand}}/g, selectedVehicle.brand || "N/A")
      .replace(/{{vehicle_plate}}/g, selectedVehicle.plate || "N/A")
      .replace(/{{vehicle_color}}/g, selectedVehicle.color || "N/A")
      .replace(/{{vehicle_year}}/g, selectedVehicle.year ? selectedVehicle.year.toString() : "N/A")
      .replace(/{{contract_date}}/g, todayStr);

    if (activeDriver) {
      compiled = compiled
        .replace(/{{driver_name}}/g, activeDriver.name)
        .replace(/{{driver_cpf}}/g, activeDriver.cpf || "N/A")
        .replace(/{{driver_cnh}}/g, activeDriver.cnhNumber || "N/A");
    } else {
      compiled = compiled
        .replace(/{{driver_name}}/g, "NOME_DO_MOTORISTA_AUSENTE")
        .replace(/{{driver_cpf}}/g, "---.---.---.---")
        .replace(/{{driver_cnh}}/g, "---------");
    }

    if (activeContract) {
      compiled = compiled
        .replace(/{{daily_rate}}/g, activeContract.dailyRate.toString())
        .replace(/{{contract_number}}/g, activeContract.id.slice(0, 8).toUpperCase());
    }

    setEmittedContent(compiled);
  };

  // 6. Print & Register log
  const handlePrintAndRegister = async () => {
    if (!activeTemplate) return;
    
    // Open standard print tab
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impressão | FleetOS</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .content { white-space: pre-wrap; margin-bottom: 50px; font-size: 14px; }
              .signature { margin-top: 60px; display: flex; justify-content: space-between; }
              .sig-line { border-top: 1px solid #111; width: 45%; text-align: center; padding-top: 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>FLEETOS - CONTROLE DE DOCUMENTOS DE FROTA</h2>
              <p>Emissão Oficial Automatizada</p>
            </div>
            <div class="content">${emittedContent}</div>
            <div class="signature">
              <div class="sig-line">FLEETOS ADMINISTRADORA</div>
              <div class="sig-line">${(activeDriver ? activeDriver.name : "MOTORISTA / LOCATÁRIO").toUpperCase()}</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    // Register log in database
    try {
      await addDocument("printed_documents", {
        driverId: activeDriver ? activeDriver.id : "",
        driverName: activeDriver ? activeDriver.name : "N/A",
        vehicleId: selectedVehicle.id,
        vehiclePlate: selectedVehicle.plate,
        templateId: activeTemplate.id,
        templateName: activeTemplate.name,
        printedAt: new Date().toISOString(),
        printedBy: currentUser?.displayName || "Operador",
        body: emittedContent
      });
      loadTemplatesAndLogs();
    } catch (e) {
      console.error("Erro ao registrar log de impressão:", e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-800">
      
      {/* Left Col (Inputs, Editors, Generation) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Document Generator Box */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              <span>Gerador de Contratos & Burocracias</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">Variáveis auto-preenchidas</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-outline mb-1">Modelo de Documento</label>
              <div className="flex gap-2">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="flex-1 h-9 px-3 bg-slate-50 border border-outline-variant rounded text-xs outline-none focus:border-primary font-bold text-slate-700"
                >
                  <option value="">Selecione um modelo...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
                
                {selectedTemplateId && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                    className="px-3 h-9 bg-slate-100 border border-slate-200 text-slate-750 font-bold rounded hover:bg-slate-200 active:scale-95 transition-all text-xs"
                  >
                    {isEditingTemplate ? "Ver Gerador" : "Editar Modelo"}
                  </button>
                )}
              </div>
            </div>

            {/* Editing mode textarea */}
            {isEditingTemplate && selectedTemplateId && (
              <div className="space-y-4 p-4 bg-slate-50 border border-outline-variant rounded-xl">
                
                {/* 1. Allowed Tags Rack */}
                <div className="space-y-1.5 p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Biblioteca de Tags (Clique para inserir)</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {modalTags.map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag(t.tag)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-[9px] font-bold"
                        title={`Inserir {{${t.tag}}}`}
                      >
                        {t.label} <code className="text-[8px] bg-slate-200/60 text-slate-600 px-1 ml-0.5 rounded">{`{{${t.tag}}}`}</code>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Textarea and Live Preview side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider">Texto do Modelo</label>
                    <textarea
                      id="template-textarea"
                      rows={12}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      placeholder="Comece a digitar seu contrato aqui..."
                      className="w-full p-3 bg-white border border-outline-variant rounded-lg text-xs font-mono outline-none focus:border-primary leading-relaxed"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider">Prévia em Tempo Real (Com Dados)</label>
                    <div className="w-full h-[218px] p-3 bg-white border border-outline-variant rounded-lg text-[10px] font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto text-slate-700">
                      {compiledPreview || <span className="text-slate-400 italic">Digite alguma coisa para ver a prévia...</span>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingTemplate(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveTemplateBody}
                    className="px-4 py-1.5 bg-primary text-on-primary font-bold rounded flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Salvando..." : "Salvar Modelo"}</span>
                  </button>
                </div>

              </div>
            )}

            {/* Generation Preview box */}
            {!isEditingTemplate && selectedTemplateId && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleEmitDocument}
                  className="w-full h-9 bg-slate-900 text-white font-bold rounded hover:bg-slate-950 transition-all active:scale-95 text-xs"
                >
                  Mesclar Variáveis do Veículo & Gerar Prévia
                </button>

                {emittedContent && (
                  <div className="space-y-3 border-2 border-slate-900 rounded-xl p-4 bg-white">
                    <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                      <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Visualização para Impressão</span>
                      <button
                        type="button"
                        onClick={handlePrintAndRegister}
                        className="bg-primary text-on-primary font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 shadow active:scale-95 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir & Logar</span>
                      </button>
                    </div>
                    <div className="bg-slate-50 border p-3 rounded font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {emittedContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Printed logs history list */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-outline-variant">
            <span className="font-extrabold text-[10px] text-slate-650 uppercase tracking-wider">Histórico de Impressões (Logs)</span>
          </div>
          <div className="divide-y divide-slate-150">
            {printedDocs.length === 0 ? (
              <p className="p-4 text-xs text-on-surface-variant italic">Nenhum termo ou contrato impresso para este carro.</p>
            ) : (
              printedDocs.map((log) => (
                <div key={log.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                  <div>
                    <p className="font-bold text-slate-800">{log.templateName}</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      Impresso por: {log.printedBy} em {new Date(log.printedAt).toLocaleString("pt-BR")}
                    </p>
                    {log.driverName && (
                      <p className="text-[9px] text-indigo-650 font-semibold mt-0.5">Motorista: {log.driverName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head><title>Re-impressão | FleetOS</title></head>
                            <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${log.body}</body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="p-1 rounded text-slate-450 hover:text-slate-700 border border-slate-200"
                    title="Re-imprimir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Col (Active contract, Expirations timeline) */}
      <div className="space-y-6">
        
        {/* Active Contract Status card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-black text-slate-900 uppercase tracking-wider mb-3">Vínculo Contratual Vigente</h4>
          {activeContract ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">Locação Ativa</p>
                  <p className="text-[9px] mt-0.5 font-mono">ID: {activeContract.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-650">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-450">Motorista:</span>
                  <span className="font-bold text-slate-800">{activeDriver ? activeDriver.name : "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-450">Taxa Diária:</span>
                  <span className="font-bold text-slate-800">R$ {activeContract.dailyRate.toLocaleString("pt-BR")}/dia</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-450">Início do Contrato:</span>
                  <span className="font-mono text-slate-700">{new Date(activeContract.startDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100/60 border border-slate-200 rounded-lg p-3 italic">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Este veículo não está alugado no momento.</span>
            </div>
          )}
        </div>

        {/* Expirations Deadlines list */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="font-black text-slate-900 uppercase tracking-wider">Fila de Vencimentos do Veículo</h4>
          <div className="space-y-2.5">
            {expirations.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">Sem vencimentos regulados.</p>
            ) : (
              expirations.map((exp, idx) => (
                <div key={idx} className="flex items-start justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/50 text-[11px]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-750">{exp.name}</p>
                    <p className="text-[10px] text-slate-450">Vence: {exp.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    exp.status === "expired" ? "bg-red-50 text-red-600 border border-red-100" :
                    exp.status === "warning" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {exp.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
