'use client';

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { getBankingData, getTransactionHistory, API_URL } from "@/lib/api";
import {
  Terminal, Send, Loader2, Eye, EyeOff, X, ReceiptText, Lock, Database,
  LayoutDashboard, Activity, LogOut, ShieldCheck, UserCircle, Copy, CheckCircle2
} from "lucide-react";
import SyncUser from "../components/SyncUser";
import SyncCbuModal from "../components/SyncCbuModal";

// --- HELPERS ---
const hasLinkedCbu = (accountNumber?: string | null) => 
  Boolean(accountNumber && /^\d{22}$/.test(accountNumber));

const money = (amount: number) =>
  Number(amount || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'main' | 'accounts' | 'history' | 'security' | 'network'>('main');
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Alias & Security States
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [aliasStatus, setAliasStatus] = useState<{type: 'error' | 'success', msg: string} | null>(null);
  const [passForm, setPassForm] = useState({ newPass: "", confirmPass: "" });

  // Transfer States
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
  try {
    setLoading(true);
    const token = await getToken();
    if (token && user) {
      // Añadimos un timestamp para forzar al backend a darnos datos frescos
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bankData = await res.json();
      
      const txHistory = await getTransactionHistory(token).catch(() => []);
      
      setData(bankData);
      setHistory(txHistory);
    }
  } catch (err) {
    console.error("SYS_BOOT_ERR:", err);
  } finally {
    setLoading(false);
  }
}, [getToken, user]);
  useEffect(() => {
    if (user) loadDashboardData();
  }, [loadDashboardData, user]);

  // FIX: Cambio de Alias (Redirigido a Proxy /api/user-actions)
  // FIX: Cambio de Alias - Apuntando directamente al Backend de NestJS
  // app/dashboard/page.tsx

  const handleUpdateAlias = async () => {
    if (!newAlias) return;
    try {
      setTransferLoading(true);
      const token = await getToken();
      
      // 1. Usamos la ruta correcta: /users/sync-cbu
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync-cbu`, {
        method: "POST", 
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        

        body: JSON.stringify({ 
          // Usamos los datos de Clerk (user) en lugar de 'data'
          nombre: user?.firstName || "Sujeto", 
          apellido: user?.lastName || "Cayman",
          dni: "12345678", // O el DNI real si lo tienes en un estado
          alias: newAlias.toLowerCase() 
        }),
      });

      // 3. Si el backend responde 404, 400 o 500, lanzamos error
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "FALLO_EN_SERVIDOR");
      }

      setAliasStatus({ type: 'success', msg: "ALIAS_REWRITTEN_SUCCESSFULLY" });
      setIsEditingAlias(false);
      
      // 4. Refrescamos los datos para que el nuevo alias aparezca en pantalla
      await loadDashboardData();

    } catch (err: any) {
      console.error("ALIAS_ERR:", err);
      setAliasStatus({ type: 'error', msg: "ALIAS_REWRITE_FAILED" });
    } finally {
      setTransferLoading(false);
      setTimeout(() => setAliasStatus(null), 3000);
    }
  };

  // FIX: Cambio de Contraseña (Redirigido a Proxy /api/user-actions)
  // En app/dashboard/page.tsx
// Dentro de DashboardPage en app/dashboard/page.tsx
const handlePasswordChange = async () => {
  // 1. Validaciones básicas
  if (!passForm.newPass || passForm.newPass !== passForm.confirmPass) {
    setAliasStatus({ type: 'error', msg: "PASSWORDS_DO_NOT_MATCH_OR_EMPTY" });
    return;
  }
  
  try {
    setTransferLoading(true);

    // 2. Obtener el token de sesión de Clerk para autenticar ante tu Backend
    // 'getToken' viene del hook useAuth() de Clerk
    const token = await getToken();

    // 3. Llamada a tu servidor NestJS (Cayman Backend)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ newPassword: passForm.newPass }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Si el backend tiró error (ej: contraseña muy corta), usamos ese mensaje
      throw new Error(data.message || "SEC_UPDATE_FAILED");
    }
    
    // 4. Éxito
    setAliasStatus({ type: 'success', msg: "CLERK_CREDENTIALS_REWRITTEN" });
    setPassForm({ newPass: "", confirmPass: "" });

  } catch (err: any) {
    console.error("AUTH_ERR:", err);
    // Formateamos el mensaje para que combine con tus estilos (ej: "PASSWORD_TOO_SHORT")
    const errorMsg = err.message.toUpperCase().replace(/ /g, "_");
    setAliasStatus({ type: 'error', msg: errorMsg });
  } finally {
    setTransferLoading(false);
    // Limpiar el mensaje después de 4 segundos
    setTimeout(() => setAliasStatus(null), 4000);
  }
};

  const handleCopyCbu = () => {
    if (data?.accountNumber) {
      navigator.clipboard.writeText(data.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTransfer = async (cbuDestino: string, monto: number, motivo: string) => {
    try {
      setTransferLoading(true);
      setTransferError(null);
      const token = await getToken();
      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cbuDestino, monto, motivo }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "XFER_FAILED");
      setTransferSuccess(`XFER_SUCCESS: CREDITS_INJECTED`);
      setTimeout(() => { setShowTransferModal(false); setTransferSuccess(null); }, 2000);
      await loadDashboardData();
    } catch (err: any) {
      setTransferError(err.message || "XFER_FATAL_ERROR");
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-emerald-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="animate-pulse tracking-[0.2em]">BOOTING_CAYMAN_OS...</p>
        </div>
      </div>
    );
  }

  const linkedCbu = hasLinkedCbu(data?.accountNumber);
  const movements = history.length ? history : data?.transactions ?? [];

  return (
    <div className="min-h-screen bg-black px-4 py-6 font-mono text-emerald-500 sm:px-6 lg:px-8">
      <SyncUser />
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%]" />

      <main className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        
        {/* SIDEBAR OPERATIVO */}
        <aside className="hidden border border-emerald-900 bg-black/80 p-4 lg:block">
          <div className="mb-8 flex items-center gap-3 border-b border-emerald-900 pb-4">
            <Terminal size={24} className="text-emerald-400" />
            <div>
              <p className="text-xs font-bold tracking-widest uppercase italic">Cayman_Bank</p>
              <p className="text-[10px] text-emerald-800 uppercase">v3.0.4-stable</p>
            </div>
          </div>
          <nav className="space-y-1 text-[11px] uppercase tracking-tighter">
            {[
              { id: 'main', label: 'Dash_Main', icon: LayoutDashboard },
              { id: 'accounts', label: 'Accounts', icon: UserCircle },
              { id: 'history', label: 'Xfer_Log', icon: ReceiptText },
              { id: 'security', label: 'Security', icon: ShieldCheck },
              { id: 'network', label: 'Network', icon: Activity },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className={`flex w-full items-center gap-3 px-3 py-3 transition-all ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500' : 'text-emerald-900 hover:text-emerald-500'}`}
              >
                 <item.icon size={14} /> - {item.label}
              </button>
            ))}
            <div className="pt-8 mt-8 border-t border-emerald-900/50">
               <SignOutButton>
                <button className="flex w-full items-center gap-3 px-3 py-2 text-red-900 hover:text-red-500 transition-colors uppercase font-bold italic underline-offset-4 hover:underline">
                  <LogOut size={14} /> Terminate_Session
                </button>
               </SignOutButton>
            </div>
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <section className="space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-900 pb-4">
            <div>
              <p className="text-[10px] uppercase text-emerald-800 font-bold tracking-widest">Node_Status: ONLINE [TEST_ENV]</p>
              <h1 className="text-xl font-black uppercase text-emerald-400 tracking-tighter">
                {loading ? "FETCHING_IDENTITY..." : (data?.fullName || "UNKNOWN_SUBJECT")}
              </h1>
            </div>
            <button onClick={loadDashboardData} className="border border-emerald-500 px-4 py-2 text-[10px] uppercase hover:bg-emerald-500 hover:text-black transition-all">
              [ REFRESH_SYSTEM ]
            </button>
          </header>

          {!linkedCbu ? (
            <div className="border border-emerald-500 bg-emerald-950/5 p-12 text-center">
              <Lock size={48} className="mx-auto mb-4 text-emerald-800 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Access_Denied</h2>
              <div className="mx-auto max-w-md text-left mt-8 bg-black border border-emerald-900 p-6 shadow-2xl">
                <SyncCbuModal onRecordCreated={loadDashboardData} />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'main' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="border border-emerald-500 bg-emerald-950/10 p-6 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">Available_Credits</p>
                        <button onClick={() => setShowBalance(!showBalance)} className="text-emerald-800 hover:text-emerald-400">
                          {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-5xl font-black text-emerald-400 tracking-tighter mb-10">
                        {showBalance ? money(data?.balance || 0) : "********"}
                      </p>
                      <div className="flex justify-between items-end text-[10px]">
                        <div className="text-emerald-900 font-bold uppercase italic">
                           <p>CBU: {data?.accountNumber}</p>
                           <p>Alias: {data?.alias || "NONE"}</p>
                        </div>
                        <button onClick={handleCopyCbu} className="border border-emerald-900 px-3 py-1 uppercase hover:text-emerald-400 transition-all flex items-center gap-2">
                          {copied ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
                          {copied ? "COPIED" : "COPY_CBU"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setShowTransferModal(true)} className="border border-emerald-900 bg-black flex flex-col items-center justify-center gap-3 group hover:border-emerald-500 transition-all">
                        <Send size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase">Xfer_Funds</span>
                      </button>
                      <button onClick={() => setActiveTab('history')} className="border border-emerald-900 bg-black flex flex-col items-center justify-center gap-3 group hover:border-emerald-500 transition-all">
                        <ReceiptText size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase">Log_Dump</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="border border-emerald-900 bg-black p-8 animate-in slide-in-from-right duration-300">
                    <h2 className="text-xl font-black uppercase text-emerald-400 mb-8 tracking-tighter">Account_Properties</h2>
                    <div className="space-y-8 max-w-2xl">
                        <div className="border-b border-emerald-900/30 pb-4">
                           <p className="text-[10px] text-emerald-800 uppercase font-bold mb-2 tracking-widest">Account_Type</p>
                           <p className="text-emerald-400 uppercase font-black tracking-tight italic">Savings_Account_ARS_High_Yield</p>
                        </div>
                        <div className="border-b border-emerald-900/30 pb-4">
                           <p className="text-[10px] text-emerald-800 uppercase font-bold mb-2 tracking-widest">CBU_Address_Hash</p>
                           <p className="text-emerald-400 font-mono text-sm tracking-[0.2em]">{data?.accountNumber}</p>
                        </div>
                        <div className="border-b border-emerald-900/30 pb-4">
                           <p className="text-[10px] text-emerald-800 uppercase font-bold mb-2 tracking-widest">Alias_Identity</p>
                           {isEditingAlias ? (
                             <div className="space-y-3">
                               <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    value={newAlias}
                                    onChange={(e) => setNewAlias(e.target.value)}
                                    className="bg-black border border-emerald-500 text-emerald-400 text-sm px-4 py-2 outline-none w-full font-mono focus:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    placeholder="INPUT_NEW_ALIAS"
                                  />
                                  <button onClick={handleUpdateAlias} className="bg-emerald-500 text-black px-4 font-black uppercase text-[10px]">SAVE</button>
                                  <button onClick={() => setIsEditingAlias(false)} className="border border-red-500 text-red-500 px-4 font-black uppercase text-[10px]">X</button>
                               </div>
                             </div>
                           ) : (
                             <div className="flex justify-between items-center">
                                <p className="text-emerald-400 uppercase italic font-bold text-sm tracking-wide">
                                  {data?.alias || "NOT_ASSIGNED_BY_NODE"}
                                </p>
                                <button onClick={() => { setNewAlias(data?.alias || ""); setIsEditingAlias(true); }} className="text-[10px] border border-emerald-800 px-3 py-1 text-emerald-800 hover:text-emerald-400 hover:border-emerald-400 transition-all font-bold">
                                  [ EDIT_ALIAS ]
                                </button>
                             </div>
                           )}
                           {aliasStatus && (
                              <p className={`text-[10px] mt-2 font-black italic tracking-widest ${aliasStatus.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                                &gt; {aliasStatus.msg}
                              </p>
                           )}
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="border border-emerald-900 bg-black p-4 animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between items-center mb-6 px-4">
                    <h2 className="text-sm font-black uppercase text-emerald-400 tracking-tighter">Transaction_Log_History</h2>
                    <p className="text-[9px] text-emerald-900 uppercase font-bold italic">Total_Records: {movements.length}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px] uppercase text-left">
                      <thead>
                        <tr className="border-b border-emerald-900 bg-emerald-900/10">
                          <th className="p-4 text-emerald-800 tracking-widest">Timestamp</th>
                          <th className="p-4 text-emerald-800 tracking-widest">Subject/Target</th>
                          <th className="p-4 text-emerald-800 tracking-widest">Type</th>
                          <th className="p-4 text-emerald-800 tracking-widest text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((tx: any, idx: number) => (
                          <tr key={idx} className="border-b border-emerald-900/30 hover:bg-emerald-500/5 transition-colors group">
                            <td className="p-4 text-emerald-700 font-mono italic">{tx.date ? new Date(tx.date).toLocaleString() : 'PENDING'}</td>
                            <td className="p-4 font-bold text-emerald-500 group-hover:text-emerald-300">{tx.to || tx.from || 'NODE_SYS'}</td>
                            <td className="p-4"><span className={`px-2 py-0.5 border ${tx.type === 'IN' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>{tx.type}</span></td>
                            <td className={`p-4 text-right font-black ${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>{money(tx.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="grid lg:grid-cols-2 gap-6 animate-in zoom-in duration-300">
                  <div className="border border-emerald-500 bg-black p-8 text-center">
                    <ShieldCheck size={56} className="mx-auto mb-6 text-emerald-500" />
                    <h2 className="text-xl font-black uppercase text-emerald-400 mb-2 tracking-tighter">Protocol_Shield_v3</h2>
                    <p className="text-[11px] text-emerald-800 uppercase mb-8 font-bold italic tracking-widest">AES-4096 Hybrid Encryption Active.</p>
                    <div className="grid gap-4">
                      <button className="border border-emerald-900 p-3 text-[10px] font-black uppercase hover:border-emerald-500 transition-all">Rotate_API_Keys</button>
                      <button onClick={() => window.location.reload()} className="border border-emerald-900 p-3 text-[10px] font-black uppercase hover:border-emerald-500 transition-all">Purge_Caches</button>
                    </div>
                  </div>

                  <div className="border border-emerald-900 bg-black p-8">
                    <h2 className="text-sm font-black uppercase text-emerald-400 mb-6 flex items-center gap-2">
                      <Lock size={14} /> Update_Credentials
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-emerald-800 font-black uppercase">New_Passphrase</label>
                        <input 
                          type="password" 
                          value={passForm.newPass} 
                          onChange={(e) => setPassForm({...passForm, newPass: e.target.value})}
                          className="w-full bg-black border border-emerald-900 p-3 text-emerald-400 text-sm outline-none focus:border-emerald-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-emerald-800 font-black uppercase">Confirm_Identity</label>
                        <input 
                          type="password" 
                          value={passForm.confirmPass} 
                          onChange={(e) => setPassForm({...passForm, confirmPass: e.target.value})}
                          className="w-full bg-black border border-emerald-900 p-3 text-emerald-400 text-sm outline-none focus:border-emerald-500" 
                        />
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        disabled={transferLoading}
                        className="w-full bg-emerald-500 text-black py-4 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        {transferLoading ? "REWRITING_DATA..." : "COMMIT_CREDENTIALS"}
                      </button>
                      {aliasStatus && (
                         <p className={`text-[10px] text-center font-bold italic uppercase mt-4 ${aliasStatus.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                           &gt; {aliasStatus.msg}
                         </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* MODAL TRANSFERENCIA (Restaurado Completo) */}
        {showTransferModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-md border border-emerald-500 bg-black p-8 shadow-[0_0_60px_rgba(0,255,0,0.15)]">
              <button onClick={() => setShowTransferModal(false)} className="absolute right-4 top-4 text-emerald-800 hover:text-emerald-400 transition-colors">
                <X size={24} />
              </button>
              <h3 className="mb-8 text-xl font-black uppercase text-emerald-400 border-b border-emerald-900 pb-3 flex items-center gap-3">
                <Send size={22} /> INIT_XFER_SEQUENCE
              </h3>
              {transferError && <div className="mb-4 border border-red-500 p-3 bg-red-500/10 text-[10px] text-red-500 uppercase italic font-bold tracking-widest animate-shake">ERR: {transferError}</div>}
              {transferSuccess && <div className="mb-4 border border-emerald-400 p-3 bg-emerald-400/10 text-[10px] text-emerald-400 font-black animate-pulse uppercase tracking-[0.2em]">SUCCESS: {transferSuccess}</div>}
              <TransferForm currentBalance={data?.balance || 0} onSubmit={handleTransfer} loading={transferLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-componente de Formulario (Integrado para que no falte nada)
function TransferForm({ currentBalance, onSubmit, loading }: any) {
  const [formData, setFormData] = useState({ cbu: "", amount: "", reason: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCbu = formData.cbu.replace(/\D/g, "");
    const numAmount = Number(formData.amount);
    if (cleanCbu.length !== 22 || numAmount <= 0 || numAmount > currentBalance) return;
    onSubmit(cleanCbu, numAmount, formData.reason || "EXTERNAL_XFER_ORDER");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="text-[10px] uppercase text-emerald-800 font-black tracking-widest">Target_CBU</label>
        <input
          type="text"
          value={formData.cbu}
          onChange={(e) => setFormData({ ...formData, cbu: e.target.value.replace(/\D/g, "") })}
          className="w-full bg-black border border-emerald-900 p-4 text-emerald-400 font-mono text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900"
          placeholder="0000000000000000000000"
          maxLength={22}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase text-emerald-800 font-black tracking-widest">Credit_Amount</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full bg-black border border-emerald-900 p-4 text-emerald-400 font-mono text-sm outline-none focus:border-emerald-500 transition-all"
          placeholder="0.00"
          required
        />
        <p className="text-[9px] text-emerald-900 uppercase font-black mt-1 italic tracking-tighter">Available_Pool: {money(currentBalance)}</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full border border-emerald-500 bg-emerald-500/5 py-5 text-[11px] uppercase font-black tracking-[0.3em] text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all flex justify-center items-center gap-3 disabled:opacity-30"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
        {loading ? "EXECUTING..." : "EXECUTE_XFER_SEQUENCE"}
      </button>
    </form>
  );
}