// Inventory Constants

export const INVENTORY_UNITS = [
  "Unidade",
  "Jogo",
  "Litro",
  "Galão",
  "Kit"
] as const;

export const UNIT_LABELS: Record<string, string> = {
  "Unidade": "Unidade",
  "Jogo": "Jogo",
  "Litro": "Litro",
  "Galão": "Galão",
  "Kit": "Kit"
};

export const DEFAULT_STOCK_MIN = 5;
export const DEFAULT_PART_CODE_PREFIX = "PEA";
