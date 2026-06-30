/**
 * Billing Engine — single source of truth for daily-rate calculations.
 *
 * Used by:
 *  - settings/page.tsx (admin simulator + bulk billing run)
 *  - cashier/page.tsx  (on-the-fly pending dailies for a driver)
 *  - future closing/reporting flows
 *
 * All functions here are pure: they take data + return data, no DB I/O.
 * Persistence stays in the calling module so that idempotency and write
 * concerns (ledger entries, billing_runs) are owned by each surface.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type Weekdays = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

export type CalendarEventType =
  | "holiday"
  | "optional"
  | "maintenance"
  | "company_shutdown";

export type DailyProfile = {
  id: string;
  name: string;
  amount: number;
  validFrom?: string | null;
  validTo?: string | null;
};

export type BillingRule = {
  id?: string;
  profileId?: string;
  calendarId?: string;
  weekdays: Weekdays;
  exemptHolidays: boolean;
  exemptOptionalDays: boolean;
  active?: boolean;
};

export type CalendarEvent = {
  id?: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: CalendarEventType;
  chargeNormally: boolean;
};

export type BillingSuspension = {
  id?: string;
  driverId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  suspendCharges: boolean;
};

export type ContractLike = {
  id?: string;
  driverId: string;
  status?: string;
  dailyProfileId?: string;
  dailyProfileNameSnapshot?: string;
  dailyAmountSnapshot?: number;
  dailyRate?: number;
  /** Future fields (Parte 1 of the roadmap). Optional until contracts are migrated. */
  billingRuleId?: string;
  billingRuleSnapshot?: Pick<BillingRule, "weekdays" | "exemptHolidays" | "exemptOptionalDays">;
};

export type DriverLike = {
  id: string;
  name?: string;
  status?: string;
};

export type DailyItem = {
  date: string;       // YYYY-MM-DD
  dayOfWeek: string;  // pt-BR weekday name
  isCharged: boolean;
  rate: number;
  reason: string;
};

export type BillingResult = {
  driverId: string;
  driverName: string;
  profileName: string;
  daysCharged: number;
  daysExempt: number;
  totalAmount: number;
  details: DailyItem[];
  error?: string;
};

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_WEEKDAYS: Weekdays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

export const DEFAULT_RULE: BillingRule = {
  weekdays: { ...DEFAULT_WEEKDAYS },
  exemptHolidays: true,
  exemptOptionalDays: true,
  active: true,
};

const WEEKDAY_KEYS_EN: (keyof Weekdays)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const WEEKDAY_NAMES_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

// ─── Resolvers ──────────────────────────────────────────────────────────────

/**
 * Resolve which DailyProfile applies to a contract, falling back to the
 * snapshot fields stored on the contract itself when the source profile
 * was deleted or is unavailable.
 */
export function resolveProfile(
  contract: ContractLike,
  profiles: DailyProfile[],
): DailyProfile {
  const profileId = contract.dailyProfileId || "";
  const found = profiles.find((p) => p.id === profileId);
  if (found) return found;
  return {
    id: profileId || "snapshot",
    name: contract.dailyProfileNameSnapshot || "Diária Padrão Comercial",
    amount: contract.dailyAmountSnapshot || contract.dailyRate || 150,
  };
}

/**
 * Resolve which BillingRule applies to a contract.
 *
 * Priority:
 *   1. contract.billingRuleSnapshot   (frozen at signature time — preferred)
 *   2. contract.billingRuleId         (live lookup by id)
 *   3. first active rule for the contract's profile
 *   4. DEFAULT_RULE                   (Mon–Fri, exempt holidays/optional)
 */
export function resolveRule(
  contract: ContractLike,
  profile: DailyProfile,
  rules: BillingRule[],
): BillingRule {
  if (contract.billingRuleSnapshot) {
    return {
      ...DEFAULT_RULE,
      ...contract.billingRuleSnapshot,
      active: true,
    };
  }
  if (contract.billingRuleId) {
    const byId = rules.find((r) => r.id === contract.billingRuleId);
    if (byId) return byId;
  }
  const byProfile = rules.find(
    (r) => r.profileId === profile.id && r.active !== false,
  );
  if (byProfile) return byProfile;
  return DEFAULT_RULE;
}

// ─── Core computation ───────────────────────────────────────────────────────

export type ComputeArgs = {
  contract: ContractLike;
  profile: DailyProfile;
  rule: BillingRule;
  calendar: CalendarEvent[];
  suspensions: BillingSuspension[];
  fromDate: string; // YYYY-MM-DD inclusive
  toDate: string;   // YYYY-MM-DD inclusive
};

/**
 * Walks day-by-day through [fromDate, toDate] and decides for each day
 * whether the contract should be charged, applying (in order):
 *   - active billing suspensions
 *   - calendar entries with chargeNormally=true (force charge if weekday active)
 *   - holiday / optional / maintenance / shutdown exemptions per rule
 *   - weekday mask (e.g. Mon–Sat only)
 */
