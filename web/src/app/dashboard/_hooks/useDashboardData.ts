"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

export function useDashboardData() {
  const { currentUser, getCollection } = useAuth();

  // Mock Database states
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [cashierSessions, setCashierSessions] = useState<any[]>([]);
  const [cashierMovements, setCashierMovements] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [regulatoryProcesses, setRegulatoryProcesses] = useState<any[]>([]);
  const [regulatoryInspections, setRegulatoryInspections] = useState<any[]>([]);
  const [taximeterRegistries, setTaximeterRegistries] = useState<any[]>([]);
  const [municipalRegulations, setMunicipalRegulations] = useState<any[]>([]);
  const [driverRegulatory, setDriverRegulatory] = useState<any[]>([]);
  const [complianceScores, setComplianceScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [
          vehiclesList,
          driversList,
          contractsList,
          paymentsList,
          maintenanceList,
          expensesList,
          acquisitionsList,
          claimsList,
          cashierSessionsList,
          cashierMovementsList,
          timelineList,
          inventoryList,
          workOrdersList,
          ledgerList,
          regProcList,
          regInsList,
          taximeterList,
          munRegList,
          driverRegList,
          compScoresList
        ] = await Promise.all([
          getCollection("vehicles"),
          getCollection("drivers"),
          getCollection("contracts"),
          getCollection("payments"),
          getCollection("maintenance"),
          getCollection("vehicle_expenses"),
          getCollection("vehicle_acquisition"),
          getCollection("insurance_claims"),
          getCollection("cashier_sessions"),
          getCollection("cashier_movements"),
          getCollection("activity_timeline"),
          getCollection("inventory_items"),
          getCollection("work_orders"),
          getCollection("driver_ledger"),
          getCollection("vehicle_regulatory_process"),
          getCollection("regulatory_inspections"),
          getCollection("taximeter_registry"),
          getCollection("municipal_regulations"),
          getCollection("driver_regulatory"),
          getCollection("vehicle_compliance_scores")
        ]);

        setVehicles(vehiclesList || []);
        setDrivers(driversList || []);
        setContracts(contractsList || []);
        setPayments(paymentsList || []);
        setMaintenance(maintenanceList || []);
        setExpenses(expensesList || []);
        setAcquisitions(acquisitionsList || []);
        setClaims(claimsList || []);
        setCashierSessions(cashierSessionsList || []);
        setCashierMovements(cashierMovementsList || []);
        setTimeline(timelineList || []);
        setInventory(inventoryList || []);
        setWorkOrders(workOrdersList || []);
        setLedger(ledgerList || []);
        setRegulatoryProcesses(regProcList || []);
        setRegulatoryInspections(regInsList || []);
        setTaximeterRegistries(taximeterList || []);
        setMunicipalRegulations(munRegList || []);
        setDriverRegulatory(driverRegList || []);
        setComplianceScores(compScoresList || []);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard completo", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentUser]);

  // Calculations Memo
  const calculations = useMemo(() => {
    const today = new Date("2026-06-13");

    // --- Patrimonial Center ---
    const totalAcquisition = acquisitions.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
    const totalFipe = acquisitions.reduce((sum, a) => sum + (a.currentFipeValue || 0), 0);
    const totalDepreciation = Math.max(0, totalAcquisition - totalFipe);

    let totalFinancingOutstanding = 0;
    acquisitions.forEach(acq => {
      if (acq.acquisitionType === "Financiamento" && acq.financedAmount > 0) {
        const pDate = new Date(acq.purchaseDate);
        const elapsedMonths = Math.max(0, (today.getFullYear() - pDate.getFullYear()) * 12 + today.getMonth() - pDate.getMonth());
        const paidCount = Math.min(acq.installments, elapsedMonths);
        const remainingCount = acq.installments - paidCount;
        totalFinancingOutstanding += (remainingCount * acq.installmentValue);
      }
    });
    const patrimonioLiquido = totalFipe - totalFinancingOutstanding;

    // --- Financial Health Center ---
    const receitaContratada = contracts
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + (c.monthlyRate || 0), 0);
    const receitaFaturada = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const receitaRecebida = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const inadimplencia = payments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalMaintCosts = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0) +
      workOrders.filter(w => w.status === "completed").reduce((sum, w) => sum + (w.totalCost || 0), 0) +
      expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const lucroLiquido = receitaRecebida - totalMaintCosts;

    // --- Drivers Current Account ---
    const driverBalances: Record<string, number> = {};
    drivers.forEach(d => { driverBalances[d.id] = 0; });
    ledger.forEach(item => {
      if (driverBalances[item.driverId] !== undefined) {
        driverBalances[item.driverId] += (item.amount || 0);
      }
    });

    let driversPos = 0;
    let driversNeg = 0;
    let totalReceivables = 0;
    Object.values(driverBalances).forEach(bal => {
      if (bal > 0) driversPos++;
      if (bal < 0) {
        driversNeg++;
        totalReceivables += Math.abs(bal);
      }
    });

    // --- Costs Center Breakdown ---
    const costsBreakdown = {
      manutencao: maintenance.reduce((sum, m) => sum + (m.cost || 0), 0) + 
                  workOrders.filter(w => w.status === "completed").reduce((sum, w) => sum + (w.totalLaborCost || 0), 0),
      pecas: workOrders.filter(w => w.status === "completed").reduce((sum, w) => sum + (w.totalPartsCost || 0), 0),
      pneus: expenses.filter(e => e.expenseType === "pneus" || e.description.toLowerCase().includes("pneu")).reduce((sum, e) => sum + (e.amount || 0), 0),
      sinistros: claims.filter(c => c.status !== "closed").reduce((sum, c) => sum + (c.repairCost || 0), 0),
      multas: ledger.filter(l => l.type === "fine").reduce((sum, l) => sum + Math.abs(l.amount || 0), 0),
      administrativo: expenses.filter(e => e.expenseType === "administrative" || e.expenseType === "insurance").reduce((sum, e) => sum + (e.amount || 0), 0)
    };

    // --- Fleet Stats ---
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === "active").length;
    const maintenanceVehicles = vehicles.filter(v => v.status === "maintenance").length;
    const occupancyRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    // --- ROI & Cost/KM calculation per vehicle ---
    const vehicleStats = vehicles.map(v => {
      const acqInfo = acquisitions.find(a => a.vehicleId === v.id);
      const initialValue = acqInfo ? acqInfo.purchaseValue : 60000;
      const vehContracts = contracts.filter(c => c.vehicleId === v.id);
      const vehicleRevenue = vehContracts.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
      const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + (m.cost || 0), 0) +
        workOrders.filter(w => w.vehicleId === v.id && w.status === "completed").reduce((sum, w) => sum + (w.totalCost || 0), 0);
      const expCost = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalVehicleCost = maintCost + expCost;
      const roi = initialValue > 0 ? (vehicleRevenue / (initialValue + totalVehicleCost)) * 100 : 0;
      const costPerKm = v.mileage > 0 ? totalVehicleCost / v.mileage : 0;

      return {
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        revenue: vehicleRevenue,
        cost: totalVehicleCost,
        roi,
        costPerKm,
        mileage: v.mileage || 0
      };
    });

    const topRoiVehicles = [...vehicleStats].sort((a, b) => b.roi - a.roi).slice(0, 3);
    const worstRoiVehicles = [...vehicleStats].sort((a, b) => a.roi - b.roi).slice(0, 3);

    // --- Today's Attention Alerts ---
    const attentionAlerts: string[] = [];

    const contractsExpToday = contracts.filter(c => {
      if (c.status !== "active") return false;
      const expDate = new Date(c.endDate);
      return expDate.toDateString() === today.toDateString();
    });
    if (contractsExpToday.length > 0) {
      attentionAlerts.push(`${contractsExpToday.length} contrato(s) vencem hoje.`);
    }

    const cnhsExpiringSoon = drivers.filter(d => {
      if (d.status !== "active") return false;
      const expDate = new Date(d.cnhExpiration);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
    if (cnhsExpiringSoon.length > 0) {
      attentionAlerts.push(`${cnhsExpiringSoon.length} CNH(s) de motorista ativo vencem em até 7 dias.`);
    }

    const activeUninsured = vehicles.filter(v => {
      if (v.status !== "active") return false;
      const insExp = new Date(v.insuranceExpiration);
      return insExp < today;
    });
    if (activeUninsured.length > 0) {
      attentionAlerts.push(`${activeUninsured.length} veículo(s) ativo(s) rodando sem seguro válido.`);
    }

    const lowStockItems = inventory.filter(i => i.currentQty < i.minQty);
    if (lowStockItems.length > 0) {
      attentionAlerts.push(`${lowStockItems.length} item(ns) de estoque com quantidade crítica.`);
    }

    const activeClaimsCount = claims.filter(c => c.status !== "closed").length;
    if (activeClaimsCount > 0) {
      attentionAlerts.push(`${activeClaimsCount} sinistro(s) ativo(s) pendente(s) de regulagem/oficina.`);
    }

    const stalledWOs = workOrders.filter(w => {
      if (w.status !== "in_progress") return false;
      const created = new Date(w.createdAt);
      const diffTime = today.getTime() - created.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 15;
    });
    if (stalledWOs.length > 0) {
      attentionAlerts.push(`${stalledWOs.length} OS parada(s) em progresso há mais de 15 dias.`);
    }

    // --- Regulatory Engine KPIs ---
    const taxiProcesses = regulatoryProcesses.filter(p => p.operationType === "taxi");
    const activeAlvaras = taxiProcesses.filter(p => p.checklist?.permitIssued === true && p.status !== "decommissioned" && p.status !== "sold").length;
    
    const alvarasExpiring30 = regulatoryInspections.filter(i => {
      if (i.type !== "alvara") return false;
      const validUntil = new Date(i.validUntil);
      const diffTime = validUntil.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    const gnvExpiring60 = regulatoryInspections.filter(i => {
      if (i.type !== "gnv") return false;
      const validUntil = new Date(i.validUntil);
      const diffTime = validUntil.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60;
    }).length;

    const gnvCylinderExpiring60 = regulatoryProcesses.filter(p => {
      if (!p.gnvDetails?.hasGnv || !p.gnvDetails?.cylinderExpiry) return false;
      const expiry = new Date(p.gnvDetails.cylinderExpiry);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60;
    }).length;

    const totalGnvExpiring60 = gnvExpiring60 + gnvCylinderExpiring60;

    const irregularTaximeters = taximeterRegistries.filter(t => {
      if (!t.validUntil) return false;
      const validUntil = new Date(t.validUntil);
      return validUntil < today;
    }).length + regulatoryProcesses.filter(p => p.operationType === "taxi" && p.checklist?.taximeterInstalled && !p.checklist?.taximeterCalibrated).length;

    const blockedRegulatory = vehicles.filter(v => v.status === "blocked_regulatory").length;
    const nonLocatableActive = vehicles.filter(v => {
      if (v.status !== "active") return false;
      const process = regulatoryProcesses.find(rp => rp.vehicleId === v.id);
      if (!process) return false;
      
      const reg = municipalRegulations.find(r => r.city === process.city);
      const checklist = process.checklist;
      if (!checklist) return false;
      
      const needsTaximeter = process.operationType === "taxi" && (!reg || reg.requiresTaxiMeter);
      const needsDtp = process.operationType === "taxi" && (!reg || reg.requiresPermitInspection);
      
      if (!checklist.invoice || !checklist.crv || !checklist.renavam || !checklist.insuranceActive || !checklist.trackerInstalled) return true;
      if (needsTaximeter && (!checklist.taximeterInstalled || !checklist.taximeterCalibrated)) return true;
      if (process.operationType === "taxi" && !checklist.permitIssued) return true;
      if (needsDtp && !checklist.dtpInspectionApproved) return true;
      
      return false;
    }).length;

    const totalBlockedOrPending = blockedRegulatory + nonLocatableActive;
    const expiredCondutax = driverRegulatory.filter(dr => dr.status === "expired" || dr.status === "blocked_dtp").length;
    const criticalVehicles = complianceScores.filter(s => s.status === "critical").length;

    if (alvarasExpiring30 > 0) {
      attentionAlerts.push(`${alvarasExpiring30} alvará(s) de táxi vencendo nos próximos 30 dias.`);
    }
    if (totalGnvExpiring60 > 0) {
      attentionAlerts.push(`${totalGnvExpiring60} cilindro(s)/inspeção(ões) GNV vencendo nos próximos 60 dias.`);
    }
    if (irregularTaximeters > 0) {
      attentionAlerts.push(`${irregularTaximeters} taxímetro(s) irregular(es) ou sem aferição.`);
    }
    if (totalBlockedOrPending > 0) {
      attentionAlerts.push(`${totalBlockedOrPending} veículo(s) bloqueado(s) ou com pendências regulatórias.`);
    }
    if (expiredCondutax > 0) {
      attentionAlerts.push(`${expiredCondutax} motorista(s) com CONDUTAX vencido ou bloqueado DTP.`);
    }
    if (criticalVehicles > 0) {
      attentionAlerts.push(`${criticalVehicles} veículo(s) com score de compliance crítico (< 80 pt).`);
    }

    const openCashier = cashierSessions.find(s => s.status === "open");

    return {
      totalAcquisition,
      totalFipe,
      totalDepreciation,
      totalFinancingOutstanding,
      patrimonioLiquido,
      receitaContratada,
      receitaFaturada,
      receitaRecebida,
      inadimplencia,
      lucroLiquido,
      totalMaintCosts,
      driversPos,
      driversNeg,
      totalReceivables,
      costsBreakdown,
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      occupancyRate,
      topRoiVehicles,
      worstRoiVehicles,
      attentionAlerts,
      openCashier,
      activeAlvaras,
      alvarasExpiring30,
      gnvExpiring60: totalGnvExpiring60,
      irregularTaximeters,
      blockedRegulatory: totalBlockedOrPending,
      expiredCondutax,
      complianceExcellent: complianceScores.filter(s => s.score >= 95).length,
      complianceWarning: complianceScores.filter(s => s.score >= 80 && s.score <= 94).length,
      complianceCritical: complianceScores.filter(s => s.score < 80).length
    };
  }, [vehicles, drivers, contracts, payments, maintenance, expenses, acquisitions, claims, cashierSessions, inventory, workOrders, ledger, driverRegulatory, complianceScores]);

  // Grouped Alerts Memo
  const groupedAlerts = useMemo(() => {
    const today = new Date("2026-06-13");
    const docs: any[] = [];
    drivers.forEach(d => {
      const cnhExp = new Date(d.cnhExpiration);
      const diffCnh = Math.ceil((cnhExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffCnh <= 30) {
        docs.push({ id: `cnh-${d.id}`, title: `CNH vencendo em ${diffCnh} dias`, desc: `${d.name} • CNH expira em ${d.cnhExpiration}` });
      }
      
      const alvaraExp = new Date(d.alvaraExpiration);
      const diffAlv = Math.ceil((alvaraExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffAlv <= 30) {
        docs.push({ id: `alv-${d.id}`, title: `Alvará vencendo em ${diffAlv} dias`, desc: `${d.name} • Alvará expira em ${d.alvaraExpiration}` });
      }
    });

    vehicles.forEach(v => {
      const insExp = new Date(v.insuranceExpiration);
      const diffIns = Math.ceil((insExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffIns <= 30) {
        docs.push({ id: `ins-${v.id}`, title: `Seguro vencendo em ${diffIns} dias`, desc: `${v.brand} ${v.model} (${v.plate}) • Seguro expira em ${v.insuranceExpiration}` });
      }
    });

    regulatoryInspections.forEach(i => {
      const validUntil = new Date(i.validUntil);
      const diff = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const veh = vehicles.find(v => v.id === i.vehicleId);
      const label = i.type === "alvara" ? "Alvará" : i.type === "gnv" ? "Inspeção GNV" : i.type === "taximetro" ? "Aferição Taxímetro" : "Inspeção";
      if (diff <= 60) {
        docs.push({
          id: `reg-ins-${i.id}`,
          title: `${label} vencendo em ${diff} dias`,
          desc: `${veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo"} • Vencimento em ${i.validUntil}`
        });
      }
    });

    const maint: any[] = [];
    vehicles.forEach(v => {
      if (v.status === "maintenance") {
        maint.push({ id: `maint-status-${v.id}`, title: "Veículo em Manutenção", desc: `${v.brand} ${v.model} (${v.plate}) está na oficina.` });
      }
    });
    workOrders.filter(w => w.status === "in_progress").forEach(wo => {
      const veh = vehicles.find(v => v.id === wo.vehicleId);
      maint.push({ id: `wo-${wo.id}`, title: "OS em Progresso", desc: `${veh ? veh.model : 'Veículo'} (${veh ? veh.plate : ''}) • ${wo.description}` });
    });

    const fin: any[] = [];
    payments.filter(p => p.status === "overdue").forEach(p => {
      const drv = drivers.find(d => d.id === p.driverId);
      fin.push({
        id: `pay-${p.id}`,
        title: "Fatura em Atraso",
        desc: `${drv ? drv.name : 'Motorista'} • R$ ${p.amount} vencido em ${p.dueDate}`
      });
    });

    const est = inventory
      .filter(i => i.currentQty < i.minQty)
      .map(i => ({
        id: `inv-${i.id}`,
        title: "Estoque Baixo",
        desc: `${i.name} (${i.code}) • Qtd atual: ${i.currentQty} (Mínimo: ${i.minQty})`
      }));

    const cont = contracts
      .filter(c => {
        if (c.status !== "active") return false;
        const diff = Math.ceil((new Date(c.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff <= 30;
      })
      .map(c => {
        const drv = drivers.find(d => d.id === c.driverId);
        const veh = vehicles.find(v => v.id === c.vehicleId);
        const diff = Math.ceil((new Date(c.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: `cont-${c.id}`,
          title: `Contrato encerrando em ${diff} dias`,
          desc: `${drv ? drv.name : 'Motorista'} • ${veh ? veh.model : ''} (${veh ? veh.plate : ''})`
        };
      });

    return { docs, maint, fin, est, cont };
  }, [drivers, vehicles, payments, inventory, contracts, workOrders]);

  return {
    vehicles,
    drivers,
    contracts,
    payments,
    maintenance,
    expenses,
    acquisitions,
    claims,
    cashierSessions,
    cashierMovements,
    timeline,
    inventory,
    workOrders,
    ledger,
    regulatoryProcesses,
    regulatoryInspections,
    taximeterRegistries,
    municipalRegulations,
    loading,
    calculations,
    groupedAlerts
  };
}
