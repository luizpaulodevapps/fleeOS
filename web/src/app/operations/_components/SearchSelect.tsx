"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, CheckCircle } from "lucide-react";

export interface SearchItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchSelectProps {
  items: SearchItem[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  items,
  value,
  onChange,
  placeholder = "Selecione...",
  label,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado",
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find(i => i.id === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return items.filter(i =>
      i.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
      (i.subtitle && i.subtitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q))
    );
  }, [items, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-outline mb-1 block">{label}</label>
      )}

      <div
        className="flex items-center gap-2 w-full pl-3 pr-3 py-2.5 text-xs border border-outline-variant rounded-lg bg-white cursor-pointer hover:border-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <div className="flex-1 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-primary">{selected.label}</span>
            {selected.subtitle && (
              <span className="text-outline ml-1">{selected.subtitle}</span>
            )}
          </div>
        ) : (
          <span className="text-outline flex-1">{placeholder}</span>
        )}
        <Search className="w-3.5 h-3.5 text-outline flex-shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-outline-variant">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <Search className="w-3.5 h-3.5 text-outline flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs outline-none placeholder:text-outline"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-outline hover:text-primary">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-outline">{emptyMessage}</div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 text-xs border-b border-outline-variant/50 hover:bg-primary/5 transition-colors flex items-center justify-between ${
                    item.id === value ? "bg-primary/10" : ""
                  }`}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div>
                    <span className="font-semibold text-primary">{item.label}</span>
                    {item.subtitle && (
                      <span className="text-outline block text-[10px]">{item.subtitle}</span>
                    )}
                  </div>
                  {item.id === value && (
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