export function computeContractDailies(args: ComputeArgs): {
  items: DailyItem[];
  daysCharged: number;
  daysExempt: number;
  totalAmount: number;
} {
  const { contract, profile, rule, calendar, suspensions, fromDate, toDate } = args;

  const start = new Date(`${fromDate}T12:00:00`);
  const end = new Date(`${toDate}T12:00:00`);

  const items: DailyItem[] = [];
  let daysCharged = 0;
  let daysExempt = 0;
  let totalAmount = 0;

  const current = new Date(start);
  while (current <= end) {
    const dateString = current.toISOString().split("T")[0];
    const weekdayIndex = current.getDay();
    const dayEn = WEEKDAY_KEYS_EN[weekdayIndex];
    const dayPt = WEEKDAY_NAMES_PT[weekdayIndex];

    const isWeekdayActive = rule.weekdays[dayEn] ?? false;

    const calEvent = calendar.find((c) => c.date === dateString);
    let isHolidayExempt = false;
    if (calEvent && !calEvent.chargeNormally) {
      if (calEvent.type === "holiday" && rule.exemptHolidays) {
        isHolidayExempt = true;
      } else if (calEvent.type === "optional" && rule.exemptOptionalDays) {
        isHolidayExempt = true;
      } else if (
        calEvent.type === "maintenance" ||
        calEvent.type === "company_shutdown"
      ) {
        isHolidayExempt = true;
      }
    }

    const suspension = suspensions.find(
      (s) =>
        s.driverId === contract.driverId &&
        dateString >= s.startDate &&
        dateString <= s.endDate &&
        s.suspendCharges,
    );

    let isCharged = false;
    let rate = 0;
    let reason = "";

    if (suspension) {
      isCharged = false;
      reason = `Suspensão: ${suspension.reason}`;
    } else if (calEvent && calEvent.chargeNormally) {
      isCharged = isWeekdayActive;
      rate = isCharged ? profile.amount : 0;
      reason = isCharged
        ? `Cobrado (Calendário: ${calEvent.name})`
        : `Isento (Fim de Semana)`;
    } else if (isHolidayExempt && calEvent) {
      isCharged = false;
      const label =
        calEvent.type === "holiday"
          ? "Feriado"
          : calEvent.type === "optional"
            ? "Ponto Facultativo"
            : "Recesso/Fechamento";
      reason = `Isento (${label}: ${calEvent.name})`;
    } else if (!isWeekdayActive) {
      isCharged = false;
      reason = `Isento (${dayPt})`;
    } else {
      isCharged = true;
      rate = profile.amount;
      reason = "Cobrado normalmente";
    }

    if (isCharged) {
      daysCharged++;
      totalAmount += rate;
    } else {
      daysExempt++;
    }

    items.push({ date: dateString, dayOfWeek: dayPt, isCharged, rate, reason });
    current.setDate(current.getDate() + 1);
  }

  return { items, daysCharged, daysExempt, totalAmount };
}

// ─── High-level helpers ─────────────────────────────────────────────────────

export type CalculateArgs = {
  driverId: string;
  startDate: string;
  endDate: string;
  contracts: ContractLike[];
  drivers: DriverLike[];
  profiles: DailyProfile[];
  rules: BillingRule[];
  calendar: CalendarEvent[];
  suspensions: BillingSuspension[];
};

/**
 * Convenience wrapper that mirrors the legacy
 * `calculateDriverBillingForPeriod` signature used by the settings simulator.
 * Picks the driver's active contract and runs `computeContractDailies`.
 */
export function calculateDriverBillingForPeriod(
  args: CalculateArgs,
): BillingResult {
  const {
    driverId,
    startDate,
    endDate,
    contracts,
    drivers,
    profiles,
    rules,
    calendar,
    suspensions,
  } = args;

  const driverName =
    drivers.find((d) => d.id === driverId)?.name || "Motorista Desconhecido";

  const contract = contracts.find(
    (c) => c.driverId === driverId && c.status === "Ativo",
  );

  if (!contract) {
    return {
      driverId,
      driverName:
        drivers.find((d) => d.id === driverId)?.name ||
        "Motorista Sem Contrato",
      profileName: "Sem Contrato Ativo",
      daysCharged: 0,
      daysExempt: 0,
      totalAmount: 0,
      details: [],
      error: "Nenhum contrato ativo encontrado para este motorista no período.",
    };
  }

  const profile = resolveProfile(contract, profiles);
  const rule = resolveRule(contract, profile, rules);
  const { items, daysCharged, daysExempt, totalAmount } = computeContractDailies({
    contract,
    profile,
    rule,
    calendar,
    suspensions,
    fromDate: startDate,
    toDate: endDate,
  });

  return {
    driverId,
    driverName,
    profileName: profile.name,
    daysCharged,
    daysExempt,
    totalAmount,
    details: items,
  };
}

// ─── Display helpers ────────────────────────────────────────────────────────

/**
 * Compact human-readable summary of a billing rule, e.g.
 *   "Seg–Sex • Isenta feriados"
 *   "Seg–Sáb • Cobra feriados"
 *   "Seg–Dom • Isenta facultativos"
 */
export function formatBillingRuleLabel(rule: BillingRule): string {
  const wd = rule.weekdays;
  const order: (keyof Weekdays)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const shortPt: Record<keyof Weekdays, string> = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sáb",
    sunday: "Dom",
  };
  const active = order.filter((k) => wd[k]);
  let daysLabel = active.map((k) => shortPt[k]).join(", ");
  // Detect contiguous runs starting on Monday for a friendlier "Seg–X" label
  if (active.length >= 2) {
    const idx = active.map((k) => order.indexOf(k));
    const contiguousFromMonday =
      idx[0] === 0 && idx.every((v, i) => v === i);
    if (contiguousFromMonday) {
      daysLabel = `${shortPt.monday}–${shortPt[active[active.length - 1]]}`;
    }
  }
  const flags: string[] = [];
  flags.push(rule.exemptHolidays ? "Isenta feriados" : "Cobra feriados");
  if (rule.exemptOptionalDays) flags.push("isenta facultativos");
  return `${daysLabel} • ${flags.join(" · ")}`;
}
