export interface CommerceSaleItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
  sellingPrice?: number;
}

export interface CommerceSaleCustomer {
  id?: string;
  type: 'walk-in' | 'account';
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CommerceSale {
  transactionId: string;
  timestamp: string;
  total: number;
  subtotal?: number;
  tax?: number;
  paymentMethod?: string;
  amountReceived?: number;
  change?: number;
  paymentDetails?: string;
  items: CommerceSaleItem[];
  salesPerson?: {
    name?: string;
    email?: string;
    userType?: string;
    companyName?: string | null;
  } | null;
  customer?: CommerceSaleCustomer | null;
}

export interface CommerceProduct {
  id: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  description: string;
  costProduction: number;
  costPackaging: number;
  costDelivery: number;
  suggestedPrice: number;
  sellingPrice: number;
  profitMargin: number;
  status: 'ACTIVE' | 'INACTIVE';
  sku?: string;
  stock?: number;
  createdAt: string;
  category?: string;
  posEnabled?: boolean;
}

export interface PosCatalogSnapshot {
  products: CommerceProduct[];
  usingDemoData: boolean;
}

export interface StorageInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  paidAt?: string;
  notes?: string;
  sourceSaleId?: string;
}

export type PosLedgerEntryType = 'revenue' | 'tax' | 'cogs' | 'inventory';

export interface PosLedgerEntry {
  id: string;
  saleId: string;
  entryType: PosLedgerEntryType;
  account: string;
  amount: number;
  timestamp: string;
  memo?: string;
}

export interface PosInventoryMovement {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  delta: number;
  resultingStock: number | null;
  timestamp: string;
  type: 'sale';
}

export interface PosSyncStatus {
  lastSaleId?: string;
  lastSaleAt?: string;
  pendingInvoices: number;
  hasInvoiceVariance: boolean;
  hasInventoryVariance: boolean;
  ledgerEntriesForLastSale: number;
  inventoryMovementsRecorded: number;
  warnings: string[];
  statusUpdatedAt: string;
}

const POS_LEDGER_STORAGE_KEY = 'posLedgerEntries';
const POS_INVENTORY_STORAGE_KEY = 'posInventoryMovements';
const POS_SYNC_STATUS_KEY = 'posSyncStatus';
const POS_VAT_RATE = 0.15;
const DEFAULT_SYNC_STATUS: PosSyncStatus = {
  pendingInvoices: 0,
  hasInvoiceVariance: false,
  hasInventoryVariance: false,
  ledgerEntriesForLastSale: 0,
  inventoryMovementsRecorded: 0,
  warnings: [],
  statusUpdatedAt: '1970-01-01T00:00:00.000Z',
};

