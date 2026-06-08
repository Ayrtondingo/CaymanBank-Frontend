'use client';

<<<<<<< HEAD
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, CheckCircle2, CreditCard, Fingerprint, Loader2, User } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function SyncCbuModal({ onRecordCreated }: { onRecordCreated: () => void }) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ nombre: "", apellido: "", dni: "" });
=======
import { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { API_URL } from '@/lib/api';
import { ShieldCheck, User, CreditCard, Fingerprint, Loader2, Database, AlertCircle } from "lucide-react";

export default function SyncCbuModal({ onRecordCreated }: { onRecordCreated: () => void }) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '' });
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
<<<<<<< HEAD
        setError("Tu sesion expiro. Ingresa nuevamente.");
=======
        setError("SESSION_EXPIRED: AUTH_TOKEN_NOT_FOUND");
        setLoading(false);
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
        return;
      }

      const res = await fetch(`${API_URL}/users/sync-cbu`, {
<<<<<<< HEAD
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
=======
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
        }),
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
      });

      if (res.ok) {
        onRecordCreated();
      } else {
        const err = await res.json();
<<<<<<< HEAD
        setError(err.message || "No pudimos validar los datos.");
      }
    } catch (error) {
      console.error("CBU sync error:", error);
      setError("No pudimos conectar con el servidor.");
=======
        setError(`REFUSED: ${err.message || "VALIDATION_FAILED"}`);
      }
    } catch (error) {
      setError("CONNECTION_LOST: CENTRAL_NODE_UNREACHABLE");
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputWithIcon
        icon={User}
        label="Nombre"
        value={formData.nombre}
        onChange={(value) => setFormData({ ...formData, nombre: value })}
        placeholder="Maria"
      />
      <InputWithIcon
        icon={Fingerprint}
        label="Apellido"
        value={formData.apellido}
        onChange={(value) => setFormData({ ...formData, apellido: value })}
        placeholder="Gomez"
      />
      <InputWithIcon
        icon={CreditCard}
        label="DNI"
        value={formData.dni}
        onChange={(value) => setFormData({ ...formData, dni: value.replace(/\D/g, "") })}
        placeholder="12345678"
        inputMode="numeric"
      />

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="primary-button w-full">
        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
        {loading ? "Validando..." : "Activar cuenta"}
      </button>
    </form>
  );
}

function InputWithIcon({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
        <input
          className="input pl-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          required
        />
      </span>
    </label>
  );
}
=======
    <div className="bg-black font-mono text-emerald-500">
      <div className="mb-6 flex items-center gap-3 border-b border-emerald-900 pb-4">
        <div className="border border-emerald-500/30 p-2 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <ShieldCheck className="text-emerald-400" size={24} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Identity_Binding</h2>
          <p className="text-[10px] uppercase text-emerald-800 tracking-widest">Encrypting_personal_data_packet...</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <User className="absolute left-3 top-3.5 text-emerald-800 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            className="w-full border border-emerald-900 bg-black/50 p-3 pl-10 text-sm text-emerald-400 outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_10px_rgba(16,185,129,0.1)] placeholder:text-emerald-900"
            placeholder="FIRST_NAME"
            required
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="relative group">
          <Fingerprint className="absolute left-3 top-3.5 text-emerald-800 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            className="w-full border border-emerald-900 bg-black/50 p-3 pl-10 text-sm text-emerald-400 outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_10px_rgba(16,185,129,0.1)] placeholder:text-emerald-900"
            placeholder="LAST_NAME"
            required
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="relative group">
          <CreditCard className="absolute left-3 top-3.5 text-emerald-800 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            className="w-full border border-emerald-900 bg-black/50 p-3 pl-10 text-sm text-emerald-400 outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_10px_rgba(16,185,129,0.1)] placeholder:text-emerald-900"
            placeholder="ID_NUMBER_RAW"
            type="text"
            pattern="\d*"
            required
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          />
        </div>

        {error && (
          <div className="border border-red-900/50 bg-red-950/10 p-2 text-[10px] text-red-500 flex items-center gap-2 animate-pulse">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative mt-4 flex w-full items-center justify-center gap-2 border border-emerald-500 bg-emerald-500/10 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Syncing_Node...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Database size={16} />
              <span>Link_Entity</span>
            </div>
          )}
          {/* Sutil decorado de botón hacker */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400"></div>
        </button>
      </form>
    </div>
  );
}
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
