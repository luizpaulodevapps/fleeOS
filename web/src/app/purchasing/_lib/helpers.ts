// Purchasing Helper Utilities

export function generatePurchaseOrderCode(poId: string): string {
  return `PO-${poId.substring(0, 5).toUpperCase()}`;
}

export function getPOStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "ordered": "Emitido / Pendente",
    "delivered": "Entregue"
  };
  return labels[status] || status;
}

export function getPOStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "ordered": "amber",
    "delivered": "emerald"
  };
  return colors[status] || "slate";
}

export function calculatePOTotal(items: Array<{ qty: number; unitCost: number }>): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitCost, 0);
}
