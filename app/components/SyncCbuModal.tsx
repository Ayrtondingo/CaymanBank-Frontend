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

      const res = await fetch(`${API_URL}/users/sync-cbu`, {
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
    } catch {
      setError("CONNECTION_LOST: CENTRAL_NODE_UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black font-mono text-[#00ff41]">
      <div className="mb-5 flex items-center gap-3 border-b border-[#001a00] pb-4">
        <ShieldCheck size={20} className="text-[#004400]" />
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff41]">IDENTITY_BINDING</h2>
          <p className="text-[9px] uppercase text-[#003300] tracking-widest">Encrypting personal data packet...</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-3 text-[#004400]" size={16} />
          <input
            className="input-terminal pl-9 text-sm"
            placeholder="FIRST_NAME"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
        </div>

        <div className="relative">
          <Fingerprint className="absolute left-3 top-3 text-[#004400]" size={16} />
          <input
            className="input-terminal pl-9 text-sm"
            placeholder="LAST_NAME"
            required
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
          />
        </div>

        <div className="relative">
          <CreditCard className="absolute left-3 top-3 text-[#004400]" size={16} />
          <input
            className="input-terminal pl-9 text-sm"
            placeholder="ID_NUMBER"
            type="text"
            pattern="\d*"
            inputMode="numeric"
            required
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 border border-[#550000] bg-[rgba(255,51,51,0.04)] p-2 text-[9px] font-black uppercase text-[#ff3333]">
            <AlertCircle size={12} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-terminal w-full justify-center py-3 mt-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
          {loading ? 'SYNCING_NODE...' : 'LINK_ENTITY'}
        </button>
      </form>
    </div>
  );
}
