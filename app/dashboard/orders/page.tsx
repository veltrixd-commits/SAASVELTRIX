'use client';

import { useState } from 'react';
import { DollarSign, Trash2, Plus, Minus, Receipt } from 'lucide-react';
import { addSaleToHistory, syncFinanceInvoicesFromSales } from '@/lib/commerceData';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrdersPage() {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const addItem = () => {
    if (!itemName || !itemPrice) {
      alert('Please enter item name and price');
      return;
    }

    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: itemName,
      price: parseFloat(itemPrice),
      quantity: 1
    };

    setOrder([...order, newItem]);
    setItemName('');
    setItemPrice('');
  };

  const updateQuantity = (id: string, change: number) => {
    setOrder(order.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setOrder(order.filter(item => item.id !== id));
  };

  const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const processPayment = () => {
    if (order.length === 0) {
      alert('Add items to order first');
      return;
    }

    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
      alert('Amount paid must be equal or greater than total');
      return;
    }

    const orderData = {
      items: order,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
      change: paymentMethod === 'cash' ? parseFloat(amountPaid) - total : 0,
      timestamp: new Date().toLocaleString(),
      orderId: `ORD${Date.now()}`
    };

    // Save to order history (legacy)
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    history.push(orderData);
    localStorage.setItem('orderHistory', JSON.stringify(history));

    // Save to shared commerce history and keep finance invoices in sync
    addSaleToHistory({
      transactionId: orderData.orderId,
      timestamp: new Date().toISOString(),
      items: orderData.items,
      subtotal: orderData.total,
      tax: 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      amountReceived: orderData.amountPaid,
      change: orderData.change,
    });
    syncFinanceInvoicesFromSales();

    setLastOrder(orderData);
    setShowPayment(false);
    setShowReceipt(true);
    setOrder([]);
    setAmountPaid('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-xl">
          <h1 className="text-3xl font-bold">📝 Orders & Payment</h1>
          <p className="text-white/90 mt-2">Simple order taking and payment processing</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ➕ Add Items
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="e.g., Coffee, Burger, Service"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (R)
                </label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <button
                onClick={addItem}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg
                         transition-all transform hover:scale-105 shadow-lg"
              >
                ➕ Add to Order
              </button>
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Add:</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Coffee', price: 25 },
                  { name: 'Sandwich', price: 45 },
                  { name: 'Lunch Special', price: 85 },
                  { name: 'Service Fee', price: 100 }
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setOrder([...order, {
                        id: Date.now().toString(),
                        name: item.name,
                        price: item.price,
                        quantity: 1
                      }]);
                    }}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                             text-gray-900 dark:text-white py-2 px-3 rounded text-sm font-medium
                             transition-all"
                  >
                    {item.name}<br />
                    <span className="text-blue-600 dark:text-blue-400 font-bold">R {item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Order */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🧾 Current Order
            </h2>

            {order.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No items yet</p>
                <p className="text-sm">Add items to start an order</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {order.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            R {item.price.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500
                                     p-1 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-gray-900 dark:text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500
                                     p-1 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          R {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">TOTAL:</span>
                    <span className="text-3xl font-bold text-green-600">
                      R {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg
                           transition-all transform hover:scale-105 shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-6 h-6" />
                  Process Payment
                </button>
              </>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                💳 Payment
              </h2>

              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    R {total.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-green-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-lg font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    💳 Card
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Received
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold
                               focus:border-green-500 focus:outline-none"
                    />
                    {amountPaid && parseFloat(amountPaid) >= total && (
                      <div className="mt-2 text-green-600 font-bold">
                        Change: R {(parseFloat(amountPaid) - total).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500
                           text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg
                           transition-all transform hover:scale-105 shadow-lg"
                >
                  ✓ Complete Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && lastOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                ✓ Payment Complete!
              </h2>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Order ID</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white">
                    {lastOrder.orderId}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {lastOrder.timestamp}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {lastOrder.items.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        R {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      R {lastOrder.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {lastOrder.paymentMethod}
                    </span>
                  </div>
                  {lastOrder.change > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Change:</span>
                      <span>R {lastOrder.change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg
                         transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
