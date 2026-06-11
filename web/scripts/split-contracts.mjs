import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "web/src/app/contracts");
const ORIGINAL = path.join(ROOT, "page.tsx");
const lines = fs.readFileSync(ORIGINAL, "utf8").split(/\r?\n/);

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function write(rel, header, body) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${header}\n${body}\n`, "utf8");
  console.log("wrote", rel);
}

const receiptPrintBody = slice(637, 686).replace(/^    /gm, "");
write(
  "_components/print/ReceiptPrintView.tsx",
  `"use client";

import { formatDate } from "../../_lib/utils";

type Props = {
  printingReceipt: any;
  driver: any;
  vehicle: any;
  onBack: () => void;
};

export function ReceiptPrintView({ printingReceipt, driver, vehicle, onBack }: Props) {
  return (`,
  receiptPrintBody + "\n  );\n}"
);

const checklistPrintBody = slice(694, 751).replace(/^    /gm, "");
write(
  "_components/print/ChecklistPrintView.tsx",
  `"use client";

type Props = {
  printingChecklist: any;
  driver: any;
  vehicle: any;
  onBack: () => void;
};

export function ChecklistPrintView({ printingChecklist, driver, vehicle, onBack }: Props) {
  return (`,
  checklistPrintBody
    .replace(/setPrintingChecklist\(null\)/g, "onBack()")
    + "\n  );\n}"
);

console.log("Done extracting print views");
