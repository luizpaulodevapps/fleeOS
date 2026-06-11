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
  TrendingUp,
  Inbox
} from "lucide-react";

export default function WorkshopPortal() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  
  // Data State
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [workOrderItems, setWorkOrderItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
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

  const loadPortalData = useCallback(async () => {
    try {
      setLoading(true);
      const [woList, woiList, invList, vehList] = await Promise.all([
        getCollection("work_orders"),
        getCollection("work_order_items"),
        getCollection("inventory_items"),
        getCollection("vehicles")
      ]);

      // Filter work orders assigned to this workshop (uid-workshop)
      // If super_admin/owner, show all to allow testing
      const filteredWo = woList.filter((wo: any) => {
        if (currentUser?.roleId === "role-super-admin" || currentUser?.roleId === "role-owner") {
          return true;
        }
        return wo.workshopId === currentUser?.uid || wo.workshopId === "uid-workshop";
      });

      setWorkOrders(filteredWo || []);
      setWorkOrderItems(woiList || []);
      setInventoryItems(invList || []);
      setVehicles(vehList || []);
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
        workOrderId: selectedWo.id,
        description: provDesc,
        qty: Number(provQty),
        requestedBy: currentUser?.displayName || currentUser?.email || "Oficina Parceira",
        status: "pending",
        notes: provNotes,
        estimatedUnitCost: Number(provUnitCost),
        createdAt: new Date().toISOString()
      });

      // 2. Add to local items array for current OS
      setWoItems(prev => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          type: "PART",
          itemId: pendingDoc.id, // Reference to pending items
          description: `[Provisório] ${provDesc}`,
          qty: Number(provQty),
          unitCost: Number(provUnitCost),
          isProvisional: true
        }
      ]);

      // Reset provisional form
      setProvDesc("");
      setProvQty(1);
      setProvNotes("");
      setProvUnitCost(0);
      setIsProvisionalOpen(false);
      alert("Peça provisória solicitada e adicionada à OS!");
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

  const filteredWo = useMemo(() => {
    return workOrders.filter(wo => {
      const vehicle = vehicles.find(v => v.id === wo.vehicleId);
      const plate = vehicle ? vehicle.plate.toLowerCase() : "";
      const desc = (wo.description || "").toLowerCase();
      const matchSearch = plate.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      
      const mappedStatus = wo.status === "in_progress" ? "Aberta" : wo.status === "completed" ? "Concluída" : wo.status;
      const matchStatus = statusFilter === "all" || mappedStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [workOrders, vehicles, searchTerm, statusFilter]);

  const activeOSCount = useMemo(() => {
    return workOrders.filter(w => w.status !== "Concluída" && w.status !== "Entregue" && w.status !== "completed" && w.status !== "Cancelada").length;
  }, [workOrders]);

  const totalValueSum = useMemo(() => {
    return workOrders
      .filter(w => w.status !== "Cancelada")
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
            <Wrench className="w-8 h-8 text-primary" />
            <span>Portal Operacional da Oficina</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Espaço integrado para oficinas parceiras gerenciarem diagnósticos, orçamentos, peças aplicadas e progresso de Ordens de Serviço.
          </p>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant text-[11px] text-on-surface-variant">
          Logado como: <span className="font-bold text-primary">{currentUser?.displayName}</span>
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
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Aguardando Diagnóstico</span>
            <span className="text-2xl font-black text-primary font-mono">
              {workOrders.filter(w => w.status === "Aguardando Diagnóstico").length}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50/10 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Faturamento Estimado</span>
            <span className="text-2xl font-black text-primary font-mono">
              {totalValueSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl text-xs">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Buscar por placa de veículo ou descrição de OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant">Filtrar Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 outline-none text-on-surface"
          >
            <option value="all">Todos os Status</option>
            <option value="Aberta">Aberta / Em andamento</option>
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
      </div>

      {/* Work Orders List */}
      {filteredWo.length === 0 ? (
        <div className="text-center p-12 bg-surface-container-lowest border border-outline-variant rounded-2xl">
          <Inbox className="w-12 h-12 text-outline mx-auto mb-4" />
          <h3 className="text-sm font-bold text-primary">Nenhuma Ordem de Serviço Encontrada</h3>
          <p className="text-xs text-on-surface-variant mt-1">Nenhuma OS corresponde aos filtros ou está vinculada a esta oficina.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWo.map(wo => {
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
    </div>
  );
}
