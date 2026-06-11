"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle, 
  Package, 
  Truck, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Activity,
  Building,
  ShoppingCart,
  Car,
  Layers
} from "lucide-react";

// Types
import { 
  MaintenanceLog, 
  MaintenancePlanItem, 
  WorkOrder, 
  MaintenanceFormData, 
  PlanFormData, 
  WorkOrderFormData, 
  WorkOrderItemInput 
} from "./_lib/types";
import { InventoryItem, InventoryFormData } from "../inventory/_lib/types";
import { Supplier, SupplierFormData, PurchaseOrder, PurchaseOrderFormData, POItemInput } from "../purchasing/_lib/types";

// Hooks
import { useMaintenance, useMaintenancePlan } from "./_hooks/useMaintenance";
import { useWorkOrder } from "./_hooks/useWorkOrder";
import { useInventory, useInventoryMovements } from "../inventory/_hooks/useInventory";
import { useSuppliers, usePurchaseOrders } from "../purchasing/_hooks/usePurchasing";
import { useCostAnalysis } from "../financial/costs/_hooks/useCostAnalysis";

// Components
import { MaintenanceLogModal } from "./_components/MaintenanceLogModal";
import { MaintenanceLogsTable } from "./_components/MaintenanceLogsTable";
import { MaintenancePlanModal } from "./_components/MaintenancePlanModal";
import { MaintenancePlansTable } from "./_components/MaintenancePlansTable";
import { WorkOrderModal } from "./_components/WorkOrderModal";
import { WorkOrdersTable } from "./_components/WorkOrdersTable";

import { InventoryModal } from "../inventory/_components/InventoryModal";
import { InventoryTable } from "../inventory/_components/InventoryTable";

import { PurchaseOrderModal } from "../purchasing/_components/PurchaseOrderModal";
import { PurchaseOrdersTable } from "../purchasing/_components/PurchaseOrdersTable";
import { SupplierModal } from "../purchasing/_components/SupplierModal";
import { SuppliersList } from "../purchasing/_components/SuppliersList";

