"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  AccountsReceivable,
  FinancialTransaction,
  FinancialAuditLog,
  FinancialAdjustment,
  PaymentPlan,
  FinancialSettlement,
  DriverCreditScore,
  WithdrawalRequest,
  CashierIncident
} from "../_lib/types";

export function useFinancialHub() {
  const { currentUser, getCollection, addDocument, updateDocument } = useAuth();

  // Core Data lists
  const [sessions, setSessions] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Financial Hub sub-collections
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);
  const [adjustments, setAdjustments] = useState<FinancialAdjustment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [settlements, setSettlements] = useState<FinancialSettlement[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [incidents, setIncidents] = useState<CashierIncident[]>([]);

  // Page States
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        sessList,
        movList,
        drvList,
        conList,
        ledList,
        arList,
        txList,
        logList,
        adjList,
        planList,
        setList,
        wdrList,
        incList,
        vehList
      ] = await Promise.all([
        getCollection("cashier_sessions"),
        getCollection("cashier_movements"),
        getCollection("drivers"),
        getCollection("contracts"),
        getCollection("driver_ledger"),
        getCollection("accounts_receivable"),
        getCollection("financial_transactions"),
        getCollection("financial_audit_logs"),
        getCollection("financial_adjustments"),
        getCollection("payment_plans"),
        getCollection("financial_settlements"),
        getCollection("cashier_withdrawal_requests"),
        getCollection("cashier_incidents"),
        getCollection("vehicles")
      ]);

      setSessions(sessList || []);
      setMovements(movList || []);
      setDrivers(drvList || []);
      setContracts(conList || []);
      setLedger(ledList || []);
      setVehicles(vehList || []);

      setReceivables(arList || []);
      setTransactions(txList || []);
      setAuditLogs(logList || []);
      setAdjustments(adjList || []);
      setPaymentPlans(planList || []);
      setSettlements(setList || []);
      setWithdrawalRequests(wdrList || []);
      setIncidents(incList || []);

      // Find active cashier session
      const openSession = (sessList || []).find((s: any) => s.status === "open");
      setActiveSession(openSession || null);

    } catch (e) {
      console.error("Erro ao carregar dados do Financial Hub", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncDailyRentals = async () => {
    try {
      if (!currentUser) return;
      const today = new Date().toISOString().split("T")[0];
      const activeContracts = contracts.filter((contract: any) => {
        const statusActive = contract.status === "active" || contract.status === "Ativo";
        const started = !contract.startDate || contract.startDate <= today;
        const notEnded = !contract.endDate || contract.endDate >= today;
        return statusActive && started && notEnded;
      });

      if (activeContracts.length === 0) {
        return;
      }

      const newArPromises = activeContracts.reduce((acc: Promise<any>[], contract: any) => {
        if (!contract.driverId || !contract.id) return acc;
        const existing = receivables.find((ar) =>
          ar.contractId === contract.id &&
          ar.dueDate === today &&
          ar.titleType === "rent" &&
          ar.status !== "cancelled"
        );
        if (existing) return acc;

        const amount = Number(contract.dailyRate ?? contract.dailyAmountSnapshot ?? 0);
        if (amount <= 0) return acc;

        acc.push(addDocument("accounts_receivable", {
          driverId: contract.driverId,
          contractId: contract.id,
          dueDate: today,
          amount,
          titleType: "rent",
          status: "open",
          paidAmount: 0
        }));
        return acc;
      }, [] as Promise<any>[]);

      if (newArPromises.length === 0) {
        return;
      }

      await Promise.all(newArPromises);
      console.log(`syncDailyRentals: ${newArPromises.length} título(s) de diária gerado(s) para ${today}`);
      await loadData();
    } catch (e) {
      console.error("Erro ao sincronizar diárias", e);
    }
  };

  useEffect(() => {
    if (!loading) {
      syncDailyRentals();
    }
  }, [loading]);

  // Pseudo-SHA-256 hash generator for digital signatures
  const generateReceiptHash = (tx: Partial<FinancialTransaction>) => {
    const rawString = `${tx.driverId}-${tx.amount}-${tx.createdAt}-${tx.transactionNumber}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return "SHA256-" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0") + "FE9A";
  };

  // 1. Operational Turno Actions
  const openCashier = async (openingAmount: number) => {
    try {
      const newSession = await addDocument("cashier_sessions", {
        operatorId: currentUser?.displayName || "Operador",
        openedAt: new Date().toISOString(),
        closedAt: null,
        openingAmount,
        closingAmount: 0,
        difference: 0,
        status: "open"
      });
      await loadData();
      return newSession;
    } catch (e) {
      console.error(e);
    }
  };

  const closeCashier = async (sessionId: string, physicalCount: number, expectedBalance: number, justification: string) => {
    try {
      const difference = physicalCount - expectedBalance;
      await updateDocument("cashier_sessions", sessionId, {
        closedAt: new Date().toISOString(),
        closingAmount: physicalCount,
        difference,
        status: "closed"
      });

      // Record shortage/overage incidents if discrepancy exists
      if (difference !== 0) {
        await addDocument("cashier_incidents", {
          cashierId: sessionId,
          type: difference < 0 ? "shortage" : "overage",
          amount: Math.abs(difference),
          justification: justification || "Diferença detectada na contagem física do turno.",
          approvedBy: currentUser?.displayName || "Sistema",
          createdAt: new Date().toISOString()
        });
      }

      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Accounts Receivable & Transactions workflow
  const createAR = async (driverId: string, contractId: string, amount: number, type: AccountsReceivable["titleType"], dueDate: string) => {
    try {
      const newAr = await addDocument("accounts_receivable", {
        driverId,
        contractId,
        dueDate,
        amount,
        titleType: type,
        status: "open",
        paidAmount: 0,
        createdAt: new Date().toISOString()
      });
      await loadData();
      return newAr;
    } catch (e) {
      console.error(e);
    }
  };

  const submitTransaction = async (
    arId: string, 
    driverId: string, 
    amount: number, 
    method: FinancialTransaction["method"], 
    gateway: FinancialTransaction["gateway"],
    surplusDestination?: "credit" | "auto_fines" | "auto_all",
    partialTreatment?: "keep_partial" | "force_paid_debit",
    selectedArIds?: string[]
  ) => {
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const txNum = `TX-2026-${String(transactions.length + 1).padStart(4, "0")}-${randomSuffix}`;
      
      const txPayload = {
        arId,
        transactionNumber: txNum,
        source: "cashier" as const,
        type: "driver_payment" as const,
        amount,
        method,
        status: "pending" as const,
        gateway,
        externalId: gateway !== "manual" ? `ext_${Math.random().toString(36).substring(2, 9)}` : "",
        reconciliationStatus: "pending" as const,
        receiptHash: "",
        driverId,
        cashierSessionId: activeSession?.id || "manual-session",
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString(),
        surplusDestination,
        partialTreatment,
        selectedArIds
      };

      const newTx = await addDocument("financial_transactions", txPayload);
      
      await addDocument("financial_audit_logs", {
        transactionId: newTx.id,
        action: "payment_initiated",
        oldStatus: "none",
        newStatus: "pending",
        userId: currentUser?.displayName || "Sistema",
        ipAddress: "127.0.0.1",
        device: "Web Browser Console",
        createdAt: new Date().toISOString()
      });

      await loadData();
      return newTx;
    } catch (e) {
      console.error(e);
    }
  };

  const webhookApproveTransaction = async (txId: string, transactionOverride?: FinancialTransaction) => {
    try {
      const tx = transactionOverride || transactions.find(t => t.id === txId);
      if (!tx) return;

      const hash = generateReceiptHash(tx);

      // 1. Update transaction
      await updateDocument("financial_transactions", txId, {
        status: "approved",
        receiptHash: hash
      });

      // 2. Settle Accounts Receivable
      let remaining = tx.amount;
      const ledgerAdjustments: any[] = [];

      if (tx.arId) {
        if (tx.selectedArIds?.length || tx.arId === "auto_rent" || tx.arId === "auto_all") {
          const selectedIds = new Set(tx.selectedArIds || []);
          const openArs = receivables
            .filter(r => r.driverId === tx.driverId && r.status !== "paid" && r.status !== "cancelled")
            .filter(r => selectedIds.size > 0 ? selectedIds.has(r.id) : tx.arId === "auto_all" || r.titleType === "rent")
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

          for (const ar of openArs) {
            if (remaining <= 0) break;
            const arRemaining = ar.amount - (ar.paidAmount || 0);
            
            // If daily fee (rent) and we have less than the due amount, check partial treatment
            if (ar.titleType === "rent" && remaining < arRemaining && tx.partialTreatment === "force_paid_debit") {
              const unpaidDiff = arRemaining - remaining;
              await updateDocument("accounts_receivable", ar.id, {
                paidAmount: ar.amount,
                status: "paid"
              });
              ledgerAdjustments.push({
                driverId: tx.driverId,
                type: "charge",
                amount: -unpaidDiff,
                description: `Baixa Forçada de Diária - Diária #${ar.id.substring(0, 8).toUpperCase()}`
              });
              remaining = 0;
            } else {
              const toPay = Math.min(remaining, arRemaining);
              const newPaid = (ar.paidAmount || 0) + toPay;
              await updateDocument("accounts_receivable", ar.id, {
                paidAmount: newPaid,
                status: newPaid >= ar.amount ? "paid" : "partial"
              });
              remaining -= toPay;
            }
          }
        } else {
          const ar = receivables.find(r => r.id === tx.arId);
          if (ar) {
            const arRemaining = ar.amount - (ar.paidAmount || 0);
            if (ar.titleType === "rent" && remaining < arRemaining && tx.partialTreatment === "force_paid_debit") {
              const unpaidDiff = arRemaining - remaining;
              await updateDocument("accounts_receivable", ar.id, {
                paidAmount: ar.amount,
                status: "paid"
              });
              ledgerAdjustments.push({
                driverId: tx.driverId,
                type: "charge",
                amount: -unpaidDiff,
                description: `Baixa Forçada de Diária - Diária #${ar.id.substring(0, 8).toUpperCase()}`
              });
              remaining = 0;
            } else {
              const toPay = Math.min(remaining, arRemaining);
              const newPaid = Number(ar.paidAmount || 0) + toPay;
              await updateDocument("accounts_receivable", ar.id, {
                paidAmount: newPaid,
                status: newPaid >= ar.amount ? "paid" : "partial"
              });
              remaining -= toPay;
            }
          }
        }

        // Apply remaining surplus to other debts if requested
        if (remaining > 0) {
          const surplusDest = tx.surplusDestination || "credit";
          if (surplusDest === "auto_fines" || surplusDest === "auto_all") {
            const extraArs = receivables
              .filter(r => r.driverId === tx.driverId && r.status !== "paid" && r.status !== "cancelled")
              .filter(r => {
                if (surplusDest === "auto_fines") return r.titleType === "fine";
                return true; // auto_all: anything left
              })
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

            for (const ar of extraArs) {
              if (remaining <= 0) break;
              const arRemaining = ar.amount - (ar.paidAmount || 0);
              const toPay = Math.min(remaining, arRemaining);
              const newPaid = (ar.paidAmount || 0) + toPay;
              await updateDocument("accounts_receivable", ar.id, {
                paidAmount: newPaid,
                status: newPaid >= ar.amount ? "paid" : "partial"
              });
              remaining -= toPay;
            }
          }
        }
      }

      // 3. Post to cashier movements
      await addDocument("cashier_movements", {
        cashierId: tx.cashierSessionId,
        type: "RECEIPT",
        amount: tx.amount,
        paymentMethod: tx.method === "pix" ? "Pix" : tx.method === "card" ? "Cartão" : tx.method === "cash" ? "Dinheiro" : "Transferência",
        description: `Recebimento Título - Tx: ${tx.transactionNumber}`,
      });

      // 4. Post to driver ledger
      await addDocument("driver_ledger", {
        driverId: tx.driverId,
        type: "payment",
        amount: tx.amount,
        description: `Recebimento Caixa Gateway (${tx.gateway.toUpperCase()})`,
      });

      for (const adj of ledgerAdjustments) {
        await addDocument("driver_ledger", adj);
      }

      // 5. Add Audit log
      await addDocument("financial_audit_logs", {
        transactionId: txId,
        action: "payment_confirmed",
        oldStatus: "pending",
        newStatus: "approved",
        userId: "Gateway Webhook Listener",
        ipAddress: "18.230.12.98",
        device: "Server Hook Gateway",
        createdAt: new Date().toISOString()
      });

      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const createPaymentPlan = async (driverId: string, arIds: string[], totalAmount: number, entryAmount: number, installmentsCount: number) => {
    const financedAmount = Math.max(0, totalAmount - entryAmount);
    const plan = await addDocument("payment_plans", {
      driverId,
      arId: arIds.join(","),
      arIds,
      totalAmount,
      entryAmount,
      installmentsCount,
      monthlyAmount: installmentsCount > 0 ? financedAmount / installmentsCount : 0,
      status: "active",
      createdAt: new Date().toISOString()
    });
    await addDocument("financial_settlements", {
      driverId,
      originalDebt: totalAmount,
      settledAmount: totalAmount,
      entryAmount,
      installments: installmentsCount,
      status: "signed",
      createdAt: new Date().toISOString()
    });
    await loadData();
    return plan;
  };

  const voidTransaction = async (txId: string, reason: string, approvedBy: string) => {
    try {
      const tx = transactions.find(t => t.id === txId);
      if (!tx) return;

      // 1. Update transaction
      await updateDocument("financial_transactions", txId, {
        status: "voided"
      });

      // 2. Revert Accounts Receivable status
      if (tx.arId) {
        const ar = receivables.find(r => r.id === tx.arId);
        if (ar) {
          const newPaid = Math.max(0, Number(ar.paidAmount || 0) - tx.amount);
          await updateDocument("accounts_receivable", ar.id, {
            paidAmount: newPaid,
            status: newPaid === 0 ? "open" : "partial"
          });
        }
      }

      // 3. Revert Ledger
      await addDocument("driver_ledger", {
        driverId: tx.driverId,
        type: "reversal",
        amount: -tx.amount,
        description: `Estorno de Lançamento - Tx: ${tx.transactionNumber}`,
      });

      // 4. Revert Cashier movement
      await addDocument("cashier_movements", {
        cashierId: tx.cashierSessionId,
        type: "WITHDRAWAL",
        amount: tx.amount,
        paymentMethod: "Ajuste",
        description: `Estorno Lançamento - Tx: ${tx.transactionNumber}`,
      });

      // 5. Add Audit log
      await addDocument("financial_audit_logs", {
        transactionId: txId,
        action: "void_approved",
        oldStatus: "approved",
        newStatus: "voided",
        userId: currentUser?.displayName || "Sistema",
        ipAddress: "127.0.0.1",
        device: `Reversão autorizada por ${approvedBy}. Motivo: ${reason}`,
        createdAt: new Date().toISOString()
      });

      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Financial Adjustments under Dual-Authorization
  const requestAdjustment = async (driverId: string, amount: number, reason: string) => {
    try {
      const newAdj = await addDocument("financial_adjustments", {
        driverId,
        amount,
        reason,
        requestedBy: currentUser?.displayName || "Operador",
        approvedBy: "",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      await loadData();
      return newAdj;
    } catch (e) {
      console.error(e);
    }
  };

  const approveAdjustment = async (adjId: string, approvedBy: string) => {
    try {
      const adj = adjustments.find(a => a.id === adjId);
      if (!adj) return;

      // 1. Update status
      await updateDocument("financial_adjustments", adjId, {
        status: "approved",
        approvedBy
      });

      // 2. Apply Ledger post
      await addDocument("driver_ledger", {
        driverId: adj.driverId,
        type: "adjustment",
        amount: adj.amount,
        description: `Ajuste Financeiro Autorizado (${adj.reason})`,
      });

      // 3. Log Audit
      await addDocument("financial_audit_logs", {
        adjustmentId: adjId,
        action: "adjustment_approved",
        oldStatus: "pending",
        newStatus: "approved",
        userId: approvedBy,
        ipAddress: "127.0.0.1",
        device: `Ajuste de R$ ${adj.amount} aprovado por diretoria.`,
        createdAt: new Date().toISOString()
      });

      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Cash Withdrawals (Sangrias) under Dual-Authorization
  const requestWithdrawal = async (amount: number, type: string, description: string) => {
    try {
      const newWdr = await addDocument("cashier_withdrawal_requests", {
        cashierId: activeSession?.id || "manual-session",
        amount,
        type,
        description,
        status: "pending",
        requestedBy: currentUser?.displayName || "Operador",
        approvedBy: "",
        createdAt: new Date().toISOString()
      });
      await loadData();
      return newWdr;
    } catch (e) {
      console.error(e);
    }
  };

  const approveWithdrawal = async (wdrId: string, approvedBy: string) => {
    try {
      const wdr = withdrawalRequests.find(w => w.id === wdrId);
      if (!wdr) return;

      // 1. Update status
      await updateDocument("cashier_withdrawal_requests", wdrId, {
        status: "approved",
        approvedBy
      });

      // 2. Post cashier movement
      await addDocument("cashier_movements", {
        cashierId: wdr.cashierId,
        type: wdr.type,
        amount: wdr.amount,
        paymentMethod: "Dinheiro",
        description: `Sangria Aprovada - Autorizado por ${approvedBy} (${wdr.description})`
      });

      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Driver Credit Score calculation
  const getDriverCreditScore = useCallback((driverId: string): DriverCreditScore => {
    const defaultScore: DriverCreditScore = {
      driverId,
      score: 600,
      grade: "A",
      arrearsDays: 0,
      paymentComplianceRate: 100,
      finesCount: 0,
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    if (!driverId) return defaultScore;

    // Filter payments & claims
    const driverLedger = ledger.filter(l => l.driverId === driverId);
    const driverAr = receivables.filter(r => r.driverId === driverId);

    const openArCount = driverAr.filter(r => r.status === "open" || r.status === "overdue").length;
    
    // Fines / Claims counts
    const claimsCount = driverLedger.filter(l => l.type === "claim").length;
    const finesCount = driverLedger.filter(l => l.type === "fine").length;

    // Compliance rate
    const totalCharged = Math.abs(driverLedger.filter(l => l.amount < 0).reduce((sum, l) => sum + Number(l.amount || 0), 0));
    const totalPaid = Math.abs(driverLedger.filter(l => l.amount > 0).reduce((sum, l) => sum + Number(l.amount || 0), 0));
    const complianceRate = totalCharged > 0 ? Math.min(100, Math.round((totalPaid / totalCharged) * 100)) : 100;

    // Numerical score rating algorithm (0 - 1000)
    let score = 750; // default base score
    score -= openArCount * 45;
    score -= claimsCount * 80;
    score -= finesCount * 30;
    score += Math.round((complianceRate - 80) * 5); // reward above 80% compliance, penalize below
    score = Math.max(100, Math.min(1000, score));

    let grade: DriverCreditScore["grade"] = "B";
    if (score >= 900) grade = "AAA";
    else if (score >= 800) grade = "AA";
    else if (score >= 650) grade = "A";
    else if (score >= 500) grade = "B";
    else if (score >= 350) grade = "C";
    else grade = "D";

    return {
      driverId,
      score,
      grade,
      arrearsDays: openArCount * 7, // simulated arrears days
      paymentComplianceRate: complianceRate,
      finesCount,
      lastUpdated: new Date().toISOString().split("T")[0]
    };
  }, [ledger, receivables]);

  return {
    sessions,
    movements,
    drivers,
    contracts,
    ledger,
    receivables,
    transactions,
    auditLogs,
    adjustments,
    paymentPlans,
    settlements,
    withdrawalRequests,
    incidents,
    vehicles,
    loading,
    activeSession,

    // Operations
    openCashier,
    closeCashier,
    createAR,
    submitTransaction,
    webhookApproveTransaction,
    createPaymentPlan,
    voidTransaction,
    requestAdjustment,
    approveAdjustment,
    requestWithdrawal,
    approveWithdrawal,
    getDriverCreditScore,
    reload: loadData
  };
}
