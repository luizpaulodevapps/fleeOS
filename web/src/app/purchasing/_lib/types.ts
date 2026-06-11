// Purchasing Types

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: "ordered" | "delivered";
  totalCost: number;
  paymentMethod: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  qty: number;
  unitCost: number;
  totalCost: number;
}

export interface SupplierFormData {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
}

export interface PurchaseOrderFormData {
  supplierId: string;
  paymentMethod: string;
  items: Array<{
    itemId: string;
    qty: number;
    unitCost: number;
  }>;
}

export interface POItemInput {
  itemId: string;
  qty: number;
  unitCost: number;
}
