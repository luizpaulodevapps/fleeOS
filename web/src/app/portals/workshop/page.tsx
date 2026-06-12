"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  PlusCircle, 
  Trash2, 
  DollarSign, 
  Check, 
  Car,
  Package,
  Activity,
  ChevronRight,
  Inbox,
  Calendar,
  History
} from "lucide-react";

export default function WorkshopPortal() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  
  // Data State
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [workOrderItems, setWorkOrderItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activePortalTab, setActivePortalTab] = useState("orders"); // orders, schedule, stock, history

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  // OS Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWo, setSelectedWo] = useState<any | null>(null);
  
  // OS Edit Form State
  const [woStatus, setWoStatus] = useState("Aberta");
  const [woDescription, setWoDescription] = useState("");
  const [woMileage, setWoMileage] = useState("");
  const [woItems, setWoItems] = useState<any[]>([]);

  // Item Add Form State
  const [newItemType, setNewItemType] = useState("PART"); // PART, LABOR, THIRD_PARTY, BODYWORK, PAINT, TOW, ALIGNMENT, BALANCING
  const [newItemId, setNewItemId] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnitCost, setNewItemUnitCost] = useState(0);

  // Provisional Part Modal/Form State
  const [isProvisionalOpen, setIsProvisionalOpen] = useState(false);
  const [provDesc, setProvDesc] = useState("");
  const [provQty, setProvQty] = useState(1);
  const [provNotes, setProvNotes] = useState("");
  const [provUnitCost, setProvUnitCost] = useState(0);

  // New Appointment Form State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appVehicleId, setAppVehicleId] = useState("");
  const [appTitle, setAppTitle] = useState("");
  const [appDate, setAppDate] = useState("");
  const [appTime, setAppTime] = useState("");
  const [appType, setAppType] = useState("Preventiva");
  const [appNotes, setAppNotes] = useState("");

  // Register Part Form State
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);
  const [partName, setPartName] = useState("");
  const [partCode, setPartCode] = useState("");
  const [partCategory, setPartCategory] = useState("Motor");
  const [partUnit, setPartUnit] = useState("Unidade");
  const [partQty, setPartQty] = useState(0);
  const [partCost, setPartCost] = useState(0);
  const [partMinStock, setPartMinStock] = useState(5);

  const loadPortalData = useCallback(async () => {
    try {
      setLoading(true);
      const [woList, woiList, invList, vehList, appList, catList] = await Promise.all([
        getCollection("work_orders"),
        getCollection("work_order_items"),
        getCollection("inventory_items"),
        getCollection("vehicles"),
        getCollection("maintenance_appointments"),
        getCollection("pricing_categories")
      ]);

      // Filter work orders assigned to this workshop (uid-workshop)
      // If super_admin/owner, show all to allow testing
      const filteredWo = (woList || []).filter((wo: any) => {
        if (currentUser?.roleId === "role-super-admin" || currentUser?.roleId === "role-owner") {
          return true;
        }
        return wo.workshopId === currentUser?.uid || wo.workshopId === "uid-workshop";
      });

      // Filter appointments for this workshop
      const filteredApps = (appList || []).filter((app: any) => {
        if (currentUser?.roleId === "role-super-admin" || currentUser?.roleId === "role-owner") {
          return true;
        }
        return app.workshopId === currentUser?.uid || app.workshopId === "uid-workshop";
      });

      setWorkOrders(filteredWo);
      setWorkOrderItems(woiList || []);
      setInventoryItems(invList || []);
      setVehicles(vehList || []);
      setAppointments(filteredApps);
      setCategories(catList || []);
    } catch (e) {
      console.error("Erro ao carregar dados do portal da oficina", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection, currentUser]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Set default part selection
  useEffect(() => {
    if (inventoryItems.length > 0 && !newItemId) {
      setNewItemId(inventoryItems[0].id);
      setNewItemUnitCost(inventoryItems[0].avgCost || 0);
      setNewItemDesc(inventoryItems[0].name);
    }
  }, [inventoryItems, newItemId]);

  const handlePartChange = (itemId: string) => {
    setNewItemId(itemId);
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      setNewItemUnitCost(item.avgCost || 0);
      setNewItemDesc(item.name);
    }
  };

  const handleOpenEditModal = (wo: any) => {
    setSelectedWo(wo);
    setWoStatus(wo.status || "Aberta");
    setWoDescription(wo.description || "");
    setWoMileage(wo.mileage ? wo.mileage.toString() : "");
    
    // Load items for this WO
    const matched = workOrderItems.filter(item => item.workOrderId === wo.id);
    setWoItems(matched.map(m => ({
      id: m.id,
      type: m.type,
      itemId: m.itemId,
      description: m.description,
      qty: m.qty,
      unitCost: m.unitCost
    })));
    
    setIsEditModalOpen(true);
  };

  const handleAddWoItem = () => {
    let desc = newItemDesc;
    let itemIdVal: string | null = newItemId;

    if (newItemType !== "PART") {
      if (!newItemDesc.trim()) {
        alert("Preencha a descrição do serviço!");
        return;
      }
      itemIdVal = null;
    } else {
      const selectedItem = inventoryItems.find(i => i.id === newItemId);
      desc = selectedItem ? selectedItem.name : "Peça";
    }

    setWoItems(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        type: newItemType,
        itemId: itemIdVal,
        description: desc,
        qty: newItemQty,
        unitCost: newItemUnitCost
      }
    ]);

    // Reset item input form
    if (inventoryItems.length > 0) {
      setNewItemId(inventoryItems[0].id);
      setNewItemUnitCost(inventoryItems[0].avgCost || 0);
      setNewItemDesc(inventoryItems[0].name);
    } else {
      setNewItemDesc("");
      setNewItemUnitCost(0);
    }
    setNewItemQty(1);
  };

  const handleRemoveWoItem = (index: number) => {
    setWoItems(prev => prev.filter((_, i) => i !== index));
  };

  // Add provisional uncataloged item
  const handleRegisterProvisionalItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provDesc.trim()) {
      alert("Informe a descrição da peça provisória!");
      return;
    }

    try {
      // 1. Create in inventory_pending_items
      const pendingDoc = await addDocument("inventory_pending_items", {
        workOrderId: selectedWo ? selectedWo.id : "avulso",
        description: provDesc,
        qty: Number(provQty),
        requestedBy: currentUser?.displayName || currentUser?.email || "Oficina Parceira",
        status: "pending",
        notes: provNotes,
        estimatedUnitCost: Number(provUnitCost),
        createdAt: new Date().toISOString()
      });

      // 2. Add to local items array for current OS if in WO context
      if (selectedWo) {
        setWoItems(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            type: "PART",
            itemId: pendingDoc.id,
            description: `[Provisório] ${provDesc}`,
            qty: Number(provQty),
            unitCost: Number(provUnitCost),
            isProvisional: true
          }
        ]);
      }

      // Reset provisional form
      setProvDesc("");
      setProvQty(1);
      setProvNotes("");
      setProvUnitCost(0);
      setIsProvisionalOpen(false);
      alert("Peça provisória solicitada com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao cadastrar peça provisória.");
    }
  };

  // Save changes to OS (Work Order)
  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWo) return;

    try {
      const selectedVeh = vehicles.find(v => v.id === selectedWo.vehicleId);
      
      // Calculate costs
      const totalPartsCost = woItems
        .filter(item => item.type === "PART")
        .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
      const totalLaborCost = woItems
        .filter(item => item.type !== "PART")
        .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
      const totalCost = totalPartsCost + totalLaborCost;

      // Update payload
      const isNewlyCompleted = (woStatus === "Concluída" || woStatus === "Entregue") && 
                              (selectedWo.status !== "Concluída" && selectedWo.status !== "Entregue" && selectedWo.status !== "completed");

      const woPayload = {
        ...selectedWo,
        description: woDescription,
        status: woStatus,
        mileage: Number(woMileage),
        totalPartsCost,
        totalLaborCost,
        totalCost,
        completedAt: isNewlyCompleted ? new Date().toISOString() : (selectedWo.completedAt || "")
      };

      // 1. Update OS Document
      await updateDocument("work_orders", selectedWo.id, woPayload);

      // 2. Delete and Recreate Work Order Items
      const allWoi = await getCollection("work_order_items");
      const matchedWoi = allWoi.filter(item => item.workOrderId === selectedWo.id);
      for (const item of matchedWoi) {
        await deleteDocument("work_order_items", item.id);
      }

      for (const item of woItems) {
        await addDocument("work_order_items", {
          workOrderId: selectedWo.id,
          type: item.type,
          itemId: item.itemId,
          description: item.description,
          qty: item.qty,
          unitCost: item.unitCost,
          totalCost: item.qty * item.unitCost
        });
      }

      // 3. Side effects on completion
      if (isNewlyCompleted) {
        // Decrement stock for standard cataloged items
        for (const item of woItems) {
          if (item.type === "PART" && item.itemId && !item.itemId.startsWith("doc-") && !item.itemId.startsWith("pend-")) {
            const invItem = inventoryItems.find(i => i.id === item.itemId);
            if (invItem) {
              const newQty = Math.max(0, invItem.currentQty - item.qty);
              await updateDocument("inventory_items", invItem.id, {
                currentQty: newQty
              });

              // Log stock movement
              await addDocument("inventory_movements", {
                itemId: invItem.id,
                type: "OUT",
                qty: item.qty,
                unitCost: item.unitCost,
                totalCost: item.qty * item.unitCost,
                referenceId: selectedWo.id,
                referenceType: "work_order",
                notes: `Baixa via OS externa: ${woDescription}`,
                createdAt: new Date().toISOString()
              });
            }
          }
        }

        // Add legacy maintenance record
        await addDocument("maintenance", {
          vehicleId: selectedWo.vehicleId,
          type: "Corretiva",
          description: `OS-${selectedWo.id.substring(0, 5).toUpperCase()}: ${woDescription}`,
          cost: totalCost,
          date: new Date().toISOString().split("T")[0],
          mileage: Number(woMileage),
          nextMaintenanceMileage: Number(woMileage) + 10000
        });

        // Add vehicle expense
        await addDocument("vehicle_expenses", {
          vehicleId: selectedWo.vehicleId,
          expenseType: "maintenance",
          amount: totalCost,
          date: new Date().toISOString().split("T")[0],
          referenceId: selectedWo.id,
          referenceType: "work_order",
          description: `OS-${selectedWo.id.substring(0, 5).toUpperCase()}: ${woDescription}`,
          createdAt: new Date().toISOString()
        });

        // Update vehicle mileage and set to active
        if (selectedVeh) {
          await updateDocument("vehicles", selectedVeh.id, {
            mileage: Math.max(selectedVeh.mileage || 0, Number(woMileage)),
            status: "active"
          });
        }
      }

      setIsEditModalOpen(false);
      alert("Ordem de Serviço salva e atualizada com sucesso!");
      await loadPortalData();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar ordem de serviço.");
    }
  };

  // Create new appointment in local storage database
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appVehicleId || !appTitle || !appDate || !appTime) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const newApp = {
        vehicleId: appVehicleId,
        title: appTitle,
        scheduledDate: appDate,
        scheduledTime: appTime,
        type: appType,
        notes: appNotes,
        status: "Agendado",
        workshopId: currentUser?.uid || "uid-workshop",
        createdAt: new Date().toISOString()
      };

      await addDocument("maintenance_appointments", newApp);
      alert("Agendamento criado com sucesso!");
      setIsAppointmentModalOpen(false);
      
      // Reset form
      setAppVehicleId("");
      setAppTitle("");
      setAppDate("");
      setAppTime("");
      setAppType("Preventiva");
      setAppNotes("");
      
      await loadPortalData();
    } catch (e) {
      console.error("Erro ao criar agendamento", e);
      alert("Erro ao criar agendamento.");
    }
  };

  const handleCancelAppointment = async (appId: string) => {
    if (confirm("Confirmar cancelamento deste agendamento?")) {
      try {
        await updateDocument("maintenance_appointments", appId, { status: "Cancelado" });
        alert("Agendamento cancelado com sucesso.");
        await loadPortalData();
      } catch (e) {
        console.error(e);
        alert("Erro ao cancelar agendamento.");
      }
    }
  };

  const handleStartOsFromAppointment = async (app: any) => {
    try {
      // Create new OS linked to the vehicle and description
      const newWo = await addDocument("work_orders", {
        vehicleId: app.vehicleId,
        description: `Agendamento: ${app.title}`,
        status: "Aberta",
        mileage: 0,
        totalPartsCost: 0,
        totalLaborCost: 0,
        totalCost: 0,
        workshopId: currentUser?.uid || "uid-workshop",
        createdAt: new Date().toISOString()
      });

      // Update appointment status to complete
      await updateDocument("maintenance_appointments", app.id, { status: "Realizado" });

      await loadPortalData();

      // Open the modal for the new WO
      handleOpenEditModal(newWo);
    } catch (e) {
      console.error(e);
      alert("Erro ao iniciar OS a partir do agendamento.");
    }
  };

  // Register standard inventory item
  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !partCode.trim()) {
      alert("Por favor, informe a descrição e o SKU.");
      return;
    }

    try {
      const payload = {
        name: partName,
        code: partCode,
        category: partCategory,
        unit: partUnit,
        currentQty: Number(partQty),
        avgCost: Number(partCost),
        minStock: Number(partMinStock),
        active: true,
        createdAt: new Date().toISOString()
      };

      await addDocument("inventory_items", payload);
      alert("Peça cadastrada no estoque com sucesso!");
      setIsNewPartModalOpen(false);
      
      // Reset form
      setPartName("");
      setPartCode("");
      setPartCategory("Motor");
      setPartUnit("Unidade");
      setPartQty(0);
      setPartCost(0);
      setPartMinStock(5);

      await loadPortalData();
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar peça.");
    }
  };

  // Status mapping colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberta":
      case "in_progress":
        return "bg-sky-500/10 border-sky-500/20 text-sky-600";
      case "Aguardando Diagnóstico":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "Orçamento Elaborado":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-600";
      case "Aguardando Aprovação":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600";
      case "Aprovada":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
      case "Em Execução":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600";
      case "Aguardando Peças":
        return "bg-orange-500/10 border-orange-500/20 text-orange-600";
      case "Concluída":
      case "completed":
        return "bg-teal-500/10 border-teal-500/20 text-teal-600";
      case "Entregue":
        return "bg-emerald-600 text-white font-semibold";
      case "Cancelada":
      case "cancelled":
        return "bg-red-500/10 border-red-500/20 text-red-600";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-600";
    }
  };

  // Filtered lists memos
  const filteredActiveWo = useMemo(() => {
    return workOrders.filter(wo => {
      const isFinished = wo.status === "Concluída" || wo.status === "Entregue" || wo.status === "completed" || wo.status === "Cancelada";
      if (isFinished) return false;

      const vehicle = vehicles.find(v => v.id === wo.vehicleId);
      const plate = vehicle ? vehicle.plate.toLowerCase() : "";
      const desc = (wo.description || "").toLowerCase();
      const matchSearch = plate.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      
      const mappedStatus = wo.status === "in_progress" ? "Aberta" : wo.status === "completed" ? "Concluída" : wo.status;
      const matchStatus = statusFilter === "all" || mappedStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [workOrders, vehicles, searchTerm, statusFilter]);

  const filteredHistory = useMemo(() => {
    return workOrders.filter(wo => {
      const isFinished = wo.status === "Concluída" || wo.status === "Entregue" || wo.status === "completed";
      if (!isFinished) return false;

      const vehicle = vehicles.find(v => v.id === wo.vehicleId);
      const plate = vehicle ? vehicle.plate.toLowerCase() : "";
      const desc = (wo.description || "").toLowerCase();
      return plate.includes(historySearchTerm.toLowerCase()) || desc.includes(historySearchTerm.toLowerCase());
    });
  }, [workOrders, vehicles, historySearchTerm]);

  const filteredApps = useMemo(() => {
    return appointments.filter(app => {
      const vehicle = vehicles.find(v => v.id === app.vehicleId);
      const plate = vehicle ? vehicle.plate.toLowerCase() : "";
      const title = (app.title || "").toLowerCase();
      return plate.includes(appSearchTerm.toLowerCase()) || title.includes(appSearchTerm.toLowerCase());
    });
  }, [appointments, vehicles, appSearchTerm]);

  const filteredStock = useMemo(() => {
    return inventoryItems.filter(item => {
      const name = (item.name || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      return name.includes(stockSearchTerm.toLowerCase()) || code.includes(stockSearchTerm.toLowerCase());
    });
  }, [inventoryItems, stockSearchTerm]);

  const activeOSCount = useMemo(() => {
    return workOrders.filter(w => w.status !== "Concluída" && w.status !== "Entregue" && w.status !== "completed" && w.status !== "Cancelada").length;
  }, [workOrders]);

  const totalCompletedCount = useMemo(() => {
    return workOrders.filter(w => w.status === "Concluída" || w.status === "Entregue" || w.status === "completed").length;
  }, [workOrders]);

  const totalValueSum = useMemo(() => {
    return workOrders
      .filter(w => w.status === "Concluída" || w.status === "Entregue" || w.status === "completed")
      .reduce((sum, w) => sum + (w.totalCost || 0), 0);
  }, [workOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-xs font-semibold">Carregando Portal da Oficina...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Parceiros</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary font-bold">Portal da Oficina</span>
      </nav>

      {/* Welcome & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary animate-pulse" />
            <span>Portal Operacional da Oficina</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Espaço completo para gerenciamento de diagnósticos, agendas de revisões preventivas, requisições de estoque e controle financeiro de peças/serviços.
          </p>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant text-[11px] text-on-surface-variant">
          Oficina Credenciada: <span className="font-bold text-primary">{currentUser?.displayName || "Parceiro FleetOS"}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">OS Ativas</span>
            <span className="text-2xl font-black text-primary font-mono">{activeOSCount}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50/10 rounded-lg text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Agendamentos Ativos</span>
            <span className="text-2xl font-black text-primary font-mono">
              {appointments.filter(a => a.status === "Agendado").length}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50/10 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Faturamento Concluído</span>
            <span className="text-2xl font-black text-primary font-mono">
              {totalValueSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Total de {totalCompletedCount} OS concluídas</span>
          </div>
        </div>
      </section>

      {/* Portal Navigation Tabs */}
      <div className="flex border-b border-outline-variant text-xs">
        {[
          { id: "orders", label: "📋 Ordens de Serviço Ativas" },
          { id: "schedule", label: "📅 Agenda de Revisões" },
          { id: "stock", label: "📦 Estoque & Peças" },
          { id: "history", label: "📜 Histórico de OS Concluídas" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePortalTab(tab.id)}
            className={`px-6 py-3 font-bold border-b-2 transition-all ${
              activePortalTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Active Tab */}
      
      {/* 1. Tab - Orders */}
      {activePortalTab === "orders" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Buscar por placa de veículo ou descrição de OS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none text-on-surface"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface-variant">Filtrar Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 outline-none text-on-surface"
              >
                <option value="all">Todos os Status</option>
                <option value="Aberta">Aberta / Em andamento</option>
                <option value="Aguardando Diagnóstico">Aguardando Diagnóstico</option>
                <option value="Orçamento Elaborado">Orçamento Elaborado</option>
                <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Aguardando Peças">Aguardando Peças</option>
              </select>
            </div>
          </div>

          {filteredActiveWo.length === 0 ? (
            <div className="text-center p-12 bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <Inbox className="w-12 h-12 text-outline mx-auto mb-4" />
              <h3 className="text-sm font-bold text-primary">Nenhuma OS Ativa Encontrada</h3>
              <p className="text-xs text-on-surface-variant mt-1">Não há ordens de serviço pendentes ou em andamento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActiveWo.map(wo => {
                const vehicle = vehicles.find(v => v.id === wo.vehicleId);
                const mappedStatus = wo.status === "in_progress" ? "Aberta" : wo.status === "completed" ? "Concluída" : wo.status;
                
                return (
                  <div 
                    key={wo.id} 
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Car className="w-4 h-4" />
                          </span>
                          <span className="font-mono text-sm font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant">
                            {vehicle ? vehicle.plate : "S/P"}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(mappedStatus)}`}>
                          {mappedStatus}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-on-surface line-clamp-1">{wo.description}</h3>
                      <p className="text-[11px] text-on-surface-variant mt-1 font-geist">
                        {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "Veículo não identificado"}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-outline-variant text-[10px] text-on-surface-variant font-mono">
                        <div>KM Entrada: <span className="font-bold">{wo.mileage} km</span></div>
                        <div>Abertura: <span className="font-bold">{new Date(wo.createdAt).toLocaleDateString("pt-BR")}</span></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant flex justify-between items-center">
                      <div className="text-xs font-mono font-bold text-primary">
                        Total: {wo.totalCost ? wo.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "R$ 0,00"}
                      </div>
                      <button
                        onClick={() => handleOpenEditModal(wo)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-bold hover:opacity-95 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Gerenciar OS</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Tab - Agenda */}
      {activePortalTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Buscar agendamentos por placa ou serviço..."
                value={appSearchTerm}
                onChange={(e) => setAppSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none text-on-surface"
              />
            </div>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Manutenção</span>
            </button>
          </div>

          {filteredApps.length === 0 ? (
            <div className="text-center p-12 bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <Inbox className="w-12 h-12 text-outline mx-auto mb-4" />
              <h3 className="text-sm font-bold text-primary">Nenhum Agendamento Encontrado</h3>
              <p className="text-xs text-on-surface-variant mt-1">Utilize o botão acima para criar um novo agendamento operacional.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.map((app) => {
                const vehicle = vehicles.find((v) => v.id === app.vehicleId);
                return (
                  <div key={app.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-primary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant">
                            {vehicle ? vehicle.plate : "S/P"}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            {app.type}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === "Agendado" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          app.status === "Em Andamento" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          app.status === "Cancelado" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface">{app.title}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 font-geist">
                        {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "Veículo não cadastrado"}
                      </p>
                      {app.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">{app.notes}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-outline-variant text-[10px] text-on-surface-variant font-mono">
                        <div>Data: <span className="font-bold">{new Date(app.scheduledDate + "T12:00:00").toLocaleDateString("pt-BR")}</span></div>
                        <div>Horário: <span className="font-bold">{app.scheduledTime}</span></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant flex justify-end gap-2">
                      {app.status === "Agendado" && (
                        <>
                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 text-[10px] font-bold rounded-lg transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleStartOsFromAppointment(app)}
                            className="px-4 py-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Iniciar OS</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Tab - Stock */}
      {activePortalTab === "stock" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Buscar peças por nome ou SKU..."
                value={stockSearchTerm}
                onChange={(e) => setStockSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none text-on-surface"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedWo(null); // avulso context
                  setIsProvisionalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600/10 border border-amber-250 text-amber-700 font-bold rounded-lg hover:bg-amber-600/20 transition-all text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Solicitar Peça Provisória</span>
              </button>
              <button
                onClick={() => setIsNewPartModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Peça</span>
              </button>
            </div>
          </div>

          <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3">Código/SKU</th>
                  <th className="p-3">Descrição / Nome</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Qtd Atual</th>
                  <th className="p-3 text-right">Custo Médio</th>
                  <th className="p-3 text-right">Est. Mínimo</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-on-surface-variant italic">
                      Nenhuma peça cadastrada ou encontrada no estoque.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => {
                    const isLowStock = item.currentQty <= (item.minStock || 0);
                    return (
                      <tr key={item.id} className="border-b border-outline-variant hover:bg-surface-container-lowest/50">
                        <td className="p-3 font-mono text-[11px] font-bold text-slate-700">{item.code || "S/C"}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-650">{item.category}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          {item.currentQty} {item.unit || "un"}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(item.avgCost || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">{item.minStock || 0}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLowStock 
                              ? "bg-amber-100 text-amber-800 border border-amber-200" 
                              : "bg-emerald-100 text-emerald-850 border border-emerald-200"
                          }`}>
                            {isLowStock ? "Estoque Baixo" : "Em Dia"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab - History */}
      {activePortalTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Buscar no histórico por placa ou descrição..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none text-on-surface"
              />
            </div>
          </div>

          <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3">Código OS</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Modelo do Veículo</th>
                  <th className="p-3">Descrição / Diagnóstico</th>
                  <th className="p-3">Data de Conclusão</th>
                  <th className="p-3 text-right">Insumos/Peças</th>
                  <th className="p-3 text-right">Mão de Obra</th>
                  <th className="p-3 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-on-surface-variant italic">
                      Nenhuma ordem de serviço concluída no histórico.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((wo) => {
                    const vehicle = vehicles.find((v) => v.id === wo.vehicleId);
                    return (
                      <tr key={wo.id} className="border-b border-outline-variant hover:bg-surface-container-lowest/50">
                        <td className="p-3 font-mono text-[11px] font-bold text-primary">
                          OS-{wo.id.substring(0, 5).toUpperCase()}
                        </td>
                        <td className="p-3 font-mono text-[11px] font-bold text-slate-800">
                          {vehicle ? vehicle.plate : "S/P"}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : "N/D"}
                        </td>
                        <td className="p-3 text-slate-700 line-clamp-1 max-w-[200px]">{wo.description}</td>
                        <td className="p-3 text-slate-650">
                          {wo.completedAt ? new Date(wo.completedAt).toLocaleDateString("pt-BR") : "N/D"}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(wo.totalPartsCost || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(wo.totalLaborCost || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-violet-750 text-violet-700">
                          {(wo.totalCost || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main OS Editing Modal */}
      {isEditModalOpen && selectedWo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h2 className="text-lg font-bold text-primary font-geist flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  <span>Gerenciamento de Ordem de Serviço</span>
                </h2>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Edite status, registre mão de obra, insumos e solicite peças adicionais.
                </p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveOS} className="space-y-4 text-xs">
              {/* Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Status Operacional</label>
                  <select
                    value={woStatus}
                    onChange={(e) => setWoStatus(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="Aberta">Aberta / Pendente</option>
                    <option value="Aguardando Diagnóstico">Aguardando Diagnóstico</option>
                    <option value="Orçamento Elaborado">Orçamento Elaborado</option>
                    <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Aguardando Peças">Aguardando Peças</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Veículo Placa</label>
                  <input
                    type="text"
                    disabled
                    value={vehicles.find(v => v.id === selectedWo.vehicleId)?.plate || ""}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface opacity-75 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Odômetro Atual (KM)</label>
                  <input
                    type="number"
                    required
                    value={woMileage}
                    onChange={(e) => setWoMileage(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Diagnóstico / Descrição do Serviço</label>
                <textarea
                  value={woDescription}
                  onChange={(e) => setWoDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  placeholder="Relate o problema constatado ou serviços que serão realizados..."
                />
              </div>

              {/* Items Management */}
              <div className="space-y-3 pt-3 border-t border-outline-variant">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>Insumos e Mão de Obra Aplicados</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsProvisionalOpen(true)}
                    className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Cadastrar Peça Provisória</span>
                  </button>
                </div>

                {/* Items Add Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-on-surface-variant mb-1">Tipo</label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                    >
                      <option value="PART">Peça (Estoque)</option>
                      <option value="LABOR">Mão de Obra</option>
                      <option value="THIRD_PARTY">Terceiros</option>
                      <option value="BODYWORK">Funilaria</option>
                      <option value="PAINT">Pintura</option>
                      <option value="TOW">Guincho</option>
                      <option value="ALIGNMENT">Alinhamento</option>
                      <option value="BALANCING">Balanceamento</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    {newItemType === "PART" ? (
                      <>
                        <label className="block text-[9px] font-bold text-on-surface-variant mb-1">Item Catálogo</label>
                        <select
                          value={newItemId}
                          onChange={(e) => handlePartChange(e.target.value)}
                          className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                        >
                          {inventoryItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.currentQty} {item.unit})
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="block text-[9px] font-bold text-on-surface-variant mb-1">Descrição do Serviço</label>
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                          className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                          placeholder="Ex: Pintura lateral esquerda"
                        />
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-on-surface-variant mb-1">Qtd / Horas</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-on-surface-variant mb-1">Custo Unitário</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItemUnitCost}
                      onChange={(e) => setNewItemUnitCost(Number(e.target.value))}
                      className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddWoItem}
                      className="w-full py-1.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                        <th className="p-2.5">Tipo</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5 text-right">Qtd</th>
                        <th className="p-2.5 text-right">Unitário</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-on-surface-variant italic">
                            Nenhum item adicionado a esta OS.
                          </td>
                        </tr>
                      ) : (
                        woItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-lowest">
                            <td className="p-2.5">
                              <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase">
                                {item.type === "PART" ? "Peça" : 
                                 item.type === "LABOR" ? "Mão de Obra" :
                                 item.type === "THIRD_PARTY" ? "Terceiros" :
                                 item.type === "BODYWORK" ? "Funilaria" :
                                 item.type === "PAINT" ? "Pintura" :
                                 item.type === "TOW" ? "Guincho" :
                                 item.type === "ALIGNMENT" ? "Alinhamento" : "Balanceamento"}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium">{item.description}</td>
                            <td className="p-2.5 text-right font-mono">{item.qty}</td>
                            <td className="p-2.5 text-right font-mono">
                              {item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-primary">
                              {(item.qty * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveWoItem(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-surface-container border border-outline-variant text-primary font-bold rounded-lg hover:bg-surface-container-high transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provisional Item Register Sub-Modal */}
      {isProvisionalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-extrabold text-primary flex items-center gap-1.5 text-sm font-geist">
                <PlusCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Solicitar Peça Provisória</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsProvisionalOpen(false)} 
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleRegisterProvisionalItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Descrição da Peça</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mangueira de ar quente Toyota Corolla 2024"
                  value={provDesc}
                  onChange={(e) => setProvDesc(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={provQty}
                    onChange={(e) => setProvQty(Number(e.target.value))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Preço Est. Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={provUnitCost}
                    onChange={(e) => setProvUnitCost(Number(e.target.value))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Observações / Motivação</label>
                <textarea
                  value={provNotes}
                  onChange={(e) => setProvNotes(e.target.value)}
                  rows={2}
                  placeholder="Especifique a urgência ou compatibilidade..."
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsProvisionalOpen(false)}
                  className="px-3.5 py-1.5 bg-surface-container border border-outline-variant text-primary font-bold rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all"
                >
                  Confirmar Envio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-extrabold text-primary flex items-center gap-1.5 text-sm font-geist">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Agendar Nova Manutenção</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAppointmentModalOpen(false)} 
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Veículo Operacional *</label>
                <select
                  required
                  value={appVehicleId}
                  onChange={(e) => setAppVehicleId(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                >
                  <option value="">Selecione um veículo...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} - {v.brand} {v.model} ({v.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Serviço Planejado / Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de pastilhas e óleo / Revisão preventiva"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Data Agendada *</label>
                  <input
                    type="date"
                    required
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Horário Agendado *</label>
                  <input
                    type="time"
                    required
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Tipo de Manutenção</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Observações da Oficina</label>
                <textarea
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalhes ou sintomas descritos pelo motorista..."
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="px-3.5 py-1.5 bg-surface-container border border-outline-variant text-primary font-bold rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg transition-all"
                >
                  Criar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Part Modal */}
      {isNewPartModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-extrabold text-primary flex items-center gap-1.5 text-sm font-geist">
                <Package className="w-5 h-5 text-primary" />
                <span>Cadastrar Nova Peça no Estoque</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsNewPartModalOpen(false)} 
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Descrição / Nome da Peça *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Filtro de Óleo Corolla 2020-2025"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: FO-TOY-02"
                    value={partCode}
                    onChange={(e) => setPartCode(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Categoria</label>
                  <select
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="Motor">Motor</option>
                    <option value="Suspensão">Suspensão</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Freios">Freios</option>
                    <option value="Elétrica">Elétrica</option>
                    <option value="Pneus">Pneus</option>
                    <option value="Óleo e Fluidos">Óleo e Fluidos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={partQty}
                    onChange={(e) => setPartQty(Number(e.target.value))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Custo Médio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={partCost}
                    onChange={(e) => setPartCost(Number(e.target.value))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Est. Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={partMinStock}
                    onChange={(e) => setPartMinStock(Number(e.target.value))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Unidade de Medida</label>
                <select
                  value={partUnit}
                  onChange={(e) => setPartUnit(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                >
                  <option value="Unidade">Unidade</option>
                  <option value="Litro">Litro</option>
                  <option value="Jogo">Jogo</option>
                  <option value="Peça">Peça</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsNewPartModalOpen(false)}
                  className="px-3.5 py-1.5 bg-surface-container border border-outline-variant text-primary font-bold rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg transition-all"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
