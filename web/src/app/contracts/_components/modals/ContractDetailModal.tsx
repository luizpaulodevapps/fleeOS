"use client";

import {
  X, FileText, ReceiptText, CreditCard, ClipboardCheck, Layers, Activity, FileStack,
} from "lucide-react";
import { STATUS_STYLES } from "../../_lib/constants";
import { getDriverName, getVehicleInfo } from "../../_lib/helpers";
import { OverviewTab } from "../detail/OverviewTab";
import { ReceiptsTab } from "../detail/ReceiptsTab";
import { PromissoriesTab } from "../detail/PromissoriesTab";
import { ChecklistTab } from "../detail/ChecklistTab";
import { AddendumsTab } from "../detail/AddendumsTab";
import { AuditTab } from "../detail/AuditTab";
import { DocumentsTab } from "../detail/DocumentsTab";
import type {
  AddendumFormState,
  ChecklistItemForm,
  PaymentMethod,
  PromissoryFormState,
  PromissoryStatus,
  ReceiptFormState,
} from "../../_lib/types";

const TABS = [
  { id: "overview", label: "Visão Geral", icon: FileText },
  { id: "documents", label: "Documentos", icon: FileStack },
  { id: "receipts", label: "Recibos", icon: ReceiptText },
  { id: "promissories", label: "Promissórias", icon: CreditCard },
  { id: "checklist", label: "Checklist", icon: ClipboardCheck },
  { id: "addendums", label: "Aditivos", icon: Layers },
  { id: "audit", label: "Auditoria", icon: Activity },
] as const;

type Props = {
  contract: any;
  drivers: any[];
  vehicles: any[];
  company: any;
  receipts: any[];
  promissories: any[];
  checklists: any[];
  addendums: any[];
  timeline: any[];
  generatedDocuments: any[];
  activeDetailTab: string;
  setActiveDetailTab: (tab: string) => void;
  can: (action: string, resource?: any) => boolean;
  onClose: () => void;
  onEdit: (contract: any) => void;
  onGenerateDocument: (templateId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onViewDocument: (doc: any) => void;
  receiptForm: ReceiptFormState;
  setReceiptForm: React.Dispatch<React.SetStateAction<ReceiptFormState>>;
  promissoryForm: PromissoryFormState;
  setPromissoryForm: React.Dispatch<React.SetStateAction<PromissoryFormState>>;
  checklistType: "Entrega" | "Devolução";
  setChecklistType: (value: "Entrega" | "Devolução") => void;
  checklistMileage: string;
  setChecklistMileage: (value: string) => void;
  checklistFuel: string;
  setChecklistFuel: (value: string) => void;
  checklistItems: ChecklistItemForm[];
  setChecklistItems: React.Dispatch<React.SetStateAction<ChecklistItemForm[]>>;
  checklistObs: string;
  setChecklistObs: (value: string) => void;
  addendumForm: AddendumFormState;
  setAddendumForm: React.Dispatch<React.SetStateAction<AddendumFormState>>;
  onPrintReceipt: (receipt: any) => void;
  onCancelReceipt: (receipt: any) => void;
  onAddReceipt: (e: React.FormEvent) => void;
  onPromissoryStatus: (promissory: any, status: PromissoryStatus) => void;
  onAddPromissory: (e: React.FormEvent) => void;
  onPrintChecklist: (checklist: any) => void;
  onSubmitChecklist: (e: React.FormEvent) => void;
  onAddAddendum: (e: React.FormEvent) => void;
  currentUserName: string;
};

export function ContractDetailModal({
  contract,
  drivers,
  vehicles,
  company,
  receipts,
  promissories,
  checklists,
  addendums,
  timeline,
  generatedDocuments,
  activeDetailTab,
  setActiveDetailTab,
  can,
  onClose,
  onEdit,
  onGenerateDocument,
  onDeleteDocument,
  onViewDocument,
  receiptForm,
  setReceiptForm,
  promissoryForm,
  setPromissoryForm,
  checklistType,
  setChecklistType,
  checklistMileage,
  setChecklistMileage,
  checklistFuel,
  setChecklistFuel,
  checklistItems,
  setChecklistItems,
  checklistObs,
  setChecklistObs,
  addendumForm,
  setAddendumForm,
  onPrintReceipt,
  onCancelReceipt,
  onAddReceipt,
  onPromissoryStatus,
  onAddPromissory,
  onPrintChecklist,
  onSubmitChecklist,
  onAddAddendum,
  currentUserName,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[93vh] flex flex-col">
        <div className="p-5 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-bold text-primary font-geist flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contrato #{contract.id.substring(0, 8)}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${STATUS_STYLES[contract.status]}`}>
                  {contract.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold uppercase">{contract.type}</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {getDriverName(drivers, contract.driverId)} &nbsp;•&nbsp; {getVehicleInfo(vehicles, contract.vehicleId)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-outline-variant bg-surface-container-low px-4 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeDetailTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeDetailTab === "overview" && (
            <OverviewTab contract={contract} drivers={drivers} vehicles={vehicles} can={can} onEdit={onEdit} />
          )}
          {activeDetailTab === "documents" && (
            <DocumentsTab
              contract={contract}
              drivers={drivers}
              vehicles={vehicles}
              company={company}
              generatedDocuments={generatedDocuments}
              onGenerate={onGenerateDocument}
              onDelete={onDeleteDocument}
              onView={onViewDocument}
              currentUserName={currentUserName}
            />
          )}
          {activeDetailTab === "receipts" && (
            <ReceiptsTab
              contract={contract}
              receipts={receipts}
              receiptForm={receiptForm}
              setReceiptForm={setReceiptForm}
              can={can}
              onPrintReceipt={onPrintReceipt}
              onCancelReceipt={onCancelReceipt}
              onAddReceipt={onAddReceipt}
            />
          )}
          {activeDetailTab === "promissories" && (
            <PromissoriesTab
              contract={contract}
              promissories={promissories}
              promissoryForm={promissoryForm}
              setPromissoryForm={setPromissoryForm}
              can={can}
              onPromissoryStatus={onPromissoryStatus}
              onAddPromissory={onAddPromissory}
            />
          )}
          {activeDetailTab === "checklist" && (
            <ChecklistTab
              contract={contract}
              checklists={checklists}
              checklistType={checklistType}
              setChecklistType={setChecklistType}
              checklistMileage={checklistMileage}
              setChecklistMileage={setChecklistMileage}
              checklistFuel={checklistFuel}
              setChecklistFuel={setChecklistFuel}
              checklistItems={checklistItems}
              setChecklistItems={setChecklistItems}
              checklistObs={checklistObs}
              setChecklistObs={setChecklistObs}
              onPrintChecklist={onPrintChecklist}
              onSubmitChecklist={onSubmitChecklist}
            />
          )}
          {activeDetailTab === "addendums" && (
            <AddendumsTab
              contract={contract}
              addendums={addendums}
              addendumForm={addendumForm}
              setAddendumForm={setAddendumForm}
              onAddAddendum={onAddAddendum}
            />
          )}
          {activeDetailTab === "audit" && <AuditTab contract={contract} timeline={timeline} />}
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant font-semibold text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
