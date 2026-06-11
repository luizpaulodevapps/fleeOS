"use client";

import React from "react";
import { SpecsFormState } from "../_lib/types";

interface VehicleSpecsTabProps {
  formData: SpecsFormState;
  setFormData: React.Dispatch<React.SetStateAction<SpecsFormState>>;
  selectedVehicle: any | null;
  isReadOnly: (vehicle: any) => boolean;
  handleSaveSpecs: (e: React.FormEvent) => Promise<void>;
  categories: any[];
  setAcqForm: React.Dispatch<React.SetStateAction<any>>;
}

export function VehicleSpecsTab({
  formData,
  setFormData,
  selectedVehicle,
  isReadOnly,
  handleSaveSpecs,
  categories,
  setAcqForm
}: VehicleSpecsTabProps) {
  const readOnly = selectedVehicle && isReadOnly(selectedVehicle);

  // FIPE Search Local States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/fipe?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Erro ao buscar catálogo FIPE", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    let fuel = "Flex";
    const itemFuel = item.fuelType || "";
    if (itemFuel.includes("Gasolina")) fuel = "Gasolina";
    else if (itemFuel.includes("Diesel")) fuel = "Diesel";
    else if (itemFuel.includes("Elétrico") || itemFuel.includes("Híbrido")) fuel = "Elétrico";
    else if (itemFuel.includes("GNV")) fuel = "GNV";

    let suggestedCat = "";
    if (item.fleetCategory) {
      suggestedCat = item.fleetCategory.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      brand: item.brand,
      model: item.model,
      year: item.year,
      fuelType: fuel,
      family: item.family || "",
      pricingCategoryId: suggestedCat,
      maintenanceGroup: item.maintenanceGroup || "",
      fipe: {
        code: item.fipeCode,
        value: item.priceValue,
        referenceMonth: (item.referenceMonth || "").trim()
      },
      lastFipeUpdate: new Date().toISOString().split("T")[0]
    }));

    setAcqForm((prev: any) => ({
      ...prev,
      fipeAtPurchase: item.priceValue?.toString() || "",
      currentFipeValue: item.priceValue?.toString() || "",
      fipeConsultDate: new Date().toISOString().split("T")[0]
    }));

    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  return (
    <form onSubmit={handleSaveSpecs} className="space-y-6">
      {/* Autocomplete Search Bar - Only for New Vehicles */}
      {!selectedVehicle && (
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold uppercase text-outline mb-2">🔍 Importar do Catálogo FIPE</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Digite marca, modelo, família ou ano (ex: Corolla XEi 2025)..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500 shadow-sm transition-all font-medium"
          />
          {isSearching && (
            <div className="absolute right-3 top-9 flex items-center">
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(item)}
                  className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selectedIndex === index ? "bg-violet-50 text-violet-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.brand}</span> • {item.model}
                    <span className="text-[10px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-mono ml-2">{item.year}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-violet-700">{item.price}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">FIPE: {item.fipeCode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FIPE Import Confirmation Card */}
      {formData.fipe && formData.fipe.code && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              ✓
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Catálogo FleetOS</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Marca</span>
                  <span className="font-semibold text-slate-800">{formData.brand}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Modelo</span>
                  <span className="font-semibold text-slate-800">{formData.model}</span>
                </div>
                {formData.family && (
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Família</span>
                    <span className="font-semibold text-slate-800">{formData.family}</span>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Ano</span>
                  <span className="font-semibold text-slate-800">{formData.year}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Combustível</span>
                  <span className="font-semibold text-slate-800">{formData.fuelType}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Grupo Maint</span>
                  <span className="font-semibold text-slate-800">{formData.maintenanceGroup || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Código FIPE</span>
                  <span className="font-mono text-slate-800 font-semibold">{formData.fipe.code}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">FIPE</span>
                  <span className="font-semibold text-slate-850 font-bold text-violet-700">
                    {formData.fipe.value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Referência</span>
                  <span className="text-slate-800">{formData.fipe.referenceMonth}</span>
                </div>
              </div>
            </div>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  family: "",
                  pricingCategoryId: "",
                  maintenanceGroup: "",
                  fipe: {
                    code: "",
                    value: 0,
                    referenceMonth: ""
                  },
                  lastFipeUpdate: ""
                }));
              }}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 text-[11px] font-bold self-end md:self-center shrink-0 transition-colors"
            >
              Desvincular
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-brand"
            placeholder=" "
          />
          <label htmlFor="s-brand" className="text-xs font-semibold text-outline">Marca</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-model"
            placeholder=" "
          />
          <label htmlFor="s-model" className="text-xs font-semibold text-outline">Modelo</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            disabled={readOnly}
            value={formData.family || ""}
            onChange={(e) => setFormData({ ...formData, family: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-family"
            placeholder=" "
          />
          <label htmlFor="s-family" className="text-xs font-semibold text-outline">Família</label>
        </div>

        <div className="floating-label-group">
          <input
            type="number"
            required
            disabled={readOnly}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-year"
            placeholder=" "
          />
          <label htmlFor="s-year" className="text-xs font-semibold text-outline">Ano</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
            className="w-full pl-3 pr-3 text-xs uppercase"
            id="s-plate"
            placeholder=" "
          />
          <label htmlFor="s-plate" className="text-xs font-semibold text-outline">Placa</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-color"
            placeholder=" "
          />
          <label htmlFor="s-color" className="text-xs font-semibold text-outline">Cor</label>
        </div>

        <div className="floating-label-group">
          <select
            required
            disabled={readOnly}
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
            className="w-full pl-3 pr-3 text-xs appearance-none font-sans bg-transparent"
            id="s-fuel"
          >
            <option value="Flex">Flex</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diesel</option>
            <option value="GNV">GNV</option>
            <option value="Elétrico">Elétrico</option>
          </select>
          <label htmlFor="s-fuel" className="text-xs font-semibold text-outline">Combustível</label>
        </div>

        <div className="floating-label-group">
          <select
            disabled={readOnly}
            value={formData.pricingCategoryId || ""}
            onChange={(e) => setFormData({ ...formData, pricingCategoryId: e.target.value })}
            className="w-full pl-3 pr-3 text-xs appearance-none font-sans bg-transparent"
            id="s-category"
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <label htmlFor="s-category" className="text-xs font-semibold text-outline">Categoria de Precificação</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            disabled={readOnly}
            value={formData.maintenanceGroup || ""}
            onChange={(e) => setFormData({ ...formData, maintenanceGroup: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-maint-group"
            placeholder=" "
          />
          <label htmlFor="s-maint-group" className="text-xs font-semibold text-outline">Grupo de Manutenção</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.renavam}
            onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
            className="w-full pl-3 pr-3 text-xs font-mono"
            id="s-ren"
            placeholder=" "
          />
          <label htmlFor="s-ren" className="text-xs font-semibold text-outline">Renavam</label>
        </div>

        <div className="floating-label-group">
          <input
            type="text"
            required
            disabled={readOnly}
            value={formData.chassis}
            onChange={(e) => setFormData({ ...formData, chassis: e.target.value })}
            className="w-full pl-3 pr-3 text-xs font-mono"
            id="s-chass"
            placeholder=" "
          />
          <label htmlFor="s-chass" className="text-xs font-semibold text-outline">Chassis</label>
        </div>

        <div className="floating-label-group">
          <input
            type="number"
            required
            disabled={readOnly}
            value={formData.mileage}
            onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-km"
            placeholder=" "
          />
          <label htmlFor="s-km" className="text-xs font-semibold text-outline">Odorômetro KM</label>
        </div>

        <div className="floating-label-group">
          <input
            type="date"
            required
            disabled={readOnly}
            value={formData.insuranceExpiration}
            onChange={(e) => setFormData({ ...formData, insuranceExpiration: e.target.value })}
            className="w-full pl-3 pr-3 text-xs text-primary"
            id="s-ins-exp"
          />
          <label htmlFor="s-ins-exp" className="text-xs font-semibold text-outline">Vencimento Seguro</label>
        </div>

        <div className="floating-label-group">
          <input
            type="date"
            required
            disabled={readOnly}
            value={formData.registrationExpiration}
            onChange={(e) => setFormData({ ...formData, registrationExpiration: e.target.value })}
            className="w-full pl-3 pr-3 text-xs text-primary"
            id="s-crlv-exp"
          />
          <label htmlFor="s-crlv-exp" className="text-xs font-semibold text-outline">Vencimento CRLV</label>
        </div>

        <div className="floating-label-group">
          <select
            required
            disabled={readOnly}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full pl-3 pr-3 text-xs appearance-none font-sans bg-transparent"
            id="s-status"
          >
            <option value="active">Frota Ativa</option>
            <option value="locado">Locado</option>
            <option value="maintenance">Em Oficina</option>
            <option value="sinistrado">Sinistrado</option>
            <option value="baixado">Baixado (Fora da Frota)</option>
            <option value="vendido">Vendido</option>
          </select>
          <label htmlFor="s-status" className="text-xs font-semibold text-outline">Status Operacional</label>
        </div>

        <div className="md:col-span-3 floating-label-group">
          <input
            type="text"
            disabled={readOnly}
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            className="w-full pl-3 pr-3 text-xs"
            id="s-photo"
            placeholder=" "
          />
          <label htmlFor="s-photo" className="text-xs font-semibold text-outline">URL Foto Veículo</label>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2 rounded bg-primary text-on-primary font-bold text-xs"
          >
            Salvar Ficha Técnica
          </button>
        </div>
      )}
    </form>
  );
}
