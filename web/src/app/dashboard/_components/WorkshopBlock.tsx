"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

interface WorkshopBlockProps {
  calculations: any;
  inventory: any[];
  workOrders: any[];
  vehicles: any[];
}

export function WorkshopBlock({ calculations, inventory, workOrders, vehicles }: WorkshopBlockProps) {
  const router = useRouter();

  return (
    <div className="space-y-stack-lg animate-fade-in">
      
      {/* Workshop KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Veículos parados na Oficina</span>
          <div className="text-2xl font-black font-geist text-primary">
            {calculations.maintenanceVehicles}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">Aguardando reparos / liberação</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Itens em Estoque Crítico</span>
          <div className="text-2xl font-black font-geist text-error">
            {inventory.filter(i => i.currentQty < i.minQty).length}
          </div>
          <span className="text-[10px] text-error font-medium mt-1 block">Necessita reposição urgente de insumos</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Ordens de Serviço Abertas</span>
          <div className="text-2xl font-black font-geist text-amber-600">
            {workOrders.filter(w => w.status === "in_progress").length}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">OS sob execução</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        
        {/* Active Work Orders */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary">🔧 Ordens de Serviço sob Operação</h3>
            <button 
              onClick={() => router.push("/maintenance")}
              className="text-primary text-[10px] font-bold hover:underline"
            >
              Gerenciar Oficina
            </button>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {workOrders.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">Nenhuma OS aberta.</p>
            ) : (
              workOrders.slice(0, 3).map((wo) => {
                const veh = vehicles.find(v => v.id === wo.vehicleId);
                return (
                  <div key={wo.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-primary">{wo.description}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {veh ? `${veh.brand} ${veh.model} (${veh.plate})` : ''} • KM: {wo.mileage?.toLocaleString()}
                      </p>
                    </div>
                    <span className={wo.status === "completed" ? "px-2 py-0.5 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase" : "px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full text-[9px] font-black uppercase"}>
                      {wo.status === "completed" ? "Concluído" : "Execução"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Critical Inventory */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary">📦 Peças e Insumos em Alerta</h3>
            <span className="text-[9px] bg-error/10 text-error px-2 py-0.5 rounded font-black uppercase">Reposição</span>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {inventory.filter(i => i.currentQty < i.minQty).map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-primary">{item.name}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Código: {item.code} • Unidade: {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-error">{item.currentQty} {item.unit}</p>
                  <p className="text-[9px] text-outline">Mínimo: {item.minQty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
