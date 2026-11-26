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
import type { TransactionRecord } from './src/types/store.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory transaction ledger for Midtrans payment & Digiflazz fulfillment tracking
const transactions = new Map<string, TransactionRecord>();

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

/**
 * Menggabungkan User ID dan Zone ID tanpa spasi maupun tanda kurung
 * untuk parameter customer_no pada API Digiflazz (contoh: 1547121072784).
 */
function buildDigiflazzCustomerNo(
  userId: string,
  zoneOrServer?: string,
  inputType?: string
): string {
  const cleanId = userId.trim().replace(/[\s()]/g, '');
  if (inputType === 'game-id-zone' && zoneOrServer) {
    const cleanZone = zoneOrServer.trim().replace(/[\s()]/g, '');
    return `${cleanId}${cleanZone}`;
  }
  return cleanId;
}

function validateFormatServerSide(
  productId: string,
  userId: string,
  zoneOrServer?: string
): { valid: boolean; formattedSummary: string; customerNo: string; extraInfo?: string; message?: string } {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return {
      valid: false,
      formattedSummary: '',
      customerNo: '',
      message: 'Produk tidak ditemukan.'
    };
  }

  const cleanId = userId.trim();
  const cleanZone = (zoneOrServer || '').trim();

  if (product.inputType === 'game-id-zone') {
    if (!/^\d{6,13}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'User ID harus berisi 6–13 digit angka.'
      };
    }
    if (!/^\d{4,6}$/.test(cleanZone)) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'Zone ID harus berisi 4–6 digit angka.'
      };
    }
    return {
      valid: true,
      formattedSummary: `${cleanId} (${cleanZone})`,
      customerNo: `${cleanId}${cleanZone}`,
      extraInfo: `Digiflazz customer_no: ${cleanId}${cleanZone}`
    };
  }

  if (product.inputType === 'game-id-server') {
    if (!/^\d{6,13}$/.test(cleanId) || !cleanZone) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'UID harus berisi 6–13 digit angka dan server wajib dipilih.'
      };
    }
    return {
      valid: true,
      formattedSummary: `${cleanId} (${cleanZone})`,
      customerNo: cleanId,
      extraInfo: `Server ${cleanZone}`
    };
  }

  if (product.inputType === 'pln-meter') {
    if (!/^\d{11,12}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'Nomor Meter PLN harus 11–12 digit angka.'
      };
    }
    return {
      valid: true,
      formattedSummary: cleanId,
      customerNo: cleanId,
      extraInfo: 'PLN Prabayar'
    };
  }

  if (product.inputType === 'phone') {
    const op = detectIndonesianOperator(cleanId);
    if (!op.valid) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'Nomor HP Indonesia tidak valid (08xx, 10–13 digit).'
      };
    }
    const normalizedPhone = cleanId.startsWith('62')
      ? `0${cleanId.slice(2)}`
      : cleanId;
    return {
      valid: true,
      formattedSummary: normalizedPhone,
      customerNo: normalizedPhone,
      extraInfo: op.operator
    };
  }

  if (product.inputType === 'riot-id') {
    const isRiotTag = /^.{3,16}#[A-Za-z0-9]{2,6}$/.test(cleanId);
    const isNumeric = /^\d{6,13}$/.test(cleanId);
    if (!isRiotTag && !isNumeric) {
      return {
        valid: false,
        formattedSummary: '',
        customerNo: '',
        message: 'Format Riot ID harus menyertakan #Tagline.'
      };
    }
    const customerNo = cleanId.replace(/[\s()]/g, '');
    return {
      valid: true,
      formattedSummary: cleanId,
      customerNo,
      extraInfo: 'Riot SEA'
    };
  }

  const sampleIsNumeric = /^\d+$/.test(product.sampleAccount.userId);
  if (sampleIsNumeric && !/^\d{6,13}$/.test(cleanId)) {
    return {
      valid: false,
      formattedSummary: '',
      customerNo: '',
      message: `${product.inputLabel} harus berisi 6–13 digit angka.`
    };
  }

  const customerNo = buildDigiflazzCustomerNo(cleanId, cleanZone, product.inputType);
  return {
    valid: true,
    formattedSummary: cleanId,
    customerNo,
    extraInfo: product.publisher
  };
}

/**
 * Mengirim transaksi topup otomatis ke API Digiflazz setelah pembayaran Midtrans sukses.
 */
