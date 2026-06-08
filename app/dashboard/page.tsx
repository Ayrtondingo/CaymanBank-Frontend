'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  Landmark,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  UserCircle,
  WalletCards,
  X,
} from "lucide-react";
import { API_URL, getTransactionHistory } from "@/lib/api";
import SyncCbuModal from "../components/SyncCbuModal";

const hasLinkedCbu = (accountNumber?: string | null) =>
  Boolean(accountNumber && /^\d{22}$/.test(accountNumber));

const money = (amount: number) =>
  Number(amount || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const shortAccount = (accountNumber?: string) =>
  accountNumber ? `${accountNumber.slice(0, 6)} ... ${accountNumber.slice(-4)}` : "Sin CBU";

type TabId = "home" | "transfers" | "movements" | "services" | "profile";

interface Transaction {
  date?: string;
  to?: string;
  from?: string;
  counterpartyName?: string;
  type: "IN" | "OUT";
  amount: number;
}

interface UserData {
  fullName: string;
  balance: number;
  accountNumber: string;
  alias: string;
  transactions?: Transaction[];
}

interface Notice {
  type: "error" | "success";
  msg: string;
}

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "transfers", label: "Transferir", icon: Send },
  { id: "movements", label: "Movimientos", icon: ReceiptText },
  { id: "services", label: "Servicios", icon: CreditCard },
  { id: "profile", label: "Cuenta", icon: UserCircle },
];

