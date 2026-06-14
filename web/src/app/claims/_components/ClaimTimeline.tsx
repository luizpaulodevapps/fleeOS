"use client";

import React from "react";
import { ClaimTimelineEvent } from "../_lib/types";
import { History, User, Calendar } from "lucide-react";

interface ClaimTimelineProps {
  events: ClaimTimelineEvent[];
  loading?: boolean;
}

export function ClaimTimeline({ events, loading = false }: ClaimTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-surface-container-lowest border rounded-xl min-h-[150px]">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mr-2"></div>
        <span className="text-xs text-on-surface-variant">Carregando histórico do sinistro...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
        <History className="w-5 h-5 text-primary animate-pulse" />
        <div>
          <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
            Dossiê Digital - Histórico e Auditoria
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Logs automatizados de todas as ações e transações efetuadas neste processo.
          </p>
        </div>
      </div>

      <div className="relative border-l border-outline-variant/60 ml-3 pl-6 space-y-6 pt-2 pb-2">
        {events.length === 0 ? (
          <div className="text-center text-outline py-6 text-xs italic">
            Nenhum evento registrado na linha do tempo ainda.
          </div>
        ) : (
          events.map((event, idx) => {
            const formattedDate = new Date(event.createdAt).toLocaleString("pt-BR");
            return (
              <div key={event.id || idx} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background z-10 group-hover:scale-125 transition-transform" />

                <div className="bg-slate-50 border border-outline-variant/60 p-4 rounded-xl shadow-sm space-y-1.5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-primary text-xs">{event.title}</span>
                    <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant font-mono">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-[11px] font-mono leading-relaxed">{event.description}</p>
                  
                  <div className="flex items-center space-x-1 text-[9px] text-outline font-semibold uppercase pt-1 border-t border-dashed border-outline-variant/30">
                    <User className="w-2.5 h-2.5" />
                    <span>Realizado por: {event.createdBy}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
