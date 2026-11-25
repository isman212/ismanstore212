import { PaymentMethod, ProductItem } from '../types/store';

const IMG_MOBA = '/src/assets/images/cat_moba_fantasy_1795136372906.jpg';
const IMG_SHOOTER = '/src/assets/images/cat_tactical_shooter_1795136372954.jpg';
const IMG_UTILITY = '/src/assets/images/cat_energy_digital_1795136373094.jpg';
const IMG_HERO = '/src/assets/images/hero_gaming_arena_1795136373183.jpg';

export const HERO_BANNER_IMAGE = IMG_HERO;

export const CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    publisher: 'Moonton',
    category: 'game-mobile',
    currencyName: 'Diamonds',
    image: IMG_MOBA,
    accentColor: '#F59E0B',
    popular: true,
    inputType: 'game-id-zone',
    inputLabel: 'User ID',
    inputPlaceholder: 'Contoh: 123456789',
    zoneLabel: 'Zone ID',
    zonePlaceholder: 'Contoh: 2124',
    helperText: 'Buka profil game MLBB Anda, salin angka User ID dan 4 digit Zone ID di dalam tanda kurung.',
    sampleAccount: {
      userId: '184920112',
      zoneOrServer: '2124',
      expectedName: 'ISMAN_PRO212',
      extraInfo: 'Server Asia · Mythic Honor'
    },
    nominals: [
      { sku: 'ML-12', label: '12 Diamonds', bonus: '11 + 1 Bonus', price: 3600 },
      { sku: 'ML-59', label: '59 Diamonds', bonus: '53 + 6 Bonus', price: 15800 },
      { sku: 'ML-86', label: '86 Diamonds', bonus: '78 + 8 Bonus', price: 21900, basePrice: 24000 },
      { sku: 'ML-172', label: '172 Diamonds', bonus: '156 + 16 Bonus', price: 43500, basePrice: 48000 },
      { sku: 'ML-257', label: '257 Diamonds', bonus: '234 + 23 Bonus', price: 64900 },
      { sku: 'ML-344', label: '344 Diamonds', bonus: '312 + 32 Bonus', price: 86800 },
      { sku: 'ML-706', label: '706 Diamonds', bonus: '625 + 81 Bonus', price: 173500, basePrice: 189000 },
      { sku: 'ML-WDP', label: 'Weekly Diamond Pass', bonus: '220 DM + Item', price: 27900, basePrice: 31000 },
      { sku: 'ML-TWL', label: 'Twilight Pass', bonus: 'Skin & Tiket', price: 145000 }
    ]
  },
  {
    id: 'free-fire',
    name: 'Free Fire & FF Max',
    publisher: 'Garena',
    category: 'game-mobile',
    currencyName: 'Diamonds',
    image: IMG_SHOOTER,
    accentColor: '#EF4444',
    popular: true,
    inputType: 'game-id',
    inputLabel: 'Player ID',
    inputPlaceholder: 'Contoh: 2145987612',
    helperText: 'Ketuk ikon profil di pojok kiri atas lobby Free Fire untuk melihat Player ID numerik.',
    sampleAccount: {
      userId: '2145987612',
      expectedName: 'BOOYAH_ISMAN',
      extraInfo: 'Region Indonesia'
    },
    nominals: [
      { sku: 'FF-50', label: '50 Diamonds', price: 7200 },
      { sku: 'FF-70', label: '70 Diamonds', price: 9800 },
      { sku: 'FF-140', label: '140 Diamonds', price: 19400, basePrice: 21000 },
      { sku: 'FF-355', label: '355 Diamonds', price: 47800 },
      { sku: 'FF-720', label: '720 Diamonds', price: 95500, basePrice: 102000 },
      { sku: 'FF-1450', label: '1.450 Diamonds', price: 191000 },
      { sku: 'FF-MM', label: 'Membership Mingguan', bonus: '450 DM Total', price: 28500 },
      { sku: 'FF-MB', label: 'Membership Bulanan', bonus: '2.600 DM Total', price: 84500 }
    ]
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile Indonesia',
    publisher: 'Krafton / Level Infinite',
    category: 'game-mobile',
    currencyName: 'UC',
    image: IMG_SHOOTER,
    accentColor: '#F59E0B',
    popular: true,
    inputType: 'game-id',
    inputLabel: 'Character ID',
    inputPlaceholder: 'Contoh: 5123984751',
    helperText: 'Masuk ke profil PUBG Mobile, salin angka Character ID di bawah avatar.',
    sampleAccount: {
      userId: '5123984751',
      expectedName: 'SNIPER212_ID',
      extraInfo: 'Server Global / ID'
    },
    nominals: [
      { sku: 'PUBG-60', label: '60 UC', price: 14500 },
      { sku: 'PUBG-325', label: '325 UC', bonus: '300 + 25 Bonus', price: 71500, basePrice: 76000 },
      { sku: 'PUBG-660', label: '660 UC', bonus: '600 + 60 Bonus', price: 142000 },
      { sku: 'PUBG-1800', label: '1.800 UC', bonus: '1500 + 300 Bonus', price: 356000 },
      { sku: 'PUBG-3850', label: '3.850 UC', bonus: '3000 + 850 Bonus', price: 712000 }
    ]
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    publisher: 'HoYoverse',
    category: 'game-mobile',
    currencyName: 'Genesis Crystals',
    image: IMG_MOBA,
    accentColor: '#38BDF8',
    popular: true,
    inputType: 'game-id-server',
    inputLabel: 'UID',
    inputPlaceholder: 'Contoh: 801234567',
    zoneLabel: 'Server',
    serverOptions: ['Asia', 'America', 'Europe', 'TW, HK, MO'],
    helperText: 'Masukkan 9 digit UID di kanan bawah layar dan pilih server tempat karakter dibuat.',
    sampleAccount: {
      userId: '801234567',
      zoneOrServer: 'Asia',
      expectedName: 'Traveler_Isman',
      extraInfo: 'AR 60 · Server Asia'
    },
    nominals: [
      { sku: 'GI-BLESS', label: 'Blessing of the Welkin Moon', bonus: '300 GC + 2700 Primo', price: 63500, basePrice: 79000 },
      { sku: 'GI-60', label: '60 Genesis Crystals', price: 14200 },
      { sku: 'GI-330', label: '330 Genesis Crystals', bonus: '300 + 30 Bonus', price: 64500 },
      { sku: 'GI-1090', label: '1.090 Genesis Crystals', bonus: '980 + 110 Bonus', price: 199000 },
      { sku: 'GI-2240', label: '2.240 Genesis Crystals', bonus: '1980 + 260 Bonus', price: 415000 },
      { sku: 'GI-6480', label: '6.480 Genesis Crystals', bonus: '+1600 Bonus Pertama', price: 1245000 }
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    publisher: 'Riot Games',
    category: 'game-pc',
    currencyName: 'Valorant Points',
    image: IMG_SHOOTER,
    accentColor: '#F43F5E',
    popular: true,
    inputType: 'riot-id',
    inputLabel: 'Riot ID & Tagline',
    inputPlaceholder: 'Contoh: Isman212#ID21',
    helperText: 'Gunakan format lengkap NamaRiot#Tagline (contoh: PlayerOne#SEA).',
    sampleAccount: {
      userId: 'Isman212#ID21',
      expectedName: 'Isman212#ID21',
      extraInfo: 'Riot SEA · Ascendant II'
    },
    nominals: [
      { sku: 'VAL-475', label: '475 VP', price: 54000 },
      { sku: 'VAL-1000', label: '1.000 VP', price: 109000 },
      { sku: 'VAL-2050', label: '2.050 VP', price: 218000, basePrice: 230000 },
      { sku: 'VAL-3650', label: '3.650 VP', price: 382000 },
      { sku: 'VAL-5350', label: '5.350 VP', price: 545000 },
      { sku: 'VAL-11000', label: '11.000 VP', price: 1085000 }
    ]
  },
  {
    id: 'pln-token',
    name: 'Token Listrik PLN Prabayar',
    publisher: 'PT PLN (Persero)',
    category: 'pln',
    currencyName: 'Token kWh',
    image: IMG_UTILITY,
    accentColor: '#FBBF24',
    popular: true,
    inputType: 'pln-meter',
    inputLabel: 'Nomor Meter / ID Pelanggan PLN',
    inputPlaceholder: 'Contoh: 538712345678',
    helperText: 'Masukkan 11 atau 12 digit Nomor Meter / IDPEL. Nama pemilik meter dan daya terpasang akan terbaca otomatis.',
    sampleAccount: {
      userId: '538712345678',
      expectedName: 'ISMAN HIDAYAT',
      extraInfo: 'Tarif R1M / Daya 1300 VA'
    },
    nominals: [
      { sku: 'PLN-20', label: 'Token PLN Rp 20.000', bonus: 'Est. 13.4 kWh', price: 21500 },
      { sku: 'PLN-50', label: 'Token PLN Rp 50.000', bonus: 'Est. 33.8 kWh', price: 51500 },
      { sku: 'PLN-100', label: 'Token PLN Rp 100.000', bonus: 'Est. 67.6 kWh', price: 101500 },
      { sku: 'PLN-200', label: 'Token PLN Rp 200.000', bonus: 'Est. 135.2 kWh', price: 201500 },
      { sku: 'PLN-500', label: 'Token PLN Rp 500.000', bonus: 'Est. 338.1 kWh', price: 501500 },
      { sku: 'PLN-1000', label: 'Token PLN Rp 1.000.000', bonus: 'Est. 676.2 kWh', price: 1001500 }
    ]
  },
  {
    id: 'paket-data',
    name: 'Paket Data Internet All Operator',
    publisher: 'Telkomsel · Indosat · XL · Tri · Axis · Smartfren',
    category: 'paket-data',
    currencyName: 'Kuota Internet',
    image: IMG_UTILITY,
    accentColor: '#10B981',
    popular: true,
    inputType: 'phone',
    inputLabel: 'Nomor HP Tujuan',
    inputPlaceholder: 'Contoh: 081234567890',
    helperText: 'Operator seluler terdeteksi otomatis dari awalan nomor HP (0811–0899).',
    sampleAccount: {
      userId: '081298765432',
      expectedName: 'TELKOMSEL PRABAYAR',
      extraInfo: 'Kartu Aktif · Wilayah Jabodetabek'
    },
    nominals: [
      { sku: 'DATA-3GB', label: 'Kuota Utama 3 GB', bonus: 'Masa Aktif 30 Hari', price: 18500 },
      { sku: 'DATA-8GB', label: 'Kuota Utama 8 GB', bonus: '30 Hari + Nelpon', price: 34900 },
      { sku: 'DATA-15GB', label: 'Kuota Combo 15 GB', bonus: '30 Hari Full 24 Jam', price: 54500, basePrice: 60000 },
      { sku: 'DATA-30GB', label: 'Kuota Super 30 GB', bonus: '30 Hari + Streaming', price: 88000 },
      { sku: 'DATA-50GB', label: 'Kuota Pro Gamer 50 GB', bonus: 'Low Latency 30 Hari', price: 129000 },
      { sku: 'DATA-100GB', label: 'Kuota Unlimited / 100 GB', bonus: 'Prioritas 5G 30 Hari', price: 198000 }
    ]
  },
  {
    id: 'pulsa-reguler',
    name: 'Pulsa Reguler All Operator',
    publisher: 'Telkomsel · Indosat · XL · Axis · Tri · Smartfren · by.U',
    category: 'pulsa',
    currencyName: 'Pulsa',
    image: IMG_UTILITY,
    accentColor: '#0EA5E9',
    popular: true,
    inputType: 'phone',
    inputLabel: 'Nomor HP Tujuan',
    inputPlaceholder: 'Contoh: 085712345678',
    helperText: 'Isi ulang pulsa resmi menambah masa aktif kartu secara otomatis dalam hitungan detik.',
    sampleAccount: {
      userId: '085712345678',
      expectedName: 'INDOSAT OOREDOO IM3',
      extraInfo: 'Nomor Tervalidasi · Siap Topup'
    },
    nominals: [
      { sku: 'PLS-5', label: 'Pulsa 5.000', bonus: '+5 Hari Aktif', price: 6200 },
      { sku: 'PLS-10', label: 'Pulsa 10.000', bonus: '+15 Hari Aktif', price: 11200 },
      { sku: 'PLS-25', label: 'Pulsa 25.000', bonus: '+30 Hari Aktif', price: 25900 },
      { sku: 'PLS-50', label: 'Pulsa 50.000', bonus: '+45 Hari Aktif', price: 50500 },
      { sku: 'PLS-100', label: 'Pulsa 100.000', bonus: '+60 Hari Aktif', price: 99500, basePrice: 102000 },
      { sku: 'PLS-200', label: 'Pulsa 200.000', bonus: '+90 Hari Aktif', price: 198500 }
    ]
  },
  {
    id: 'honkai-star-rail',
    name: 'Honkai: Star Rail',
    publisher: 'HoYoverse',
    category: 'game-mobile',
    currencyName: 'Oneiric Shard',
    image: IMG_MOBA,
    accentColor: '#8B5CF6',
    inputType: 'game-id-server',
    inputLabel: 'UID',
    inputPlaceholder: 'Contoh: 809876543',
    zoneLabel: 'Server',
    serverOptions: ['Asia', 'America', 'Europe', 'TW, HK, MO'],
    helperText: 'Salin UID dari menu Smartphone di dalam game Honkai: Star Rail.',
    sampleAccount: {
      userId: '809876543',
      zoneOrServer: 'Asia',
      expectedName: 'Trailblazer212',
      extraInfo: 'Server Asia · TL 70'
    },
    nominals: [
      { sku: 'HSR-PASS', label: 'Express Supply Pass', bonus: '300 Shard + 2700 Jade', price: 63500 },
      { sku: 'HSR-60', label: '60 Oneiric Shards', price: 14200 },
      { sku: 'HSR-330', label: '330 Oneiric Shards', price: 64500 },
      { sku: 'HSR-1090', label: '1.090 Oneiric Shards', price: 199000 },
      { sku: 'HSR-2240', label: '2.240 Oneiric Shards', price: 415000 }
    ]
  },
  {
    id: 'honor-of-kings',
    name: 'Honor of Kings',
    publisher: 'Level Infinite / TiMi',
    category: 'game-mobile',
    currencyName: 'Tokens',
    image: IMG_MOBA,
    accentColor: '#F59E0B',
    inputType: 'game-id',
    inputLabel: 'Player ID',
    inputPlaceholder: 'Contoh: 44123456789',
    helperText: 'Buka Profil > Pengaturan > Lihat UID pada bagian info akun.',
    sampleAccount: {
      userId: '44123456789',
      expectedName: 'HOK_ISMAN',
      extraInfo: 'Server Indonesia'
    },
    nominals: [
      { sku: 'HOK-80', label: '80 Tokens', price: 14900 },
      { sku: 'HOK-240', label: '240 Tokens', price: 44500 },
      { sku: 'HOK-400', label: '400 Tokens', price: 73500 },
      { sku: 'HOK-800', label: '800 Tokens', price: 146000 },
      { sku: 'HOK-2400', label: '2.400 Tokens', price: 435000 }
    ]
  },
  {
    id: 'call-of-duty-mobile',
    name: 'Call of Duty: Mobile',
    publisher: 'Garena Indonesia',
    category: 'game-mobile',
    currencyName: 'CP',
    image: IMG_SHOOTER,
    accentColor: '#EAB308',
    inputType: 'game-id',
    inputLabel: 'OpenID',
    inputPlaceholder: 'Contoh: 778899001122',
    helperText: 'Masuk ke Pengaturan > Lainnya > Salin OpenID akun CODM Anda.',
    sampleAccount: {
      userId: '778899001122',
      expectedName: 'GHOST_212',
      extraInfo: 'Garena ID'
    },
    nominals: [
      { sku: 'CODM-62', label: '62 CP', price: 10000 },
      { sku: 'CODM-127', label: '127 CP', price: 19800 },
      { sku: 'CODM-317', label: '317 CP', price: 48500 },
      { sku: 'CODM-634', label: '634 CP', price: 96000 },
      { sku: 'CODM-1373', label: '1.373 CP', price: 194000 }
    ]
  },
  {
    id: 'roblox',
    name: 'Roblox (Robux & Gift Card)',
    publisher: 'Roblox Corporation',
    category: 'game-pc',
    currencyName: 'Robux',
    image: IMG_MOBA,
    accentColor: '#64748B',
    inputType: 'game-id',
    inputLabel: 'Username Roblox',
    inputPlaceholder: 'Contoh: IsmanBlox212',
    helperText: 'Masukkan username akun Roblox Anda (bukan Display Name).',
    sampleAccount: {
      userId: 'IsmanBlox212',
      expectedName: 'IsmanBlox212',
      extraInfo: 'Akun Aktif · Global'
    },
    nominals: [
      { sku: 'RBX-400', label: '400 Robux', price: 74000 },
      { sku: 'RBX-800', label: '800 Robux', price: 145000 },
      { sku: 'RBX-1700', label: '1.700 Robux', price: 295000 },
      { sku: 'RBX-4500', label: '4.500 Robux', price: 735000 }
    ]
  },
  {
    id: 'steam-wallet',
    name: 'Steam Wallet IDR',
    publisher: 'Valve Corporation',
    category: 'game-pc',
    currencyName: 'Voucher IDR',
    image: IMG_HERO,
    accentColor: '#3B82F6',
    inputType: 'game-id',
    inputLabel: 'Steam ID / Email Pengiriman Kode',
    inputPlaceholder: 'Contoh: isman212@steam.id',
    helperText: 'Kode Redeem Steam Wallet IDR langsung dikirim otomatis ke invoice & email Anda.',
    sampleAccount: {
      userId: 'isman_steam212',
      expectedName: 'isman_steam212',
      extraInfo: 'Region Indonesia (IDR)'
    },
    nominals: [
      { sku: 'STM-12', label: 'Steam Wallet Rp 12.000', price: 13800 },
      { sku: 'STM-45', label: 'Steam Wallet Rp 45.000', price: 48500 },
      { sku: 'STM-60', label: 'Steam Wallet Rp 60.000', price: 63900 },
      { sku: 'STM-90', label: 'Steam Wallet Rp 90.000', price: 95500 },
      { sku: 'STM-120', label: 'Steam Wallet Rp 120.000', price: 127000 },
      { sku: 'STM-250', label: 'Steam Wallet Rp 250.000', price: 263000 }
    ]
  },
  {
    id: 'ea-fc-mobile',
    name: 'EA Sports FC Mobile',
    publisher: 'Electronic Arts',
    category: 'game-mobile',
    currencyName: 'FC Points',
    image: IMG_MOBA,
    accentColor: '#10B981',
    inputType: 'game-id',
    inputLabel: 'UID FC Mobile',
    inputPlaceholder: 'Contoh: 901122334455',
    helperText: 'Temukan UID Anda di Pengaturan > Informasi Profil dalam game FC Mobile.',
    sampleAccount: {
      userId: '901122334455',
      expectedName: 'GARUDA_FC212',
      extraInfo: 'OVR 104 · Global'
    },
    nominals: [
      { sku: 'FCM-100', label: '100 FC Points', price: 15500 },
      { sku: 'FCM-520', label: '520 FC Points', price: 76000 },
      { sku: 'FCM-1070', label: '1.070 FC Points', price: 152000 },
      { sku: 'FCM-2200', label: '2.200 FC Points', price: 305000 }
    ]
  },
  {
    id: 'efootball',
    name: 'eFootball Mobile',
    publisher: 'Konami',
    category: 'game-mobile',
    currencyName: 'eFootball Coins',
    image: IMG_MOBA,
    accentColor: '#3B82F6',
    inputType: 'game-id',
    inputLabel: 'User ID (9 Digit)',
    inputPlaceholder: 'Contoh: 678901234',
    helperText: 'Lihat User ID 9 digit di layar awal atau menu Extras > User Information.',
    sampleAccount: {
      userId: '678901234',
      expectedName: 'TIMNAS_212',
      extraInfo: 'Divisi 1'
    },
    nominals: [
      { sku: 'EF-130', label: '130 Coins', price: 18500 },
      { sku: 'EF-550', label: '550 Coins', price: 74000 },
      { sku: 'EF-1040', label: '1.040 Coins', price: 146000 },
      { sku: 'EF-2130', label: '2.130 Coins', price: 292000 }
    ]
  },
  {
    id: 'wild-rift',
    name: 'League of Legends: Wild Rift',
    publisher: 'Riot Games',
    category: 'game-mobile',
    currencyName: 'Wild Cores',
    image: IMG_MOBA,
    accentColor: '#0EA5E9',
    inputType: 'riot-id',
    inputLabel: 'Riot ID & Tagline',
    inputPlaceholder: 'Contoh: RiftKing#SEA',
    helperText: 'Masukkan Riot ID beserta tanda pagar dan Tagline Anda.',
    sampleAccount: {
      userId: 'RiftKing#SEA',
      expectedName: 'RiftKing#SEA',
      extraInfo: 'Server SEA'
    },
    nominals: [
      { sku: 'WR-425', label: '425 Wild Cores', price: 48000 },
      { sku: 'WR-1000', label: '1.000 Wild Cores', price: 109000 },
      { sku: 'WR-1850', label: '1.850 Wild Cores', price: 199000 },
      { sku: 'WR-3275', label: '3.275 Wild Cores', price: 345000 }
    ]
  },
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    publisher: 'Supercell',
    category: 'game-mobile',
    currencyName: 'Gems & Gold Pass',
    image: IMG_MOBA,
    accentColor: '#F59E0B',
    inputType: 'game-id',
    inputLabel: 'Player Tag (diawali #)',
    inputPlaceholder: 'Contoh: #9Q2PL8V2',
    helperText: 'Buka profil Village Anda di pojok kiri atas, salin Player Tag berawalan #.',
    sampleAccount: {
      userId: '#9Q2PL8V2',
      expectedName: 'KING_CLAN212',
      extraInfo: 'Town Hall 16'
    },
    nominals: [
      { sku: 'COC-PASS', label: 'Gold Pass Season', price: 99000 },
      { sku: 'COC-500', label: '500 Gems', price: 74000 },
      { sku: 'COC-1200', label: '1.200 Gems', price: 149000 },
      { sku: 'COC-2500', label: '2.500 Gems', price: 299000 }
    ]
  },
  {
    id: 'arena-of-valor',
    name: 'Arena of Valor (AOV)',
    publisher: 'Garena',
    category: 'game-mobile',
    currencyName: 'Vouchers',
    image: IMG_MOBA,
    accentColor: '#6366F1',
    inputType: 'game-id',
    inputLabel: 'Player ID',
    inputPlaceholder: 'Contoh: 31122334455',
    helperText: 'Buka Pengaturan > Umum > Salin Player ID akun AOV Anda.',
    sampleAccount: {
      userId: '31122334455',
      expectedName: 'AOV_STRIKER',
      extraInfo: 'Server Baratayuda'
    },
    nominals: [
      { sku: 'AOV-40', label: '40 Vouchers', price: 9800 },
      { sku: 'AOV-90', label: '90 Vouchers', price: 19500 },
      { sku: 'AOV-230', label: '230 Vouchers', price: 48500 },
      { sku: 'AOV-470', label: '470 Vouchers', price: 97000 }
    ]
  },
  {
    id: 'point-blank',
    name: 'Point Blank Beyond Limits',
    publisher: 'Zepetto Indonesia',
    category: 'game-pc',
    currencyName: 'PB Cash',
    image: IMG_SHOOTER,
    accentColor: '#EF4444',
    inputType: 'game-id',
    inputLabel: 'User ID Zepetto',
    inputPlaceholder: 'Contoh: trooper212',
    helperText: 'Masukkan ID login Zepetto Point Blank Anda dengan benar.',
    sampleAccount: {
      userId: 'trooper212',
      expectedName: 'Trooper_212',
      extraInfo: 'Major Grade 3'
    },
    nominals: [
      { sku: 'PB-1200', label: '1.200 PB Cash', price: 10500 },
      { sku: 'PB-2400', label: '2.400 PB Cash', price: 20500 },
      { sku: 'PB-6000', label: '6.000 PB Cash', price: 50500 },
      { sku: 'PB-12000', label: '12.000 PB Cash', price: 100000 }
    ]
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    publisher: 'Supercell',
    category: 'game-mobile',
    currencyName: 'Gems & Brawl Pass',
    image: IMG_MOBA,
    accentColor: '#F59E0B',
    inputType: 'game-id',
    inputLabel: 'Player Tag',
    inputPlaceholder: 'Contoh: #2YV8PQ90',
    helperText: 'Salin Player Tag berawalan # dari halaman profil Brawler Anda.',
    sampleAccount: {
      userId: '#2YV8PQ90',
      expectedName: 'BRAWLER_212',
      extraInfo: '38.400 Trophies'
    },
    nominals: [
      { sku: 'BS-80', label: '80 Gems', price: 74000 },
      { sku: 'BS-PASS', label: 'Brawl Pass Plus', price: 145000 },
      { sku: 'BS-170', label: '170 Gems', price: 149000 },
      { sku: 'BS-360', label: '360 Gems', price: 299000 }
    ]
  },
  {
    id: 'ragnarok-origin',
    name: 'Ragnarok Origin Global',
    publisher: 'Gravity Game Hub',
    category: 'game-mobile',
    currencyName: 'Nyan Berry',
    image: IMG_MOBA,
    accentColor: '#F59E0B',
    inputType: 'game-id-server',
    inputLabel: 'Character ID',
    inputPlaceholder: 'Contoh: 100239485',
    zoneLabel: 'Server',
    serverOptions: ['Prontera-1', 'Geffen-2', 'Payon-3', 'Morroc-4'],
    helperText: 'Pilih server karakter dan masukkan Character ID Ragnarok Origin.',
    sampleAccount: {
      userId: '100239485',
      zoneOrServer: 'Prontera-1',
      expectedName: 'LordKnight212',
      extraInfo: 'Prontera-1 · Lv. 95'
    },
    nominals: [
      { sku: 'ROO-40', label: '40 Nyan Berry', price: 15000 },
      { sku: 'ROO-205', label: '205 Nyan Berry', price: 74000 },
      { sku: 'ROO-415', label: '415 Nyan Berry', price: 148000 },
      { sku: 'ROO-1050', label: '1.050 Nyan Berry', price: 369000 }
    ]
  },
  {
    id: 'undawn',
    name: 'Garena Undawn',
    publisher: 'Garena / Lightspeed',
    category: 'game-mobile',
    currencyName: 'RC',
    image: IMG_SHOOTER,
    accentColor: '#10B981',
    inputType: 'game-id',
    inputLabel: 'Player ID',
    inputPlaceholder: 'Contoh: 5544332211',
    helperText: 'Salin Player ID dari menu Profil Survivor.',
    sampleAccount: {
      userId: '5544332211',
      expectedName: 'SURVIVOR_212',
      extraInfo: 'Server Raven'
    },
    nominals: [
      { sku: 'UD-80', label: '80 RC', price: 14500 },
      { sku: 'UD-400', label: '400 RC', price: 71500 },
      { sku: 'UD-800', label: '800 RC', price: 142000 },
      { sku: 'UD-2000', label: '2.000 RC', price: 355000 }
    ]
  },
  {
    id: 'stumble-guys',
    name: 'Stumble Guys',
    publisher: 'Scopely',
    category: 'game-mobile',
    currencyName: 'Gems',
    image: IMG_MOBA,
    accentColor: '#38BDF8',
    inputType: 'game-id',
    inputLabel: 'Username Stumble',
    inputPlaceholder: 'Contoh: IsmanStumble',
    helperText: 'Pastikan penulisan huruf besar & kecil Username sesuai di dalam game.',
    sampleAccount: {
      userId: 'IsmanStumble',
      expectedName: 'IsmanStumble',
      extraInfo: '420 Crowns'
    },
    nominals: [
      { sku: 'SG-250', label: '250 Gems', price: 15500 },
      { sku: 'SG-800', label: '800 Gems', price: 46000 },
      { sku: 'SG-1600', label: '1.600 Gems', price: 89000 },
      { sku: 'SG-5000', label: '5.000 Gems', price: 265000 }
    ]
  },
  {
    id: 'sausage-man',
    name: 'Sausage Man',
    publisher: 'XD Entertainment',
    category: 'game-mobile',
    currencyName: 'Candies',
    image: IMG_SHOOTER,
    accentColor: '#F59E0B',
    inputType: 'game-id',
    inputLabel: 'Character ID',
    inputPlaceholder: 'Contoh: 98765432',
    helperText: 'Salin Character ID dari menu profil di pojok kiri atas lobby.',
    sampleAccount: {
      userId: '98765432',
      expectedName: 'SausagePro212',
      extraInfo: 'SEA Server'
    },
    nominals: [
      { sku: 'SM-60', label: '60 Candies', price: 14200 },
      { sku: 'SM-180', label: '180 Candies', price: 41500 },
      { sku: 'SM-316', label: '316 Candies', price: 71000 },
      { sku: 'SM-718', label: '718 Candies', price: 142000 }
    ]
  }
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'qris-auto',
    name: 'QRIS Otomatis (All E-Wallet & Bank)',
    group: 'QRIS',
    code: 'QRIS',
    feeFlat: 0,
    feePercent: 0.7,
    autoVerify: true,
    description: 'Scan via GoPay, DANA, OVO, ShopeePay, BCA, Mandiri, BRI — cek lunas instan.'
  },
  {
    id: 'va-bca',
    name: 'BCA Virtual Account',
    group: 'Virtual Account',
    code: 'BCAVA',
    feeFlat: 3500,
    feePercent: 0,
    autoVerify: true,
    description: 'Transfer via m-BCA / KlikBCA dengan nomor VA unik otomatis.'
  },
  {
    id: 'va-mandiri',
    name: 'Mandiri Virtual Account',
    group: 'Virtual Account',
    code: 'MANDIRIVA',
    feeFlat: 3500,
    feePercent: 0,
    autoVerify: true,
    description: 'Pembayaran otomatis via Livin’ by Mandiri.'
  },
  {
    id: 'va-bri',
    name: 'BRI Virtual Account (BRIVA)',
    group: 'Virtual Account',
    code: 'BRIVA',
    feeFlat: 3000,
    feePercent: 0,
    autoVerify: true,
    description: 'Pembayaran otomatis via BRImo & ATM BRI.'
  },
  {
    id: 'ewallet-dana',
    name: 'DANA Instant',
    group: 'E-Wallet',
    code: 'DANA',
    feeFlat: 0,
    feePercent: 1.5,
    autoVerify: true,
    description: 'Bayar langsung dari saldo DANA dengan konfirmasi otomatis.'
  },
  {
    id: 'ewallet-gopay',
    name: 'GoPay Instant',
    group: 'E-Wallet',
    code: 'GOPAY',
    feeFlat: 0,
    feePercent: 1.8,
    autoVerify: true,
    description: 'Checkout otomatis terhubung dengan aplikasi Gojek / GoPay.'
  },
  {
    id: 'ewallet-ovo',
    name: 'OVO Push-to-Pay',
    group: 'E-Wallet',
    code: 'OVO',
    feeFlat: 0,
    feePercent: 1.8,
    autoVerify: true,
    description: 'Notifikasi pembayaran langsung muncul di aplikasi OVO Anda.'
  }
];

