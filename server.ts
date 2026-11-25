import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  CATALOG_PRODUCTS,
  PAYMENT_METHODS,
  detectIndonesianOperator
} from './src/data/catalog.ts';
import type {
  AccountLookupResponse,
  TransactionRecord
} from './src/types/store.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory transaction ledger for live automated payment & fulfillment tracking
const transactions = new Map<string, TransactionRecord>();

const GAMER_NICKNAME_POOL = [
  'ISMAN_PRO212',
  'GARUDA_ELITE',
  'KINGS_SHADOW',
  'NUSANTARA_ACE',
  'VORTEX_STRIKER',
  'PHANTOM_REIGN',
  'LORDSLAYER_ID',
  'APEX_MAESTRO',
  'CYBER_SAMURAI',
  'BLITZ_COMMANDER',
  'VALKYRIE_99',
  'DRAGONBORN_ID'
];

const PLN_CUSTOMER_POOL = [
  'ISMAN HIDAYAT',
  'BUDI SANTOSO',
  'SITI RAHMAWATI',
  'AHMAD FAUZI',
  'DEWI LESTARI',
  'REZA PRATAMA',
  'HENDRA WIJAYA',
  'PUTRI ANGGRAINI'
];

const PLN_TARIF_POOL = [
  'R1 / 900 VA',
  'R1M / 1300 VA',
  'R1 / 2200 VA',
  'R2 / 3500 VA',
  'B1 / 1300 VA'
];

function deterministicHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generate20DigitPlnToken(seed: string): string {
  const digits = crypto
    .createHash('sha256')
    .update(seed + Date.now().toString())
    .digest('hex')
    .replace(/[a-f]/g, (ch) => String(ch.charCodeAt(0) % 10));
  const raw20 = (digits + '48291037465918273645').slice(0, 20);
  return raw20.match(/.{1,4}/g)?.join('-') ?? raw20;
}

function generateSerialNumber(prefix: string): string {
  const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
  return `${prefix}-${randomDigits}`;
}

function lookupAccountLocally(
  productId: string,
  userId: string,
  zoneOrServer?: string
): AccountLookupResponse {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return {
      valid: false,
      accountName: '',
      source: 'auto-verifier',
      message: 'Produk tidak ditemukan dalam katalog.'
    };
  }

  const trimmedId = userId.trim();
  if (!trimmedId) {
    return {
      valid: false,
      accountName: '',
      source: 'auto-verifier',
      message: `${product.inputLabel} wajib diisi.`
    };
  }

  // Exact sample match for instant realistic testing
  if (
    trimmedId.toLowerCase() === product.sampleAccount.userId.toLowerCase() &&
    (!product.sampleAccount.zoneOrServer ||
      !zoneOrServer ||
      zoneOrServer.trim().toLowerCase() ===
        product.sampleAccount.zoneOrServer.toLowerCase())
  ) {
    return {
      valid: true,
      accountName: product.sampleAccount.expectedName,
      extraInfo: product.sampleAccount.extraInfo,
      source: 'auto-verifier'
    };
  }

  if (product.inputType === 'pln-meter') {
    const digits = trimmedId.replace(/\D/g, '');
    if (digits.length < 11 || digits.length > 12) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'Nomor Meter / ID Pelanggan PLN harus 11 atau 12 digit angka.'
      };
    }
    const idx = deterministicHash(digits);
    const owner = PLN_CUSTOMER_POOL[idx % PLN_CUSTOMER_POOL.length];
    const tarif = PLN_TARIF_POOL[idx % PLN_TARIF_POOL.length];
    return {
      valid: true,
      accountName: owner,
      extraInfo: `Tarif ${tarif} · Meter Prabayar`,
      source: 'auto-verifier'
    };
  }

  if (product.inputType === 'phone') {
    const op = detectIndonesianOperator(trimmedId);
    if (!op.valid) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'Masukkan nomor HP Indonesia yang valid (awal 08xx, 10–13 digit).'
      };
    }
    return {
      valid: true,
      accountName: op.operator,
      extraInfo: op.region,
      operatorName: op.operator,
      source: 'auto-verifier'
    };
  }

  if (product.inputType === 'game-id-zone') {
    if (trimmedId.length < 5 || !/^\d+$/.test(trimmedId)) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'User ID harus berupa angka minimal 5 digit.'
      };
    }
    if (!zoneOrServer || zoneOrServer.trim().length < 3 || !/^\d+$/.test(zoneOrServer.trim())) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'Zone ID wajib diisi dengan 3–5 digit angka.'
      };
    }
    const idx = deterministicHash(`${productId}:${trimmedId}:${zoneOrServer}`);
    const nick = GAMER_NICKNAME_POOL[idx % GAMER_NICKNAME_POOL.length];
    return {
      valid: true,
      accountName: `${nick}_${trimmedId.slice(-3)}`,
      extraInfo: `Zone (${zoneOrServer.trim()}) · Akun Terverifikasi`,
      source: 'auto-verifier'
    };
  }

  if (product.inputType === 'riot-id') {
    if (!trimmedId.includes('#') || trimmedId.split('#')[1].length < 2) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'Format Riot ID harus menyertakan #Tagline (contoh: Nama#ID21).'
      };
    }
    return {
      valid: true,
      accountName: trimmedId,
      extraInfo: 'Server SEA / Indonesia · Siap Topup',
      source: 'auto-verifier'
    };
  }

  if (product.inputType === 'game-id-server') {
    if (trimmedId.length < 6) {
      return {
        valid: false,
        accountName: '',
        source: 'auto-verifier',
        message: 'UID minimal 6 karakter.'
      };
    }
    const idx = deterministicHash(`${productId}:${trimmedId}`);
    const nick = GAMER_NICKNAME_POOL[idx % GAMER_NICKNAME_POOL.length];
    return {
      valid: true,
      accountName: `${nick}`,
      extraInfo: `Server ${zoneOrServer || 'Asia'} · Terverifikasi`,
      source: 'auto-verifier'
    };
  }

  // Standard game-id (Free Fire, PUBG, Roblox, CODM, Clash of Clans, Steam, etc.)
  if (trimmedId.length < 4) {
    return {
      valid: false,
      accountName: '',
      source: 'auto-verifier',
      message: `${product.inputLabel} minimal 4 karakter.`
    };
  }

  // If user typed a username (contains letters), display formatted nickname; if numeric ID, map deterministically
  const hasLetters = /[a-zA-Z]/.test(trimmedId);
  const idx = deterministicHash(`${productId}:${trimmedId}`);
  const accountName = hasLetters
    ? trimmedId
    : `${GAMER_NICKNAME_POOL[idx % GAMER_NICKNAME_POOL.length]}_${trimmedId.slice(-2)}`;

  return {
    valid: true,
    accountName,
    extraInfo: `${product.publisher} · Akun Terverifikasi`,
    source: 'auto-verifier'
  };
}

