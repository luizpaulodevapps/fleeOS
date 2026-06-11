// Maintenance Helper Utilities

export function formatMaintenanceType(type: string): string {
  const types: Record<string, string> = {
    "Preventiva": "Preventiva",
    "Corretiva": "Corretiva",
    "Sinistro": "Sinistro"
  };
  return types[type] || type;
}

export function getMaintenanceTypeColor(type: string): string {
  const colors: Record<string, string> = {
    "Preventiva": "emerald",
    "Corretiva": "red",
    "Sinistro": "orange"
  };
  return colors[type] || "slate";
}

export function getWorkOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "in_progress": "Em Andamento",
    "completed": "Concluída",
    "cancelled": "Cancelada"
  };
  return labels[status] || status;
}

export function getWorkOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "in_progress": "amber",
    "completed": "emerald",
    "cancelled": "red"
  };
  return colors[status] || "slate";
}

export function calculateWearPercentage(currentKm: number, lastServiceKm: number, intervalKm: number): number {
  const kmsSinceLast = currentKm - lastServiceKm;
  return Math.min(Math.max((kmsSinceLast / intervalKm) * 100, 0), 100);
}

export function calculateKmsRemaining(nextServiceKm: number, currentKm: number): number {
  return nextServiceKm - currentKm;
}

export function generateWorkOrderCode(woId: string): string {
  return `OS-${woId.substring(0, 5).toUpperCase()}`;
}
