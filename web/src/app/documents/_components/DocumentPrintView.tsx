"use client";

import { useState } from "react";

type Props = {
  resolvedBody: string;
  templateName: string;
  category: string;
  companyName: string;
  generatedAt: string;
  generatedBy: string;
  onBack: () => void;
};

export function DocumentPrintView({
  resolvedBody,
  templateName,
  category,
  companyName,
  generatedAt,
  generatedBy,
  onBack,
}: Props) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const lines = resolvedBody.split("\n");

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("document-content");
      if (!element) return;

      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `${templateName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {category}
          </span>
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors shadow"
          >
            {generatingPdf ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">download</span>
            )}
            {generatingPdf ? "Gerando PDF..." : "Baixar PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors shadow"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Imprimir
          </button>
        </div>
      </div>

      {/* Document */}
      <div id="document-content" className="max-w-3xl mx-auto py-10 px-8">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                {companyName}
              </p>
              <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900 leading-tight">
                {templateName}
              </h1>
              <p className="text-xs text-slate-500 mt-1">{category}</p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5 mt-1">
              <p className="font-semibold">Emitido via FleetOS</p>
              <p>{generatedAt}</p>
              <p>Por: {generatedBy}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-1">
          {lines.map((line, i) => {
            const trimmed = line.trim();

            // Empty line = spacer
            if (!trimmed) return <div key={i} className="h-3" />;

            // Table rows (| ... |)
            if (trimmed.startsWith("|")) {
              const cells = trimmed.split("|").filter(Boolean).map((c) => c.trim());
              const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
              if (isSeparator) return null;
              const isHeader = i > 0 && lines[i - 1]?.trim() === "" && lines[i + 1]?.trim().startsWith("|---");
              return (
                <div key={i} className="flex border-b border-slate-200">
                  {cells.map((cell, j) => (
                    <div
                      key={j}
                      className={`flex-1 px-3 py-1.5 text-sm ${
                        isHeader ? "font-bold bg-slate-50 text-[11px] uppercase text-slate-600" : "text-slate-800"
                      }`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              );
            }

            // Section title (ALL CAPS line with no punctuation, short)
            const isTitle =
              trimmed === trimmed.toUpperCase() &&
              !trimmed.startsWith("☒") &&
              !trimmed.startsWith("☐") &&
              !trimmed.includes(":") &&
              trimmed.length < 60 &&
              trimmed.length > 2;

            if (isTitle) {
              return (
                <p key={i} className="text-sm font-black uppercase tracking-widest text-slate-900 pt-4 pb-1">
                  {trimmed}
                </p>
              );
            }

            // Checklist items
            if (trimmed.startsWith("☒") || trimmed.startsWith("☐")) {
              return (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className={`text-base font-bold ${trimmed.startsWith("☒") ? "text-emerald-600" : "text-slate-400"}`}>
                    {trimmed.startsWith("☒") ? "☒" : "☐"}
                  </span>
                  <span className="text-sm text-slate-700">{trimmed.slice(1).trim()}</span>
                </div>
              );
            }

            // Signature lines (underscores)
            if (trimmed.startsWith("___")) {
              return (
                <div key={i} className="flex gap-8 flex-wrap">
                  {trimmed
                    .split(/\s{3,}/)
                    .filter(Boolean)
                    .map((seg, j) => (
                      <div key={j} className="flex-1 min-w-[180px]">
                        <div className="border-t border-slate-400 mt-10 pt-1 text-xs text-slate-500">
                          {seg.replace(/_+/g, "").trim()}
                        </div>
                      </div>
                    ))}
                </div>
              );
            }

            // Key: value lines
            if (trimmed.includes(": ") && !trimmed.startsWith("I ") && !trimmed.startsWith("II") && !trimmed.startsWith("III")) {
              const colonIdx = trimmed.indexOf(": ");
              const key = trimmed.substring(0, colonIdx);
              const value = trimmed.substring(colonIdx + 2);
              // Skip if it looks like narrative text
              if (key.length < 40 && !key.includes(".")) {
                return (
                  <div key={i} className="flex gap-2 text-sm py-0.5">
                    <span className="font-semibold text-slate-600 shrink-0 min-w-[160px]">{key}:</span>
                    <span className="text-slate-900">{value}</span>
                  </div>
                );
              }
            }

            // Numbered clauses (I -, II -, CLÁUSULA)
            if (/^(CLÁUSULA|I{1,3}V?|VI{0,3}|IX|X) ?[–\-—]/.test(trimmed) || /^\d+\s*[–\-—]/.test(trimmed)) {
              return (
                <p key={i} className="text-sm font-bold text-slate-900 pt-3">
                  {line}
                </p>
              );
            }

            // Unresolved variable warning
            if (trimmed.includes("⚠️[")) {
              return (
                <p key={i} className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded font-medium">
                  {line}
                </p>
              );
            }

            // Default paragraph
            return (
              <p key={i} className="text-sm text-slate-800 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-14 pt-5 border-t border-slate-200 print:mt-8">
          <p className="text-[9px] text-center text-slate-400 uppercase tracking-widest">
            Documento gerado pelo sistema FleetOS em {generatedAt} por {generatedBy} — Assinatura eletrônica válida nos termos da legislação brasileira.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 20mm 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