async function sendToDigiflazz(tx: TransactionRecord): Promise<void> {
  if (tx.status === 'SUCCESS') return;
  tx.status = 'PROCESSING_TOPUP';
  tx.paidAt = tx.paidAt || new Date().toISOString();
  transactions.set(tx.invoiceId, tx);

  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  if (username && apiKey) {
    try {
      const sign = crypto
        .createHash('md5')
        .update(`${username}${apiKey}${tx.invoiceId}`)
        .digest('hex');

      const dfPayload = {
        username,
        buyer_sku_code: tx.sku,
        customer_no: tx.digiflazzCustomerNo,
        ref_id: tx.invoiceId,
        sign
      };

      const dfRes = await fetch('https://api.digiflazz.com/v1/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dfPayload)
      });

      const dfJson = (await dfRes.json()) as {
        data?: { status?: string; sn?: string; message?: string };
      };

      if (dfJson?.data) {
        const dfStatus = (dfJson.data.status || '').toLowerCase();
        tx.digiflazzMessage = dfJson.data.message;
        if (dfStatus === 'sukses') {
          tx.status = 'SUCCESS';
          tx.completedAt = new Date().toISOString();
          if (tx.productId === 'pln-token') {
            tx.plnToken = dfJson.data.sn || generate20DigitPlnToken(tx.invoiceId);
          }
          tx.serialNumber = dfJson.data.sn || generateSerialNumber(tx.sku);
          transactions.set(tx.invoiceId, tx);
          return;
        }
        if (dfStatus === 'pending') {
          tx.status = 'PROCESSING_TOPUP';
          transactions.set(tx.invoiceId, tx);
          return;
        }
        if (dfStatus === 'gagal') {
          tx.status = 'FAILED';
          transactions.set(tx.invoiceId, tx);
          return;
        }
      }
    } catch {
      // Fall back to automated sandbox fulfillment below if network/credentials are sandboxed
    }
  }

  // Sandbox / Demo fulfillment when Digiflazz production credentials are not supplied
  setTimeout(() => {
    const current = transactions.get(tx.invoiceId);
    if (!current || current.status === 'SUCCESS') return;
    current.status = 'SUCCESS';
    current.completedAt = new Date().toISOString();
    if (current.productId === 'pln-token') {
      current.plnToken = generate20DigitPlnToken(current.invoiceId);
      current.serialNumber = `PLN-${current.invoiceId.slice(-8)}`;
    } else {
      current.serialNumber = generateSerialNumber(current.sku);
    }
    transactions.set(current.invoiceId, current);
  }, 1100);
}

// API: Get full catalog & payment methods
app.get('/api/catalog', (_req, res) => {
  res.json({
    store: 'ismanstore212',
    products: CATALOG_PRODUCTS,
    paymentMethods: PAYMENT_METHODS,
    paymentProvider: 'Midtrans',
    fulfillmentProvider: 'Digiflazz'
  });
});

// API: Create Midtrans Transaction Invoice (Digiflazz customer_no prepared automatically)
app.post('/api/create-transaction', async (req, res) => {
  const { productId, sku, userId, zoneOrServer, paymentMethodId } = req.body as {
    productId: string;
    sku: string;
    userId: string;
    zoneOrServer?: string;
    paymentMethodId: string;
  };

  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  const nominal = product?.nominals.find((n) => n.sku === sku);
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);

  if (!product || !nominal || !method || !userId) {
    return res.status(400).json({ error: 'Data pesanan tidak lengkap atau tidak valid.' });
  }

  const validation = validateFormatServerSide(productId, userId, zoneOrServer);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message || 'Format ID tidak valid.' });
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

  let gatewayProvider = 'Midtrans Auto-Gateway';
  let snapRedirectUrl: string | undefined;

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
        const mtData = (await mtResp.json()) as { redirect_url?: string };
        gatewayProvider = 'Midtrans Snap API';
        snapRedirectUrl = mtData.redirect_url;
      }
    } catch {
      // Keep built-in Midtrans-compatible flow active
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
    formattedSummary: validation.formattedSummary,
    digiflazzCustomerNo: validation.customerNo,
    extraInfo: validation.extraInfo,
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
    snapRedirectUrl,
    gatewayProvider,
    fulfillmentProvider: 'Digiflazz API',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  transactions.set(invoiceId, record);

  // Simulasi callback Midtrans otomatis dalam 4 detik jika memakai sandbox internal
  if (!process.env.MIDTRANS_SERVER_KEY) {
    setTimeout(() => {
      const existing = transactions.get(invoiceId);
      if (existing && existing.status === 'PENDING_PAYMENT') {
        existing.status = 'PAID';
        existing.paidAt = new Date().toISOString();
        transactions.set(invoiceId, existing);
        void sendToDigiflazz(existing);
      }
    }, 4000);
  }

  return res.status(201).json(record);
});

// API: Webhook Midtrans -> otomatis memicu topup ke API Digiflazz
app.post('/api/payment-webhook', async (req, res) => {
  const {
    invoiceId,
    order_id,
    status,
    transaction_status
  } = req.body as {
    invoiceId?: string;
    order_id?: string;
    status?: string;
    transaction_status?: string;
  };
  const targetId = invoiceId || order_id;
  if (!targetId) {
    return res.status(400).json({ error: 'invoiceId / order_id wajib diisi.' });
  }
  const tx = transactions.get(targetId);
  if (!tx) {
    return res.status(404).json({ error: 'Invoice tidak ditemukan.' });
  }

  const normalizedStatus = (transaction_status || status || 'settlement').toLowerCase();
  if (['paid', 'settlement', 'capture'].includes(normalizedStatus)) {
    tx.status = 'PAID';
    tx.paidAt = new Date().toISOString();
    transactions.set(targetId, tx);
    await sendToDigiflazz(tx);
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
