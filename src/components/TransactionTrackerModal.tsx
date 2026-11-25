import React, { useState } from 'react';
import { Search, X, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import type { TransactionRecord } from '../types/store';

interface TransactionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TransactionRecord[];
}

const formatIDR = (val: number) =>
  `Rp ${Math.round(val).toLocaleString('id-ID')}`;

export const TransactionTrackerModal: React.FC<
  TransactionTrackerModalProps
> = ({ isOpen, onClose, history }) => {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundTx, setFoundTx] = useState<TransactionRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const code = queryId.trim();
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);
    setFoundTx(null);

    try {
      const res = await fetch(`/api/transaction/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = (await res.json()) as TransactionRecord;
        setFoundTx(data);
      } else {
        const localMatch = history.find(
          (item) => item.invoiceId.toLowerCase() === code.toLowerCase()
        );
        if (localMatch) {
          setFoundTx(localMatch);
        } else {
          setErrorMsg(`Transaksi ${code} tidak ditemukan.`);
        }
      }
    } catch {
      const localMatch = history.find(
        (item) => item.invoiceId.toLowerCase() === code.toLowerCase()
      );
      if (localMatch) {
        setFoundTx(localMatch);
      } else {
        setErrorMsg('Gagal memeriksa status transaksi.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lacak Transaksi ismanstore212"
    >
      <div className="bg-[#11151E] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-50">
              Cek Status &amp; Riwayat Transaksi
            </h3>
            <p className="text-xs text-slate-400">
              Pantau invoice pembayaran otomatis dan token PLN Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Masukkan Nomor Invoice (contoh: INV-ISM-...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryId.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 disabled:opacity-45 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cek Status'}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
              {errorMsg}
            </div>
          )}

          {foundTx && (
            <div className="p-4 rounded-xl bg-[#171C28] border border-amber-500/35 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-100">
                  {foundTx.invoiceId}
                </span>
                <span
                  className={`font-semibold text-xs ${
                    foundTx.status === 'SUCCESS'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {foundTx.status === 'SUCCESS'
                    ? 'Lunas & Terkirim'
                    : 'Menunggu / Diproses'}
                </span>
              </div>
              <div className="text-slate-300">
                {foundTx.productName} · {foundTx.nominalLabel}
              </div>
              <div className="text-xs text-slate-400">
                Akun: {foundTx.accountName} ({foundTx.userId}) · Total:{' '}
                <span className="font-mono text-slate-200">
                  {formatIDR(foundTx.totalAmount)}
                </span>
              </div>
              {foundTx.plnToken && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#090B10] border border-amber-500/30 font-mono text-sm text-amber-400 font-bold">
                  Token PLN: {foundTx.plnToken}
                </div>
              )}
              {foundTx.serialNumber && !foundTx.plnToken && (
                <div className="text-xs font-mono text-emerald-300">
                  SN: {foundTx.serialNumber}
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-3">
              Riwayat Transaksi Terakhir
            </h4>
            {history.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                Belum ada riwayat transaksi pada sesi ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.invoiceId}
                    className="p-3.5 rounded-xl bg-[#171C28] border border-white/8 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {item.invoiceId}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {item.productName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.nominalLabel} · {item.accountName}
                      </div>
                      {item.plnToken && (
                        <div className="font-mono text-xs text-amber-400 mt-1">
                          Token: {item.plnToken}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-100">
                        {formatIDR(item.totalAmount)}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs mt-0.5">
                        {item.status === 'SUCCESS' ? (
                          <span className="text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Berhasil
                          </span>
                        ) : (
                          <span className="text-amber-400 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Diproses
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
