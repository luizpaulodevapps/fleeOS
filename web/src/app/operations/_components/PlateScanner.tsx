"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, AlertTriangle, Loader2 } from "lucide-react";

interface PlateScannerProps {
  onScan: (plate: string) => void;
  onClose: () => void;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode("plate-scanner-viewport");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.7778,
        },
        (decodedText) => {
          if (cooldownRef.current) return;
          cooldownRef.current = true;

          const normalized = decodedText.toUpperCase().replace(/[^A-Z0-9]/g, "");
          setLastCode(normalized);
          setScanning(false);

          setTimeout(() => {
            try { scanner.stop(); } catch {}
            onScan(normalized);
          }, 800);
        },
        () => {}
      )
      .catch((err) => {
        console.error("Camera init error:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      });

    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-bold">Escanear Placa do Veículo</span>
          </div>
          <button
            onClick={() => {
              try { scannerRef.current?.stop(); } catch {}
              try { scannerRef.current?.clear(); } catch {}
              onClose();
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner viewport */}
        <div className="relative bg-black aspect-video">
          <div id="plate-scanner-viewport" ref={containerRef} className="w-full h-full" />

          {/* Scanning overlay guide */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-20 border-2 border-dashed border-white/60 rounded-xl flex items-center justify-center">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Alinhe a placa aqui
                </span>
              </div>
            </div>
          )}

          {/* Success overlay */}
          {!scanning && lastCode && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center gap-2">
              <div className="bg-white rounded-xl px-6 py-3 shadow-lg">
                <span className="font-mono font-black text-2xl text-slate-900 tracking-widest">
                  {lastCode}
                </span>
              </div>
              <span className="text-white/90 text-xs font-bold">Placa identificada!</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="p-4">
          {error ? (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : scanning ? (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando leitura da placa...</span>
            </div>
          ) : null}

          <button
            onClick={() => {
              try { scannerRef.current?.stop(); } catch {}
              try { scannerRef.current?.clear(); } catch {}
              onClose();
            }}
            className="mt-3 w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
