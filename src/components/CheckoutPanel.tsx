import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Receipt
} from 'lucide-react';
import type {
  AccountLookupResponse,
  NominalOption,
  PaymentMethod,
  ProductItem,
  TransactionRecord
} from '../types/store';
import { QrCodeMatrix } from './QrCodeMatrix';

interface CheckoutPanelProps {
  product: ProductItem;
  paymentMethods: PaymentMethod[];
  onTransactionSaved: (tx: TransactionRecord) => void;
}

const formatIDR = (amount: number) =>
  `Rp ${Math.round(amount).toLocaleString('id-ID')}`;

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  product,
  paymentMethods,
  onTransactionSaved
}) => {
  const [userId, setUserId] = useState('');
  const [zoneOrServer, setZoneOrServer] = useState(
    product.serverOptions?.[0] || ''
  );
  const [selectedNominal, setSelectedNominal] = useState<NominalOption>(
    product.nominals[0]
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    paymentMethods[0]
  );

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<AccountLookupResponse | null>(
    null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTx, setActiveTx] = useState<TransactionRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(900);

  // Reset form cleanly when product changes
  useEffect(() => {
    setUserId('');
    setZoneOrServer(product.serverOptions?.[0] || '');
    setSelectedNominal(product.nominals[0]);
    setLookupResult(null);
    setSubmitError(null);
    setActiveTx(null);
  }, [product]);

  // Debounced automatic Nickname / Nama Meter / Operator Lookup
  useEffect(() => {
    const trimmed = userId.trim();
    if (trimmed.length < 4) {
      setLookupResult(null);
      return;
    }

    if (product.inputType === 'game-id-zone' && zoneOrServer.trim().length < 3) {
      setLookupResult(null);
      return;
    }

    const timer = setTimeout(() => {
      void performLookup(trimmed, zoneOrServer);
    }, 380);

    return () => clearTimeout(timer);
  }, [userId, zoneOrServer, product.id]);

  // Poll live automated payment & topup fulfillment status
  useEffect(() => {
    if (!activeTx || activeTx.status === 'SUCCESS' || activeTx.status === 'FAILED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transaction/${activeTx.invoiceId}`);
        if (res.ok) {
          const updated = (await res.json()) as TransactionRecord;
          setActiveTx(updated);
          onTransactionSaved(updated);
        }
      } catch {
        // Ignore transient network errors during poll
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeTx?.invoiceId, activeTx?.status]);

  // Payment countdown timer
  useEffect(() => {
    if (!activeTx || activeTx.status !== 'PENDING_PAYMENT') return;
    const updateTick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(activeTx.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(diff);
    };
    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [activeTx?.invoiceId, activeTx?.status, activeTx?.expiresAt]);

  async function performLookup(idToCheck: string, zoneToCheck: string) {
    setLookupLoading(true);
    try {
      const res = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: idToCheck,
          zoneOrServer: zoneToCheck
        })
      });
      const data = (await res.json()) as AccountLookupResponse;
      setLookupResult(data);
    } catch {
      setLookupResult({
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'Gagal terhubung ke layanan cek akun.'
      });
    } finally {
      setLookupLoading(false);
    }
  }

  function handleFillSample() {
    setUserId(product.sampleAccount.userId);
    if (product.sampleAccount.zoneOrServer) {
      setZoneOrServer(product.sampleAccount.zoneOrServer);
    }
    void performLookup(
      product.sampleAccount.userId,
      product.sampleAccount.zoneOrServer || ''
    );
  }

  const fee = useMemo(() => {
    return Math.round(
      selectedMethod.feeFlat +
        (selectedNominal.price * selectedMethod.feePercent) / 100
    );
  }, [selectedMethod, selectedNominal]);

  const totalEstimate = selectedNominal.price + fee;

  async function handleCreateTransaction() {
    if (!lookupResult?.valid) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sku: selectedNominal.sku,
          userId: userId.trim(),
          zoneOrServer: zoneOrServer.trim() || undefined,
          accountName: lookupResult.accountName,
          extraInfo: lookupResult.extraInfo,
          paymentMethodId: selectedMethod.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Gagal membuat transaksi otomatis.');
        return;
      }
      const tx = data as TransactionRecord;
      setActiveTx(tx);
      onTransactionSaved(tx);
    } catch {
      setSubmitError('Koneksi ke server pembayaran gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleInstantWebhookConfirm() {
    if (!activeTx) return;
    try {
      const res = await fetch('/api/payment-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: activeTx.invoiceId,
          status: 'settlement'
        })
      });
      if (res.ok) {
        const data = (await res.json()) as { transaction: TransactionRecord };
        setActiveTx(data.transaction);
        onTransactionSaved(data.transaction);
      }
    } catch {
      // Poller handles update
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  }

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (activeTx) {
    const isSuccess = activeTx.status === 'SUCCESS';
    const isProcessing =
      activeTx.status === 'PAID' || activeTx.status === 'PROCESSING_TOPUP';

    return (
      <div className="bg-[#11151E] border border-white/10 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <p className="text-xs text-slate-400">
              Invoice Transaksi Otomatis · {activeTx.gatewayProvider}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="font-mono text-xl font-bold text-slate-50">
                {activeTx.invoiceId}
              </h3>
              <button
                type="button"
                onClick={() => handleCopy(activeTx.invoiceId, 'inv')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {copiedField === 'inv' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSuccess ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Topup Berhasil Terkirim
              </span>
            ) : isProcessing ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim Produk ke Akun Tujuan...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 font-mono">
                Menunggu Pembayaran · {formatCountdown(remainingSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* 3-Stage Automated Pipeline Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                activeTx.status === 'PENDING_PAYMENT'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              1
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Pembayaran Gateway
              </div>
              <div className="text-xs text-slate-400">
                {activeTx.status === 'PENDING_PAYMENT'
                  ? 'Verifikasi otomatis aktif'
                  : 'Pembayaran lunas'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                isProcessing
                  ? 'bg-amber-500 text-slate-950'
                  : isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              2
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Proses Server Provider
              </div>
              <div className="text-xs text-slate-400">
                {isProcessing
                  ? 'Injeksi otomatis berjalan'
                  : isSuccess
                    ? 'Terproses instan'
                    : 'Menunggu pelunasan'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                isSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              3
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Pesanan Selesai
              </div>
              <div className="text-xs text-slate-400">
                {isSuccess
                  ? 'SN / Token tersedia'
                  : 'Otomatis masuk ke akun'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Left: Payment QRIS / VA or Delivered Token/SN */}
          <div>
            {isSuccess ? (
              <div className="bg-[#090B10] border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Topup Berhasil Diproses Otomatis</span>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                  Item <strong className="text-white">{activeTx.nominalLabel}</strong>{' '}
                  untuk <strong className="text-white">{activeTx.accountName}</strong>{' '}
                  telah berhasil dikirim.
                </p>

                {activeTx.plnToken ? (
                  <div className="bg-[#11151E] border border-amber-500/40 rounded-xl p-4 mb-4">
                    <div className="text-xs text-slate-400 mb-1.5">
                      20-Digit Token Stroom PLN Prabayar
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-amber-400 tracking-wider break-all">
                      {activeTx.plnToken}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeTx.plnToken!, 'token')}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      {copiedField === 'token' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Token Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Kode Token PLN
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#11151E] border border-white/10 rounded-xl p-4 mb-4">
                    <div className="text-xs text-slate-400 mb-1">
                      Nomor Referensi / Serial Number (SN)
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-semibold text-slate-100">
                        {activeTx.serialNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(activeTx.serialNumber || '', 'sn')
                        }
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        {copiedField === 'sn' ? 'Disalin' : 'Salin SN'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTx(null)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Buat Transaksi Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    Cetak Struk
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#090B10] border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                {activeTx.qrPayload ? (
                  <>
                    <div className="text-sm font-semibold text-slate-100 mb-1">
                      Scan QRIS Otomatis
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Berlaku untuk DANA, GoPay, OVO, ShopeePay &amp; semua M-Banking
                    </p>
                    <QrCodeMatrix payload={activeTx.qrPayload} size={172} />
                  </>
                ) : (
                  <div className="w-full py-4">
                    <div className="text-xs text-slate-400 mb-1">
                      Nomor Pembayaran / Virtual Account
                    </div>
                    <div className="font-mono text-2xl font-bold text-amber-400 tracking-wide my-2">
                      {activeTx.paymentCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeTx.paymentCode, 'va')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:border-amber-400/50 cursor-pointer"
                    >
                      {copiedField === 'va' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Nomor VA Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Nomor Pembayaran
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="w-full mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>
                      Sistem mengecek mutasi pembayaran otomatis setiap detik...
                    </span>
                  </div>
                  {activeTx.status === 'PENDING_PAYMENT' && (
                    <button
                      type="button"
                      onClick={handleInstantWebhookConfirm}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                    >
                      Simulasi / Trigger Webhook Lunas Sekarang
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Breakdown */}
          <div className="space-y-3 text-sm">
            <h4 className="font-display font-semibold text-base text-slate-100 pb-2 border-b border-white/10">
              Detail Transaksi
            </h4>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Layanan</span>
              <span className="font-medium text-slate-100 text-right">
                {activeTx.productName}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Nominal</span>
              <span className="font-medium text-slate-100 text-right">
                {activeTx.nominalLabel}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">ID / Nomor Tujuan</span>
              <span className="font-mono text-slate-100 text-right">
                {activeTx.userId}
                {activeTx.zoneOrServer ? ` (${activeTx.zoneOrServer})` : ''}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Nickname / Nama Meter</span>
              <span className="font-semibold text-emerald-400 text-right">
                {activeTx.accountName}
              </span>
            </div>
            {activeTx.extraInfo && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Info Akun / Tarif</span>
                <span className="text-slate-300 text-right">
                  {activeTx.extraInfo}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Metode Bayar</span>
              <span className="text-slate-100 text-right">
                {activeTx.paymentMethodName}
              </span>
            </div>
            <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Harga Item</span>
                <span className="font-mono text-slate-200">
                  {formatIDR(activeTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biaya Gateway</span>
                <span className="font-mono text-slate-200">
                  {formatIDR(activeTx.fee)}
                </span>
              </div>
              {activeTx.uniqueCode > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Kode Unik Verifikasi</span>
                  <span className="font-mono text-slate-200">
                    +{activeTx.uniqueCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10 text-base font-bold">
                <span className="text-slate-100">Total Pembayaran</span>
                <span className="font-mono text-amber-400">
                  {formatIDR(activeTx.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Columns: 3-Step Input Form */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step 1: Account ID + Auto Nickname / PLN Meter Name */}
        <section className="bg-[#11151E] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-mono text-amber-400">
                Langkah 01 · Verifikasi Otomatis
              </span>
              <h3 className="font-display text-lg font-bold text-slate-50">
                Masukkan Data Akun — {product.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              Isi Contoh ID
            </button>
          </div>

          <div
            className={`grid gap-4 ${
              product.inputType === 'game-id-zone' ||
              product.inputType === 'game-id-server'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            <div>
              <label
                htmlFor="checkout-userid"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                {product.inputLabel}
              </label>
              <input
                id="checkout-userid"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={product.inputPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {product.inputType === 'game-id-zone' && (
              <div>
                <label
                  htmlFor="checkout-zone"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  {product.zoneLabel || 'Zone ID'}
                </label>
                <input
                  id="checkout-zone"
                  type="text"
                  value={zoneOrServer}
                  onChange={(e) => setZoneOrServer(e.target.value)}
                  placeholder={product.zonePlaceholder || '2124'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}

            {product.inputType === 'game-id-server' &&
              product.serverOptions && (
                <div>
                  <label
                    htmlFor="checkout-server"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    {product.zoneLabel || 'Server'}
                  </label>
                  <select
                    id="checkout-server"
                    value={zoneOrServer}
                    onChange={(e) => setZoneOrServer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {product.serverOptions.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">{product.helperText}</p>
            <button
              type="button"
              onClick={() => void performLookup(userId, zoneOrServer)}
              disabled={!userId.trim() || lookupLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${lookupLoading ? 'animate-spin' : ''}`}
              />
              Cek Ulang Akun
            </button>
          </div>

          {/* Automatic Nickname / Meter Name Verification Box */}
          {lookupLoading && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-[#171C28] border border-white/10 flex items-center gap-2.5 text-sm text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Memeriksa nickname / data pelanggan otomatis...</span>
            </div>
          )}

          {!lookupLoading && lookupResult && (
            <div
              className={`mt-4 px-4 py-3.5 rounded-xl border flex items-start gap-3 ${
                lookupResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-100'
                  : 'bg-red-500/10 border-red-500/35 text-red-200'
              }`}
            >
              {lookupResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                {lookupResult.valid ? (
                  <>
                    <div className="text-xs text-emerald-300 font-medium">
                      {product.inputType === 'pln-meter'
                        ? 'Nama Pemilik Meter Terbaca Otomatis'
                        : product.inputType === 'phone'
                          ? 'Operator Seluler Terdeteksi Otomatis'
                          : 'Nickname Game Terbaca Otomatis'}
                    </div>
                    <div className="font-display font-bold text-base text-white mt-0.5">
                      {lookupResult.accountName}
                    </div>
                    {lookupResult.extraInfo && (
                      <div className="text-xs text-emerald-200/80 mt-0.5">
                        {lookupResult.extraInfo}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="font-semibold">Data belum valid</div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {lookupResult.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Pilihan Nominal */}
        <section className="bg-[#11151E] border border-white/10 rounded-2xl p-6">
          <div className="mb-4">
            <span className="text-xs font-mono text-amber-400">
              Langkah 02 · {product.currencyName}
            </span>
            <h3 className="font-display text-lg font-bold text-slate-50">
              Pilih Nominal Topup
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {product.nominals.map((nom) => {
              const active = selectedNominal.sku === nom.sku;
              return (
                <button
                  key={nom.sku}
                  type="button"
                  onClick={() => setSelectedNominal(nom)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[94px] ${
                    active
                      ? 'bg-amber-500/12 border-amber-500 text-slate-50'
                      : 'bg-[#171C28] border-white/8 text-slate-200 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm leading-snug">
                      {nom.label}
                    </div>
                    {nom.bonus && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {nom.bonus}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {formatIDR(nom.price)}
                    </span>
                    {nom.basePrice && (
                      <span className="font-mono text-xs text-slate-500 line-through">
                        {formatIDR(nom.basePrice)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Pembayaran Otomatis */}
        <section className="bg-[#11151E] border border-white/10 rounded-2xl p-6">
          <div className="mb-4">
            <span className="text-xs font-mono text-amber-400">
              Langkah 03 · Payment Gateway API
            </span>
            <h3 className="font-display text-lg font-bold text-slate-50">
              Pilih Metode Pembayaran Otomatis
            </h3>
          </div>

          <div className="space-y-2.5">
            {paymentMethods.map((method) => {
              const active = selectedMethod.id === method.id;
              const methodFee = Math.round(
                method.feeFlat +
                  (selectedNominal.price * method.feePercent) / 100
              );
              const totalWithFee = selectedNominal.price + methodFee;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    active
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-[#171C28] border-white/8 hover:border-white/25'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">
                        {method.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        · {method.group}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {method.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold text-amber-400">
                      {formatIDR(totalWithFee)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cek Otomatis
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right 5 Columns: Sticky Contiguous Purchase Summary */}
      <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-[#11151E] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs text-slate-400">{product.publisher}</div>
            <h4 className="font-display text-lg font-bold text-slate-50 truncate">
              {product.name}
            </h4>
          </div>
        </div>

        <div className="py-5 space-y-3 text-sm border-b border-white/10">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">ID / Nomor Tujuan</span>
            <span className="font-mono text-slate-100 text-right">
              {userId.trim()
                ? `${userId.trim()}${
                    zoneOrServer ? ` (${zoneOrServer})` : ''
                  }`
                : 'Belum diisi'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Nickname / Nama</span>
            <span
              className={`font-semibold text-right ${
                lookupResult?.valid ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {lookupResult?.valid
                ? lookupResult.accountName
                : 'Menunggu verifikasi ID'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Item Dipilih</span>
            <span className="font-medium text-slate-100 text-right">
              {selectedNominal.label}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Pembayaran</span>
            <span className="text-slate-200 text-right">
              {selectedMethod.name}
            </span>
          </div>
        </div>

        <div className="py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Harga Nominal</span>
            <span className="font-mono text-slate-200">
              {formatIDR(selectedNominal.price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Biaya Gateway Otomatis</span>
            <span className="font-mono text-slate-200">{formatIDR(fee)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-white/10 items-baseline">
            <span className="font-semibold text-slate-100">Total Bayar</span>
            <span className="font-mono text-xl font-bold text-amber-400">
              {formatIDR(totalEstimate)}
            </span>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
            {submitError}
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateTransaction}
          disabled={!lookupResult?.valid || isSubmitting}
          className="w-full py-3.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-45 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Membuat Invoice Otomatis...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Bayar Otomatis Sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Verifikasi ID &amp; pengiriman produk berjalan otomatis 24 jam
          </span>
        </div>
      </aside>
    </div>
  );
};
