"use client";

import { useMemo } from "react";
import { Claim } from "../_lib/types";

interface UseDriverRiskProps {
  driverId: string;
  claims: Claim[];
  allDamageItems: any[];
  allBudgets: any[];
  fines?: any[]; // optional additional inputs
  ledger?: any[];
}

export function useDriverRisk({
  driverId,
  claims,
  allDamageItems,
  allBudgets,
  fines = [],
  ledger = []
}: UseDriverRiskProps) {
  return useMemo(() => {
    if (!driverId) {
      return {
        riskLevel: "Desconhecido",
        score: 0,
        claimsCount: 0,
        totalDamageCost: 0,
        finesCount: 0,
        recoveryComplianceRate: 100,
        description: "Motorista não selecionado para análise de risco."
      };
    }

    // Filter data for this driver
    const driverClaims = claims.filter((c) => c.driverId === driverId);
    const claimsCount = driverClaims.length;

    // Calculate total damage costs associated with this driver's claims
    let totalDamageCost = 0;
    driverClaims.forEach((c) => {
      const claimBudgets = allBudgets.filter((b: any) => b.claimId === c.id);
      const approvedBudget = claimBudgets.find((b: any) => b.status === "approved");
      if (approvedBudget) {
        totalDamageCost += approvedBudget.amount;
      } else {
        const claimDamages = allDamageItems.filter((d: any) => d.claimId === c.id);
        if (claimDamages.length > 0) {
          totalDamageCost += claimDamages.reduce((sum, d) => sum + d.estimatedCost, 0);
        } else {
          totalDamageCost += c.severity === "total_loss" ? 45000 : c.severity === "severe" ? 8000 : c.severity === "medium" ? 2500 : 1000;
        }
      }
    });

    // Fines for this driver
    const driverFines = fines.filter((f: any) => f.driverId === driverId);
    const finesCount = driverFines.length;

    // Ledger compliance (received vs charged)
    const driverLedger = ledger.filter((l: any) => l.driverId === driverId);
    const claimsBilled = driverLedger.filter((l: any) => l.type === "claim");
    const claimsPaid = driverLedger.filter((l: any) => l.type === "payment" && l.description?.toLowerCase().includes("sinistro"));
    
    const billedAmt = Math.abs(claimsBilled.reduce((sum, l) => sum + (Number(l.amount) || 0), 0));
    const paidAmt = Math.abs(claimsPaid.reduce((sum, l) => sum + (Number(l.amount) || 0), 0));
    const recoveryComplianceRate = billedAmt > 0 ? Math.min(100, Math.round((paidAmt / billedAmt) * 100)) : 100;

    // Risk calculation logic:
    // Score out of 100
    // Claims count weight: 40% (20 points per claim, max 40)
    // Damage costs weight: 30% (10 points per R$10,000, max 30)
    // Fines count weight: 20% (5 points per fine, max 20)
    // Ledger compliance weight: 10% (10 - compliance/10 points, max 10)
    let score = 0;
    score += Math.min(40, claimsCount * 20);
    score += Math.min(30, Math.floor(totalDamageCost / 10000) * 10);
    score += Math.min(20, finesCount * 5);
    score += Math.min(10, Math.max(0, 10 - Math.floor(recoveryComplianceRate / 10)));

    let riskLevel: "Baixo" | "Médio" | "Alto" | "Crítico" = "Baixo";
    let description = "Perfil operacional seguro. Histórico sem sinistros recorrentes ou pendências.";

    if (score >= 70) {
      riskLevel = "Crítico";
      description = "Risco Operacional Crítico. Múltiplos sinistros graves registrados e alto passivo de manutenção.";
    } else if (score >= 45) {
      riskLevel = "Alto";
      description = "Alto risco de sinistros. Condutor apresenta histórico de avarias consideráveis e infrações ativas.";
    } else if (score >= 20) {
      riskLevel = "Médio";
      description = "Risco moderado. Histórico de pequenos sinistros ou infrações operacionais sob controle.";
    }

    return {
      riskLevel,
      score,
      claimsCount,
      totalDamageCost,
      finesCount,
      recoveryComplianceRate,
      description
    };
  }, [driverId, claims, allDamageItems, allBudgets, fines, ledger]);
}
