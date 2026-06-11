"use client";

import React from "react";
import { X } from "lucide-react";
import { SupplierFormData } from "../_lib/types";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: SupplierFormData;
  setFormData: (data: SupplierFormData) => void;
  selectedSupplier?: any;
  loading?: boolean;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  selectedSupplier,
  loading = false
}: SupplierModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-background border border-outline-variant rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-primary mb-2 font-geist">
          {selectedSupplier ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"}
        </h3>
        <p className="text-xs text-on-surface-variant mb-5">Insira os dados cadastrais da empresa fornecedora de peças ou serviços.</p>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Razão Social / Nome</label>
            <input
              type="text"
              required
              placeholder="Ex: Auto Peças do Jabaquara Ltda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">CNPJ</label>
            <input
              type="text"
              required
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Telefone</label>
              <input
                type="text"
                placeholder="(11) 4004-1234"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">E-mail</label>
              <input
                type="email"
                placeholder="vendas@fornecedor.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">Endereço Comercial</label>
            <input
              type="text"
              placeholder="Rua das Autopeças, 120 - São Paulo, SP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs outline-none text-on-surface"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