const BASE_DEMO_PRODUCTS: Omit<CommerceProduct, 'createdAt'>[] = [
  {
    id: 'demo-pos-1',
    name: 'Premium Service Package',
    type: 'SERVICE',
    description: 'Complete premium service package',
    costProduction: 500,
    costPackaging: 0,
    costDelivery: 0,
    suggestedPrice: 1500,
    sellingPrice: 1500,
    profitMargin: 66.67,
    status: 'ACTIVE',
    category: 'Services',
    posEnabled: true,
  },
  {
    id: 'demo-pos-2',
    name: 'Standard Product',
    type: 'PRODUCT',
    description: 'High-quality standard product',
    costProduction: 200,
    costPackaging: 20,
    costDelivery: 30,
    suggestedPrice: 500,
    sellingPrice: 500,
    profitMargin: 50,
    status: 'ACTIVE',
    sku: 'PROD-001',
    stock: 50,
    category: 'Products',
    posEnabled: true,
  },
  {
    id: 'demo-pos-3',
    name: 'Consultation Session',
    type: 'SERVICE',
    description: '1-hour expert consultation',
    costProduction: 0,
    costPackaging: 0,
    costDelivery: 0,
    suggestedPrice: 800,
    sellingPrice: 800,
    profitMargin: 100,
    status: 'ACTIVE',
    category: 'Services',
    posEnabled: true,
  },
  {
    id: 'demo-pos-4',
    name: 'Deluxe Package',
    type: 'PRODUCT',
    description: 'Complete deluxe package with extras',
    costProduction: 400,
    costPackaging: 50,
    costDelivery: 50,
    suggestedPrice: 1200,
    sellingPrice: 1200,
    profitMargin: 58.33,
    status: 'ACTIVE',
    sku: 'PROD-002',
    stock: 25,
    category: 'Products',
    posEnabled: true,
  },
  {
    id: 'demo-pos-5',
    name: 'Signature Retail Starter Kit',
    type: 'PRODUCT',
    description: 'Display-ready bundle with signage, samples, and packaging for quick POS demos.',
    costProduction: 350,
    costPackaging: 40,
    costDelivery: 60,
    suggestedPrice: 950,
    sellingPrice: 950,
    profitMargin: 52.63,
    status: 'ACTIVE',
    sku: 'KIT-STARTER',
    stock: 40,
    category: 'Starter Kits',
    posEnabled: true,
  },
];

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeObject<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function buildDemoProducts(): CommerceProduct[] {
  const timestamp = new Date().toISOString();
  return BASE_DEMO_PRODUCTS.map((product, index) => ({
    ...product,
    createdAt: timestamp,
    id: product.id || `demo-pos-${index + 1}`,
  }));
}

export function getDemoProductsCatalog(): CommerceProduct[] {
  return buildDemoProducts();
}

function getStoredProducts(): CommerceProduct[] {
  return readArray<CommerceProduct>('productsList');
}

function persistProducts(products: CommerceProduct[]): void {
  writeArray('productsList', products);
}

export function getPosCatalogSnapshot(): PosCatalogSnapshot {
  if (typeof window === 'undefined') {
    return { products: [], usingDemoData: false };
  }

  let catalog = getStoredProducts();
  let usingDemoData = false;

  if (catalog.length === 0) {
    catalog = buildDemoProducts();
    persistProducts(catalog);
    usingDemoData = true;
  }

  const activePosProducts = catalog.filter(
    (product) => product.status === 'ACTIVE' && product.posEnabled !== false
  );

  if (activePosProducts.length > 0) {
    return { products: activePosProducts, usingDemoData };
  }

  return { products: buildDemoProducts(), usingDemoData: true };
}

export function recordPosSale(
  sale: Omit<CommerceSale, 'transactionId' | 'timestamp'> & {
    transactionId?: string;
    timestamp?: string;
  }
): CommerceSale {
  const saleWithMeta: CommerceSale = {
    ...sale,
    transactionId: sale.transactionId || `SALE-${Date.now()}`,
    timestamp: sale.timestamp || new Date().toISOString(),
  };

  return persistPosSale(saleWithMeta);
}

function normalizeCustomer(rawSale: any): CommerceSaleCustomer | null {
  const baseCustomer = rawSale?.customer && typeof rawSale.customer === 'object' ? rawSale.customer : null;
  const inferredType = baseCustomer?.type || rawSale?.customerType;
  const hasExplicitDetails = Boolean(
    baseCustomer ||
    rawSale?.customerName ||
    rawSale?.clientName ||
    rawSale?.customerEmail ||
    rawSale?.clientEmail ||
    rawSale?.customerPhone ||
    rawSale?.customerNotes
  );

  const type: 'walk-in' | 'account' = inferredType === 'account' || rawSale?.walkIn === false
    ? 'account'
    : 'walk-in';

  const name = baseCustomer?.name || baseCustomer?.customerName || rawSale?.customerName || rawSale?.clientName;
  const email = baseCustomer?.email || baseCustomer?.customerEmail || rawSale?.customerEmail || rawSale?.clientEmail;
  const phone = baseCustomer?.phone || baseCustomer?.customerPhone || rawSale?.customerPhone;
  const notes = baseCustomer?.notes || baseCustomer?.customerNotes || rawSale?.customerNotes;

  if (!hasExplicitDetails && type === 'walk-in' && rawSale?.walkIn !== false) {
    return {
      type: 'walk-in',
      name: 'Walk-in Customer',
      email: 'walkin@customer.local',
    };
  }

  if (!name && !email && !phone && !notes) {
    return null;
  }

  return {
    id: baseCustomer?.id,
    type,
    name: name || (type === 'walk-in' ? 'Walk-in Customer' : undefined),
    email: email || (type === 'walk-in' ? 'walkin@customer.local' : undefined),
    phone,
    notes,
  };
}

