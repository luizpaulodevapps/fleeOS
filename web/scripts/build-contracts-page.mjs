import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "web/src/app/contracts");
const lines = fs.readFileSync(path.join(ROOT, "page.tsx"), "utf8").split(/\r?\n/);

const logicStart = lines.findIndex((l) => l.includes("export default function ContractsManager"));
const logicEnd = lines.findIndex((l) => l.includes("// ─────────────────────────── PRINT VIEWS"));
const logic = lines.slice(logicStart + 1, logicEnd).join("\n");

const header = `"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CHECKLIST_ITEMS_DEFAULT } from "../_lib/constants";
import {
  normalizeContractStatus,
  createDefaultChecklistItems,
  createDefaultNewContractForm,
  createDefaultReceiptForm,
  createDefaultPromissoryForm,
  createDefaultAddendumForm,
} from "../_lib/utils";
import {
  getDriver,
  getVehicle,
  getDriverName,
  getVehicleInfo,
  getDriverLocks,
  getInterpolatedBody,
} from "../_lib/helpers";
import type {
  ContractStatus,
  ContractType,
  PaymentMethod,
  PromissoryStatus,
} from "../_lib/types";
import { ReceiptPrintView } from "./print/ReceiptPrintView";
import { ChecklistPrintView } from "./print/ChecklistPrintView";
import { ContractsListSection } from "./ContractsListSection";
import { NewContractModal } from "./modals/NewContractModal";
import { EditContractModal } from "./modals/EditContractModal";
import { SuspendContractModal } from "./modals/SuspendContractModal";
import { CloseContractModal } from "./modals/CloseContractModal";
import { ContractDetailModal } from "./modals/ContractDetailModal";

export function ContractsPageContent() {
`;

let body = logic;

// Update helper calls
body = body
  .replace(/const getDriver\s+= \(id: string\) => drivers\.find\(d => d\.id === id\);/g, "")
  .replace(/const getVehicle\s+= \(id: string\) => vehicles\.find\(v => v\.id === id\);/g, "")
  .replace(/const getDriverName\s+= \(id: string\) => getDriver\(id\)\?\.name\s+\|\| `\(\$\{id\?\.substr\(0, 6\)\}\)`;/g, "")
  .replace(/const getVehicleInfo = \(id: string\) => \{ const v = getVehicle\(id\); return v \? `\$\{v\.brand\} \$\{v\.model\} \(\$\{v\.plate\}\)` : `\(\$\{id\?\.substr\(0, 6\)\}\)`; \};/g, "")
  .replace(/const getDriverLocks = \(id: string\): string\[\] => getDriver\(id\)\?\.activeLocks \|\| \[\];/g, "")
  .replace(/const getInterpolatedBody = \(templateId: string, driverId: string, vehicleId: string, dailyRate: number\) => \{[\s\S]*?\};/g, "");

