"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  Building2,
  CalendarClock,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  Flame,
  Gauge,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tags,
  UserRoundCog,
  Warehouse,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type View = "overview" | "permits" | "processes" | "accreditation" | "deaccreditation" | "vendas" | "dispatchers" | "points" | "equipment" | "agenda";
type PermitStatus = "available" | "linked" | "suspended" | "deposited" | "deregistered";
type ProcessType = "replacement" | "accreditation" | "deaccreditation";

type Permit = {
  id: string;
  permitNumber: string;
  status?: string;
  currentVehicleId?: string | null;
  pointId?: string | null;
  ownerName?: string;
  permissionHolder?: string;
  expirationDate?: string;
  history?: Array<{ date: string; vehicleId?: string | null; action: string }>;
};

type RegulatoryProcess = {
  id: string;
  permitId: string;
  oldVehicleId?: string | null;
  newVehicleId?: string | null;
  processType: ProcessType;
  status: "open" | "in_progress" | "waiting" | "blocked" | "completed" | "cancelled";
  stage?: string;
  workOrderNumber?: string;
  dispatcherId?: string;
  responsibleUser?: string;
  deadline?: string;
  estimatedCost?: number;
  actualCost?: number;
  checklist?: Record<string, boolean>;
  createdAt?: string;
  completedAt?: string;
};

type Expiration = {
  id: string;
  type: string;
  subject: string;
  date: string;
  days: number;
  permitId?: string;
  vehicleId?: string;
};

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const PROCESS_LABELS: Record<ProcessType, string> = {
  replacement: "Substituição",
  accreditation: "Credenciamento",
  deaccreditation: "Descredenciamento",
};

const PROCESS_STAGES = [
  { id: "opened", label: "OS aberta", tone: "bg-slate-500" },
  { id: "dismantling", label: "Desmontagem", tone: "bg-orange-500" },
  { id: "permit_available", label: "Alvará liberado", tone: "bg-cyan-600" },
  { id: "preparing_vehicle", label: "Preparação do novo", tone: "bg-violet-600" },
  { id: "inspection", label: "Vistoria e vínculo", tone: "bg-amber-500" },
  { id: "completed", label: "Concluído", tone: "bg-emerald-600" },
] as const;

const OLD_VEHICLE_CHECKLIST = [
  ["removeTaximeter", "Remover taxímetro"],
  ["removeIpemSeal", "Retirar selo IPEM"],
  ["closeOperation", "Encerrar operação"],
  ["issueExitDocuments", "Emitir documentação"],
  ["unlinkDtp", "Baixar vínculo DTP"],
  ["releasePermit", "Liberar alvará"],
] as const;

const NEW_VEHICLE_CHECKLIST = [
  ["invoice", "Nota fiscal"],
  ["detranRegistration", "Registro DETRAN"],
  ["plates", "Placas"],
  ["renavam", "Renavam"],
  ["dtpPreRegistration", "Pré-cadastro DTP"],
  ["installTaximeter", "Instalação do taxímetro"],
  ["installNumberKit", "Instalação do kit número"],
  ["ipemInspection", "Aferição IPEM"],
  ["dtpApproval", "Aprovação DTP"],
  ["linkPermit", "Vinculação do alvará"],
] as const;