const services = [
  { name: "Luz", due: "Vence en 3 dias", amount: 28400, icon: Home },
  { name: "Celular", due: "Vence hoy", amount: 15600, icon: Smartphone },
  { name: "Tarjeta", due: "Debito programado", amount: 74200, icon: WalletCards },
];

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token || !user) return;

      const res = await fetch(`${API_URL}/users/me?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo cargar la cuenta");

      const bankData: UserData = await res.json();
      const txHistory = await getTransactionHistory(token).catch(() => []);

      setData(bankData);
      setHistory(txHistory);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setNotice({ type: "error", msg: "No pudimos actualizar tu informacion. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [loadDashboardData, user]);

  const movements = useMemo(() => history.length ? history : (data?.transactions ?? []), [data, history]);
  const linkedCbu = hasLinkedCbu(data?.accountNumber);
  const income = movements.filter((tx) => tx.type === "IN").reduce((sum, tx) => sum + tx.amount, 0);
  const outcome = movements.filter((tx) => tx.type === "OUT").reduce((sum, tx) => sum + tx.amount, 0);

  const handleCopyCbu = async () => {
    if (!data?.accountNumber) return;
    await navigator.clipboard.writeText(data.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleUpdateAlias = async () => {
    if (!newAlias.trim()) return;

    try {
      setTransferLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/users/alias`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias: newAlias.trim().toLowerCase() }),
      });

      if (!res.ok) throw new Error("Alias no disponible");

      setNotice({ type: "success", msg: "Alias actualizado correctamente." });
      setIsEditingAlias(false);
      await loadDashboardData();
    } catch (err) {
      console.error("Alias update error:", err);
      setNotice({ type: "error", msg: "No pudimos actualizar el alias." });
    } finally {
      setTransferLoading(false);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleTransfer = async (destinatario: string, monto: number, motivo: string) => {
    try {
      setTransferLoading(true);
      setNotice(null);
      const token = await getToken();
      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destinatario, monto, motivo }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "La transferencia no pudo realizarse");

      setNotice({ type: "success", msg: "Transferencia enviada. Actualizamos tu saldo." });
      await loadDashboardData();
      setActiveTab("home");
    } catch (err) {
      setNotice({
        type: "error",
        msg: err instanceof Error ? err.message : "No pudimos completar la transferencia.",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center bg-[var(--surface-muted)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-sm">
          <Loader2 className="animate-spin text-[var(--brand)]" size={36} />
          <p className="text-sm font-medium text-[var(--muted)]">Cargando tu banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[var(--surface-muted)] px-4 py-5 text-[var(--foreground)] sm:px-6 lg:px-8">
      <main className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[248px_1fr]">
        <aside className="hidden rounded-3xl border border-[var(--border)] bg-white p-3 shadow-sm lg:block">
          <div className="mb-3 flex items-center gap-3 px-3 py-4">
            <div className="grid size-10 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Landmark size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Cayman Bank</p>
              <p className="text-xs text-[var(--muted)]">Homebanking</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Navegacion principal">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? "nav-item-active" : ""}`}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-[var(--border)] pt-3">
            <SignOutButton>
              <button className="nav-item text-[var(--danger)]">
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </SignOutButton>
          </div>
        </aside>

        <section className="space-y-5">
          <header className="rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Hola, {data?.fullName || user?.firstName || "bienvenido"}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Tu dinero, simple y seguro</h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="icon-button" aria-label="Ver notificaciones">
                  <Bell size={18} />
                </button>
                <button onClick={loadDashboardData} className="secondary-button">
                  <RefreshCw size={16} />
                  Actualizar
                </button>
              </div>
            </div>

            <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Secciones">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`mobile-tab ${activeTab === item.id ? "mobile-tab-active" : ""}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          {notice && (
            <div
              className={`rounded-2xl border p-4 text-sm font-medium ${
                notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
              role="status"
            >
              {notice.msg}
            </div>
          )}

          {!linkedCbu ? (
            <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-2xl font-bold">Activa tu cuenta bancaria</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Necesitamos validar tu identidad para crear tu CBU y habilitar transferencias, pagos y movimientos.
                </p>
                <div className="mx-auto mt-7 max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-left">
                  <SyncCbuModal onRecordCreated={loadDashboardData} />
                </div>
              </div>
            </section>
          ) : (
            <>
              {activeTab === "home" && (
                <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <BalanceCard
                    data={data}
                    showBalance={showBalance}
                    copied={copied}
                    onToggleBalance={() => setShowBalance((value) => !value)}
                    onCopyCbu={handleCopyCbu}
                  />

                  <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-1">
                    <ActionButton icon={Send} label="Transferir" description="Enviar dinero" onClick={() => setActiveTab("transfers")} />
                    <ActionButton icon={CreditCard} label="Pagar" description="Servicios y tarjetas" onClick={() => setActiveTab("services")} />
                    <ActionButton icon={ReceiptText} label="Movimientos" description="Ver actividad" onClick={() => setActiveTab("movements")} />
                  </div>

                  <MetricCard title="Ingresos del periodo" value={money(income)} icon={ArrowDownLeft} tone="success" />
                  <MetricCard title="Egresos del periodo" value={money(outcome)} icon={ArrowUpRight} tone="danger" />
                </section>
              )}

              {activeTab === "transfers" && (
                <TransferPanel
                  currentBalance={data?.balance || 0}
                  loading={transferLoading}
                  onSubmit={handleTransfer}
                />
              )}

              {activeTab === "movements" && <MovementsPanel movements={movements} />}

              {activeTab === "services" && <ServicesPanel />}

              {activeTab === "profile" && (
                <ProfilePanel
                  data={data}
                  isEditingAlias={isEditingAlias}
                  newAlias={newAlias}
                  loading={transferLoading}
                  onEditAlias={() => {
                    setNewAlias(data?.alias || "");
                    setIsEditingAlias(true);
                  }}
                  onCancelAlias={() => setIsEditingAlias(false)}
                  onAliasChange={setNewAlias}
                  onSaveAlias={handleUpdateAlias}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function BalanceCard({
  data,
  showBalance,
  copied,
  onToggleBalance,
  onCopyCbu,
}: {
  data: UserData | null;
  showBalance: boolean;
  copied: boolean;
  onToggleBalance: () => void;
  onCopyCbu: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-[var(--brand-strong)] p-6 text-white shadow-[0_24px_60px_rgba(2,132,199,0.20)] sm:p-7">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Saldo disponible</p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {showBalance ? money(data?.balance || 0) : "$ ****"}
            </p>
          </div>
          <button onClick={onToggleBalance} className="rounded-full bg-white/15 p-3 transition hover:bg-white/25" aria-label="Mostrar u ocultar saldo">
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mt-10 grid gap-3 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-white/65">CBU</p>
            <p className="font-semibold">{shortAccount(data?.accountNumber)}</p>
            <p className="mt-2 text-white/65">Alias</p>
            <p className="font-semibold">{data?.alias || "Sin alias"}</p>
          </div>
          <button onClick={onCopyCbu} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:-translate-y-0.5">
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copiado" : "Copiar CBU"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group rounded-3xl border border-[var(--border)] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
        <Icon size={20} />
      </div>
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
    </button>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  tone: "success" | "danger";
}) {
  const toneClass = tone === "success" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className={`mb-5 grid size-11 place-items-center rounded-2xl ${toneClass}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </article>
  );
}

function TransferPanel({
  currentBalance,
  loading,
  onSubmit,
}: {
  currentBalance: number;
  loading: boolean;
  onSubmit: (destinatario: string, amount: number, reason: string) => void;
}) {
  const [formData, setFormData] = useState({ destinatario: "", amount: "", reason: "" });
  const amount = Number(formData.amount);
  const dest = formData.destinatario.trim();
  const isCbu = /^\d{22}$/.test(dest);
  const isAlias = /^[a-zA-Z0-9._-]{3,30}$/.test(dest);
  const destHint = dest === "" ? "" : isCbu ? "CBU valido" : isAlias ? "Alias valido" : "CBU invalido (22 digitos) o alias invalido";
  const isValid = (isCbu || isAlias) && amount > 0 && amount <= currentBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(dest, amount, formData.reason || "Transferencia");
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-7">
          <p className="text-sm font-semibold text-[var(--brand)]">Nueva transferencia</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Enviar dinero</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Ingresa el CBU (22 digitos) o el alias del destinatario.</p>
        </div>

        <div className="space-y-5">
          <Field
            label="CBU o Alias destino"
            hint={
              destHint ? (
                <span className={isCbu || isAlias ? "text-emerald-600" : "text-red-500"}>{destHint}</span>
              ) : undefined
            }
          >
            <input
              value={formData.destinatario}
              onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
              className="input"
              autoComplete="off"
              placeholder="0000000000000000000000 o nombre.apellido.banco"
              required
            />
          </Field>

          <Field label="Monto" hint={`Disponible: ${money(currentBalance)}`}>
            <input
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input"
              inputMode="decimal"
              type="number"
              min="1"
              max={currentBalance}
              placeholder="$ 0"
              required
            />
          </Field>

          <Field label="Motivo">
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input"
            >
              <option value="">Seleccionar</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Servicios">Servicios</option>
              <option value="Honorarios">Honorarios</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </Field>
        </div>

        <button type="submit" disabled={!isValid || loading} className="primary-button mt-7 w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? "Enviando..." : "Transferir ahora"}
        </button>
      </form>

      <aside className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Antes de enviar</h3>
        <ul className="mt-4 space-y-4 text-sm text-[var(--muted)]">
          <li className="flex gap-3"><CheckCircle2 className="mt-0.5 text-emerald-600" size={18} /> Podes usar el CBU (22 digitos) o el alias del destinatario.</li>
          <li className="flex gap-3"><CheckCircle2 className="mt-0.5 text-emerald-600" size={18} /> Confirma el monto antes de continuar.</li>
          <li className="flex gap-3"><CheckCircle2 className="mt-0.5 text-emerald-600" size={18} /> Agrega un motivo para reconocer el movimiento.</li>
        </ul>
      </aside>
    </section>
  );
}

function MovementsPanel({ movements }: { movements: Transaction[] }) {
  const [query, setQuery] = useState("");
  const filtered = movements.filter((tx) =>
    `${tx.to || ""} ${tx.from || ""} ${tx.type}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Movimientos</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{filtered.length} operaciones encontradas</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="input pl-10" placeholder="Buscar movimiento" />
        </div>
      </div>

      <div className="mt-6 divide-y divide-[var(--border)]">
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-[var(--muted)]">Todavia no hay movimientos para mostrar.</p>}
        {filtered.map((tx, idx) => {
          const cbu = tx.to || tx.from;
          const displayName = tx.counterpartyName || cbu || "Operacion bancaria";
          const shortCbu = cbu ? `CBU ${cbu.slice(0, 6)}...${cbu.slice(-4)}` : undefined;
          return (
            <article key={`${tx.date}-${idx}`} className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tx.type === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {tx.type === "IN" ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{displayName}</p>
                  {tx.counterpartyName && shortCbu && (
                    <p className="truncate text-xs text-[var(--muted)]">{shortCbu}</p>
                  )}
                  <p className="text-sm text-[var(--muted)]">{tx.date ? new Date(tx.date).toLocaleString("es-AR") : "Pendiente"}</p>
                </div>
              </div>
              <p className={`shrink-0 font-bold ${tx.type === "IN" ? "text-emerald-700" : "text-rose-700"}`}>
                {tx.type === "IN" ? "+" : "-"} {money(tx.amount)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ServicesPanel() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">Pago de servicios</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Vencimientos proximos</h2>
        </div>
        <button className="secondary-button">
          <Plus size={16} />
          Agregar servicio
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <article key={service.name} className="rounded-3xl border border-[var(--border)] p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-5 flex items-center justify-between">
              <div className="grid size-11 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <service.icon size={20} />
              </div>
              <ChevronRight className="text-[var(--muted)]" size={18} />
            </div>
            <p className="font-semibold">{service.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{service.due}</p>
            <p className="mt-5 text-2xl font-bold">{money(service.amount)}</p>
            <button className="primary-button mt-5 w-full">Pagar</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfilePanel({
  data,
  isEditingAlias,
  newAlias,
  loading,
  onEditAlias,
  onCancelAlias,
  onAliasChange,
  onSaveAlias,
}: {
  data: UserData | null;
  isEditingAlias: boolean;
  newAlias: string;
  loading: boolean;
  onEditAlias: () => void;
  onCancelAlias: () => void;
  onAliasChange: (value: string) => void;
  onSaveAlias: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-2xl font-bold tracking-tight">Datos de la cuenta</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InfoBlock label="Titular" value={data?.fullName || "Sin nombre"} />
        <InfoBlock label="Tipo de cuenta" value="Caja de ahorro en pesos" />
        <InfoBlock label="CBU" value={data?.accountNumber || "Sin CBU"} />
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <p className="text-sm text-[var(--muted)]">Alias</p>
          {isEditingAlias ? (
            <div className="mt-3 flex gap-2">
              <input value={newAlias} onChange={(e) => onAliasChange(e.target.value)} className="input" placeholder="mi.alias" />
              <button onClick={onSaveAlias} disabled={loading} className="icon-button" aria-label="Guardar alias">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              </button>
              <button onClick={onCancelAlias} className="icon-button" aria-label="Cancelar edicion">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-semibold">{data?.alias || "Sin alias"}</p>
              <button onClick={onEditAlias} className="secondary-button">Editar</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 break-words font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
        {label}
        {hint && <span className="font-normal text-[var(--muted)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
