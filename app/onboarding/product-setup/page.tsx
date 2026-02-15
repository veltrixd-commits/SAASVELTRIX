// Onboarding - Product Setup
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus, X, DollarSign, Edit, Image } from 'lucide-react';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
}

export default function ProductSetupPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: '',
    name: '',
    price: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (Array.isArray(user?.products)) {
      setProducts(user.products as Product[]);
    }
  }, []);

  const categories = [
    'Physical Product',
    'Digital Product',
    'Service',
    'Subscription',
    'Consultation',
    'Course',
    'Other'
  ];

  const handleAddProduct = () => {
    setCurrentProduct({
      id: '',
      name: '',
      price: '',
      description: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.price || !currentProduct.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (currentProduct.id) {
      // Update existing product
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct : p));
    } else {
      // Add new product
      const newProduct = {
        ...currentProduct,
        id: Date.now().toString()
      };
      setProducts([...products, newProduct]);
    }

    setShowModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleContinue = () => {
    updateCurrentUser({
      products: products,
      onboardingStep: 'automation-preferences'
    });

    // Navigate to automation preferences
    router.push('/onboarding/automation-preferences');
  };

  const handleSkip = () => {
    updateCurrentUser({
      products: [],
      onboardingStep: 'automation-preferences'
    });

    router.push('/onboarding/automation-preferences');
  };

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Setup Your Products
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Add the products or services you offer. You can add more later.
        </p>
      </div>

      {/* Add Product Button */}
      <button
        onClick={handleAddProduct}
        className="w-full mb-4 sm:mb-6 py-3 sm:py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Product or Service</span>
      </button>

      {/* Products List */}
      {products.length > 0 ? (
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {products.map(product => (
            <div
              key={product.id}
              className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      R {product.price}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-2 glass-button rounded-lg hover:scale-105 transition-all"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 glass-button rounded-lg hover:scale-105 transition-all"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-8">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No products added yet. Click the button above to add your first product.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
        <button
          onClick={() => router.push('/onboarding/business-details')}
          className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all order-2 sm:order-1"
        >
          ← Back
        </button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
          <button
            onClick={handleSkip}
            className="px-4 sm:px-6 py-2.5 sm:py-3 glass-button rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            disabled={products.length === 0}
            className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all shadow-lg hover:shadow-2xl ${
              products.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Continue →
          </button>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentProduct.id ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 glass-button rounded-lg hover:scale-105 transition-all"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="e.g., Premium Subscription"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={currentProduct.category}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                  className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (ZAR) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    R
                  </span>
                  <input
                    type="number"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                  placeholder="Describe your product or service..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 glass-button rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
                >
                  {currentProduct.id ? 'Update' : 'Add'} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
