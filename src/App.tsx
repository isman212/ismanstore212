import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Zap,
  ShieldCheck,
  Clock,
  Gamepad2,
  Bolt,
  Smartphone,
  Wifi,
  ChevronRight
} from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  HERO_BANNER_IMAGE,
  PAYMENT_METHODS
} from './data/catalog';
import type {
  ProductCategory,
  ProductItem,
  TransactionRecord
} from './types/store';
import { Logo } from './components/Logo';
import { CheckoutPanel } from './components/CheckoutPanel';
import { TransactionTrackerModal } from './components/TransactionTrackerModal';
import { SingleFileModal } from './components/SingleFileModal';

type FilterTab = 'all' | ProductCategory;

const CATEGORY_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Semua Layanan' },
  { id: 'game-mobile', label: 'Game Mobile' },
  { id: 'game-pc', label: 'Game PC' },
  { id: 'pln', label: 'Token Listrik PLN' },
  { id: 'paket-data', label: 'Paket Data' },
  { id: 'pulsa', label: 'Pulsa' }
];

export default function App() {
  const [products, setProducts] = useState<ProductItem[]>(CATALOG_PRODUCTS);
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(
    CATALOG_PRODUCTS[0]
  );

  const [trackerOpen, setTrackerOpen] = useState(false);
  const [singleFileOpen, setSingleFileOpen] = useState(false);
  const [history, setHistory] = useState<TransactionRecord[]>(() => {
    try {
      const raw = localStorage.getItem('ismanstore212_history');
      return raw ? (JSON.parse(raw) as TransactionRecord[]) : [];
    } catch {
      return [];
    }
  });

  const checkoutRef = useRef<HTMLElement | null>(null);
  const catalogRef = useRef<HTMLElement | null>(null);

  // Sync live catalog from Express backend on mount
  useEffect(() => {
    fetch('/api/catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products?.length) {
          setProducts(data.products);
        }
        if (data?.paymentMethods?.length) {
          setPaymentMethods(data.paymentMethods);
        }
      })
      .catch(() => {
        // Keep bundled catalog as immediate fallback
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        item.currencyName.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [products, activeTab, searchQuery]);

  function handleSelectProduct(item: ProductItem) {
    setSelectedProduct(item);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  function handleQuickJump(category: FilterTab, productId?: string) {
    setActiveTab(category);
    if (productId) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        handleSelectProduct(found);
        return;
      }
    }
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSaveTransaction(tx: TransactionRecord) {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.invoiceId !== tx.invoiceId);
      const next = [tx, ...filtered].slice(0, 20);
      try {
        localStorage.setItem('ismanstore212_history', JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#090B10]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a href="#top" className="whitespace-nowrap shrink-0">
            <Logo size="md" />
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          >
            <button
              type="button"
              onClick={() => handleQuickJump('all')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Katalog Game
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump('pln', 'pln-token')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Token &amp; Pulsa
            </button>
            <button
              type="button"
              onClick={() => setTrackerOpen(true)}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cek Transaksi
            </button>
            <button
              type="button"
              onClick={() => setSingleFileOpen(true)}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kode HTML Tunggal
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() =>
                checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })
              }
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs sm:text-sm hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mulai Topup
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Split */}
        <section className="border-b border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-center">
                <p className="text-xs font-medium text-amber-400 mb-3">
                  Platform Topup Otomatis · 24 Jam Nonstop
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-50 leading-[1.12] [text-wrap:balance]">
                  Topup Semua Game, Token Listrik &amp; Pulsa dalam Hitungan Detik
                </h1>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Masukkan ID Game, Nomor Meter PLN, atau Nomor HP. Sistem
                  memvalidasi format ID langsung di perangkat Anda dan memproses
                  pembayaran otomatis melalui Midtrans lalu mengirim ke Digiflazz.
                </p>

                {/* Quick Service Shortcut Buttons */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickJump('game-mobile')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    Topup Game
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump('pln', 'pln-token')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-slate-100 font-medium text-sm hover:border-amber-500/45 transition-colors cursor-pointer"
                  >
                    <Bolt className="w-4 h-4 text-amber-400" />
                    Token Listrik PLN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump('paket-data', 'paket-data')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-slate-100 font-medium text-sm hover:border-amber-500/45 transition-colors cursor-pointer"
                  >
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    Paket Data
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump('pulsa', 'pulsa-reguler')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171C28] border border-white/10 text-slate-100 font-medium text-sm hover:border-amber-500/45 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    Pulsa All Operator
                  </button>
                </div>

                {/* Unboxed Proof Metadata */}
                <div className="mt-8 pt-6 border-t border-white/8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Proses Otomatis 1–3 Detik
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Midtrans &amp; Digiflazz Otomatis
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-300" />
                    24+ Game &amp; PPOB Resmi
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] rounded-2xl overflow-hidden border border-white/10 bg-[#11151E]">
                  <img
                    src={HERO_BANNER_IMAGE}
                    alt="Arena Gaming ismanstore212"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B10]/90 via-[#090B10]/25 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-amber-400">
                        Gateway Otomatis Aktif
                      </div>
                      <div className="font-display text-lg font-bold text-white">
                        QRIS · Virtual Account · E-Wallet
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrackerOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Lacak Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Katalog Semua Game, Token PLN, Paket Data & Pulsa */}
        <section
          ref={catalogRef}
          id="katalog"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
                Pilih Game atau Layanan PPOB
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Klik produk di bawah untuk langsung mengisi ID akun dan melihat
                daftar nominal.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Mobile Legends, PLN, Pulsa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11151E] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#11151E] border border-white/8 rounded-xl overflow-x-auto mb-6">
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-slate-400 text-sm">
              Layanan &ldquo;{searchQuery}&rdquo; tidak ditemukan. Coba kata kunci
              lain.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((item) => {
                const isSelected = selectedProduct.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectProduct(item)}
                    className={`group text-left rounded-2xl border overflow-hidden transition-all duration-150 hover:-translate-y-0.5 cursor-pointer flex flex-col ${
                      isSelected
                        ? 'bg-[#171C28] border-amber-500'
                        : 'bg-[#11151E] border-white/8 hover:border-white/25'
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#090B10]">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11151E] via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-amber-300 truncate">
                          {item.currencyName}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.publisher}
                        </div>
                        <h3 className="font-display font-semibold text-sm sm:text-base text-slate-50 mt-0.5 line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Mulai dari</span>
                        <span className="font-mono font-semibold text-amber-400">
                          Rp{' '}
                          {Math.min(
                            ...item.nominals.map((n) => n.price)
                          ).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 2: Contiguous Interactive Checkout & Automated Payment */}
        <section
          ref={checkoutRef}
          id="checkout"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-white/8"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-amber-400">
                Checkout &amp; Pembayaran Otomatis
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
                {selectedProduct.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Validasi format ID lokal sebelum pembayaran Midtrans &amp; kirim ke Digiflazz
            </p>
          </div>

          <CheckoutPanel
            product={selectedProduct}
            paymentMethods={paymentMethods}
            onTransactionSaved={handleSaveTransaction}
          />
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-white/8 bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span>·</span>
            <span>Topup Game, Token PLN, Paket Data &amp; Pulsa Otomatis</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTrackerOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Lacak Transaksi
            </button>
            <button
              type="button"
              onClick={() => setSingleFileOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Unduh Versi 1 File HTML
            </button>
          </div>
        </div>
      </footer>

      <TransactionTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        history={history}
      />

      <SingleFileModal
        isOpen={singleFileOpen}
        onClose={() => setSingleFileOpen(false)}
      />
    </div>
  );
}
