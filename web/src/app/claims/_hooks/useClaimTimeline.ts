import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClaimTimelineEvent } from "../_lib/types";

export function useClaimTimeline() {
  const { getCollection, addDocument } = useAuth();
  const [timelineEvents, setTimelineEvents] = useState<ClaimTimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const loadTimeline = useCallback(async (claimId: string) => {
    setLoadingTimeline(true);
    try {
      const allEvents = await getCollection("claim_timeline");
      const filtered = allEvents?.filter((e: any) => e.claimId === claimId) || [];
      const sorted = filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTimelineEvents(sorted);
    } catch (e) {
      console.error("Erro ao carregar linha do tempo do sinistro", e);
    } finally {
      setLoadingTimeline(false);
    }
  }, [getCollection]);

  const addTimelineEvent = useCallback(async (claimId: string, eventType: string, title: string, description: string, createdBy: string) => {
    try {
      const payload = {
        claimId,
        eventType,
        title,
        description,
        createdBy,
        createdAt: new Date().toISOString()
      };
      await addDocument("claim_timeline", payload);
      setTimelineEvents(prev => [payload, ...prev]);
    } catch (e) {
      console.error("Erro ao adicionar evento na linha do tempo", e);
    }
  }, [addDocument]);

  return {
    timelineEvents,
    loadingTimeline,
    loadTimeline,
    addTimelineEvent
  };
}