function normalizeSale(rawSale: any): CommerceSale {
  const items = Array.isArray(rawSale?.items)
    ? rawSale.items.map((item: any) => ({
        id: item.id,
        name: item.name || item.description || 'Item',
        quantity: Number(item.quantity || 1),
        price: Number(item.price ?? item.sellingPrice ?? 0),
        sellingPrice: Number(item.sellingPrice ?? item.price ?? 0),
      }))
    : [];

  const fallbackTotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.sellingPrice ?? item.price ?? 0),
    0
  );

  const id = rawSale?.transactionId || rawSale?.orderId || rawSale?.id || `SALE-${Date.now()}`;

  return {
    transactionId: String(id),
    timestamp: rawSale?.timestamp || rawSale?.createdAt || new Date().toISOString(),
    subtotal: Number(rawSale?.subtotal || fallbackTotal),
    tax: Number(rawSale?.tax || 0),
    total: Number(rawSale?.total || fallbackTotal),
    paymentMethod: rawSale?.paymentMethod || 'cash',
    amountReceived: Number(rawSale?.amountReceived || rawSale?.amountPaid || rawSale?.total || fallbackTotal),
    change: Number(rawSale?.change || 0),
    paymentDetails: rawSale?.paymentDetails,
    items,
    salesPerson: rawSale?.salesPerson || null,
    customer: normalizeCustomer(rawSale),
  };
}

export function getSalesHistory(): CommerceSale[] {
  const sales = readArray<any>('salesHistory').map(normalizeSale);
  return sales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addSaleToHistory(rawSale: any): CommerceSale {
  return persistPosSale(rawSale);
}

export function syncFinanceInvoicesFromSales(
  salesOverride?: CommerceSale[],
  existingInvoicesOverride?: StorageInvoice[]
): StorageInvoice[] {
  const existingInvoices = existingInvoicesOverride ?? readArray<StorageInvoice>('financeInvoices');
  const sourceSales = salesOverride ?? getSalesHistory();
  const orderedSales = [...sourceSales].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const salesMap = new Map(orderedSales.map((sale) => [sale.transactionId, sale]));

  const nonPosInvoices = existingInvoices.filter((invoice) => {
    if (!invoice.sourceSaleId) return true;
    return !salesMap.has(invoice.sourceSaleId);
  });

  const posInvoices = orderedSales.map((sale, index) => {
    const isoDate = new Date(sale.timestamp).toISOString();
    const existing = existingInvoices.find((inv) => inv.sourceSaleId === sale.transactionId);
    const customer = sale.customer;
    const isWalkInCustomer = !customer || customer.type === 'walk-in';
    const fallbackWalkInName = isWalkInCustomer ? 'Walk-in Customer' : undefined;
    const fallbackWalkInEmail = isWalkInCustomer ? 'walkin@customer.local' : undefined;

    const clientName = existing?.clientName || customer?.name || fallbackWalkInName || sale.salesPerson?.companyName || sale.salesPerson?.name || 'Walk-in Customer';
    const clientEmail = existing?.clientEmail || customer?.email || fallbackWalkInEmail || sale.salesPerson?.email || 'walkin@customer.local';

    const items = (sale.items || []).map((item) => ({
      description: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.sellingPrice ?? item.price ?? 0),
    }));

    const generatedNotesParts = [
      customer?.notes,
      customer?.phone ? `Phone: ${customer.phone}` : undefined,
      isWalkInCustomer ? 'Walk-in POS sale.' : undefined,
      `Auto-generated from POS sale ${sale.transactionId}`,
    ].filter(Boolean);
    const generatedNotes = generatedNotesParts.join(' ');

    return {
      id: existing?.id || `pos-${sale.transactionId}`,
      invoiceNumber: existing?.invoiceNumber || `INV-POS-${String(index + 1).padStart(4, '0')}`,
      clientName,
      clientEmail,
      amount: Number(sale.total || 0),
      dueDate: existing?.dueDate || isoDate,
      status: 'paid' as const,
      items,
      createdAt: existing?.createdAt || isoDate,
      paidAt: sale.timestamp,
      notes: existing?.notes || generatedNotes || `Auto-generated from POS sale ${sale.transactionId}`,
      sourceSaleId: sale.transactionId,
    };
  });

  const merged = [...nonPosInvoices, ...posInvoices];
  writeArray('financeInvoices', merged);
  return merged;
}