export function detectIndonesianOperator(phone: string): {
  operator: string;
  region: string;
  valid: boolean;
} {
  const cleaned = phone.replace(/[^0-9]/g, '');
  let normalized = cleaned;
  if (normalized.startsWith('62')) {
    normalized = '0' + normalized.slice(2);
  }
  if (normalized.length < 10 || normalized.length > 13 || !normalized.startsWith('08')) {
    return { operator: 'Nomor tidak valid', region: '-', valid: false };
  }
  const prefix4 = normalized.slice(0, 4);
  if (['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'].includes(prefix4)) {
    return { operator: 'TELKOMSEL PRABAYAR', region: 'Nasional · 4G/5G Ready', valid: true };
  }
  if (prefix4 === '0851') {
    return { operator: 'BY.U / TELKOMSEL DIGITAL', region: 'Nasional · 4G/5G Ready', valid: true };
  }
  if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix4)) {
    return { operator: 'INDOSAT OOREDOO IM3', region: 'Nasional · Jaringan Aktif', valid: true };
  }
  if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(prefix4)) {
    return { operator: 'XL AXIATA', region: 'Nasional · Jaringan Aktif', valid: true };
  }
  if (['0831', '0832', '0833', '0838'].includes(prefix4)) {
    return { operator: 'AXIS', region: 'Nasional · Jaringan Aktif', valid: true };
  }
  if (['0895', '0896', '0897', '0898', '0899'].includes(prefix4)) {
    return { operator: 'TRI (3) INDONESIA', region: 'Nasional · Jaringan Aktif', valid: true };
  }
  if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix4)) {
    return { operator: 'SMARTFREN 4G', region: 'Nasional · Jaringan Aktif', valid: true };
  }
  return { operator: 'OPERATOR SELULER INDONESIA', region: 'Nasional · Aktif', valid: true };
}
