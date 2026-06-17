"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link2, Plus, Search, ClipboardList } from "lucide-react";

// Types
import { AssignmentFormData, ReturnFormData, AuditFormData, Assignment, Checklist } from "./_lib/types";
import { DEFAULT_CHECKLIST, EMPTY_PHOTOS } from "./_lib/constants";

// Hooks
import { useAssignments } from "./_hooks/useAssignments";

// Components
import { AssignmentsTable } from "./_components/AssignmentsTable";
import { AssignmentModal } from "./_components/AssignmentModal";
import { ReturnModal } from "./_components/ReturnModal";
import { AuditModal } from "./_components/AuditModal";
import { ChecklistDetailModal } from "./_components/ChecklistDetailModal";

export default function AssignmentsManager() {
  const { currentUser, getCollection, can } = useAuth();
  
  // Custom Hook
  const {
    assignments,
    checklists,
    loading: hookLoading,
    loadAssignments,
    createAssignment,
    closeAssignment,
    createAvulsoChecklist
  } = useAssignments();

  // Local Page State for shared entities
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, completed
  const [localLoading, setLocalLoading] = useState(true);

  // Modals visibility flags
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [closingAssignment, setClosingAssignment] = useState<Assignment | null>(null);
  const [isAvulsoModalOpen, setIsAvulsoModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  // Form States & Photos & Signatures
  const [newAsgPhotos, setNewAsgPhotos] = useState<Record<string, string>>({ ...EMPTY_PHOTOS });
  const [newAsgSignature, setNewAsgSignature] = useState("");
  
  const [closePhotos, setClosePhotos] = useState<Record<string, string>>({ ...EMPTY_PHOTOS });
  const [closeSignature, setCloseSignature] = useState("");

  const [avulsoPhotos, setAvulsoPhotos] = useState<Record<string, string>>({ ...EMPTY_PHOTOS });
  const [avulsoSignature, setAvulsoSignature] = useState("");

  const [formData, setFormData] = useState<AssignmentFormData>({
    driverId: "",
    vehicleId: "",
    contractId: "",
    startDate: new Date().toISOString().split("T")[0],
    checklist: { ...DEFAULT_CHECKLIST },
    signatureText: ""
  });

  const [closeData, setCloseData] = useState<ReturnFormData>({
    endDate: new Date().toISOString().split("T")[0],
    vehicleStatusAfter: "active",
    checklist: { ...DEFAULT_CHECKLIST },
    signatureText: "",
    mileageEnd: ""
  });

  const [avulsoForm, setAvulsoForm] = useState<AuditFormData>({
    driverId: "",
    vehicleId: "",
    type: "Vistoria Semanal",
    checklist: { ...DEFAULT_CHECKLIST },
    signatureText: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLocalLoading(true);
      const [drvList, vehList, conList] = await Promise.all([
        getCollection("drivers"),
        getCollection("vehicles"),
        getCollection("contracts")
      ]);
      setDrivers(drvList || []);
      setVehicles(vehList || []);
      setContracts(conList || []);
      await loadAssignments();
    } catch (e) {
      console.error("Erro ao carregar dados do painel de vínculos", e);
    } finally {
      setLocalLoading(false);
    }
  }, [getCollection, loadAssignments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helpers
  const getDriverName = useCallback((id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.name : `Motorista (${id.substring(0, 6)})`;
  }, [drivers]);

  const getVehicleInfo = useCallback((id: string) => {
    const v = vehicles.find(veh => veh.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : `Veículo (${id.substring(0, 6)})`;
  }, [vehicles]);

  const getDriverLocks = useCallback((id: string) => {
    const d = drivers.find(drv => drv.id === id);
    return d ? d.activeLocks || [] : [];
  }, [drivers]);

  // Filter list
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.status !== "terminated" && 
      !assignments.some(a => a.active === true && a.driverId === d.id)
    );
  }, [drivers, assignments]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.status === "active" && 
      !assignments.some(a => a.active === true && a.vehicleId === v.id)
    );
  }, [vehicles, assignments]);

  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.status === "active");
  }, [contracts]);

  // Submit operations
  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverId || !formData.vehicleId) return;

    // Check Locks
    const driverLocks = getDriverLocks(formData.driverId);
    const hasCriticalLock = driverLocks.some((l: string) => ["Financeiro", "Conduta", "Judicial"].includes(l));
    if (hasCriticalLock) {
      alert(`Erro: O motorista possui bloqueios ativos (${driverLocks.join(", ")}). Operação cancelada.`);
      return;
    }

    try {
      await createAssignment(formData, newAsgSignature, newAsgPhotos, drivers, vehicles);
      
      // Reset
      setIsNewModalOpen(false);
      setFormData({
        driverId: "",
        vehicleId: "",
        contractId: "",
        startDate: new Date().toISOString().split("T")[0],
        checklist: { ...DEFAULT_CHECKLIST },
        signatureText: ""
      });
      setNewAsgPhotos({ ...EMPTY_PHOTOS });
      setNewAsgSignature("");
      await loadData();
      alert("Veículo vinculado e vistoria de entrega salva com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao registrar vínculo.");
    }
  };

  const handleCloseAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingAssignment) return;

    try {
      await closeAssignment(
        closingAssignment,
        closeData,
        closeSignature,
        closePhotos,
        drivers,
        vehicles
      );

      setClosingAssignment(null);
      setCloseData({
        endDate: new Date().toISOString().split("T")[0],
        vehicleStatusAfter: "active",
        checklist: { ...DEFAULT_CHECKLIST },
        signatureText: "",
        mileageEnd: ""
      });
      setClosePhotos({ ...EMPTY_PHOTOS });
      setCloseSignature("");
      await loadData();
      alert("Vínculo encerrado e vistoria de devolução registrada com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao encerrar vínculo.");
    }
  };

  const handleCreateAvulsoChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avulsoForm.vehicleId || !avulsoForm.driverId) return;

    try {
      await createAvulsoChecklist(avulsoForm, avulsoSignature, avulsoPhotos, drivers);

      setIsAvulsoModalOpen(false);
      setAvulsoForm({
        driverId: "",
        vehicleId: "",
        type: "Vistoria Semanal",
        checklist: { ...DEFAULT_CHECKLIST },
        signatureText: ""
      });
      setAvulsoPhotos({ ...EMPTY_PHOTOS });
      setAvulsoSignature("");
      await loadData();
      alert("Vistoria técnica avulsa salva!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao registrar vistoria avulsa.");
    }
  };

  const handleMockPhotos = (setPhotosFn: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    setPhotosFn({
      frente: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400",
      traseira: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
      lateralDireita: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
      lateralEsquerda: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      painel: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400",
      odometro: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400",
      pneus: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400"
    });
  };

  // Filtered bindings computation
  const filteredAssignments = useMemo(() => {
    return assignments.filter(asg => {
      const drvName = getDriverName(asg.driverId).toLowerCase();
      const vehInfo = getVehicleInfo(asg.vehicleId).toLowerCase();
      const matchesSearch = drvName.includes(searchTerm.toLowerCase()) || vehInfo.includes(searchTerm.toLowerCase());
      
      if (statusFilter === "active") return matchesSearch && asg.active === true;
      if (statusFilter === "completed") return matchesSearch && asg.active === false;
      return matchesSearch;
    });
  }, [assignments, searchTerm, statusFilter, getDriverName, getVehicleInfo]);

  const loading = localLoading || hookLoading;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Operações</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Vínculos de Veículos</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Link2 className="w-8 h-8 text-primary" />
            <span>Controle de Vínculos & Checklists</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Distribua e recolha veículos com vistorias técnicas obrigatórias digitais para motoristas parceiros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAvulsoModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-primary font-bold hover:bg-surface-container-high transition-all text-xs"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Vistoria Técnica Avulsa</span>
          </button>
          
          <button
            onClick={() => {
              if (availableDrivers.length === 0) {
                alert("Nenhum motorista disponível para vinculação.");
                return;
              }
              if (availableVehicles.length === 0) {
                alert("Nenhum veículo livre disponível.");
                return;
              }
              setFormData(prev => ({
                ...prev,
                driverId: availableDrivers[0].id,
                vehicleId: availableVehicles[0].id,
                contractId: activeContracts[0]?.id || ""
              }));
              setIsNewModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Vincular Veículo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Pesquisar por motorista ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 font-semibold">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === "active" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Ativos (Locados)
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === "completed" ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Devolvidos
          </button>
        </div>
      </div>

      {/* Grid of Bindings */}
      {loading ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs">Carregando vínculos operacionais...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant">
          <Link2 className="w-[40px] h-[40px] text-outline mx-auto mb-4" />
          <p className="text-base font-semibold text-primary font-geist">Nenhum Vínculo Registrado</p>
          <p className="text-xs mt-1">Vincule um motorista a um carro da frota para iniciar o controle operacional.</p>
        </div>
      ) : (
        <AssignmentsTable 
          assignments={filteredAssignments}
          drivers={drivers}
          vehicles={vehicles}
          checklists={checklists}
          onOpenChecklist={setSelectedChecklist}
          onCloseAssignment={(asg) => {
            const vehicle = vehicles.find(v => v.id === asg.vehicleId);
            setClosingAssignment(asg);
            setCloseData(prev => ({
              ...prev,
              signatureText: getDriverName(asg.driverId),
              mileageEnd: vehicle?.mileage?.toString() || ""
            }));
          }}
          canEdit={can("assignments.edit") || can("contracts.edit")}
        />
      )}

      {/* NEW BINDING MODAL WITH MANDATORY HANDOVER CHECKLIST */}
      <AssignmentModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateAssignmentSubmit}
        formData={formData}
        setFormData={setFormData}
        availableDrivers={availableDrivers}
        availableVehicles={availableVehicles}
        contracts={contracts}
        drivers={drivers}
        newAsgPhotos={newAsgPhotos}
        setNewAsgPhotos={setNewAsgPhotos}
        newAsgSignature={newAsgSignature}
        setNewAsgSignature={setNewAsgSignature}
        onMockPhotos={() => handleMockPhotos(setNewAsgPhotos)}
      />

      {/* CLOSE BINDING MODAL WITH MANDATORY DEVOLUTION CHECKLIST */}
      {closingAssignment && (
        <ReturnModal 
          isOpen={!!closingAssignment}
          onClose={() => setClosingAssignment(null)}
          onSubmit={handleCloseAssignmentSubmit}
          formData={closeData}
          setFormData={setCloseData}
          closePhotos={closePhotos}
          setClosePhotos={setClosePhotos}
          closeSignature={closeSignature}
          setCloseSignature={setCloseSignature}
          onMockPhotos={() => handleMockPhotos(setClosePhotos)}
        />
      )}

      {/* CHECKLIST AVULSO MODAL */}
      <AuditModal 
        isOpen={isAvulsoModalOpen}
        onClose={() => setIsAvulsoModalOpen(false)}
        onSubmit={handleCreateAvulsoChecklistSubmit}
        formData={avulsoForm}
        setFormData={setAvulsoForm}
        drivers={drivers}
        vehicles={vehicles}
        avulsoPhotos={avulsoPhotos}
        setAvulsoPhotos={setAvulsoPhotos}
        avulsoSignature={avulsoSignature}
        setAvulsoSignature={setAvulsoSignature}
        onMockPhotos={() => handleMockPhotos(setAvulsoPhotos)}
      />

      {/* CHECKLIST VIEW MODAL */}
      <ChecklistDetailModal 
        checklist={selectedChecklist}
        onClose={() => setSelectedChecklist(null)}
        drivers={drivers}
        vehicles={vehicles}
      />
    </div>
  );
}