body = body.replace(/getDriver\(([^,)]+)\)/g, "getDriver(drivers, $1)");
body = body.replace(/getVehicle\(([^,)]+)\)/g, "getVehicle(vehicles, $1)");
body = body.replace(/getDriverName\(([^,)]+)\)/g, "getDriverName(drivers, $1)");
body = body.replace(/getVehicleInfo\(([^,)]+)\)/g, "getVehicleInfo(vehicles, $1)");
body = body.replace(/getDriverLocks\(([^,)]+)\)/g, "getDriverLocks(drivers, $1)");
body = body.replace(/getDriver\(drivers, drivers,/g, "getDriver(drivers,");
body = body.replace(/getVehicle\(vehicles, vehicles,/g, "getVehicle(vehicles,");
body = body.replace(/getDriverName\(drivers, drivers,/g, "getDriverName(drivers,");
body = body.replace(/getVehicleInfo\(vehicles, vehicles,/g, "getVehicleInfo(vehicles,");
body = body.replace(/getDriverLocks\(drivers, drivers,/g, "getDriverLocks(drivers,");
body = body.replace(
  /getInterpolatedBody\((formData\.templateId[^)]*)\)/g,
  "getInterpolatedBody(templates, drivers, vehicles, $1)"
);

body = body.replace(
  /CHECKLIST_ITEMS_DEFAULT\.map\(label => \(\{ label, checked: false, obs: "" \}\)\)/g,
  "createDefaultChecklistItems()"
);
body = body.replace(
  /const resetNewForm = \(\) => setFormData\(\{[\s\S]*?\}\);/,
  "const resetNewForm = () => setFormData(createDefaultNewContractForm());"
);
body = body.replace(
  /useState\(\{\s*driverId: "", vehicleId: "", templateId: "",[\s\S]*?notes: ""\s*\}\)/,
  "useState(createDefaultNewContractForm())"
);
body = body.replace(
  /useState\(\{\s*date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\], amount: "", period: "", type: "Mensal",[\s\S]*?notes: ""\s*\}\)/,
  "useState(createDefaultReceiptForm())"
);
body = body.replace(
  /useState\(\{\s*promissoryNumber: "", dueDate: "", amount: "",[\s\S]*?status: "Pendente"\s*\}\)/,
  "useState(createDefaultPromissoryForm())"
);
body = body.replace(
  /useState\(\{\s*type: "Renovação", description: "", newEndDate: "", newDailyRate: "", signatureToken: ""\s*\}\)/,
  "useState(createDefaultAddendumForm())"
);
body = body.replace(
  /setReceiptForm\(\{ date: new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\], amount: "", period: "", type: "Mensal", paymentMethod: "PIX", notes: "" \}\);/,
  "setReceiptForm(createDefaultReceiptForm());"
);
body = body.replace(
  /setPromissoryForm\(\{ promissoryNumber: "", dueDate: "", amount: "", description: "", checkNumber: "", bankName: "", status: "Pendente" \}\);/,
  "setPromissoryForm(createDefaultPromissoryForm());"
);
body = body.replace(
  /setAddendumForm\(\{ type: "Renovação", description: "", newEndDate: "", newDailyRate: "", signatureToken: "" \}\);/,
  "setAddendumForm(createDefaultAddendumForm());"
);
body = body.replace(
  /setChecklistItems\(CHECKLIST_ITEMS_DEFAULT\.map\(label => \(\{ label, checked: false, obs: "" \}\)\)\);/,
  "setChecklistItems(createDefaultChecklistItems());"
);

const render = `
  if (printingReceipt) {
    const contract = contracts.find((c) => c.id === printingReceipt.contractId);
    return (
      <ReceiptPrintView
        printingReceipt={printingReceipt}
        driver={getDriver(drivers, printingReceipt.driverId)}
        vehicle={getVehicle(vehicles, contract?.vehicleId)}
        onBack={() => setPrintingReceipt(null)}
      />
    );
  }

  if (printingChecklist) {
    return (
      <ChecklistPrintView
        printingChecklist={printingChecklist}
        driver={getDriver(drivers, printingChecklist.driverId)}
        vehicle={getVehicle(vehicles, printingChecklist.vehicleId)}
        onBack={() => setPrintingChecklist(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ContractsListSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        filteredContracts={filteredContracts}
        loading={loading}
        metrics={metrics}
        receipts={receipts}
        promissories={promissories}
        checklists={checklists}
        drivers={drivers}
        vehicles={vehicles}
        can={can}
        onOpenDetail={openContractDetail}
        onEdit={openEditContract}
        onSuspend={setSuspendModal}
        onClose={(contract) => { setClosingContract(contract); setCloseForm({ amountPaid: 0, notes: "" }); }}
        onReactivate={handleReactivate}
        onRescind={handleRescind}
        onNewContract={() => { resetNewForm(); setIsNewModalOpen(true); }}
      />

      {isNewModalOpen && (
        <NewContractModal
          formData={formData}
          setFormData={setFormData}
          drivers={drivers}
          vehicles={availableVehicles}
          templates={templates}
          profiles={profiles}
          onClose={() => setIsNewModalOpen(false)}
          onSubmit={handleCreate}
          getDriverLocks={(id) => getDriverLocks(drivers, id)}
          getInterpolatedBody={(templateId, driverId, vehicleId, dailyRate) =>
            getInterpolatedBody(templates, drivers, vehicles, templateId, driverId, vehicleId, dailyRate)
          }
        />
      )}

      {editingContract && (
        <EditContractModal
          editingContract={editingContract}
          editForm={editForm}
          setEditForm={setEditForm}
          driverName={getDriverName(drivers, editingContract.driverId)}
          onClose={() => setEditingContract(null)}
          onSubmit={handleEditContract}
        />
      )}

      {suspendModal && (
        <SuspendContractModal
          contract={suspendModal}
          driverName={getDriverName(drivers, suspendModal.driverId)}
          suspendReason={suspendReason}
          setSuspendReason={setSuspendReason}
          onClose={() => { setSuspendModal(null); setSuspendReason(""); }}
          onSubmit={handleSuspend}
        />
      )}

      {closingContract && (
        <CloseContractModal
          contract={closingContract}
          driverName={getDriverName(drivers, closingContract.driverId)}
          vehicleInfo={getVehicleInfo(vehicles, closingContract.vehicleId)}
          closeForm={closeForm}
          setCloseForm={setCloseForm}
          onClose={() => setClosingContract(null)}
          onSubmit={handleClose}
        />
      )}

      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          drivers={drivers}
          vehicles={vehicles}
          receipts={receipts}
          promissories={promissories}
          checklists={checklists}
          addendums={addendums}
          timeline={timeline}
          activeDetailTab={activeDetailTab}
          setActiveDetailTab={setActiveDetailTab}
          can={can}
          onClose={() => setSelectedContract(null)}
          onEdit={openEditContract}
          receiptForm={receiptForm}
          setReceiptForm={setReceiptForm}
          promissoryForm={promissoryForm}
          setPromissoryForm={setPromissoryForm}
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
          addendumForm={addendumForm}
          setAddendumForm={setAddendumForm}
          onPrintReceipt={setPrintingReceipt}
          onCancelReceipt={handleCancelReceipt}
          onAddReceipt={handleAddReceipt}
          onPromissoryStatus={handlePromissoryStatus}
          onAddPromissory={handleAddPromissory}
          onPrintChecklist={setPrintingChecklist}
          onSubmitChecklist={handleSubmitChecklist}
          onAddAddendum={handleAddAddendum}
        />
      )}
    </div>
  );
}
`;

const output = header + body + render;
fs.writeFileSync(path.join(ROOT, "_components/ContractsPageContent.tsx"), output);
console.log("ContractsPageContent.tsx written:", output.split("\n").length, "lines");

const page = `"use client";

import { ContractsPageContent } from "./_components/ContractsPageContent";

export default function ContractsPage() {
  return <ContractsPageContent />;
}
`;
fs.writeFileSync(path.join(ROOT, "page.tsx"), page);
console.log("page.tsx updated");
