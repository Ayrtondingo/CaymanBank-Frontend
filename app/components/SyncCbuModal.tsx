'use client';

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, CheckCircle2, CreditCard, Fingerprint, Loader2, User } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function SyncCbuModal({ onRecordCreated }: { onRecordCreated: () => void }) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ nombre: "", apellido: "", dni: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        setError("Tu sesion expiro. Ingresa nuevamente.");
        return;
      }

      const res = await fetch(`${API_URL}/users/sync-cbu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onRecordCreated();
      } else {
        const err = await res.json();
        setError(err.message || "No pudimos validar los datos.");
      }
    } catch (error) {
      console.error("CBU sync error:", error);
      setError("No pudimos conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
