"use client";

import React from "react";
import { AlertOctagon } from "lucide-react";

interface AttentionSectionProps {
  alerts: string[];
}

export function AttentionSection({ alerts }: AttentionSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 text-red-700">
        <AlertOctagon className="w-5 h-5 animate-bounce" />
        <h3 className="font-geist text-sm font-bold uppercase tracking-wider">Atenção Hoje (Pendências Críticas)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-2 bg-white/70 backdrop-blur border border-red-500/10 p-3 rounded-lg text-xs font-medium text-red-900 shadow-sm hover:bg-white transition-colors"
          >
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0 animate-ping"></span>
            <span>{alert}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
