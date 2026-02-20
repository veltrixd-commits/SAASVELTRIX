// Point of Sale System - On-the-spot sales
'use client';

import { useState, useEffect, useCallback, useMemo, useDeferredValue, useRef } from 'react';
import { ShoppingCart, Search, CreditCard, Banknote, Smartphone, Printer, X, Plus, Minus, Trash2, DollarSign, Receipt, Clock, Zap, Wallet, QrCode, Lock, Package } from 'lucide-react';
import { getCurrentUserPermissions, getCurrentUserType } from '@/lib/accessControl';
import { getPosCatalogSnapshot, getSalesHistory, recordPosSale, getPosSyncStatus } from '@/lib/commerceData';
import type { CommerceProduct, CommerceSale, PosSyncStatus } from '@/lib/commerceData';

const POS_STOREFRONT_STORAGE_KEY = 'posStorefrontMode';
const POS_STOREFRONT_EVENT = 'pos-storefront-mode-change';

type Product = CommerceProduct;

interface CartItem extends Product {
  quantity: number;
}

interface PosBannerMessage {
  id: number;
  type: 'success' | 'error' | 'warning';
  text: string;
}

const MAX_RENDERED_PRODUCTS = 60;
const VAT_RATE = 0.15;

export default function POSPage() {
  const [activeTab, setActiveTab] = useState<'sale' | 'history'>('sale');
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<CommerceSale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'electronic' | 'mobile'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<CommerceSale | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [mobileNumber, setMobileNumber] = useState('');
  const [electronicRef, setElectronicRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [userType, setUserType] = useState<string>('');
  const [usingDemoProducts, setUsingDemoProducts] = useState(false);
  const [storefrontMode, setStorefrontMode] = useState(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [posAccessOverride, setPosAccessOverride] = useState(false);
  const [customerMode, setCustomerMode] = useState<'walk-in' | 'account'>('walk-in');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [posBanner, setPosBanner] = useState<PosBannerMessage | null>(null);
  const [syncStatus, setSyncStatus] = useState<PosSyncStatus | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isHistoryRefreshing, setIsHistoryRefreshing] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredCatalogSearch = useDeferredValue(catalogSearch);

  const announceBanner = useCallback((type: PosBannerMessage['type'], text: string) => {
    setPosBanner({ id: Date.now(), type, text });
  }, []);

  useEffect(() => {
    if (!posBanner) return;
    const timeout = window.setTimeout(() => setPosBanner(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [posBanner]);

  const refreshSyncStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    setSyncStatus(getPosSyncStatus());
  }, []);

  const refreshSalesHistory = useCallback(() => {
    setIsHistoryRefreshing(true);
    try {
      setSalesHistory(getSalesHistory());
    } finally {
      setIsHistoryRefreshing(false);
    }
  }, []);

  // Check POS access permission
  useEffect(() => {
    const permissions = getCurrentUserPermissions();
    const currentUserType = getCurrentUserType();
    setUserType(currentUserType);
    const staffLikeUser = currentUserType === 'employee' || currentUserType === 'business' || currentUserType === 'creator';
    const canOverride = staffLikeUser;
    const allowed = permissions.canAccessPOS || canOverride;
    setHasAccess(allowed);
    setPosAccessOverride(!permissions.canAccessPOS && allowed && canOverride);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readStorefrontState = () => {
      const stored = localStorage.getItem(POS_STOREFRONT_STORAGE_KEY);
      setStorefrontMode(stored === 'true');
    };

    readStorefrontState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === POS_STOREFRONT_STORAGE_KEY) {
        setStorefrontMode(event.newValue === 'true');
      }
    };

    const handleCustomEvent = (event: Event) => {
      const enabled = Boolean((event as CustomEvent<boolean>).detail);
      setStorefrontMode(enabled);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(POS_STOREFRONT_EVENT, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(POS_STOREFRONT_EVENT, handleCustomEvent as EventListener);
    };
  }, []);

  const loadProductsFromCatalog = useCallback(() => {
    const snapshot = getPosCatalogSnapshot();
    setProducts(snapshot.products);
    setUsingDemoProducts(snapshot.usingDemoData);
  }, []);

  useEffect(() => {
    loadProductsFromCatalog();
  }, [loadProductsFromCatalog]);

  useEffect(() => {
    refreshSyncStatus();
  }, [refreshSyncStatus]);

  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded) {
      refreshSalesHistory();
      setHistoryLoaded(true);
    }
  }, [activeTab, historyLoaded, refreshSalesHistory]);

  useEffect(() => {
    if (storefrontMode) {
      setActiveTab('sale');
      setCustomerMode('walk-in');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerNotes('');
    }
  }, [storefrontMode]);

  const setStorefrontModeEnabled = (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(POS_STOREFRONT_STORAGE_KEY, String(enabled));
    setStorefrontMode(enabled);
    window.dispatchEvent(new CustomEvent(POS_STOREFRONT_EVENT, { detail: enabled }));
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleString();
  };

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category || p.type)))],
    [products]
  );

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description || '').toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory ||
        product.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, normalizedSearch, selectedCategory]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, MAX_RENDERED_PRODUCTS),
    [filteredProducts]
  );
  const hasProductOverflow = filteredProducts.length > MAX_RENDERED_PRODUCTS;

  const normalizedCatalogQuery = deferredCatalogSearch.trim().toLowerCase();
  const catalogMatches = useMemo(() => {
    if (!normalizedCatalogQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = `${product.name} ${product.description || ''} ${product.category || ''} ${product.type || ''}`.toLowerCase();
      return haystack.includes(normalizedCatalogQuery);
    });
  }, [normalizedCatalogQuery, products]);

  // Keep cartRef in sync so addToCart can read current cart synchronously
  useEffect(() => { cartRef.current = cart; }, [cart]);

  const addToCart = useCallback(
    (product: Product) => {
      const maxStock = typeof product.stock === 'number' ? product.stock : 999;
      const existingItem = cartRef.current.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          announceBanner('warning', `${product.name} reached the available stock limit.`);
          return;
        }
        setCart((prev) =>
          prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
        setShowPaymentModal(true);
        return;
      }

      if (maxStock <= 0) {
        announceBanner('warning', `${product.name} is currently out of stock.`);
        return;
      }

      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
      setShowPaymentModal(true);
    },
    [announceBanner]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (products.length === 0) return;

    const queuedId = localStorage.getItem('posQueuedProductId');
    if (!queuedId) return;

    const queuedProduct = products.find(product => product.id === queuedId);
    if (queuedProduct) {
      addToCart(queuedProduct);
    }

    localStorage.removeItem('posQueuedProductId');
  }, [products, addToCart]);

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      let warningMessage: string | null = null;
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.id !== id) return item;

            const maxStock = typeof item.stock === 'number' ? item.stock : 999;
            const newQuantity = item.quantity + delta;

            if (newQuantity <= 0) {
              return { ...item, quantity: 0 };
            }

            if (newQuantity > maxStock) {
              warningMessage = `${item.name} reached the available stock limit.`;
              return item;
            }

            return { ...item, quantity: newQuantity };
          })
          .filter((item) => item.quantity > 0)
      );

      if (warningMessage) {
        announceBanner('warning', warningMessage);
      }
    },
    [announceBanner]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const closeCatalogPicker = () => {
    setShowCatalogPicker(false);
    setCatalogSearch('');
  };

  const handleCatalogSelection = (product: Product) => {
    addToCart(product);
    closeCatalogPicker();
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
    [cart]
  );
  const tax = useMemo(() => subtotal * VAT_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const processPayment = () => {
    if (cart.length === 0) {
      announceBanner('warning', 'Add at least one item to your cart before processing a sale.');
      return;
    }
    if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
      announceBanner(
        'warning',
        `Cash received must be at least R ${total.toFixed(2)}.`
      );
      return;
    }
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      announceBanner('warning', 'Please enter complete card details.');
      return;
    }
    if (paymentMethod === 'mobile' && !mobileNumber) {
      announceBanner('warning', 'Please enter a mobile number for the payment.');
      return;
    }
    if (paymentMethod === 'electronic' && !electronicRef) {
      announceBanner('warning', 'Reference number required for electronic payments.');
      return;
    }
    if (customerMode === 'account' && !customerName.trim()) {
      announceBanner('warning', 'Provide the customer name or switch back to walk-in.');
      return;
    }

    setIsProcessing(true);

    try {
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      const salesPerson = user
        ? {
            name: user.name || user.email || 'Unknown',
            email: user.email,
            userType: user.userType,
            companyName: user.companyName || user.businessName || null,
          }
        : null;

      const amountPaid = paymentMethod === 'cash' ? parseFloat(amountReceived) : total;
      const changeDue = paymentMethod === 'cash' ? amountPaid - total : 0;
      const paymentDetails =
        paymentMethod === 'card'
          ? `Card ending in ${cardDetails.number.slice(-4)}`
          : paymentMethod === 'mobile'
          ? `Mobile: ${mobileNumber}`
          : paymentMethod === 'electronic'
          ? `Ref: ${electronicRef}`
          : 'Cash';

      const trimmedName = customerName.trim();
      const trimmedEmail = customerEmail.trim();
      const trimmedPhone = customerPhone.trim();
      const trimmedNotes = customerNotes.trim();
      const customerPayload = customerMode === 'account'
        ? {
            type: 'account' as const,
            name: trimmedName,
            email: trimmedEmail || undefined,
            phone: trimmedPhone || undefined,
            notes: trimmedNotes || undefined,
          }
        : {
            type: 'walk-in' as const,
            name: 'Walk-in Customer',
            email: 'walkin@customer.local',
            notes: trimmedNotes || undefined,
          };

      const transactionId = `TXN${Date.now()}`;
      const saleItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.sellingPrice,
        sellingPrice: item.sellingPrice,
      }));

      const recordedSale = recordPosSale({
        transactionId,
        timestamp: new Date().toISOString(),
        items: saleItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        amountReceived: amountPaid,
        change: changeDue,
        paymentDetails,
        salesPerson,
        customer: customerPayload,
      });

      if (historyLoaded) {
        refreshSalesHistory();
      }
      refreshSyncStatus();

      setLastSale(recordedSale);
      setShowPaymentModal(false);
      setShowReceipt(true);
      setCart([]);
      setAmountReceived('');
      setCardDetails({ number: '', expiry: '', cvv: '' });
      setMobileNumber('');
      setElectronicRef('');
      setCustomerMode('walk-in');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerNotes('');
      loadProductsFromCatalog();
      announceBanner('success', `Payment posted for ${recordedSale.transactionId}.`);
    } catch (error) {
      console.error('POS payment failed', error);
      const fallbackMessage =
        error instanceof Error ? error.message : 'Payment failed. Please try again.';
      announceBanner('error', fallbackMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  // Show access denied message if user doesn't have POS permission
  if (!hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            POS locked
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {userType === 'employee' 
              ? "Your profile is missing sales access. Ping your admin and tell them to toggle the POS role."
              : "Switch to a business account or enable the sales role to ring up orders."}
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Need it now?</strong> Ask an admin to grant POS access or sign in as the store owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden pb-24 lg:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Point of Sale
          </h1>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Session</div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            {userType === 'employee' && (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                Sales Employee
              </div>
            )}
            {userType === 'creator' && (
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                Creator
              </div>
            )}
            {userType === 'business' && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                Business Owner
              </div>
            )}
            {storefrontMode && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                Storefront Active
              </span>
            )}
            <button
              type="button"
              onClick={() => setStorefrontModeEnabled(!storefrontMode)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow ${
                storefrontMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              aria-pressed={storefrontMode}
            >
              <Lock className="w-4 h-4" />
              {storefrontMode ? 'Exit Storefront Mode' : 'Enter Storefront Mode'}
            </button>
          </div>
        </div>
      </div>
      {posAccessOverride && (
        <div className="bg-amber-50 border-y border-amber-200 text-amber-900 px-4 py-3 text-sm flex items-center justify-between gap-3">
          <p className="font-medium">
            Staff override unlocked the POS so you can keep selling. Get the official POS permission to restore full tracking.
          </p>
          <span className="text-xs uppercase tracking-wide font-semibold">Staff Override</span>
        </div>
      )}
      {storefrontMode && (
        <div className="bg-amber-50 border-y border-amber-200 text-amber-900 px-4 py-3 text-sm flex items-center justify-between gap-3">
          <p className="font-medium">
            Storefront mode kills every dashboard control and freezes this screen on the Sale tab.
          </p>
          <span className="text-xs uppercase tracking-wide font-semibold">Kiosk ready</span>
        </div>
      )}
      {posBanner && (
        <div
          className={`px-4 py-3 border flex items-center justify-between gap-3 text-sm ${
            posBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : posBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <p className="font-medium">{posBanner.text}</p>
          <button
            type="button"
            onClick={() => setPosBanner(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {syncStatus && (syncStatus.hasInvoiceVariance || syncStatus.hasInventoryVariance || syncStatus.warnings.length > 0) && (
        <div className="bg-amber-100 border-y border-amber-200 text-amber-900 px-4 py-3 text-sm">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">POS sync needs attention</p>
            {syncStatus.warnings.length > 0 && (
              <p>{syncStatus.warnings[0]}</p>
            )}
            <p>
              {syncStatus.pendingInvoices} invoice{syncStatus.pendingInvoices === 1 ? '' : 's'} waiting ·
              {` ${syncStatus.inventoryMovementsRecorded} inventory entries logged`}
            </p>
          </div>
        </div>
      )}

      {/* POS Tabs */}
      {!storefrontMode ? (
        <div className="px-4 pt-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-700">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('sale');
              }}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'sale'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('history');
              }}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sales History
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          Sales history is hidden while Storefront Mode is active. Exit Storefront Mode to review previous transactions.
        </div>
      )}

      {activeTab === 'history' && !storefrontMode ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales History</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshSalesHistory}
                    disabled={isHistoryRefreshing}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isHistoryRefreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab('sale');
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Start New Sale
                  </button>
                </div>
              </div>

              {salesHistory.length === 0 ? (
                <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                  <Receipt className="w-14 h-14 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No sales processed yet</p>
                  <p className="text-sm">Complete a transaction in the Sale tab to see history here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesHistory.map((sale) => (
                    <div key={sale.transactionId} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{sale.transactionId}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(sale.timestamp)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">R {Number(sale.total || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{sale.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                        {Array.isArray(sale.items) ? sale.items.map((item) => `${item.quantity}x ${item.name}`).join(', ') : 'No items'}
                      </div>
                      {sale.customer && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Customer: {sale.customer.name || (sale.customer.type === 'walk-in' ? 'Walk-in Customer' : 'Customer')}
                          {sale.customer.type === 'walk-in' ? ' (walk-in)' : ''}
                        </p>
                      )}
                      {sale.salesPerson?.name && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Processed by: {sale.salesPerson.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ===== SALE TAB - ENHANCED VISIBILITY ===== */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-5 shadow-xl border-b-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-8 h-8 animate-pulse" />
                  🛍️ Sale tab. Move product fast.
                </h2>
                <p className="text-base font-medium mt-1 bg-white/20 px-3 py-1 rounded inline-block">
                  Tap a product. It hits the cart. Payment pops instantly. No wasted taps.
                </p>
                {usingDemoProducts && (
                  <div className="mt-3 text-sm bg-white/10 text-yellow-100 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                    <span className="font-semibold">Demo data loaded.</span>
                    Replace it in Products to sell the real catalog.
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 ${
                    cart.length > 0
                      ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-6 h-6" />
                  Charge now
                  {cart.length > 0 && (
                    <span className="bg-white text-green-600 px-2 py-1 rounded-full text-sm">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearch('');
                    setShowCatalogPicker(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border border-white/40 bg-white/10 text-white shadow-lg hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                >
                  <Package className="w-5 h-5" />
                  Browse catalog
                </button>
                <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
                  POS live
                </div>
              </div>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find a product fast"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nothing to sell yet.</p>
                <p className="text-sm">Add products in Products and they’ll sync here instantly.</p>
                <a
                  href="/dashboard/products"
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Add products
                </a>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {visibleProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all text-left group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <span className="text-3xl z-10">{product.type === 'SERVICE' ? '⚙️' : '📦'}</span>
                      <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all"></div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        R {product.sellingPrice.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.type === 'SERVICE' 
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' 
                          : 'bg-green-100 text-green-600 dark:bg-green-900/30'
                      }`}>
                        {product.type === 'SERVICE' ? 'Service' : `Stock: ${product.stock || 0}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {hasProductOverflow && (
                <p className="mt-4 text-xs text-gray-500">
                  Showing the first {MAX_RENDERED_PRODUCTS} matches. Refine your filters to load more items.
                </p>
              )}
              </>
            )}
          </div>
        </div>

        {/* Cart Section */}
        {storefrontMode ? (
          <div className="w-full lg:w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 text-center space-y-2 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600 font-semibold">Storefront</p>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Ready to pay?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review your basket and tap <strong>Pay Now</strong>. A team member will walk over with the terminal.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Your basket is empty</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tap a product on the left to add it here.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          R {item.sellingPrice.toFixed(2)} each
                        </p>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        × {item.quantity}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">
                          R {(item.sellingPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 text-sm font-semibold hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cart.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">VAT (15%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">R {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-blue-600">R {total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className={`w-full py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all ${
                  cart.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                Tap To Pay
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400"
              >
                Start Over
              </button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Need help? Tap the red button on top of the kiosk to call a team member.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  Current Order
                </h2>
                {cart.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs mt-1">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            R {item.sellingPrice.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          R {(item.sellingPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VAT (15%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">R {tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-blue-600">R {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-6 h-6" />
                  Process Payment
                </button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Payment options will open automatically
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {!storefrontMode && !showPaymentModal && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total due</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">R {total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isProcessing && setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storefrontMode ? 'Self Checkout' : 'Payment'}
                </h3>
                {storefrontMode && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Follow the steps below and tap "Confirm Payment" once the attendant completes the swipe.
                  </p>
                )}
              </div>
              <button 
                onClick={() => !isProcessing && setShowPaymentModal(false)} 
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
                <div className="text-4xl font-bold text-blue-600">R {total.toFixed(2)}</div>
              </div>

              <div className="mt-4 mb-6 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Customer</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Label this as a walk-in sale or capture customer details for later follow-ups.
                    </p>
                  </div>
                  <div className="inline-flex p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('walk-in')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        customerMode === 'walk-in'
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                      }`}
                    >
                      Walk-in
                    </button>
                    <button
                      type="button"
                      onClick={() => !storefrontMode && setCustomerMode('account')}
                      disabled={storefrontMode}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        customerMode === 'account'
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                      } ${storefrontMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={storefrontMode ? 'Exit Storefront Mode to capture customer details.' : 'Capture customer information for the receipt'}
                    >
                      Named
                    </button>
                  </div>
                </div>

                {customerMode === 'walk-in' ? (
                  <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      Receipts and finance entries will display <strong>Walk-in Customer</strong>. Add an optional note for your team.
                    </p>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={3}
                      placeholder="Add a quick note (e.g., blue hoodie, wants express pickup)"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer name*"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={3}
                        placeholder="Notes (preferences, delivery details...)"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {storefrontMode && customerMode === 'account' && (
                  <p className="mt-3 text-xs text-amber-600 font-semibold">
                    Detailed customer capture is locked during kiosk mode. Exit Storefront Mode for staff-assisted checkout.
                  </p>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Select Payment Method</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-8 h-8 text-green-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'mobile'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-8 h-8 text-purple-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Mobile</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('electronic')}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'electronic'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Zap className="w-8 h-8 text-teal-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Electronic</span>
                </button>
              </div>

              {/* Cash Payment */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter amount received"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                  />
                  {parseFloat(amountReceived) >= total && (
                    <div className="text-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Change Due</div>
                      <div className="text-2xl font-bold text-green-600">
                        R {(parseFloat(amountReceived) - total).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        placeholder="12/26"
                        maxLength={5}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Supports Visa, Mastercard, Amex
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Payment */}
              {paymentMethod === 'mobile' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="0812345678"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <QrCode className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Scan to Pay</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Use any mobile payment app</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center py-2 bg-white dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">SnapScan</p>
                      </div>
                      <div className="text-center py-2 bg-white dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Zapper</p>
                      </div>
                      <div className="text-center py-2 bg-white dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Apple Pay</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Electronic Payment */}
              {paymentMethod === 'electronic' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reference/Transaction Number
                    </label>
                    <input
                      type="text"
                      value={electronicRef}
                      onChange={(e) => setElectronicRef(e.target.value)}
                      placeholder="Enter reference number"
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Supported Methods</p>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        EFT / Bank Transfer
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        PayPal / Payoneer
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cryptocurrency
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Process Payment Button */}
            <button
              onClick={processPayment}
              disabled={
                isProcessing ||
                cart.length === 0 ||
                (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total))
              }
              className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  {storefrontMode ? 'Confirm Payment' : 'Complete Transaction'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReceipt(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-green-600" />
                Receipt
              </h3>
              <button onClick={() => setShowReceipt(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sale Completed!</div>
                <div className="text-3xl font-bold text-green-600 my-2">✓</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{formatTimestamp(lastSale.timestamp)}</div>
                {lastSale.transactionId && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Transaction: {lastSale.transactionId}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {Array.isArray(lastSale.items) && lastSale.items.map((item) => (
                  <div key={`${item.id}-${item.name}`} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      R {((item.sellingPrice ?? item.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">R {Number(lastSale.subtotal ?? lastSale.total ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VAT (15%)</span>
                  <span className="text-gray-900 dark:text-white">R {Number(lastSale.tax ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-green-600">R {lastSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                  <span className="text-gray-900 dark:text-white capitalize">{lastSale.paymentMethod}</span>
                </div>
                {lastSale.paymentDetails && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Details</span>
                    <span className="text-gray-900 dark:text-white">{lastSale.paymentDetails}</span>
                  </div>
                )}
                {Number(lastSale.change ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Change Given</span>
                    <span className="text-gray-900 dark:text-white">R {Number(lastSale.change ?? 0).toFixed(2)}</span>
                  </div>
                )}
                {lastSale.customer && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Customer</span>
                    <div className="text-right">
                      <div className="text-gray-900 dark:text-white font-medium">
                        {lastSale.customer.name || (lastSale.customer.type === 'walk-in' ? 'Walk-in Customer' : 'Customer')}
                      </div>
                      {lastSale.customer.email && (
                        <div className="text-xs text-gray-500">{lastSale.customer.email}</div>
                      )}
                      {lastSale.customer.phone && (
                        <div className="text-xs text-gray-500">{lastSale.customer.phone}</div>
                      )}
                      {lastSale.customer.notes && (
                        <div className="text-xs text-gray-500 italic mt-1">{lastSale.customer.notes}</div>
                      )}
                    </div>
                  </div>
                )}
                {lastSale.salesPerson && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Processed By</span>
                    <div className="text-right">
                      <div className="text-gray-900 dark:text-white font-medium">{lastSale.salesPerson.name}</div>
                      {lastSale.salesPerson.companyName && (
                        <div className="text-xs text-gray-500">{lastSale.salesPerson.companyName}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={printReceipt}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Picker Modal */}
      {showCatalogPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeCatalogPicker}>
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-500 font-semibold">Quick Catalog</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Select an item to sell</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Search your full inventory without scrolling. Picking a product drops it straight into the cart.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCatalogPicker}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close catalog picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search by name, description, or category"
                autoFocus
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>
                Showing <strong className="text-gray-900 dark:text-white">{catalogMatches.length}</strong> of {products.length} products
              </span>
              {usingDemoProducts && <span className="text-amber-600 font-medium">Demo catalog</span>}
            </div>

            <div className="mt-5 flex-1 overflow-y-auto">
              {catalogMatches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Search className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-semibold">No products match that search.</p>
                  <p className="text-sm">Try a different keyword or clear the filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalogMatches.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleCatalogSelection(product)}
                      className="text-left rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-xl">
                          {product.type === 'SERVICE' ? '⚙️' : '📦'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description || 'No description'}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600">R {product.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="uppercase tracking-wide font-semibold">
                          {product.category || product.type || 'Uncategorized'}
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {product.type === 'SERVICE' ? 'Service' : `In stock: ${typeof product.stock === 'number' ? product.stock : '∞'}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
