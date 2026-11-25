export type ProductCategory =
  | 'game-mobile'
  | 'game-pc'
  | 'pln'
  | 'paket-data'
  | 'pulsa';

export interface NominalOption {
  sku: string;
  label: string;
  bonus?: string;
  price: number;
  basePrice?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  publisher: string;
  category: ProductCategory;
  currencyName: string;
  image: string;
  accentColor: string;
  popular?: boolean;
  inputType: 'game-id' | 'game-id-zone' | 'game-id-server' | 'riot-id' | 'pln-meter' | 'phone';
  inputLabel: string;
  inputPlaceholder: string;
  zoneLabel?: string;
  zonePlaceholder?: string;
  serverOptions?: string[];
  helperText: string;
  sampleAccount: {
    userId: string;
    zoneOrServer?: string;
    expectedName: string;
    extraInfo?: string;
  };
  nominals: NominalOption[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  group: 'QRIS' | 'Virtual Account' | 'E-Wallet';
  code: string;
  feeFlat: number;
  feePercent: number;
  autoVerify: boolean;
  description: string;
}

export interface AccountLookupResponse {
  valid: boolean;
  accountName: string;
  extraInfo?: string;
  operatorName?: string;
  source: 'external-api' | 'auto-verifier';
  message?: string;
}

export type TransactionStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING_TOPUP'
  | 'SUCCESS'
  | 'FAILED';

export interface TransactionRecord {
  invoiceId: string;
  productId: string;
  productName: string;
  sku: string;
  nominalLabel: string;
  userId: string;
  zoneOrServer?: string;
  accountName: string;
  extraInfo?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentGroup: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  status: TransactionStatus;
  paymentCode: string;
  qrPayload?: string;
  serialNumber?: string;
  plnToken?: string;
  gatewayProvider: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  expiresAt: string;
}
