"use client";

import React, { useState } from "react";
import { DAMAGE_REGIONS } from "../_lib/constants";
import { AlertCircle, CheckCircle, FlameKindling, Camera, Trash2, ShieldAlert } from "lucide-react";

interface DamageMapItem {
  region: string;
  severity: string;
  description: string;
}

interface EvidencePhoto {
  fileType: string;
  fileUrl: string;
  uploadedBy?: string;
  uploadedAt?: string;
  device?: string;
  gps?: { lat: number; lng: number };
  fileHash?: string;
}

interface VehicleDamageMapProps {
  value: DamageMapItem[];
  onChange: (newValue: DamageMapItem[]) => void;
  photos?: EvidencePhoto[];
  onPhotosChange?: (newPhotos: EvidencePhoto[]) => void;
  readOnly?: boolean;
}

export function VehicleDamageMap({ 
  value, 
  onChange, 
  photos = [], 
  onPhotosChange, 
  readOnly = false 
}: VehicleDamageMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  const getRegionStatus = (regionId: string) => {
    return value.find((item) => item.region === regionId);
  };

  const handleRegionClick = (regionId: string) => {
    if (readOnly) return;
    const existing = getRegionStatus(regionId);
    setSelectedRegion(regionId);
    if (existing) {
      setSeverity(existing.severity);
      setDescription(existing.description);
    } else {
      setSeverity("medium");
      setDescription("");
    }
  };

  const handleSaveDamage = () => {
    if (!selectedRegion) return;
    const otherItems = value.filter((item) => item.region !== selectedRegion);
    
    if (severity === "none") {
      onChange(otherItems);
    } else {
      onChange([
        ...otherItems,
        {
          region: selectedRegion,
          severity,
          description: description.trim() || "Dano estrutural/estético",
        },
      ]);
    }
    setSelectedRegion(null);
    setDescription("");
  };

  // SVG region color classes (severity dependent)
  const getRegionFillColor = (regionId: string) => {
    const status = getRegionStatus(regionId);
    const isSelected = selectedRegion === regionId;

    if (status) {
      switch (status.severity) {
        case "light":
          return isSelected ? "fill-amber-500/50 stroke-amber-600 stroke-[3px]" : "fill-amber-500/30 stroke-amber-500 stroke-[2px]";
        case "medium":
          return isSelected ? "fill-orange-500/60 stroke-orange-600 stroke-[3px]" : "fill-orange-500/40 stroke-orange-500 stroke-[2px]";
        case "severe":
          return isSelected ? "fill-red-500/65 stroke-red-700 stroke-[3px] animate-pulse" : "fill-red-500/45 stroke-red-500 stroke-[2px]";
        default:
          return "fill-slate-100 hover:fill-slate-200 stroke-slate-400";
      }
    }

    if (isSelected) {
      return "fill-primary/30 stroke-primary stroke-[3px] animate-pulse";
    }

    return "fill-slate-100 hover:fill-slate-200 stroke-slate-300";
  };

  const getRegionName = (regionId: string) => {
    const r = DAMAGE_REGIONS.find((reg) => reg.id === regionId);
    return r ? r.label : regionId;
  };

  // Mock upload of claim photos
  const handleSimulatePhoto = (type: string) => {
    if (!onPhotosChange) return;
    setUploading(type);
    
    let mockUrl = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=60";
    if (type.includes("Traseira")) {
      mockUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("Painel")) {
      mockUrl = "https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("Odômetro")) {
      mockUrl = "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("CNH")) {
      mockUrl = "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("CRLV")) {
      mockUrl = "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("Vídeo")) {
      mockUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    } else if (type.includes("Áudio")) {
      mockUrl = "https://www.w3schools.com/html/horse.ogg";
    } else if (type.includes("Esq")) {
      mockUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60";
    } else if (type.includes("Dir")) {
      mockUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=60";
    }

    setTimeout(() => {
      onPhotosChange([
        ...photos.filter(p => p.fileType !== type),
        { 
          fileType: type, 
          fileUrl: mockUrl,
          uploadedBy: "João Analista (SSP)",
          uploadedAt: new Date().toISOString(),
          device: "Web Browser (Chrome/Windows)",
          gps: { lat: -23.626, lng: -46.658 },
          fileHash: `md5-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
        }
      ]);
      setUploading(null);
    }, 600);
  };

  const handleDeletePhoto = (type: string) => {
    if (!onPhotosChange) return;
    onPhotosChange(photos.filter(p => p.fileType !== type));
  };

  const getPhotoForSlot = (type: string) => {
    return photos.find(p => p.fileType === type);
  };

  return (
    <div className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
      
      {/* Title & Help Banner */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3.5">
        <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <FlameKindling className="w-4.5 h-4.5 text-primary" />
          <span>Mapeamento de Avarias & Fotos de Evidências</span>
        </h3>
        <span className="text-[10px] text-on-surface-variant italic">
          {readOnly ? "Dossier Visual (Leitura)" : "Selecione as partes no desenho para apontar danos"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CAR BLUEPRINT SVG DRAWING */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border relative min-h-[380px] shadow-inner">
          <p className="text-[9px] font-black text-outline uppercase tracking-wider mb-2.5">Vista Superior do Veículo</p>
          
          <svg 
            viewBox="0 0 240 380" 
            className="w-56 h-auto drop-shadow-md transition-all duration-300"
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4"/>
              </linearGradient>
              <linearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b"/>
                <stop offset="100%" stopColor="#0f172a"/>
              </linearGradient>
            </defs>

            {/* Tires background */}
            <rect x="34" y="65" width="12" height="34" rx="4" fill="url(#tireGrad)" />
            <rect x="194" y="65" width="12" height="34" rx="4" fill="url(#tireGrad)" />
            <rect x="34" y="275" width="12" height="34" rx="4" fill="url(#tireGrad)" />
            <rect x="194" y="275" width="12" height="34" rx="4" fill="url(#tireGrad)" />

            {/* Side Mirrors */}
            <path d="M 46 100 C 32 103, 32 115, 46 110 Z" fill="#475569" stroke="#334155" />
            <path d="M 194 100 C 208 103, 208 115, 194 110 Z" fill="#475569" stroke="#334155" />

            {/* Car body outline base */}
            <path 
              d="M 80 40 C 100 25, 140 25, 160 40 C 185 50, 185 75, 185 110 C 188 140, 188 240, 185 270 C 185 305, 185 330, 160 340 C 140 355, 100 355, 80 340 C 55 330, 55 305, 55 270 C 52 240, 52 140, 55 110 C 55 75, 55 50, 80 40 Z" 
              fill="#ffffff" 
              stroke="#64748b" 
              strokeWidth="3.5"
            />

            {/* INTERACTIVE SHAPES */}
            
            {/* FRONT AREA (Frente) */}
            <path 
              d="M 80 40 C 100 25, 140 25, 160 40 C 180 50, 180 70, 180 95 L 60 95 C 60 70, 60 50, 80 40 Z"
              onClick={() => handleRegionClick("front")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("front")}`}
            />

            {/* LEFT SIDE (Lat. Esq.) */}
            <path 
              d="M 55 95 L 90 95 L 90 275 L 55 275 Z"
              onClick={() => handleRegionClick("left_side")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("left_side")}`}
            />

            {/* RIGHT SIDE (Lat. Dir.) */}
            <path 
              d="M 150 95 L 185 95 L 185 275 L 150 275 Z"
              onClick={() => handleRegionClick("right_side")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("right_side")}`}
            />

            {/* INTERIOR/CABIN OVERLAY */}
            <path 
              d="M 90 95 L 150 95 L 150 275 L 90 275 Z"
              onClick={() => handleRegionClick("interior")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("interior")}`}
            />

            {/* ROOF OVERLAY (Teto) */}
            <path 
              d="M 90 145 L 150 145 L 150 215 L 90 215 Z"
              onClick={() => handleRegionClick("roof")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("roof")}`}
            />

            {/* REAR AREA (Traseira) */}
            <path 
              d="M 60 275 L 180 275 C 180 305, 180 330, 160 340 C 140 355, 100 355, 80 340 C 60 330, 60 305, 60 275 Z"
              onClick={() => handleRegionClick("rear")}
              className={`transition-all duration-200 cursor-pointer ${getRegionFillColor("rear")}`}
            />

            {/* Blue glass overlays for windshields and windows */}
            <path d="M 95 100 Q 120 95 145 100 L 142 135 Q 120 130 98 135 Z" fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="1" pointerEvents="none" />
            <path d="M 98 238 Q 120 242 142 238 L 145 270 Q 120 275 95 270 Z" fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="1" pointerEvents="none" />
            
            {/* Steering wheel details */}
            <ellipse cx="108" cy="142" rx="9" ry="8" stroke="#334155" strokeWidth="2" fill="none" pointerEvents="none" />

            {/* Headlights */}
            <ellipse cx="88" cy="38" rx="8" ry="4" fill="#fef08a" opacity="0.9" pointerEvents="none" />
            <ellipse cx="152" cy="38" rx="8" ry="4" fill="#fef08a" opacity="0.9" pointerEvents="none" />
            
            {/* Taillights */}
            <rect x="68" y="335" width="14" height="4" fill="#ef4444" rx="1" pointerEvents="none" />
            <rect x="158" y="335" width="14" height="4" fill="#ef4444" rx="1" pointerEvents="none" />
            
            {/* Text labels on SVG */}
            <text x="120" y="70" textAnchor="middle" fill="#334155" fontSize="8" fontWeight="bold" pointerEvents="none">FRENTE</text>
            <text x="120" y="180" textAnchor="middle" fill="#334155" fontSize="8" fontWeight="bold" pointerEvents="none">TETO</text>
            <text x="120" y="115" textAnchor="middle" fill="#475569" fontSize="7" pointerEvents="none">CABINE</text>
            <text x="120" y="315" textAnchor="middle" fill="#334155" fontSize="8" fontWeight="bold" pointerEvents="none">TRASEIRA</text>
          </svg>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION CARD & EVIDENCE PHOTOS */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Severity & Details setup card */}
          {selectedRegion ? (
            <div className="p-4 bg-slate-50 border rounded-xl space-y-3.5 shadow-sm animate-in fade-in duration-200">
              <h4 className="font-bold text-primary text-xs flex justify-between items-center border-b pb-2">
                <span>Configurar Região: {getRegionName(selectedRegion)}</span>
                <span
                  onClick={() => setSelectedRegion(null)}
                  className="text-[10px] text-outline cursor-pointer hover:underline font-bold"
                >
                  Cancelar
                </span>
              </h4>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-outline mb-1.5">
                  Gravidade da Avaria
                </label>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSeverity("none")}
                    className={`py-1.5 border rounded-lg font-bold transition-all ${
                      severity === "none" ? "bg-slate-500 text-white border-slate-600 shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Sem Danos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("light")}
                    className={`py-1.5 border rounded-lg font-bold transition-all ${
                      severity === "light" ? "bg-amber-500 text-white border-amber-600 shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Leve
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("medium")}
                    className={`py-1.5 border rounded-lg font-bold transition-all ${
                      severity === "medium" ? "bg-orange-500 text-white border-orange-600 shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Média
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("severe")}
                    className={`py-1.5 border rounded-lg font-bold transition-all ${
                      severity === "severe" ? "bg-red-500 text-white border-red-600 shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Grave
                  </button>
                </div>
              </div>

              {severity !== "none" && (
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-outline mb-1.5">
                    Descrição do Dano
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Amassado pronunciado com quebra da pintura..."
                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveDamage}
                className="w-full py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                Salvar Avaria
              </button>
            </div>
          ) : (
            <div className="p-5 text-center bg-slate-50 border border-dashed rounded-xl space-y-2 text-outline">
              <AlertCircle className="w-6 h-6 text-outline mx-auto" />
              <p className="text-[10px] font-bold uppercase">Nenhuma parte selecionada</p>
              <p className="text-[9px] leading-relaxed">
                {readOnly
                  ? "Dossiê visual de avarias persistido."
                  : "Clique em qualquer região do carro à esquerda para registrar danos."}
              </p>
            </div>
          )}

          {/* EVIDENCE PHOTOS BLOCK */}
          {onPhotosChange && (
            <div className="bg-slate-50 border border-outline-variant/60 p-4.5 rounded-xl space-y-3 shadow-sm">
              <p className="text-[10px] font-black uppercase text-outline flex items-center gap-1">
                <Camera className="w-4 h-4 text-primary" />
                <span>Fotos de Evidência do Sinistro</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Foto Frente",
                  "Foto Traseira",
                  "Foto Painel",
                  "Foto Odômetro",
                  "Foto CNH",
                  "Foto CRLV",
                  "Vídeo Ocorrência",
                  "Áudio Relato"
                ].map(slot => {
                  const photo = getPhotoForSlot(slot);
                  const isMedia = slot.includes("Vídeo") || slot.includes("Áudio");
                  return (
                    <div 
                      key={slot} 
                      className={`border rounded-lg p-2 flex flex-col justify-between text-center relative min-h-[110px] transition-all overflow-hidden ${
                        photo 
                          ? "bg-white border-emerald-500/30 shadow-sm" 
                          : "bg-white border-dashed border-outline-variant hover:bg-slate-100/30"
                      }`}
                    >
                      {photo ? (
                        <>
                          {slot.includes("Vídeo") ? (
                            <div className="w-full h-14 rounded overflow-hidden mb-1 bg-slate-900 flex items-center justify-center text-[10px] text-white font-mono">
                              🎬 Video.mp4
                            </div>
                          ) : slot.includes("Áudio") ? (
                            <div className="w-full h-14 rounded overflow-hidden mb-1 bg-slate-100 flex items-center justify-center text-[10px] text-primary font-mono">
                              🎵 Audio.ogg
                            </div>
                          ) : (
                            <div className="w-full h-14 rounded overflow-hidden mb-1 bg-slate-100">
                              <img src={photo.fileUrl} alt={slot} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 text-[8px] text-left leading-tight text-on-surface-variant font-mono">
                            <span className="font-bold text-primary truncate">{slot}</span>
                            <span className="text-[7px] text-emerald-600 truncate">Custódia OK</span>
                          </div>
                          {!readOnly && (
                            <button 
                              type="button"
                              onClick={() => handleDeletePhoto(slot)}
                              className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 p-0.5 rounded shadow-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-between h-full py-1">
                          <Camera className="w-4 h-4 text-outline mb-0.5" />
                          <span className="text-[8px] font-bold text-outline leading-tight">{slot}</span>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleSimulatePhoto(slot)}
                              disabled={uploading !== null}
                              className="mt-1 px-1.5 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-black text-[8px] rounded uppercase"
                            >
                              {uploading === slot ? "..." : "Simular"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List of Registered Damages */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-outline">Avarias Registradas ({value.length})</p>
            {value.length === 0 ? (
              <p className="text-[10px] italic text-outline py-2">Nenhum dano mapeado ainda.</p>
            ) : (
              <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 font-medium">
                {value.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-surface-container-low border border-outline-variant/60 px-3 py-2 rounded-lg text-[10px]"
                  >
                    <div>
                      <span className="font-bold text-primary">{getRegionName(item.region)}</span>
                      <span className="text-on-surface-variant font-mono block text-[9px]">{item.description}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase border ${
                      item.severity === "light" 
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : item.severity === "medium"
                        ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
                    }`}>
                      {item.severity === "light" ? "Leve" : item.severity === "medium" ? "Média" : "Grave"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
