'use client';

import { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { API_URL } from '@/lib/api';
import { ShieldCheck, User, CreditCard, Fingerprint, Loader2, Database, AlertCircle } from "lucide-react";

export default function SyncCbuModal({ onRecordCreated }: { onRecordCreated: () => void }) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        setError("SESSION_EXPIRED: AUTH_TOKEN_NOT_FOUND");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || API_URL}/users/sync-cbu`, {
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
      });

      if (res.ok) {
        onRecordCreated();
      } else {
        const err = await res.json();
        setError(`REFUSED: ${err.message || "VALIDATION_FAILED"}`);
      }
    } catch (error) {
      setError("CONNECTION_LOST: CENTRAL_NODE_UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  return (
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