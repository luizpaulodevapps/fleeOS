export interface CNHStatus {
  label: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}

export const getCNHStatus = (points: number): CNHStatus => {
  if (points <= 19) return { label: "Regular", color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-700", border: "border-emerald-500/25" };
  if (points <= 29) return { label: "Atenção", color: "yellow", bg: "bg-yellow-400/10", text: "text-yellow-700", border: "border-yellow-400/25" };
  if (points <= 39) return { label: "Risco", color: "orange", bg: "bg-orange-500/10", text: "text-orange-700", border: "border-orange-500/25" };
  return { label: "Crítico", color: "red", bg: "bg-red-500/10", text: "text-red-700", border: "border-red-500/25" };
};

export interface ScoreTier {
  label: string;
  emoji: string;
  bg: string;
  text: string;
  border: string;
}

export const getScoreTier = (score: number): ScoreTier => {
  if (score >= 95) return { label: "Ouro", emoji: "🥇", bg: "bg-yellow-400/15", text: "text-yellow-700", border: "border-yellow-400/30" };
  if (score >= 80) return { label: "Prata", emoji: "🥈", bg: "bg-slate-200/60", text: "text-slate-600", border: "border-slate-300" };
  if (score >= 60) return { label: "Bronze", emoji: "🥉", bg: "bg-orange-400/10", text: "text-orange-700", border: "border-orange-400/25" };
  return { label: "Restrito", emoji: "⛔", bg: "bg-red-500/10", text: "text-red-700", border: "border-red-500/25" };
};

export const calcDriverScore = (
  driverId: string,
  driverCnhSuspended: boolean | undefined,
  occurrences: any[],
  claims: any[],
  infractions: any[]
): number => {
  let score = 100;
  const drvOcc = occurrences.filter(o => o.driverId === driverId);
  const drvClaims = claims.filter(c => c.driverId === driverId && c.atFault);
  const drvInfractions = infractions.filter(i => i.driverId === driverId);

  // Penalties
  drvOcc.forEach(o => {
    if (o.type === "Reclamação") score -= 1;
    if (o.type === "Atraso") score -= 1;
  });
  drvClaims.forEach(() => { score -= 10; });
  drvInfractions.forEach(i => { score -= Math.floor((i.points || 0) * 0.5); });
  if (driverCnhSuspended) score -= 20;

  // Bonuses — +5 per elogio
  drvOcc.forEach(o => { if (o.type === "Elogio") score += 5; });

  return Math.max(0, Math.min(100, score));
};
export const isReadOnly = (driver: any): boolean => {
  if (!driver) return false;
  const locks = driver.activeLocks || [];
  return locks.includes("Judicial") || locks.includes("Administrativo");
};
