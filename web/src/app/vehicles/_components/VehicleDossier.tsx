"use client";

import React from "react";
import { Printer, X, Gauge, ShieldAlert } from "lucide-react";

interface VehicleDossierProps {
  vehicle: any;
  onClose: () => void;
  assignments: any[];
  drivers: any[];
  assets: any[];
  incidents: any[];
  maintenances: any[];
  attachments: any[];
  acquisitions: any[];
  timeline: any[];
}

export const VehicleDossier: React.FC<VehicleDossierProps> = ({
  vehicle,
  onClose,
  assignments,
  drivers,
  assets,
  incidents,
  maintenances,
  attachments,
  acquisitions,
  timeline
}) => {
  const getDriverName = (driverId: string) => {
    const drv = drivers.find(d => d.id === driverId);
    return drv ? drv.name : driverId;
  };

  const activeAsg = assignments.find(a => a.active && a.vehicleId === vehicle.id);
  const activeDriver = activeAsg ? drivers.find(d => d.id === activeAsg.driverId) : null;
  
  const acq = acquisitions.find(a => a.vehicleId === vehicle.id);
  const vehAssets = assets.filter(a => a.vehicleId === vehicle.id);
  const vehIncidents = incidents.filter(i => i.vehicleId === vehicle.id);
  const vehMaintenances = maintenances.filter(m => m.vehicleId === vehicle.id);
  const vehTimeline = timeline.filter(t => t.entityType === "vehicle" && t.entityId === vehicle.id);
  const vehAttachments = attachments.filter(a => a.entityType === "vehicle" && a.entityId === vehicle.id);

  return (
    <div className="bg-white text-slate-900 min-h-screen p-8 max-w-4xl mx-auto border shadow-lg space-y-8 print:border-none print:shadow-none font-geist">
      {/* Dossier Control Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h2 className="text-lg font-black text-primary">Dossiê Técnico Consolidado</h2>
          <p className="text-xs text-slate-500">Visualização de impressão física do prontuário do veículo placa {vehicle.plate}.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold hover:opacity-90 rounded-lg text-xs transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Dossiê</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all"
          >
            <X className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="space-y-6">
        {/* Cover Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Placa: <span className="font-mono text-slate-900 uppercase">{vehicle.plate}</span> | Ano: {vehicle.year} | Cor: {vehicle.color}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-slate-100 border border-slate-300 font-black text-xs rounded uppercase">
              STATUS: {vehicle.status}
            </span>
          </div>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-3 gap-6 text-xs border-b pb-6 border-slate-200">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Especificações</h4>
            <p className="mb-1"><strong>RENAVAM:</strong> {vehicle.renavam || "N/A"}</p>
            <p className="mb-1"><strong>Chassi:</strong> {vehicle.chassis || "N/A"}</p>
            <p className="mb-1"><strong>Combustível:</strong> {vehicle.fuelType}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Histórico Técnico</h4>
            <p className="mb-1 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <strong>Odômetro:</strong> {Number(vehicle.mileage).toLocaleString("pt-BR")} km
            </p>
            <p className="mb-1"><strong>Venc. Seguro:</strong> {vehicle.insuranceExpiration ? new Date(vehicle.insuranceExpiration).toLocaleDateString("pt-BR") : "N/A"}</p>
            <p className="mb-1"><strong>Venc. CRLV:</strong> {vehicle.registrationExpiration ? new Date(vehicle.registrationExpiration).toLocaleDateString("pt-BR") : "N/A"}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Vínculo Atual</h4>
            {activeDriver ? (
              <div>
                <p className="mb-1 font-bold text-slate-900">{activeDriver.name}</p>
                <p className="text-[10px] text-slate-500">CPF: {activeDriver.cpf} | CNH: {activeDriver.cnh}</p>
                <p className="text-[10px] text-slate-500">Início: {new Date(activeAsg.startDate).toLocaleDateString("pt-BR")}</p>
              </div>
            ) : (
              <p className="text-slate-500 italic">Disponível em estoque (Sem motorista ativo)</p>
            )}
          </div>
        </div>

        {/* Acquisition & Patrimony Details */}
        <div className="text-xs border-b pb-6 border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Dados Patrimoniais e Aquisição</h3>
          {acq ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1"><strong>Tipo de Aquisição:</strong> {acq.acquisitionType}</p>
                  <p className="mb-1"><strong>Data da Compra/Entrada:</strong> {acq.purchaseDate ? new Date(acq.purchaseDate).toLocaleDateString("pt-BR") : "N/A"}</p>
                  <p className="mb-1"><strong>Valor Patrimonial:</strong> R$ {Number(acq.purchaseValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="mb-1"><strong>Valor FIPE Atual:</strong> R$ {Number(acq.currentFipeValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="mb-1"><strong>Custo Seguro Anual:</strong> R$ {Number(acq.annualInsuranceCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Impostos e Licenciamentos */}
              <div>
                <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2">📜 Impostos, Licenciamento e Vistorias</h4>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">IPVA Anual</span>
                    <p className="font-bold text-slate-800 mt-0.5">R$ {Number(acq.annualIpvaCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <span className="text-[9px] text-slate-500 block">Vencimento: {acq.ipvaExpirationDate ? new Date(acq.ipvaExpirationDate).toLocaleDateString("pt-BR") : "N/A"}</span>
                    <span className={`text-[9px] font-bold ${acq.ipvaPaidStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {acq.ipvaPaidStatus === "paid" ? "✓ Pago" : "• Pendente"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Licenciamento CRLV</span>
                    <p className="font-bold text-slate-800 mt-0.5">R$ {Number(acq.annualLicensingCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <span className="text-[9px] text-slate-500 block">Vencimento: {acq.licensingExpirationDate ? new Date(acq.licensingExpirationDate).toLocaleDateString("pt-BR") : "N/A"}</span>
                    <span className={`text-[9px] font-bold ${acq.licensingPaidStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {acq.licensingPaidStatus === "paid" ? "✓ Pago" : "• Pendente"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Vistoria GNV/Anual</span>
                    <p className="font-bold text-slate-800 mt-0.5">R$ {Number(acq.annualInspectionCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <span className="text-[9px] text-slate-500 block">Vencimento: {acq.inspectionExpirationDate ? new Date(acq.inspectionExpirationDate).toLocaleDateString("pt-BR") : "N/A"}</span>
                    <span className={`text-[9px] font-bold ${acq.inspectionPaidStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {acq.inspectionPaidStatus === "paid" ? "✓ Pago" : "• Pendente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Taxi Credentials */}
              {acq.isTaxi && (
                <div>
                  <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2">🚖 Regulamentação Táxi (Alvará Municipal)</h4>
                  <div className="grid grid-cols-4 gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <div>
                      <span className="text-[9px] text-amber-700 uppercase font-bold">Nº do Alvará</span>
                      <p className="font-bold text-slate-800 mt-0.5">{acq.alvaraNumber || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-700 uppercase font-bold">Vencimento Alvará</span>
                      <p className="font-bold text-slate-800 mt-0.5">{acq.alvaraExpirationDate ? new Date(acq.alvaraExpirationDate).toLocaleDateString("pt-BR") : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-700 uppercase font-bold">Renovação Anual</span>
                      <p className="font-bold text-slate-800 mt-0.5">R$ {Number(acq.alvaraRenewalCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-700 uppercase font-bold">Status Vistoria DTP</span>
                      <p className={`font-bold mt-0.5 ${acq.municipalInspectionStatus === "approved" ? "text-emerald-600" : acq.municipalInspectionStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                        {acq.municipalInspectionStatus === "approved" ? "✓ Aprovada" : acq.municipalInspectionStatus === "failed" ? "✗ Reprovada" : "Pendente"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Setup Capex Preparation */}
              {(Number(acq.taximeterCost) || Number(acq.rooftopLightCost) || Number(acq.initialInspectionCost) || Number(acq.paintOrDecalCost) || Number(acq.municipalRegistrationCost) || Number(acq.otherInitialCosts)) ? (
                <div>
                  <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2">🛠️ Custos de Equipagem e Preparação Inicial</h4>
                  <div className="grid grid-cols-6 gap-2 bg-slate-50 p-2 text-[10px] border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Taxímetro</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.taximeterCost || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Luminoso</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.rooftopLightCost || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Vistoria Inmetro</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.initialInspectionCost || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Plotagem</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.paintOrDecalCost || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Licença DTP</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.municipalRegistrationCost || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Outras taxas</span>
                      <span className="font-mono text-slate-800 font-bold">R$ {Number(acq.otherInitialCosts || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 mt-2 text-right">
                    Custo total de ativação (Capex Inicial): <span className="font-mono font-black text-slate-900">R$ {((Number(acq.purchaseValue) || 0) + ((Number(acq.taximeterCost) || 0) + (Number(acq.rooftopLightCost) || 0) + (Number(acq.initialInspectionCost) || 0) + (Number(acq.paintOrDecalCost) || 0) + (Number(acq.municipalRegistrationCost) || 0) + (Number(acq.otherInitialCosts) || 0))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-slate-500 italic">Dados patrimoniais não cadastrados.</p>
          )}
        </div>

        {/* Active Restrições / Locks */}
        {vehicle.activeLocks && vehicle.activeLocks.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
            <h4 className="font-bold text-red-800 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Bloqueios e Restrições Ativos</span>
            </h4>
            <p><strong>Motivos:</strong> {vehicle.activeLocks.join(", ")}</p>
            <p><strong>Justificativa:</strong> {JSON.stringify(vehicle.lockJustification)}</p>
          </div>
        )}

        {/* Assets & Equipment */}
        <div className="text-xs border-b pb-6 border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm">Equipamentos Mapeados (Acessórios)</h3>
          {vehAssets.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-slate-400 font-bold">
                  <th className="py-2">Equipamento</th>
                  <th className="py-2">Nº Série</th>
                  <th className="py-2">Instalação</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehAssets.map((asset, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{asset.assetType}</td>
                    <td className="py-2 font-mono">{asset.serialNumber}</td>
                    <td className="py-2">{new Date(asset.installDate + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 uppercase">{asset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic">Nenhum equipamento acessório cadastrado.</p>
          )}
        </div>

        {/* Oficina / Maintenance History */}
        <div className="text-xs border-b pb-6 border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm">Histórico de Manutenção em Oficina</h3>
          {vehMaintenances.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-slate-400 font-bold">
                  <th className="py-2">Data</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Descrição</th>
                  <th className="py-2">Km</th>
                  <th className="py-2 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {vehMaintenances.map((maint, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{new Date(maint.date + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="py-2">{maint.type}</td>
                    <td className="py-2">{maint.description}</td>
                    <td className="py-2 font-mono">{maint.mileage} km</td>
                    <td className="py-2 text-right font-mono font-bold">R$ {Number(maint.cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic">Nenhuma manutenção executada registrada.</p>
          )}
        </div>

        {/* Incident History / Avarias */}
        <div className="text-xs border-b pb-6 border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm">Histórico de Sinistros e Avarias</h3>
          {vehIncidents.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-slate-400 font-bold">
                  <th className="py-2">Data</th>
                  <th className="py-2">Condutor Envolvido</th>
                  <th className="py-2">Descrição da Ocorrência</th>
                  <th className="py-2">Severidade</th>
                  <th className="py-2 text-right">Custo Reparo</th>
                </tr>
              </thead>
              <tbody>
                {vehIncidents.map((inc, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{new Date(inc.date + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 font-bold">{getDriverName(inc.driverId)}</td>
                    <td className="py-2">{inc.description}</td>
                    <td className="py-2 uppercase">{inc.severity}</td>
                    <td className="py-2 text-right font-mono font-bold">R$ {Number(inc.repairCost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic">Nenhuma avaria reportada registrada.</p>
          )}
        </div>

        {/* Activity timeline logs */}
        <div className="text-xs space-y-2">
          <h3 className="font-bold text-slate-800 text-sm">Linha de Auditoria do Prontuário (Últimos Eventos)</h3>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50">
            {vehTimeline.slice(-8).reverse().map((t, idx) => (
              <div key={idx} className="p-3 flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{t.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                  <p className="text-[8px] text-slate-400 mt-0.5">Operador: {t.createdBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
