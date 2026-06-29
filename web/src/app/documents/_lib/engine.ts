import type { DocumentVariableMap } from "./types";
import { valorStringPorExtenso, dataPorExtenso, valorPorExtenso } from "./extenso";

/**
 * Builds a complete variable map from all FleetOS entities.
 * This is the SINGLE source of truth for document variable resolution.
 */
export function buildVariableMap(
  contract: any,
  driver: any,
  vehicle: any,
  company: any,
  extras: Record<string, string> = {}
): DocumentVariableMap {
  const today = new Date().toLocaleDateString("pt-BR");
  const todayIso = new Date().toISOString().substring(0, 10);

  const formatDate = (val: string | undefined) => {
    if (!val) return "—";
    const d = new Date(val + (val.length === 10 ? "T12:00:00" : ""));
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("pt-BR");
  };

  const dailyRate = contract?.dailyRate != null ? Number(contract.dailyRate) : 0;
  const weeklyRate = contract?.weeklyRate != null ? Number(contract.weeklyRate) : dailyRate * 7 * 0.9;
  const monthlyRate = contract?.monthlyRate != null ? Number(contract.monthlyRate) : dailyRate * 30 * 0.85;

  const map: DocumentVariableMap = {
    // ─── Empresa ───────────────────────────────────────────────
    company_name:    company?.name     || "LOCADORA",
    company_cnpj:    company?.cnpj     || "—",
    company_address: company?.address  || "—",
    company_phone:   company?.phone    || "—",
    company_email:   company?.email    || "—",

    // ─── Motorista ─────────────────────────────────────────────
    driver_name:               driver?.name                || "—",
    driver_cpf:                driver?.cpf                 || "—",
    driver_rg:                 driver?.rg                  || "—",
    driver_cnh:                driver?.cnh                 || "—",
    driver_cnh_category:       driver?.cnhCategory         || "—",
    driver_cnh_expiration:     formatDate(driver?.cnhExpiration),
    driver_condutax:           driver?.condutax            || "—",
    driver_condutax_expiration:formatDate(driver?.condutaxExpiration),
    driver_phone:              driver?.phone               || "—",
    driver_address:            driver?.address             || "—",

    // ─── Veículo ───────────────────────────────────────────────
    vehicle_model:              vehicle ? `${vehicle.brand} ${vehicle.model}` : "—",
    vehicle_brand:              vehicle?.brand              || "—",
    vehicle_year:               String(vehicle?.year        || "—"),
    vehicle_plate:              vehicle?.plate              || "—",
    vehicle_renavam:            vehicle?.renavam            || "—",
    vehicle_chassis:            vehicle?.chassis            || "—",
    vehicle_prefix:             vehicle?.prefix             || vehicle?.internalCode || "—",
    vehicle_color:              vehicle?.color              || "—",
    vehicle_permit:             vehicle?.alvara             || vehicle?.permit || "—",
    vehicle_permit_expiration:  formatDate(vehicle?.alvaraExpiration || vehicle?.permitExpiration),
    vehicle_mileage:            String(vehicle?.mileage      || contract?.initialMileage || "—"),

    // ─── Taxímetro ─────────────────────────────────────────────
    taximeter_number:     vehicle?.taximeter?.number    || vehicle?.taxNumber    || "—",
    taximeter_brand:      vehicle?.taximeter?.brand     || vehicle?.taxBrand     || "—",
    taximeter_calibration:formatDate(vehicle?.taximeter?.calibration || vehicle?.taxCalibration),

    // ─── Contrato ──────────────────────────────────────────────
    contract_number:     contract?.id?.substring(0, 8).toUpperCase() || "—",
    contract_start_date: formatDate(contract?.startDate),
    contract_end_date:   formatDate(contract?.endDate),
    contract_date:       today,
    contract_date_extenso: dataPorExtenso(todayIso),

    // ─── Financeiro ────────────────────────────────────────────
    daily_rate:          dailyRate > 0 ? dailyRate.toFixed(2)  : "—",
    weekly_rate:         weeklyRate > 0 ? weeklyRate.toFixed(2) : "—",
    monthly_rate:        monthlyRate > 0 ? monthlyRate.toFixed(2) : "—",
    daily_rate_extenso:  dailyRate > 0 ? valorPorExtenso(dailyRate) : "—",
    weekly_rate_extenso: weeklyRate > 0 ? valorPorExtenso(weeklyRate) : "—",
    monthly_rate_extenso:monthlyRate > 0 ? valorPorExtenso(monthlyRate) : "—",
    driver_balance:      "0,00",
    pending_items:       "Nenhuma",

    // ─── Extras passados pelo modal de geração ─────────────────
    ...extras,
  };

  // ─── Variáveis calculadas automaticamente ──────────────────

  // KM rodados
  const initial = parseFloat(map.vehicle_mileage?.replace(/\D/g, ""));
  const returned = parseFloat(extras.return_mileage || "0");
  if (!isNaN(initial) && !isNaN(returned) && returned > 0) {
    map.km_rodados = String(returned - initial);
  } else {
    map.km_rodados = "—";
  }

  // Variáveis de caução (se fornecida nos extras)
  if (extras.caucao_amount) {
    const caucaoVal = parseFloat(extras.caucao_amount.replace(/\./g, "").replace(",", "."));
    if (!isNaN(caucaoVal)) {
      map.caucao_amount_extenso = valorPorExtenso(caucaoVal);
    }
  }

  // Variável de valor de confissão de dívida
  if (extras.debt_amount) {
    const debtVal = parseFloat(extras.debt_amount.replace(/\./g, "").replace(",", "."));
    if (!isNaN(debtVal)) {
      map.debt_amount_extenso = valorPorExtenso(debtVal);
    }
  }

  // Variável de valor promissória
  if (extras.promissory_amount) {
    const promVal = parseFloat(extras.promissory_amount.replace(/\./g, "").replace(",", "."));
    if (!isNaN(promVal)) {
      map.promissory_amount_extenso = valorPorExtenso(promVal);
    }
  }

  return map;
}

/**
 * Replaces all {{variable}} occurrences in a template body.
 * Variables that were not resolved are highlighted with ⚠️[key].
 */
export function resolveVariables(body: string, variables: DocumentVariableMap): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) return `⚠️[${key}]`;
    return value;
  });
}

/**
 * Returns a list of variable keys used in a template body.
 */
export function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
}

/**
 * Checks if all variables in a template are resolved (no ⚠️ markers).
 */
export function isFullyResolved(resolvedBody: string): boolean {
  return !resolvedBody.includes("⚠️[");
}

/**
 * Builds a variable map and resolves variables in one call.
 * Convenience function for the contracts module preview.
 */
export function buildAndResolve(
  contract: any,
  driver: any,
  vehicle: any,
  company: any,
  templateBody: string,
  extras: Record<string, string> = {}
): string {
  const variables = buildVariableMap(contract, driver, vehicle, company, extras);
  return resolveVariables(templateBody, variables);
}
