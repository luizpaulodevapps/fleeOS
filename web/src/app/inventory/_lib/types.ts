// Inventory Types

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  minQty: number;
  currentQty: number;
  avgCost: number;
  unit: string;
  active: boolean;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: "IN" | "OUT";
  qty: number;
  unitCost: number;
  totalCost: number;
  referenceId: string;
  referenceType: string;
  notes: string;
  createdAt: string;
}

export interface InventoryFormData {
  code: string;
  name: string;
  minQty: number;
  currentQty: number;
  avgCost: number;
  unit: string;
  active: boolean;
}
