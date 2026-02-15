// Product detail drawer for deep dives + POS hand-off
'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Tag, Package, ShieldCheck, Zap, DollarSign } from 'lucide-react';
import type { CommerceProduct } from '@/lib/commerceData';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<CommerceProduct | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetId = params?.id;
    if (!targetId) return;

    const raw = localStorage.getItem('productsList');
    if (!raw) return;

    try {
      const parsed: CommerceProduct[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find(item => item.id === targetId);
        setProduct(found ?? null);
      }
    } catch {
      setProduct(null);
    }
  }, [params?.id]);

  const totalCost = product
    ? product.costProduction + product.costPackaging + product.costDelivery
    : 0;

  const handleSellViaPos = () => {
    if (!product) return;
    localStorage.setItem('posQueuedProductId', product.id);
    router.push('/dashboard/pos');
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalog
        </button>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Product not found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            The item may have been removed or renamed. Head back to the product list to continue.
          </p>
          <Link
            href="/dashboard/products"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
          >
            Go to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to catalog
      </button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Product profile</p>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                {product.name}
                {product.posEnabled !== false && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> POS Ready
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                {product.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-gray-400">Status</p>
              <p className={`text-sm font-semibold ${product.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                {product.status}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DetailStat icon={<Tag className="w-4 h-4" />} label="Selling price" value={`R ${product.sellingPrice.toFixed(2)}`} />
            <DetailStat icon={<DollarSign className="w-4 h-4" />} label="Suggested price" value={`R ${product.suggestedPrice.toFixed(2)}`} />
            <DetailStat icon={<Zap className="w-4 h-4" />} label="Profit margin" value={`${product.profitMargin.toFixed(1)}%`} accent={product.profitMargin >= 50 ? 'text-green-600' : 'text-amber-600'} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CostBreakdown label="Production" amount={product.costProduction} />
            <CostBreakdown label="Packaging" amount={product.costPackaging} />
            <CostBreakdown label="Delivery" amount={product.costDelivery} />
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">Unit economics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total cost per unit</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">R {totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              Quick actions
            </h2>
            <button
              type="button"
              onClick={handleSellViaPos}
              className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-700"
            >
              <ShoppingCart className="w-5 h-5" />
              Sell via POS
            </button>
            <Link
              href="/dashboard/pos"
              className="block w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Open POS without pre-loading
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We drop this product into the POS cart automatically using a secure local hand-off so staff don’t need to search again.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Metadata</h3>
            <MetadataRow label="SKU" value={product.sku || '—'} />
            <MetadataRow label="Category" value={product.category || 'Uncategorized'} />
            <MetadataRow label="Type" value={product.type} />
            <MetadataRow label="Stock" value={typeof product.stock === 'number' ? `${product.stock} units` : 'Not tracked'} />
            <MetadataRow label="Created" value={formatDisplayDate(product.createdAt)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value, accent = 'text-gray-900' }: { icon: ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/40">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent}`}>{value}</p>
    </div>
  );
}

function CostBreakdown({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">R {amount.toFixed(2)}</p>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
