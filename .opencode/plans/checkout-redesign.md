# Checkout Redesign - Implementation Plan

## Summary
Rewrite `web/src/app/cashier/page.tsx` to implement the real operational flow: KM reading → Maintenance alerts → Financial grouped by type → Payment distribution preview.

## Changes Needed

### 1. New State Variables (after line 71)
Add after `const [unclosedWarningOpen, setUnclosedWarningOpen] = useState(false);`:

```typescript
const [kmInput, setKmInput] = useState("");
const [kmUpdating, setKmUpdating] = useState(false);
const [kmLastValue, setKmLastValue] = useState<number | null>(null);
const [kmLastUpdate, setKmLastUpdate] = useState<string | null>(null);
const [maintenancePlanItems, setMaintenancePlanItems] = useState<any[]>([]);
```

### 2. New Computed Values (after line 79)
Add after `const driverCompliance`:

```typescript
const currentKm = activeVehicle?.mileage || 0;
const todayKm = currentKm - (kmLastValue || currentKm);
const avgKmPerDay = (() => {
  if (!kmLastUpdate || !kmLastValue) return null;
  const daysSince = Math.max(1, (Date.now() - new Date(kmLastUpdate).getTime()) / (1000 * 60 * 60 * 24));
  return Math.round(todayKm / daysSince);
})();

// Maintenance alerts
const maintAlerts = useMemo(() => {
  if (!maintenancePlanItems.length || !currentKm) return [];
  return maintenancePlanItems.map((item: any) => {
    const kmsSinceLast = currentKm - (item.lastServiceKm || 0);
    const pct = item.intervalKm > 0 ? Math.min(Math.max((kmsSinceLast / item.intervalKm) * 100, 0), 100) : 0;
    const kmsRemaining = (item.nextServiceKm || 0) - currentKm;
    return { ...item, wearPct: Math.round(pct), kmsRemaining, expired: kmsRemaining <= 0 };
  }).filter((a: any) => a.wearPct >= 80);
}, [maintenancePlanItems, currentKm]);

// Vehicle expiration alerts
const vehicleAlerts = useMemo(() => {
  const alerts: { label: string; date: string; expired: boolean }[] = [];
  if (activeVehicle?.insuranceExpiration) {
    const days = Math.ceil((new Date(activeVehicle.insuranceExpiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 30) alerts.push({ label: "Seguro", date: activeVehicle.insuranceExpiration, expired: days <= 0 });
  }
  if (activeVehicle?.registrationExpiration) {
    const days = Math.ceil((new Date(activeVehicle.registrationExpiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 30) alerts.push({ label: "CRLV/Licenciamento", date: activeVehicle.registrationExpiration, expired: days <= 0 });
  }
  return alerts;
}, [activeVehicle]);

// Financial grouping
const debtsByType = useMemo(() => {
  const groups: Record<string, AccountsReceivable[]> = {};
  for (const debt of openDebts) {
    const key = debt.titleType || "other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(debt);
  }
  return groups;
}, [openDebts]);

const obligationsTotal = openDebts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

// Distribution preview
const distribution = useMemo(() => {
  let remaining = receivedValue;
  return selectedDebts.map(debt => {
    const owing = debt.amount - (debt.paidAmount || 0);
    const allocated = Math.min(owing, Math.max(0, remaining));
    remaining -= allocated;
    return { ...debt, allocated, owing, fullyPaid: allocated >= owing };
  });
}, [selectedDebts, receivedValue]);

const remainingAfterDistrib = Math.max(0, receivedValue - distribution.reduce((s, d) => s + d.allocated, 0));
```

### 3. New Effects (after `loadTenantSettings` at line 115)

```typescript
// Load maintenance plan items + KM history when vehicle changes
useEffect(() => {
  if (!activeVehicle?.id) { setMaintenancePlanItems([]); return; }
  getCollection("maintenance_plan_items").then(items => {
    setMaintenancePlanItems(items.filter((i: any) => i.vehicleId === activeVehicle.id));
  }).catch(() => {});
  if (activeVehicle?.lastKmValue != null) {
    setKmLastValue(activeVehicle.lastKmValue);
    setKmLastUpdate(activeVehicle.lastKmUpdate || null);
  } else {
    setKmLastValue(null);
    setKmLastUpdate(null);
  }
  setKmInput(String(activeVehicle?.mileage || ""));
}, [activeVehicle?.id, getCollection]);
```

