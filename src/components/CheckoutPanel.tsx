import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowRight,
  ArrowDown,
  Receipt
} from 'lucide-react';
import type {
  NominalOption,
  PaymentMethod,
  ProductItem,
  TransactionRecord
} from '../types/store';
import { validateAccountFormatLocally } from '../utils/validateAccountFormat';
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTx, setActiveTx] = useState<TransactionRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(900);

  const step2Ref = useRef<HTMLElement | null>(null);

  // Reset form cleanly when product changes
  useEffect(() => {
    setUserId('');
    setZoneOrServer(product.serverOptions?.[0] || '');
    setSelectedNominal(product.nominals[0]);
    setSubmitError(null);
    setActiveTx(null);
  }, [product]);

  // Validasi format lokal murni di sisi client (tanpa fetch / API pihak ketiga)
  const validationResult = useMemo(() => {
    const hasAnyInput = userId.trim().length > 0;
    if (!hasAnyInput) return null;
    return validateAccountFormatLocally(product, userId, zoneOrServer);
  }, [product, userId, zoneOrServer]);

  // Poll live Midtrans payment & Digiflazz fulfillment status
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
        // Ignore transient errors while polling
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

  function handleFillSample() {
    setUserId(product.sampleAccount.userId);
    if (product.sampleAccount.zoneOrServer) {
      setZoneOrServer(product.sampleAccount.zoneOrServer);
    }
  }

  function handleContinueToStep2() {
    step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const fee = useMemo(() => {
    return Math.round(
      selectedMethod.feeFlat +
        (selectedNominal.price * selectedMethod.feePercent) / 100
    );
  }, [selectedMethod, selectedNominal]);

  const totalEstimate = selectedNominal.price + fee;

  async function handleCreateTransaction() {
    if (!validationResult?.valid) return;
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
          paymentMethodId: selectedMethod.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Gagal membuat transaksi Midtrans.');
        return;
      }
      const tx = data as TransactionRecord;
      setActiveTx(tx);
      onTransactionSaved(tx);
    } catch {
      setSubmitError('Koneksi ke server Midtrans gagal. Silakan coba lagi.');
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
          transaction_status: 'settlement'
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
    const isFailed = activeTx.status === 'FAILED';
    const isProcessing =
      activeTx.status === 'PAID' || activeTx.status === 'PROCESSING_TOPUP';

    return (
      <div className="bg-[#11151E] border border-white/10 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <p className="text-xs text-slate-400">
              Invoice Otomatis · {activeTx.gatewayProvider} →{' '}
              {activeTx.fulfillmentProvider}
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
                Topup Berhasil Terkirim via Digiflazz
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-400">
                <AlertCircle className="w-4 h-4" />
                Pengiriman Digiflazz Gagal
              </span>
            ) : isProcessing ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim ke Digiflazz (customer_no: {activeTx.digiflazzCustomerNo})...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 font-mono">
                Menunggu Pembayaran Midtrans · {formatCountdown(remainingSeconds)}
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
                Pembayaran Midtrans
              </div>
              <div className="text-xs text-slate-400">
                {activeTx.status === 'PENDING_PAYMENT'
                  ? 'Menunggu pelunasan'
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
                    : isFailed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              2
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Kirim ke Digiflazz API
              </div>
              <div className="text-xs font-mono text-slate-400">
                {activeTx.digiflazzCustomerNo}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                isSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : isFailed
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              3
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {isFailed ? 'Status Gagal' : 'Pesanan Selesai'}
              </div>
              <div className="text-xs text-slate-400">
                {isSuccess
                  ? 'SN / Token tersedia'
                  : isFailed
                    ? activeTx.digiflazzMessage || 'Periksa respon Digiflazz'
                    : 'Otomatis masuk ke akun'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Left: Payment QRIS / VA or Delivered Token/SN */}
          <div>
            {isFailed ? (
              <div className="bg-[#090B10] border border-red-500/35 rounded-xl p-6">
                <div className="flex items-center gap-2.5 text-red-400 font-semibold mb-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>Respon Digiflazz: Gagal Diproses</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Transaksi <strong className="font-mono text-white">{activeTx.invoiceId}</strong>{' '}
                  ke <strong className="font-mono text-amber-300">customer_no: {activeTx.digiflazzCustomerNo}</strong>{' '}
                  mendapat status gagal dari Digiflazz.
                </p>
                {activeTx.digiflazzMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-xs font-mono text-red-200 mb-4">
                    {activeTx.digiflazzMessage}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTx(null)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Buat Transaksi Baru
                </button>
              </div>
            ) : isSuccess ? (
              <div className="bg-[#090B10] border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Topup Berhasil Diproses Otomatis</span>
                </div>
                <p className="text-sm text-slate-300 mb-5">
                  Item <strong className="text-white">{activeTx.nominalLabel}</strong>{' '}
                  untuk ID <strong className="font-mono text-white">{activeTx.formattedSummary}</strong>{' '}
                  (customer_no Digiflazz: <strong className="font-mono text-amber-300">{activeTx.digiflazzCustomerNo}</strong>)
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
                      Nomor Referensi / Serial Number (SN) Digiflazz
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
                      Scan QRIS Midtrans Otomatis
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Berlaku untuk DANA, GoPay, OVO, ShopeePay &amp; semua M-Banking
                    </p>
                    <QrCodeMatrix payload={activeTx.qrPayload} size={172} />
                  </>
                ) : (
                  <div className="w-full py-4">
                    <div className="text-xs text-slate-400 mb-1">
                      Nomor Pembayaran / Virtual Account Midtrans
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

                {activeTx.snapRedirectUrl && (
                  <a
                    href={activeTx.snapRedirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Buka Halaman Pembayaran Midtrans Snap
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="w-full mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>
                      Menunggu konfirmasi Midtrans &amp; auto-kirim ke Digiflazz...
                    </span>
                  </div>
                  {activeTx.status === 'PENDING_PAYMENT' && (
                    <button
                      type="button"
                      onClick={handleInstantWebhookConfirm}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                    >
                      Simulasi / Trigger Webhook Midtrans Lunas
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
              <span className="text-slate-400">Nominal / SKU</span>
              <span className="font-medium text-slate-100 text-right">
                {activeTx.nominalLabel} ({activeTx.sku})
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Ringkasan ID Tujuan</span>
              <span className="font-mono text-slate-100 text-right">
                {activeTx.formattedSummary}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Digiflazz customer_no</span>
              <span className="font-mono font-semibold text-emerald-400 text-right">
                {activeTx.digiflazzCustomerNo}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Metode Bayar (Midtrans)</span>
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
                <span className="text-slate-400">Biaya Gateway Midtrans</span>
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
        {/* Step 1: Local Format Validation (Client-Side Only, No External API) */}
        <section className="bg-[#11151E] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-mono text-amber-400">
                Langkah 01 · Validasi Format Lokal
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
                inputMode={
                  product.inputType === 'game-id-zone' ||
                  product.inputType === 'game-id-server' ||
                  product.inputType === 'pln-meter' ||
                  product.inputType === 'phone'
                    ? 'numeric'
                    : 'text'
                }
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
                  {product.zoneLabel || 'Zone ID (4–6 Digit Angka)'}
                </label>
                <input
                  id="checkout-zone"
                  type="text"
                  inputMode="numeric"
                  value={zoneOrServer}
                  onChange={(e) => setZoneOrServer(e.target.value)}
                  placeholder={product.zonePlaceholder || 'Contoh: 2784'}
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

          <p className="mt-3 text-xs text-slate-400">{product.helperText}</p>

          {/* Local Format Validation Status Box (Client-Side Only) */}
          {validationResult && (
            <div
              className={`mt-4 px-4 py-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                validationResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                  : 'bg-red-500/10 border-red-500/35 text-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {validationResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  {validationResult.valid ? (
                    <>
                      <div className="font-semibold text-emerald-300">
                        Format ID Valid (Siap Diproses)
                      </div>
                      <div className="font-mono font-bold text-base text-white mt-0.5">
                        {validationResult.formattedSummary}
                      </div>
                      {validationResult.extraInfo && (
                        <div className="text-xs text-emerald-200/80 mt-0.5 font-mono">
                          {validationResult.extraInfo}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="font-semibold">Format ID Belum Sesuai</div>
                      <div className="text-xs opacity-90 mt-0.5">
                        {validationResult.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {validationResult.valid && (
                <button
                  type="button"
                  onClick={handleContinueToStep2}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Lanjut ke Langkah 02
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Step 2: Pilihan Nominal */}
        <section
          ref={step2Ref}
          className="bg-[#11151E] border border-white/10 rounded-2xl p-6"
        >
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

        {/* Step 3: Pembayaran Otomatis Midtrans */}
        <section className="bg-[#11151E] border border-white/10 rounded-2xl p-6">
          <div className="mb-4">
            <span className="text-xs font-mono text-amber-400">
              Langkah 03 · Midtrans Payment Gateway → Digiflazz
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
                      Midtrans Otomatis
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
            <span className="text-slate-400">Ringkasan ID Tujuan</span>
            <span className="font-mono text-slate-100 text-right">
              {validationResult?.valid
                ? validationResult.formattedSummary
                : userId.trim() || 'Belum diisi'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Validasi Format</span>
            <span
              className={`font-semibold text-right ${
                validationResult?.valid ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {validationResult?.valid
                ? 'Format ID Valid (Siap Diproses)'
                : 'Menunggu format valid'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Digiflazz customer_no</span>
            <span className="font-mono text-amber-300 text-right">
              {validationResult?.valid
                ? validationResult.digiflazzCustomerNo
                : '-'}
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
            <span className="text-slate-400">Biaya Gateway Midtrans</span>
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
          disabled={!validationResult?.valid || isSubmitting}
          className="w-full py-3.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-45 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Membuat Invoice Midtrans...
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
            Pembayaran Midtrans otomatis diteruskan ke Digiflazz 24 jam
          </span>
        </div>
      </aside>
    </div>
  );
};
