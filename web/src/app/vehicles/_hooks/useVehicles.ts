"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { SpecsFormState, AcquisitionFormState, AssetFormState, IncidentFormState, MaintFormState, DocFormState, VehicleRegulatoryProcess, RegulatoryInspection, TaximeterRegistry, MunicipalRegulation } from "../_lib/types";

export function useVehicles() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument, can } = useAuth();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [maintenancePlan, setMaintenancePlan] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [vehicleExpenses, setVehicleExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Compliance Engine states
  const [regulatoryProcesses, setRegulatoryProcesses] = useState<VehicleRegulatoryProcess[]>([]);
  const [regulatoryInspections, setRegulatoryInspections] = useState<RegulatoryInspection[]>([]);
  const [taximeterRegistries, setTaximeterRegistries] = useState<TaximeterRegistry[]>([]);
  const [municipalRegulations, setMunicipalRegulations] = useState<MunicipalRegulation[]>([]);

  // Workshop Integration states
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehiclePlans, setVehiclePlans] = useState<any[]>([]);


  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Prontuário Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("specs");

  // Dossier Mode State (Print View)
  const [isDossierMode, setIsDossierMode] = useState(false);
  const [dossierVehicle, setDossierVehicle] = useState<any | null>(null);

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverIdForAssign, setSelectedDriverIdForAssign] = useState("");

  // Form State - Specs
  const [formData, setFormData] = useState<SpecsFormState>({
    plate: "",
    model: "",
    brand: "",
    year: new Date().getFullYear(),
    renavam: "",
    chassis: "",
    color: "Cinza",
    fuelType: "Flex",
    mileage: 0,
    insuranceExpiration: "",
    registrationExpiration: "",
    status: "active",
    photoUrl: "",
    family: "",
    pricingCategoryId: "",
    maintenanceGroup: "",
    fipe: {
      code: "",
      value: 0,
      referenceMonth: ""
    },
    lastFipeUpdate: ""
  });

  // Locks Form State
  const [vehicleLocks, setVehicleLocks] = useState<string[]>([]);
  const [lockJustification, setLockJustification] = useState<Record<string, string>>({});

  // Acquisition Form State
  const [acqForm, setAcqForm] = useState<AcquisitionFormState>({
    acquisitionType: "Compra à Vista",
    purchaseDate: "",
    purchaseValue: "",
    fipeAtPurchase: "",
    seller: "",
    invoiceNumber: "",
    bankName: "",
    contractNumber: "",
    financedAmount: "",
    downPayment: "",
    installments: "",
    installmentValue: "",
    interestRate: "",
    startDate: "",
    leasingCompany: "",
    leasingMonths: "",
    leasingMonthlyValue: "",
    leasingBuyOption: "",
    ownerName: "",
    ownerDocument: "",
    comodatoContract: "",
    comodatoMonths: "",
    monthlyRepasse: "",
    currentFipeValue: "",
    fipeConsultDate: "",
    annualInsuranceCost: "",
    annualIpvaCost: "",
    admissionMileage: "",
    notes: "",
    annualLicensingCost: "",
    annualInspectionCost: "",
    ipvaExpirationDate: "",
    licensingExpirationDate: "",
    inspectionExpirationDate: "",
    ipvaPaidStatus: "pending",
    licensingPaidStatus: "pending",
    inspectionPaidStatus: "pending",
    isTaxi: false,
    alvaraNumber: "",
    alvaraExpirationDate: "",
    alvaraRenewalCost: "",
    municipalInspectionStatus: "pending",
    taximeterCost: "",
    rooftopLightCost: "",
    initialInspectionCost: "",
    paintOrDecalCost: "",
    municipalRegistrationCost: "",
    otherInitialCosts: ""
  });

  // Equipment Form State
  const [assetForm, setAssetForm] = useState<AssetFormState>({
    assetType: "Taxímetro",
    serialNumber: "",
    installDate: new Date().toISOString().split("T")[0],
    status: "active"
  });

  // Avarias Form State
  const [incidentForm, setIncidentForm] = useState<IncidentFormState>({
    driverId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    severity: "Leve",
    repairCost: "",
    photoUrl: ""
  });

  // Oficina Form State
  const [maintForm, setMaintForm] = useState<MaintFormState>({
    type: "Preventiva",
    description: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    mileage: "",
    nextMaintenanceMileage: ""
  });

  // Document Upload Form State
  const [docForm, setDocForm] = useState<DocFormState>({
    fileName: "",
    fileUrl: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        vehList, attList, asgList, drvList, assetList, incList, maintList, 
        planList, chkList, timelineList, acqList, conList, payList, 
        ledList, expList, catList, regProcessesList, regInspectionsList, 
        taximeterRegList, woList, appList, vehiclePlansList
      ] = await Promise.all([
        getCollection("vehicles"),
        getCollection("attachments"),
        getCollection("vehicle_assignments"),
        getCollection("drivers"),
        getCollection("vehicle_assets"),
        getCollection("vehicle_incidents"),
        getCollection("maintenance"),
        getCollection("maintenance_plan_items"),
        getCollection("checklists"),
        getCollection("activity_timeline"),
        getCollection("vehicle_acquisition"),
        getCollection("contracts"),
        getCollection("payments"),
        getCollection("driver_ledger"),
        getCollection("vehicle_expenses"),
        getCollection("pricing_categories"),
        getCollection("vehicle_regulatory_process"),
        getCollection("regulatory_inspections"),
        getCollection("taximeter_registry"),
        getCollection("work_orders"),
        getCollection("maintenance_appointments"),
        getCollection("vehicle_maintenance_plans")
      ]);
      setVehicles(vehList);
      setAttachments(attList);
      setAssignments(asgList);
      setDrivers(drvList);
      setAssets(assetList);
      setIncidents(incList);
      setMaintenances(maintList);
      setMaintenancePlan(planList);
      setChecklists(chkList);
      setTimeline(timelineList);
      setAcquisitions(acqList);
      setContracts(conList);
      setPayments(payList);
      setLedger(ledList);
      setVehicleExpenses(expList);
      setCategories(catList);
      setRegulatoryProcesses(regProcessesList || []);
      setRegulatoryInspections(regInspectionsList || []);
      setTaximeterRegistries(taximeterRegList || []);
      setWorkOrders(woList || []);
      setAppointments(appList || []);
      setVehiclePlans(vehiclePlansList || []);

      // Seed municipal regulations if not exists
      let munRegs = await getCollection("municipal_regulations");
      if (!munRegs || munRegs.length === 0) {
        const defaultMunicipalRegulations = [
          { city: "São Paulo", requiresTaxiMeter: true, requiresPermitInspection: true, requiresGnvInspection: true },
          { city: "Campinas", requiresTaxiMeter: true, requiresPermitInspection: false, requiresGnvInspection: true },
          { city: "Rio de Janeiro", requiresTaxiMeter: true, requiresPermitInspection: true, requiresGnvInspection: true },
          { city: "Belo Horizonte", requiresTaxiMeter: true, requiresPermitInspection: false, requiresGnvInspection: false }
        ];
        for (const r of defaultMunicipalRegulations) {
          await addDocument("municipal_regulations", r);
        }
        munRegs = await getCollection("municipal_regulations");
      }
      setMunicipalRegulations(munRegs || []);
    } catch (e) {
      console.error("Erro ao carregar prontuários de veículos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- COMPUTE VEHICLE FINANCIAL PERFORMANCE ---
  const computePerformance = (vehicleId: string) => {
    const vehAssignments = assignments.filter(a => a.vehicleId === vehicleId);
    const driverIds = [...new Set(vehAssignments.map(a => a.driverId))];

    const activeContract = contracts.find(c =>
      vehAssignments.some(a => a.active && a.contractId === c.id)
    ) || contracts.find(c => driverIds.includes(c.driverId) && (c.status === "active" || c.status === "Ativo"));

    const vehPayments = payments.filter(p => driverIds.includes(p.driverId));
    const totalRevenue = vehPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const vehExpenses = vehicleExpenses.filter(e => e.vehicleId === vehicleId);

    const totalMaintCost = vehExpenses
      .filter(e => e.expenseType === "maintenance")
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalIncidentCost = vehExpenses
      .filter(e => e.expenseType === "incident" || e.expenseType === "claim" || e.expenseType === "sinistro")
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalOtherCost = vehExpenses
      .filter(e => e.expenseType !== "maintenance" && e.expenseType !== "incident" && e.expenseType !== "claim" && e.expenseType !== "sinistro")
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalExpenses = totalMaintCost + totalIncidentCost + totalOtherCost;

    const acq = acquisitions.find(a => a.vehicleId === vehicleId);
    const annualInsurance = Number(acq?.annualInsuranceCost || 0);
    const annualIpva = Number(acq?.annualIpvaCost || 0);
    const purchaseDate = acq?.purchaseDate ? new Date(acq.purchaseDate) : null;
    const monthsOwned = purchaseDate
      ? Math.max(1, Math.round((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 12;
    const fixedCosts = ((annualInsurance + annualIpva) / 12) * monthsOwned;

    const paidInstallments = acq?.installments && acq?.installmentValue
      ? Math.min(monthsOwned, Number(acq.installments)) * Number(acq.installmentValue)
      : 0;

    const totalCost = totalExpenses + fixedCosts + paidInstallments;
    const profit = totalRevenue - totalCost;

    const purchaseValue = Number(acq?.purchaseValue || 0);
    const currentFipe = Number(acq?.currentFipeValue || 0);
    const roi = purchaseValue > 0 ? (profit / purchaseValue) * 100 : 0;
    const fipeVariation = purchaseValue > 0 && currentFipe > 0 ? ((currentFipe - purchaseValue) / purchaseValue) * 100 : 0;
    const totalResult = profit + (currentFipe - purchaseValue);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    const admissionMileage = Number(acq?.admissionMileage || 0);
    const kmRodado = Math.max(0, (vehicle?.mileage || 0) - admissionMileage);
    const costPerKm = kmRodado > 0 ? totalCost / kmRodado : 0;
    const revenuePerKm = kmRodado > 0 ? totalRevenue / kmRodado : 0;

    const activeDays = vehAssignments.reduce((acc, a) => {
      const start = new Date(a.startDate).getTime();
      const end = a.endDate ? new Date(a.endDate).getTime() : Date.now();
      return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    }, 0);
    const totalDays = purchaseDate ? (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24) : 365;
    const occupationRate = totalDays > 0 ? Math.min(100, (activeDays / totalDays) * 100) : 0;

    const revenueMonthly = monthsOwned > 0 ? totalRevenue / monthsOwned : 0;
    const costMonthly = monthsOwned > 0 ? totalCost / monthsOwned : 0;
    const paybackMonths = revenueMonthly - costMonthly > 0 ? purchaseValue / (revenueMonthly - costMonthly) : null;

    const totalInstallments = Number(acq?.installments || 0);
    const remainingInstallments = Math.max(0, totalInstallments - monthsOwned);
    const remainingDebt = remainingInstallments * Number(acq?.installmentValue || 0);

    return {
      acq, totalRevenue, totalCost, profit, roi, fipeVariation, totalResult, costPerKm, revenuePerKm,
      occupationRate, kmRodado, paybackMonths, monthsOwned, remainingDebt, remainingInstallments,
      totalMaintCost, totalIncidentCost, fixedCosts, paidInstallments,
      revenueMonthly, costMonthly, activeContract
    };
  };

  const isReadOnly = (vehicle: any) => {
    if (!vehicle) return false;
    return vehicle.status === "baixado" || vehicle.status === "vendido";
  };

  const openNewVehicle = () => {
    setSelectedVehicle(null);
    setActiveTab("specs");
    setFormData({
      plate: "",
      model: "",
      brand: "",
      year: new Date().getFullYear(),
      renavam: "",
      chassis: "",
      color: "Cinza",
      fuelType: "Flex",
      mileage: 0,
      insuranceExpiration: "",
      registrationExpiration: "",
      status: "active",
      photoUrl: "https://images.unsplash.com/photo-1625217527288-93919c996509?w=300",
      family: "",
      pricingCategoryId: "",
      maintenanceGroup: "",
      maintenancePlanId: "",
      fipe: {
        code: "",
        value: 0,
        referenceMonth: ""
      },
      lastFipeUpdate: ""
    });
    setVehicleLocks([]);
    setLockJustification({});
    setIsModalOpen(true);
  };

  const openVehicleProntuario = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setActiveTab("specs");
    const activeVp = vehiclePlans.find((vp) => vp.vehicleId === vehicle.id);
    setFormData({
      plate: vehicle.plate || "",
      model: vehicle.model || "",
      brand: vehicle.brand || "",
      year: vehicle.year || new Date().getFullYear(),
      renavam: vehicle.renavam || "",
      chassis: vehicle.chassis || "",
      color: vehicle.color || "Cinza",
      fuelType: vehicle.fuelType || "Flex",
      mileage: vehicle.mileage || 0,
      insuranceExpiration: vehicle.insuranceExpiration || "",
      registrationExpiration: vehicle.registrationExpiration || "",
      status: vehicle.status || "active",
      photoUrl: vehicle.photoUrl || "https://images.unsplash.com/photo-1625217527288-93919c996509?w=300",
      family: vehicle.family || "",
      pricingCategoryId: vehicle.pricingCategoryId || "",
      maintenanceGroup: vehicle.maintenanceGroup || "",
      maintenancePlanId: activeVp?.planId || vehicle.maintenancePlanId || "",
      fipe: vehicle.fipe || {
        code: "",
        value: 0,
        referenceMonth: ""
      },
      lastFipeUpdate: vehicle.lastFipeUpdate || ""
    });
    setVehicleLocks(vehicle.activeLocks || []);
    setLockJustification(vehicle.lockJustification || {});

    const acq = acquisitions.find(a => a.vehicleId === vehicle.id);
    if (acq) {
      setAcqForm({
        acquisitionType: acq.acquisitionType || "Compra à Vista",
        purchaseDate: acq.purchaseDate || "",
        purchaseValue: acq.purchaseValue?.toString() || "",
        fipeAtPurchase: acq.fipeAtPurchase?.toString() || "",
        seller: acq.seller || "",
        invoiceNumber: acq.invoiceNumber || "",
        bankName: acq.bankName || "",
        contractNumber: acq.contractNumber || "",
        financedAmount: acq.financedAmount?.toString() || "",
        downPayment: acq.downPayment?.toString() || "",
        installments: acq.installments?.toString() || "",
        installmentValue: acq.installmentValue?.toString() || "",
        interestRate: acq.interestRate?.toString() || "",
        startDate: acq.startDate || "",
        leasingCompany: acq.leasingCompany || "",
        leasingMonths: acq.leasingMonths?.toString() || "",
        leasingMonthlyValue: acq.leasingMonthlyValue?.toString() || "",
        leasingBuyOption: acq.leasingBuyOption?.toString() || "",
        ownerName: acq.ownerName || "",
        ownerDocument: acq.ownerDocument || "",
        comodatoContract: acq.comodatoContract || "",
        comodatoMonths: acq.comodatoMonths?.toString() || "",
        monthlyRepasse: acq.monthlyRepasse?.toString() || "",
        currentFipeValue: acq.currentFipeValue?.toString() || "",
        fipeConsultDate: acq.fipeConsultDate || "",
        annualInsuranceCost: acq.annualInsuranceCost?.toString() || "",
        annualIpvaCost: acq.annualIpvaCost?.toString() || "",
        admissionMileage: acq.admissionMileage?.toString() || "",
        notes: acq.notes || "",
        annualLicensingCost: acq.annualLicensingCost?.toString() || "",
        annualInspectionCost: acq.annualInspectionCost?.toString() || "",
        ipvaExpirationDate: acq.ipvaExpirationDate || "",
        licensingExpirationDate: acq.licensingExpirationDate || "",
        inspectionExpirationDate: acq.inspectionExpirationDate || "",
        ipvaPaidStatus: acq.ipvaPaidStatus || "pending",
        licensingPaidStatus: acq.licensingPaidStatus || "pending",
        inspectionPaidStatus: acq.inspectionPaidStatus || "pending",
        isTaxi: !!acq.isTaxi,
        alvaraNumber: acq.alvaraNumber || "",
        alvaraExpirationDate: acq.alvaraExpirationDate || "",
        alvaraRenewalCost: acq.alvaraRenewalCost?.toString() || "",
        municipalInspectionStatus: acq.municipalInspectionStatus || "pending",
        taximeterCost: acq.taximeterCost?.toString() || "",
        rooftopLightCost: acq.rooftopLightCost?.toString() || "",
        initialInspectionCost: acq.initialInspectionCost?.toString() || "",
        paintOrDecalCost: acq.paintOrDecalCost?.toString() || "",
        municipalRegistrationCost: acq.municipalRegistrationCost?.toString() || "",
        otherInitialCosts: acq.otherInitialCosts?.toString() || ""
      });
    } else {
      setAcqForm({
        acquisitionType: "Compra à Vista",
        purchaseDate: "",
        purchaseValue: "",
        fipeAtPurchase: "",
        seller: "",
        invoiceNumber: "",
        bankName: "",
        contractNumber: "",
        financedAmount: "",
        downPayment: "",
        installments: "",
        installmentValue: "",
        interestRate: "",
        startDate: "",
        leasingCompany: "",
        leasingMonths: "",
        leasingMonthlyValue: "",
        leasingBuyOption: "",
        ownerName: "",
        ownerDocument: "",
        comodatoContract: "",
        comodatoMonths: "",
        monthlyRepasse: "",
        currentFipeValue: "",
        fipeConsultDate: "",
        annualInsuranceCost: "",
        annualIpvaCost: "",
        admissionMileage: "",
        notes: "",
        annualLicensingCost: "",
        annualInspectionCost: "",
        ipvaExpirationDate: "",
        licensingExpirationDate: "",
        inspectionExpirationDate: "",
        ipvaPaidStatus: "pending",
        licensingPaidStatus: "pending",
        inspectionPaidStatus: "pending",
        isTaxi: false,
        alvaraNumber: "",
        alvaraExpirationDate: "",
        alvaraRenewalCost: "",
        municipalInspectionStatus: "pending",
        taximeterCost: "",
        rooftopLightCost: "",
        initialInspectionCost: "",
        paintOrDecalCost: "",
        municipalRegistrationCost: "",
        otherInitialCosts: ""
      });
    }

    if (drivers.length > 0) {
      setIncidentForm(prev => ({ ...prev, driverId: drivers[0].id }));
    }

    setIsModalOpen(true);
  };

  const handleSaveAcquisition = async () => {
    if (!selectedVehicle) return;
    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        acquisitionType: acqForm.acquisitionType,
        purchaseDate: acqForm.purchaseDate,
        purchaseValue: Number(acqForm.purchaseValue) || 0,
        fipeAtPurchase: Number(acqForm.fipeAtPurchase) || 0,
        seller: acqForm.seller,
        invoiceNumber: acqForm.invoiceNumber,
        bankName: acqForm.bankName,
        contractNumber: acqForm.contractNumber,
        financedAmount: Number(acqForm.financedAmount) || 0,
        downPayment: Number(acqForm.downPayment) || 0,
        installments: Number(acqForm.installments) || 0,
        installmentValue: Number(acqForm.installmentValue) || 0,
        interestRate: Number(acqForm.interestRate) || 0,
        startDate: acqForm.startDate,
        leasingCompany: acqForm.leasingCompany,
        leasingMonths: Number(acqForm.leasingMonths) || 0,
        leasingMonthlyValue: Number(acqForm.leasingMonthlyValue) || 0,
        leasingBuyOption: Number(acqForm.leasingBuyOption) || 0,
        ownerName: acqForm.ownerName,
        ownerDocument: acqForm.ownerDocument,
        comodatoContract: acqForm.comodatoContract,
        comodatoMonths: Number(acqForm.comodatoMonths) || 0,
        monthlyRepasse: Number(acqForm.monthlyRepasse) || 0,
        currentFipeValue: Number(acqForm.currentFipeValue) || 0,
        fipeConsultDate: acqForm.fipeConsultDate,
        annualInsuranceCost: Number(acqForm.annualInsuranceCost) || 0,
        annualIpvaCost: Number(acqForm.annualIpvaCost) || 0,
        admissionMileage: Number(acqForm.admissionMileage) || 0,
        notes: acqForm.notes,
        annualLicensingCost: Number(acqForm.annualLicensingCost) || 0,
        annualInspectionCost: Number(acqForm.annualInspectionCost) || 0,
        ipvaExpirationDate: acqForm.ipvaExpirationDate || "",
        licensingExpirationDate: acqForm.licensingExpirationDate || "",
        inspectionExpirationDate: acqForm.inspectionExpirationDate || "",
        ipvaPaidStatus: acqForm.ipvaPaidStatus || "pending",
        licensingPaidStatus: acqForm.licensingPaidStatus || "pending",
        inspectionPaidStatus: acqForm.inspectionPaidStatus || "pending",
        isTaxi: !!acqForm.isTaxi,
        alvaraNumber: acqForm.alvaraNumber || "",
        alvaraExpirationDate: acqForm.alvaraExpirationDate || "",
        alvaraRenewalCost: Number(acqForm.alvaraRenewalCost) || 0,
        municipalInspectionStatus: acqForm.municipalInspectionStatus || "pending",
        taximeterCost: Number(acqForm.taximeterCost) || 0,
        rooftopLightCost: Number(acqForm.rooftopLightCost) || 0,
        initialInspectionCost: Number(acqForm.initialInspectionCost) || 0,
        paintOrDecalCost: Number(acqForm.paintOrDecalCost) || 0,
        municipalRegistrationCost: Number(acqForm.municipalRegistrationCost) || 0,
        otherInitialCosts: Number(acqForm.otherInitialCosts) || 0
      };

      const existing = acquisitions.find(a => a.vehicleId === selectedVehicle.id);
      if (existing) {
        await updateDocument("vehicle_acquisition", existing.id, payload);
      } else {
        await addDocument("vehicle_acquisition", payload);
      }

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "acquisition_update",
        title: "Dados Patrimoniais Atualizados",
        description: `Origem: ${acqForm.acquisitionType}. Valor: R$ ${acqForm.purchaseValue}.`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operador"
      });

      loadData();
      alert("Dados patrimoniais salvos com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicle && isReadOnly(selectedVehicle)) return;

    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        mileage: Number(formData.mileage)
      };

      if (selectedVehicle) {
        await updateDocument("vehicles", selectedVehicle.id, payload);

        // Sync vehicle maintenance plan
        const plans = await getCollection("vehicle_maintenance_plans");
        const existing = plans?.find((vp: any) => vp.vehicleId === selectedVehicle.id);
        if (formData.maintenancePlanId) {
          if (existing) {
            await updateDocument("vehicle_maintenance_plans", existing.id, {
              ...existing,
              planId: formData.maintenancePlanId,
              assignedAt: new Date().toISOString(),
              notes: "Sincronizado via Ficha Técnica"
            });
          } else {
            await addDocument("vehicle_maintenance_plans", {
              vehicleId: selectedVehicle.id,
              planId: formData.maintenancePlanId,
              assignedAt: new Date().toISOString(),
              notes: "Criado via Ficha Técnica"
            });
          }
        } else if (existing) {
          await deleteDocument("vehicle_maintenance_plans", existing.id);
        }

        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: selectedVehicle.id,
          eventType: "update_specs",
          title: "Especificações Atualizadas",
          description: `Os dados técnicos do veículo placa ${formData.plate} foram alterados.`,
          metadata: payload,
          createdBy: currentUser?.displayName || "Operador"
        });
      } else {
        const newVeh = await addDocument("vehicles", {
          ...payload,
          activeLocks: [],
          lockJustification: {}
        });

        // Save plan for new vehicle if chosen
        if (formData.maintenancePlanId) {
          await addDocument("vehicle_maintenance_plans", {
            vehicleId: newVeh.id,
            planId: formData.maintenancePlanId,
            assignedAt: new Date().toISOString(),
            notes: "Criado via Ficha Técnica"
          });
        }

        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: newVeh.id,
          eventType: "admission",
          title: "Veículo Integrado à Frota",
          description: `Veículo placa ${formData.plate} foi cadastrado e prontuário operacional inicializado.`,
          metadata: payload,
          createdBy: currentUser?.displayName || "Operador"
        });
      }

      setIsModalOpen(false);
      loadData();
      alert("Cadastro de veículo salvo!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLocks = async () => {
    if (!selectedVehicle) return;
    if (isReadOnly(selectedVehicle)) return;

    try {
      const hasActiveLocks = vehicleLocks.length > 0;
      let status = selectedVehicle.status;
      if (vehicleLocks.includes("Manutenção")) status = "maintenance";
      else if (vehicleLocks.includes("Sinistro")) status = "sinistrado";
      else if (vehicleLocks.includes("Apreensão")) status = "inactive";

      await updateDocument("vehicles", selectedVehicle.id, {
        activeLocks: vehicleLocks,
        lockJustification: lockJustification,
        status: status
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "lock_change",
        title: hasActiveLocks ? "Bloqueio do Ativo Aplicado" : "Restrições de Veículo Removidas",
        description: hasActiveLocks
          ? `Veículo restringido por: ${vehicleLocks.join(", ")}. Motivo: ${JSON.stringify(lockJustification)}`
          : "Todas as restrições foram revogadas. Veículo livre para operar.",
        metadata: { locks: vehicleLocks },
        createdBy: currentUser?.displayName || "Operador"
      });

      loadData();
      setIsModalOpen(false);
      alert("Bloqueios operacionais do veículo atualizados!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (isReadOnly(selectedVehicle)) return;

    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        assetType: assetForm.assetType,
        serialNumber: assetForm.serialNumber,
        installDate: assetForm.installDate,
        status: assetForm.status
      };

      await addDocument("vehicle_assets", payload);
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "asset_installed",
        title: `Acessório Instalado: ${assetForm.assetType}`,
        description: `Equipamento número de série ${assetForm.serialNumber} instalado fisicamente.`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Oficina"
      });

      setAssetForm({
        assetType: "Taxímetro",
        serialNumber: "",
        installDate: new Date().toISOString().split("T")[0],
        status: "active"
      });
      loadData();
      alert("Equipamento cadastrado com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (isReadOnly(selectedVehicle)) return;

    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        driverId: incidentForm.driverId,
        date: incidentForm.date,
        description: incidentForm.description,
        severity: incidentForm.severity,
        repairCost: Number(incidentForm.repairCost || 0),
        photoUrl: incidentForm.photoUrl || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=300"
      };

      await addDocument("vehicle_incidents", payload);
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "incident",
        title: `Sinistro/Avaria: Gravidade ${incidentForm.severity}`,
        description: `Ocorrência: ${incidentForm.description}. Custo Estimado: R$ ${payload.repairCost}`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operações"
      });

      setIncidentForm({
        driverId: drivers[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        severity: "Leve",
        repairCost: "",
        photoUrl: ""
      });
      loadData();
      alert("Avaria registrada no prontuário!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (isReadOnly(selectedVehicle)) return;

    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        type: maintForm.type,
        description: maintForm.description,
        cost: Number(maintForm.cost || 0),
        date: maintForm.date,
        mileage: Number(maintForm.mileage || selectedVehicle.mileage),
        nextMaintenanceMileage: Number(maintForm.nextMaintenanceMileage || (selectedVehicle.mileage + 10000))
      };

      await addDocument("maintenance", payload);
      await updateDocument("vehicles", selectedVehicle.id, {
        mileage: Math.max(selectedVehicle.mileage, payload.mileage)
      });
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "maintenance",
        title: `Manutenção ${maintForm.type} Executada`,
        description: `${maintForm.description} na oficina. Custo: R$ ${payload.cost}`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Oficina"
      });

      setMaintForm({
        type: "Preventiva",
        description: "",
        cost: "",
        date: new Date().toISOString().split("T")[0],
        mileage: "",
        nextMaintenanceMileage: ""
      });
      loadData();
      alert("Ordem de serviço de manutenção registrada!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (isReadOnly(selectedVehicle)) return;

    try {
      await addDocument("attachments", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        fileName: docForm.fileName || "CRLV_Documento.pdf",
        fileUrl: docForm.fileUrl || "https://example.com/doc.pdf",
        uploadedBy: currentUser?.displayName || "Dono da Frota"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: selectedVehicle.id,
        eventType: "document_upload",
        title: "Anexo Digital do Veículo",
        description: `Arquivo '${docForm.fileName}' indexado no prontuário digital do carro.`,
        metadata: { fileName: docForm.fileName },
        createdBy: currentUser?.displayName || "Sistema"
      });

      setDocForm({ fileName: "", fileUrl: "" });
      loadData();
      alert("Documento do veículo anexado!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      const prevAsgs = assignments.filter(a => a.vehicleId === selectedVehicle.id && a.active === true);
      for (const asg of prevAsgs) {
        await updateDocument("vehicle_assignments", asg.id, {
          active: false,
          endDate: new Date().toISOString(),
          status: "completed"
        });
      }

      if (selectedDriverIdForAssign) {
        await addDocument("vehicle_assignments", {
          vehicleId: selectedVehicle.id,
          driverId: selectedDriverIdForAssign,
          startDate: new Date().toISOString(),
          endDate: null,
          active: true,
          status: "active"
        });

        await updateDocument("vehicles", selectedVehicle.id, { status: "locado" });
        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: selectedVehicle.id,
          eventType: "assignment",
          title: "Vínculo de Motorista Atribuído",
          description: `Veículo associado ao motorista ${getDriverName(selectedDriverIdForAssign)} via painel rápido.`,
          metadata: { driverId: selectedDriverIdForAssign },
          createdBy: currentUser?.displayName || "Operações"
        });
      } else {
        await updateDocument("vehicles", selectedVehicle.id, { status: "active" });
      }

      setIsAssignModalOpen(false);
      setIsModalOpen(false);
      loadData();
      alert("Vínculo operacional atualizado!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRegulatoryProcess = async (vehicleId: string, payload: any) => {
    try {
      const existing = regulatoryProcesses.find(rp => rp.vehicleId === vehicleId);
      if (existing && existing.id) {
        await updateDocument("vehicle_regulatory_process", existing.id, payload);
      } else {
        await addDocument("vehicle_regulatory_process", { vehicleId, ...payload });
      }
      // Sync vehicle status
      if (payload.status) {
        await updateDocument("vehicles", vehicleId, { status: payload.status });
      }
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "regulatory_update",
        title: "Processo Regulatório Atualizado",
        description: `Status regulatório definido para: ${payload.status || 'N/A'}. Cidade: ${payload.city || 'N/A'}.`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operador"
      });
      loadData();
    } catch (e) {
      console.error("Erro ao salvar processo regulatório", e);
    }
  };

  const handleSaveTaximeterRegistry = async (vehicleId: string, payload: any) => {
    try {
      const existing = taximeterRegistries.find(t => t.vehicleId === vehicleId);
      if (existing && existing.id) {
        await updateDocument("taximeter_registry", existing.id, payload);
      } else {
        await addDocument("taximeter_registry", { vehicleId, ...payload });
      }
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "taximeter_update",
        title: "Registro de Taxímetro Atualizado",
        description: `Taxímetro série ${payload.serialNumber} aferido/atualizado. Validade: ${payload.validUntil}`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operador"
      });
      loadData();
    } catch (e) {
      console.error("Erro ao salvar registro de taxímetro", e);
    }
  };

  const handleSaveRegulatoryInspection = async (vehicleId: string, payload: any) => {
    try {
      await addDocument("regulatory_inspections", { vehicleId, ...payload });
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "inspection_created",
        title: `Vistoria de ${payload.type} Registrada`,
        description: `Vistoria realizada em ${payload.lastInspectionDate}. Validade: ${payload.validUntil}.`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operador"
      });
      loadData();
    } catch (e) {
      console.error("Erro ao salvar vistoria regulatória", e);
    }
  };

  const handleDeleteRegulatoryInspection = async (id: string) => {
    try {
      await deleteDocument("regulatory_inspections", id);
      loadData();
    } catch (e) {
      console.error("Erro ao excluir vistoria regulatória", e);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("⚠️ ATENÇÃO: Deseja realmente excluir este veículo?")) {
      try {
        await deleteDocument("vehicles", id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleScheduleWorkshopAppointment = async (
    vehicleId: string,
    title: string,
    date: string,
    time: string,
    notes: string,
    type: string = "Preventiva"
  ) => {
    try {
      const newApp = {
        vehicleId,
        title,
        scheduledDate: date,
        scheduledTime: time,
        type,
        notes,
        status: "Agendado",
        workshopId: "uid-workshop",
        createdAt: new Date().toISOString()
      };

      await addDocument("maintenance_appointments", newApp);
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "maintenance_scheduled",
        title: `Visita Oficina Agendada`,
        description: `Agendado para ${date} às ${time}: ${title}`,
        metadata: newApp,
        createdBy: currentUser?.displayName || "Dono da Frota"
      });
      await loadData();
    } catch (e) {
      console.error("Erro ao agendar visita à oficina", e);
      throw e;
    }
  };

  const handleCreateWorkshopOS = async (
    vehicleId: string,
    description: string,
    mileage: number
  ) => {
    try {
      const woId = `wo-${Math.random().toString(36).substring(2, 11)}`;
      const newWo = {
        id: woId,
        vehicleId,
        description,
        status: "Aberta",
        mileage,
        totalPartsCost: 0,
        totalLaborCost: 0,
        totalCost: 0,
        workshopId: "uid-workshop",
        operatorId: currentUser?.uid || "uid-super",
        createdAt: new Date().toISOString()
      };

      await addDocument("work_orders", newWo);
      
      // Update vehicle status to maintenance
      await updateDocument("vehicles", vehicleId, {
        status: "maintenance"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "maintenance_os_open",
        title: `OS Oficina Aberta`,
        description: `Ordem de Serviço OS-${woId.substring(0, 5).toUpperCase()} aberta: ${description}`,
        metadata: newWo,
        createdBy: currentUser?.displayName || "Dono da Frota"
      });
      await loadData();
    } catch (e) {
      console.error("Erro ao abrir OS", e);
      throw e;
    }
  };

  const handleCancelAppointment = async (appId: string, vehicleId: string) => {
    try {
      await updateDocument("maintenance_appointments", appId, { status: "Cancelado" });
      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "maintenance_cancelled",
        title: `Agendamento Cancelado`,
        description: `Agendamento cancelado pelo gestor`,
        metadata: { appId },
        createdBy: currentUser?.displayName || "Dono da Frota"
      });
      await loadData();
    } catch (e) {
      console.error("Erro ao cancelar agendamento", e);
      throw e;
    }
  };

  const handleStartOSFromAppointment = async (app: any) => {
    try {
      const woId = `wo-${Math.random().toString(36).substring(2, 11)}`;
      const newWo = {
        id: woId,
        vehicleId: app.vehicleId,
        description: `Agendamento: ${app.title}`,
        status: "Aberta",
        mileage: 0,
        totalPartsCost: 0,
        totalLaborCost: 0,
        totalCost: 0,
        workshopId: app.workshopId || "uid-workshop",
        operatorId: currentUser?.uid || "uid-super",
        createdAt: new Date().toISOString()
      };

      await addDocument("work_orders", newWo);
      await updateDocument("maintenance_appointments", app.id, { status: "Realizado" });
      
      // Update vehicle status to maintenance
      await updateDocument("vehicles", app.vehicleId, {
        status: "maintenance"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: app.vehicleId,
        eventType: "maintenance_os_open",
        title: `OS Oficina Aberta`,
        description: `Ordem de Serviço OS-${woId.substring(0, 5).toUpperCase()} iniciada do agendamento`,
        metadata: newWo,
        createdBy: currentUser?.displayName || "Dono da Frota"
      });
      await loadData();
    } catch (e) {
      console.error("Erro ao iniciar OS a partir do agendamento", e);
      throw e;
    }
  };

  const handleCompleteWorkshopOS = async (
    woId: string,
    vehicleId: string,
    mileage: number,
    cost: number,
    description: string,
    planItemId?: string
  ) => {
    try {
      // 1. Update OS Document
      const wo = workOrders.find(w => w.id === woId);
      const updatedWo = {
        ...wo,
        status: "completed",
        mileage,
        totalCost: cost,
        completedAt: new Date().toISOString()
      };
      await updateDocument("work_orders", woId, updatedWo);

      // 2. Add legacy maintenance log
      await addDocument("maintenance", {
        vehicleId,
        type: "Preventiva",
        description: `OS-${woId.substring(0, 5).toUpperCase()}: ${description}`,
        cost,
        date: new Date().toISOString().split("T")[0],
        mileage,
        nextMaintenanceMileage: mileage + 10000
      });

      // 3. Add vehicle expense
      await addDocument("vehicle_expenses", {
        vehicleId,
        expenseType: "maintenance",
        amount: cost,
        date: new Date().toISOString().split("T")[0],
        referenceId: woId,
        referenceType: "work_order",
        description: `OS-${woId.substring(0, 5).toUpperCase()}: ${description}`,
        createdAt: new Date().toISOString()
      });

      // 4. Update vehicle status to active and set odometer
      const veh = vehicles.find(v => v.id === vehicleId);
      if (veh) {
        await updateDocument("vehicles", vehicleId, {
          mileage: Math.max(veh.mileage || 0, mileage),
          status: "active"
        });
      }

      // 5. Update plan item if linked
      if (planItemId) {
        const item = maintenancePlan.find(p => p.id === planItemId);
        if (item) {
          await updateDocument("maintenance_plan_items", planItemId, {
            lastServiceKm: mileage,
            nextServiceKm: mileage + Number(item.intervalKm || 10000)
          });
        }
      }

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicleId,
        eventType: "maintenance_completed",
        title: `OS Oficina Concluída`,
        description: `OS-${woId.substring(0, 5).toUpperCase()} finalizada. Custo: R$ ${cost}.`,
        metadata: updatedWo,
        createdBy: currentUser?.displayName || "Dono da Frota"
      });

      await loadData();
    } catch (e) {
      console.error("Erro ao concluir OS", e);
      throw e;
    }
  };

  const getDriverName = (driverId: string) => {
    const drv = drivers.find(d => d.id === driverId);
    return drv ? drv.name : `Motorista (${driverId.substring(0, 6)})`;
  };

  const getActiveDriver = (vehicleId: string) => {
    const asg = assignments.find(a => a.active && a.vehicleId === vehicleId);
    return asg ? getDriverName(asg.driverId) : null;
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  return {
    // DB collections
    vehicles,
    attachments,
    assignments,
    drivers,
    assets,
    incidents,
    maintenances,
    maintenancePlan,
    checklists,
    timeline,
    acquisitions,
    contracts,
    payments,
    ledger,
    vehicleExpenses,
    categories,
    regulatoryProcesses,
    regulatoryInspections,
    taximeterRegistries,
    municipalRegulations,
    workOrders,
    appointments,
    
    // Status/UI
    searchTerm,
    setSearchTerm,
    loading,
    can,

    // Modals
    isModalOpen,
    setIsModalOpen,
    selectedVehicle,
    setSelectedVehicle,
    activeTab,
    setActiveTab,
    isDossierMode,
    setIsDossierMode,
    dossierVehicle,
    setDossierVehicle,
    isAssignModalOpen,
    setIsAssignModalOpen,
    selectedDriverIdForAssign,
    setSelectedDriverIdForAssign,

    // Form fields
    formData,
    setFormData,
    vehicleLocks,
    setVehicleLocks,
    lockJustification,
    setLockJustification,
    acqForm,
    setAcqForm,
    assetForm,
    setAssetForm,
    incidentForm,
    setIncidentForm,
    maintForm,
    setMaintForm,
    docForm,
    setDocForm,

    // Handlers
    loadData,
    computePerformance,
    isReadOnly,
    openNewVehicle,
    openVehicleProntuario,
    handleSaveAcquisition,
    handleSaveSpecs,
    handleSaveLocks,
    handleAddAsset,
    handleAddIncident,
    handleAddMaintenance,
    handleUploadDoc,
    handleAssignDriver,
    handleDeleteVehicle,
    getDriverName,
    getActiveDriver,
    filteredVehicles,
    handleSaveRegulatoryProcess,
    handleSaveTaximeterRegistry,
    handleSaveRegulatoryInspection,
    handleDeleteRegulatoryInspection,
    handleScheduleWorkshopAppointment,
    handleCreateWorkshopOS,
    handleCancelAppointment,
    handleStartOSFromAppointment,
    handleCompleteWorkshopOS
  };
}
