// Products & Services Management Page
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentAccessContext } from '@/lib/accessControl';
import type { CommerceProduct } from '@/lib/commerceData';
import { getDemoProductsCatalog } from '@/lib/commerceData';

export default function ProductsPage() {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [planName, setPlanName] = useState('free_trial');
  const [maxProducts, setMaxProducts] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CommerceProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: 'SERVICE' as 'PRODUCT' | 'SERVICE',
    description: '',
    costProduction: 0,
    costPackaging: 0,
    costDelivery: 0,
    sellingPrice: 0,
    sku: '',
    stock: 0,
  });

  useEffect(() => {
    const context = getCurrentAccessContext();
    setPlanName(context.planType);
    setMaxProducts(context.planPermissions.maxProducts);

    const storedProducts = localStorage.getItem('productsList');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      } catch {
        // fall through to demo seeding
      }
    }

    const demoCatalog = getDemoProductsCatalog();
    setProducts(demoCatalog);
    localStorage.setItem('productsList', JSON.stringify(demoCatalog));
  }, []);

  useEffect(() => {
    localStorage.setItem('productsList', JSON.stringify(products));
  }, [products]);

  // Calculate suggested price based on costs
  const calculateSuggestedPrice = (production: number, packaging: number, delivery: number) => {
    const totalCost = production + packaging + delivery;
    const markup = 2.5; // 150% profit margin
    return Math.round(totalCost * markup);
  };

  // Calculate profit margin
  const calculateProfitMargin = (sellingPrice: number, totalCost: number) => {
    if (sellingPrice === 0) return 0;
    return ((sellingPrice - totalCost) / sellingPrice * 100);
  };

  const handleInputChange = (field: string, value: any) => {
    const updated = { ...newProduct, [field]: value };
    
    // Auto-calculate suggested price when costs change
    if (['costProduction', 'costPackaging', 'costDelivery'].includes(field)) {
      const suggested = calculateSuggestedPrice(
        field === 'costProduction' ? value : updated.costProduction,
        field === 'costPackaging' ? value : updated.costPackaging,
        field === 'costDelivery' ? value : updated.costDelivery
      );
      updated.sellingPrice = suggested;
    }
    
    setNewProduct(updated);
  };

  const handleAddProduct = () => {
    if (products.length >= maxProducts) {
      alert(`Your current plan allows up to ${maxProducts} products/services. Please upgrade to add more.`);
      return;
    }

    if (!newProduct.name.trim()) {
      alert('Product name is required.');
      return;
    }

    const totalCost = newProduct.costProduction + newProduct.costPackaging + newProduct.costDelivery;
    const suggested = calculateSuggestedPrice(newProduct.costProduction, newProduct.costPackaging, newProduct.costDelivery);
    const profitMargin = calculateProfitMargin(newProduct.sellingPrice, totalCost);

    const product: CommerceProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      type: newProduct.type,
      description: newProduct.description,
      costProduction: newProduct.costProduction,
      costPackaging: newProduct.costPackaging,
      costDelivery: newProduct.costDelivery,
      suggestedPrice: suggested,
      sellingPrice: newProduct.sellingPrice,
      profitMargin: profitMargin,
      status: 'ACTIVE',
      sku: newProduct.sku || undefined,
      stock: newProduct.stock || undefined,
      createdAt: new Date().toISOString(),
      category: newProduct.type === 'PRODUCT' ? 'Products' : 'Services',
      posEnabled: true,
    };

    setProducts([...products, product]);
    setShowAddModal(false);
    
    // Reset form
    setNewProduct({
      name: '',
      type: 'SERVICE',
      description: '',
      costProduction: 0,
      costPackaging: 0,
      costDelivery: 0,
      sellingPrice: 0,
      sku: '',
      stock: 0,
    });
  };

  const handleEditProduct = (product: CommerceProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    const totalCost = editingProduct.costProduction + editingProduct.costPackaging + editingProduct.costDelivery;
    const suggested = calculateSuggestedPrice(editingProduct.costProduction, editingProduct.costPackaging, editingProduct.costDelivery);
    const profitMargin = calculateProfitMargin(editingProduct.sellingPrice, totalCost);

    const updatedProduct = {
      ...editingProduct,
      suggestedPrice: suggested,
      profitMargin: profitMargin,
    };

    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || product.type === filterType;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'products' && product.type === 'PRODUCT') ||
                       (activeTab === 'services' && product.type === 'SERVICE');
    return matchesSearch && matchesType && matchesTab;
  });

  // Stats
  const avgMarginValue = products.length
    ? products.reduce((sum, p) => sum + p.profitMargin, 0) / products.length
    : 0;

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'ACTIVE').length,
    avgMargin: avgMarginValue.toFixed(1),
    totalValue: products.reduce((sum, p) => sum + p.sellingPrice * (p.stock || 1), 0),
  };

  const totalCost = newProduct.costProduction + newProduct.costPackaging + newProduct.costDelivery;
  const suggestedPrice = calculateSuggestedPrice(newProduct.costProduction, newProduct.costPackaging, newProduct.costDelivery);
  const currentMargin = calculateProfitMargin(newProduct.sellingPrice, totalCost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">📦 Catalog running on rails.</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Every SKU, every service, priced with intent and ready to sell.</p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            Plan: {planName.replace('_', ' ')} • Limit: {maxProducts === Number.MAX_SAFE_INTEGER ? 'Unlimited' : maxProducts} items • Current: {products.length}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={products.length >= maxProducts}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Add item now
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={stats.totalProducts} icon="📦" color="blue" />
        <StatCard label="Active" value={stats.activeProducts} icon="✅" color="green" />
        <StatCard label="Avg Margin" value={`${stats.avgMargin}%`} icon="📈" color="purple" />
        <StatCard label="Portfolio Value" value={`R${stats.totalValue.toLocaleString()}`} icon="💰" color="orange" />
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Products ({products.filter(p => p.type === 'PRODUCT').length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Services ({products.filter(p => p.type === 'SERVICE').length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search the catalog and surface money fast"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Types</option>
            <option value="PRODUCT">Products Only</option>
            <option value="SERVICE">Services Only</option>
          </select>
        </div>
      </div>

      {/* Mobile: Card View */}
      <div className="block lg:hidden space-y-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onEdit={handleEditProduct} />
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Product/Service</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Costs</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Suggested Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Selling Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Margin</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <ProductRow key={product.id} product={product} onEdit={handleEditProduct} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">➕ Add Product/Service</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Social Media Package"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="SERVICE">Service</option>
                    <option value="PRODUCT">Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product or service..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {newProduct.type === 'PRODUCT' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="e.g., PROD-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">💰 Cost Breakdown</h3>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Production Cost *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R</span>
                      <input
                        type="number"
                        value={newProduct.costProduction}
                        onChange={(e) => handleInputChange('costProduction', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Cost</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R</span>
                      <input
                        type="number"
                        value={newProduct.costPackaging}
                        onChange={(e) => handleInputChange('costPackaging', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Cost</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R</span>
                      <input
                        type="number"
                        value={newProduct.costDelivery}
                        onChange={(e) => handleInputChange('costDelivery', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Cost Display */}
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Total Cost:</span>
                    <span className="text-2xl font-bold text-blue-600">R{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">💵 Pricing Strategy</h3>
                
                {/* Suggested Price (AI Recommendation) */}
                <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤖</span>
                      <span className="font-semibold text-gray-900 dark:text-white">AI Suggested Price:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">R{suggestedPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Based on 150% markup (2.5x total cost) for healthy profit margin
                  </p>
                </div>

                {/* Actual Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Selling Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">R</span>
                    <input
                      type="number"
                      value={newProduct.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                      placeholder={suggestedPrice.toString()}
                      className="w-full pl-8 pr-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Profit Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Profit per Sale</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      R{(newProduct.sellingPrice - totalCost).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Profit Margin</div>
                    <div className={`text-xl font-bold ${
                      currentMargin >= 50 ? 'text-green-600' : 
                      currentMargin >= 30 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {currentMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Margin Status */}
                {currentMargin > 0 && (
                  <div className={`p-3 rounded-lg ${
                    currentMargin >= 50 ? 'bg-green-100 text-green-800' :
                    currentMargin >= 30 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <div className="text-sm font-medium">
                      {currentMargin >= 50 && '✅ Excellent margin! This pricing is very profitable.'}
                      {currentMargin >= 30 && currentMargin < 50 && '⚠️ Good margin, but consider the suggested price for higher profit.'}
                      {currentMargin < 30 && '❌ Low margin! Consider increasing price or reducing costs.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name || newProduct.sellingPrice === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Product/Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product/Service</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={editingProduct.type}
                    onChange={(e) => setEditingProduct({...editingProduct, type: e.target.value as 'PRODUCT' | 'SERVICE'})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="SERVICE">Service</option>
                    <option value="PRODUCT">Physical Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Costs */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cost Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Production Cost (R) *</label>
                    <input
                      type="number"
                      value={editingProduct.costProduction}
                      onChange={(e) => setEditingProduct({...editingProduct, costProduction: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Cost (R)</label>
                    <input
                      type="number"
                      value={editingProduct.costPackaging}
                      onChange={(e) => setEditingProduct({...editingProduct, costPackaging: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Cost (R)</label>
                    <input
                      type="number"
                      value={editingProduct.costDelivery}
                      onChange={(e) => setEditingProduct({...editingProduct, costDelivery: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (R) *</label>
                    <input
                      type="number"
                      value={editingProduct.sellingPrice}
                      onChange={(e) => setEditingProduct({...editingProduct, sellingPrice: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin</label>
                    <input
                      type="text"
                      value={`${calculateProfitMargin(editingProduct.sellingPrice, editingProduct.costProduction + editingProduct.costPackaging + editingProduct.costDelivery).toFixed(1)}%`}
                      disabled
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-lg font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={!editingProduct.name || editingProduct.sellingPrice === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Product/Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}

function ProductCard({ product, onEdit }: { product: CommerceProduct; onEdit: (product: CommerceProduct) => void }) {
  const totalCost = product.costProduction + product.costPackaging + product.costDelivery;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              product.type === 'PRODUCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {product.type}
            </span>
          </div>
          <p className="text-sm text-gray-500">{product.description}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Cost:</span>
          <span className="font-medium">R{totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Suggested Price:</span>
          <span className="font-medium text-green-600">R{product.suggestedPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Selling Price:</span>
          <span className="font-bold text-lg">R{product.sellingPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="text-gray-600">Profit Margin:</span>
          <span className={`font-bold ${
            product.profitMargin >= 50 ? 'text-green-600' : 
            product.profitMargin >= 30 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {product.profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onEdit(product)}
          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700"
        >
          Edit
        </button>
        <Link
          href={`/dashboard/products/${product.id}`}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 text-center"
        >
          View
        </Link>
      </div>
    </div>
  );
}

function ProductRow({ product, onEdit }: { product: CommerceProduct; onEdit: (product: CommerceProduct) => void }) {
  const totalCost = product.costProduction + product.costPackaging + product.costDelivery;
  
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
          <div className="text-sm text-gray-500">{product.description}</div>
          {product.sku && <div className="text-xs text-gray-400">SKU: {product.sku}</div>}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          product.type === 'PRODUCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {product.type}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm space-y-1">
          <div className="text-gray-600">Prod: R{product.costProduction}</div>
          <div className="text-gray-600">Pack: R{product.costPackaging}</div>
          <div className="text-gray-600">Del: R{product.costDelivery}</div>
          <div className="font-semibold pt-1 border-t">Total: R{totalCost}</div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-1">
          <span className="text-sm">🤖</span>
          <span className="font-semibold text-green-600">R{product.suggestedPrice.toLocaleString()}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          R{product.sellingPrice.toLocaleString()}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
            <div 
              className={`h-full rounded-full ${
                product.profitMargin >= 50 ? 'bg-green-500' : 
                product.profitMargin >= 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(product.profitMargin, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-semibold ${
            product.profitMargin >= 50 ? 'text-green-600' : 
            product.profitMargin >= 30 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {product.profitMargin.toFixed(1)}%
          </span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700"
          >
            Edit
          </button>
          <Link
            href={`/dashboard/products/${product.id}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 text-center"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}
