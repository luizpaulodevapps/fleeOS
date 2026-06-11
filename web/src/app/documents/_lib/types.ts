export type DocumentCategory =
  | "Operação"
  | "Financeiro"
  | "Sinistros"
  | "Compliance"
  | "Patrimônio"
  | "Encerramento";

export type DocumentTemplate = {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  icon: string;
  body: string;
  /** Variables this template needs beyond contract/driver/vehicle defaults */
  extraFields?: DocumentExtraField[];
};

export type DocumentExtraField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

export type DocumentVariableMap = Record<string, string>;

export type GeneratedDocument = {
  templateId: string;
  templateName: string;
  category: DocumentCategory;
  resolvedBody: string;
  contractId?: string;
  driverId?: string;
  vehicleId?: string;
  generatedAt: string;
  generatedBy: string;
};

export type GenerateDocumentForm = {
  contractId: string;
  extraFields: Record<string, string>;
};
