export const PHOTO_LABELS = {
  frente: "Frente",
  traseira: "Traseira",
  lateralDireita: "Lat. Direita",
  lateralEsquerda: "Lat. Esquerda",
  painel: "Painel",
  odometro: "Odômetro",
  pneus: "Pneus"
} as const;

export const DEFAULT_CHECKLIST = {
  taximetro: true,
  luminoso: true,
  chaveReserva: true,
  crlv: true,
  extintor: true,
  triangulo: true,
  macaco: true,
  rastreador: true
} as const;

export const INSPECTION_TYPES = [
  { value: "Vistoria Semanal", label: "Vistoria Semanal" },
  { value: "Vistoria Mensal", label: "Vistoria Mensal" },
  { value: "Auditoria Interna", label: "Auditoria Interna" }
] as const;

export const EMPTY_PHOTOS = {
  frente: "",
  traseira: "",
  lateralDireita: "",
  lateralEsquerda: "",
  painel: "",
  odometro: "",
  pneus: ""
} as const;
