import { buildAndResolve } from "@/app/documents/_lib/engine";

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
 * Interpolation for contract template preview.
 * Uses the unified document engine from /documents/_lib/engine.ts.
 */
export function getInterpolatedBody(
  templates: any[],
  drivers: any[],
  vehicles: any[],
  templateId: string,
  driverId: string,
  vehicleId: string,
  dailyRate: number,
  company?: any
) {
  const template = templates.find((t) => t.id === templateId);
  if (!template) return "";

  const driver = getDriver(drivers, driverId);
  const vehicle = getVehicle(vehicles, vehicleId);
  const contract = {
    dailyRate,
    startDate: new Date().toISOString().substring(0, 10),
  };

  return buildAndResolve(contract, driver, vehicle, company || null, template.body);
}