export default function MaintenanceManager() {
  const { currentUser, getCollection, addDocument, updateDocument, can } = useAuth();
  
  // Custom Hooks calls
  const { 
    maintenance, 
    loading: loadingMaint, 
    loadMaintenance, 
    createMaintenance, 
    deleteMaintenance, 
    finishMaintenance 
  } = useMaintenance();

  const { 
    planItems, 
    loading: loadingPlan, 
    loadPlanItems, 
    createPlanItem, 
    performService, 
    deletePlanItem 
  } = useMaintenancePlan();

  const { 
    workOrders, 
    workOrderItems, 
    loading: loadingWo, 
    loadWorkOrders, 
    saveWorkOrder, 
    deleteWorkOrder 
  } = useWorkOrder();

  const { 
    inventoryItems, 
    loading: loadingInv, 
    loadInventory, 
    saveInventoryItem, 
    deleteInventoryItem, 
    generatePartCode, 
    getLowStockItems 
  } = useInventory();

  const { 
    movements: inventoryMovements, 
    loading: loadingMov, 
    loadMovements 
  } = useInventoryMovements();

  const { 
    suppliers, 
    loading: loadingSup, 
    loadSuppliers, 
    saveSupplier 
  } = useSuppliers();

  const { 
    purchaseOrders, 
    purchaseOrderItems, 
    loading: loadingPo, 
    loadPurchaseOrders, 
    savePurchaseOrder, 
    deliverPurchaseOrder 
  } = usePurchaseOrders();

  const { 
    vehicleExpenses, 
    loading: loadingCosts, 
    loadExpenses, 
    analyzeCosts 
  } = useCostAnalysis();

  // Local Page State
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [pricingCategories, setPricingCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [selectedVehicleIdFilter, setSelectedVehicleIdFilter] = useState("all");
  const [activeSubTab, setActiveSubTab] = useState("logs"); 
  const [localLoading, setLocalLoading] = useState(true);

  // Modals Visibility
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // Selected Edit Items
  const [selectedWo, setSelectedWo] = useState<any | null>(null);
  const [selectedInv, setSelectedInv] = useState<any | null>(null);
  const [selectedSup, setSelectedSup] = useState<any | null>(null);

  // Pending Items Catalog Queue State
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [selectedPendingItem, setSelectedPendingItem] = useState<any | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogFormData, setCatalogFormData] = useState<any>({
    code: "",
    name: "",
    minQty: 5,
    currentQty: 0,
    avgCost: 0,
    unit: "Unidade",
    active: true
  });

  // Form states
  const [woFormData, setWoFormData] = useState<WorkOrderFormData>({
    vehicleId: "",
    description: "",
    mileage: "",
    status: "in_progress",
    items: []
  });

  const [newWoItem, setNewWoItem] = useState<WorkOrderItemInput>({
    type: "PART",
    itemId: "",
    description: "",
    qty: 1,
    unitCost: 0
  });

  const [invFormData, setInvFormData] = useState<InventoryFormData>({
    code: "",
    name: "",
    minQty: 0,
    currentQty: 0,
    avgCost: 0,
    unit: "Jogo",
    active: true
  });

  const [supFormData, setSupFormData] = useState<SupplierFormData>({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    active: true
  });

  const [poFormData, setPoFormData] = useState<PurchaseOrderFormData>({
    supplierId: "",
    paymentMethod: "Pix",
    items: []
  });

  const [newPoItem, setNewPoItem] = useState<POItemInput>({
    itemId: "",
    qty: 1,
    unitCost: 0
  });

  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicleId: "",
    type: "Preventiva",
    description: "",
    cost: "",
    date: "",
    mileage: "",
    nextMaintenanceMileage: "",
    putInMaintenanceStatus: true,
    crashSeverity: "Leve"
  });

  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    vehicleId: "",
    itemName: "Óleo",
    intervalKm: "10000",
    lastServiceKm: "0"
  });

  const loadData = useCallback(async () => {
    try {
      setLocalLoading(true);
      const [vehList, catList, pendingList] = await Promise.all([
        getCollection("vehicles"),
        getCollection("pricing_categories"),
        getCollection("inventory_pending_items")
      ]);
      setVehicles(vehList || []);
      setPricingCategories(catList || []);
      setPendingItems(pendingList || []);

      await Promise.all([
        loadMaintenance(),
        loadPlanItems(),
        loadWorkOrders(),
        loadInventory(),
        loadMovements(),
        loadSuppliers(),
        loadPurchaseOrders(),
        loadExpenses()
      ]);
    } catch (e) {
      console.error("Erro ao carregar dados técnicos", e);
    } finally {
      setLocalLoading(false);
    }
  }, [
    getCollection,
    loadMaintenance,
    loadPlanItems,
    loadWorkOrders,
    loadInventory,
    loadMovements,
    loadSuppliers,
    loadPurchaseOrders,
    loadExpenses
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set default values when inventory list loads
  useEffect(() => {
    if (inventoryItems.length > 0 && !newWoItem.itemId) {
      setNewWoItem(prev => ({
        ...prev,
        itemId: inventoryItems[0].id,
        unitCost: inventoryItems[0].avgCost || 0,
        description: inventoryItems[0].name
      }));
    }
  }, [inventoryItems, newWoItem.itemId]);

  useEffect(() => {
    if (inventoryItems.length > 0 && !newPoItem.itemId) {
      setNewPoItem(prev => ({
        ...prev,
        itemId: inventoryItems[0].id,
        unitCost: inventoryItems[0].avgCost || 0
      }));
    }
  }, [inventoryItems, newPoItem.itemId]);

  // Modals Actions
  const openMaintModal = () => {
    setFormData({
      vehicleId: vehicles[0]?.id || "",
      type: "Preventiva",
      description: "",
      cost: "",
      date: new Date().toISOString().split("T")[0],
      mileage: vehicles[0]?.mileage?.toString() || "0",
      nextMaintenanceMileage: vehicles[0]?.mileage ? (vehicles[0].mileage + 10000).toString() : "10000",
      putInMaintenanceStatus: true,
      crashSeverity: "Leve"
    });
    setIsMaintModalOpen(true);
  };

  const openPlanModal = () => {
    setPlanFormData({
      vehicleId: vehicles[0]?.id || "",
      itemName: "Óleo",
      intervalKm: "10000",
      lastServiceKm: vehicles[0]?.mileage?.toString() || "0"
    });
    setIsPlanModalOpen(true);
  };

  const openNewWoModal = () => {
    setSelectedWo(null);
    setWoFormData({
      vehicleId: vehicles[0]?.id || "",
      description: "",
      mileage: vehicles[0]?.mileage?.toString() || "0",
      status: "in_progress",
      items: []
    });
    setNewWoItem({
      type: "PART",
      itemId: inventoryItems[0]?.id || "",
      description: inventoryItems[0]?.name || "",
      qty: 1,
      unitCost: inventoryItems[0]?.avgCost || 0
    });
    setIsWoModalOpen(true);
  };

  const openEditWoModal = (wo: any) => {
    setSelectedWo(wo);
    const matchedItems = workOrderItems.filter(item => item.workOrderId === wo.id);
    setWoFormData({
      vehicleId: wo.vehicleId,
      description: wo.description,
      mileage: wo.mileage.toString(),
      status: wo.status,
      items: matchedItems.map(item => ({
        type: item.type,
        itemId: item.itemId,
        description: item.description,
        qty: item.qty,
        unitCost: item.unitCost
      }))
    });
    setNewWoItem({
      type: "PART",
      itemId: inventoryItems[0]?.id || "",
      description: inventoryItems[0]?.name || "",
      qty: 1,
      unitCost: inventoryItems[0]?.avgCost || 0
    });
    setIsWoModalOpen(true);
  };

  const openNewInvModal = () => {
    setSelectedInv(null);
    setInvFormData({
      code: generatePartCode(),
      name: "",
      minQty: 5,
      currentQty: 0,
      avgCost: 0,
      unit: "Unidade",
      active: true
    });
    setIsInvModalOpen(true);
  };

  const openEditInvModal = (item: any) => {
    setSelectedInv(item);
    setInvFormData({
      code: item.code,
      name: item.name,
      minQty: item.minQty,
      currentQty: item.currentQty,
      avgCost: item.avgCost,
      unit: item.unit,
      active: item.active
    });
    setIsInvModalOpen(true);
  };

  const openNewSupModal = () => {
    setSelectedSup(null);
    setSupFormData({
      name: "",
      cnpj: "",
      phone: "",
      email: "",
      address: "",
      active: true
    });
    setIsSupModalOpen(true);
  };

  const openEditSupModal = (sup: any) => {
    setSelectedSup(sup);
    setSupFormData({
      name: sup.name,
      cnpj: sup.cnpj,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      active: sup.active
    });
    setIsSupModalOpen(true);
  };

  const openNewPoModal = () => {
    setPoFormData({
      supplierId: suppliers[0]?.id || "",
      paymentMethod: "Pix",
      items: []
    });
    setNewPoItem({
      itemId: inventoryItems[0]?.id || "",
      qty: 1,
      unitCost: inventoryItems[0]?.avgCost || 0
    });
    setIsPoModalOpen(true);
  };

  // Submit Operations
  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaintenance(formData, vehicles);
      setIsMaintModalOpen(false);
      await loadExpenses();
      alert("Lançamento de manutenção registrado!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlanItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlanItem(planFormData);
      setIsPlanModalOpen(false);
      alert("Item de revisão cadastrado com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePerformService = async (item: any) => {
    const veh = vehicles.find(v => v.id === item.vehicleId);
    if (!veh) return;
    if (confirm(`Deseja registrar a realização do serviço "${item.itemName}" para o veículo (${veh.plate}) na quilometragem atual de ${veh.mileage} km?`)) {
      try {
        await performService(item, vehicles);
        await Promise.all([loadExpenses(), loadMaintenance()]);
        alert(`Serviço de ${item.itemName} atualizado! Próxima revisão agendada.`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFinishMaintenance = async (maint: any) => {
    const selectedVeh = vehicles.find(v => v.id === maint.vehicleId);
    if (!selectedVeh) return;
    if (confirm(`Deseja marcar a manutenção deste veículo (${selectedVeh.plate}) como CONCLUÍDA e reativá-lo na frota?`)) {
      try {
        await finishMaintenance(maint, vehicles);
        const vehList = await getCollection("vehicles");
        setVehicles(vehList || []);
        alert("Veículo ativado com sucesso!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteMaintLog = async (id: string) => {
    if (confirm("Deseja realmente excluir este registro de oficina?")) {
      try {
        await deleteMaintenance(id, vehicleExpenses);
        await loadExpenses();
        alert("Lançamento excluído!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeletePlanItem = async (id: string) => {
    if (confirm("Deseja realmente remover este item de revisão preventivo?")) {
      try {
        await deletePlanItem(id);
        alert("Item de revisão removido!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddWoItem = () => {
    const matchedPart = inventoryItems.find(i => i.id === newWoItem.itemId);
    const itemDesc = newWoItem.type === "PART" ? (matchedPart?.name || "Peça") : newWoItem.description;
    
    if (newWoItem.type === "LABOR" && !newWoItem.description.trim()) {
      alert("Informe a descrição do serviço de mão de obra!");
      return;
    }

    setWoFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          type: newWoItem.type,
          itemId: newWoItem.type === "PART" ? newWoItem.itemId : null,
          description: itemDesc,
          qty: newWoItem.qty,
          unitCost: newWoItem.unitCost
        }
      ]
    }));

    setNewWoItem({
      type: "PART",
      itemId: inventoryItems[0]?.id || "",
      description: "",
      qty: 1,
      unitCost: inventoryItems[0]?.avgCost || 0
    });
  };

  const handleRemoveWoItem = (index: number) => {
    setWoFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveWorkOrder(
        woFormData,
        selectedWo,
        vehicles,
        inventoryItems,
        vehicleExpenses,
        currentUser?.uid || "uid-super"
      );
      setIsWoModalOpen(false);
      await Promise.all([
        loadInventory(),
        loadExpenses(),
        loadMaintenance(),
        loadMovements()
      ]);
      const vehList = await getCollection("vehicles");
      setVehicles(vehList || []);
      alert("Ordem de Serviço salva com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar OS.");
    }
  };

  const handleDeleteWorkOrder = async (id: string) => {
    if (confirm("Deseja realmente excluir esta Ordem de Serviço?")) {
      try {
        await deleteWorkOrder(id, vehicleExpenses);
        await loadExpenses();
        alert("Ordem de Serviço excluída!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveInventoryItem(invFormData, selectedInv);
      setIsInvModalOpen(false);
      await loadMovements();
      alert("Item de estoque salvo!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (confirm("Deseja desativar este item de estoque?")) {
      try {
        await deleteInventoryItem(id);
        alert("Item desativado.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenCatalogModal = (pendingItem: any) => {
    setSelectedPendingItem(pendingItem);
    setCatalogFormData({
      code: generatePartCode(),
      name: pendingItem.description,
      minQty: 5,
      currentQty: pendingItem.qty || 1,
      avgCost: pendingItem.estimatedUnitCost || 0,
      unit: "Unidade",
      active: true
    });
    setIsCatalogModalOpen(true);
  };

  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendingItem) return;

    try {
      // 1. Create the official inventory item
      const newItem = await addDocument("inventory_items", catalogFormData);

      // 2. Mark pending item as cataloged
      const updatedPending = {
        ...selectedPendingItem,
        status: "cataloged",
        catalogedItemId: newItem.id
      };
      await updateDocument("inventory_pending_items", selectedPendingItem.id, updatedPending);

      // 3. Update referencing work_order_items
      const woiList = await getCollection("work_order_items");
      const referencingWois = woiList.filter(item => item.itemId === selectedPendingItem.id);
      
      for (const woi of referencingWois) {
        await updateDocument("work_order_items", woi.id, {
          ...woi,
          itemId: newItem.id,
          description: newItem.name,
          unitCost: catalogFormData.avgCost,
          totalCost: woi.qty * catalogFormData.avgCost
        });

        // Also update the total cost in the work_order itself!
        const woList = await getCollection("work_orders");
        const parentWo = woList.find(w => w.id === woi.workOrderId);
        if (parentWo) {
          const parentWoi = woiList.filter(item => item.workOrderId === parentWo.id);
          const updatedWoi = parentWoi.map(item => {
            if (item.id === woi.id) {
              return {
                ...item,
                itemId: newItem.id,
                description: newItem.name,
                unitCost: catalogFormData.avgCost,
                totalCost: woi.qty * catalogFormData.avgCost
              };
            }
            return item;
          });
          const totalPartsCost = updatedWoi
            .filter(item => item.type === "PART")
            .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
          const totalLaborCost = updatedWoi
            .filter(item => item.type !== "PART")
            .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
          const totalCost = totalPartsCost + totalLaborCost;

          await updateDocument("work_orders", parentWo.id, {
            ...parentWo,
            totalPartsCost,
            totalLaborCost,
            totalCost
          });
        }
      }

      setIsCatalogModalOpen(false);
      setSelectedPendingItem(null);
      alert("Item catalogado com sucesso e ordens de serviço vinculadas atualizadas!");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Erro ao catalogar item.");
    }
  };

  const handleRejectPendingItem = async (pendingItem: any) => {
    if (!confirm("Deseja rejeitar a catalogação deste item?")) return;

    try {
      await updateDocument("inventory_pending_items", pendingItem.id, {
        ...pendingItem,
        status: "rejected"
      });
      alert("Solicitação rejeitada.");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSupplier(supFormData, selectedSup);
      setIsSupModalOpen(false);
      alert("Fornecedor registrado com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPoItem = () => {
    setPoFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: newPoItem.itemId,
          qty: newPoItem.qty,
          unitCost: newPoItem.unitCost
        }
      ]
    }));
  };

  const handleRemovePoItem = (index: number) => {
    setPoFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSavePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePurchaseOrder(poFormData);
      setIsPoModalOpen(false);
      alert("Ordem de Compra emitida com sucesso!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erro ao emitir ordem de compra.");
    }
  };

  const handleDeliverPurchaseOrder = async (po: any) => {
    if (confirm(`Confirmar recebimento da Ordem de Compra ${po.id}? Isso incrementará o estoque e atualizará o custo médio.`)) {
      try {
        await deliverPurchaseOrder(po, inventoryItems);
        await Promise.all([loadInventory(), loadMovements()]);
        alert("Ordem de Compra concluída! Estoque e custo médio atualizados.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper getters
  const getVehicleInfo = (vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo Não Encontrado";
  };

  const getInventoryItemName = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    return item ? item.name : "Peça desconhecida";
  };

  const getInventoryItemCode = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    return item ? item.code : "-";
  };

  // BI and Analytics calculations
  const biData = useMemo(() => {
    return analyzeCosts(vehicles, inventoryItems, pricingCategories);
  }, [vehicles, inventoryItems, pricingCategories, analyzeCosts]);

  // Filtering Logic
  const filteredMaint = useMemo(() => {
    return maintenance.filter(m => {
      const vehInfo = getVehicleInfo(m.vehicleId).toLowerCase();
      const desc = (m.description || "").toLowerCase();
      const matchesSearch = vehInfo.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      const matchesVeh = selectedVehicleIdFilter === "all" || m.vehicleId === selectedVehicleIdFilter;
      const matchesType = typeFilter === "all" || m.type === typeFilter;
      return matchesSearch && matchesVeh && matchesType;
    });
  }, [maintenance, searchTerm, selectedVehicleIdFilter, typeFilter, vehicles]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const vehInfo = getVehicleInfo(wo.vehicleId).toLowerCase();
      const desc = (wo.description || "").toLowerCase();
      const matchesSearch = vehInfo.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      const matchesVeh = selectedVehicleIdFilter === "all" || wo.vehicleId === selectedVehicleIdFilter;
      return matchesSearch && matchesVeh;
    });
  }, [workOrders, searchTerm, selectedVehicleIdFilter, vehicles]);

  const filteredPlans = useMemo(() => {
    return planItems.filter(item => {
      const vehInfo = getVehicleInfo(item.vehicleId).toLowerCase();
      const matchesSearch = vehInfo.includes(searchTerm.toLowerCase()) || item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVeh = selectedVehicleIdFilter === "all" || item.vehicleId === selectedVehicleIdFilter;
      return matchesSearch && matchesVeh;
    });
  }, [planItems, searchTerm, selectedVehicleIdFilter, vehicles]);

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item => {
      const name = (item.name || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
    });
  }, [inventoryItems, searchTerm]);

  const lowStockCount = useMemo(() => {
    return getLowStockItems().length;
  }, [getLowStockItems]);

  const loading = localLoading || loadingMaint || loadingPlan || loadingWo || loadingInv || loadingMov || loadingSup || loadingPo || loadingCosts;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Frota</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Oficina & Estoque</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            <span>Oficina, Estoque & Custos</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Gestão de ordens de serviço (OS), consumo de peças, controle de estoque técnico, fornecedores e BI de custos da frota.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeSubTab === "logs" && can("maintenance.edit") && (
            <>
              <button
                onClick={openNewWoModal}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Ordem de Serviço (OS)</span>
              </button>
              <button
                onClick={openMaintModal}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-primary font-bold hover:bg-surface-container-high transition-all text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Lançamento Avulso</span>
              </button>
            </>
          )}

          {activeSubTab === "plans" && can("maintenance.edit") && (
            <button
              onClick={openPlanModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Item de Plano</span>
            </button>
          )}

          {activeSubTab === "estoque" && can("maintenance.edit") && (
            <button
              onClick={openNewInvModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Peça/Insumo</span>
            </button>
          )}

          {activeSubTab === "compras" && can("maintenance.edit") && (
            <>
              <button
                onClick={openNewPoModal}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Registrar Compra</span>
              </button>
              <button
                onClick={openNewSupModal}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-primary font-bold hover:bg-surface-container-high transition-all text-xs"
              >
                <Building className="w-4 h-4" />
                <span>Cadastrar Fornecedor</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-red-500/10 rounded-lg text-red-600">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Despesa Acumulada</span>
          </div>
          <div className="text-xl font-black text-primary font-mono">
            {biData.totalExpensesSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase mt-1">Custo total da frota</div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-violet-500/10 rounded-lg text-violet-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-violet-500 text-[10px] font-bold uppercase tracking-wider">Custo Médio / KM</span>
          </div>
          <div className="text-xl font-black text-primary font-mono">
            {biData.costPerKm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/km
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase mt-1">Média operacional</div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">Estoque Baixo</span>
          </div>
          <div className="text-xl font-black text-primary flex items-center gap-2">
            <span>{lowStockCount}</span>
            {lowStockCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">Atenção</span>
            )}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase mt-1">Itens abaixo do mínimo</div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
              <CheckCircle className="w-5 h-5" />
            </span>
            <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">OS em Andamento</span>
          </div>
          <div className="text-xl font-black text-primary">
            {workOrders.filter(w => w.status === "in_progress").length}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase mt-1">Fila técnica ativa</div>
        </div>
      </section>

      {/* Main Tabs Selector */}
      <div className="flex space-x-2 border-b border-outline-variant pb-3 print:hidden">
        {[
          { id: "logs", label: "Ordens de Serviço & Histórico", icon: Wrench },
          { id: "plans", label: "Planos Preventivos", icon: Activity },
          { id: "estoque", label: "Estoque Técnico", icon: Package },
          { id: "compras", label: "Compras & Fornecedores", icon: Truck },
          { id: "catalogacao", label: "Catalogação de Peças", icon: Layers },
          { id: "bi", label: "Custos & BI", icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === tab.id
                  ? "bg-primary text-on-primary font-bold shadow"
                  : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      {activeSubTab !== "bi" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl print:hidden text-xs">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder={
                activeSubTab === "logs" ? "Pesquisar por placa, modelo ou descrição..." :
                activeSubTab === "plans" ? "Pesquisar item de plano..." :
                activeSubTab === "estoque" ? "Pesquisar peça pelo nome ou código..." :
                "Pesquisar compras..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>

          <div className="flex items-center gap-2">
            {(activeSubTab === "logs" || activeSubTab === "plans") && (
              <select
                value={selectedVehicleIdFilter}
                onChange={(e) => setSelectedVehicleIdFilter(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface"
              >
                <option value="all">Todos os Veículos</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                ))}
              </select>
            )}

            {activeSubTab === "logs" && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface"
              >
                <option value="all">Filtrar Categoria</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Sinistro">Sinistro</option>
              </select>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs font-medium">Carregando painel técnico...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ORDENS DE SERVIÇO & LOGS */}
          {activeSubTab === "logs" && (
            <div className="space-y-6">
              {/* Work Orders Table */}
              <WorkOrdersTable 
                workOrders={filteredWorkOrders}
                vehicles={vehicles}
                inventoryItems={inventoryItems}
                onEdit={openEditWoModal}
                onDelete={handleDeleteWorkOrder}
                canEdit={can("maintenance.edit")}
                isLoading={loadingWo}
              />

              {/* Legacy Manual logs section */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-outline-variant">
                  <span className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span>Lançamentos Avulsos e Histórico Completo de Oficina</span>
                  </span>
                </div>
                <MaintenanceLogsTable 
                  maintenanceLogs={filteredMaint}
                  vehicles={vehicles}
                  onDelete={handleDeleteMaintLog}
                  onFinish={handleFinishMaintenance}
                  canEdit={can("maintenance.edit")}
                  isLoading={loadingMaint}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PLANS */}
          {activeSubTab === "plans" && (
            <MaintenancePlansTable 
              planItems={filteredPlans}
              vehicles={vehicles}
              onPerformService={handlePerformService}
              onDelete={handleDeletePlanItem}
              canEdit={can("maintenance.edit")}
              isLoading={loadingPlan}
            />
          )}

          {/* TAB 3: ESTOQUE TÉCNICO */}
          {activeSubTab === "estoque" && (
            <div className="space-y-6">
              <InventoryTable 
                items={filteredInventory}
                onEdit={openEditInvModal}
                onDelete={handleDeleteInventoryItem}
                canEdit={can("maintenance.edit")}
                isLoading={loadingInv}
              />

              {/* Inventory Movements Trail */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-outline-variant">
                  <span className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span>Histórico de Movimentações de Estoque</span>
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/60 border-b border-outline-variant sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant">Data</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant">Cód / Peça</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant">Tipo</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant text-right">Qtd</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant text-right">Vl. Unit</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant text-right">Total</th>
                        <th className="px-6 py-3 font-semibold text-on-surface-variant">Histórico / Documento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 font-mono">
                      {inventoryMovements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-outline italic font-sans">Nenhuma movimentação registrada no sistema.</td>
                        </tr>
                      ) : (
                        inventoryMovements.slice().reverse().map(mov => (
                          <tr key={mov.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-sans text-on-surface-variant">
                              {new Date(mov.createdAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 font-sans">
                              <span className="font-bold">{getInventoryItemCode(mov.itemId)}</span> - {getInventoryItemName(mov.itemId)}
                            </td>
                            <td className="px-6 py-4 font-sans">
                              {mov.type === "IN" ? (
                                <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                                  ENTRADA
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-150">
                                  SAÍDA
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">{mov.qty}</td>
                            <td className="px-6 py-4 text-right text-slate-600">
                              {mov.unitCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-primary">
                              {mov.totalCost?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 font-sans text-on-surface-variant max-w-xs truncate" title={mov.notes}>
                              {mov.notes}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPRAS & FORNECEDORES */}
          {activeSubTab === "compras" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Suppliers Column (Left) */}
              <div className="lg:col-span-1">
                <SuppliersList 
                  suppliers={suppliers}
                  onEdit={openEditSupModal}
                  canEdit={can("maintenance.edit")}
                  isLoading={loadingSup}
                />
              </div>

              {/* Purchase Orders Column (Right/Main) */}
              <div className="lg:col-span-2">
                <PurchaseOrdersTable 
                  purchaseOrders={purchaseOrders}
                  suppliers={suppliers}
                  onDeliver={handleDeliverPurchaseOrder}
                  canEdit={can("maintenance.edit")}
                  isLoading={loadingPo}
                />
              </div>
            </div>
          )}

          {/* TAB 5: BI & INTELIGÊNCIA DE CUSTOS */}
          {activeSubTab === "bi" && (
            <div className="space-y-6">
              {/* Cost Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Costs by Vehicle */}
                <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-xl shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    <span>Custos Acumulados por Veículo</span>
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {biData.costsByVehicle.length === 0 ? (
                      <p className="text-center italic text-outline text-xs">Nenhum custo registrado para os veículos.</p>
                    ) : (
                      biData.costsByVehicle.map(item => {
                        const pct = biData.totalExpensesSum > 0 ? (item.amount / biData.totalExpensesSum) * 100 : 0;
                        return (
                          <div key={item.vehicleId} className="space-y-1 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span className="text-primary font-bold">{item.info}</span>
                              <span className="font-mono text-slate-700">{item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-outline-variant/40">
                              <div 
                                style={{ width: `${pct}%` }}
                                className="h-full bg-violet-600 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Costs by Category */}
                <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-xl shadow-sm space-y-4">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Distribuição de Custos por Categoria de Veículo</span>
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {biData.costsByCategory.length === 0 ? (
                      <p className="text-center italic text-outline text-xs">Nenhum dado financeiro segmentado.</p>
                    ) : (
                      biData.costsByCategory.map(item => {
                        const pct = biData.totalExpensesSum > 0 ? (item.amount / biData.totalExpensesSum) * 100 : 0;
                        return (
                          <div key={item.category} className="space-y-1 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span className="text-primary font-bold">Categoria: {item.category}</span>
                              <span className="font-mono text-slate-700">{item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-outline-variant/40">
                              <div 
                                style={{ width: `${pct}%` }}
                                className="h-full bg-emerald-600 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Parts consumption report */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-outline-variant">
                  <span className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>BI: Relatório de Consumo de Peças e Insumos</span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/60 border-b border-outline-variant">
                      <tr className="font-bold text-on-surface-variant">
                        <th className="px-6 py-3">Cód Peça</th>
                        <th className="px-6 py-3">Descrição da Peça</th>
                        <th className="px-6 py-3 text-right">Qtd Consumida</th>
                        <th className="px-6 py-3 text-right">Custo Total Consumido</th>
                        <th className="px-6 py-3 text-right">Impacto Financeiro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 font-mono">
                      {biData.partsConsumption.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-outline italic font-sans">Sem consumo de peças registrado nas OS finalizadas.</td>
                        </tr>
                      ) : (
                        biData.partsConsumption.map(item => {
                          const impact = biData.totalExpensesSum > 0 ? (item.cost / biData.totalExpensesSum) * 100 : 0;
                          return (
                            <tr key={item.itemId}>
                              <td className="px-6 py-4">{item.code}</td>
                              <td className="px-6 py-4 font-sans font-bold">{item.name}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-800">{item.qty} units</td>
                              <td className="px-6 py-4 text-right text-primary font-bold">
                                {item.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                              <td className="px-6 py-4 text-right font-sans">
                                <span className="font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-100 text-[10px]">
                                  {impact.toFixed(1)}% do custo
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
            </div>
          )}

          {/* TAB 6: CATALOGAÇÃO DE PEÇAS */}
          {activeSubTab === "catalogacao" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Fila de Catalogação de Peças Provisórias</span>
                </h3>
                <p className="text-on-surface-variant text-[11px] mt-1 font-geist">
                  Abaixo estão os itens não catalogados solicitados por mecânicos em Ordens de Serviço. Preencha os códigos oficiais para registrá-los no estoque padrão.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/60 border-b border-outline-variant">
                    <tr className="font-bold text-on-surface-variant">
                      <th className="px-6 py-3">OS Vinculada</th>
                      <th className="px-6 py-3">Descrição Solicitada</th>
                      <th className="px-6 py-3 text-right">Qtd</th>
                      <th className="px-6 py-3 text-right">Valor Est.</th>
                      <th className="px-6 py-3">Solicitante</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 font-mono">
                    {pendingItems.filter(item => item.status === "pending").length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-outline italic font-sans">Nenhuma peça provisória pendente de catalogação.</td>
                      </tr>
                    ) : (
                      pendingItems.filter(item => item.status === "pending").map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-sans font-bold text-primary">
                            OS-{item.workOrderId?.substring(0, 5).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 font-sans font-bold">{item.description}</td>
                          <td className="px-6 py-4 text-right">{item.qty || 1}</td>
                          <td className="px-6 py-4 text-right text-slate-700">
                            {(item.estimatedUnitCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="px-6 py-4 font-sans text-on-surface-variant">{item.requestedBy}</td>
                          <td className="px-6 py-4 font-sans text-on-surface-variant">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              PENDENTE
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button
                              onClick={() => handleOpenCatalogModal(item)}
                              className="px-3 py-1 bg-primary text-on-primary font-bold rounded text-[10px] hover:opacity-90 transition-all font-sans"
                            >
                              Catalogar
                            </button>
                            <button
                              onClick={() => handleRejectPendingItem(item)}
                              className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-600 font-bold rounded text-[10px] hover:bg-red-500/20 transition-all font-sans"
                            >
                              Rejeitar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* WORK ORDER (OS) FORM MODAL */}
      <WorkOrderModal 
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
        onSubmit={handleSaveWorkOrder}
        formData={woFormData}
        setFormData={setWoFormData}
        newWoItem={newWoItem}
        setNewWoItem={setNewWoItem}
        onAddItem={handleAddWoItem}
        onRemoveItem={handleRemoveWoItem}
        vehicles={vehicles}
        inventoryItems={inventoryItems}
        selectedWo={selectedWo}
      />

      {/* LATEST MANUAL LOG MODAL */}
      <MaintenanceLogModal 
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        onSubmit={handleCreateMaintenance}
        formData={formData}
        setFormData={setFormData}
        vehicles={vehicles}
      />

      {/* PREVENTIVE REVISION PLAN MODAL */}
      <MaintenancePlanModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSubmit={handleCreatePlanItem}
        formData={planFormData}
        setFormData={setPlanFormData}
        vehicles={vehicles}
      />

      {/* INVENTORY MODAL */}
      <InventoryModal 
        isOpen={isInvModalOpen}
        onClose={() => setIsInvModalOpen(false)}
        onSubmit={handleSaveInventoryItem}
        formData={invFormData}
        setFormData={setInvFormData}
        selectedItem={selectedInv}
      />

      {/* SUPPLIER MODAL */}
      <SupplierModal 
        isOpen={isSupModalOpen}
        onClose={() => setIsSupModalOpen(false)}
        onSubmit={handleSaveSupplier}
        formData={supFormData}
        setFormData={setSupFormData}
        selectedSupplier={selectedSup}
      />

      {/* PURCHASE ORDER MODAL */}
      <PurchaseOrderModal 
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        onSubmit={handleSavePurchaseOrder}
        formData={poFormData}
        setFormData={setPoFormData}
        newPoItem={newPoItem}
        setNewPoItem={setNewPoItem}
        onAddItem={handleAddPoItem}
        onRemoveItem={handleRemovePoItem}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
      />

      {/* CATALOGING FORM MODAL */}
      {isCatalogModalOpen && selectedPendingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-background border border-outline-variant rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-extrabold text-primary flex items-center gap-1.5 text-sm font-geist">
                <Package className="w-5 h-5 text-primary" />
                <span>Catalogar Peça Oficial</span>
              </h3>
              <button 
                onClick={() => {
                  setIsCatalogModalOpen(false);
                  setSelectedPendingItem(null);
                }} 
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCatalogSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Código de Estoque</label>
                <input
                  type="text"
                  required
                  value={catalogFormData.code}
                  onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, code: e.target.value }))}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Nome Oficial da Peça</label>
                <input
                  type="text"
                  required
                  value={catalogFormData.name}
                  onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    required
                    value={catalogFormData.minQty}
                    onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, minQty: Number(e.target.value) }))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Quantidade Inicial</label>
                  <input
                    type="number"
                    required
                    value={catalogFormData.currentQty}
                    onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, currentQty: Number(e.target.value) }))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Unidade de Medida</label>
                  <select
                    value={catalogFormData.unit}
                    onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="Unidade">Unidade</option>
                    <option value="Jogo">Jogo</option>
                    <option value="Litro">Litro</option>
                    <option value="Par">Par</option>
                    <option value="Metro">Metro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Custo Médio Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={catalogFormData.avgCost}
                    onChange={(e) => setCatalogFormData((prev: any) => ({ ...prev, avgCost: Number(e.target.value) }))}
                    className="w-full bg-background border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    setIsCatalogModalOpen(false);
                    setSelectedPendingItem(null);
                  }}
                  className="px-3.5 py-1.5 bg-surface-container border border-outline-variant text-primary font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all"
                >
                  Salvar no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