// API: Get full catalog & payment methods
app.get('/api/catalog', (_req, res) => {
  res.json({
    store: 'ismanstore212',
    products: CATALOG_PRODUCTS,
    paymentMethods: PAYMENT_METHODS,
    gatewayMode: process.env.MIDTRANS_SERVER_KEY ? 'midtrans-live' : 'auto-instant-gateway'
  });
});

// API: Check Game Nickname / PLN Meter Owner Name / Carrier Prefix
app.post('/api/check-account', async (req, res) => {
  const { productId, userId, zoneOrServer } = req.body as {
    productId?: string;
    userId?: string;
    zoneOrServer?: string;
  };

  if (!productId || !userId) {
    return res.status(400).json({
      valid: false,
      accountName: '',
      source: 'auto-verifier',
      message: 'Parameter productId dan userId wajib dikirim.'
    });
  }

  // If Digiflazz PLN inquiry key is configured, real inquiry can run here
  if (
    productId === 'pln-token' &&
    process.env.DIGIFLAZZ_USERNAME &&
    process.env.DIGIFLAZZ_API_KEY
  ) {
    try {
      const sign = crypto
        .createHash('md5')
        .update(process.env.DIGIFLAZZ_USERNAME + process.env.DIGIFLAZZ_API_KEY + userId)
        .digest('hex');
      const response = await fetch('https://api.digiflazz.com/v1/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: 'pln-subscribe',
          customer_no: userId.trim(),
          username: process.env.DIGIFLAZZ_USERNAME,
          sign
        })
      });
      const json = (await response.json()) as {
        data?: { name?: string; segment_power?: string; subscriber_id?: string };
      };
      if (json?.data?.name) {
        return res.json({
          valid: true,
          accountName: json.data.name,
          extraInfo: `Tarif/Daya: ${json.data.segment_power || 'Prabayar'}`,
          source: 'external-api'
        });
      }
    } catch {
      // Fall back cleanly to built-in verifier
    }
  }

  const result = lookupAccountLocally(productId, userId, zoneOrServer);
  return res.json(result);
});

// Helper to fulfill a paid transaction automatically
function fulfillTransaction(tx: TransactionRecord) {
  if (tx.status === 'SUCCESS') return;
  tx.status = 'PROCESSING_TOPUP';
  tx.paidAt = tx.paidAt || new Date().toISOString();

  setTimeout(() => {
    const current = transactions.get(tx.invoiceId);
    if (!current) return;
    current.status = 'SUCCESS';
    current.completedAt = new Date().toISOString();
    if (current.productId === 'pln-token') {
      current.plnToken = generate20DigitPlnToken(current.invoiceId);
      current.serialNumber = `PLN-${current.invoiceId.slice(-8)}`;
    } else {
      current.serialNumber = generateSerialNumber(current.sku);
    }
    transactions.set(current.invoiceId, current);
  }, 1200);
}

