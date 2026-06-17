"use client";

export interface AccountsReceivable {
  id: string;
  driverId: string;
  contractId: string;
  dueDate: string;
  amount: number;
  titleType: "rent" | "claim_deductible" | "fine" | "adjustment";
  status: "open" | "paid" | "overdue" | "cancelled" | "partial";
  paidAmount: number;
  createdAt: string;
  /** ID da entidade de origem que gerou este título (ex: traffic_fine.id) */
  sourceId?: string;
  sourceType?: "traffic_fine" | "claim" | "manual";
}

export interface FinancialTransaction {
  id: string;
  arId: string; // linked title
  transactionNumber: string;
  source: "cashier" | "gateway" | "settlement";
  type: "driver_payment" | "billing_charge" | "reversal";
  amount: number;
  method: "pix" | "card" | "cash" | "transfer";
  status: "pending" | "approved" | "voided" | "failed";
  gateway: "mercado_pago" | "stripe" | "asaas" | "manual";
  externalId: string;
  reconciliationStatus: "pending" | "reconciled" | "discrepant";
  receiptHash: string;
  driverId: string;
  cashierSessionId: string;
  createdBy: string;
  createdAt: string;
  surplusDestination?: "credit" | "auto_fines" | "auto_all";
  partialTreatment?: "keep_partial" | "force_paid_debit";
  selectedArIds?: string[];
  balanceUsed?: number;
  cashAmount?: number;
  originalMethod?: string;
}

export interface FinancialAuditLog {
  id: string;
  transactionId?: string;
  adjustmentId?: string;
  action: "payment_confirmed" | "void_approved" | "adjustment_approved";
  oldStatus: string;
  newStatus: string;
  userId: string;
  ipAddress: string;
  device: string;
  createdAt: string;
}

export interface FinancialAdjustment {
  id: string;
  driverId: string;
  amount: number;
  reason: string;
  requestedBy: string;
  approvedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface PaymentPlan {
  id: string;
  driverId: string;
  arId: string;
  totalAmount: number;
  installmentsCount: number;
  monthlyAmount: number;
  status: "active" | "completed" | "defaulted";
}

export interface FinancialSettlement {
  id: string;
  driverId: string;
  originalDebt: number;
  settledAmount: number;
  installments: number;
  status: "negotiating" | "signed" | "settled";
  createdAt: string;
}

export interface DriverCreditScore {
  driverId: string;
  score: number; // 0 - 1000
  grade: "AAA" | "AA" | "A" | "B" | "C" | "D";
  arrearsDays: number;
  paymentComplianceRate: number;
  finesCount: number;
  lastUpdated: string;
}

export interface WithdrawalRequest {
  id: string;
  cashierId: string;
  amount: number;
  type: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  approvedBy: string;
  createdAt: string;
}

export interface CashierIncident {
  id: string;
  cashierId: string;
  type: "shortage" | "overage";
  amount: number;
  justification: string;
  approvedBy: string;
  createdAt: string;
}

export interface CashierSession {
  id: string;
  tenantId: string;
  openedBy: string;
  openedByName: string;
  closedBy?: string;
  closedByName?: string;
  closureType?: "normal" | "forced";
  closureReason?: string;
  authorizedClosureBy?: string;
  authorizedClosureName?: string;
  openedAt: string;
  closedAt: string | null;
  openingAmount: number;
  closingAmount: number;
  expectedBalance: number;
  difference: number;
  status: "open" | "closed";
}

export interface ComplianceOccurrence {
  id: string;
  tenantId: string;
  type: "procedure_not_executed" | "document_expired" | "safety_violation" | "financial_irregularity";
  category: "cashier" | "claims" | "checklist" | "maintenance" | "documentation" | "payment" | "regulatory";
  severity: "low" | "medium" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "dismissed";
  employeeId: string;
  employeeName: string;
  closedById?: string;
  closedByName?: string;
  authorizedById?: string;
  authorizedByName?: string;
  occurrencesCount: number;
  occurrencesLast90Days: number;
  description: string;
  procedureExpected: string;
  procedureExecuted: string;
  sessionId?: string;
  driverId?: string;
  contractId?: string;
  vehicleId?: string;
  resolution?: string;
  warningIssued: boolean;
  warningDate?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DriverFinancialProfile {
  driverId: string;
  tenantId: string;
  score: number;
  grade: "AAA" | "AA" | "A" | "B" | "C" | "D";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  currentBalance: number;
  overdueDays: number;
  overdueAmount: number;
  openDiarias: number;
  openFines: number;
  openDeductibles: number;
  paymentComplianceRate: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number;
  activeInstallments: number;
  activeNegotiations: number;
  blocked: boolean;
  blockedReason?: string;
  suggestedAction: "receive_full" | "offer_installment" | "negotiate" | "block" | "none";
  suggestedInstallmentCount?: number;
  suggestedInstallmentValue?: number;
  lastCalculated: string;
  nextReviewDate: string;
}
