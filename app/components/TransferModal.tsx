'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { Loader2, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TransferModal({ token, onTransferSuccess }: { token: string; onTransferSuccess: () => void }) {
  const [data, setData] = useState({ destinatario: '', monto: '', motivo: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const dest = data.destinatario.trim();
  const isCbu = /^\d{22}$/.test(dest);
  const isAlias = /^[a-zA-Z0-9._-]{3,30}$/.test(dest);
  const canSubmit = (isCbu || isAlias) && Number(data.monto) > 0;

  const handleTransfer = async () => {
    if (!canSubmit) { setStatus('error'); return; }

    try {
      setLoading(true);
      setStatus('idle');

      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinatario: dest,
          monto: Number(data.monto),
          motivo: data.motivo || 'Transferencia',
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => onTransferSuccess(), 1500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#004400] bg-black p-6 font-mono shadow-[0_0_20px_rgba(0,255,65,0.06)]">
      <h3 className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff41]">
        <Send size={14} /> INIT_XFER_SEQUENCE
      </h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">
            DESTINATION (CBU OR ALIAS)
          </label>
          <input
            className="input-terminal text-sm"
            placeholder="0000000000000000000000 or nombre.banco"
            value={data.destinatario}
            onChange={(e) => setData({ ...data, destinatario: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">AMOUNT</label>
          <input
            className="input-terminal text-sm"
            type="number"
            placeholder="0"
            value={data.monto}
            onChange={(e) => setData({ ...data, monto: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#004400]">REASON</label>
          <input
            className="input-terminal text-sm"
            placeholder="Capital Relocation / Services"
            value={data.motivo}
            onChange={(e) => setData({ ...data, motivo: e.target.value })}
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={loading || !canSubmit}
          className="btn-terminal w-full justify-center py-3 mt-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {loading ? 'PROCESSING...' : 'EXECUTE_XFER'}
        </button>

        {status === 'error' && (
          <div className="flex items-center gap-2 border border-[#550000] bg-[rgba(255,51,51,0.04)] p-2 text-[9px] font-black text-[#ff3333]">
            <AlertTriangle size={11} /> ERR: XFER_FAILED — CHECK_INPUT
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 border border-[#004400] bg-[rgba(0,255,65,0.04)] p-2 text-[9px] font-black text-[#00ff41]">
            <CheckCircle2 size={11} /> STATUS_OK: FUNDS_DISPATCHED
          </div>
        )}
      </div>
    </div>
  );
}
