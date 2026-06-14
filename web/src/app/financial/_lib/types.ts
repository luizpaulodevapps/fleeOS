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
