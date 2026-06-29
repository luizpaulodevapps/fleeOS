import React, { useState, useEffect, useMemo, useRef } from "react";
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
  PlusCircle,
  Activity,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  Play,
  Pause,
  Trash2,
  Globe,
  Check
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

const CLOUD_REGIONS = [
  { id: "sa-east-1", name: "América do Sul (São Paulo)", basePing: 12, code: "GRU" },
  { id: "us-east-1", name: "EUA Leste (N. Virginia)", basePing: 74, code: "IAD" },
  { id: "eu-central-1", name: "Europa Central (Frankfurt)", basePing: 135, code: "FRA" },
  { id: "ap-southeast-1", name: "Ásia Pacífico (Singapura)", basePing: 218, code: "SIN" }
];

export default function App() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Telemetry Teleportation State
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(5.4);
  const [latency, setLatency] = useState(14);
  const [reqSec, setReqSec] = useState(45);
  const [errRate, setErrRate] = useState(0.02);

  // SaaS Operations Center State
  const [isStressTest, setIsStressTest] = useState(false);
  const [isCachePurging, setIsCachePurging] = useState(false);
  const [isGatewayRebooting, setIsGatewayRebooting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("sa-east-1");

  // Terminal state
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // UI Modals / Editors State
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [isAddFleetOpen, setIsAddFleetOpen] = useState(false);
  const [newFleetName, setNewFleetName] = useState("");
  const [newFleetPlan, setNewFleetPlan] = useState("pro");
  const [newFleetLimit, setNewFleetLimit] = useState(30);

  // Helpers to push logs
  const pushLog = (msg: string, type: "info" | "warn" | "error" | "success" = "info") => {
    const time = new Date().toTimeString().split(" ")[0];
    const prefix = {
      info: "ℹ️ [INFO]",
      warn: "⚠️ [WARN]",
      error: "🛑 [ERR]",
      success: "🚀 [OK]"
    }[type];
    
    setLogs(prev => {
      const next = [...prev, `[${time}] ${prefix} ${msg}`];
      // Keep last 100 logs
      return next.slice(-100);
    });
  };

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
      pushLog("Inquilinos e planos de cobrança carregados do banco de dados.", "success");
    } catch (e) {
      console.error(e);
      pushLog("Falha ao sincronizar dados com o banco operacional.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial logs
    const initialLogs = [
      `[${new Date().toTimeString().split(" ")[0]}] 🚀 [SYSTEM] FleetOS SaaS Stack Infra inicializado com sucesso.`,
      `[${new Date().toTimeString().split(" ")[0]}] ℹ️ [INFO] Conectado ao Gateway API centralizado (Edge Node v2.4.1).`,
      `[${new Date().toTimeString().split(" ")[0]}] ℹ️ [INFO] Monitoramento de saúde de clusters operando normalmente.`
    ];
    setLogs(initialLogs);
    loadData();
  }, []);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const timer = setInterval(() => {
      if (isLogsPaused) return;

      // Fluctuating values based on stress test mode
      if (isStressTest) {
        setCpu(prev => Math.min(98, Math.max(85, prev + (Math.random() * 4 - 2))));
        setRam(prev => Math.min(7.9, Math.max(7.2, prev + (Math.random() * 0.2 - 0.1))));
        setLatency(prev => Math.min(110, Math.max(78, prev + (Math.random() * 8 - 4))));
        setReqSec(prev => Math.min(480, Math.max(380, prev + Math.floor(Math.random() * 30 - 15))));
        setErrRate(prev => Math.min(0.65, Math.max(0.18, prev + (Math.random() * 0.05 - 0.02))));

        // Generate stress test warnings in logs
        const stressMsgs = [
          "Tráfego excessivo de requisições detectado no endpoint `/vehicles`.",
          "Latência do Gateway excedeu limite prudencial de 80ms.",
          "Taxa de erros de banco de dados atingiu pico crítico.",
          "Escalonador de microsserviços provisionando novos nós operacionais.",
          "Requisição de faturamento bloqueada temporariamente para evitar concorrência."
        ];
        if (Math.random() > 0.4) {
          pushLog(stressMsgs[Math.floor(Math.random() * stressMsgs.length)], Math.random() > 0.3 ? "warn" : "error");
        }
      } else {
        // Normal mode values
        setCpu(prev => Math.min(55, Math.max(28, prev + (Math.random() * 6 - 3))));
        setRam(prev => Math.min(6.2, Math.max(4.8, prev + (Math.random() * 0.1 - 0.05))));
        setLatency(prev => Math.min(22, Math.max(10, prev + (Math.random() * 2 - 1))));
        setReqSec(prev => Math.min(65, Math.max(32, prev + Math.floor(Math.random() * 8 - 4))));
        setErrRate(prev => Math.min(0.04, Math.max(0.01, prev + (Math.random() * 0.005 - 0.0025))));

        // Normal log logs
        const normalMsgs = [
          "Verificação de CNH de motorista concluída sem pendências.",
          "Verificando status de rastreamento via Webhook API.",
          "Checagem periódica de faturamento efetuada.",
          "Logs de transação financeira sincronizados para contabilidade.",
          "Status de manutenção preventiva atualizado na fila de OS.",
          "Limpeza de conexões ociosas completada no pool de dados."
        ];
        if (Math.random() > 0.75) {
          pushLog(normalMsgs[Math.floor(Math.random() * normalMsgs.length)], "info");
        }
      }
    }, isStressTest ? 800 : 2000);

    return () => clearInterval(timer);
  }, [isStressTest, isLogsPaused]);

  // Database Seeding function
  const handleSeedDatabase = async () => {
    try {
      setLoading(true);
      pushLog("Iniciando injeção de sementes (database seeding) no banco.", "info");
      
      if (isMock) {
        localStorage.setItem("fleetos_saas_plans", JSON.stringify(DEFAULT_PLANS));
        localStorage.setItem("fleetos_saas_fleets", JSON.stringify(DEFAULT_FLEETS));
        pushLog("Modo Mock: Planos e Frotas padrão inicializados no LocalStorage.", "success");
        await loadData();
        return;
      }

      // Live Firestore seeding
      await Promise.all([
        ...DEFAULT_PLANS.map(p => addDbDocument("saas_plans", p)),
        ...DEFAULT_FLEETS.map(f => addDbDocument("saas_fleets", f))
      ]);
      pushLog("Banco de dados Live Firestore populado com esquemas padrão.", "success");
      await loadData();
    } catch (e) {
      console.error(e);
      pushLog("Erro catastrófico ao registrar sementes de dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Status toggler (Block/Unblock)
  const handleToggleStatus = async (fleet: Fleet) => {
    const nextStatus = fleet.status === "active" ? "blocked" : "active";
    pushLog(`Alterando status da frota ${fleet.name} para: ${nextStatus.toUpperCase()}`, "info");
    try {
      await updateDbDocument("saas_fleets", fleet.id, { status: nextStatus });
      setFleets(prev => prev.map(f => f.id === fleet.id ? { ...f, status: nextStatus } : f));
      pushLog(`Status da frota ${fleet.name} atualizado com sucesso no banco.`, "success");
    } catch (e) {
      console.error(e);
      pushLog(`Erro ao salvar status operacional da frota ${fleet.name}.`, "error");
    }
  };

  // Update Plan Price
  const handleUpdatePlanPrice = async (planId: string, newPrice: number) => {
    try {
      await updateDbDocument("saas_plans", planId, { price: newPrice });
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, price: newPrice } : p));
      pushLog(`Preço da assinatura do plano '${planId}' ajustado para R$ ${newPrice}/mês.`, "success");
    } catch (e) {
      console.error(e);
      pushLog(`Falha ao sincronizar novo preço do plano '${planId}' no banco.`, "error");
    }
  };

  // Toggle plan module
  const handleTogglePlanModule = async (plan: Plan, moduleId: string) => {
    const hasModule = plan.enabledModules.includes(moduleId);
    const nextModules = hasModule 
      ? plan.enabledModules.filter(m => m !== moduleId)
      : [...plan.enabledModules, moduleId];

    try {
      await updateDbDocument("saas_plans", plan.id, { enabledModules: nextModules });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, enabledModules: nextModules } : p));
      pushLog(`Módulo '${moduleId}' ${hasModule ? 'desabilitado' : 'habilitado'} para o plano '${plan.name}'.`, "info");
    } catch (e) {
      console.error(e);
      pushLog(`Erro ao atualizar módulos do plano '${plan.name}'.`, "error");
    }
  };

  // Save edit fleet limits
  const handleSaveFleetEdits = async () => {
    if (!editingFleet) return;
    pushLog(`Atualizando parâmetros e limites operacionais da frota: ${editingFleet.name}`, "info");
    try {
      await updateDbDocument("saas_fleets", editingFleet.id, {
        vehicleLimit: editingFleet.vehicleLimit,
        planId: editingFleet.planId
      });
      setFleets(prev => prev.map(f => f.id === editingFleet.id ? editingFleet : f));
      pushLog(`Parâmetros da frota ${editingFleet.name} salvos. Novo limite: ${editingFleet.vehicleLimit} veículos.`, "success");
      setEditingFleet(null);
    } catch (e) {
      console.error(e);
      pushLog(`Erro ao atualizar limites de veículos da frota ${editingFleet.name}.`, "error");
    }
  };

  // Add new fleet tenant
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

    pushLog(`Processando cadastro de novo inquilino: ${newFleetName}`, "info");
    try {
      const added = await addDbDocument("saas_fleets", payload);
      setFleets(prev => [...prev, added]);
      pushLog(`Inquilino cadastrado com sucesso. ID: ${added.id}. Limite: ${newFleetLimit} veículos.`, "success");
      setIsAddFleetOpen(false);
      setNewFleetName("");
    } catch (e) {
      console.error(e);
      pushLog(`Erro ao registrar nova empresa inquilina.`, "error");
    }
  };

  // Purge CDN Cache simulation
  const handlePurgeCache = () => {
    setIsCachePurging(true);
    pushLog("Solicitado esvaziamento de cache da borda Cloudflare/CloudFront CDN...", "info");
    setTimeout(() => {
      setIsCachePurging(false);
      pushLog("Limpeza de cache de CDN completada com sucesso em todas as bordas globais.", "success");
    }, 1500);
  };

  // Reboot API Gateway simulation
  const handleRebootGateway = () => {
    setIsGatewayRebooting(true);
    pushLog("Comando emitido: Reinicializando pods do API Gateway FleetOS...", "warn");
    setTimeout(() => {
      setIsGatewayRebooting(false);
      pushLog("Pods do Gateway de API restaurados e saudáveis. Zero downtime registrado.", "success");
    }, 2000);
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

  // Latency multiplier based on selected region
  const latencyDisplay = useMemo(() => {
    const reg = CLOUD_REGIONS.find(r => r.id === selectedRegion);
    const base = reg ? reg.basePing : 12;
    // Utiliza a variável 'latency' para gerar uma oscilação dinâmica
    // e garantir que a UI atualize a cada ciclo de telemetria.
    const oscilacao = (latency % 7) - 3;
    return isStressTest 
      ? Math.round(base * 5.8) + oscilacao 
      : Math.round(base) + oscilacao;
  }, [selectedRegion, isStressTest, latency]);

  return (
    <div className="min-h-screen bg-[#07080d] text-[#f3f4f6] pb-12 font-sans grid-bg animate-scanline">
      
      {/* Top Glass Header */}
      <header className="border-b border-[#1b1f32] bg-[#0c0e17]/85 backdrop-blur-xl sticky top-0 z-35 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center glow-primary">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#07080d] animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-wider m-0 leading-none font-sans text-white">FLEETOS</h1>
            <p className="text-[9px] text-gray-500 font-bold tracking-widest mt-1">SAAS STACK INFRA CONSOLE</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMock && (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border border-amber-500/20">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Offline Sandboxed Db</span>
            </span>
          )}
          <button
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141824] hover:bg-[#1a2032] text-xs font-semibold rounded-lg border border-[#1b1f32] active:scale-95 transition-all text-gray-300"
            title="Inicializa frotas e planos de teste no banco"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Seed Database</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Core Infrastructure Health metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#2e3552] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total de Inquilinos</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-sans">{fleets.length}</h3>
              <p className="text-[9px] text-gray-500 mt-1">Frotas cadastradas</p>
            </div>
          </div>

          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#2e3552] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Veículos Registrados</span>
              <Car className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-sans">{totalVehicles}</h3>
              <p className="text-[9px] text-gray-500 mt-1">Ativos rodando no SaaS</p>
            </div>
          </div>

          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#2e3552] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Receita Mensal Est.</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-sans">R$ {faturamentoEstimado.toLocaleString("pt-BR")}</h3>
              <p className="text-[9px] text-gray-500 mt-1">ARR da stack infra</p>
            </div>
          </div>

          {/* TELEMETRY CPU & RAM */}
          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#2e3552] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gateway CPU / RAM</span>
              <Cpu className={`w-4 h-4 ${isStressTest ? "text-rose-500 animate-pulse" : "text-indigo-400"}`} />
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <h3 className={`text-2xl font-black font-sans ${isStressTest ? "text-rose-400 font-extrabold" : "text-white"}`}>
                  {cpu.toFixed(1)}%
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono font-bold">
                  <HardDrive className="w-3 h-3 text-indigo-400" />
                  <span>{ram.toFixed(1)}GB</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#181b28] rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    cpu > 80 ? "bg-rose-500" : cpu > 50 ? "bg-amber-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${cpu}%` }}
                />
              </div>
            </div>
          </div>

          {/* TELEMETRY LATENCY & TRAFFIC */}
          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-4 rounded-xl flex flex-col justify-between h-28 relative overflow-hidden col-span-2 lg:col-span-1 group hover:border-[#2e3552] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Latência Edge</span>
              <Activity className={`w-4 h-4 ${isStressTest ? "text-rose-500" : "text-emerald-400"}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-black font-sans ${isStressTest ? "text-rose-400" : "text-white"}`}>
                {latencyDisplay} ms
              </h3>
              <div className="flex justify-between items-center mt-1 text-[9px] text-gray-500 font-bold font-mono">
                <span>{reqSec} r/s</span>
                <span className={errRate > 0.1 ? "text-rose-400" : "text-emerald-400"}>ERR: {(errRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

        </section>

        {/* Middle Row: Tenant & Plan managers */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Frotas (Colspan 2) */}
          <div className="lg:col-span-2 bg-[#0e101a]/70 border border-[#1b1f32] p-6 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#1b1f32] pb-4">
              <div>
                <h2 className="text-md font-bold uppercase tracking-wide text-white">Inquilinos SaaS Registrados</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Gerenciamento e controle de limites de frotas ativas</p>
              </div>
              <button
                onClick={() => setIsAddFleetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg transition-colors active:scale-95 text-white glow-primary"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar Frota</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nome da empresa ou ID do banco..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#141622]/80 border border-[#1b1f32] rounded-xl outline-none focus:border-indigo-500 transition-colors text-xs"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500 italic text-xs">Aguardando resposta do banco de dados...</div>
            ) : filteredFleets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                Nenhuma frota inquilina encontrada. Execute o "Seed Database" para importar amostras.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFleets.map(fleet => {
                  const plan = plans.find(p => p.id === fleet.planId);
                  const usagePercent = Math.min(100, Math.round(((fleet.vehicleCount || 0) / (fleet.vehicleLimit || 1)) * 100));
                  
                  return (
                    <div key={fleet.id} className="p-4 bg-[#121420]/60 border border-[#1b1f32] rounded-xl space-y-4 hover:border-[#2e3552] transition-colors relative overflow-hidden">
                      
                      {/* Title & badges */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate" title={fleet.name}>{fleet.name}</h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">ID: {fleet.id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            fleet.status === "active" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {fleet.status === "active" ? "Ativa" : "Bloqueada"}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {plan ? plan.name : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Limit Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                          <span>Veículos: {fleet.vehicleCount || 0} / {fleet.vehicleLimit || 30}</span>
                          <span>{usagePercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#1a1c2a] rounded-full overflow-hidden border border-[#1b1f32]">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              usagePercent > 90 ? "bg-rose-500" : usagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between gap-2 border-t border-[#1b1f32] pt-3">
                        <button
                          onClick={() => handleToggleStatus(fleet)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-lg uppercase border transition-all active:scale-95 ${
                            fleet.status === "active" 
                              ? "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10" 
                              : "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                          }`}
                        >
                          {fleet.status === "active" ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Bloquear</span>
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
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-lg uppercase border border-[#1b1f32] bg-[#1a1c2a] hover:bg-[#25283c] text-gray-300 transition-all active:scale-95"
                        >
                          <Edit className="w-3 h-3 text-indigo-400" />
                          <span>Limites & Plano</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planos (Colspan 1) */}
          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-6 rounded-2xl space-y-6">
            <div className="border-b border-[#1b1f32] pb-4">
              <h2 className="text-md font-bold uppercase tracking-wide text-white">Precificação & Módulos</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Definição dos planos recorrentes do ecossistema</p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 text-xs italic">Buscando planos...</div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">Sem planos no banco. Execute Seed.</div>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => (
                  <div key={plan.id} className="p-4 bg-[#121420]/60 border border-[#1b1f32] rounded-xl space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs uppercase text-white tracking-wide">{plan.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{plan.description}</p>
                      </div>
                      <div className="flex items-center bg-[#171a2a] border border-[#1b1f32] rounded-lg px-2.5 py-1 shrink-0">
                        <span className="text-[10px] text-gray-550 font-extrabold mr-1">R$</span>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => handleUpdatePlanPrice(plan.id, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-transparent border-none p-0 outline-none text-right font-black text-xs text-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#1b1f32] pt-3 space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block">Módulos Liberados</span>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_MODULES.map(mod => {
                          const isEnabled = plan.enabledModules.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              onClick={() => handleTogglePlanModule(plan, mod.id)}
                              className={`flex items-center gap-1.5 justify-start text-[10px] p-1.5 rounded border text-left transition-colors ${
                                isEnabled 
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                                  : "bg-[#141624] border-[#1b1f32] text-gray-550 hover:text-gray-300"
                              }`}
                            >
                              {isEnabled ? <Check className="w-2.5 h-2.5 shrink-0" /> : <div className="w-2.5 h-2.5 border border-gray-650 rounded-sm shrink-0" />}
                              <span className="truncate">{mod.name}</span>
                            </button>
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

        {/* Global Cloud Regions Status Map */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cloud Nodes Map */}
          <div className="lg:col-span-2 bg-[#0e101a]/70 border border-[#1b1f32] p-6 rounded-2xl space-y-5">
            <div>
              <h2 className="text-md font-bold uppercase tracking-wide text-white">Nós Globais de Entrega (Edge Delivery Map)</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Ping, carga de microsserviços e balanceamento de conexões</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLOUD_REGIONS.map(reg => {
                const isSelected = reg.id === selectedRegion;
                const activeTenants = reg.id === "sa-east-1" ? fleets.length : reg.id === "us-east-1" ? 12 : reg.id === "eu-central-1" ? 8 : 2;
                const regPing = isStressTest ? Math.round(reg.basePing * 5.8) : Math.round(reg.basePing + (Math.random() * 4 - 2));
                const regCpu = isStressTest ? Math.min(99, Math.max(90, 92 + Math.floor(Math.random() * 6))) : Math.min(65, Math.max(12, Math.floor(reg.basePing / 3) + 15));

                return (
                  <div 
                    key={reg.id} 
                    onClick={() => {
                      setSelectedRegion(reg.id);
                      pushLog(`Monitoramento focado no nó regional: ${reg.name} (${reg.code})`, "info");
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-indigo-500/5 border-indigo-500/40 glow-primary" 
                        : "bg-[#121420]/60 border-[#1b1f32] hover:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-gray-400"}`} />
                        <h4 className="text-xs font-bold text-white">{reg.name}</h4>
                      </div>
                      <span className="font-mono text-[9px] bg-slate-800 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                        {reg.code}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1b1f32] text-[10px]">
                      <div>
                        <span className="text-gray-500 block uppercase text-[8px] font-bold">Ping</span>
                        <span className={`font-bold ${regPing > 200 ? "text-rose-400" : regPing > 100 ? "text-amber-400" : "text-emerald-400"}`}>
                          {regPing}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase text-[8px] font-bold">Tenants</span>
                        <span className="text-gray-300 font-bold">{activeTenants} ativos</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase text-[8px] font-bold">CPU load</span>
                        <span className={`font-bold ${regCpu > 85 ? "text-rose-400" : "text-gray-350"}`}>
                          {regCpu}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Infrastructure Controls */}
          <div className="bg-[#0e101a]/70 border border-[#1b1f32] p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-md font-bold uppercase tracking-wide text-white">Central de Operações de Infra</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Comandos operacionais e testes de estresse em tempo real</p>
            </div>

            <div className="space-y-4">
              
              {/* Stress Test */}
              <div className="p-4 bg-[#121420]/60 border border-[#1b1f32] rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${isStressTest ? "text-rose-500 animate-bounce" : "text-gray-400"}`} />
                    <span className="text-xs font-bold text-white">Simular Carga Crítica</span>
                  </div>
                  <p className="text-[9px] text-gray-500">Eleva tráfego artificial para testar resiliência</p>
                </div>

                <button
                  onClick={() => {
                    setIsStressTest(!isStressTest);
                    pushLog(`Stress Test de infra ${!isStressTest ? 'HABILITADO - Disparando 250 req/seg' : 'DESABILITADO - Normalizando tráfego'}`, !isStressTest ? "warn" : "success");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    isStressTest 
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse" 
                      : "bg-[#1d2238] hover:bg-[#282e4e] text-gray-350"
                  }`}
                >
                  {isStressTest ? "Ativo" : "Iniciar"}
                </button>
              </div>

              {/* Cache Purge */}
              <button
                onClick={handlePurgeCache}
                disabled={isCachePurging}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#121420]/60 hover:bg-[#1a1c2a] border border-[#1b1f32] hover:border-gray-700 text-xs font-bold rounded-xl text-gray-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isCachePurging ? "animate-spin" : ""}`} />
                <span>{isCachePurging ? "Limpando cache global..." : "Limpar cache global de CDN"}</span>
              </button>

              {/* API gateway reboot */}
              <button
                onClick={handleRebootGateway}
                disabled={isGatewayRebooting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#121420]/60 hover:bg-[#1a1c2a] border border-[#1b1f32] hover:border-gray-700 text-xs font-bold rounded-xl text-gray-300 transition-colors disabled:opacity-50"
              >
                <Server className={`w-3.5 h-3.5 text-emerald-400 ${isGatewayRebooting ? "animate-pulse" : ""}`} />
                <span>{isGatewayRebooting ? "Reiniciando pods gateway..." : "Reiniciar instâncias Gateway API"}</span>
              </button>

            </div>
          </div>

        </section>

        {/* Live Infrastructure scrolling log console */}
        <section className="bg-[#0b0c13] border border-[#1b1f32] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#1b1f32] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Console de Operações (Infra Live Logs)</h3>
                <p className="text-[9px] text-gray-505 mt-0.5">Logs emitidos em tempo real pelas instâncias do gateway FleetOS</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogsPaused(!isLogsPaused)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#141624] border border-[#1b1f32] text-[10px] rounded hover:bg-slate-800 text-gray-355 transition-colors"
                title={isLogsPaused ? "Resumir streaming" : "Pausar streaming"}
              >
                {isLogsPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                <span>{isLogsPaused ? "Resumir" : "Pausar"}</span>
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#141624] border border-[#1b1f32] text-[10px] rounded hover:bg-slate-800 text-gray-355 transition-colors"
                title="Limpar logs na tela"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Limpar</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-400">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-3 h-3 rounded bg-slate-900 border-[#1b1f32] text-indigo-500 focus:ring-0"
                />
                <span>Auto-scroll</span>
              </label>
            </div>
          </div>

          {/* Console logging output panel */}
          <div className="h-64 bg-[#050608] border border-[#141624] rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5 select-text scrollbar-thin">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic text-center py-12">Nenhum log emitido ainda. Aguarde a atividade da infraestrutura.</div>
            ) : (
              logs.map((log, index) => {
                let colorClass = "text-slate-400";
                if (log.includes("[ERR]")) colorClass = "text-rose-400 font-semibold";
                if (log.includes("[WARN]")) colorClass = "text-amber-400 font-semibold";
                if (log.includes("[OK]")) colorClass = "text-emerald-400 font-semibold";
                if (log.includes("[SYSTEM]")) colorClass = "text-indigo-400 font-bold";

                return (
                  <div key={index} className={`leading-relaxed break-all ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </section>

      </main>

      {/* MODAL: Configure limits & plan of fleet */}
      {editingFleet && (
        <div className="fixed inset-0 z-50 bg-[#07080d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a]/95 border border-[#1b1f32] p-6 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Configurar Frota Inquilina</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Ajuste de limites e assinatura de: {editingFleet.name}</p>
            </div>

            <div className="space-y-4">
              
              {/* Upgrade Plan selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Plano Contratado</label>
                <select
                  value={editingFleet.planId}
                  onChange={(e) => setEditingFleet({ ...editingFleet, planId: e.target.value })}
                  className="w-full bg-[#141624] border border-[#1b1f32] rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price}/mês)</option>
                  ))}
                </select>
              </div>

              {/* Vehicle limit input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Limite de Veículos no SaaS</label>
                <input
                  type="number"
                  value={editingFleet.vehicleLimit}
                  onChange={(e) => setEditingFleet({ ...editingFleet, vehicleLimit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#141624] border border-[#1b1f32] rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#1b1f32] pt-4">
              <button
                type="button"
                onClick={() => setEditingFleet(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFleetEdits}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white transition-colors glow-primary"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Fleet */}
      {isAddFleetOpen && (
        <div className="fixed inset-0 z-50 bg-[#07080d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFleet} className="bg-[#0e101a]/95 border border-[#1b1f32] p-6 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Criar Nova Frota Inquilina</h3>
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
                  className="w-full bg-[#141624] border border-[#1b1f32] rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Plano Contratado</label>
                <select
                  value={newFleetPlan}
                  onChange={(e) => setNewFleetPlan(e.target.value)}
                  className="w-full bg-[#141624] border border-[#1b1f32] rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
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
                  className="w-full bg-[#141624] border border-[#1b1f32] rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#1b1f32] pt-4">
              <button
                type="button"
                onClick={() => setIsAddFleetOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white transition-colors glow-primary"
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
