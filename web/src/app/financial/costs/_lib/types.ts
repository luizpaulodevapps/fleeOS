// Financial/Costs Types

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  expenseType: string;
  amount: number;
  date: string;
  referenceId: string;
  referenceType: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CostAnalysis {
  totalExpensesSum: number;
  totalKmRodado: number;
  costPerKm: number;
  costsByVehicle: Array<{
    vehicleId: string;
    info: string;
    amount: number;
  }>;
  costsByCategory: Array<{
    category: string;
    amount: number;
  }>;
  partsConsumption: Array<{
    itemId: string;
    name: string;
    code: string;
    qty: number;
    cost: number;
  }>;
}