export function getFinanceInvoices(): StorageInvoice[] {
  return syncFinanceInvoicesFromSales();
}

export function getPosLedgerEntries(): PosLedgerEntry[] {
  return readArray<PosLedgerEntry>(POS_LEDGER_STORAGE_KEY);
}

export function getPosInventoryMovements(): PosInventoryMovement[] {
  return readArray<PosInventoryMovement>(POS_INVENTORY_STORAGE_KEY);
}

export function getPosSyncStatus(): PosSyncStatus {
  return readObject<PosSyncStatus>(POS_SYNC_STATUS_KEY, DEFAULT_SYNC_STATUS);
}

export function addFinanceInvoice(
  payload: Omit<StorageInvoice, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): StorageInvoice {
  const existingInvoices = syncFinanceInvoicesFromSales();

  const created: StorageInvoice = {
    ...payload,
    id: payload.id || `manual-${Date.now()}`,
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  const updated = [...existingInvoices, created];
  writeArray('financeInvoices', updated);
  return created;
}

export function markFinanceInvoicePaid(invoiceId: string): StorageInvoice[] {
  const existingInvoices = syncFinanceInvoicesFromSales();
  const updated = existingInvoices.map((invoice) =>
    invoice.id === invoiceId
      ? {
          ...invoice,
          status: 'paid' as const,
          paidAt: new Date().toISOString(),
        }
      : invoice
  );
  writeArray('financeInvoices', updated);
  return updated;
}

function persistPosSale(rawSale: any): CommerceSale {
  ensureBrowserEnvironment();

  const normalized = normalizeSale(rawSale);
  const catalog = getStoredProducts();
  const productMap = new Map(catalog.map((product) => [product.id, product]));
  const items = sanitizeSaleItems(normalized.items, productMap);
  const totals = computeSaleTotals(items);
  const payment = ensurePaymentCoverage(normalized.paymentMethod, normalized.amountReceived, totals.total);

  const saleRecord: CommerceSale = {
    ...normalized,
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    amountReceived: payment.amountReceived,
    change: payment.change,
  };

  const existingSales = readArray<any>('salesHistory').map(normalizeSale);
  const filteredSales = existingSales.filter((sale) => sale.transactionId !== saleRecord.transactionId);
  const updatedSales = [...filteredSales, saleRecord];

  const inventoryResult = applyInventoryAdjustments(saleRecord, catalog);
  const existingLedger = readArray<PosLedgerEntry>(POS_LEDGER_STORAGE_KEY).filter(
    (entry) => entry.saleId !== saleRecord.transactionId
  );
  const ledgerEntries = buildLedgerEntries(saleRecord, productMap);
  const updatedLedger = [...existingLedger, ...ledgerEntries];

  const existingMovements = readArray<PosInventoryMovement>(POS_INVENTORY_STORAGE_KEY).filter(
    (movement) => movement.saleId !== saleRecord.transactionId
  );
  const updatedMovements = [...existingMovements, ...inventoryResult.movements];

  const existingInvoices = readArray<StorageInvoice>('financeInvoices');
  const updatedInvoices = syncFinanceInvoicesFromSales(updatedSales, existingInvoices);

  if (inventoryResult.didMutate) {
    persistProducts(inventoryResult.productsSnapshot);
  }

  writeArray('salesHistory', updatedSales);
  writeArray(POS_LEDGER_STORAGE_KEY, updatedLedger);
  writeArray(POS_INVENTORY_STORAGE_KEY, updatedMovements);
  writeArray('financeInvoices', updatedInvoices);

  const syncStatus = buildSyncStatus({
    sale: saleRecord,
    invoices: updatedInvoices,
    ledgerEntries,
    inventoryMovements: inventoryResult.movements,
    warnings: inventoryResult.warnings,
    totalSalesCount: updatedSales.length,
  });
  writeObject(POS_SYNC_STATUS_KEY, syncStatus);

  return saleRecord;
}

function ensureBrowserEnvironment(): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    throw new Error('POS transactions can only be recorded from the browser runtime.');
  }
}

