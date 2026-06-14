export const ACCIDENT_TYPES = [
  "Colisão Frontal",
  "Colisão Traseira",
  "Colisão Lateral",
  "Capotamento",
  "Furto",
  "Roubo",
  "Vandalismo",
  "Enchente",
  "Incêndio",
  "Quebra de Vidro",
  "Dano Mecânico",
  "Terceiros"
] as const;

export const DAMAGE_REGIONS = [
  { id: "front", label: "Frente" },
  { id: "rear", label: "Traseira" },
  { id: "left_side", label: "Lateral Esquerda" },
  { id: "right_side", label: "Lateral Direita" },
  { id: "roof", label: "Teto" },
  { id: "interior", label: "Interior" }
] as const;

export const POLICE_REPORT_STATUSES = [
  "Não Registrado",
  "Aguardando Registro",
  "Em Análise",
  "Complementação Solicitada",
  "Concluído"
] as const;
