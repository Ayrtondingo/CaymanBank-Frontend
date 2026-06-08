'use client';

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function TransferModal({
  token,
  onTransferSuccess,
}: {
  token: string;
  onTransferSuccess: () => void;
}) {
  const [data, setData] = useState({ cbuDestino: "", monto: "", motivo: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const cleanCbu = data.cbuDestino.replace(/\D/g, "");
  const amount = Number(data.monto);
  const canSubmit = cleanCbu.length === 22 && amount > 0;

  const handleTransfer = async () => {
    if (!canSubmit) {
      setStatus("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("idle");

      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cbuDestino: cleanCbu,
          monto: amount,
          motivo: data.motivo || "Transferencia",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => onTransferSuccess(), 1200);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold tracking-tight">
        <Send size={20} className="text-[var(--brand)]" />
        Nueva transferencia
      </h3>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">CBU destino</span>
          <input
            className="input"
            value={data.cbuDestino}
            placeholder="0000000000000000000000"
            inputMode="numeric"
            maxLength={22}
            onChange={(e) => setData({ ...data, cbuDestino: e.target.value.replace(/\D/g, "") })}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Monto</span>
          <input
            className="input"
            value={data.monto}
            type="number"
            min="1"
            placeholder="$ 0"
            onChange={(e) => setData({ ...data, monto: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Motivo</span>
          <input
            className="input"
            value={data.motivo}
            placeholder="Alquiler, servicios, honorarios"
            onChange={(e) => setData({ ...data, motivo: e.target.value })}
          />
        </label>

        <button onClick={handleTransfer} disabled={loading || !canSubmit} className="primary-button w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {loading ? "Procesando..." : "Transferir"}
        </button>

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            <AlertTriangle size={18} />
            Revisa el CBU y el monto antes de continuar.
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
            <CheckCircle2 size={18} />
            Transferencia enviada correctamente.
          </div>
        )}
      </div>
    </div>
  );
}
