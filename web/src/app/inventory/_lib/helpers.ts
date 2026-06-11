// Inventory Helper Utilities

export function isStockLow(currentQty: number, minQty: number): boolean {
  return currentQty <= minQty;
}

export function getStockStatus(currentQty: number, minQty: number): "low" | "adequate" {
  return isStockLow(currentQty, minQty) ? "low" : "adequate";
}

export function calculateStockValue(qty: number, unitCost: number): number {
  return qty * unitCost;
}

export function formatInventoryMovementType(type: string): string {
  return type === "IN" ? "ENTRADA" : "SAÍDA";
}

export function getMovementColor(type: string): string {
  return type === "IN" ? "emerald" : "red";
}