### 4. KM Update Handler
Add before `const receivePayment` (before line 149):

```typescript
const handleKmUpdate = async () => {
  if (!activeVehicle || !kmInput || !selectedDriverId) return;
  const newKm = Number(kmInput);
  if (!newKm || newKm <= 0) return alert("Informe a KM atual.");
  if (newKm <= currentKm) return alert("KM atual deve ser maior que a anterior.");
  setKmUpdating(true);
  try {
    await updateDocument("vehicles", activeVehicle.id, {
      mileage: newKm,
      lastKmValue: currentKm,
      lastKmUpdate: new Date().toISOString()
    });
    setKmLastValue(currentKm);
    setKmLastUpdate(new Date().toISOString());
    await hub.reload();
  } catch (e) { alert("Erro ao atualizar KM."); }
  finally { setKmUpdating(false); }
};
```

### 5. Replace the selectedDriver content entirely
Replace lines 222-341. The new content is a single-column vertical flow:

```tsx
{!selectedDriver ? (
  <EmptyCheckout />
) : (
  <div className="space-y-2">

    {/* ─── IDENTIFICAÇÃO ─── */}
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-950 text-white grid place-items-center font-geist font-black shrink-0">
            {String(selectedDriver.name || "?").split(" ").slice(0, 2).map((p: string) => p[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-wide text-indigo-600">
                {activeVehicle?.prefix || activeVehicle?.internalCode || "Táxi"}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${activeVehicle?.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
            </div>
            <h2 className="font-geist text-lg font-black">{selectedDriver.name}</h2>
            <p className="text-[10px] text-slate-500">
              {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model} · ${activeVehicle.plate}` : "Sem veículo ativo"}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <QuickButton icon={FileText} label="Extrato" onClick={() => setStatementOpen(true)} />
          <QuickButton icon={Menu} label="Caixa" onClick={() => setCashDrawerOpen(true)} />
        </div>
      </div>
    </section>

    {/* ─── KM & OPERACIONAL ─── */}
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-slate-400" />
        <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">Quilometragem</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">KM atual</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">KM</span>
            <input type="number" value={kmInput} onChange={(e) => setKmInput(e.target.value)}
              className="checkout-input pl-10 font-geist font-black text-base" />
          </div>
        </div>
        <button onClick={handleKmUpdate} disabled={kmUpdating}
          className="h-11 px-5 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center gap-2 disabled:opacity-40 whitespace-nowrap">
          <Check className="w-4 h-4" /> {kmUpdating ? "Atualizando..." : "Atualizar KM"}
        </button>
      </div>
      {kmLastValue != null && (
        <div className="flex gap-4 mt-3 text-[10px]">
          <div><span className="text-slate-400">Rodagem hoje:</span> <strong className="text-slate-700">{todayKm.toLocaleString()} km</strong></div>
          {avgKmPerDay != null && (
            <div><span className="text-slate-400">Média:</span> <strong className="text-slate-700">{avgKmPerDay} km/dia</strong></div>
          )}
          <div><span className="text-slate-400">KM total:</span> <strong className="text-slate-700">{currentKm.toLocaleString()} km</strong></div>
        </div>
      )}
    </section>

    {/* ─── ALERTAS ─── */}
    {(() => {
      const allAlerts: { icon: string; label: string; severity: "red" | "amber" }[] = [];
      maintAlerts.forEach((a: any) => {
        allAlerts.push({
          icon: "maintenance",
          label: a.expired ? `${a.itemName} vencido(a)` : `${a.itemName} — ${a.kmsRemaining.toLocaleString()} km restantes`,
          severity: a.expired ? "red" : "amber"
        });
      });
      vehicleAlerts.forEach((a) => {
        allAlerts.push({
          icon: "document",
          label: a.expired ? `${a.label} vencido` : `${a.label} vence em ${Math.ceil((new Date(a.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias`,
          severity: a.expired ? "red" : "amber"
        });
      });
      driverCompliance.forEach((occ) => {
        allAlerts.push({
          icon: "compliance",
          label: occ.type.replace(/_/g, " "),
          severity: occ.severity === "critical" || occ.severity === "high" ? "red" : "amber"
        });
      });
      if (allAlerts.length === 0) return null;
      return (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-wide">Alertas operacionais</span>
          </div>
          <div className="space-y-1.5">
            {allAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alert.severity === "red" ? "bg-red-500" : "bg-amber-500"}`} />
                <span className={`font-bold ${alert.severity === "red" ? "text-red-700" : "text-amber-800"}`}>{alert.label}</span>
              </div>
            ))}
          </div>
        </section>
      );
    })()}

    {/* ─── SITUAÇÃO FINANCEIRA ─── */}
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="w-4 h-4 text-indigo-500" />
          <h2 className="font-geist text-sm font-black">Financeiro</h2>
        </div>
        <div className="flex items-center gap-3">
          {score && (
            <div className={`rounded-lg px-2.5 py-1 border text-[10px] font-black ${
              ["AAA","AA","A"].includes(score.grade) ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : ["C","D"].includes(score.grade) ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              Score {score.grade}
            </div>
          )}
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Saldo</p>
            <p className={`font-geist text-base font-black ${ledgerBalance < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {money(ledgerBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Grouped obligations */}
      {Object.entries(debtsByType).map(([type, debts]) => {
        const total = debts.reduce((s, d) => s + (d.amount - (d.paidAmount || 0)), 0);
        const label = titleLabels[type] || "Cobrança";
        const colors = type === "rent" ? "text-indigo-700 bg-indigo-50"
          : type === "fine" ? "text-red-700 bg-red-50"
          : type === "claim_deductible" ? "text-amber-700 bg-amber-50"
          : "text-slate-700 bg-slate-50";
        return (
          <div key={type} className="px-5 py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${colors}`}>
                {label} · {debts.length} título{debts.length > 1 ? "s" : ""}
              </span>
              <strong className="text-sm font-black">{money(total)}</strong>
            </div>
            <div className="space-y-1">
              {debts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={selectedArIds.includes(debt.id)}
                      onChange={() => toggleDebt(debt.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 shrink-0" />
                    <span className="text-slate-600 truncate">
                      {date(debt.dueDate)}
                      {debt.status === "partial" && <span className="text-amber-600 font-bold ml-1">(parcial)</span>}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0 ml-2">
                    {money(debt.amount - (debt.paidAmount || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Total geral */}
      <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide">Total de obrigações</span>
        <strong className="font-geist text-xl font-black">{money(obligationsTotal)}</strong>
      </div>
    </section>

    {/* ─── PAGAMENTO ─── */}
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <HandCoins className="w-4 h-4 text-indigo-500" />
        <h2 className="font-geist text-sm font-black">Pagamento</h2>
      </div>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-3">
        <label>
          <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1">Valor</span>
          <div className="relative">
            <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">R$</span>
            <input type="number" min="0" step="0.01" value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="checkout-input pl-9 font-geist font-black text-base" />
          </div>
        </label>
        <div>
          <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1">Forma</span>
          <div className="grid grid-cols-4 gap-1.5">
            {([{ id: "pix", label: "PIX", icon: QrCode }, { id: "card", label: "Cartão", icon: CreditCard },
              { id: "cash", label: "Dinheiro", icon: Banknote }, { id: "transfer", label: "Transfer.", icon: Landmark }] as const)
              .map((opt) => (
                <button key={opt.id} type="button" onClick={() => setMethod(opt.id)}
                  className={`h-[44px] rounded-xl border flex items-center justify-center gap-1.5 text-[10px] font-bold transition-colors ${
                    method === opt.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Distribution Preview */}
      {receivedValue > 0 && selectedDebts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
            <ArrowDownRight className="w-3.5 h-3.5" /> Distribuição automática
          </div>
          <div className="space-y-1.5">
            {distribution.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  {d.allocated > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate text-slate-600">
                    {titleLabels[d.titleType]} {date(d.dueDate)}
                    {d.status === "partial" ? " (parcial)" : ""}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  {d.allocated > 0 && <span className="font-bold text-emerald-700">{money(d.allocated)}</span>}
                  {d.allocated > 0 && d.fullyPaid && <span className="text-[9px] text-emerald-500 ml-1">✓</span>}
                  {d.allocated > 0 && !d.fullyPaid && <span className="text-[9px] text-amber-500 ml-1">parcial</span>}
                  {d.allocated <= 0 && <span className="text-slate-400">—</span>}
                </div>
              </div>
            ))}
          </div>
          {remainingAfterDistrib > 0 && (
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-200">
              <span>Crédito restante na conta</span>
              <span>{money(remainingAfterDistrib)}</span>
            </div>
          )}
          {selectedDebts.some(d => (d.amount - (d.paidAmount || 0)) > 0) && remainingAfterDistrib <= 0 && receivedValue < obligationsTotal && (
            <div className="text-[10px] text-amber-700 font-bold pt-2 border-t border-slate-200">
              Saldo devedor remanescente: {money(obligationsTotal - receivedValue)}
            </div>
          )}
        </div>
      )}

      {isManualTerminalMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] text-amber-800">
          <strong className="block text-[11px] font-bold mb-1">Terminal físico ativado</strong>
          Este gerenciamento está em modo de terminal local. Registre a transação no POS físico e confirme o recebimento no sistema como um lançamento manual.
        </div>
      )}

      {!hub.activeSession && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-[10px] font-bold text-red-700">
          <LockKeyhole className="w-4 h-4" /> Abra o caixa antes de receber pagamentos.
        </div>
      )}

      <button disabled={!hub.activeSession || receivedValue <= 0 || saving || selectedArIds.length === 0}
        onClick={receivePayment}
        className="w-full h-12 rounded-xl bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-40">
        <HandCoins className="w-4 h-4" />
        {saving ? "Processando..." : isManualTerminalMode ? "Registrar Pagamento Manual" : `Receber ${money(receivedValue)}`}
      </button>
    </section>

    {/* ─── COBRANÇAS RECORRENTES (mantido) ─── */}
    {(() => {
      const activePlans = hub.paymentPlans.filter((p: any) => p.driverId === selectedDriverId && p.status === "active");
      const signedSettlements = hub.settlements.filter((s: any) => s.driverId === selectedDriverId && s.status === "signed");
      if (activePlans.length === 0 && signedSettlements.length === 0) return null;
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <CalendarDays className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wide">Cobranças recorrentes</span>
          </div>
          {activePlans.map((plan: any) => {
            const pct = plan.installmentsCount > 0 ? Math.round((plan.paidInstallments || 0) / plan.installmentsCount * 100) : 0;
            return (
              <div key={plan.id} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800">{plan.installmentsCount}x de {money(plan.monthlyAmount)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                  </div>
                </div>
                <span className="shrink-0 text-[9px] font-black px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">Ativo</span>
              </div>
            );
          })}
          {signedSettlements.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between gap-3 text-[11px]">
              <div>
                <p className="font-bold text-slate-800">Acordo • {s.installments}x</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{money(s.originalDebt)} → {money(s.settledAmount)}</p>
              </div>
              <span className="shrink-0 text-[9px] font-black px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">Vigente</span>
            </div>
          ))}
        </section>
      );
    })()}

  </div>
)}
```

### 6. Also add `ArrowDownRight` to imports (line 4-33)
Add `ArrowDownRight` to the lucide-react import list.

## Verification
After implementing:
1. Run `npx tsc --noEmit` - must have zero errors
2. Run `npm run build` - must succeed
3. Test the full flow: search driver → update KM → see alerts → see financial grouped → enter payment → see distribution → confirm
