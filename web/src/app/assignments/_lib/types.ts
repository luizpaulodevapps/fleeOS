export interface ChecklistItems {
  taximetro: boolean;
  luminoso: boolean;
  chaveReserva: boolean;
  crlv: boolean;
  extintor: boolean;
  triangulo: boolean;
  macaco: boolean;
  rastreador: boolean;
}

export interface Assignment {
  id: string;
  driverId: string;
  vehicleId: string;
  contractId: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  status: "active" | "completed";
}

export interface Checklist {
  id: string;
  assignmentId?: string;
  vehicleId: string;
  driverId: string;
  type: string; // "Entrega" | "Devolução" | "Vistoria Semanal" | "Vistoria Mensal" | "Auditoria Interna"
  date: string;
  items: ChecklistItems;
  signatureText: string;
  signatureImage: string;
  photos: Record<string, string>;
  signed: boolean;
}

export interface AssignmentFormData {
  driverId: string;
  vehicleId: string;
  contractId: string;
  startDate: string;
  checklist: ChecklistItems;
  signatureText: string;
}

export interface ReturnFormData {
  endDate: string;
  vehicleStatusAfter: "active" | "maintenance" | "sinistrado";
  checklist: ChecklistItems;
  signatureText: string;
  mileageEnd: string;
}

export interface AuditFormData {
  driverId: string;
  vehicleId: string;
  type: "Vistoria Semanal" | "Vistoria Mensal" | "Auditoria Interna";
  checklist: ChecklistItems;
  signatureText: string;
}
