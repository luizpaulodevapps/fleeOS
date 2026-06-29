"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  PlusCircle, Save, Trash, DollarSign, Car, 
  Wrench, Settings, AlertTriangle, CheckCircle 
} from "lucide-react";

export function FleetParametersSettings() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "categories" | "maintenance">("daily");
  const [loading, setLoading] = useState(false);

  // 1. Daily Profiles State
  const [dailyProfiles, setDailyProfiles] = useState<any[]>([]);
  const [selectedDpId, setSelectedDpId] = useState("");
  const [dpName, setDpName] = useState("");
  const [dpRate, setDpRate] = useState(0);
  const [dpDesc, setDpDesc] = useState("");

  // 2. Pricing/Vehicle Categories State
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catActive, setCatActive] = useState(true);

  // 3. Maintenance Plans State
  const [maintPlans, setMaintPlans] = useState<any[]>([]);
  const [selectedMaintId, setSelectedMaintId] = useState("");
  const [maintName, setMaintName] = useState("");
  const [maintInterval, setMaintInterval] = useState(10000);
  const [maintDesc, setMaintDesc] = useState("");

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dpList, catList, planList] = await Promise.all([
        getCollection("daily_rate_profiles"),
        getCollection("pricing_categories"),
        getCollection("maintenance_plans").catch(() => [])
      ]);
      setDailyProfiles(dpList || []);
      setCategories(catList || []);
      setMaintPlans(planList || []);
    } catch (e) {
      console.error("Erro ao carregar parâmetros da frota:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync selected Daily Profile form
  const activeDp = useMemo(() => dailyProfiles.find(d => d.id === selectedDpId), [dailyProfiles, selectedDpId]);
  useEffect(() => {
    if (activeDp) {
      setDpName(activeDp.name || "");
      setDpRate(activeDp.dailyRate || activeDp.rate || 0);
      setDpDesc(activeDp.description || "");
    } else {
      setDpName("");
      setDpRate(0);
      setDpDesc("");
    }
  }, [selectedDpId, activeDp]);

  // Sync selected Category form
  const activeCat = useMemo(() => categories.find(c => c.id === selectedCatId), [categories, selectedCatId]);
  useEffect(() => {
    if (activeCat) {
      setCatName(activeCat.name || "");
      setCatDesc(activeCat.description || "");
      setCatActive(activeCat.active !== false);
    } else {
      setCatName("");
      setCatDesc("");
      setCatActive(true);
    }
  }, [selectedCatId, activeCat]);

  // Sync selected Maintenance Plan form
  const activeMaint = useMemo(() => maintPlans.find(p => p.id === selectedMaintId), [maintPlans, selectedMaintId]);
  useEffect(() => {
    if (activeMaint) {
      setMaintName(activeMaint.name || "");
      setMaintInterval(activeMaint.intervalKm || activeMaint.interval || 10000);
      setMaintDesc(activeMaint.description || "");
    } else {
      setMaintName("");
      setMaintInterval(10000);
      setMaintDesc("");
    }
  }, [selectedMaintId, activeMaint]);

  // --- Handlers: Daily Profiles ---
  const handleCreateDp = async () => {
    const name = prompt("Nome do novo perfil de diária:");
    if (!name) return;
    try {
      const added = await addDocument("daily_rate_profiles", { name, dailyRate: 100, amount: 100, description: "Novo perfil de diária" });
      await loadAllData();
      setSelectedDpId(added.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDp = async () => {
    if (!selectedDpId) return;
    try {
      await updateDocument("daily_rate_profiles", selectedDpId, { name: dpName, dailyRate: dpRate, amount: dpRate, description: dpDesc });
      alert("Perfil de diária atualizado!");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDp = async () => {
    if (!selectedDpId) return;
    if (!confirm("Excluir este perfil de diária?")) return;
    try {
      await deleteDocument("daily_rate_profiles", selectedDpId);
      setSelectedDpId("");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Categories ---
  const handleCreateCat = async () => {
    const name = prompt("Nome da nova categoria de carro:");
    if (!name) return;
    try {
      const added = await addDocument("pricing_categories", { name, description: "Nova categoria de veículos", active: true });
      await loadAllData();
      setSelectedCatId(added.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCat = async () => {
    if (!selectedCatId) return;
    try {
      await updateDocument("pricing_categories", selectedCatId, { name: catName, description: catDesc, active: catActive });
      alert("Categoria de carro atualizada!");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCat = async () => {
    if (!selectedCatId) return;
    if (!confirm("Excluir esta categoria?")) return;
    try {
      await deleteDocument("pricing_categories", selectedCatId);
      setSelectedCatId("");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Maintenance Plans ---
  const handleCreateMaint = async () => {
    const name = prompt("Nome do novo plano de manutenção:");
    if (!name) return;
    try {
      const added = await addDocument("maintenance_plans", { name, intervalKm: 10000, description: "Plano preventivo de manutenção" });
      await loadAllData();
      setSelectedMaintId(added.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMaint = async () => {
    if (!selectedMaintId) return;
    try {
      await updateDocument("maintenance_plans", selectedMaintId, { name: maintName, intervalKm: maintInterval, description: maintDesc });
      alert("Plano de manutenção atualizado!");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaint = async () => {
    if (!selectedMaintId) return;
    if (!confirm("Excluir este plano de manutenção?")) return;
    try {
      await deleteDocument("maintenance_plans", selectedMaintId);
      setSelectedMaintId("");
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs Navigation */}
      <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "daily" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Perfis de Diária</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "categories" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Categorias de Veículos</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("maintenance")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "maintenance" ? "bg-primary text-on-primary" : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Planos de Manutenção</span>
          </button>
        </div>

        <div>
          {activeSubTab === "daily" && (
            <button onClick={handleCreateDp} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4" />
              <span>Novo Perfil</span>
            </button>
          )}
          {activeSubTab === "categories" && (
            <button onClick={handleCreateCat} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          )}
          {activeSubTab === "maintenance" && (
            <button onClick={handleCreateMaint} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4" />
              <span>Novo Plano</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center italic text-slate-400">Carregando parâmetros operacionais...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar selector */}
          <div className="lg:col-span-1 border border-outline-variant rounded-xl overflow-hidden bg-slate-50/50 flex flex-col h-[400px]">
            <div className="p-3 bg-white border-b border-outline-variant">
              <span className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider">
                {activeSubTab === "daily" ? "Perfis Cadastrados" : activeSubTab === "categories" ? "Categorias de Carros" : "Planos de Oficina"}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-150">
              {activeSubTab === "daily" && (
                dailyProfiles.length === 0 ? <p className="p-3 text-slate-400 italic text-[11px]">Nenhum perfil cadastrado.</p> :
                dailyProfiles.map(d => (
                  <button key={d.id} onClick={() => setSelectedDpId(d.id)} className={`w-full text-left p-3 hover:bg-slate-100 flex flex-col gap-0.5 border-l-2 ${selectedDpId === d.id ? "bg-white border-primary" : "border-transparent"}`}>
                    <span className="font-bold text-slate-800">{d.name}</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-semibold">R$ {d.dailyRate || d.rate || 0}/dia</span>
                  </button>
                ))
              )}

              {activeSubTab === "categories" && (
                categories.length === 0 ? <p className="p-3 text-slate-400 italic text-[11px]">Nenhuma categoria cadastrada.</p> :
                categories.map(c => (
                  <button key={c.id} onClick={() => setSelectedCatId(c.id)} className={`w-full text-left p-3 hover:bg-slate-100 flex flex-col gap-0.5 border-l-2 ${selectedCatId === c.id ? "bg-white border-primary" : "border-transparent"}`}>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-[9px] text-slate-400">{c.description}</span>
                  </button>
                ))
              )}

              {activeSubTab === "maintenance" && (
                maintPlans.length === 0 ? <p className="p-3 text-slate-400 italic text-[11px]">Nenhum plano cadastrado.</p> :
                maintPlans.map(p => (
                  <button key={p.id} onClick={() => setSelectedMaintId(p.id)} className={`w-full text-left p-3 hover:bg-slate-100 flex flex-col gap-0.5 border-l-2 ${selectedMaintId === p.id ? "bg-white border-primary" : "border-transparent"}`}>
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-[10px] text-indigo-650 font-semibold font-mono">Intervalo: {p.intervalKm || 10000} KM</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Form details area */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Daily Profile Form */}
            {activeSubTab === "daily" && (
              selectedDpId ? (
                <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Editar Perfil de Diária</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome do Perfil</label>
                      <input type="text" value={dpName} onChange={(e) => setDpName(e.target.value)} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Taxa Diária (R$)</label>
                      <input type="number" value={dpRate} onChange={(e) => setDpRate(parseFloat(e.target.value) || 0)} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">Descrição</label>
                    <textarea rows={3} value={dpDesc} onChange={(e) => setDpDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none" />
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <button type="button" onClick={handleDeleteDp} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg border border-red-200">
                      <Trash className="w-3.5 h-3.5" />
                      <span>Excluir Perfil</span>
                    </button>
                    <button type="button" onClick={handleSaveDp} className="flex items-center gap-1.5 px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg shadow active:scale-95 transition-all">
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-outline-variant rounded-xl p-8 text-center text-slate-400 italic">Selecione um perfil de diária na barra lateral.</div>
              )
            )}

            {/* Vehicle Category Form */}
            {activeSubTab === "categories" && (
              selectedCatId ? (
                <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Editar Categoria de Veículo</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome da Categoria</label>
                      <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Status da Categoria</label>
                      <select value={catActive ? "active" : "inactive"} onChange={(e) => setCatActive(e.target.value === "active")} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs">
                        <option value="active">Ativo / Habilitado</option>
                        <option value="inactive">Inativo / Desativado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">Descrição</label>
                    <textarea rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none" />
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <button type="button" onClick={handleDeleteCat} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg border border-red-200">
                      <Trash className="w-3.5 h-3.5" />
                      <span>Excluir Categoria</span>
                    </button>
                    <button type="button" onClick={handleSaveCat} className="flex items-center gap-1.5 px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg shadow active:scale-95 transition-all">
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-outline-variant rounded-xl p-8 text-center text-slate-400 italic">Selecione uma categoria de carro na barra lateral.</div>
              )
            )}

            {/* Maintenance Plan Form */}
            {activeSubTab === "maintenance" && (
              selectedMaintId ? (
                <div className="bg-white border border-outline-variant rounded-xl p-5 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Editar Plano de Manutenção</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome do Plano</label>
                      <input type="text" value={maintName} onChange={(e) => setMaintName(e.target.value)} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Intervalo de KM</label>
                      <input type="number" value={maintInterval} onChange={(e) => setMaintInterval(parseInt(e.target.value) || 10000)} className="w-full h-9 bg-slate-50 border border-outline-variant rounded-lg text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">Descrição / Instruções Técnicas</label>
                    <textarea rows={3} value={maintDesc} onChange={(e) => setMaintDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none" />
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <button type="button" onClick={handleDeleteMaint} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-lg border border-red-200">
                      <Trash className="w-3.5 h-3.5" />
                      <span>Excluir Plano</span>
                    </button>
                    <button type="button" onClick={handleSaveMaint} className="flex items-center gap-1.5 px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg shadow active:scale-95 transition-all">
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-outline-variant rounded-xl p-8 text-center text-slate-400 italic">Selecione um plano de manutenção na barra lateral.</div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}