function sanitizeSaleItems(
  items: CommerceSaleItem[],
  productMap: Map<string, CommerceProduct>
): CommerceSaleItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('POS sale requires at least one line item.');
  }

  return items.map((item, index) => {
    const product = item.id ? productMap.get(item.id) : undefined;
    const baseName = item.name || product?.name || `Item ${index + 1}`;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const derivedPrice = Number(
      item.sellingPrice ?? item.price ?? product?.sellingPrice ?? product?.suggestedPrice ?? 0
    );
    const sellingPrice = Number.isFinite(derivedPrice) && derivedPrice >= 0 ? derivedPrice : 0;
    const fallbackPrice = Number(
      item.price ?? product?.sellingPrice ?? product?.suggestedPrice ?? sellingPrice
    );

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      throw new Error(`Invalid price detected for ${baseName}.`);
    }

    return {
      ...item,
      id: item.id || product?.id,
      name: baseName,
      quantity,
      price: Number.isFinite(fallbackPrice) ? fallbackPrice : sellingPrice,
      sellingPrice,
    };
  });
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computeSaleTotals(items: CommerceSaleItem[], taxRate = POS_VAT_RATE): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + (item.sellingPrice ?? 0) * item.quantity, 0)
  );
  const tax = roundCurrency(subtotal * taxRate);
  const total = roundCurrency(subtotal + tax);
  return { subtotal, tax, total };
}

function ensurePaymentCoverage(
  paymentMethod: CommerceSale['paymentMethod'],
  providedAmount: CommerceSale['amountReceived'],
  requestedTotal: number
): { amountReceived: number; change: number } {
  const normalizedMethod = paymentMethod || 'cash';
  const total = roundCurrency(requestedTotal);
  const fallbackAmount = typeof providedAmount === 'number' && !Number.isNaN(providedAmount)
    ? providedAmount
    : total;

  if (normalizedMethod === 'cash' && fallbackAmount < total) {
    throw new Error(`Cash payment is short by R ${(total - fallbackAmount).toFixed(2)}.`);
  }

  const amountReceived = normalizedMethod === 'cash' ? fallbackAmount : total;
  const change = normalizedMethod === 'cash' ? roundCurrency(amountReceived - total) : 0;

  return {
    amountReceived: roundCurrency(amountReceived),
    change,
  };
}

