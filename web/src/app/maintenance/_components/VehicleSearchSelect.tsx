"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

type Props = {
  vehicles: any[];
  value: string;
  onChange: (vehicleId: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function VehicleSearchSelect({ vehicles, value, onChange, disabled, required }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = vehicles.find((v) => v.id === value);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
    return vehicles.filter((v) => {
      const plate = String(v.plate || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const brand = String(v.brand || "").toLowerCase();
      const model = String(v.model || "").toLowerCase();
      const code = String(v.internalCode || v.prefix || "").toLowerCase();
      return plate.includes(q) || brand.includes(q) || model.includes(q) || code.includes(q);
    }).slice(0, 10);
  }, [query, vehicles]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayVehicle = (v: any) => {
    const code = v.internalCode || v.prefix || "";
    if (code) return `${v.brand} ${v.model} (${v.plate}) · ${code}`;
    return `${v.brand} ${v.model} (${v.plate})`;
  };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/30 rounded-lg text-xs">
          <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
            {selected.plate?.charAt(0) || "?"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">
              {selected.brand} {selected.model}
            </p>
            <p className="text-[10px] text-slate-500">
              {selected.plate}{selected.internalCode || selected.prefix ? ` · ${selected.internalCode || selected.prefix}` : ""} · {selected.mileage?.toLocaleString("pt-BR") || "0"} KM
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => { onChange(""); setQuery(""); }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            value={query}
            required={required && !value}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por placa, modelo, marca..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          {open && query.length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {results.length === 0 ? (
                <p className="p-3 text-[10px] text-slate-400 text-center">Nenhum veículo encontrado.</p>
              ) : (
                results.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => { onChange(v.id); setQuery(""); setOpen(false); }}
                    className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-primary/5 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600 shrink-0">
                      {v.plate?.charAt(0) || "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">{v.brand} {v.model}</p>
                      <p className="text-[9px] text-slate-500">
                        {v.plate}{v.internalCode || v.prefix ? ` · ${v.internalCode || v.prefix}` : ""} · {v.mileage?.toLocaleString("pt-BR") || "0"} KM
                      </p>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      v.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      v.status === "maintenance" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {v.status === "active" ? "Ativo" : v.status === "maintenance" ? "Oficina" : v.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
