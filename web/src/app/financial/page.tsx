"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  User,
  CreditCard,
  PlusCircle,
  MinusCircle,
  FileText
} from "lucide-react";

export default function FinancialManager() {
  const { getCollection, addDocument, deleteDocument, can } = useAuth();
  
  const [ledger, setLedger] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    driverId: "",
    type: "daily" as "daily" | "fine" | "bonus" | "payment" | "adjustment",
    amount: "",
    description: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ledList, drvList] = await Promise.all([
        getCollection("driver_ledger"),
        getCollection("drivers")
      ]);
      setLedger(ledList);
      setDrivers(drvList);
    } catch (e) {
      console.error("Erro ao carregar conta corrente", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setFormData({
      driverId: drivers[0]?.id || "",
      type: "daily",
      amount: "",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rawAmount = Number(formData.amount);
      if (rawAmount <= 0) {
        alert("Insira um valor maior que zero.");
        return;
      }

      // Automatically store debit types (daily, fine) as negative values
      const sign = (formData.type === "daily" || formData.type === "fine") ? -1 : 1;
      const finalAmount = rawAmount * sign;

      await addDocument("driver_ledger", {
        driverId: formData.driverId,
        type: formData.type,
        amount: finalAmount,
        description: formData.description,
      });

      setIsModalOpen(false);
      loadData();
      alert("Lançamento efetuado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar lançamento financeiro", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente estornar/excluir este lançamento financeiro?")) {
      try {
        await deleteDocument("driver_ledger", id);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir lançamento", err);
      }
    }
  };

  // Helper to find driver name
  const getDriverName = (driverId: string) => {
    const drv = drivers.find(d => d.id === driverId);
    return drv ? drv.name : "Motorista Não Encontrado";
  };

  // Calculate stats for the selected scope
  const filteredLedger = ledger.filter(entry => {
    if (selectedDriverId === "all") return true;
    return entry.driverId === selectedDriverId;
  });

  const totals = filteredLedger.reduce((acc, entry) => {
    const val = Number(entry.amount || 0);
    if (val > 0) {
      acc.credits += val;
    } else {
      acc.debits += Math.abs(val);
    }
    acc.balance += val;
    return acc;
  }, { credits: 0, debits: 0, balance: 0 });

  // Overall statistics for all drivers (for general KPIs)
  const generalStats = ledger.reduce((acc, entry) => {
    const val = Number(entry.amount || 0);
    if (val > 0) {
      acc.totalPaid += val;
    } else {
      acc.totalCharged += Math.abs(val);
    }
    return acc;
  }, { totalPaid: 0, totalCharged: 0 });

  // Calculate default/outstanding balance (sum of all negative driver accounts)
  const getOutstandingBalance = () => {
    const driverBalances: { [key: string]: number } = {};
    ledger.forEach(entry => {
      driverBalances[entry.driverId] = (driverBalances[entry.driverId] || 0) + Number(entry.amount || 0);
    });
    
    return Object.values(driverBalances)
      .filter(bal => bal < 0)
      .reduce((sum, bal) => sum + Math.abs(bal), 0);
  };

  const totalOutstanding = getOutstandingBalance();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Financeiro</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Contas Correntes</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist">
            Contas Correntes dos Motoristas
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Gerencie o extrato financeiro (livro-razão), lance multas, aplique abonos e consulte saldos de diárias acumulados.
          </p>
        </div>
        {can("driver_ledger.edit") && (
          <button
            onClick={openNewModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Lançamento Manual</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Total Recebido */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <span className="text-accent-green text-[10px] font-bold uppercase">Entradas</span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedDriverId === "all" ? generalStats.totalPaid : totals.credits)}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">
            {selectedDriverId === "all" ? "Total Recebido (Geral)" : "Total Pago (Motorista)"}
          </div>
        </div>

        {/* Total Cobrado */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-red-500/10 rounded-lg text-red-600">
              <ArrowDownRight className="w-5 h-5" />
            </span>
            <span className="text-red-500 text-[10px] font-bold uppercase">Débitos</span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedDriverId === "all" ? generalStats.totalCharged : totals.debits)}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">
            {selectedDriverId === "all" ? "Total Cobrado (Geral)" : "Total Débitos (Motorista)"}
          </div>
        </div>

        {/* Saldo Selecionado */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className={`p-2 rounded-lg ${totals.balance >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
              <DollarSign className="w-5 h-5" />
            </span>
            <span className={`text-[10px] font-bold uppercase ${totals.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {totals.balance >= 0 ? "Credor" : "Devedor"}
            </span>
          </div>
          <div className={`text-2xl font-black font-geist ${totals.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.balance)}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">
            {selectedDriverId === "all" ? "Balanço Líquido Geral" : "Saldo Corrente do Motorista"}
          </div>
        </div>

        {/* Inadimplência Total */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <ArrowDownRight className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-amber-500 text-[10px] font-bold uppercase">Devedores</span>
          </div>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOutstanding)}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Dívida Total de Motoristas</div>
        </div>
      </section>

      {/* Driver Ledger Selector & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-outline uppercase">Filtrar Motorista:</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
          >
            <option value="all">-- Todos os Lançamentos (Visão Global) --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.cpf})</option>
            ))}
          </select>
        </div>

        <p className="text-[10px] text-outline font-bold uppercase tracking-wider">
          Total de {filteredLedger.length} lançamentos encontrados
        </p>
      </div>

      {/* Ledger Table Display */}
      {loading ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs font-semibold">Carregando livro-razão...</p>
        </div>
      ) : filteredLedger.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant">
          <FileText className="w-[40px] h-[40px] text-outline mx-auto mb-4" />
          <p className="text-base font-semibold text-primary font-geist">Conta Corrente Sem Registros</p>
          <p className="text-xs mt-1">Este motorista não possui movimentações financeiras registradas.</p>
        </div>
      ) : (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Data do Lançamento</th>
                  {selectedDriverId === "all" && (
                    <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Motorista</th>
                  )}
                  <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3.5 font-semibold text-on-surface-variant uppercase tracking-wider text-right">Estorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredLedger.slice().reverse().map((entry) => {
                  const amt = Number(entry.amount || 0);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-on-surface-variant font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString('pt-BR') : 'N/A'}</span>
                        </div>
                      </td>
                      {selectedDriverId === "all" && (
                        <td className="px-6 py-4 font-bold text-primary flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-outline" />
                          <span>{getDriverName(entry.driverId)}</span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                          entry.type === "daily" 
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : entry.type === "fine"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : entry.type === "bonus"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : entry.type === "payment"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        }`}>
                          {entry.type === "daily" ? "Diária" : entry.type === "fine" ? "Multa" : entry.type === "bonus" ? "Abono" : entry.type === "payment" ? "Pagamento" : "Ajuste"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-primary font-medium max-w-sm truncate" title={entry.description}>
                        {entry.description}
                      </td>
                      <td className={`px-6 py-4 font-black ${amt >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {amt >= 0 ? "+" : ""} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {can("driver_ledger.edit") && (
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-outline hover:text-error hover:bg-red-500/5 rounded transition-all inline-flex items-center"
                            title="Estornar Lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CREATE MANUAL ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl relative">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-primary font-geist">Lançamento Financeiro Manual</h3>
                <p className="text-xs text-on-surface-variant mt-1">Lançar diárias de aluguel, bonificações, multas ou ajustes manuais diretamente na conta corrente.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Motorista Beneficiário/Devedor</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Tipo de Lançamento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  >
                    <option value="daily">Débito: Diária</option>
                    <option value="fine">Débito: Multa</option>
                    <option value="bonus">Crédito: Abono</option>
                    <option value="payment">Crédito: Pagamento</option>
                    <option value="adjustment">Crédito: Ajuste Positivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 120"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Descrição da Operação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Multa radar Av. dos Bandeirantes, Km 3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
