"use client";

type Props = {
  contract: any;
  timeline: any[];
};

export function AuditTab({ contract, timeline }: Props) {
  const cTimeline = timeline.filter((t) => t.entityId === contract.id && t.entityType === "contract");

  return (
  <div className="space-y-3">
    <h4 className="font-bold uppercase text-outline text-[10px]">Linha do Tempo de Auditoria</h4>
    {cTimeline.length === 0 ? (
      <p className="italic text-on-surface-variant bg-slate-50 border border-outline-variant p-4 rounded-xl">Nenhum evento registrado.</p>
    ) : (
      <div className="space-y-3">
        {cTimeline.slice().reverse().map((t: any) => (
          <div key={t.id} className="relative pl-6 border-l border-outline-variant py-2">
            <span className="absolute -left-1.5 top-3.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            <p className="font-bold text-primary text-xs">{t.title}</p>
            <p className="text-on-surface-variant mt-0.5 text-[10px]">{t.description}</p>
            <div className="flex items-center gap-2 mt-1 text-[9px] text-outline font-mono">
              <span>{t.createdAt ? new Date(t.createdAt).toLocaleString("pt-BR") : "—"}</span>
              <span>•</span>
              <span>{t.createdBy || "Sistema"}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  );
}
