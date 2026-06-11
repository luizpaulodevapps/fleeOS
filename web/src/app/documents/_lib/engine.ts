import type { DocumentVariableMap } from "./types";

/**
 * Builds a variable map from all FleetOS entities.
 */
export function buildVariableMap(
  contract: any,
  driver: any,
  vehicle: any,
  company: any,
  extras: Record<string, string> = {}
): DocumentVariableMap {
  const today = new Date().toLocaleDateString("pt-BR");

  const formatDate = (val: string | undefined) => {
    if (!val) return "—";
    const d = new Date(val + (val.length === 10 ? "T12:00:00" : ""));
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("pt-BR");
  };

  const map: DocumentVariableMap = {
    // Empresa
    company_name:    company?.name     || "LOCADORA",
    company_cnpj:    company?.cnpj     || "—",
    company_address: company?.address  || "—",

    // Motorista
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

    // Veículo
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

    // Taxímetro
    taximeter_number:     vehicle?.taximeter?.number    || vehicle?.taxNumber    || "—",
    taximeter_brand:      vehicle?.taximeter?.brand     || vehicle?.taxBrand     || "—",
    taximeter_calibration:formatDate(vehicle?.taximeter?.calibration || vehicle?.taxCalibration),

    // Contrato
    contract_number:     contract?.id?.substring(0, 8).toUpperCase() || "—",
    contract_start_date: formatDate(contract?.startDate),
    contract_end_date:   formatDate(contract?.endDate),
    contract_date:       today,
    daily_rate:          contract?.dailyRate  != null ? Number(contract.dailyRate).toFixed(2)  : "—",
    weekly_rate:         contract?.weeklyRate != null ? Number(contract.weeklyRate).toFixed(2) : "—",
    monthly_rate:        contract?.monthlyRate!= null ? Number(contract.monthlyRate).toFixed(2): "—",
    driver_balance:      "0,00",
    pending_items:       "Nenhuma",

    // Extras passados pelo modal de geração
    ...extras,
  };

  // KM rodados calculado automaticamente se as duas variáveis existirem
  const initial = parseFloat(map.vehicle_mileage?.replace(/\D/g, ""));
  const returned = parseFloat(extras.return_mileage || "0");
  if (!isNaN(initial) && !isNaN(returned) && returned > 0) {
    map.km_rodados = String(returned - initial);
  } else {
    map.km_rodados = "—";
  }

  return map;
}

/**
 * Replaces all {{variable}} occurrences in a template body.
 * Variables that were not resolved are highlighted with [VAR_NOT_FOUND].
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
