import { detectIndonesianOperator } from '../data/catalog';
import type { LocalValidationResult, ProductItem } from '../types/store';

export function buildDigiflazzCustomerNo(
  product: ProductItem,
  userId: string,
  zoneOrServer?: string
): string {
  const cleanId = userId.trim().replace(/[\s()]/g, '');
  if (product.inputType === 'game-id-zone' && zoneOrServer) {
    const cleanZone = zoneOrServer.trim().replace(/[\s()]/g, '');
    return `${cleanId}${cleanZone}`;
  }
  return cleanId;
}

export function validateAccountFormatLocally(
  product: ProductItem,
  userId: string,
  zoneOrServer?: string
): LocalValidationResult {
  const cleanId = userId.trim();
  const cleanZone = (zoneOrServer || '').trim();

  if (!cleanId) {
    return {
      valid: false,
      formattedSummary: '',
      digiflazzCustomerNo: '',
      message: `${product.inputLabel} wajib diisi.`
    };
  }

  if (product.inputType === 'game-id-zone') {
    if (!/^\d{6,13}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'User ID harus berisi 6–13 digit angka.'
      };
    }
    if (!/^\d{4,6}$/.test(cleanZone)) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'Zone ID harus berisi 4–6 digit angka.'
      };
    }
    return {
      valid: true,
      formattedSummary: `${cleanId} (${cleanZone})`,
      digiflazzCustomerNo: `${cleanId}${cleanZone}`,
      extraInfo: `Target Digiflazz: ${cleanId}${cleanZone}`
    };
  }

  if (product.inputType === 'game-id-server') {
    if (!/^\d{6,13}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'UID harus berisi 6–13 digit angka.'
      };
    }
    if (!cleanZone) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'Silakan pilih server terlebih dahulu.'
      };
    }
    return {
      valid: true,
      formattedSummary: `${cleanId} (${cleanZone})`,
      digiflazzCustomerNo: cleanId,
      extraInfo: `Server ${cleanZone} · Target Digiflazz: ${cleanId}`
    };
  }

  if (product.inputType === 'pln-meter') {
    if (!/^\d{11,12}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'Nomor Meter / ID Pelanggan PLN harus berisi 11–12 digit angka.'
      };
    }
    return {
      valid: true,
      formattedSummary: cleanId,
      digiflazzCustomerNo: cleanId,
      extraInfo: 'Meter PLN Prabayar · Siap diproses ke Digiflazz'
    };
  }

  if (product.inputType === 'phone') {
    const op = detectIndonesianOperator(cleanId);
    if (!op.valid) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'Nomor HP harus 10–13 digit angka diawali 08xx.'
      };
    }
    const normalizedPhone = cleanId.startsWith('62')
      ? `0${cleanId.slice(2)}`
      : cleanId;
    return {
      valid: true,
      formattedSummary: normalizedPhone,
      digiflazzCustomerNo: normalizedPhone,
      extraInfo: `${op.operator} · ${op.region}`
    };
  }

  if (product.inputType === 'riot-id') {
    const isRiotTag = /^.{3,16}#[A-Za-z0-9]{2,6}$/.test(cleanId);
    const isNumeric = /^\d{6,13}$/.test(cleanId);
    if (!isRiotTag && !isNumeric) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: 'Masukkan Riot ID lengkap dengan #Tagline (contoh: Isman212#ID21).'
      };
    }
    const cleanCustomerNo = cleanId.replace(/\s+/g, '');
    return {
      valid: true,
      formattedSummary: cleanId,
      digiflazzCustomerNo: cleanCustomerNo,
      extraInfo: `Riot SEA · Target Digiflazz: ${cleanCustomerNo}`
    };
  }

  // Standard game-id
  const sampleIsNumeric = /^\d+$/.test(product.sampleAccount.userId);
  if (sampleIsNumeric) {
    if (!/^\d{6,13}$/.test(cleanId)) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: `${product.inputLabel} harus berisi 6–13 digit angka.`
      };
    }
  } else {
    const cleanLen = cleanId.replace(/\s+/g, '').length;
    if (cleanLen < 4 || cleanLen > 32) {
      return {
        valid: false,
        formattedSummary: '',
        digiflazzCustomerNo: '',
        message: `${product.inputLabel} minimal 4 karakter tanpa spasi berlebih.`
      };
    }
  }

  const customerNo = cleanId.replace(/[\s()]/g, '');
  return {
    valid: true,
    formattedSummary: cleanId,
    digiflazzCustomerNo: customerNo,
    extraInfo: `${product.publisher} · Target Digiflazz: ${customerNo}`
  };
}
