"use client";

import React from "react";
import { SpecsFormState } from "../_lib/types";

const getGroupedFamily = (item: any) => {
  const brand = (item.brand || "").toLowerCase();
  const family = (item.family || "").trim();
  const model = (item.model || "").trim();
  
  if (!family) {
    return model.split(/\s+/)[0] || "";
  }
  
  const famLower = family.toLowerCase();
  
  if (brand === "toyota") {
    if (famLower.startsWith("corolla cross")) return "Corolla Cross";
    if (famLower.startsWith("corolla")) return "Corolla";
    if (famLower.startsWith("yaris cross")) return "Yaris Cross";
    if (famLower.startsWith("yaris")) return "Yaris";
    if (famLower.startsWith("camry")) return "Camry";
    if (famLower.startsWith("etios")) return "Etios";
    if (famLower.startsWith("hilux sw4")) return "Hilux SW4";
    if (famLower.startsWith("hilux cd")) return "Hilux CD";
    if (famLower.startsWith("hilux cs")) return "Hilux CS";
  }
  
  if (brand === "byd") {
    if (famLower.startsWith("dolphin mini")) return "Dolphin Mini";
    if (famLower.startsWith("dolphin plus")) return "Dolphin Plus";
    if (famLower.startsWith("dolphin")) return "Dolphin";
    if (famLower.startsWith("song plus")) return "Song Plus";
    if (famLower.startsWith("song pro")) return "Song Pro";
    if (famLower.startsWith("song")) return "Song";
    if (famLower.startsWith("king")) return "King";
    if (famLower.startsWith("atto")) return "Atto";
    if (famLower.startsWith("seal")) return "Seal";
    if (famLower.startsWith("han")) return "Han";
  }

  if (brand === "gwm") {
    if (famLower.startsWith("haval h6")) return "Haval H6";
    if (famLower.startsWith("haval")) return "Haval";
    if (famLower.startsWith("poer")) return "Poer";
  }

  if (brand === "honda") {
    if (famLower.startsWith("city hatchback")) return "City Hatchback";
    if (famLower.startsWith("city sedan")) return "City Sedan";
    if (famLower.startsWith("city")) return "City";
    if (famLower.startsWith("civic")) return "Civic";
    if (famLower.startsWith("accord")) return "Accord";
    if (famLower.startsWith("hr-v") || famLower.startsWith("hrv")) return "HR-V";
  }

  if (brand === "hyundai") {
    if (famLower.startsWith("hb20s")) return "HB20S";
    if (famLower.startsWith("hb20")) return "HB20";
    if (famLower.startsWith("creta")) return "Creta";
    if (famLower.startsWith("azera")) return "Azera";
    if (famLower.startsWith("tucson")) return "Tucson";
  }

  if (brand === "jeep") {
    if (famLower.startsWith("compass")) return "Compass";
    if (famLower.startsWith("renegade")) return "Renegade";
    if (famLower.startsWith("commander")) return "Commander";
  }

  if (brand === "citroën" || brand === "citroen") {
    if (famLower.startsWith("aircross7")) return "Aircross 7";
    if (famLower.startsWith("aircross")) return "Aircross";
    if (famLower.startsWith("basalt")) return "Basalt";
    if (famLower.startsWith("c3")) return "C3";
    if (famLower.startsWith("c4")) return "C4";
  }

  if (brand === "fiat") {
    if (famLower.startsWith("argo")) return "Argo";
    if (famLower.startsWith("cronos")) return "Cronos";
    if (famLower.startsWith("mobi")) return "Mobi";
    if (famLower.startsWith("toro")) return "Toro";
    if (famLower.startsWith("pulse")) return "Pulse";
    if (famLower.startsWith("fastback")) return "Fastback";
    if (famLower.startsWith("fiorino")) return "Fiorino";
    if (famLower.startsWith("strada")) return "Strada";
  }

  if (brand === "chevrolet" || brand === "gm") {
    if (famLower.startsWith("onix plus")) return "Onix Plus";
    if (famLower.startsWith("onix")) return "Onix";
    if (famLower.startsWith("tracker")) return "Tracker";
    if (famLower.startsWith("spin")) return "Spin";
    if (famLower.startsWith("cruze")) return "Cruze";
    if (famLower.startsWith("s10")) return "S10";
  }

  if (brand === "volkswagen" || brand === "vw") {
    if (famLower.startsWith("polo")) return "Polo";
    if (famLower.startsWith("virtus")) return "Virtus";
    if (famLower.startsWith("nivus")) return "Nivus";
    if (famLower.startsWith("t-cross") || famLower.startsWith("tcross")) return "T-Cross";
    if (famLower.startsWith("taos")) return "Taos";
    if (famLower.startsWith("gol")) return "Gol";
    if (famLower.startsWith("saveiro")) return "Saveiro";
    if (famLower.startsWith("amarok")) return "Amarok";
  }

  const words = family.split(/\s+/);
  if (words.length > 1) {
    const second = words[1].toLowerCase();
    if (["cross", "plus", "mini", "pro", "hatchback", "sedan", "ev"].includes(second)) {
      return `${words[0]} ${words[1]}`;
    }
  }

  return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
};