function applyInventoryAdjustments(
  sale: CommerceSale,
  products: CommerceProduct[]
): {
  productsSnapshot: CommerceProduct[];
  movements: PosInventoryMovement[];
  warnings: string[];
  didMutate: boolean;
} {
  const productsSnapshot = products.map((product) => ({ ...product }));
  const indexById = new Map(products.map((product, index) => [product.id, index]));
  const movements: PosInventoryMovement[] = [];
  const warnings: string[] = [];
  let didMutate = false;

  sale.items.forEach((item) => {
    if (!item.id) {
      warnings.push(`Item "${item.name}" does not reference a catalog product.`);
      return;
    }

    const productIndex = indexById.get(item.id);
    if (productIndex === undefined) {
      warnings.push(`Product ${item.id} was not found when closing sale ${sale.transactionId}.`);
      return;
    }

    const product = productsSnapshot[productIndex];
    if (typeof product.stock !== 'number') {
      warnings.push(`Product "${product.name}" is missing stock tracking.`);
      return;
    }

    const projectedStock = product.stock - item.quantity;
    if (projectedStock < 0) {
      throw new Error(
        `Not enough stock for ${product.name}. Available ${product.stock}, requested ${item.quantity}.`
      );
    }

    productsSnapshot[productIndex] = {
      ...product,
      stock: projectedStock,
    };
    didMutate = true;

    movements.push({
      id: `${sale.transactionId}-${product.id}`,
      saleId: sale.transactionId,
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      delta: -item.quantity,
      resultingStock: projectedStock,
      timestamp: sale.timestamp,
      type: 'sale',
    });
  });

  return { productsSnapshot, movements, warnings, didMutate };
}

function buildLedgerEntries(
  sale: CommerceSale,
  productMap: Map<string, CommerceProduct>
): PosLedgerEntry[] {
  const entries: PosLedgerEntry[] = [];
  const timestamp = sale.timestamp || new Date().toISOString();
  const subtotal = roundCurrency(sale.subtotal ?? sale.total ?? 0);
  const tax = roundCurrency(sale.tax ?? 0);

  if (subtotal > 0) {
    entries.push({
      id: `${sale.transactionId}-revenue`,
      saleId: sale.transactionId,
      entryType: 'revenue',
      account: 'Sales Revenue',
      amount: subtotal,
      timestamp,
      memo: `${sale.items.length} item(s)`,
    });
  }

  if (tax > 0) {
    entries.push({
      id: `${sale.transactionId}-tax`,
      saleId: sale.transactionId,
      entryType: 'tax',
      account: 'VAT Payable',
      amount: tax,
      timestamp,
      memo: 'VAT 15%',
    });
  }

  const cogs = roundCurrency(
    sale.items.reduce((sum, item) => {
      const product = item.id ? productMap.get(item.id) : undefined;
      const unitCost =
        (product?.costProduction ?? 0) +
        (product?.costPackaging ?? 0) +
        (product?.costDelivery ?? 0);
      return sum + unitCost * item.quantity;
    }, 0)
  );

  if (cogs > 0) {
    entries.push({
      id: `${sale.transactionId}-cogs`,
      saleId: sale.transactionId,
      entryType: 'cogs',
      account: 'Cost of Goods Sold',
      amount: cogs,
      timestamp,
      memo: 'COGS auto-posted',
    });
    entries.push({
      id: `${sale.transactionId}-inventory`,
      saleId: sale.transactionId,
      entryType: 'inventory',
      account: 'Inventory',
      amount: cogs,
      timestamp,
      memo: 'Inventory credit',
    });
  }

  return entries;
}

function buildSyncStatus(params: {
  sale: CommerceSale;
  invoices: StorageInvoice[];
  ledgerEntries: PosLedgerEntry[];
  inventoryMovements: PosInventoryMovement[];
  warnings: string[];
  totalSalesCount: number;
}): PosSyncStatus {
  const invoiceCount = params.invoices.filter((invoice) => Boolean(invoice.sourceSaleId)).length;
  const pendingInvoices = Math.max(0, params.totalSalesCount - invoiceCount);
  const warningMessages = params.warnings?.filter(Boolean) ?? [];

  return {
    lastSaleId: params.sale.transactionId,
    lastSaleAt: params.sale.timestamp,
    pendingInvoices,
    hasInvoiceVariance: pendingInvoices > 0,
    hasInventoryVariance: warningMessages.length > 0,
    ledgerEntriesForLastSale: params.ledgerEntries.length,
    inventoryMovementsRecorded: params.inventoryMovements.length,
    warnings: warningMessages,
    statusUpdatedAt: new Date().toISOString(),
  };
}
