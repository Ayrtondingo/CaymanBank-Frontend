'use client';
import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { Loader2, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TransferModal({ token, onTransferSuccess }: { token: string, onTransferSuccess: () => void }) {
  const [data, setData] = useState({ cbuDestino: '', monto: '', motivo: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTransfer = async () => {
    if (data.cbuDestino.length !== 22) {
      alert("ERROR: CBU_INVALID_LENGTH");
      return;
    }

    try {
      setLoading(true);
      setStatus('idle');
      
      const res = await fetch(`${API_URL}/transactions/transfer`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          cbuDestino: data.cbuDestino,
          monto: Number(data.monto),
          motivo: data.motivo
        }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => onTransferSuccess(), 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-emerald-500 bg-black shadow-[0_0_20px_rgba(16,185,129,0.1)] font-mono">
      <h3 className="text-sm font-black mb-6 uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2">
        <Send size={16} /> Init_Transfer_Sequence
      </h3>
      
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-emerald-800 uppercase font-bold">Target_Address (CBU)</label>
          <input 
            className="w-full bg-black border border-emerald-900 p-2 text-emerald-400 outline-none focus:border-emerald-500 transition-colors" 
            placeholder="0000000000000000000000" 
            maxLength={22}
            onChange={e => setData({...data, cbuDestino: e.target.value.replace(/\D/g, '')})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-emerald-800 uppercase font-bold">Amount_To_Transfer</label>
          <input 
            className="w-full bg-black border border-emerald-900 p-2 text-emerald-400 outline-none focus:border-emerald-500 transition-colors" 
            type="number" 
            placeholder="0.00" 
            onChange={e => setData({...data, monto: e.target.value})} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-emerald-800 uppercase font-bold">Transfer_Subject</label>
          <input 
            className="w-full bg-black border border-emerald-900 p-2 text-emerald-400 outline-none focus:border-emerald-500 transition-colors" 
            placeholder="E.g. Services, Rent, Others" 
            onChange={e => setData({...data, motivo: e.target.value})} 
          />
        </div>

        <button 
          onClick={handleTransfer} 
          disabled={loading}
          className="mt-2 bg-emerald-500 text-black font-black p-3 uppercase text-xs tracking-widest hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          {loading ? 'Processing...' : 'Execute_Command'}
        </button>

        {status === 'error' && (
          <div className="mt-2 border border-red-900 bg-red-950/20 p-2 text-[10px] text-red-500 flex items-center gap-2 animate-pulse">
            <AlertTriangle size={12} /> STATUS_CRITICAL: XFER_FAILED
          </div>
        )}
        
        {status === 'success' && (
          <div className="mt-2 border border-emerald-900 bg-emerald-950/20 p-2 text-[10px] text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={12} /> STATUS_OK: FUNDS_DISPATCHED
          </div>
        )}
      </div>
    </div>
  );
}