const money = (value = 0) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const shortDate = (value?: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "Sem data";
const daysUntil = (value: string) => Math.ceil((new Date(`${value.slice(0, 10)}T00:00:00`).getTime() - TODAY.getTime()) / 86400000);
const isExpired = (value?: string) => Boolean(value && daysUntil(value) < 0);

function normalizePermitStatus(permit: Permit): PermitStatus {
  if (permit.status === "deposited") return "deposited";
  if (permit.status === "suspended") return "suspended";
  if (["deregistered", "cancelled"].includes(String(permit.status))) return "deregistered";
  if (permit.currentVehicleId) return "linked";
  return "available";
}

function processStage(process: RegulatoryProcess) {
  if (process.status === "completed") return "completed";
  if (process.stage) return process.stage;
  if (process.processType === "accreditation") return "preparing_vehicle";
  if (process.processType === "deaccreditation") return "dismantling";
  return "opened";
}

export default function DispatcherPage() {
  const { currentUser, getCollection, addDocument, updateDocument } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [processes, setProcesses] = useState<RegulatoryProcess[]>([]);
  const [dispatchers, setDispatchers] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [gnv, setGnv] = useState<any[]>([]);
  const [taximeters, setTaximeters] = useState<any[]>([]);
  const [driverRegulatory, setDriverRegulatory] = useState<any[]>([]);
  const [view, setView] = useState<View>("overview");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"process" | "permit" | "dispatcher" | "point" | null>(null);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<RegulatoryProcess | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [v, d, a, p, rp, rd, tp, ri, gas, tax, dr] = await Promise.all([
        getCollection("vehicles"),
        getCollection("drivers"),
        getCollection("vehicle_assignments"),
        getCollection("permits"),
        getCollection("regulatory_processes"),
        getCollection("regulatory_dispatchers"),
        getCollection("taxi_points"),
        getCollection("regulatory_inspections"),
        getCollection("gnv_registries"),
        getCollection("taximeter_registry"),
        getCollection("driver_regulatory"),
      ]);
      setVehicles(v || []);
      setDrivers(d || []);
      setAssignments(a || []);
      setPermits((p || []) as Permit[]);
      setProcesses((rp || []) as RegulatoryProcess[]);
      setDispatchers(rd || []);
      setPoints(tp || []);
      setInspections(ri || []);
      setGnv(gas || []);
      setTaximeters(tax || []);
      setDriverRegulatory(dr || []);
    } catch (error) {
      console.error("Erro ao carregar a central regulatória:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const vehicleName = (id?: string | null) => {
    const vehicle = vehicles.find((item) => item.id === id);
    return vehicle ? `${vehicle.brand || ""} ${vehicle.model || ""} · ${vehicle.plate || "Sem placa"}`.trim() : "Nenhum veículo";
  };

  const driverForVehicle = (vehicleId?: string | null) => {
    const assignment = assignments.find((item) => item.vehicleId === vehicleId && item.active === true);
    return drivers.find((driver) => driver.id === assignment?.driverId);
  };

  const pointForPermit = (permit: Permit) => points.find((point) => point.id === permit.pointId);

  const enrichedPermits = useMemo(() => permits.map((permit) => {
    const status = normalizePermitStatus(permit);
    const point = points.find((item) => item.id === permit.pointId);
    const vehicle = vehicles.find((item) => item.id === permit.currentVehicleId);
    const driver = driverForVehicle(permit.currentVehicleId);
    const pointBlocked = Boolean(point && (point.status !== "active" || isExpired(point.expirationDate)));
    return { ...permit, normalizedStatus: status, point, vehicle, driver, pointBlocked };
  }), [permits, points, vehicles, drivers, assignments]);

  const expirations = useMemo<Expiration[]>(() => {
    const rows: Expiration[] = [];
    const add = (id: string, type: string, subject: string, expirationDate?: string, permitId?: string, vehicleId?: string) => {
      if (!expirationDate) return;
      const days = daysUntil(expirationDate);
      if (days <= 90) rows.push({ id, type, subject, date: expirationDate, days, permitId, vehicleId });
    };
    permits.forEach((permit) => add(`permit-${permit.id}`, "ALVARÁ", `Alvará ${permit.permitNumber}`, permit.expirationDate, permit.id, permit.currentVehicleId || undefined));
    points.forEach((point) => add(`point-${point.id}`, "PONTO", point.name, point.expirationDate));
    inspections.forEach((item) => add(`inspection-${item.id}`, String(item.type || "VISTORIA").toUpperCase(), vehicleName(item.vehicleId), item.validUntil, undefined, item.vehicleId));
    gnv.forEach((item) => add(`gnv-${item.id}`, "GNV", vehicleName(item.vehicleId), item.expirationDate, undefined, item.vehicleId));
    taximeters.forEach((item) => add(`taximeter-${item.id}`, "TAXÍMETRO", vehicleName(item.vehicleId), item.validUntil, undefined, item.vehicleId));
    driverRegulatory.forEach((item) => add(`condutax-${item.id}`, "CONDUTAX", drivers.find((driver) => driver.id === item.driverId)?.name || "Condutor", item.expirationDate));
    return rows.sort((a, b) => a.days - b.days);
  }, [permits, points, inspections, gnv, taximeters, driverRegulatory, drivers, vehicles]);

  const activeProcesses = processes.filter((process) => !["completed", "cancelled"].includes(process.status));
  const stats = {
    active: activeProcesses.length,
    replacements: activeProcesses.filter((process) => process.processType === "replacement").length,
    accreditations: activeProcesses.filter((process) => process.processType === "accreditation").length,
    deaccreditations: activeProcesses.filter((process) => process.processType === "deaccreditation").length,
    available: enrichedPermits.filter((permit) => ["available", "deposited"].includes(permit.normalizedStatus)).length,
    dueSoon: expirations.filter((item) => item.days <= 30).length,
    blockedByPoint: enrichedPermits.filter((permit) => permit.pointBlocked && permit.normalizedStatus === "linked").length,
  };

  const createProcess = async (form: any) => {
    setSaving(true);
    try {
      const permit = permits.find((item) => item.id === form.permitId);
      const sequence = processes.length + 1;
      await addDocument("regulatory_processes", {
        permitId: form.permitId,
        oldVehicleId: form.processType === "accreditation" ? null : form.oldVehicleId || permit?.currentVehicleId || null,
        newVehicleId: form.processType === "deaccreditation" ? null : form.newVehicleId || null,
        processType: form.processType,
        status: "open",
        stage: form.processType === "accreditation" ? "preparing_vehicle" : "opened",
        workOrderNumber: `OS-REG-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`,
        dispatcherId: form.dispatcherId || null,
        responsibleUser: currentUser?.displayName || "Central Regulatória",
        deadline: form.deadline,
        estimatedCost: Number(form.estimatedCost || 0),
        actualCost: 0,
        checklist: {},
      });
      setModal(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const createPermit = async (form: any) => {
    setSaving(true);
    try {
      await addDocument("permits", {
        permitNumber: form.permitNumber,
        ownerId: "fleet-owner",
        ownerName: form.permissionHolder,
        permissionHolder: form.permissionHolder,
        currentVehicleId: null,
        pointId: form.pointId || null,
        expirationDate: form.expirationDate,
        status: form.status,
        history: [{ date: new Date().toISOString(), vehicleId: null, action: "Alvará incluído no estoque" }],
      });
      setModal(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const createDispatcher = async (form: any) => {
    setSaving(true);
    try {
      await addDocument("regulatory_dispatchers", { ...form, status: "active" });
      setModal(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const createPoint = async (form: any) => {
    setSaving(true);
    try {
      await addDocument("taxi_points", { ...form, status: "active" });
      setModal(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const savePermit = async (permit: Permit, form: any) => {
    setSaving(true);
    try {
      await updateDocument("permits", permit.id, {
        permissionHolder: form.permissionHolder,
        ownerName: form.permissionHolder,
        pointId: form.pointId || null,
        expirationDate: form.expirationDate,
        status: form.status,
        currentVehicleId: form.status === "deposited" || form.status === "available" ? null : permit.currentVehicleId || null,
      });
      if (permit.currentVehicleId) {
        const point = points.find((item) => item.id === form.pointId);
        const blocked = Boolean(point && (point.status !== "active" || isExpired(point.expirationDate)));
        await updateDocument("vehicles", permit.currentVehicleId, {
          regulatoryBlocked: blocked,
          regulatoryBlockReason: blocked ? `Ponto de táxi ${point.name} vencido ou inativo` : "",
          ...(blocked ? { status: "blocked_regulatory" } : {}),
        });
      }
      setSelectedPermit(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const saveProcess = async (process: RegulatoryProcess, form: any, checklist: Record<string, boolean>) => {
    setSaving(true);
    try {
      const oldDone = process.processType === "accreditation" || OLD_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
      const newDone = process.processType === "deaccreditation" || NEW_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
      let stage = processStage(process);
      if (!oldDone && process.processType !== "accreditation") stage = "dismantling";
      else if (oldDone && process.processType === "deaccreditation") stage = "permit_available";
      else if (oldDone && !newDone) stage = checklist.ipemInspection || checklist.dtpApproval ? "inspection" : "preparing_vehicle";
      await updateDocument("regulatory_processes", process.id, {
        dispatcherId: form.dispatcherId || null,
        deadline: form.deadline,
        estimatedCost: Number(form.estimatedCost || 0),
        actualCost: Number(form.actualCost || 0),
        checklist,
        stage,
        status: "in_progress",
      });
      await loadData();
      setSelectedProcess((current) => current ? { ...current, ...form, checklist, stage, status: "in_progress" } : current);
    } finally { setSaving(false); }
  };

  const releasePermit = async (process: RegulatoryProcess) => {
    const checklist = process.checklist || {};
    if (process.processType === "accreditation" || !OLD_VEHICLE_CHECKLIST.every(([id]) => checklist[id])) return;
    const permit = permits.find((item) => item.id === process.permitId);
    if (!permit) return;
    setSaving(true);
    try {
      await updateDocument("permits", permit.id, {
        currentVehicleId: null,
        status: "deposited",
        history: [...(permit.history || []), { date: new Date().toISOString(), vehicleId: process.oldVehicleId || null, action: `Liberado pela ${process.workOrderNumber}` }],
      });
      if (process.oldVehicleId) await updateDocument("vehicles", process.oldVehicleId, { alvaraNumber: "", status: "inactive", regulatoryBlocked: true, regulatoryBlockReason: "Descredenciado do alvará" });
      await updateDocument("regulatory_processes", process.id, { checklist: process.checklist || {}, stage: "permit_available", status: process.processType === "deaccreditation" ? "completed" : "in_progress", ...(process.processType === "deaccreditation" ? { completedAt: new Date().toISOString() } : {}) });
      setSelectedProcess(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const finishProcess = async (process: RegulatoryProcess) => {
    const checklist = process.checklist || {};
    const oldDone = process.processType === "accreditation" || OLD_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
    const newDone = process.processType === "deaccreditation" || NEW_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
    if (!oldDone || !newDone || (process.processType !== "deaccreditation" && !process.newVehicleId)) return;
    const permit = permits.find((item) => item.id === process.permitId);
    if (!permit) return;
    setSaving(true);
    try {
      if (process.processType !== "deaccreditation") {
        const point = pointForPermit(permit);
        const blocked = Boolean(point && (point.status !== "active" || isExpired(point.expirationDate)));
        await updateDocument("permits", permit.id, {
          currentVehicleId: process.newVehicleId,
          status: "linked",
          history: [...(permit.history || []), { date: new Date().toISOString(), vehicleId: process.newVehicleId, action: `Vinculado pela ${process.workOrderNumber}` }],
        });
        await updateDocument("vehicles", process.newVehicleId!, {
          alvaraNumber: permit.permitNumber,
          status: blocked ? "blocked_regulatory" : "active",
          regulatoryBlocked: blocked,
          regulatoryBlockReason: blocked ? `Ponto de táxi ${point?.name} vencido ou inativo` : "",
        });
      }
      await updateDocument("regulatory_processes", process.id, { checklist: process.checklist || {}, status: "completed", stage: "completed", completedAt: new Date().toISOString() });
      setSelectedProcess(null);
      await loadData();
    } finally { setSaving(false); }
  };

  const handleUpdateVehicle = async (vehicleId: string, updates: any) => {
    setSaving(true);
    try {
      await updateDocument("vehicles", vehicleId, updates);
      await loadData();
    } catch (e) {
      console.error("Erro ao atualizar veículo", e);
    } finally {
      setSaving(false);
    }
  };

  const navigation = [
    { id: "overview", label: "Visão geral", icon: LayoutDashboard },
    { id: "permits", label: "Alvarás", icon: Warehouse, badge: stats.available },
    { id: "processes", label: "Substituições", icon: RefreshCw, badge: stats.replacements },
    { id: "accreditation", label: "Recepção 0 km & Credenciamento", icon: BadgeCheck },
    { id: "deaccreditation", label: "Descredenciamento", icon: Tags },
    { id: "vendas", label: "Venda de Ativos", icon: CircleDollarSign },
    { id: "dispatchers", label: "Despachantes", icon: UserRoundCog },
    { id: "points", label: "Pontos", icon: MapPin },
    { id: "equipment", label: "Taxímetro e GNV", icon: Gauge },
    { id: "agenda", label: "Agenda", icon: CalendarClock, badge: stats.dueSoon },
  ] as const;

  const visibleProcesses = processes.filter((process) => {
    if (view === "processes") return process.processType === "replacement";
    if (view === "accreditation") return process.processType === "accreditation";
    if (view === "deaccreditation") return process.processType === "deaccreditation";
    return true;
  });

  if (loading) return <div className="min-h-[520px] flex flex-col items-center justify-center gap-3"><RefreshCw className="w-7 h-7 animate-spin text-indigo-600" /><p className="text-sm font-semibold text-slate-500">Organizando alvarás e ordens regulatórias...</p></div>;

  return (
    <div className="min-w-0 space-y-5 text-slate-900">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 mb-2"><BadgeCheck className="w-4 h-4" /> Gestão regulatória de táxis · São Paulo</div><h1 className="font-geist text-2xl md:text-3xl font-black tracking-tight text-slate-950">Central Regulatória</h1><p className="text-sm text-slate-500 mt-1">Alvará, veículo e motorista tratados na ordem real da operação.</p></div>
        <div className="flex items-center gap-2"><button onClick={loadData} className="h-10 w-10 grid place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setModal("process")} className="h-10 px-4 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Nova OS regulatória</button></div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <Metric label="Processos ativos" value={stats.active} icon={ClipboardList} tone="indigo" />
        <Metric label="Substituições" value={stats.replacements} icon={RefreshCw} tone="violet" />
        <Metric label="Credenciamentos" value={stats.accreditations} icon={BadgeCheck} tone="blue" />
        <Metric label="Descredenciamentos" value={stats.deaccreditations} icon={Tags} tone="slate" />
        <Metric label="Alvarás livres" value={stats.available} icon={Warehouse} tone="emerald" />
        <Metric label="Vencimentos" value={stats.dueSoon} icon={CalendarClock} tone="amber" />
        <Metric label="Bloqueios de ponto" value={stats.blockedByPoint} icon={ShieldAlert} tone="red" />
      </section>

      <div className="border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-2">
        <nav className="flex overflow-x-auto gap-0.5">{navigation.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setView(item.id)} className={`h-11 px-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 text-[10px] font-bold ${view === item.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}><Icon className="w-3.5 h-3.5" />{item.label}{"badge" in item && item.badge > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-slate-100 grid place-items-center text-[9px]">{item.badge}</span>}</button>; })}</nav>
        {(view === "permits" || view === "processes" || view === "accreditation" || view === "deaccreditation") && <label className="relative pb-2 xl:w-64"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar alvará, placa ou OS" className="reg-input pl-9" /></label>}
      </div>

      {view === "overview" && <Overview processes={activeProcesses} permits={enrichedPermits} expirations={expirations} dispatchers={dispatchers} vehicleName={vehicleName} onProcess={setSelectedProcess} onPermit={setSelectedPermit} />}
      {view === "permits" && <PermitsView permits={enrichedPermits} query={query} onOpen={setSelectedPermit} onNew={() => setModal("permit")} />}
      {(view === "processes" || view === "accreditation" || view === "deaccreditation") && <ProcessesView processes={visibleProcesses} permits={permits} dispatchers={dispatchers} query={query} vehicleName={vehicleName} onOpen={setSelectedProcess} onNew={() => setModal("process")} />}
      {view === "vendas" && <AssetSalesView vehicles={vehicles} dispatchers={dispatchers} onUpdateVehicle={handleUpdateVehicle} />}
      {view === "dispatchers" && <DispatchersView dispatchers={dispatchers} processes={processes} onNew={() => setModal("dispatcher")} />}
      {view === "points" && <PointsView points={points} permits={enrichedPermits} onNew={() => setModal("point")} />}
      {view === "equipment" && <EquipmentView taximeters={taximeters} gnv={gnv} inspections={inspections} vehicleName={vehicleName} />}
      {view === "agenda" && <AgendaView expirations={expirations} />}

      {modal === "process" && <ProcessModal permits={enrichedPermits} vehicles={vehicles} dispatchers={dispatchers} saving={saving} onSubmit={createProcess} onClose={() => setModal(null)} />}
      {modal === "permit" && <PermitModal points={points} saving={saving} onSubmit={createPermit} onClose={() => setModal(null)} />}
      {modal === "dispatcher" && <DispatcherModal saving={saving} onSubmit={createDispatcher} onClose={() => setModal(null)} />}
      {modal === "point" && <PointModal saving={saving} onSubmit={createPoint} onClose={() => setModal(null)} />}
      {selectedPermit && <PermitDrawer permit={selectedPermit} points={points} vehicleName={vehicleName} driver={driverForVehicle(selectedPermit.currentVehicleId)} saving={saving} onSave={savePermit} onClose={() => setSelectedPermit(null)} />}
      {selectedProcess && <ProcessDrawer process={selectedProcess} permit={permits.find((item) => item.id === selectedProcess.permitId)} dispatchers={dispatchers} vehicleName={vehicleName} saving={saving} onSave={saveProcess} onRelease={releasePermit} onFinish={finishProcess} onClose={() => setSelectedProcess(null)} />}
      <style jsx global>{`.reg-input{width:100%;height:38px;border:1px solid #e2e8f0;border-radius:.75rem;padding-right:.75rem;background:#fff;font-size:.75rem;outline:none}.reg-input:focus{border-color:#818cf8;box-shadow:0 0 0 3px #eef2ff}.reg-field{width:100%;height:42px;border:1px solid #e2e8f0;border-radius:.75rem;padding:0 .75rem;background:#fff;font-size:.75rem;outline:none}.reg-field:focus{border-color:#818cf8;box-shadow:0 0 0 3px #eef2ff}.drawer-section{border:1px solid #e2e8f0;border-radius:1rem;background:#fff;padding:1rem}.drawer-title{font-size:.75rem;font-weight:900;color:#1e293b}.primary-action{width:100%;height:44px;border-radius:.75rem;background:#4f46e5;color:#fff;font-size:.75rem;font-weight:800}.primary-action:hover{background:#4338ca}.primary-action:disabled{opacity:.45}`}</style>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }: any) {
  const tones: Record<string, string> = { indigo: "bg-indigo-50 text-indigo-600", violet: "bg-violet-50 text-violet-600", blue: "bg-blue-50 text-blue-600", slate: "bg-slate-100 text-slate-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600" };
  return <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm"><div className="flex items-center justify-between gap-2"><span className="text-[9px] font-black uppercase tracking-wide text-slate-400 truncate">{label}</span><span className={`w-7 h-7 rounded-lg grid place-items-center ${tones[tone]}`}><Icon className="w-3.5 h-3.5" /></span></div><p className="font-geist text-2xl font-black mt-2">{value}</p></div>;
}

function Overview({ processes, permits, expirations, dispatchers, vehicleName, onProcess, onPermit }: any) {
  return <div className="grid xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] gap-5"><section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><SectionHeader title="Ordens regulatórias em andamento" subtitle="A execução começa no alvará e registra o veículo que sai e o que entra." icon={ClipboardList} /><div className="divide-y divide-slate-100">{processes.slice(0, 8).map((process: RegulatoryProcess) => <ProcessRow key={process.id} process={process} permit={permits.find((item: any) => item.id === process.permitId)} dispatcher={dispatchers.find((item: any) => item.id === process.dispatcherId)} vehicleName={vehicleName} onOpen={() => onProcess(process)} />)}{processes.length === 0 && <Empty label="Nenhuma OS regulatória ativa." />}</div></section><div className="space-y-5"><section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><SectionHeader title="Estoque de alvarás" subtitle="Disponibilidade real do principal ativo regulatório." icon={Warehouse} /><div className="grid grid-cols-2 gap-2 p-4">{(["available", "linked", "suspended", "deposited", "deregistered"] as PermitStatus[]).map((status) => <PermitCount key={status} status={status} count={permits.filter((permit: any) => permit.normalizedStatus === status).length} />)}</div><div className="border-t border-slate-100 p-3 space-y-2">{permits.filter((permit: any) => ["available", "deposited"].includes(permit.normalizedStatus)).slice(0, 4).map((permit: any) => <button key={permit.id} onClick={() => onPermit(permit)} className="w-full flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-left"><span className="font-mono text-xs font-black">{permit.permitNumber}</span><span className="text-[9px] font-bold text-emerald-700">{permit.normalizedStatus === "deposited" ? "DEPOSITADO" : "LIVRE"}</span></button>)}</div></section><section className="bg-slate-950 text-white rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-[9px] uppercase font-black tracking-wide text-slate-400">Agenda crítica</p><p className="font-geist text-3xl font-black mt-2">{expirations.filter((item: Expiration) => item.days <= 30).length}</p></div><CalendarClock className="w-7 h-7 text-amber-400" /></div><div className="mt-4 space-y-2">{expirations.slice(0, 3).map((item: Expiration) => <div key={item.id} className="flex justify-between text-[10px]"><span className="text-slate-300 truncate">{item.type} · {item.subject}</span><strong className={item.days < 0 ? "text-red-400" : "text-amber-400"}>{item.days < 0 ? `${Math.abs(item.days)}d vencido` : `${item.days}d`}</strong></div>)}</div></section></div></div>;
}

function PermitsView({ permits, query, onOpen, onNew }: any) {
  const [filter, setFilter] = useState<"all" | PermitStatus>("all");
  const term = query.toLowerCase();
  const rows = permits.filter((permit: any) => (filter === "all" || permit.normalizedStatus === filter) && (!term || [permit.permitNumber, permit.permissionHolder, permit.ownerName, permit.vehicle?.plate].some((value) => String(value || "").toLowerCase().includes(term))));
  return <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="font-geist font-black">Estoque de alvarás</h2><p className="text-xs text-slate-500 mt-1">O veículo pode ser nulo. O alvará continua existindo e preserva seu histórico.</p></div><button onClick={onNew} className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Novo alvará</button></div><div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto">{(["all", "available", "linked", "suspended", "deposited", "deregistered"] as const).map((status) => <button key={status} onClick={() => setFilter(status)} className={`h-8 px-3 rounded-lg text-[9px] font-bold whitespace-nowrap ${filter === status ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>{status === "all" ? "Todos" : statusLabel(status)}</button>)}</div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Alvará</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Veículo</th><th className="px-5 py-3">Motorista</th><th className="px-5 py-3">Ponto</th><th className="px-5 py-3">Validade</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((permit: any) => <tr key={permit.id} className={permit.pointBlocked ? "bg-red-50/40" : ""}><td className="px-5 py-4"><p className="font-mono text-xs font-black">{permit.permitNumber}</p><p className="text-[9px] text-slate-400 mt-1">{permit.permissionHolder || permit.ownerName}</p></td><td className="px-5 py-4"><StatusBadge status={permit.normalizedStatus} /></td><td className="px-5 py-4 text-xs font-semibold">{permit.vehicle ? `${permit.vehicle.brand} ${permit.vehicle.model} · ${permit.vehicle.plate}` : <span className="text-slate-400">Nenhum</span>}</td><td className="px-5 py-4 text-xs text-slate-500">{permit.driver?.name || "Nenhum"}</td><td className="px-5 py-4 text-xs"><span className={permit.pointBlocked ? "text-red-600 font-bold" : "text-slate-500"}>{permit.point?.name || "Não definido"}</span>{permit.pointBlocked && <p className="text-[8px] text-red-500 mt-1">BLOQUEIO REGULATÓRIO</p>}</td><td className="px-5 py-4 text-xs text-slate-500">{shortDate(permit.expirationDate)}</td><td className="px-5 py-4"><button onClick={() => onOpen(permit)} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button></td></tr>)}</tbody></table></div>{rows.length === 0 && <Empty label="Nenhum alvará encontrado." />}</section>;
}

function ProcessesView({ processes, permits, dispatchers, query, vehicleName, onOpen, onNew }: any) {
  const term = query.toLowerCase();
  const rows = processes.filter((process: RegulatoryProcess) => { const permit = permits.find((item: Permit) => item.id === process.permitId); return !term || [process.workOrderNumber, permit?.permitNumber, vehicleName(process.oldVehicleId), vehicleName(process.newVehicleId)].some((value) => String(value || "").toLowerCase().includes(term)); });
  return <section><div className="flex items-center justify-between mb-3"><div><h2 className="font-geist font-black">Processos regulatórios</h2><p className="text-xs text-slate-500 mt-1">Ordens de serviço vinculadas ao alvará.</p></div><button onClick={onNew} className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Nova OS</button></div><div className="overflow-x-auto pb-3"><div className="grid grid-cols-6 gap-3 min-w-[1320px]">{PROCESS_STAGES.map((stage) => { const cards = rows.filter((process: RegulatoryProcess) => processStage(process) === stage.id); return <div key={stage.id} className="rounded-2xl bg-slate-100/80 border border-slate-200 p-2 min-h-[420px]"><div className="px-2 py-2 flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-black"><i className={`w-2 h-2 rounded-full ${stage.tone}`} />{stage.label}</span><span className="text-[9px] bg-white border border-slate-200 rounded px-1.5 py-0.5">{cards.length}</span></div><div className="space-y-2 mt-1">{cards.map((process: RegulatoryProcess) => <ProcessCard key={process.id} process={process} permit={permits.find((item: Permit) => item.id === process.permitId)} dispatcher={dispatchers.find((item: any) => item.id === process.dispatcherId)} vehicleName={vehicleName} onOpen={() => onOpen(process)} />)}{cards.length === 0 && <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center text-[9px] text-slate-400">Sem processos</div>}</div></div>; })}</div></div></section>;
}

function DispatchersView({ dispatchers, processes, onNew }: any) {
  return <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-geist font-black">Despachantes</h2><p className="text-xs text-slate-500 mt-1">Executores externos ou internos das ordens regulatórias.</p></div><button onClick={onNew} className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Novo despachante</button></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">{dispatchers.map((dispatcher: any) => { const active = processes.filter((process: RegulatoryProcess) => process.dispatcherId === dispatcher.id && !["completed", "cancelled"].includes(process.status)).length; return <div key={dispatcher.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between"><span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><Building2 className="w-5 h-5" /></span><span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">ATIVO</span></div><h3 className="text-sm font-black mt-4">{dispatcher.name}</h3><p className="text-[10px] text-slate-400 mt-1">{dispatcher.type === "company" ? "Empresa despachante" : "Despachante interno"}</p><div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"><span className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{dispatcher.phone || "Sem telefone"}</span><strong className="text-xs">{active} OS ativas</strong></div></div>; })}{dispatchers.length === 0 && <Empty label="Nenhum despachante cadastrado." />}</div></section>;
}

function PointsView({ points, permits, onNew }: any) {
  return <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-geist font-black">Pontos de táxi</h2><p className="text-xs text-slate-500 mt-1">O vencimento do ponto bloqueia regulatoriamente os veículos vinculados.</p></div><button onClick={onNew} className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Novo ponto</button></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">{points.map((point: any) => { const expired = isExpired(point.expirationDate) || point.status !== "active"; const linked = permits.filter((permit: any) => permit.pointId === point.id); return <div key={point.id} className={`rounded-2xl border p-4 ${expired ? "border-red-200 bg-red-50/40" : "border-slate-200"}`}><div className="flex items-start justify-between"><MapPin className={`w-5 h-5 ${expired ? "text-red-500" : "text-indigo-500"}`} /><span className={`text-[9px] font-bold rounded-full px-2 py-1 ${expired ? "bg-red-100 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{expired ? "VENCIDO / INATIVO" : "ATIVO"}</span></div><h3 className="text-sm font-black mt-4">{point.name}</h3><p className="text-[10px] text-slate-500 mt-1">{point.code || point.address || "Sem código informado"}</p><div className="grid grid-cols-2 gap-2 mt-4"><div className="rounded-xl bg-white border border-slate-200 p-3"><p className="text-[9px] text-slate-400">Validade</p><p className="text-xs font-bold mt-1">{shortDate(point.expirationDate)}</p></div><div className="rounded-xl bg-white border border-slate-200 p-3"><p className="text-[9px] text-slate-400">Alvarás</p><p className="text-xs font-bold mt-1">{linked.length}</p></div></div>{expired && linked.some((permit: any) => permit.normalizedStatus === "linked") && <div className="mt-3 text-[9px] font-bold text-red-700 flex gap-1.5"><Ban className="w-3 h-3" /> Locação bloqueada para {linked.filter((permit: any) => permit.normalizedStatus === "linked").length} veículo(s)</div>}</div>; })}{points.length === 0 && <Empty label="Nenhum ponto cadastrado." />}</div></section>;
}

function EquipmentView({ taximeters, gnv, inspections, vehicleName }: any) {
  const rows = [...taximeters.map((item: any) => ({ ...item, kind: "Taxímetro", expiration: item.validUntil, serial: item.serialNumber })), ...gnv.map((item: any) => ({ ...item, kind: "GNV", expiration: item.expirationDate, serial: item.cylinderNumber })), ...inspections.map((item: any) => ({ ...item, kind: String(item.type || "Vistoria").toUpperCase(), expiration: item.validUntil, serial: item.notes || "-" }))];
  return <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><SectionHeader title="Taxímetros, GNV e vistorias" subtitle="Ativos e certificações que acompanham o táxi." icon={Gauge} /><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Veículo</th><th className="px-5 py-3">Identificação</th><th className="px-5 py-3">Validade</th><th className="px-5 py-3">Situação</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((item: any, index) => { const expired = isExpired(item.expiration); const warning = item.expiration && daysUntil(item.expiration) <= 30; return <tr key={`${item.kind}-${item.id || index}`}><td className="px-5 py-4 text-xs font-black flex items-center gap-2">{item.kind === "GNV" ? <Flame className="w-4 h-4 text-orange-500" /> : <Gauge className="w-4 h-4 text-indigo-500" />}{item.kind}</td><td className="px-5 py-4 text-xs font-semibold">{vehicleName(item.vehicleId)}</td><td className="px-5 py-4 text-xs font-mono text-slate-500">{item.serial}</td><td className="px-5 py-4 text-xs">{shortDate(item.expiration)}</td><td className="px-5 py-4"><span className={`text-[9px] font-bold rounded-full px-2 py-1 ${expired ? "bg-red-50 text-red-700" : warning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{expired ? "VENCIDO" : warning ? "ATENÇÃO" : "REGULAR"}</span></td></tr>; })}</tbody></table></div></section>;
}

function AgendaView({ expirations }: { expirations: Expiration[] }) {
  const groups = [{ label: "Vencidos", rows: expirations.filter((item) => item.days < 0), color: "red" }, { label: "Próximos 30 dias", rows: expirations.filter((item) => item.days >= 0 && item.days <= 30), color: "amber" }, { label: "De 31 a 90 dias", rows: expirations.filter((item) => item.days > 30), color: "blue" }];
  return <div className="grid xl:grid-cols-3 gap-4">{groups.map((group) => <section key={group.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-4 border-b border-slate-100 flex items-center justify-between"><h2 className="text-xs font-black">{group.label}</h2><span className="text-xs font-black">{group.rows.length}</span></div><div className="divide-y divide-slate-100">{group.rows.map((item) => <div key={item.id} className="p-4 flex items-center justify-between gap-3"><div className="min-w-0"><span className="text-[8px] font-black bg-slate-100 rounded px-1.5 py-0.5">{item.type}</span><p className="text-xs font-semibold truncate mt-1.5">{item.subject}</p><p className="text-[9px] text-slate-400 mt-0.5">{shortDate(item.date)}</p></div><strong className={`text-[10px] ${item.days < 0 ? "text-red-600" : item.days <= 30 ? "text-amber-600" : "text-blue-600"}`}>{item.days < 0 ? `${Math.abs(item.days)}d vencido` : `${item.days}d`}</strong></div>)}{group.rows.length === 0 && <Empty label="Nenhum vencimento." />}</div></section>)}</div>;
}

function ProcessRow({ process, permit, dispatcher, vehicleName, onOpen }: any) {
  return <button onClick={onOpen} className="w-full p-4 grid md:grid-cols-[130px_1fr_1fr_110px_20px] gap-3 items-center text-left hover:bg-slate-50"><div><p className="font-mono text-[10px] font-black">{process.workOrderNumber}</p><p className="text-[9px] text-indigo-600 font-bold mt-1">{PROCESS_LABELS[process.processType as ProcessType]}</p></div><div><p className="text-[9px] text-slate-400">Alvará</p><p className="text-xs font-black mt-0.5">{permit?.permitNumber || "Não localizado"}</p></div><div><p className="text-[9px] text-slate-400">Movimento</p><p className="text-[10px] font-semibold mt-0.5 truncate">{process.processType === "replacement" ? `${vehicleName(process.oldVehicleId)} → ${vehicleName(process.newVehicleId)}` : process.processType === "accreditation" ? vehicleName(process.newVehicleId) : vehicleName(process.oldVehicleId)}</p></div><div><p className="text-[9px] text-slate-400">Executor</p><p className="text-[10px] font-semibold mt-0.5 truncate">{dispatcher?.name || "Não definido"}</p></div><ChevronRight className="w-4 h-4 text-slate-300" /></button>;
}

function ProcessCard({ process, permit, dispatcher, vehicleName, onOpen }: any) {
  const checklist = process.checklist || {};
  const allItems = process.processType === "replacement" ? [...OLD_VEHICLE_CHECKLIST, ...NEW_VEHICLE_CHECKLIST] : process.processType === "accreditation" ? [...NEW_VEHICLE_CHECKLIST] : [...OLD_VEHICLE_CHECKLIST];
  const completed = allItems.filter(([id]) => checklist[id]).length;
  return <button onClick={onOpen} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-indigo-300"><div className="flex justify-between gap-2"><div><p className="font-mono text-[9px] font-black text-indigo-600">{process.workOrderNumber}</p><p className="font-mono text-sm font-black mt-1">ALV {permit?.permitNumber || "-"}</p></div><ChevronRight className="w-4 h-4 text-slate-300" /></div><p className="text-[9px] text-slate-500 mt-3 truncate">{process.processType === "replacement" ? `${vehicleName(process.oldVehicleId)} → ${vehicleName(process.newVehicleId)}` : process.processType === "accreditation" ? vehicleName(process.newVehicleId) : vehicleName(process.oldVehicleId)}</p><div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${allItems.length ? completed / allItems.length * 100 : 0}%` }} /></div><div className="mt-2 flex justify-between text-[8px] text-slate-400"><span>{dispatcher?.name || "Sem despachante"}</span><strong>{completed}/{allItems.length}</strong></div></button>;
}

function PermitDrawer({ permit, points, vehicleName, driver, saving, onSave, onClose }: any) {
  const [form, setForm] = useState({ permissionHolder: permit.permissionHolder || permit.ownerName || "", pointId: permit.pointId || "", expirationDate: permit.expirationDate || "", status: normalizePermitStatus(permit) });
  return <Drawer title={`Alvará ${permit.permitNumber}`} eyebrow="Ativo regulatório" onClose={onClose}><div className="rounded-2xl bg-slate-950 text-white p-5"><div className="flex items-center justify-between"><StatusBadge status={normalizePermitStatus(permit)} dark /><BadgeCheck className="w-6 h-6 text-indigo-300" /></div><div className="mt-5 grid grid-cols-2 gap-3"><DarkInfo label="Veículo" value={vehicleName(permit.currentVehicleId)} /><DarkInfo label="Motorista" value={driver?.name || "Nenhum"} /></div></div><section className="drawer-section"><h3 className="drawer-title">Dados do alvará</h3><div className="grid grid-cols-2 gap-3 mt-4"><Field label="Permissionário"><input className="reg-field" value={form.permissionHolder} onChange={(e) => setForm({ ...form, permissionHolder: e.target.value })} /></Field><Field label="Validade"><input type="date" className="reg-field" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} /></Field><Field label="Ponto de táxi"><select className="reg-field" value={form.pointId} onChange={(e) => setForm({ ...form, pointId: e.target.value })}><option value="">Sem ponto</option>{points.map((point: any) => <option key={point.id} value={point.id}>{point.name}</option>)}</select></Field><Field label="Status"><select className="reg-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PermitStatus })}><option value="available">Livre</option><option value="linked">Vinculado</option><option value="suspended">Suspenso</option><option value="deposited">Depositado</option><option value="deregistered">Baixado</option></select></Field></div></section><section className="drawer-section"><h3 className="drawer-title">Histórico de vínculos</h3><div className="mt-3 space-y-2">{(permit.history || []).slice().reverse().map((entry: any, index: number) => <div key={index} className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-[10px] font-bold">{entry.action}</p><p className="text-[9px] text-slate-400 mt-1">{shortDate(entry.date)} · {vehicleName(entry.vehicleId)}</p></div>)}{!permit.history?.length && <p className="text-xs text-slate-400">Sem movimentações registradas.</p>}</div></section><button disabled={saving} onClick={() => onSave(permit, form)} className="primary-action">{saving ? "Salvando..." : "Salvar alvará"}</button></Drawer>;
}

function ProcessDrawer({ process, permit, dispatchers, vehicleName, saving, onSave, onRelease, onFinish, onClose }: any) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(process.checklist || {});
  const [form, setForm] = useState({ dispatcherId: process.dispatcherId || "", deadline: process.deadline || "", estimatedCost: String(process.estimatedCost || ""), actualCost: String(process.actualCost || "") });
  const showOld = process.processType !== "accreditation";
  const showNew = process.processType !== "deaccreditation";
  const oldDone = !showOld || OLD_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
  const newDone = !showNew || NEW_VEHICLE_CHECKLIST.every(([id]) => checklist[id]);
  return <Drawer title={process.workOrderNumber || "OS regulatória"} eyebrow={PROCESS_LABELS[process.processType as ProcessType]} onClose={onClose}><div className="rounded-2xl bg-slate-950 text-white p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] uppercase font-bold text-slate-400">Alvará</p><p className="font-mono text-2xl font-black mt-1">{permit?.permitNumber || "-"}</p></div><span className="text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-200 px-2.5 py-1">{PROCESS_STAGES.find((item) => item.id === processStage(process))?.label}</span></div><div className="mt-5 space-y-2 text-[10px]"><p className="flex justify-between gap-3"><span className="text-slate-400">Sai</span><strong className="text-right">{showOld ? vehicleName(process.oldVehicleId) : "-"}</strong></p><p className="flex justify-between gap-3"><span className="text-slate-400">Entra</span><strong className="text-right">{showNew ? vehicleName(process.newVehicleId) : "-"}</strong></p></div></div><section className="drawer-section"><h3 className="drawer-title">Execução da OS</h3><div className="grid grid-cols-2 gap-3 mt-4"><Field label="Despachante"><select className="reg-field" value={form.dispatcherId} onChange={(e) => setForm({ ...form, dispatcherId: e.target.value })}><option value="">Não definido</option>{dispatchers.map((dispatcher: any) => <option key={dispatcher.id} value={dispatcher.id}>{dispatcher.name}</option>)}</select></Field><Field label="Prazo"><input type="date" className="reg-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field><Field label="Custo estimado"><input type="number" className="reg-field" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} /></Field><Field label="Custo realizado"><input type="number" className="reg-field" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} /></Field></div></section>{showOld && <ChecklistSection title="Desmontagem do táxi antigo" subtitle={vehicleName(process.oldVehicleId)} items={OLD_VEHICLE_CHECKLIST} checklist={checklist} setChecklist={setChecklist} />}{showNew && <ChecklistSection title="Credenciamento do novo veículo" subtitle={vehicleName(process.newVehicleId)} items={NEW_VEHICLE_CHECKLIST} checklist={checklist} setChecklist={setChecklist} />}<div className="grid grid-cols-2 gap-2"><button disabled={saving} onClick={() => onSave(process, form, checklist)} className="h-11 rounded-xl border border-slate-300 text-xs font-bold disabled:opacity-40">Salvar andamento</button>{showOld && processStage(process) !== "permit_available" && process.status !== "completed" ? <button disabled={!oldDone || saving} onClick={() => onRelease({ ...process, checklist })} className="h-11 rounded-xl bg-cyan-600 text-white text-xs font-bold disabled:opacity-30">Liberar alvará</button> : showNew ? <button disabled={!oldDone || !newDone || saving} onClick={() => onFinish({ ...process, checklist })} className="h-11 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-30">Concluir vínculo</button> : <span />}</div></Drawer>;
}

function ChecklistSection({ title, subtitle, items, checklist, setChecklist }: any) {
  return <section className="drawer-section"><div className="flex items-center justify-between"><div><h3 className="drawer-title">{title}</h3><p className="text-[9px] text-slate-400 mt-1">{subtitle}</p></div><span className="text-[10px] font-bold">{items.filter(([id]: any) => checklist[id]).length}/{items.length}</span></div><div className="grid grid-cols-2 gap-2 mt-4">{items.map(([id, label]: any) => <button key={id} onClick={() => setChecklist({ ...checklist, [id]: !checklist[id] })} className={`rounded-xl border px-3 py-2.5 flex items-center gap-2 text-left ${checklist[id] ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}><span className={`w-4 h-4 rounded grid place-items-center border ${checklist[id] ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"}`}>{checklist[id] && <Check className="w-3 h-3" />}</span><span className="text-[9px] font-bold">{label}</span></button>)}</div></section>;
}

function ProcessModal({ permits, vehicles, dispatchers, saving, onSubmit, onClose }: any) {
  const [form, setForm] = useState({ processType: "replacement" as ProcessType, permitId: "", oldVehicleId: "", newVehicleId: "", dispatcherId: "", deadline: "", estimatedCost: "" });
  const selectedPermit = permits.find((item: any) => item.id === form.permitId);
  useEffect(() => { if (selectedPermit?.currentVehicleId) setForm((current) => ({ ...current, oldVehicleId: selectedPermit.currentVehicleId })); }, [form.permitId]);
  return <Modal title="Nova OS regulatória" subtitle="O processo nasce vinculado ao alvará." onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4"><Field label="Tipo de processo"><select className="reg-field" value={form.processType} onChange={(e) => setForm({ ...form, processType: e.target.value as ProcessType })}><option value="replacement">Substituição</option><option value="accreditation">Credenciamento</option><option value="deaccreditation">Descredenciamento</option></select></Field><Field label="Alvará"><select required className="reg-field" value={form.permitId} onChange={(e) => setForm({ ...form, permitId: e.target.value })}><option value="">Selecione o alvará</option>{permits.filter((permit: any) => permit.normalizedStatus !== "deregistered").map((permit: any) => <option key={permit.id} value={permit.id}>{permit.permitNumber} · {statusLabel(permit.normalizedStatus)}</option>)}</select></Field>{form.processType !== "accreditation" && <Field label="Veículo que sai"><select required className="reg-field" value={form.oldVehicleId} onChange={(e) => setForm({ ...form, oldVehicleId: e.target.value })}><option value="">Selecione</option>{vehicles.map((vehicle: any) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</option>)}</select></Field>}{form.processType !== "deaccreditation" && <Field label="Veículo que entra"><select required className="reg-field" value={form.newVehicleId} onChange={(e) => setForm({ ...form, newVehicleId: e.target.value })}><option value="">Selecione</option>{vehicles.filter((vehicle: any) => vehicle.id !== form.oldVehicleId).map((vehicle: any) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</option>)}</select></Field>}<div className="grid grid-cols-2 gap-3"><Field label="Despachante"><select className="reg-field" value={form.dispatcherId} onChange={(e) => setForm({ ...form, dispatcherId: e.target.value })}><option value="">Não definido</option>{dispatchers.map((dispatcher: any) => <option key={dispatcher.id} value={dispatcher.id}>{dispatcher.name}</option>)}</select></Field><Field label="Prazo"><input type="date" className="reg-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field></div><Field label="Custo estimado"><input type="number" min="0" step="0.01" className="reg-field" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} /></Field><button disabled={saving} className="primary-action">{saving ? "Criando OS..." : "Criar ordem regulatória"}</button></form></Modal>;
}

function PermitModal({ points, saving, onSubmit, onClose }: any) { const [form, setForm] = useState({ permitNumber: "", permissionHolder: "", pointId: "", expirationDate: "", status: "available" }); return <Modal title="Novo alvará" subtitle="Inclua o ativo no estoque regulatório." onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4"><Field label="Número do alvará"><input required className="reg-field" value={form.permitNumber} onChange={(e) => setForm({ ...form, permitNumber: e.target.value })} /></Field><Field label="Permissionário"><input required className="reg-field" value={form.permissionHolder} onChange={(e) => setForm({ ...form, permissionHolder: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Ponto"><select className="reg-field" value={form.pointId} onChange={(e) => setForm({ ...form, pointId: e.target.value })}><option value="">Sem ponto</option>{points.map((point: any) => <option key={point.id} value={point.id}>{point.name}</option>)}</select></Field><Field label="Validade"><input type="date" className="reg-field" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} /></Field></div><Field label="Estado inicial"><select className="reg-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="available">Livre</option><option value="deposited">Depositado</option><option value="suspended">Suspenso</option></select></Field><button disabled={saving} className="primary-action">{saving ? "Salvando..." : "Adicionar ao estoque"}</button></form></Modal>; }

function DispatcherModal({ saving, onSubmit, onClose }: any) { const [form, setForm] = useState({ name: "", type: "company", phone: "", email: "" }); return <Modal title="Novo despachante" subtitle="Cadastre o executor das ordens regulatórias." onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4"><Field label="Nome"><input required className="reg-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Tipo"><select className="reg-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="company">Empresa</option><option value="internal">Interno</option></select></Field><div className="grid grid-cols-2 gap-3"><Field label="Telefone"><input className="reg-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label="E-mail"><input type="email" className="reg-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div><button disabled={saving} className="primary-action">{saving ? "Salvando..." : "Cadastrar despachante"}</button></form></Modal>; }

function PointModal({ saving, onSubmit, onClose }: any) { const [form, setForm] = useState({ name: "", code: "", address: "", expirationDate: "" }); return <Modal title="Novo ponto de táxi" subtitle="Cadastre o vínculo regulatório e sua validade." onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4"><Field label="Nome"><input required className="reg-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Código"><input className="reg-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field><Field label="Validade"><input required type="date" className="reg-field" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} /></Field></div><Field label="Endereço"><input className="reg-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field><button disabled={saving} className="primary-action">{saving ? "Salvando..." : "Cadastrar ponto"}</button></form></Modal>; }

function SectionHeader({ title, subtitle, icon: Icon }: any) { return <div className="p-5 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-geist font-black">{title}</h2><p className="text-xs text-slate-500 mt-1">{subtitle}</p></div><Icon className="w-5 h-5 text-indigo-500" /></div>; }
function PermitCount({ status, count }: { status: PermitStatus; count: number }) { return <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-[8px] font-black uppercase text-slate-400">{statusLabel(status)}</p><p className="font-geist text-xl font-black mt-1">{count}</p></div>; }
function statusLabel(status: PermitStatus) { return ({ available: "Livre", linked: "Vinculado", suspended: "Suspenso", deposited: "Depositado", deregistered: "Baixado" } as Record<PermitStatus, string>)[status]; }
function StatusBadge({ status, dark = false }: { status: PermitStatus; dark?: boolean }) { const colors: Record<PermitStatus, string> = { available: "bg-emerald-50 text-emerald-700 border-emerald-200", linked: "bg-blue-50 text-blue-700 border-blue-200", suspended: "bg-amber-50 text-amber-700 border-amber-200", deposited: "bg-cyan-50 text-cyan-700 border-cyan-200", deregistered: "bg-slate-100 text-slate-500 border-slate-200" }; return <span className={`inline-flex border rounded-full px-2.5 py-1 text-[8px] font-black ${dark ? "bg-white/10 text-white border-white/10" : colors[status]}`}>{statusLabel(status).toUpperCase()}</span>; }
function DarkInfo({ label, value }: any) { return <div className="rounded-xl bg-white/5 p-3"><p className="text-[8px] uppercase font-bold text-slate-400">{label}</p><p className="text-[10px] font-bold mt-1 truncate">{value}</p></div>; }
function Empty({ label }: { label: string }) { return <div className="p-10 text-center text-xs text-slate-400">{label}</div>; }
function Field({ label, children }: any) { return <label className="block"><span className="block text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1.5">{label}</span>{children}</label>; }
function Modal({ title, subtitle, onClose, children }: any) { return <div className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#fcfafb] shadow-2xl"><div className="sticky top-0 bg-white z-10 p-5 border-b border-slate-200 flex justify-between"><div><h2 className="font-geist text-lg font-black">{title}</h2><p className="text-xs text-slate-500 mt-1">{subtitle}</p></div><button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-slate-100"><X className="w-4 h-4" /></button></div><div className="p-5">{children}</div></div></div>; }
function Drawer({ title, eyebrow, onClose, children }: any) { return <div className="fixed inset-0 z-[80] bg-slate-950/35 backdrop-blur-[2px] flex justify-end" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="w-full max-w-xl h-full bg-[#fcfafb] shadow-2xl overflow-y-auto"><div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 p-5 flex justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p><h2 className="font-geist text-xl font-black mt-1">{title}</h2></div><button onClick={onClose} className="w-9 h-9 rounded-xl grid place-items-center hover:bg-slate-100"><X className="w-5 h-5" /></button></div><div className="p-5 space-y-5">{children}</div></aside></div>; }

function AssetSalesView({ vehicles, dispatchers, onUpdateVehicle }: any) {
  const [decommissionModalOpen, setDecommissionModalOpen] = useState(false);
  const [selectedVehId, setSelectedVehId] = useState("");
  const [selectedSaleVeh, setSelectedSaleVeh] = useState<any | null>(null);

  const [salePrice, setSalePrice] = useState("");
  const [dispStatus, setDispStatus] = useState("pending_docs");
  const [dispNotes, setDispNotes] = useState("");

  const decommissioned = useMemo(() => {
    return vehicles.filter((v: any) => v.status === "inactive" || v.status === "sold" || v.status === "deactivated");
  }, [vehicles]);

  const activeVehicles = useMemo(() => {
    return vehicles.filter((v: any) => v.status !== "inactive" && v.status !== "sold" && v.status !== "deactivated");
  }, [vehicles]);

  const handleDecommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehId) return;
    await onUpdateVehicle(selectedVehId, { status: "inactive" });
    setDecommissionModalOpen(false);
    setSelectedVehId("");
    alert("Veículo desativado com sucesso e disponibilizado para venda!");
  };

  const handleSelectVehicle = (veh: any) => {
    setSelectedSaleVeh(veh);
    setSalePrice(veh.salesPrice?.toString() || "");
    setDispStatus(veh.dispatcherStatus || "pending_docs");
    setDispNotes(veh.dispatcherNotes || "");
  };

  const handleSaveSaleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleVeh) return;
    const priceNum = Number(salePrice || 0);
    const updates: any = {
      salesPrice: priceNum,
      dispatcherStatus: dispStatus,
      dispatcherNotes: dispNotes,
      status: dispStatus === "finalized" ? "sold" : "inactive"
    };
    await onUpdateVehicle(selectedSaleVeh.id, updates);
    setSelectedSaleVeh(null);
    alert("Dados de venda e rotina do despachante atualizados!");
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-geist font-black text-lg">Venda de Ativos (Veículos Desativados)</h2>
          <p className="text-xs text-slate-500 mt-1">Gerencie a rotina de despachante, depreciação e retorno financeiro (ROI) de ativos retirados de operação.</p>
        </div>
        <button
          onClick={() => setDecommissionModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-red-655 text-white text-[10px] font-bold flex items-center gap-1.5 hover:bg-red-700 transition-all shadow-sm font-sans"
        >
          <Ban className="w-3.5 h-3.5" />
          Desativar Veículo para Venda
        </button>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <span className="font-extrabold text-[10px] text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-500" />
                Fila de Venda de Ativos ({decommissioned.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3 text-right">Valor Compra</th>
                    <th className="px-4 py-3 text-right">FIPE Atual</th>
                    <th className="px-4 py-3 text-right">Depreciação</th>
                    <th className="px-4 py-3 text-right">Preço Venda</th>
                    <th className="px-4 py-3 text-right">ROI (%)</th>
                    <th className="px-4 py-3 text-center">Despachante</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decommissioned.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">Nenhum veículo desativado para venda no momento.</td>
                    </tr>
                  ) : (
                    decommissioned.map((v: any) => {
                      const costVal = Number(v.acquisition?.purchaseValue || 15000);
                      const fipeVal = Number(v.fipe?.value || v.acquisition?.currentFipeValue || 12000);
                      const depVal = costVal - fipeVal;
                      const sellVal = v.salesPrice || 0;
                      const roi = costVal > 0 ? ((sellVal - costVal) / costVal) * 105 : 0;

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-4">
                            <p className="font-mono text-xs font-black text-slate-900">{v.plate}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{v.brand} {v.model}</p>
                          </td>
                          <td className="px-4 py-4 text-right font-mono font-semibold text-slate-700">
                            {costVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">
                            {fipeVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-semibold ${depVal > 0 ? "text-red-650" : "text-emerald-700"}`}>
                            {depVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-4 py-4 text-right font-mono font-black text-indigo-600">
                            {sellVal > 0 ? sellVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : <span className="text-slate-400 italic font-sans font-normal text-[11px]">—</span>}
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-black ${roi >= 0 ? "text-emerald-750" : "text-red-650"}`}>
                            {sellVal > 0 ? `${roi.toFixed(1)}%` : "—"}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-black border uppercase tracking-wider ${
                              v.dispatcherStatus === "finalized"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                                : "bg-amber-50 text-amber-700 border-amber-250"
                            }`}>
                              {v.dispatcherStatus === "finalized" ? "VENDIDO" :
                               v.dispatcherStatus === "transfer" ? "DETRAN" :
                               v.dispatcherStatus === "atpv" ? "ATPV-E" :
                               v.dispatcherStatus === "gravame" ? "GRAVAME" : "LAUDO/VISTORIA"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleSelectVehicle(v)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-all"
                            >
                              Tratar Venda
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          {selectedSaleVeh ? (
            <form onSubmit={handleSaveSaleDetails} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-geist font-black text-xs text-slate-900">Tratar Venda: {selectedSaleVeh.plate}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedSaleVeh.brand} {selectedSaleVeh.model}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSaleVeh(null)}
                  className="p-1 text-slate-400 hover:text-slate-650 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5">Preço de Venda Real (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 48000"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="reg-field"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5">Etapa do Despachante</label>
                  <select
                    value={dispStatus}
                    onChange={(e) => setDispStatus(e.target.value)}
                    className="reg-field font-semibold text-slate-700"
                  >
                    <option value="pending_docs">Aguardando Laudo / Vistoria</option>
                    <option value="gravame">Baixa de Gravame / Restrição</option>
                    <option value="atpv">Emissão de ATPV-e</option>
                    <option value="transfer">Aguardando Transferência Detran</option>
                    <option value="finalized">Processo Finalizado (Vendido)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 mb-1.5">Notas do Despachante</label>
                  <textarea
                    rows={4}
                    placeholder="Descreva pendências físicas, restrições ou trâmites de despachante..."
                    value={dispNotes}
                    onChange={(e) => setDispNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-indigo-650 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm"
              >
                Salvar Dados de Venda
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-350 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <CircleDollarSign className="w-10 h-10 mx-auto text-slate-350" />
              <p className="text-xs font-bold text-slate-500">Selecione um ativo para tratar</p>
              <p className="text-[10px] text-slate-450">Clique no botão "Tratar Venda" ao lado de qualquer veículo na fila para atualizar preços, laudo e despachante.</p>
            </div>
          )}
        </div>
      </div>

      {decommissionModalOpen && (
        <div className="fixed inset-0 z-[95] bg-slate-950/40 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-md bg-[#fcfafb] rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-geist text-sm font-black text-slate-900">Desativar Veículo para Venda</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">O veículo deixará de constar como ativo e entrará na fila de vendas.</p>
              </div>
              <button
                onClick={() => setDecommissionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDecommissionSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Selecione o Veículo</label>
                <select
                  required
                  value={selectedVehId}
                  onChange={(e) => setSelectedVehId(e.target.value)}
                  className="reg-field font-semibold text-slate-700"
                >
                  <option value="">Selecione o carro da frota...</option>
                  {activeVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDecommissionModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-red-650 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-sm"
                >
                  Confirmar Desativação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
