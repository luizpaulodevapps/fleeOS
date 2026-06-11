"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Shield, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  Users, 
  Image as ImageIcon, 
  DollarSign, 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  Car
} from "lucide-react";

export default function AdjusterPortal() {
  const { currentUser, getCollection, addDocument, updateDocument } = useAuth();

  // Data State
  const [claims, setClaims] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Claim for Detail View
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

  // Load Database Collections
  const loadPortalData = useCallback(async () => {
    try {
      setLoading(true);
      const [claimList, vehList, drvList, budList, repList, tpList, evList, appList] = await Promise.all([
        getCollection("insurance_claims"),
        getCollection("vehicles"),
        getCollection("drivers"),
        getCollection("claim_budgets"),
        getCollection("claim_reports"),
        getCollection("claim_third_parties"),
        getCollection("claim_evidences"),
        getCollection("claim_approvals")
      ]);

      setClaims(claimList || []);
      setVehicles(vehList || []);
      setDrivers(drvList || []);
      setBudgets(budList || []);
      setReports(repList || []);
      setThirdParties(tpList || []);
      setEvidences(evList || []);
      setApprovals(appList || []);
    } catch (e) {
      console.error("Erro ao carregar dados do regulador", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Adjuster limits mapping
  const userAlçadaLimit = useMemo(() => {
    if (!currentUser) return 0;
    const roleId = currentUser.roleId || "";
    
    // Map roles to limits
    if (roleId === "role-super-admin" || roleId === "role-owner") {
      return Infinity; // Unlimited
    } else if (roleId === "role-manager") {
      return 10000;
    } else if (roleId === "role-supervisor" || roleId === "role-adjuster") {
      return 2000;
    }
    return 0; // standard users have no alçada
  }, [currentUser]);

  // Get alçada label
  const getAlçadaLabel = (limit: number) => {
    if (limit === Infinity) return "Ilimitada (Diretoria / Owner)";
    return limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + " (Regulador / Supervisor)";
  };

  const handleApproveBudget = async (budget: any) => {
    if (!selectedClaim) return;

    // 1. Check Alçada Limits
    const budgetAmount = budget.amount;
    if (budgetAmount > userAlçadaLimit) {
      alert(`Erro: Você não tem alçada para aprovar este orçamento!\n\nValor do Orçamento: R$ ${budgetAmount.toFixed(2)}\nSeu Limite de Alçada: R$ ${userAlçadaLimit === Infinity ? "Sem Limites" : userAlçadaLimit.toFixed(2)}\n\nPor favor, solicite a aprovação de um Gestor (até R$ 10k) ou Diretor (acima de R$ 10k).`);
      return;
    }

    if (!confirm(`Deseja realmente aprovar o orçamento de ${budget.workshopName} por R$ ${budgetAmount.toLocaleString('pt-BR')}?`)) {
      return;
    }

    try {
      // 2. Approve selected budget, reject others
      const matchedBudgets = budgets.filter(b => b.claimId === selectedClaim.id);
      for (const b of matchedBudgets) {
        await updateDocument("claim_budgets", b.id, {
          ...b,
          status: b.id === budget.id ? "approved" : "rejected"
        });
      }

      // 3. Update claim status
      await updateDocument("insurance_claims", selectedClaim.id, {
        ...selectedClaim,
        status: "approved"
      });

      // 4. Log approval log
      await addDocument("claim_approvals", {
        claimId: selectedClaim.id,
        role: currentUser?.roleId || "role-adjuster",
        status: "approved",
        approvedBy: currentUser?.displayName || currentUser?.email || "Regulador",
        approvedAt: new Date().toISOString(),
        comments: `Orçamento aprovado: ${budget.workshopName} - ${budget.description}`
      });

      alert("Sinistro e orçamento aprovados com sucesso!");
      setSelectedClaim(null);
      await loadPortalData();
    } catch (e) {
      console.error(e);
      alert("Erro ao aprovar orçamento.");
    }
  };

  const handleRejectBudget = async (budget: any) => {
    if (!confirm(`Deseja rejeitar o orçamento de ${budget.workshopName}?`)) {
      return;
    }

    try {
      await updateDocument("claim_budgets", budget.id, {
        ...budget,
        status: "rejected"
      });
      alert("Orçamento rejeitado.");
      await loadPortalData();
    } catch (e) {
      console.error(e);
      alert("Erro ao rejeitar orçamento.");
    }
  };

  const handleRequestAdjustment = async (budget: any) => {
    const feedback = prompt("Informe o ajuste solicitado ou questionamento sobre os valores:");
    if (feedback === null) return;
    if (!feedback.trim()) {
      alert("É necessário preencher o motivo do ajuste!");
      return;
    }

    try {
      await updateDocument("claim_budgets", budget.id, {
        ...budget,
        status: "pending_adjustment",
        description: `${budget.description} (Ajuste Solicitado: ${feedback})`
      });
      alert("Solicitação de ajuste enviada com sucesso!");
      await loadPortalData();
    } catch (e) {
      console.error(e);
      alert("Erro ao solicitar ajuste.");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "light":
      case "leve":
        return "bg-sky-500/10 border-sky-500/20 text-sky-600";
      case "medium":
      case "média":
      case "media":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "heavy":
      case "grave":
        return "bg-red-500/10 border-red-500/20 text-red-600";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-600";
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case "under_review":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "approved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
      case "rejected":
        return "bg-red-500/10 border-red-500/20 text-red-600";
      case "in_repair":
        return "bg-sky-500/10 border-sky-500/20 text-sky-600";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-600";
    }
  };

  const getClaimStatusLabel = (status: string) => {
    switch (status) {
      case "under_review": return "Em Análise";
      case "approved": return "Aprovado / Autorizado";
      case "rejected": return "Rejeitado";
      case "in_repair": return "Em Reparo";
      default: return status;
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const vehicle = vehicles.find(v => v.id === c.vehicleId);
      const driver = drivers.find(d => d.id === c.driverId);
      const plate = vehicle ? vehicle.plate.toLowerCase() : "";
      const driverName = driver ? driver.name.toLowerCase() : "";
      const searchMatch = plate.includes(searchTerm.toLowerCase()) || 
                          driverName.includes(searchTerm.toLowerCase()) || 
                          (c.claimNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return searchMatch && matchStatus;
    });
  }, [claims, vehicles, drivers, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-xs font-semibold">Carregando Console do Regulador...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Seguros</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary font-bold">Console do Regulador</span>
      </nav>

      {/* Adjuster Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
            <span>Console do Regulador de Sinistros</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Audite colisões, verifique relatórios policiais (BO), analise orçamentos de oficinas parceiras e controle alçadas de liberação financeira.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant text-[10px] text-on-surface-variant">
            Alçada Atual: <span className="font-bold text-primary">{getAlçadaLabel(userAlçadaLimit)}</span>
          </div>
          <span className="text-[9px] text-outline italic">Logado como: {currentUser?.displayName}</span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 border border-outline-variant rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Em Análise</span>
            <span className="text-lg font-black text-primary">{claims.filter(c => c.status === "under_review").length}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 border border-outline-variant rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Autorizados</span>
            <span className="text-lg font-black text-primary">{claims.filter(c => c.status === "approved").length}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 border border-outline-variant rounded-xl flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 text-sky-600 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Em Oficina</span>
            <span className="text-lg font-black text-primary">{claims.filter(c => c.status === "in_repair").length}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 border border-outline-variant rounded-xl flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Casos Graves</span>
            <span className="text-lg font-black text-primary">{claims.filter(c => c.severity === "heavy" || c.severity === "grave").length}</span>
          </div>
        </div>
      </div>

      {/* Main Panel View (List vs Detail) */}
      {!selectedClaim ? (
        <div className="space-y-4">
          {/* List Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Pesquisar por Placa, Sinistro ou Motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface-variant">Filtrar Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 outline-none text-on-surface"
              >
                <option value="all">Todos os Casos</option>
                <option value="under_review">Em Análise</option>
                <option value="approved">Aprovados</option>
                <option value="in_repair">Em Reparo</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          </div>

          {/* Claims Grid */}
          {filteredClaims.length === 0 ? (
            <div className="text-center p-12 bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <Shield className="w-12 h-12 text-outline mx-auto mb-4" />
              <h3 className="text-sm font-bold text-primary">Nenhum sinistro sob sua análise</h3>
              <p className="text-xs text-on-surface-variant mt-1">Nenhum caso coincide com os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClaims.map(claim => {
                const vehicle = vehicles.find(v => v.id === claim.vehicleId);
                const driver = drivers.find(d => d.id === claim.driverId);
                const claimBudgets = budgets.filter(b => b.claimId === claim.id);
                
                return (
                  <div 
                    key={claim.id} 
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono text-[10px] font-bold text-outline uppercase">{claim.claimNumber}</span>
                        <div className="flex gap-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(claim.severity)}`}>
                            {claim.severity === "medium" ? "Média" : claim.severity === "light" ? "Leve" : "Grave"}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getClaimStatusColor(claim.status)}`}>
                            {getClaimStatusLabel(claim.status)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-outline" />
                        <span>Placa: {vehicle ? vehicle.plate : "S/P"}</span>
                        <span className="text-xs text-on-surface-variant font-normal">({vehicle?.model})</span>
                      </h3>

                      <p className="text-xs text-on-surface mt-2 font-geist line-clamp-2">{claim.description}</p>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-on-surface-variant font-mono bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
                        <div>Condutor: <span className="font-bold">{driver ? driver.name : "N/I"}</span></div>
                        <div>Orçamentos: <span className="font-bold text-primary">{claimBudgets.length} recebidos</span></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant flex justify-between items-center">
                      <span className="text-[10px] text-outline font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(claim.occurrenceDate).toLocaleDateString("pt-BR")}
                      </span>
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-bold hover:opacity-95 transition-all"
                      >
                        <span>Auditar & Analisar</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Audit Panel */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-6">
          {/* Detail Header */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <button
              onClick={() => setSelectedClaim(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-primary text-[10px] font-bold hover:bg-surface-container-high transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Lista</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-outline">{selectedClaim.claimNumber}</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getSeverityColor(selectedClaim.severity)}`}>
                Gravidade: {selectedClaim.severity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Info, Reports, Evidences */}
            <div className="lg:col-span-7 space-y-6">
              {/* Ocurrence Info */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
                <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-outline-variant pb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Dados do Incidente</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Veículo</span>
                    <span className="font-semibold text-on-surface">
                      {vehicles.find(v => v.id === selectedClaim.vehicleId)?.plate} - {vehicles.find(v => v.id === selectedClaim.vehicleId)?.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Motorista</span>
                    <span className="font-semibold text-on-surface">
                      {drivers.find(d => d.id === selectedClaim.driverId)?.name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Localização</span>
                    <span className="font-medium text-on-surface flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {selectedClaim.location}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Relato da Ocorrência</span>
                    <p className="text-on-surface mt-1 leading-relaxed bg-background p-3 rounded-lg border border-outline-variant font-geist">
                      {selectedClaim.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* BO / Police Report */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
                <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-outline-variant pb-2">
                  <FileText className="w-4 h-4" />
                  <span>Boletim de Ocorrência (B.O.)</span>
                </h3>
                {reports.filter(r => r.claimId === selectedClaim.id).length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">Nenhum B.O. cadastrado para este sinistro.</p>
                ) : (
                  reports.filter(r => r.claimId === selectedClaim.id).map(rep => (
                    <div key={rep.id} className="flex justify-between items-center bg-background p-3 rounded-lg border border-outline-variant text-xs">
                      <div>
                        <div className="font-bold font-mono text-primary">{rep.reportNumber}</div>
                        <div className="text-[10px] text-on-surface-variant">{rep.policeStation} • {rep.reportDate}</div>
                      </div>
                      <a 
                        href={rep.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded hover:bg-primary/20 transition-all text-[10px]"
                      >
                        Visualizar B.O.
                      </a>
                    </div>
                  ))
                )}
              </div>

              {/* Third Parties */}
              {selectedClaim.involvedThirdParties && (
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
                  <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-outline-variant pb-2">
                    <Users className="w-4 h-4" />
                    <span>Terceiros Envolvidos</span>
                  </h3>
                  {thirdParties.filter(tp => tp.claimId === selectedClaim.id).length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">Nenhum terceiro registrado.</p>
                  ) : (
                    thirdParties.filter(tp => tp.claimId === selectedClaim.id).map(tp => (
                      <div key={tp.id} className="bg-background p-3 rounded-lg border border-outline-variant text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-on-surface">{tp.name}</span>
                          <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-[10px]">{tp.plate}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-on-surface-variant">
                          <div>Veículo: <span className="font-bold text-on-surface">{tp.vehicle}</span></div>
                          <div>Seguradora: <span className="font-bold text-on-surface">{tp.insurer || "Nenhuma"}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Photo Evidence */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
                <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-outline-variant pb-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Evidências / Fotos de Avarias</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {evidences.filter(ev => ev.claimId === selectedClaim.id).length === 0 ? (
                    <p className="col-span-3 text-xs text-on-surface-variant italic py-3 text-center">Nenhuma foto de avaria anexada.</p>
                  ) : (
                    evidences.filter(ev => ev.claimId === selectedClaim.id).map(ev => (
                      <div key={ev.id} className="relative group border border-outline-variant rounded-lg overflow-hidden h-28 bg-surface-container">
                        <img 
                          src={ev.fileUrl} 
                          alt="Evidência" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Budget Analyzer & Action */}
            <div className="lg:col-span-5 space-y-6">
              {/* Budget Analyzer */}
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
                <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-outline-variant pb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Análise Comparativa de Orçamentos</span>
                </h3>

                <div className="space-y-4">
                  {budgets.filter(b => b.claimId === selectedClaim.id).length === 0 ? (
                    <div className="text-center text-xs text-on-surface-variant italic py-6">
                      Nenhum orçamento enviado pelas oficinas parceiras ainda.
                    </div>
                  ) : (
                    budgets.filter(b => b.claimId === selectedClaim.id).map(budget => {
                      const isApproved = budget.status === "approved";
                      const isRejected = budget.status === "rejected";
                      const isPending = budget.status === "pending";
                      
                      // Check if budget is higher than user's limit
                      const exceedsLimit = budget.amount > userAlçadaLimit;

                      return (
                        <div 
                          key={budget.id} 
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            isApproved ? "bg-emerald-500/5 border-emerald-500/30" : 
                            isRejected ? "bg-red-500/5 border-red-500/10 opacity-75" : 
                            "bg-background border-outline-variant"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-extrabold text-xs text-primary">{budget.workshopName}</span>
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                isApproved ? "bg-emerald-500 text-white" : 
                                isRejected ? "bg-red-500 text-white" : 
                                budget.status === "pending_adjustment" ? "bg-amber-500 text-white" :
                                "bg-slate-200 text-slate-700"
                              }`}>
                                {budget.status === "pending_adjustment" ? "Ajuste Solicitado" : 
                                 budget.status === "pending" ? "Aguardando" : 
                                 isApproved ? "Aprovado" : "Rejeitado"}
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant font-geist leading-relaxed">{budget.description}</p>
                            
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-[10px] text-outline font-bold uppercase">Valor Cobrado</span>
                              <span className="text-sm font-black font-mono text-primary">
                                {budget.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>

                            {/* Alçada warning for this specific budget */}
                            {exceedsLimit && isPending && (
                              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-red-700 text-[10px]">
                                <Lock className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                                <span>Excede sua alçada operacional (Máx: R$ {userAlçadaLimit.toLocaleString('pt-BR')})</span>
                              </div>
                            )}
                          </div>

                          {isPending && (
                            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-3 gap-1">
                              <button
                                onClick={() => handleApproveBudget(budget)}
                                disabled={exceedsLimit}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded font-bold text-[9px] transition-all ${
                                  exceedsLimit 
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50" 
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => handleRequestAdjustment(budget)}
                                className="flex items-center justify-center gap-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[9px]"
                              >
                                <span>Ajustar</span>
                              </button>
                              <button
                                onClick={() => handleRejectBudget(budget)}
                                className="flex items-center justify-center gap-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[9px]"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>Rejeitar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
