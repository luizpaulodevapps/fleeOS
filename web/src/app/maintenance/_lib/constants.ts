// Maintenance Constants

export const MAINTENANCE_TYPES = [
  { value: "Preventiva", label: "Preventiva (Revisão)" },
  { value: "Corretiva", label: "Corretiva (Quebra)" },
  { value: "Sinistro", label: "Sinistro (Batida/Avaria)" }
] as const;

export const CRASH_SEVERITY = [
  { value: "Leve", label: "Leve (Apenas riscos/ralados)" },
  { value: "Média", label: "Média (Amassados parciais)" },
  { value: "Grave", label: "Grave (Necessita guincho/chassi)" }
] as const;

export const REVISION_ITEMS = [
  "Óleo",
  "Filtros",
  "Velas",
  "Pneus",
  "Freios",
  "Amortecedores",
  "Bateria",
  "Correia Dentada",
  "Alinhamento"
] as const;

export const REVISION_LABELS: Record<string, string> = {
  "Óleo": "Óleo do Motor",
  "Filtros": "Filtros (Ar/Combustível/Óleo)",
  "Velas": "Velas de Ignição",
  "Pneus": "Rodízio / Troca de Pneus",
  "Freios": "Pastilhas / Discos de Freio",
  "Amortecedores": "Amortecedores",
  "Bateria": "Bateria de Partida",
  "Correia Dentada": "Correia Dentada / Tensores",
  "Alinhamento": "Alinhamento e Balanceamento"
};

export const WORK_ORDER_STATUS = [
  { value: "in_progress", label: "Em Andamento (Oficina)", color: "amber" },
  { value: "completed", label: "Concluída (Aprovada & Atualizar Estoque)", color: "emerald" },
  { value: "cancelled", label: "Cancelada", color: "red" }
] as const;

export const DEFAULT_NEXT_MAINTENANCE_KM = 10000;