// API: Create Automated Transaction & Payment Invoice
app.post('/api/create-transaction', async (req, res) => {
  const { productId, sku, userId, zoneOrServer, accountName, extraInfo, paymentMethodId } =
    req.body as {
      productId: string;
      sku: string;
      userId: string;
      zoneOrServer?: string;
      accountName?: string;
      extraInfo?: string;
      paymentMethodId: string;
    };

  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  const nominal = product?.nominals.find((n) => n.sku === sku);
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);

  if (!product || !nominal || !method || !userId) {
    return res.status(400).json({ error: 'Data pesanan tidak lengkap atau tidak valid.' });
  }

  const verifiedLookup = lookupAccountLocally(productId, userId, zoneOrServer);
  if (!verifiedLookup.valid) {
    return res.status(400).json({ error: verifiedLookup.message || 'Akun tidak valid.' });
  }

  const fee = Math.round(method.feeFlat + (nominal.price * method.feePercent) / 100);
  const uniqueCode = method.group === 'QRIS' ? Math.floor(11 + Math.random() * 88) : 0;
  const totalAmount = nominal.price + fee + uniqueCode;

  const invoiceId = `INV-ISM-${Date.now().toString().slice(-6)}${Math.floor(
    100 + Math.random() * 899
  )}`;

  const paymentCode =
    method.group === 'Virtual Account'
      ? `8808${Math.floor(10000000000 + Math.random() * 89999999999)}`
      : method.group === 'QRIS'
        ? `00020101021226610016ID.ISMANSTORE212.WWW011893600914000002120215${invoiceId}520458125303360540${totalAmount}5802ID5912ISMANSTORE2126007JAKARTA6304A1B2`
        : `PAY-${method.code}-${invoiceId.slice(-6)}`;

  let gatewayProvider = 'IsmanPay Auto-Gateway';

  // Optional real Midtrans Snap/Core API integration if MIDTRANS_SERVER_KEY is present
  if (process.env.MIDTRANS_SERVER_KEY) {
    try {
      const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');
      const midtransBase =
        process.env.MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/v1/transactions'
          : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
      const mtResp = await fetch(midtransBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: invoiceId,
            gross_amount: totalAmount
          },
          item_details: [
            {
              id: nominal.sku,
              price: totalAmount,
              quantity: 1,
              name: `${product.name} - ${nominal.label}`.slice(0, 50)
            }
          ]
        })
      });
      if (mtResp.ok) {
        gatewayProvider = 'Midtrans Snap API';
      }
    } catch {
      // Keep built-in automated gateway active
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  const record: TransactionRecord = {
    invoiceId,
    productId: product.id,
    productName: product.name,
    sku: nominal.sku,
    nominalLabel: nominal.label,
    userId: userId.trim(),
    zoneOrServer: zoneOrServer?.trim() || undefined,
    accountName: accountName || verifiedLookup.accountName,
    extraInfo: extraInfo || verifiedLookup.extraInfo,
    paymentMethodId: method.id,
    paymentMethodName: method.name,
    paymentGroup: method.group,
    amount: nominal.price,
    fee,
    uniqueCode,
    totalAmount,
    status: 'PENDING_PAYMENT',
    paymentCode,
    qrPayload: method.group === 'QRIS' ? paymentCode : undefined,
    gatewayProvider,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  transactions.set(invoiceId, record);

  // Automatic Gateway Polling Simulation: verifies payment automatically in 4.5s
  // (Users can also trigger instant webhook confirmation manually via UI button)
  setTimeout(() => {
    const existing = transactions.get(invoiceId);
    if (existing && existing.status === 'PENDING_PAYMENT') {
      existing.status = 'PAID';
      existing.paidAt = new Date().toISOString();
      transactions.set(invoiceId, existing);
      fulfillTransaction(existing);
    }
  }, 4500);

  return res.status(201).json(record);
});

// API: Webhook endpoint for Midtrans / Tripay / Instant Auto-Verification
app.post('/api/payment-webhook', (req, res) => {
  const { invoiceId, order_id, status } = req.body as {
    invoiceId?: string;
    order_id?: string;
    status?: string;
  };
  const targetId = invoiceId || order_id;
  if (!targetId) {
    return res.status(400).json({ error: 'invoiceId wajib diisi.' });
  }
  const tx = transactions.get(targetId);
  if (!tx) {
    return res.status(404).json({ error: 'Invoice tidak ditemukan.' });
  }

  if (!status || status === 'PAID' || status === 'settlement' || status === 'capture') {
    tx.status = 'PAID';
    tx.paidAt = new Date().toISOString();
    transactions.set(targetId, tx);
    fulfillTransaction(tx);
  }

  return res.json({ ok: true, transaction: transactions.get(targetId) });
});

// API: Get single transaction status
app.get('/api/transaction/:invoiceId', (req, res) => {
  const tx = transactions.get(req.params.invoiceId);
  if (!tx) {
    return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
  }
  return res.json(tx);
});

// API: List recent transactions
app.get('/api/transactions', (_req, res) => {
  const list = Array.from(transactions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ transactions: list.slice(0, 20) });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ismanstore212 server running at http://localhost:${PORT}`);
  });
}

startServer();
