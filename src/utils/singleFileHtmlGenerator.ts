import { CATALOG_PRODUCTS, PAYMENT_METHODS } from '../data/catalog';

export function generateSingleFileHtml(): string {
  const serializedCatalog = JSON.stringify(
    CATALOG_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      publisher: p.publisher,
      category: p.category,
      currencyName: p.currencyName,
      inputType: p.inputType,
      inputLabel: p.inputLabel,
      inputPlaceholder: p.inputPlaceholder,
      zoneLabel: p.zoneLabel || '',
      zonePlaceholder: p.zonePlaceholder || '',
      serverOptions: p.serverOptions || [],
      helperText: p.helperText,
      sampleAccount: p.sampleAccount,
      nominals: p.nominals
    }))
  );

  const serializedPayments = JSON.stringify(PAYMENT_METHODS);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ismanstore212 — Website Topup Semua Game, Token PLN, Paket Data &amp; Pulsa Otomatis</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #090b10;
      --surface: #11151e;
      --surface-2: #171c28;
      --border: rgba(255, 255, 255, 0.08);
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #f59e0b;
      --accent-hover: #fbbf24;
      --success: #10b981;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.55;
      min-height: 100vh;
    }
    h1, h2, h3, .font-display { font-family: 'Outfit', system-ui, sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* Top Bar */
    header {
      position: sticky; top: 0; z-index: 40;
      background: rgba(9, 11, 16, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      gap: 24px; height: 68px;
    }
    .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 20px; }
    .brand span { color: var(--accent); }
    nav { display: flex; gap: 24px; }
    nav a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .15s; white-space: nowrap; }
    nav a:hover { color: var(--text); }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 18px; border-radius: 10px; border: 1px solid transparent;
      font-weight: 600; font-size: 14px; cursor: pointer; transition: all .15s;
      font-family: inherit; white-space: nowrap;
    }
    .btn-primary { background: var(--accent); color: #090b10; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-success { background: var(--success); color: #090b10; padding: 8px 14px; font-size: 12px; }
    .btn-secondary { background: var(--surface-2); color: var(--text); border-color: var(--border); }
    .btn-secondary:hover { border-color: rgba(255,255,255,0.2); }

    /* Hero */
    .hero { padding: 48px 0 32px; border-bottom: 1px solid var(--border); }
    .hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center; }
    .hero h1 { font-size: clamp(28px, 4vw, 44px); line-height: 1.15; margin-bottom: 12px; }
    .hero p { color: var(--muted); font-size: 16px; max-width: 58ch; margin-bottom: 20px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--muted); }
    .hero-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
      padding: 20px;
    }

    /* Filter & Search */
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin: 28px 0 20px; }
    .tabs { display: flex; flex-wrap: wrap; gap: 6px; background: var(--surface); padding: 4px; border-radius: 10px; border: 1px solid var(--border); }
    .tab-btn {
      background: transparent; color: var(--muted); border: none; padding: 8px 14px;
      border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .tab-btn.active { background: var(--accent); color: #090b10; }
    .search-input {
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
      padding: 10px 14px; border-radius: 10px; font-size: 14px; min-width: 260px; outline: none;
    }
    .search-input:focus { border-color: var(--accent); }

    /* Catalog Grid */
    .catalog-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 14px; margin-bottom: 40px;
    }
    .product-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
      padding: 16px; cursor: pointer; transition: transform .15s, border-color .15s;
      text-align: left; color: inherit; display: flex; flex-direction: column; gap: 8px;
    }
    .product-card:hover { transform: translateY(-2px); border-color: rgba(245, 158, 11, 0.5); }
    .product-card.selected { border-color: var(--accent); background: #161b26; }
    .product-card .pub { font-size: 12px; color: var(--muted); }
    .product-card .title { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; color: var(--text); }
    .product-card .cur { font-size: 12px; color: var(--accent); margin-top: auto; }

    /* Checkout Workspace */
    .checkout-grid { display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 24px; align-items: start; margin-bottom: 56px; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 18px; }
    .panel-title { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; font-weight: 500; }
    .field input, .field select {
      width: 100%; background: var(--surface-2); border: 1px solid var(--border);
      color: var(--text); padding: 11px 13px; border-radius: 10px; font-size: 14px; outline: none;
    }
    .field input:focus, .field select:focus { border-color: var(--accent); }
    .helper { font-size: 12px; color: var(--muted); margin-top: 8px; }
    .verify-box {
      margin-top: 12px; padding: 14px; border-radius: 12px; font-size: 13px;
      border: 1px solid var(--border); background: var(--surface-2);
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
    }
    .verify-box.ok { border-color: rgba(16, 185, 129, 0.45); background: rgba(16, 185, 129, 0.1); color: #a7f3d0; }
    .verify-box.err { border-color: rgba(239, 68, 68, 0.45); background: rgba(239, 68, 68, 0.08); color: #fecaca; }

    /* Nominals & Payments */
    .nominal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 10px; }
    .nominal-btn {
      background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px;
      padding: 13px; text-align: left; cursor: pointer; color: var(--text); transition: border-color .15s;
    }
    .nominal-btn:hover { border-color: rgba(245, 158, 11, 0.45); }
    .nominal-btn.active { border-color: var(--accent); background: rgba(245, 158, 11, 0.1); }
    .nominal-btn .n-label { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
    .nominal-btn .n-bonus { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .nominal-btn .n-price { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--accent); }

    .pay-list { display: grid; gap: 10px; }
    .pay-btn {
      display: flex; justify-content: space-between; align-items: center; gap: 12px;
      background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px;
      padding: 13px 15px; cursor: pointer; color: var(--text); text-align: left;
    }
    .pay-btn.active { border-color: var(--accent); background: rgba(245, 158, 11, 0.08); }

    .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 7px 0; color: var(--muted); }
    .summary-row.total { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 12px; color: var(--text); font-weight: 700; font-size: 16px; }

    /* Invoice Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78);
      display: none; align-items: center; justify-content: center; padding: 20px; z-index: 60;
    }
    .modal-backdrop.open { display: flex; }
    .modal-box {
      background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
      max-width: 520px; width: 100%; padding: 24px; max-height: 90vh; overflow-y: auto;
    }
    .token-box {
      background: #090b10; border: 1px dashed var(--accent); border-radius: 12px;
      padding: 14px; text-align: center; margin: 14px 0;
    }
    .token-code { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: 1px; }

    footer { border-top: 1px solid var(--border); padding: 28px 0; color: var(--muted); font-size: 13px; text-align: center; }

    @media (max-width: 880px) {
      .hero-grid, .checkout-grid, .form-row { grid-template-columns: 1fr; }
      nav { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container topbar">
      <a href="#top" class="brand">
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M22 2.5L36.5 8.5L41.5 22L36.5 35.5L22 41.5L7.5 35.5L2.5 22L7.5 8.5L22 2.5Z" fill="#11151E" stroke="#F59E0B" stroke-width="2.2"/>
          <path d="M22 10.5L27 16H23.5L26 22.5L17.5 15.5H21L22 10.5Z" fill="#F59E0B"/>
          <text x="22" y="32.5" text-anchor="middle" fill="#F8FAFC" font-family="Outfit, sans-serif" font-weight="800" font-size="10.5">212</text>
        </svg>
        ismanstore<span>212</span>
      </a>
      <nav>
        <a href="#katalog">Semua Game</a>
        <a href="#katalog" onclick="setCategory('pln')">Token PLN</a>
        <a href="#katalog" onclick="setCategory('paket-data')">Paket Data</a>
        <a href="#katalog" onclick="setCategory('pulsa')">Pulsa</a>
      </nav>
      <button class="btn btn-primary" onclick="document.getElementById('checkout-section').scrollIntoView({behavior:'smooth'})">
        Mulai Topup
      </button>
    </div>
  </header>

  <main class="container" id="top">
    <section class="hero">
      <div class="hero-grid">
        <div>
          <h1>Topup Semua Game, Token Listrik &amp; Pulsa Otomatis 24 Jam</h1>
          <p>
            Validasi format ID lokal langsung di perangkat Anda tanpa API pihak ketiga.
            Pembayaran otomatis melalui Midtrans &amp; pengiriman instan langsung ke Digiflazz API.
          </p>
          <div class="hero-meta">
            <span>24+ Game Populer</span> ·
            <span>Token PLN Prabayar</span> ·
            <span>Paket Data &amp; Pulsa All Operator</span> ·
            <span>Midtrans + Digiflazz Otomatis</span>
          </div>
        </div>
        <div class="hero-card">
          <div style="font-size:13px;color:var(--muted);margin-bottom:6px;">Cek Status Transaksi</div>
          <div style="display:flex;gap:8px;">
            <input id="track-input" class="search-input" style="min-width:0;flex:1;" placeholder="Masukkan Kode Invoice (INV-ISM-...)" />
            <button class="btn btn-secondary" onclick="trackInvoice()">Cek</button>
          </div>
          <div id="track-result" style="font-size:12px;color:var(--muted);margin-top:8px;">
            Mendukung pelacakan real-time &amp; riwayat transaksi lokal.
          </div>
        </div>
      </div>
    </section>

    <section id="katalog">
      <div class="toolbar">
        <div class="tabs" id="category-tabs">
          <button class="tab-btn active" onclick="setCategory('all', this)">Semua Layanan</button>
          <button class="tab-btn" onclick="setCategory('game-mobile', this)">Game Mobile</button>
          <button class="tab-btn" onclick="setCategory('game-pc', this)">Game PC</button>
          <button class="tab-btn" onclick="setCategory('pln', this)">Token Listrik PLN</button>
          <button class="tab-btn" onclick="setCategory('paket-data', this)">Paket Data</button>
          <button class="tab-btn" onclick="setCategory('pulsa', this)">Pulsa</button>
        </div>
        <input id="search-box" class="search-input" placeholder="Cari game, PLN, pulsa, atau paket data..." oninput="renderCatalog()" />
      </div>

      <div class="catalog-grid" id="catalog-grid"></div>
    </section>

    <section id="checkout-section" class="checkout-grid">
      <div>
        <div class="panel">
          <div class="panel-title">
            <span id="selected-product-title">01. Validasi Format Lokal — Data Akun</span>
            <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="fillSample()">Isi Contoh ID</button>
          </div>
          <div id="account-fields"></div>
          <p class="helper" id="product-helper"></p>
          <div id="account-status" class="verify-box" style="display:none;"></div>
        </div>

        <div class="panel" id="step-2-panel">
          <div class="panel-title"><span>02. Pilih Nominal Topup</span></div>
          <div class="nominal-grid" id="nominal-grid"></div>
        </div>

        <div class="panel">
          <div class="panel-title"><span>03. Pilih Pembayaran Otomatis (Midtrans)</span></div>
          <div class="pay-list" id="payment-list"></div>
        </div>
      </div>

      <aside class="panel" style="position:sticky;top:88px;">
        <div class="panel-title"><span>Ringkasan Pesanan</span></div>
        <div class="summary-row"><span>Produk</span><strong id="sum-product" style="color:var(--text);">-</strong></div>
        <div class="summary-row"><span>Ringkasan ID Tujuan</span><span id="sum-id" class="mono">-</span></div>
        <div class="summary-row"><span>Status Format</span><span id="sum-status" style="color:var(--success);">-</span></div>
        <div class="summary-row"><span>Digiflazz customer_no</span><span id="sum-df" class="mono" style="color:var(--accent);">-</span></div>
        <div class="summary-row"><span>Item Dipilih</span><span id="sum-item">-</span></div>
        <div class="summary-row"><span>Pembayaran</span><span id="sum-method">-</span></div>
        <div class="summary-row"><span>Harga Item</span><span id="sum-price" class="mono">Rp 0</span></div>
        <div class="summary-row"><span>Biaya Midtrans</span><span id="sum-fee" class="mono">Rp 0</span></div>
        <div class="summary-row total"><span>Total Bayar</span><span id="sum-total" class="mono" style="color:var(--accent);">Rp 0</span></div>
        <button id="pay-now-btn" class="btn btn-primary" style="width:100%;margin-top:16px;padding:13px;" disabled onclick="createAutomatedOrder()">
          Bayar Otomatis Sekarang
        </button>
        <p class="helper" style="text-align:center;">
          Pembayaran Midtrans otomatis diteruskan ke API Digiflazz tanpa konfirmasi manual.
        </p>
      </aside>
    </section>
  </main>

  <div id="invoice-modal" class="modal-backdrop">
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="font-size:20px;">Invoice Midtrans &amp; Digiflazz</h3>
        <button class="btn btn-secondary" style="padding:6px 12px;" onclick="closeModal()">Tutup</button>
      </div>
      <div id="invoice-body"></div>
    </div>
  </div>

  <footer>
    <div class="container">
      &copy; 2026 ismanstore212 — Platform Topup Semua Game, Token Listrik PLN, Paket Data &amp; Pulsa Otomatis 24 Jam.
    </div>
  </footer>

  <script>
    /**
     * KONFIGURASI API PRODUKSI: MIDTRANS (PEMBAYARAN) + DIGIFLAZZ (TRANSAKSI)
     * Tidak menggunakan API pihak ketiga untuk cek nickname game.
     */
    const API_CONFIG = {
      MIDTRANS_CREATE_ORDER: '/api/create-transaction',
      DIGIFLAZZ_WEBHOOK: '/api/payment-webhook'
    };

    const PRODUCTS = ${serializedCatalog};
    const PAYMENTS = ${serializedPayments};

    let activeCategory = 'all';
    let selectedProduct = PRODUCTS[0];
    let selectedNominal = selectedProduct.nominals[0];
    let selectedPayment = PAYMENTS[0];
    let localValidation = null;
    let userIdVal = '';
    let zoneVal = '';

    const formatIDR = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    function detectOperator(phone) {
      let c = phone.replace(/[^0-9]/g, '');
      if (c.startsWith('62')) c = '0' + c.slice(2);
      if (c.length < 10 || c.length > 13 || !c.startsWith('08')) {
        return { valid: false, operator: 'Nomor HP harus 10–13 digit diawali 08xx.' };
      }
      const p = c.slice(0, 4);
      if ('0811,0812,0813,0821,0822,0823,0852,0853'.includes(p)) return { valid: true, operator: 'TELKOMSEL PRABAYAR', info: 'Kartu Aktif · 4G/5G', normalized: c };
      if (p === '0851') return { valid: true, operator: 'BY.U / TELKOMSEL', info: 'Kartu Digital Aktif', normalized: c };
      if ('0814,0815,0816,0855,0856,0857,0858'.includes(p)) return { valid: true, operator: 'INDOSAT OOREDOO IM3', info: 'Kartu Aktif', normalized: c };
      if ('0817,0818,0819,0859,0877,0878'.includes(p)) return { valid: true, operator: 'XL AXIATA', info: 'Kartu Aktif', normalized: c };
      if ('0831,0832,0833,0838'.includes(p)) return { valid: true, operator: 'AXIS', info: 'Kartu Aktif', normalized: c };
      if ('0895,0896,0897,0898,0899'.includes(p)) return { valid: true, operator: 'TRI (3) INDONESIA', info: 'Kartu Aktif', normalized: c };
      if ('0881,0882,0883,0884,0885,0886,0887,0888,0889'.includes(p)) return { valid: true, operator: 'SMARTFREN 4G', info: 'Kartu Aktif', normalized: c };
      return { valid: true, operator: 'OPERATOR INDONESIA', info: 'Kartu Aktif', normalized: c };
    }

    function setCategory(cat, btn) {
      activeCategory = cat;
      if (btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      renderCatalog();
    }

    function renderCatalog() {
      const q = document.getElementById('search-box').value.toLowerCase().trim();
      const grid = document.getElementById('catalog-grid');
      const filtered = PRODUCTS.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
      grid.innerHTML = filtered.map(p => \`
        <button class="product-card \${p.id === selectedProduct.id ? 'selected' : ''}" onclick="selectProduct('\${p.id}')">
          <div class="pub">\${p.publisher}</div>
          <div class="title">\${p.name}</div>
          <div class="cur">\${p.currencyName}</div>
        </button>
      \`).join('');
    }

    function selectProduct(id) {
      selectedProduct = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
      selectedNominal = selectedProduct.nominals[0];
      userIdVal = '';
      zoneVal = selectedProduct.serverOptions && selectedProduct.serverOptions.length ? selectedProduct.serverOptions[0] : '';
      localValidation = null;
      renderCatalog();
      renderCheckout();
      document.getElementById('checkout-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function fillSample() {
      userIdVal = selectedProduct.sampleAccount.userId;
      zoneVal = selectedProduct.sampleAccount.zoneOrServer || '';
      const idEl = document.getElementById('input-userid');
      if (idEl) idEl.value = userIdVal;
      const zEl = document.getElementById('input-zone');
      if (zEl) zEl.value = zoneVal;
      validateFormatLocally();
    }

    function renderCheckout() {
      document.getElementById('selected-product-title').textContent = '01. Data Akun — ' + selectedProduct.name;
      document.getElementById('product-helper').textContent = selectedProduct.helperText;

      let fieldsHtml = '<div class="' + (selectedProduct.inputType === 'game-id-zone' || selectedProduct.inputType === 'game-id-server' ? 'form-row' : '') + '">';
      fieldsHtml += \`
        <div class="field">
          <label>\${selectedProduct.inputLabel}</label>
          <input id="input-userid" value="\${userIdVal}" placeholder="\${selectedProduct.inputPlaceholder}" oninput="onAccountInput()" />
        </div>
      \`;
      if (selectedProduct.inputType === 'game-id-zone') {
        fieldsHtml += \`
          <div class="field">
            <label>\${selectedProduct.zoneLabel || 'Zone ID (4–6 Digit Angka)'}</label>
            <input id="input-zone" value="\${zoneVal}" placeholder="\${selectedProduct.zonePlaceholder || '2784'}" oninput="onAccountInput()" />
          </div>
        \`;
      } else if (selectedProduct.inputType === 'game-id-server') {
        fieldsHtml += \`
          <div class="field">
            <label>\${selectedProduct.zoneLabel || 'Server'}</label>
            <select id="input-zone" onchange="onAccountInput()">
              \${selectedProduct.serverOptions.map(s => \`<option value="\${s}" \${zoneVal === s ? 'selected' : ''}>\${s}</option>\`).join('')}
            </select>
          </div>
        \`;
      }
      fieldsHtml += '</div>';
      document.getElementById('account-fields').innerHTML = fieldsHtml;

      document.getElementById('nominal-grid').innerHTML = selectedProduct.nominals.map(n => \`
        <button class="nominal-btn \${n.sku === selectedNominal.sku ? 'active' : ''}" onclick="selectNominal('\${n.sku}')">
          <div class="n-label">\${n.label}</div>
          <div class="n-bonus">\${n.bonus || selectedProduct.currencyName}</div>
          <div class="n-price">\${formatIDR(n.price)}</div>
        </button>
      \`).join('');

      document.getElementById('payment-list').innerHTML = PAYMENTS.map(m => {
        const fee = Math.round(m.feeFlat + (selectedNominal.price * m.feePercent) / 100);
        return \`
          <button class="pay-btn \${m.id === selectedPayment.id ? 'active' : ''}" onclick="selectPayment('\${m.id}')">
            <div>
              <div style="font-weight:600;font-size:14px;">\${m.name}</div>
              <div style="font-size:12px;color:var(--muted);">\${m.description}</div>
            </div>
            <div class="mono" style="color:var(--accent);font-weight:700;font-size:14px;">\${formatIDR(selectedNominal.price + fee)}</div>
          </button>
        \`;
      }).join('');

      updateAccountStatusUI();
      updateSummary();
    }

    function onAccountInput() {
      const idEl = document.getElementById('input-userid');
      const zEl = document.getElementById('input-zone');
      userIdVal = idEl ? idEl.value : '';
      zoneVal = zEl ? zEl.value : '';
      validateFormatLocally();
    }

    function validateFormatLocally() {
      const id = userIdVal.trim();
      const z = zoneVal.trim();
      if (!id) {
        localValidation = null;
        updateAccountStatusUI();
        updateSummary();
        return;
      }

      if (selectedProduct.inputType === 'game-id-zone') {
        if (!/^\\d{6,13}$/.test(id)) {
          localValidation = { valid: false, message: 'User ID harus berisi 6–13 digit angka.' };
        } else if (!/^\\d{4,6}$/.test(z)) {
          localValidation = { valid: false, message: 'Zone ID harus berisi 4–6 digit angka.' };
        } else {
          localValidation = {
            valid: true,
            formattedSummary: id + ' (' + z + ')',
            digiflazzCustomerNo: id + z,
            extraInfo: 'Digiflazz customer_no: ' + id + z
          };
        }
      } else if (selectedProduct.inputType === 'game-id-server') {
        if (!/^\\d{6,13}$/.test(id)) {
          localValidation = { valid: false, message: 'UID harus berisi 6–13 digit angka.' };
        } else {
          localValidation = {
            valid: true,
            formattedSummary: id + ' (' + z + ')',
            digiflazzCustomerNo: id,
            extraInfo: 'Server ' + z + ' · Digiflazz customer_no: ' + id
          };
        }
      } else if (selectedProduct.inputType === 'pln-meter') {
        if (!/^\\d{11,12}$/.test(id)) {
          localValidation = { valid: false, message: 'Nomor Meter PLN harus 11–12 digit angka.' };
        } else {
          localValidation = {
            valid: true,
            formattedSummary: id,
            digiflazzCustomerNo: id,
            extraInfo: 'Meter PLN Prabayar · Siap diproses ke Digiflazz'
          };
        }
      } else if (selectedProduct.inputType === 'phone') {
        const op = detectOperator(id);
        localValidation = op.valid
          ? { valid: true, formattedSummary: op.normalized, digiflazzCustomerNo: op.normalized, extraInfo: op.operator + ' · ' + op.info }
          : { valid: false, message: op.operator };
      } else if (selectedProduct.inputType === 'riot-id') {
        const ok = /^.{3,16}#[A-Za-z0-9]{2,6}$/.test(id) || /^\\d{6,13}$/.test(id);
        const cleanNo = id.replace(/[\\s()]/g, '');
        localValidation = ok
          ? { valid: true, formattedSummary: id, digiflazzCustomerNo: cleanNo, extraInfo: 'Riot SEA · Digiflazz customer_no: ' + cleanNo }
          : { valid: false, message: 'Format Riot ID wajib menyertakan #Tagline.' };
      } else {
        const sampleIsNum = /^\\d+$/.test(selectedProduct.sampleAccount.userId);
        if (sampleIsNum && !/^\\d{6,13}$/.test(id)) {
          localValidation = { valid: false, message: selectedProduct.inputLabel + ' harus berisi 6–13 digit angka.' };
        } else if (!sampleIsNum && id.length < 4) {
          localValidation = { valid: false, message: selectedProduct.inputLabel + ' minimal 4 karakter.' };
        } else {
          const cleanNo = id.replace(/[\\s()]/g, '');
          localValidation = {
            valid: true,
            formattedSummary: id,
            digiflazzCustomerNo: cleanNo,
            extraInfo: selectedProduct.publisher + ' · Digiflazz customer_no: ' + cleanNo
          };
        }
      }

      updateAccountStatusUI();
      updateSummary();
    }

    function updateAccountStatusUI() {
      const box = document.getElementById('account-status');
      if (!localValidation) { box.style.display = 'none'; return; }
      box.style.display = 'flex';
      if (localValidation.valid) {
        box.className = 'verify-box ok';
        box.innerHTML = \`
          <div>
            <div style="font-weight:700;color:#6ee7b7;">Format ID Valid (Siap Diproses)</div>
            <div class="mono" style="font-size:15px;font-weight:700;color:#fff;margin-top:2px;">\${localValidation.formattedSummary}</div>
            <div class="mono" style="font-size:12px;opacity:0.85;margin-top:2px;">\${localValidation.extraInfo}</div>
          </div>
          <button type="button" class="btn btn-success" onclick="document.getElementById('step-2-panel').scrollIntoView({behavior:'smooth'})">
            Lanjut ke Langkah 02 ↓
          </button>
        \`;
      } else {
        box.className = 'verify-box err';
        box.innerHTML = '<div><strong>Format ID Belum Sesuai:</strong> ' + localValidation.message + '</div>';
      }
    }

    function selectNominal(sku) {
      selectedNominal = selectedProduct.nominals.find(n => n.sku === sku) || selectedProduct.nominals[0];
      renderCheckout();
    }

    function selectPayment(id) {
      selectedPayment = PAYMENTS.find(m => m.id === id) || PAYMENTS[0];
      renderCheckout();
    }

    function updateSummary() {
      const fee = Math.round(selectedPayment.feeFlat + (selectedNominal.price * selectedPayment.feePercent) / 100);
      const total = selectedNominal.price + fee;
      document.getElementById('sum-product').textContent = selectedProduct.name;
      document.getElementById('sum-id').textContent = localValidation && localValidation.valid
        ? localValidation.formattedSummary
        : (userIdVal || '-');
      document.getElementById('sum-status').textContent = localValidation && localValidation.valid
        ? 'Format ID Valid (Siap Diproses)'
        : '-';
      document.getElementById('sum-df').textContent = localValidation && localValidation.valid
        ? localValidation.digiflazzCustomerNo
        : '-';
      document.getElementById('sum-item').textContent = selectedNominal.label;
      document.getElementById('sum-method').textContent = selectedPayment.name;
      document.getElementById('sum-price').textContent = formatIDR(selectedNominal.price);
      document.getElementById('sum-fee').textContent = formatIDR(fee);
      document.getElementById('sum-total').textContent = formatIDR(total);
      document.getElementById('pay-now-btn').disabled = !(localValidation && localValidation.valid);
    }

    function createAutomatedOrder() {
      if (!localValidation || !localValidation.valid) return;
      const fee = Math.round(selectedPayment.feeFlat + (selectedNominal.price * selectedPayment.feePercent) / 100);
      const total = selectedNominal.price + fee;
      const inv = 'INV-ISM-' + Date.now().toString().slice(-6);
      const tx = {
        invoiceId: inv,
        product: selectedProduct.name,
        productId: selectedProduct.id,
        sku: selectedNominal.sku,
        item: selectedNominal.label,
        formattedSummary: localValidation.formattedSummary,
        digiflazzCustomerNo: localValidation.digiflazzCustomerNo,
        payment: selectedPayment.name,
        total: total,
        status: 'PENDING_PAYMENT',
        sn: null,
        plnToken: null
      };
      localStorage.setItem('ism_tx_' + inv, JSON.stringify(tx));
      openInvoiceModal(tx);

      // Setelah pembayaran Midtrans sukses, kirim ke Digiflazz dengan parameter customer_no (tanpa spasi/kurung)
      setTimeout(() => {
        tx.status = 'SUCCESS';
        tx.sn = selectedNominal.sku + '-' + Math.floor(100000000 + Math.random() * 900000000);
        if (tx.productId === 'pln-token') {
          tx.plnToken = '4812-9034-5671-2289-4012';
        }
        localStorage.setItem('ism_tx_' + inv, JSON.stringify(tx));
        openInvoiceModal(tx);
      }, 3000);
    }

    function openInvoiceModal(tx) {
      const modal = document.getElementById('invoice-modal');
      modal.classList.add('open');
      const isDone = tx.status === 'SUCCESS';
      document.getElementById('invoice-body').innerHTML = \`
        <div class="summary-row"><span>Invoice</span><strong class="mono">\${tx.invoiceId}</strong></div>
        <div class="summary-row"><span>Produk</span><span>\${tx.product} (\${tx.item})</span></div>
        <div class="summary-row"><span>Ringkasan ID</span><span class="mono">\${tx.formattedSummary}</span></div>
        <div class="summary-row"><span>Digiflazz customer_no</span><strong class="mono" style="color:var(--accent);">\${tx.digiflazzCustomerNo}</strong></div>
        <div class="summary-row"><span>Metode Midtrans</span><span>\${tx.payment}</span></div>
        <div class="summary-row"><span>Total Bayar</span><strong class="mono" style="color:var(--accent);">\${formatIDR(tx.total)}</strong></div>
        <div class="token-box">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;">Status Midtrans → Digiflazz</div>
          <div style="font-weight:700;color:\${isDone ? 'var(--success)' : 'var(--accent)'};">
            \${isDone ? 'MIDTRANS LUNAS & TERKIRIM VIA DIGIFLAZZ!' : 'MENUNGGU PEMBAYARAN MIDTRANS...'}
          </div>
          \${tx.plnToken ? '<div style="margin-top:10px;font-size:12px;color:var(--muted);">20-Digit Token Stroom PLN:</div><div class="token-code">' + tx.plnToken + '</div>' : ''}
          \${tx.sn && !tx.plnToken ? '<div style="margin-top:8px;font-size:12px;color:var(--muted);">SN Digiflazz: <span class="mono" style="color:var(--text);">' + tx.sn + '</span></div>' : ''}
        </div>
      \`;
    }

    function trackInvoice() {
      const code = document.getElementById('track-input').value.trim();
      if (!code) return;
      const saved = localStorage.getItem('ism_tx_' + code);
      if (saved) {
        openInvoiceModal(JSON.parse(saved));
      } else {
        document.getElementById('track-result').textContent = 'Invoice ' + code + ' belum ditemukan di browser ini.';
      }
    }

    function closeModal() {
      document.getElementById('invoice-modal').classList.remove('open');
    }

    renderCatalog();
    renderCheckout();
  </script>
</body>
</html>`;
}
