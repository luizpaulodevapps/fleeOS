import React, { useState, useEffect, useMemo } from "react";
import { 
  getDbCollection, 
  addDbDocument, 
  updateDbDocument, 
  isMock 
} from "./lib/firebase";
import { 
  Layers, 
  DollarSign, 
  Car, 
  Search, 
  Edit, 
  Database, 
  Lock, 
  Unlock, 
  PlusCircle 
} from "lucide-react";

interface Fleet {
  id: string;
  name: string;
  status: "active" | "blocked";
  planId: string;
  vehicleCount: number;
  vehicleLimit: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  enabledModules: string[];
}

const DEFAULT_PLANS: Plan[] = [
  { 
    id: "basic", 
    name: "Plano Básico", 
    price: 199, 
    description: "Essencial para pequenas frotas", 
    enabledModules: ["operations", "docs"] 
  },
  { 
    id: "pro", 
    name: "Plano Pro", 
    price: 499, 
    description: "Completo para operadores médios", 
    enabledModules: ["operations", "docs", "finance", "maintenance"] 
  },
  { 
    id: "enterprise", 
    name: "Plano Enterprise", 
    price: 999, 
    description: "Sem limites com compliance avançado", 
    enabledModules: ["operations", "docs", "finance", "maintenance", "claims", "compliance"] 
  }
];

const DEFAULT_FLEETS: Fleet[] = [
  { id: "fleet-1", name: "Rápido São Paulo Transportes", status: "active", planId: "pro", vehicleCount: 14, vehicleLimit: 30 },
  { id: "fleet-2", name: "Delta Rental & Logistics", status: "active", planId: "enterprise", vehicleCount: 42, vehicleLimit: 100 },
  { id: "fleet-3", name: "Cooperativa Táxi Leste", status: "blocked", planId: "basic", vehicleCount: 8, vehicleLimit: 10 },
  { id: "fleet-4", name: "Movida Partners VIP", status: "active", planId: "pro", vehicleCount: 28, vehicleLimit: 50 }
];

const AVAILABLE_MODULES = [
  { id: "operations", name: "Central Operacional" },
  { id: "docs", name: "Documentos & Contratos" },
  { id: "finance", name: "Gestão Financeira" },
  { id: "maintenance", name: "Manutenção & OS" },
  { id: "claims", name: "Gestão de Sinistros" },
  { id: "compliance", name: "Compliance & Regulação" }
];

