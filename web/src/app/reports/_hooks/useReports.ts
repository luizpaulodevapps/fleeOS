"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { OverviewMetrics, ExpirationAlert, CategoryPerformance, MaintenanceTypeBreakdown } from "../_lib/types";

export function useReports() {
  const { getCollection, can } = useAuth();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Filter and search states
  const [alertSearchTerm, setAlertSearchTerm] = useState("");
  const [alertTypeFilter, setAlertTypeFilter] = useState("all");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vehList, drvList, conList, payList, maintList, claimsList, catList] = await Promise.all([
        getCollection("vehicles"),
        getCollection("drivers"),
        getCollection("contracts"),
        getCollection("payments"),
        getCollection("maintenance"),
        getCollection("claims"),
        getCollection("pricing_categories")
      ]);
      setVehicles(vehList || []);
      setDrivers(drvList || []);
      setContracts(conList || []);
      setPayments(payList || []);
      setMaintenance(maintList || []);
      setClaims(claimsList || []);
      setCategories(catList || []);
    } catch (e) {
      console.error("Erro ao carregar relatórios", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Expiration Calculations
  const today = useMemo(() => new Date(), []);
  
  const getDaysDiff = useCallback((dateStr: string) => {
    if (!dateStr) return 999;
    const diffTime = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [today]);

  // 1. Overview Dashboard Metrics
  const overviewMetrics = useMemo((): OverviewMetrics => {
    const totalVehicles = vehicles.length;
    const activeContractsCount = contracts.filter(c => c.status === "active").length;
    const utilizationRate = totalVehicles > 0 ? (activeContractsCount / totalVehicles) * 100 : 0;

    const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalMaintCost = maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const netProfit = totalRevenue - totalMaintCost;

    const totalMileage = vehicles.reduce((sum, v) => sum + Number(v.mileage || 0), 0);
    const averageMileage = totalVehicles > 0 ? totalMileage / totalVehicles : 0;
    const totalDriversCount = drivers.length;
    const activeClaimsCount = claims.filter(c => c.status !== "closed").length;

    return {
      totalVehicles,
      activeContractsCount,
      utilizationRate,
      totalRevenue,
      totalPending,
      totalMaintCost,
      netProfit,
      averageMileage,
      totalDriversCount,
      activeClaimsCount
    };
  }, [vehicles, contracts, payments, maintenance, drivers, claims]);

  // 2. Chronological Expiration Alerts
  const allAlerts = useMemo((): ExpirationAlert[] => {
    // 1. CNH Expirations
    const cnh = drivers.map(d => ({
      name: d.name,
      type: "CNH" as const,
      date: d.cnhExpiration,
      days: getDaysDiff(d.cnhExpiration),
      referenceId: d.id
    })).filter(a => a.days <= 30);

    // 2. Insurance Expirations
    const insurance = vehicles.map(v => ({
      name: `${v.brand} ${v.model} (${v.plate})`,
      type: "Seguro" as const,
      date: v.insuranceExpiration,
      days: getDaysDiff(v.insuranceExpiration),
      referenceId: v.id
    })).filter(a => a.days <= 30);

    // 3. Registration Expirations
    const reg = vehicles.map(v => ({
      name: `${v.brand} ${v.model} (${v.plate})`,
      type: "Licenciamento" as const,
      date: v.registrationExpiration,
      days: getDaysDiff(v.registrationExpiration),
      referenceId: v.id
    })).filter(a => a.days <= 30);

    return [...cnh, ...insurance, ...reg].sort((a, b) => a.days - b.days);
  }, [drivers, vehicles, getDaysDiff]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      const matchSearch = alert.name.toLowerCase().includes(alertSearchTerm.toLowerCase());
      const matchType = alertTypeFilter === "all" || alert.type === alertTypeFilter;
      return matchSearch && matchType;
    });
  }, [allAlerts, alertSearchTerm, alertTypeFilter]);

  // 3. Categories ROI Performance
  const categoryPerformance = useMemo((): CategoryPerformance[] => {
    return categories.map(cat => {
      const catVehicles = vehicles.filter(v => v.pricingCategoryId === cat.id);
      const totalVeh = catVehicles.length;

      // Active vehicles (having active contract)
      const activeVeh = catVehicles.filter(v => 
        contracts.some(c => c.status === "active" && c.vehicleId === v.id)
      ).length;

      const utilRate = totalVeh > 0 ? (activeVeh / totalVeh) * 100 : 0;

      // Projected / Actual Monthly Revenue
      // Multiply active contract daily rate * 30
      const monthlyRev = contracts
        .filter(c => c.status === "active" && catVehicles.some(v => v.id === c.vehicleId))
        .reduce((sum, c) => sum + (Number(c.dailyRate || 150) * 30), 0);

      // Maintenance costs for these vehicles
      const maintCost = maintenance
        .filter(m => catVehicles.some(v => v.id === m.vehicleId))
        .reduce((sum, m) => sum + Number(m.cost || 0), 0);

      const roi = monthlyRev - maintCost;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalVehicles: totalVeh,
        activeVehicles: activeVeh,
        utilizationRate: utilRate,
        monthlyRevenue: monthlyRev,
        maintenanceCost: maintCost,
        roi
      };
    });
  }, [categories, vehicles, contracts, maintenance]);

  // 4. Maintenance breakdown
  const maintenanceBreakdown = useMemo((): MaintenanceTypeBreakdown => {
    let preventiveCount = 0;
    let preventiveCost = 0;
    let correctiveCount = 0;
    let correctiveCost = 0;
    let sinisterCount = 0;
    let sinisterCost = 0;

    maintenance.forEach(m => {
      const cost = Number(m.cost || 0);
      const type = (m.type || "").toLowerCase();

      if (type.includes("preventiva")) {
        preventiveCount++;
        preventiveCost += cost;
      } else if (type.includes("corretiva")) {
        correctiveCount++;
        correctiveCost += cost;
      } else {
        // Crash / Sinister / Leve / Grave
        sinisterCount++;
        sinisterCost += cost;
      }
    });

    return {
      preventiveCount,
      preventiveCost,
      correctiveCount,
      correctiveCost,
      sinisterCount,
      sinisterCost
    };
  }, [maintenance]);

  // 5. Vehicles list filtering for Operational
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const text = `${v.brand} ${v.model} ${v.plate}`.toLowerCase();
      const matchSearch = text.includes(vehicleSearchTerm.toLowerCase());
      const matchStatus = vehicleStatusFilter === "all" || v.status === vehicleStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, vehicleSearchTerm, vehicleStatusFilter]);

  return {
    loading,
    activeTab,
    setActiveTab,
    can,
    loadData,
    
    // Calculated stats
    overviewMetrics,
    allAlerts,
    filteredAlerts,
    categoryPerformance,
    maintenanceBreakdown,
    filteredVehicles,

    // Filters inputs
    alertSearchTerm,
    setAlertSearchTerm,
    alertTypeFilter,
    setAlertTypeFilter,
    vehicleSearchTerm,
    setVehicleSearchTerm,
    vehicleStatusFilter,
    setVehicleStatusFilter
  };
}
