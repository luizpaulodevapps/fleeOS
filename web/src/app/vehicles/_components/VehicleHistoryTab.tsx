"use client";

import React from "react";

interface VehicleHistoryTabProps {
  selectedVehicle: any;
  timeline: any[];
}

export function VehicleHistoryTab({
  selectedVehicle,
  timeline
}: VehicleHistoryTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Audit Logs & Timeline do Ativo</h4>
      <div className="space-y-4">
        {timeline.filter(t => t.entityType === "vehicle" && t.entityId === selectedVehicle.id).length === 0 ? (
          <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
            Sem atividades auditadas no prontuário.
          </p>
        ) : (
          timeline.filter(t => t.entityType === "vehicle" && t.entityId === selectedVehicle.id).slice().reverse().map(t => (
            <div key={t.id} className="relative pl-6 border-l border-outline-variant py-2">
              <span className="absolute -left-1.5 top-3.5 w-3 h-3 rounded-full bg-primary border border-outline-variant" />
              <div className="text-xs">
                <p className="font-bold text-primary">{t.title}</p>
                <p className="text-on-surface-variant mt-0.5">{t.description}</p>
                <div className="flex items-center space-x-2 mt-1 text-[10px] text-outline font-mono">
                  <span>{new Date(t.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>Por: {t.createdBy}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