export default function App() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // UI Modals / Editors State
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [isAddFleetOpen, setIsAddFleetOpen] = useState(false);
  const [newFleetName, setNewFleetName] = useState("");
  const [newFleetPlan, setNewFleetPlan] = useState("pro");
  const [newFleetLimit, setNewFleetLimit] = useState(30);

  // 1. Fetch data from DB
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedFleets, fetchedPlans] = await Promise.all([
        getDbCollection("saas_fleets"),
        getDbCollection("saas_plans")
      ]);
      setFleets(fetchedFleets);
      setPlans(fetchedPlans);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Database Seeding function
  const handleSeedDatabase = async () => {
    try {
      setLoading(true);
      
      // Clear localStorage if in mock mode to avoid duplicates
      if (isMock) {
        localStorage.setItem("fleetos_saas_plans", JSON.stringify(DEFAULT_PLANS));
        localStorage.setItem("fleetos_saas_fleets", JSON.stringify(DEFAULT_FLEETS));
        alert("Modo Mock: Banco de dados inicializado no LocalStorage!");
        loadData();
        return;
      }

      // Live Firestore seeding
      await Promise.all([
        ...DEFAULT_PLANS.map(p => addDbDocument("saas_plans", p)),
        ...DEFAULT_FLEETS.map(f => addDbDocument("saas_fleets", f))
      ]);
      alert("Banco de dados Firebase inicializado com sucesso!");
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao rodar sementes no banco.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Status toggler (Block/Unblock)
  const handleToggleStatus = async (fleet: Fleet) => {
    const nextStatus = fleet.status === "active" ? "blocked" : "active";
    try {
      await updateDbDocument("saas_fleets", fleet.id, { status: nextStatus });
      setFleets(prev => prev.map(f => f.id === fleet.id ? { ...f, status: nextStatus } : f));
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Update Plan Price
  const handleUpdatePlanPrice = async (planId: string, newPrice: number) => {
    try {
      await updateDbDocument("saas_plans", planId, { price: newPrice });
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, price: newPrice } : p));
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Toggle plan module
  const handleTogglePlanModule = async (plan: Plan, moduleId: string) => {
    const hasModule = plan.enabledModules.includes(moduleId);
    const nextModules = hasModule 
      ? plan.enabledModules.filter(m => m !== moduleId)
      : [...plan.enabledModules, moduleId];

    try {
      await updateDbDocument("saas_plans", plan.id, { enabledModules: nextModules });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, enabledModules: nextModules } : p));
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Save edit fleet limits
  const handleSaveFleetEdits = async () => {
    if (!editingFleet) return;
    try {
      await updateDbDocument("saas_fleets", editingFleet.id, {
        vehicleLimit: editingFleet.vehicleLimit,
        planId: editingFleet.planId
      });
      setFleets(prev => prev.map(f => f.id === editingFleet.id ? editingFleet : f));
      setEditingFleet(null);
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Add new fleet tenant
  const handleCreateFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFleetName.trim()) return;

    const payload = {
      name: newFleetName,
      status: "active",
      planId: newFleetPlan,
      vehicleCount: 0,
      vehicleLimit: newFleetLimit
    };

    try {
      const added = await addDbDocument("saas_fleets", payload);
      setFleets(prev => [...prev, added]);
      setIsAddFleetOpen(false);
      setNewFleetName("");
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered fleets
  const filteredFleets = useMemo(() => {
    return fleets.filter(f => 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [fleets, search]);

  // Statistics
  const totalVehicles = useMemo(() => {
    return fleets.reduce((acc, f) => acc + (f.vehicleCount || 0), 0);
  }, [fleets]);

  const faturamentoEstimado = useMemo(() => {
    return fleets.reduce((acc, f) => {
      const plan = plans.find(p => p.id === f.planId);
      return acc + (plan ? plan.price : 0);
    }, 0);
  }, [fleets, plans]);

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#f3f4f6] pb-12">
      
      {/* Top Glass Header */}
      <header className="border-b border-[#232738] bg-[#11131c]/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-indigo-500" />
          <div>
            <h1 className="text-lg font-black tracking-wider m-0 leading-none">FLEETOS</h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">SAAS STACK INFRA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMock && (
            <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border border-amber-500/20">
              Modo Mock Ativo
            </span>
          )}
          <button
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded border border-[#232738] active:scale-95 transition-all"
            title="Inicializa frotas e planos de teste no banco"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Seed Database</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Overview Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total de Frotas</p>
              <h3 className="text-2xl font-black mt-0.5">{fleets.length}</h3>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Veículos Registrados</p>
              <h3 className="text-2xl font-black mt-0.5">{totalVehicles}</h3>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Faturamento SaaS Est.</p>
              <h3 className="text-2xl font-black mt-0.5">R$ {faturamentoEstimado.toLocaleString("pt-BR")}/mês</h3>
            </div>
          </div>

        </section>

        {/* Bottom grid (Fleets & Plans Config) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Fleets list (Colspan 2) */}
          <section className="lg:col-span-2 space-y-6">
            
            <div className="glass-panel space-y-4">
              <div className="flex justify-between items-center border-b border-[#232738] pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-white m-0">Frotas Inquilinas (Tenants)</h2>
                <button
                  onClick={() => setIsAddFleetOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg transition-colors active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nova Frota</span>
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar frota por nome ou ID..."
                  className="w-full pl-9 pr-4 py-2 bg-[#181b28]/60 border border-[#232738] rounded-xl outline-none"
                />
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-450 italic">Carregando frotas...</div>
              ) : filteredFleets.length === 0 ? (
                <div className="text-center py-8 text-gray-450 italic">Nenhuma frota encontrada. Clique em "Seed Database" para carregar demonstrativos.</div>
              ) : (
                <div className="space-y-4">
                  {filteredFleets.map(fleet => {
                    const plan = plans.find(p => p.id === fleet.planId);
                    const usagePercent = Math.min(100, Math.round(((fleet.vehicleCount || 0) / (fleet.vehicleLimit || 1)) * 100));
                    
                    return (
                      <div key={fleet.id} className="p-4 bg-[#11131c]/60 border border-[#232738] rounded-xl space-y-3 hover:border-gray-700 transition-colors">
                        
                        {/* Title and stats badges */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{fleet.name}</h4>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {fleet.id}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              fleet.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}>
                              {fleet.status === "active" ? "Ativa" : "Bloqueada"}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {plan ? plan.name : "Sem Plano"}
                            </span>
                          </div>
                        </div>

                        {/* Vehicle limits progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                            <span>Veículos Ativos: {fleet.vehicleCount || 0} / {fleet.vehicleLimit || 30}</span>
                            <span>{usagePercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#181b28] rounded-full overflow-hidden border border-[#232738]">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                usagePercent > 90 ? "bg-rose-500" : usagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t border-[#232738] pt-2.5">
                          <button
                            onClick={() => handleToggleStatus(fleet)}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded uppercase border ${
                              fleet.status === "active" 
                                ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10" 
                                : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
                            }`}
                          >
                            {fleet.status === "active" ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Bloquear Frota</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Desbloquear</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setEditingFleet({ ...fleet })}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded uppercase border border-[#232738] bg-slate-800 hover:bg-slate-700 text-gray-300"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Configurar Limites</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>

          {/* Right: Plans & pricing config (Colspan 1) */}
          <section className="space-y-6">
            
            <div className="glass-panel space-y-6">
              <div className="border-b border-[#232738] pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-white m-0">Precificação & Módulos</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Configuração dos limites por assinatura</p>
              </div>

              {loading ? (
                <div className="text-gray-450 italic text-center py-4">Carregando planos...</div>
              ) : plans.length === 0 ? (
                <div className="text-gray-450 italic text-center py-4">Sem planos cadastrados. Rode o Seed.</div>
              ) : (
                <div className="space-y-6">
                  {plans.map(plan => (
                    <div key={plan.id} className="p-4 bg-[#11131c]/60 border border-[#232738] rounded-xl space-y-4">
                      
                      {/* Name & price edit */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-white text-xs uppercase tracking-wide">{plan.name}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">{plan.description}</p>
                        </div>
                        <div className="flex items-center bg-[#181b28] border border-[#232738] rounded-lg px-2 py-0.5">
                          <span className="text-[10px] text-gray-500 font-bold mr-1">R$</span>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => handleUpdatePlanPrice(plan.id, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-transparent border-none p-0 outline-none text-right font-black text-xs text-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Modules Checklist */}
                      <div className="space-y-2 border-t border-[#232738] pt-3">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Módulos Ativados</p>
                        
                        <div className="space-y-1.5">
                          {AVAILABLE_MODULES.map(mod => {
                            const isEnabled = plan.enabledModules.includes(mod.id);
                            return (
                              <label key={mod.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-300 hover:text-white transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => handleTogglePlanModule(plan, mod.id)}
                                  className="w-3.5 h-3.5 rounded bg-[#181b28] border border-[#232738] text-indigo-500 focus:ring-0"
                                />
                                <span>{mod.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

        </div>

      </main>

      {/* MODAL: Edit limits & plan of fleet */}
      {editingFleet && (
        <div className="fixed inset-0 z-50 bg-[#0a0b10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Configurar Frota</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{editingFleet.name}</p>
            </div>

            <div className="space-y-4">
              
              {/* Upgrade Plan selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Plano Contratado</label>
                <select
                  value={editingFleet.planId}
                  onChange={(e) => setEditingFleet({ ...editingFleet, planId: e.target.value })}
                  className="w-full bg-[#181b28] border border-[#232738] rounded-lg p-2 text-xs"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price}/mês)</option>
                  ))}
                </select>
              </div>

              {/* Vehicle limit input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Limite de Veículos</label>
                <input
                  type="number"
                  value={editingFleet.vehicleLimit}
                  onChange={(e) => setEditingFleet({ ...editingFleet, vehicleLimit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#181b28] border border-[#232738] rounded-lg p-2 text-xs"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#232738] pt-4">
              <button
                type="button"
                onClick={() => setEditingFleet(null)}
                className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFleetEdits}
                className="px-4 py-2 bg-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-700 text-white"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Fleet */}
      {isAddFleetOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0b10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFleet} className="glass-panel w-full max-w-md space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Criar Nova Frota Inquilina</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Cadastrar nova empresa no ecossistema FleeOS</p>
            </div>

            <div className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nome da Frota</label>
                <input
                  type="text"
                  required
                  value={newFleetName}
                  onChange={(e) => setNewFleetName(e.target.value)}
                  placeholder="Ex: Rápido SP Logística Ltda"
                  className="w-full bg-[#181b28] border border-[#232738] rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Plano Contratado</label>
                <select
                  value={newFleetPlan}
                  onChange={(e) => setNewFleetPlan(e.target.value)}
                  className="w-full bg-[#181b28] border border-[#232738] rounded-lg p-2 text-xs"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Limite Inicial de Veículos</label>
                <input
                  type="number"
                  value={newFleetLimit}
                  onChange={(e) => setNewFleetLimit(parseInt(e.target.value) || 10)}
                  className="w-full bg-[#181b28] border border-[#232738] rounded-lg p-2 text-xs"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#232738] pt-4">
              <button
                type="button"
                onClick={() => setIsAddFleetOpen(false)}
                className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-700 text-white"
              >
                Criar Inquilino
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
