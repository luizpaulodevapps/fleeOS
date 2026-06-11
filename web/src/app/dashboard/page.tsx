"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Car, 
  Users, 
  FileText, 
  Wrench,
  AlertTriangle,
  ClipboardList
} from "lucide-react";

export default function Dashboard() {
  const { currentUser, getCollection } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    monthlyRevenue: 0,
    activeContracts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [vehiclesList, driversList, contractsList] = await Promise.all([
          getCollection("vehicles"),
          getCollection("drivers"),
          getCollection("contracts"),
        ]);

        const totalVehicles = vehiclesList.length;
        const activeVehicles = vehiclesList.filter((v: any) => v.status === "active").length;
        const maintenanceVehicles = vehiclesList.filter((v: any) => v.status === "maintenance").length;
        
        const totalDrivers = driversList.length;
        const activeDrivers = driversList.filter((d: any) => d.status === "active").length;

        const activeContracts = contractsList.filter((c: any) => c.status === "active").length;

        // Calculate Monthly Revenue based on active contracts
        const monthlyRevenue = contractsList
          .filter((c: any) => c.status === "active")
          .reduce((sum: number, c: any) => sum + (c.monthlyRate || 0), 0);

        setStats({
          totalVehicles,
          activeVehicles,
          maintenanceVehicles,
          totalDrivers,
          activeDrivers,
          monthlyRevenue,
          activeContracts,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg max-w-[1400px] mx-auto">
      {/* Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-geist text-headline-md font-semibold text-primary">Fleet Command Center</h2>
          <p className="text-on-surface-variant text-xs">Visão geral do desempenho e saúde operacional em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/drivers")}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Cadastrar Motorista
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </span>
            <span className="text-accent-green text-[11px] font-bold">Ativo</span>
          </div>
          <div className="text-3xl font-black font-geist text-primary">{stats.totalVehicles}</div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Veículos na Frota</div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
            <span className="text-accent-green text-[11px] font-bold">Ativo</span>
          </div>
          <div className="text-3xl font-black font-geist text-primary">{stats.activeDrivers}</div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Motoristas Ativos</div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-primary-fixed-dim/30 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
            <div className="flex items-center gap-0.5 text-accent-green">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="text-[11px] font-bold">12%</span>
            </div>
          </div>
          <div className="text-3xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.monthlyRevenue)}
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Faturamento Mensal</div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-error-container/20 rounded-lg text-error">
              <span className="material-symbols-outlined text-[20px]">build</span>
            </span>
            <span className="text-error text-[10px] font-bold uppercase">Prioridade</span>
          </div>
          <div className="text-3xl font-black font-geist text-primary">{stats.maintenanceVehicles}</div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">Veículos em Manutenção</div>
        </div>
      </section>

      {/* Live Fleet Overview Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col min-h-[450px]">
          <div className="p-stack-md border-b border-outline-variant flex justify-between items-center bg-white">
            <h3 className="font-geist text-sm font-bold text-primary flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
              </span>
              Telemetria da Frota (Tempo Real)
            </h3>
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg">
              <button className="px-3 py-1 bg-white shadow-sm rounded-md text-[10px] font-semibold text-primary">Mapa</button>
              <button className="px-3 py-1 text-[10px] text-on-surface-variant font-medium">Satélite</button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-slate-100 overflow-hidden">
            {/* Simulated Map Placeholder */}
            <div className="absolute inset-0 grayscale opacity-40">
              <img 
                className="w-full h-full object-cover" 
                alt="Minimalist digital map" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsbU1uoBZdozS4ZaNSY0N1p5cq10qPU9wxZN-CGeGQo9_FNZxQtG2zyNyKCpP3ktapyt8pFIGxlPQHyJf6OXQ74CTUKUeyyVYNypyuD-QZnDVdRr5omYKO08KwiVN_5HHAlBM2mNfx0_ppKeun-UYvvHriGFyPnMn8qqpKnMGvxuBytTg1Oz__QQBHZO6KzIAxnCRDcAM_8cnt0FCr9lgMo228vEhIl0nhalMEQAvnXgwAxwHGxmgnOogNMJ2qsueFLel4kJv3kg"
              />
            </div>
            
            {/* Vehicle Pings */}
            <div className="absolute top-[30%] left-[40%] group cursor-pointer">
              <div className="map-ping absolute inset-0 bg-accent-green rounded-full w-6 h-6"></div>
              <div className="relative bg-primary text-white px-2 py-1 rounded shadow-xl text-[9px] font-bold">V-402</div>
            </div>
            <div className="absolute top-[60%] left-[25%] group cursor-pointer">
              <div className="map-ping absolute inset-0 bg-accent-green rounded-full w-6 h-6"></div>
              <div className="relative bg-primary text-white px-2 py-1 rounded shadow-xl text-[9px] font-bold">V-118</div>
            </div>
            <div className="absolute top-[45%] left-[70%] group cursor-pointer">
              <div className="map-ping absolute inset-0 bg-error rounded-full w-6 h-6"></div>
              <div className="relative bg-error text-white px-2 py-1 rounded shadow-xl text-[9px] font-bold">V-901</div>
            </div>

            {/* Map Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-2">
              <button className="bg-white p-1.5 rounded-lg border border-outline-variant shadow-sm hover:bg-slate-50 text-xs font-bold text-primary">+</button>
              <button className="bg-white p-1.5 rounded-lg border border-outline-variant shadow-sm hover:bg-slate-50 text-xs font-bold text-primary">-</button>
            </div>
          </div>
        </div>

        {/* Critical Alerts Log */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col h-full">
          <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-geist text-sm font-bold text-primary">Alertas Críticos</h3>
            <span className="bg-error/10 text-error px-2 py-0.5 rounded-full text-[10px] font-bold">3 Ativos</span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/60">
            {/* Alert Item 1 */}
            <div className="p-4 hover:bg-surface-container-low transition-all cursor-pointer group">
              <div className="flex gap-3">
                <div className="text-error mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-primary">Falha no Motor: Toyota Corolla</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">V-901 • Queda de pressão no cilindro 3. Manutenção solicitada.</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[9px] text-outline font-mono">12 MIN AGO</span>
                    <button className="text-primary text-[10px] font-bold underline opacity-0 group-hover:opacity-100 transition-opacity">Verificar</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alert Item 2 */}
            <div className="p-4 hover:bg-surface-container-low transition-all cursor-pointer group">
              <div className="flex gap-3">
                <div className="text-error mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-primary">Excesso de Velocidade</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">V-112 • Carlos Santos atingiu 110 km/h em via de 80 km/h.</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[9px] text-outline font-mono">45 MIN AGO</span>
                    <button className="text-primary text-[10px] font-bold underline opacity-0 group-hover:opacity-100 transition-opacity">Contatar</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Item 3 */}
            <div className="p-4 hover:bg-surface-container-low transition-all cursor-pointer group">
              <div className="flex gap-3">
                <div className="text-amber-500 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-bold text-primary">Vencimento de Apólice</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Toyota Corolla • Seguro vence em 2 dias. Renovar apólice.</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[9px] text-outline font-mono">2 HORAS AGO</span>
                    <button className="text-primary text-[10px] font-bold underline opacity-0 group-hover:opacity-100 transition-opacity">Visualizar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-stack-md border-b border-outline-variant flex justify-between items-center bg-white">
          <h3 className="font-geist text-sm font-bold text-primary">Atividade Recente da Frota</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-outline-variant rounded-md text-[10px] font-bold hover:bg-surface-container transition-all">Filtrar</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-md text-[10px] font-bold hover:bg-surface-container transition-all">Exportar</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/50">
              <tr className="border-b border-outline-variant">
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Horário</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Veículo Placa</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Motorista</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Evento</th>
                <th className="px-6 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4 font-mono text-on-surface-variant">14:23:05</td>
                <td className="px-6 py-4 font-semibold text-primary">ABC-1234</td>
                <td className="px-6 py-4 font-medium text-primary">Carlos Santos</td>
                <td className="px-6 py-4">Corrida Concluída</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green rounded-full font-semibold">Finalizado</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4 font-mono text-on-surface-variant">14:15:32</td>
                <td className="px-6 py-4 font-semibold text-primary">XYZ-5678</td>
                <td className="px-6 py-4 font-medium text-primary">Ana Julia</td>
                <td className="px-6 py-4">Entrada em Manutenção (Troca de óleo)</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full font-semibold">Em Curso</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4 font-mono text-on-surface-variant">13:42:00</td>
                <td className="px-6 py-4 font-semibold text-primary">ABC-1234</td>
                <td className="px-6 py-4 font-medium text-primary">Carlos Santos</td>
                <td className="px-6 py-4">Início de Turno (Check-in do ativo)</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full font-semibold">Ativo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