const getTrimName = (model: string, familyGroup: string) => {
  let trim = model;
  if (trim.toLowerCase().startsWith(familyGroup.toLowerCase())) {
    trim = trim.slice(familyGroup.length).trim();
  }
  return trim;
};

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

  // Import mode tab: "guided" | "direct"
  const [importMode, setImportMode] = React.useState<"guided" | "direct">("guided");

  // Guided select lists and selections
  const [brandsList, setBrandsList] = React.useState<string[]>([]);
  const [modelsList, setModelsList] = React.useState<string[]>([]);
  const [versionsList, setVersionsList] = React.useState<any[]>([]);
  const [allBrandEntries, setAllBrandEntries] = React.useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedVersion, setSelectedVersion] = React.useState<any | null>(null);

  // For text search fallback (Direct Search)
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Preview / Pending import vehicle object
  const [pendingImportVeh, setPendingImportVeh] = React.useState<any | null>(null);

  // Fetch unique brands list on mount
  React.useEffect(() => {
    if (!selectedVehicle) {
      fetch("/api/fipe?brands=true")
        .then((res) => res.json())
        .then((data) => setBrandsList(data))
        .catch((err) => console.error("Erro ao carregar marcas", err));
    }
  }, [selectedVehicle]);

  // Fetch all items for selectedBrand and extract general models
  React.useEffect(() => {
    if (selectedBrand) {
      setModelsList([]);
      setVersionsList([]);
      setSelectedModel("");
      setSelectedVersion(null);
      setPendingImportVeh(null);
      setAllBrandEntries([]);
      
      fetch(`/api/fipe?brand=${encodeURIComponent(selectedBrand)}`)
        .then((res) => res.json())
        .then((data: any[]) => {
          setAllBrandEntries(data);
          
          // Group by family base name
          const uniqueModels = Array.from(
            new Set(data.map((item) => getGroupedFamily(item)))
          )
            .filter(Boolean)
            .sort();
            
          setModelsList(uniqueModels);
        })
        .catch((err) => console.error("Erro ao carregar modelos da marca", err));
    } else {
      setAllBrandEntries([]);
      setModelsList([]);
      setVersionsList([]);
    }
  }, [selectedBrand]);

  // Filter versions (items) when selectedModel (family) changes
  React.useEffect(() => {
    if (selectedModel && allBrandEntries.length > 0) {
      setSelectedVersion(null);
      setPendingImportVeh(null);
      
      // Filter entries where grouped family matches selectedModel
      const filtered = allBrandEntries.filter(
        (item) => getGroupedFamily(item) === selectedModel
      );
      
      // Sort by year descending, then by priceValue descending
      filtered.sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year;
        }
        return b.priceValue - a.priceValue;
      });
      
      setVersionsList(filtered);
    } else {
      setVersionsList([]);
    }
  }, [selectedModel, allBrandEntries]);

  // Handle outside dropdown clicks for direct search mode
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
        const selected = suggestions[selectedIndex];
        setPendingImportVeh(selected);
        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleVersionIndexSelect = (indexStr: string) => {
    if (indexStr === "") {
      setSelectedVersion(null);
      setPendingImportVeh(null);
      return;
    }
    const idx = parseInt(indexStr, 10);
    const matched = versionsList[idx];
    if (matched) {
      setSelectedVersion(matched);
      setPendingImportVeh(matched);
    }
  };

  const handleImportConfirm = () => {
    if (!pendingImportVeh) return;
    const item = pendingImportVeh;

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
      family: getGroupedFamily(item),
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

    setPendingImportVeh(null);
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedVersion(null);
    setSearchQuery("");
    setSuggestions([]);
    
    alert("Dados do modelo FIPE importados com sucesso!");
  };

  // Direct autocomplete search trigger
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

  return (
    <form onSubmit={handleSaveSpecs} className="space-y-6">
      {/* FIPE Import Section - Only for New Vehicles */}
      {!selectedVehicle && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>🔍 IMPORTAR DO CATÁLOGO FIPE</span>
            </h4>
            <div className="flex bg-slate-200 rounded-lg p-0.5 border border-slate-300 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setImportMode("guided");
                  setPendingImportVeh(null);
                }}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  importMode === "guided"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Seleção Guiada
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMode("direct");
                  setPendingImportVeh(null);
                }}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  importMode === "direct"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Busca Direta
              </button>
            </div>
          </div>

          {/* Mode 1: Guided Selection */}
          {importMode === "guided" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-semibold focus:border-slate-500 outline-none"
                >
                  <option value="">Selecione uma marca...</option>
                  {(Array.isArray(brandsList) ? brandsList : []).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Modelo</label>
                <select
                  disabled={!selectedBrand}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-semibold focus:border-slate-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um modelo...</option>
                  {(Array.isArray(modelsList) ? modelsList : []).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Versão</label>
                <select
                  disabled={!selectedModel}
                  value={selectedVersion ? versionsList.indexOf(selectedVersion) : ""}
                  onChange={(e) => handleVersionIndexSelect(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-semibold focus:border-slate-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione a versão...</option>
                  {(Array.isArray(versionsList) ? versionsList : []).map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.year} {v.fuelType} - {getTrimName(v.model, selectedModel)} - {v.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Mode 2: Direct Search Autocomplete */}
          {importMode === "direct" && (
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buscar no Catálogo</label>
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
                className="w-full px-4 py-2 bg-white border border-slate-250 rounded-lg text-xs outline-none focus:border-slate-500 font-semibold"
              />
              {isSearching && (
                <div className="absolute right-3 top-8 flex items-center">
                  <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
                  {(Array.isArray(suggestions) ? suggestions : []).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setPendingImportVeh(item);
                        setSearchQuery("");
                        setSuggestions([]);
                        setShowDropdown(false);
                      }}
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
          {pendingImportVeh && (
            <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  ✓
                </div>
                <div className="flex-1">
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Catálogo FleetOS</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mt-3 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Marca</span>
                      <span className="font-semibold text-slate-800">{pendingImportVeh.brand}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Família</span>
                      <span className="font-semibold text-slate-800">{getGroupedFamily(pendingImportVeh)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Versão</span>
                      <span className="font-semibold text-slate-800">{getTrimName(pendingImportVeh.model, getGroupedFamily(pendingImportVeh))}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Categoria</span>
                      <span className="font-semibold text-slate-800">{pendingImportVeh.fleetCategory || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Combustível</span>
                      <span className="font-semibold text-slate-800">{pendingImportVeh.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">FIPE</span>
                      <span className="font-bold text-violet-750">{pendingImportVeh.price}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Referência</span>
                      <span className="font-semibold text-slate-800">{pendingImportVeh.referenceMonth}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Grupo Maint</span>
                      <span className="font-semibold text-slate-800">{pendingImportVeh.maintenanceGroup || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setPendingImportVeh(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px] font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportConfirm}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span>✓ Importar Dados</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unlink/Imported FIPE Confirmation Card */}
      {formData.fipe && formData.fipe.code && !pendingImportVeh && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
              ✓
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Vinculado ao Catálogo FIPE</h5>
              <p className="text-xs text-slate-650 mt-1">
                Veículo homologado com o código FIPE <span className="font-mono font-bold text-slate-850">{formData.fipe.code}</span> (Ref: {formData.fipe.referenceMonth}).
              </p>
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
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 text-[11px] font-bold transition-colors"
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
            {(Array.isArray(categories) ? categories : []).map((c) => (
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
