'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { API_URL, getTransactionHistory } from "@/lib/api";
import {
  Terminal, Send, Loader2, Eye, EyeOff, X, ReceiptText,
  ShieldCheck, UserCircle, Copy, CheckCircle2, LogOut,
  LayoutDashboard, RefreshCw, Users, Crown, ChevronDown,
} from "lucide-react";
import SyncUser from "../components/SyncUser";
import SyncCbuModal from "../components/SyncCbuModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'admin' | 'gerente';
type TabId = 'main' | 'history' | 'accounts' | 'security' | 'admin' | 'manager';

interface Transaction {
  id?: string | number;
  date?: string;
  to?: string;
  from?: string;
  counterpartyName?: string;
  type: 'IN' | 'OUT';
  amount: number;
  status?: string;
}

interface UserData {
  fullName: string;
  role: Role;
  balance: number;
  accountNumber: string | null;
  alias: string | null;
  transactions?: Transaction[];
}

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  balance: number;
  accountNumber: string | null;
  alias: string | null;
}

interface Notice { type: 'error' | 'success'; msg: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isCbuLinked = (cbu?: string | null) => Boolean(cbu && /^\d{22}$/.test(cbu));

const money = (n: number) =>
  Number(n || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const shortCbu = (cbu?: string | null) =>
  cbu ? `${cbu.slice(0, 6)}···${cbu.slice(-4)}` : 'N/A';

const ROLE_LABEL: Record<Role, string> = {
  user: 'CLIENT',
  admin: 'ADMIN',
  gerente: 'MANAGER',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [data, setData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('main');
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showNotice = (n: Notice) => { setNotice(n); setTimeout(() => setNotice(null), 3500); };

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/users/me?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const bankData: UserData = await res.json();
      const txHistory = await getTransactionHistory(token!).catch(() => []);
      setData(bankData);
      setHistory(txHistory);
    } catch {
      showNotice({ type: 'error', msg: 'ERR: NO_SYNC_WITH_NODE' });
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => { if (user) loadData(); }, [loadData, user]);

  const movements = useMemo(
    () => history.length ? history : (data?.transactions ?? []),
    [data, history],
  );

  const linkedCbu = isCbuLinked(data?.accountNumber);
  const role: Role = data?.role ?? 'user';

  const navTabs: Array<{ id: TabId; label: string; icon: React.ElementType; minRole?: Role }> = [
    { id: 'main', label: 'DASH_MAIN', icon: LayoutDashboard },
    { id: 'history', label: 'XFER_LOG', icon: ReceiptText },
    { id: 'accounts', label: 'ACCOUNTS', icon: UserCircle },
    { id: 'security', label: 'SECURITY', icon: ShieldCheck },
    { id: 'admin', label: 'ADMIN_PANEL', icon: Users, minRole: 'admin' },
    { id: 'manager', label: 'MGR_PANEL', icon: Crown, minRole: 'gerente' },
  ];

  const visibleTabs = navTabs.filter((t) => {
    if (!t.minRole) return true;
    if (t.minRole === 'admin') return role === 'admin' || role === 'gerente';
    if (t.minRole === 'gerente') return role === 'gerente';
    return false;
  });

  const handleCopyAlias = async () => {
    if (!data?.accountNumber) return;
    await navigator.clipboard.writeText(data.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleUpdateAlias = async () => {
    if (!newAlias.trim()) return;
    try {
      setActionLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/users/alias`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: newAlias.trim().toLowerCase() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'ALIAS_CONFLICT');
      showNotice({ type: 'success', msg: 'ALIAS_REWRITTEN_OK' });
      setIsEditingAlias(false);
      await loadData();
    } catch (e) {
      showNotice({ type: 'error', msg: e instanceof Error ? e.message : 'ALIAS_WRITE_FAILED' });
    } finally { setActionLoading(false); }
  };

  const handleTransfer = async (destinatario: string, monto: number, motivo: string) => {
    try {
      setActionLoading(true);
      setNotice(null);
      const token = await getToken();
      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinatario, monto, motivo }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'XFER_REJECTED');
      showNotice({ type: 'success', msg: 'XFER_APPROVED // BALANCE_UPDATED' });
      await loadData();
      setActiveTab('main');
    } catch (e) {
      showNotice({ type: 'error', msg: e instanceof Error ? e.message : 'XFER_FATAL_ERROR' });
    } finally { setActionLoading(false); }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-mono text-[#00ff41]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={36} />
          <p className="animate-pulse tracking-[0.3em] text-xs">BOOTING_CAYMAN_OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-12 pt-20 font-mono text-[#00ff41] sm:px-6">
      <SyncUser />

      <main className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="hidden border border-[#001a00] bg-black p-4 lg:block">
          <div className="mb-6 flex items-center gap-3 border-b border-[#001a00] pb-4">
            <Terminal size={18} className="text-[#00ff41]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff41]">Cayman_Bank</p>
              <p className="text-[8px] uppercase text-[#003300]">v3.1.0 // {ROLE_LABEL[role]}</p>
            </div>
          </div>

          <nav className="space-y-0.5">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`nav-item ${activeTab === t.id ? 'nav-item-active' : ''}`}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 border-t border-[#001a00] pt-4">
            <SignOutButton>
              <button className="nav-item text-[#550000] hover:text-[#ff3333] hover:border-l-[#550000]">
                <LogOut size={13} />
                TERMINATE_SESSION
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="space-y-6">

          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#001a00] pb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#004400]">
                NODE_STATUS: ONLINE // {ROLE_LABEL[role]}
              </p>
              <h1 className="text-lg font-black uppercase tracking-tight text-[#00ff41]" style={{ textShadow: '0 0 12px rgba(0,255,65,0.4)' }}>
                {data?.fullName || user?.firstName || 'UNKNOWN_SUBJECT'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile tabs */}
              <div className="flex gap-1 overflow-x-auto lg:hidden">
                {visibleTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider transition-all ${
                      activeTab === t.id ? 'border-[#00ff41] text-[#00ff41]' : 'border-[#001a00] text-[#004400]'
                    }`}
                  >
                    <t.icon size={10} />
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={loadData} className="btn-terminal text-[9px] py-1.5 px-3">
                <RefreshCw size={11} />
                SYNC
              </button>
            </div>
          </header>

          {/* Notice */}
          {notice && (
            <div className={`border px-4 py-3 text-[10px] font-black uppercase tracking-widest ${
              notice.type === 'success'
                ? 'border-[#00ff41] bg-[rgba(0,255,65,0.04)] text-[#00ff41]'
                : 'border-[#ff3333] bg-[rgba(255,51,51,0.04)] text-[#ff3333]'
            }`}>
              &gt; {notice.msg}
            </div>
          )}

          {/* CBU not linked */}
          {!linkedCbu ? (
            <div className="border border-[#004400] bg-black p-10 text-center">
              <ShieldCheck size={40} className="mx-auto mb-4 animate-pulse text-[#003300]" />
              <h2 className="mb-2 text-xs font-black uppercase tracking-[0.4em] text-[#00ff41]">ACCESS_DENIED</h2>
              <p className="mb-8 text-[10px] text-[#005500]">Se requiere CBU para operar. Inicializa tu cuenta bancaria.</p>
              <div className="mx-auto max-w-md border border-[#001a00] bg-black p-6">
                <SyncCbuModal onRecordCreated={loadData} />
              </div>
            </div>
          ) : (
            <>
              {/* ── MAIN ── */}
              {activeTab === 'main' && (
                <div className="space-y-6">
                  {/* Balance card */}
                  <div className="relative border border-[#004400] bg-black p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,65,0.03),transparent_60%)]" />
                    <div className="relative flex items-start justify-between mb-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#004400]">AVAILABLE_CREDITS</p>
                      <button onClick={() => setShowBalance(!showBalance)} className="text-[#003300] hover:text-[#00ff41] transition-colors">
                        {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-4xl font-black tracking-tighter sm:text-5xl" style={{ textShadow: '0 0 20px rgba(0,255,65,0.3)' }}>
                      {showBalance ? money(data?.balance ?? 0) : '$ ·····'}
                    </p>
                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-[#001a00] pt-4">
                      <div className="text-[10px] text-[#004400] space-y-1">
                        <p>CBU: <span className="text-[#00ff41]">{shortCbu(data?.accountNumber)}</span></p>
                        <p>ALIAS: <span className="text-[#00ff41]">{data?.alias || 'NONE'}</span></p>
                      </div>
                      <button onClick={handleCopyAlias} className="btn-terminal text-[9px] py-1.5 px-3">
                        {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                        {copied ? 'COPIED' : 'COPY_CBU'}
                      </button>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                      { label: 'XFER_FUNDS', icon: Send, tab: 'history' as TabId, action: () => setActiveTab('history') },
                      { label: 'XFER_LOG', icon: ReceiptText, tab: 'history' as TabId, action: () => setActiveTab('history') },
                      { label: 'ACCOUNT', icon: UserCircle, tab: 'accounts' as TabId, action: () => setActiveTab('accounts') },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="group flex flex-col items-center justify-center gap-3 border border-[#001a00] bg-black p-6 transition-all hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.06)]"
                      >
                        <item.icon size={22} className="text-[#004400] transition-colors group-hover:text-[#00ff41]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#004400] group-hover:text-[#00ff41]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── HISTORY (Transferencias) ── */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <TransferForm
                    currentBalance={data?.balance ?? 0}
                    loading={actionLoading}
                    onSubmit={handleTransfer}
                  />
                  <div className="border border-[#001a00] bg-black">
                    <div className="flex items-center justify-between border-b border-[#001a00] px-5 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff41]">TRANSACTION_LOG</p>
                      <p className="text-[9px] text-[#003300]">RECORDS: {movements.length}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[10px] uppercase">
                        <thead>
                          <tr className="border-b border-[#001a00] bg-[rgba(0,255,65,0.02)]">
                            <th className="px-4 py-3 text-left font-black tracking-widest text-[#003300]">TIMESTAMP</th>
                            <th className="px-4 py-3 text-left font-black tracking-widest text-[#003300]">SUBJECT</th>
                            <th className="px-4 py-3 text-left font-black tracking-widest text-[#003300]">CBU</th>
                            <th className="px-4 py-3 text-left font-black tracking-widest text-[#003300]">TYPE</th>
                            <th className="px-4 py-3 text-right font-black tracking-widest text-[#003300]">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-[#003300]">NO_RECORDS_FOUND</td></tr>
                          )}
                          {movements.map((tx, i) => {
                            const cbu = tx.to || tx.from;
                            return (
                              <tr key={i} className="border-b border-[#000d00] transition-colors hover:bg-[rgba(0,255,65,0.02)]">
                                <td className="px-4 py-3 text-[#004400] italic">{tx.date ? new Date(tx.date).toLocaleString('es-AR') : 'PENDING'}</td>
                                <td className="px-4 py-3 font-black text-[#00ff41]">{tx.counterpartyName || 'NODE_SYS'}</td>
                                <td className="px-4 py-3 text-[#003300]">{shortCbu(cbu)}</td>
                                <td className="px-4 py-3">
                                  <span className={`border px-2 py-0.5 ${tx.type === 'IN' ? 'border-[#004400] text-[#00ff41]' : 'border-[#550000] text-[#ff3333]'}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 text-right font-black ${tx.type === 'IN' ? 'text-[#00ff41]' : 'text-[#ff3333]'}`}>
                                  {tx.type === 'IN' ? '+' : '-'} {money(tx.amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACCOUNTS ── */}
              {activeTab === 'accounts' && (
                <div className="border border-[#001a00] bg-black p-6 space-y-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#00ff41]">ACCOUNT_PROPERTIES</h2>
                  <div className="space-y-4">
                    <Row label="HOLDER" value={data?.fullName || 'N/A'} />
                    <Row label="ACCOUNT_TYPE" value="SAVINGS_ARS_OFFSHORE" />
                    <Row label="CBU_HASH" value={data?.accountNumber || 'N/A'} />
                    <div className="border-b border-[#001a00] pb-4">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#004400]">ALIAS_IDENTITY</p>
                      {isEditingAlias ? (
                        <div className="flex gap-2">
                          <input
                            value={newAlias}
                            onChange={(e) => setNewAlias(e.target.value)}
                            className="input-terminal flex-1 text-xs"
                            placeholder="INPUT_NEW_ALIAS"
                          />
                          <button onClick={handleUpdateAlias} disabled={actionLoading} className="btn-terminal text-[9px] py-1.5 px-3">
                            {actionLoading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                            SAVE
                          </button>
                          <button onClick={() => setIsEditingAlias(false)} className="btn-terminal btn-danger text-[9px] py-1.5 px-3">
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="font-black text-[#00ff41]">{data?.alias || 'NOT_ASSIGNED'}</p>
                          <button onClick={() => { setNewAlias(data?.alias || ''); setIsEditingAlias(true); }} className="btn-terminal text-[9px] py-1 px-3">
                            EDIT_ALIAS
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <div className="border border-[#004400] bg-black p-8 text-center">
                  <ShieldCheck size={48} className="mx-auto mb-4 text-[#004400]" />
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#00ff41] mb-2">PROTOCOL_SHIELD_ACTIVE</h2>
                  <p className="text-[10px] text-[#005500] mb-6">AES-4096 Hybrid Encryption // Zero-Knowledge Auth via Clerk</p>
                  <p className="text-[9px] text-[#004400]">
                    La seguridad de la cuenta está gestionada por Clerk. Para cambiar contraseña o activar 2FA,
                    accedé desde el menú de tu perfil (ícono de usuario en el header).
                  </p>
                </div>
              )}

              {/* ── ADMIN PANEL ── */}
              {activeTab === 'admin' && (role === 'admin' || role === 'gerente') && (
                <AdminPanel getToken={getToken} currentRole={role} onNotice={showNotice} />
              )}

              {/* ── MANAGER PANEL ── */}
              {activeTab === 'manager' && role === 'gerente' && (
                <ManagerPanel getToken={getToken} onNotice={showNotice} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Transfer Form ─────────────────────────────────────────────────────────────

function TransferForm({
  currentBalance,
  loading,
  onSubmit,
}: {
  currentBalance: number;
  loading: boolean;
  onSubmit: (dest: string, amount: number, reason: string) => void;
}) {
  const [form, setForm] = useState({ dest: '', amount: '', reason: '' });
  const dest = form.dest.trim();
  const isCbu = /^\d{22}$/.test(dest);
  const isAlias = /^[a-zA-Z0-9._-]{3,30}$/.test(dest);
  const amount = Number(form.amount);
  const valid = (isCbu || isAlias) && amount > 0 && amount <= currentBalance;

  const destStatus = dest === '' ? null : isCbu ? 'CBU_VALID' : isAlias ? 'ALIAS_VALID' : 'FORMAT_INVALID';

  return (
    <div className="border border-[#001a00] bg-black p-6">
      <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#00ff41]">INIT_XFER_SEQUENCE</p>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">
            DESTINATION_ID (CBU 22 DIGITS OR ALIAS)
          </label>
          <input
            value={form.dest}
            onChange={(e) => setForm({ ...form, dest: e.target.value })}
            className="input-terminal"
            placeholder="0000000000000000000000 or nombre.apellido.banco"
            autoComplete="off"
          />
          {destStatus && (
            <p className={`mt-1 text-[9px] font-black ${(isCbu || isAlias) ? 'text-[#00aa22]' : 'text-[#ff3333]'}`}>
              &gt; {destStatus}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">
            AMOUNT (AVAILABLE: {money(currentBalance)})
          </label>
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-terminal"
            type="number"
            min="1"
            max={currentBalance}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">REASON</label>
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="input-terminal"
          >
            <option value="">SELECT_REASON</option>
            <option value="Capital Relocation">Capital Relocation</option>
            <option value="Asset Optimization">Asset Optimization</option>
            <option value="Honorarios">Honorarios</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <button
          onClick={() => { if (valid) onSubmit(dest, amount, form.reason || 'Transferencia'); }}
          disabled={!valid || loading}
          className="btn-terminal w-full justify-center py-3"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? 'PROCESSING...' : 'EXECUTE_XFER'}
        </button>
      </div>
    </div>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────────

function AdminPanel({
  getToken,
  currentRole,
  onNotice,
}: {
  getToken: () => Promise<string | null>;
  currentRole: Role;
  onNotice: (n: Notice) => void;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      onNotice({ type: 'error', msg: 'ERR: CANNOT_FETCH_USERS' });
    } finally { setLoading(false); }
  }, [getToken, onNotice]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAdjust = async (userId: string) => {
    const amount = Number(adjustAmount);
    if (!amount) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error();
      onNotice({ type: 'success', msg: `BALANCE_ADJUSTED: ${amount > 0 ? '+' : ''}${amount}` });
      setAdjustId(null);
      setAdjustAmount('');
      await fetchUsers();
    } catch {
      onNotice({ type: 'error', msg: 'ERR: BALANCE_ADJUST_FAILED' });
    }
  };

  return (
    <div className="border border-[#002a00] bg-black">
      <div className="flex items-center justify-between border-b border-[#001a00] px-5 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff41]">
          ADMIN_PANEL // ALL_NODES
        </p>
        <button onClick={fetchUsers} className="btn-terminal text-[9px] py-1 px-3">
          <RefreshCw size={10} /> REFRESH
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#003300]"><Loader2 size={20} className="mx-auto animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] uppercase">
            <thead>
              <tr className="border-b border-[#001a00]">
                {['HOLDER', 'EMAIL', 'ROLE', 'CBU', 'BALANCE', 'ACTIONS'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black tracking-widest text-[#003300]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr key={u.id} className="border-b border-[#000d00] hover:bg-[rgba(0,255,65,0.02)]">
                    <td className="px-4 py-3 font-black text-[#00ff41]">{u.fullName}</td>
                    <td className="px-4 py-3 text-[#005500]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`border px-2 py-0.5 ${
                        u.role === 'gerente' ? 'border-yellow-700 text-yellow-500' :
                        u.role === 'admin' ? 'border-[#004400] text-[#00ff41]' :
                        'border-[#002200] text-[#004400]'
                      }`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#003300]">{shortCbu(u.accountNumber)}</td>
                    <td className="px-4 py-3 font-black text-[#00ff41]">{money(u.balance)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAdjustId(adjustId === u.id ? null : u.id)}
                        className="btn-terminal text-[8px] py-1 px-2"
                      >
                        <ChevronDown size={9} />
                        ADJUST
                      </button>
                    </td>
                  </tr>
                  {adjustId === u.id && (
                    <tr key={`${u.id}-adj`} className="border-b border-[#001a00] bg-[rgba(0,255,65,0.02)]">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] text-[#004400]">BALANCE_DELTA:</p>
                          <input
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            className="input-terminal w-40 text-xs py-1"
                            type="number"
                            placeholder="+1000 or -500"
                          />
                          <button onClick={() => handleAdjust(u.id)} className="btn-terminal text-[9px] py-1 px-3">COMMIT</button>
                          <button onClick={() => setAdjustId(null)} className="btn-terminal btn-danger text-[9px] py-1 px-2">
                            <X size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Manager Panel ─────────────────────────────────────────────────────────────

function ManagerPanel({
  getToken,
  onNotice,
}: {
  getToken: () => Promise<string | null>;
  onNotice: (n: Notice) => void;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      onNotice({ type: 'error', msg: 'ERR: MGR_FETCH_FAILED' });
    } finally { setLoading(false); }
  }, [getToken, onNotice]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      onNotice({ type: 'success', msg: `ROLE_UPDATED: ${ROLE_LABEL[newRole]}` });
      await fetchUsers();
    } catch {
      onNotice({ type: 'error', msg: 'ERR: ROLE_UPDATE_FAILED' });
    }
  };

  return (
    <div className="border border-yellow-900/50 bg-black">
      <div className="border-b border-yellow-900/30 px-5 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">
          MANAGER_PANEL // CLEARANCE: GERENTE
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 size={20} className="mx-auto animate-spin text-yellow-600" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] uppercase">
            <thead>
              <tr className="border-b border-yellow-900/30">
                {['HOLDER', 'EMAIL', 'CURRENT_ROLE', 'BALANCE', 'SET_ROLE'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black tracking-widest text-yellow-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#0d0d00] hover:bg-yellow-900/5">
                  <td className="px-4 py-3 font-black text-yellow-400">{u.fullName}</td>
                  <td className="px-4 py-3 text-yellow-900">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`border px-2 py-0.5 ${
                      u.role === 'gerente' ? 'border-yellow-700 text-yellow-500' :
                      u.role === 'admin' ? 'border-[#004400] text-[#00ff41]' :
                      'border-[#002200] text-[#004400]'
                    }`}>{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td className="px-4 py-3 font-black text-yellow-400">{money(u.balance)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="bg-black border border-yellow-900 text-yellow-500 text-[9px] px-2 py-1 font-mono uppercase outline-none cursor-pointer hover:border-yellow-600"
                    >
                      <option value="user">CLIENT</option>
                      <option value="admin">ADMIN</option>
                      <option value="gerente">MANAGER</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#001a00] pb-4">
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[#004400]">{label}</p>
      <p className="font-black text-[#00ff41] break-all">{value}</p>
    </div>
  );
}
