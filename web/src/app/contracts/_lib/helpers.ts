export function getDriver(drivers: any[], id: string) {
  return drivers.find((d) => d.id === id);
}

export function getVehicle(vehicles: any[], id: string) {
  return vehicles.find((v) => v.id === id);
}

export function getDriverName(drivers: any[], id: string) {
  return getDriver(drivers, id)?.name || `(${id?.substr(0, 6)})`;
}

export function getVehicleInfo(vehicles: any[], id: string) {
  const vehicle = getVehicle(vehicles, id);
  return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : `(${id?.substr(0, 6)})`;
}

export function getDriverLocks(drivers: any[], id: string): string[] {
  return getDriver(drivers, id)?.activeLocks || [];
}

/**
 * Legacy interpolation for contract template preview (minimal fields).
 * For full document generation use the engine in /documents/_lib/engine.ts.
 */
export function getInterpolatedBody(
  templates: any[],
  drivers: any[],
  vehicles: any[],
  templateId: string,
  driverId: string,
  vehicleId: string,
  dailyRate: number
) {
  const template = templates.find((t) => t.id === templateId);
  if (!template) return "";
  const driver = getDriver(drivers, driverId);
  const vehicle = getVehicle(vehicles, vehicleId);
  const today = new Date().toLocaleDateString("pt-BR");

  return template.body
    // Motorista
    .replace(/{{driver_name}}/g, driver?.name || "[Motorista]")
    .replace(/{{driver_cpf}}/g, driver?.cpf || "[CPF]")
    .replace(/{{driver_rg}}/g, driver?.rg || "[RG]")
    .replace(/{{driver_cnh}}/g, driver?.cnh || "[CNH]")
    .replace(/{{driver_cnh_category}}/g, driver?.cnhCategory || "[Categoria CNH]")
    .replace(/{{driver_cnh_expiration}}/g, driver?.cnhExpiration || "[Validade CNH]")
    .replace(/{{driver_condutax}}/g, driver?.condutax || "[CONDUTAX]")
    .replace(/{{driver_condutax_expiration}}/g, driver?.condutaxExpiration || "[Validade CONDUTAX]")
    .replace(/{{driver_phone}}/g, driver?.phone || "[Telefone]")
    .replace(/{{driver_address}}/g, driver?.address || "[Endereço Motorista]")
    // Veículo
    .replace(/{{vehicle_model}}/g, vehicle ? `${vehicle.brand} ${vehicle.model}` : "[Modelo]")
    .replace(/{{vehicle_brand}}/g, vehicle?.brand || "[Marca]")
    .replace(/{{vehicle_year}}/g, String(vehicle?.year || "[Ano]"))
    .replace(/{{vehicle_plate}}/g, vehicle?.plate || "[Placa]")
    .replace(/{{vehicle_renavam}}/g, vehicle?.renavam || "[Renavam]")
    .replace(/{{vehicle_chassis}}/g, vehicle?.chassis || "[Chassi]")
    .replace(/{{vehicle_prefix}}/g, vehicle?.prefix || vehicle?.internalCode || "[Prefixo]")
    .replace(/{{vehicle_color}}/g, vehicle?.color || "[Cor]")
    .replace(/{{vehicle_permit}}/g, vehicle?.alvara || "[Alvará]")
    .replace(/{{vehicle_permit_expiration}}/g, vehicle?.alvaraExpiration || "[Validade Alvará]")
    .replace(/{{vehicle_mileage}}/g, String(vehicle?.mileage || "[KM]"))
    // Taxímetro
    .replace(/{{taximeter_number}}/g, vehicle?.taxNumber || "[Nº Taxímetro]")
    .replace(/{{taximeter_brand}}/g, vehicle?.taxBrand || "[Marca Taxímetro]")
    .replace(/{{taximeter_calibration}}/g, vehicle?.taxCalibration || "[Última Aferição]")
    // Financeiro
    .replace(/{{daily_rate}}/g, dailyRate.toFixed(2))
    .replace(/{{weekly_rate}}/g, (dailyRate * 7 * 0.9).toFixed(2))
    .replace(/{{monthly_rate}}/g, (dailyRate * 30 * 0.85).toFixed(2))
    // Data
    .replace(/{{contract_date}}/g, today)
    .replace(/{{contract_start_date}}/g, today);
}

