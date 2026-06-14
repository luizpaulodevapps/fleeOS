import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClaimFinancialRecovery } from "../_lib/types";

export function useClaimFinancial() {
  const { getCollection, addDocument, updateDocument } = useAuth();
  const [financialRecovery, setFinancialRecovery] = useState<ClaimFinancialRecovery | null>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  const loadFinancial = useCallback(async (claimId: string) => {
    setLoadingFinancial(true);
    try {
      const allRecovery = await getCollection("claim_financial_recovery");
      const current = allRecovery?.find((r: any) => r.claimId === claimId) || null;
      setFinancialRecovery(current);
    } catch (e) {
      console.error("Erro ao carregar recuperação financeira do sinistro", e);
    } finally {
      setLoadingFinancial(false);
    }
  }, [getCollection]);

  const saveFinancial = useCallback(async (claimId: string, data: Omit<ClaimFinancialRecovery, "id" | "claimId">) => {
    try {
      const allRecovery = await getCollection("claim_financial_recovery");
      const current = allRecovery?.find((r: any) => r.claimId === claimId) || null;
      
      const payload = {
        claimId,
        ...data
      };

      if (current) {
        await updateDocument("claim_financial_recovery", current.id, payload);
        setFinancialRecovery({ id: current.id, ...payload });
      } else {
        const newDoc = await addDocument("claim_financial_recovery", payload);
        setFinancialRecovery(newDoc);
      }
    } catch (e) {
      console.error("Erro ao salvar recuperação financeira", e);
    }
  }, [getCollection, addDocument, updateDocument]);

  return {
    financialRecovery,
    loadingFinancial,
    loadFinancial,
    saveFinancial
  };
}
