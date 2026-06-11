export interface OverviewMetrics {
  totalVehicles: number;
  activeContractsCount: number;
  utilizationRate: number;
  totalRevenue: number;
  totalPending: number;
  totalMaintCost: number;
  netProfit: number;
  averageMileage: number;
  totalDriversCount: number;
  activeClaimsCount: number;
}

export interface ExpirationAlert {
  name: string;
  type: "CNH" | "Seguro" | "Licenciamento";
  date: string;
  days: number;
  referenceId: string;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
  monthlyRevenue: number;
  maintenanceCost: number;
  roi: number;
}

export interface MaintenanceTypeBreakdown {
  preventiveCount: number;
  preventiveCost: number;
  correctiveCount: number;
  correctiveCost: number;
  sinisterCount: number;
  sinisterCost: number;
}
