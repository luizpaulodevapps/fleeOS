"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  AlertTriangle, 
  Clock, 
  Search, 
  Printer, 
  CheckCircle,
  ShieldAlert,
  Calendar,
  User,
  Car,
  FileText
} from "lucide-react";

export default function ExpirationsManager() {
  const { getCollection } = useAuth();
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractAlerts, setContractAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [drvList, vehList, conList, alertList] = await Promise.all([
        getCollection("drivers"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("expirations")
      ]);
      setDrivers(drvList);
      setVehicles(vehList);
      setContracts(conList);
      setContractAlerts(alertList);
    } catch (e) {
      console.error("Erro ao carregar vencimentos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const parseDate = (dateStr: string) => new Date(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  
  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return 9999;
    const diffTime = parseDate(dateStr).getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Compile all expiration items
  const allExpirations: any[] = [];

  // 1. Drivers CNH
  drivers.forEach(d => {
    if (d.cnhExpiration) {
      allExpirations.push({
        id: `cnh-${d.id}`,
        name: d.name,
        targetType: "driver",
        docType: "CNH",
        date: d.cnhExpiration,
        days: getDaysDiff(d.cnhExpiration)
      });
    }
    if (d.condutaxExpiration) {
      allExpirations.push({
        id: `condutax-${d.id}`,
        name: d.name,
        targetType: "driver",
        docType: "CONDUTAX",
        date: d.condutaxExpiration,
        days: getDaysDiff(d.condutaxExpiration)
      });
    }
    if (d.alvaraExpiration) {
      allExpirations.push({
        id: `alvara-${d.id}`,
        name: d.name,
        targetType: "driver",
        docType: "Alvará",
        date: d.alvaraExpiration,
        days: getDaysDiff(d.alvaraExpiration)
      });
    }
  });

  // 2. Vehicles Insurance & CRLV
  vehicles.forEach(v => {
    if (v.insuranceExpiration) {
      allExpirations.push({
        id: `ins-${v.id}`,
        name: `${v.brand} ${v.model} (${v.plate})`,
        targetType: "vehicle",
        docType: "Seguro",
        date: v.insuranceExpiration,
        days: getDaysDiff(v.insuranceExpiration)
      });
    }
    if (v.registrationExpiration) {
      allExpirations.push({
        id: `reg-${v.id}`,
        name: `${v.brand} ${v.model} (${v.plate})`,
        targetType: "vehicle",
        docType: "Licenciamento (CRLV)",
        date: v.registrationExpiration,
        days: getDaysDiff(v.registrationExpiration)
      });
    }
  });

  // 3. Lease Contracts
  contracts.forEach(c => {
    const driverObj = drivers.find(d => d.id === c.driverId);
    const vehicleObj = vehicles.find(v => v.id === c.vehicleId);
    const label = `${driverObj ? driverObj.name : 'Motorista'} ↔ ${vehicleObj ? vehicleObj.plate : 'Carro'}`;
    
    if (c.endDate && ["active", "Ativo"].includes(c.status)) {
      allExpirations.push({
        id: `con-${c.id}`,
        name: label,
        targetType: "contract",
        docType: "Contrato Locação",
        date: c.endDate,
        days: getDaysDiff(c.endDate)
      });
    }
  });

  // 4. Contract promissories and post-dated checks
  contractAlerts.forEach(alert => {
    if (!alert.expirationDate || alert.status !== "Pendente") return;
    allExpirations.push({
      id: `alert-${alert.id}`,
      name: alert.label || "Compromisso contratual",
      targetType: "contract",
      docType: alert.type || "Promissória/Cheque",
      date: alert.expirationDate,
      days: getDaysDiff(alert.expirationDate),
      amount: Number(alert.amount || 0),
    });
  });

  // Filter & Search
  const filteredExpirations = allExpirations.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.docType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (docTypeFilter === "all") return matchesSearch;
    if (docTypeFilter === "expired") return matchesSearch && item.days < 0;
    if (docTypeFilter === "critical") return matchesSearch && item.days >= 0 && item.days <= 7;
    if (docTypeFilter === "warning") return matchesSearch && item.days > 7 && item.days <= 30;
    return matchesSearch;
  }).sort((a, b) => a.days - b.days);

  // Stats Counters
  const expiredCount = allExpirations.filter(i => i.days < 0).length;
  const criticalCount = allExpirations.filter(i => i.days >= 0 && i.days <= 7).length;
  const warningCount = allExpirations.filter(i => i.days > 7 && i.days <= 30).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:bg-white print:text-black">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs print:hidden">
        <span className="hover:text-primary cursor-pointer">Painel</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Vencimentos</span>
      </nav>

      {/* Header */}
      <div className="border-b border-outline-variant pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist">
            Controle de Vencimentos
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Gestão preventiva de documentos fiscais e operacionais. Fique atento a prazos de CNHs, CONDUTAX, seguros e contratos.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs font-semibold">Analisando vigência de documentos...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            {/* Expirado */}
            <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="p-2 bg-red-500/10 rounded-lg text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <span className="text-red-500 text-[10px] font-bold uppercase">Ação Imediata</span>
              </div>
              <div className="text-3xl font-black font-geist text-primary">{expiredCount}</div>
              <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Documentos Expirados</div>
            </div>

            {/* Crítico (Vence em 7 dias) */}
            <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <span className="text-amber-500 text-[10px] font-bold uppercase">Crítico</span>
              </div>
              <div className="text-3xl font-black font-geist text-primary">{criticalCount}</div>
              <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Vencem esta semana (≤ 7d)</div>
            </div>

            {/* Atenção (Vence em 30 dias) */}
            <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                  <Clock className="w-5 h-5" />
                </span>
                <span className="text-blue-500 text-[10px] font-bold uppercase">Aviso</span>
              </div>
              <div className="text-3xl font-black font-geist text-primary">{warningCount}</div>
              <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Vencem no mês (8d a 30d)</div>
            </div>
          </section>

          {/* Filters Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl print:hidden">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Pesquisar por motorista, veículo ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "all", label: "Todos" },
                { id: "expired", label: `Expirados (${expiredCount})` },
                { id: "critical", label: `Crítico (${criticalCount})` },
                { id: "warning", label: `Atenção (${warningCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDocTypeFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    docTypeFilter === tab.id
                      ? "bg-primary border-primary text-on-primary font-bold"
                      : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List display */}
          {filteredExpirations.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant">
              <CheckCircle className="w-[40px] h-[40px] text-accent-green mx-auto mb-4" />
              <p className="text-base font-semibold text-primary font-geist">Tudo regularizado</p>
              <p className="text-xs mt-1">Nenhum documento atende aos filtros de vencimento aplicados.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Alvo / Alugado</th>
                      <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Documento / Vínculo</th>
                      <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Vencimento</th>
                      <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Prazo</th>
                      <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {filteredExpirations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-primary">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-outline">
                              {item.targetType === "driver" && <User className="w-4 h-4" />}
                              {item.targetType === "vehicle" && <Car className="w-4 h-4" />}
                              {item.targetType === "contract" && <FileText className="w-4 h-4" />}
                            </span>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-on-surface-variant">
                          <span className="bg-slate-100 border border-outline-variant/60 px-2 py-0.5 rounded text-[10px] font-bold">
                            {item.docType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-on-surface-variant">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-outline" />
                            <span>{parseDate(item.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {item.days < 0 ? (
                            <span className="text-red-600 font-bold">Vencido há {Math.abs(item.days)}d</span>
                          ) : item.days === 0 ? (
                            <span className="text-amber-500 font-bold">Expira hoje!</span>
                          ) : (
                            <span className="text-on-surface">Restam {item.days} dias</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.days < 0
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : item.days <= 7
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/25"
                              : item.days <= 30
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}>
                            {item.days < 0 ? "Expirado" : item.days <= 7 ? "Crítico" : item.days <= 30 ? "Atenção" : "Em dia"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
