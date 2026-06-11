import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "web/src/app/contracts");
const lines = fs.readFileSync(path.join(ROOT, "page.tsx"), "utf8").split(/\r?\n/);

function extract(start, end, indent = 6) {
  return lines
    .slice(start - 1, end)
    .map((line) => (line.startsWith(" ".repeat(indent)) ? line.slice(indent) : line))
    .join("\n");
}

const listJsx = extract(758, 964);

const listComponent = `"use client";

import {
  FileText, Plus, Search, History, User, Car, Calendar,
  CheckCircle, DollarSign, CreditCard, AlertTriangle, Edit2,
  PauseCircle, RotateCcw, Ban, ChevronRight,
} from "lucide-react";
import { STATUS_STYLES } from "../_lib/constants";
import { formatDate } from "../_lib/utils";
import { getDriverName, getVehicleInfo } from "../_lib/helpers";
import type { ContractMetrics } from "../_lib/types";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filteredContracts: any[];
  loading: boolean;
  metrics: ContractMetrics;
  receipts: any[];
  promissories: any[];
  checklists: any[];
  drivers: any[];
  vehicles: any[];
  can: (action: string, resource?: any) => boolean;
  onOpenDetail: (contract: any) => void;
  onEdit: (contract: any) => void;
  onSuspend: (contract: any) => void;
  onClose: (contract: any) => void;
  onReactivate: (contract: any) => void;
  onRescind: (contract: any) => void;
  onNewContract: () => void;
};

export function ContractsListSection({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filteredContracts,
  loading,
  metrics,
  receipts,
  promissories,
  checklists,
  drivers,
  vehicles,
  can,
  onOpenDetail,
  onEdit,
  onSuspend,
  onClose,
  onReactivate,
  onRescind,
  onNewContract,
}: Props) {
  return (
    <>
${listJsx
  .replace(/getDriverName\(contract\.driverId\)/g, "getDriverName(drivers, contract.driverId)")
  .replace(/getVehicleInfo\(contract\.vehicleId\)/g, "getVehicleInfo(vehicles, contract.vehicleId)")
  .replace(/openContractDetail\(contract\)/g, "onOpenDetail(contract)")
  .replace(/openEditContract\(contract\)/g, "onEdit(contract)")
  .replace(/setSuspendModal\(contract\)/g, "onSuspend(contract)")
  .replace(/setClosingContract\(contract\); setCloseForm\(\{ amountPaid: 0, notes: "" \}\)/g, "onClose(contract)")
  .replace(/handleReactivate\(contract\)/g, "onReactivate(contract)")
  .replace(/handleRescind\(contract\)/g, "onRescind(contract)")
  .replace(/resetNewForm\(\); setIsNewModalOpen\(true\)/g, "onNewContract()")}
    </>
  );
}
`;

fs.mkdirSync(path.join(ROOT, "_components"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "_components/ContractsListSection.tsx"), listComponent);
console.log("ContractsListSection.tsx written");

// New contract modal: lines 967-1113
const newModalJsx = extract(967, 1113, 8);
const newModal = `"use client";

import {
  X, Key, ShieldAlert, FileCheck, FileText,
} from "lucide-react";
import { DRIVER_LOCK_BLOCKS } from "../_lib/constants";
import type { ContractType, NewContractFormState } from "../_lib/types";

type Props = {
  formData: NewContractFormState;
  setFormData: React.Dispatch<React.SetStateAction<NewContractFormState>>;
  drivers: any[];
  vehicles: any[];
  templates: any[];
  profiles: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getDriverLocks: (id: string) => string[];
  getInterpolatedBody: (templateId: string, driverId: string, vehicleId: string, dailyRate: number) => string;
};

export function NewContractModal({
  formData,
  setFormData,
  drivers,
  vehicles,
  templates,
  profiles,
  onClose,
  onSubmit,
  getDriverLocks,
  getInterpolatedBody,
}: Props) {
  return (
${newModalJsx
  .replace(/setIsNewModalOpen\(false\)/g, "onClose()")
  .replace(/handleCreate/g, "onSubmit")
  .replace(/availableVehicles/g, "vehicles")}
  );
}
`;
fs.mkdirSync(path.join(ROOT, "_components/modals"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "_components/modals/NewContractModal.tsx"), newModal);
console.log("NewContractModal.tsx written");

// Edit modal: 1116-1183
const editModalJsx = extract(1116, 1183, 8);
const editModal = `"use client";

import { X, Edit2 } from "lucide-react";
import type { ContractStatus, ContractType, EditFormState } from "../_lib/types";

type Props = {
  editingContract: any;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  driverName: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function EditContractModal({ editingContract, editForm, setEditForm, driverName, onClose, onSubmit }: Props) {
  return (
${editModalJsx
  .replace(/setEditingContract\(null\)/g, "onClose()")
  .replace(/handleEditContract/g, "onSubmit")
  .replace(/getDriverName\(editingContract\.driverId\)/g, "driverName")}
  );
}
`;
fs.writeFileSync(path.join(ROOT, "_components/modals/EditContractModal.tsx"), editModal);
console.log("EditContractModal.tsx written");

// Suspend modal: 1186-1206
const suspendJsx = extract(1186, 1206, 8);
const suspendModal = `"use client";

import { PauseCircle } from "lucide-react";

type Props = {
  contract: any;
  driverName: string;
  suspendReason: string;
  setSuspendReason: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function SuspendContractModal({ contract, driverName, suspendReason, setSuspendReason, onClose, onSubmit }: Props) {
  return (
${suspendJsx
  .replace(/suspendModal/g, "contract")
  .replace(/getDriverName\(suspendModal\.driverId\)/g, "driverName")
  .replace(/setSuspendModal\(null\); setSuspendReason\(""\)/g, "onClose()")
  .replace(/handleSuspend/g, "onSubmit")}
  );
}
`;
fs.writeFileSync(path.join(ROOT, "_components/modals/SuspendContractModal.tsx"), suspendModal);
console.log("SuspendContractModal.tsx written");

// Close modal: 1209-1234
const closeJsx = extract(1209, 1234, 8);
const closeModal = `"use client";

import { Archive } from "lucide-react";
import type { CloseFormState } from "../_lib/types";

type Props = {
  contract: any;
  driverName: string;
  vehicleInfo: string;
  closeForm: CloseFormState;
  setCloseForm: React.Dispatch<React.SetStateAction<CloseFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function CloseContractModal({ contract, driverName, vehicleInfo, closeForm, setCloseForm, onClose, onSubmit }: Props) {
  return (
${closeJsx
  .replace(/closingContract/g, "contract")
  .replace(/getDriverName\(closingContract\.driverId\)/g, "driverName")
  .replace(/getVehicleInfo\(closingContract\.vehicleId\)/g, "vehicleInfo")
  .replace(/setClosingContract\(null\)/g, "onClose()")
  .replace(/handleClose/g, "onSubmit")}
  );
}
`;
fs.writeFileSync(path.join(ROOT, "_components/modals/CloseContractModal.tsx"), closeModal);
console.log("CloseContractModal.tsx written");

console.log("Modal extraction complete");
