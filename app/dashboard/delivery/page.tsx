'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: {
    name: string;
    color: string;
  };
  pipeline: {
    name: string;
  };
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
  fulfillmentStatus: 'pending' | 'fulfilled' | 'cancelled';
  fulfillmentDate?: string;
  trackingNumber?: string;
  deliveryNotes?: string;
  createdAt: string;
  expectedDelivery?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
  };
  deliveryTimeline?: Array<{
    timestamp: string;
    status: string;
    note: string;
    location?: string;
  }>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface DeliveryStats {
  pending: number;
  fulfilled: number;
  total: number;
  fulfillmentRate: number;
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    pending: 0,
    fulfilled: 0,
    total: 0,
    fulfillmentRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

  // Available drivers
  const drivers = [
    { id: '1', name: 'John Smith', phone: '+27 11 555 1001', vehicle: 'Toyota Hilux - AB 123 GP', rating: 4.8 },
    { id: '2', name: 'Mary Johnson', phone: '+27 11 555 1002', vehicle: 'Ford Ranger - CD 456 GP', rating: 4.9 },
    { id: '3', name: 'David Williams', phone: '+27 11 555 1003', vehicle: 'Nissan NP300 - EF 789 GP', rating: 4.7 },
    { id: '4', name: 'Sarah Davis', phone: '+27 11 555 1004', vehicle: 'Isuzu D-Max - GH 012 GP', rating: 4.9 },
  ];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, searchQuery, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Demo data - replace with API call in production
      const demoOrders: Order[] = [
        {
          id: '1',
          title: 'Social Media Marketing Package - TechStart Solutions',
          value: 15000,
          currency: 'ZAR',
          stage: { name: 'Closed Won', color: 'green' },
          pipeline: { name: 'Sales Pipeline' },
          lead: {
            id: 'lead1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+27 21 555 0101'
          },
          invoices: [{
            id: 'inv1',
            amount: 15000,
            status: 'PAID',
            dueDate: '2026-02-20'
          }],
          fulfillmentStatus: 'pending',
          createdAt: '2026-02-10',
          expectedDelivery: '2026-02-25',
          priority: 'high',
          deliveryTimeline: [
            { timestamp: '2026-02-10 09:00', status: 'Order Received', note: 'Order placed by customer', location: 'System' },
            { timestamp: '2026-02-10 10:30', status: 'Processing', note: 'Order confirmed and being prepared', location: 'Warehouse' },
          ]
        },
        {
          id: '2',
          title: 'Digital Marketing Campaign - Growth Hackers',
          value: 18000,
          currency: 'ZAR',
          stage: { name: 'Closed Won', color: 'green' },
          pipeline: { name: 'Sales Pipeline' },
          lead: {
            id: 'lead2',
            name: 'Lisa Brown',
            email: 'lisa.brown@email.com',
            phone: '+27 21 555 0102'
          },
          invoices: [{
            id: 'inv2',
            amount: 18000,
            status: 'PAID',
            dueDate: '2026-02-15'
          }],
          fulfillmentStatus: 'fulfilled',
          fulfillmentDate: '2026-02-14',
          trackingNumber: 'TRK-2026-001',
          deliveryNotes: 'Delivered successfully to client',
          createdAt: '2026-02-05',
          expectedDelivery: '2026-02-15',
          priority: 'medium',
          driver: { id: '1', name: 'John Smith', phone: '+27 11 555 1001', vehicle: 'Toyota Hilux - AB 123 GP' },
          deliveryTimeline: [
            { timestamp: '2026-02-05 11:00', status: 'Order Received', note: 'Order placed', location: 'System' },
            { timestamp: '2026-02-05 14:00', status: 'Processing', note: 'Package prepared', location: 'Warehouse' },
            { timestamp: '2026-02-13 08:00', status: 'Out for Delivery', note: 'Driver John Smith assigned', location: 'In Transit' },
            { timestamp: '2026-02-14 15:30', status: 'Delivered', note: 'Successfully delivered to client', location: 'Sandton, JHB' },
          ]
        },
        {
          id: '3',
          title: 'SEO Optimization Service - Innovate Corp',
          value: 22000,
          currency: 'ZAR',
          stage: { name: 'Closed Won', color: 'green' },
          pipeline: { name: 'Sales Pipeline' },
          lead: {
            id: 'lead3',
            name: 'Sophie Martin',
            email: 'sophie.martin@email.com',
            phone: '+27 21 555 0103'
          },
          invoices: [{
            id: 'inv3',
            amount: 22000,
            status: 'PAID',
            dueDate: '2026-02-18'
          }],
          fulfillmentStatus: 'pending',
          createdAt: '2026-02-08',
          expectedDelivery: '2026-02-28',
          priority: 'medium',
          driver: { id: '2', name: 'Mary Johnson', phone: '+27 11 555 1002', vehicle: 'Ford Ranger - CD 456 GP' },
          deliveryTimeline: [
            { timestamp: '2026-02-08 10:00', status: 'Order Received', note: 'New order', location: 'System' },
            { timestamp: '2026-02-08 11:15', status: 'Processing', note: 'Order being prepared', location: 'Warehouse' },
            { timestamp: '2026-02-14 09:00', status: 'Ready for Dispatch', note: 'Package ready, driver assigned', location: 'Warehouse' },
          ]
        },
        {
          id: '4',
          title: 'Content Creation Package - Enterprise Global',
          value: 75000,
          currency: 'ZAR',
          stage: { name: 'Closed Won', color: 'green' },
          pipeline: { name: 'Sales Pipeline' },
          lead: {
            id: 'lead4',
            name: 'Robert King',
            email: 'robert.king@email.com',
            phone: '+27 21 555 0104'
          },
          invoices: [{
            id: 'inv4',
            amount: 37500,
            status: 'PAID',
            dueDate: '2026-02-10'
          }, {
            id: 'inv5',
            amount: 37500,
            status: 'SENT',
            dueDate: '2026-03-10'
          }],
          fulfillmentStatus: 'fulfilled',
          fulfillmentDate: '2026-02-12',
          trackingNumber: 'TRK-2026-002',
          deliveryNotes: 'Phase 1 completed. Client very satisfied.',
          createdAt: '2026-01-28',
          expectedDelivery: '2026-02-12',
          priority: 'urgent',
          driver: { id: '4', name: 'Sarah Davis', phone: '+27 11 555 1004', vehicle: 'Isuzu D-Max - GH 012 GP' },
          deliveryTimeline: [
            { timestamp: '2026-01-28 09:30', status: 'Order Received', note: 'High priority order', location: 'System' },
            { timestamp: '2026-01-28 12:00', status: 'Processing', note: 'Priority processing', location: 'Warehouse' },
            { timestamp: '2026-02-11 07:00', status: 'Out for Delivery', note: 'Driver Sarah Davis dispatched', location: 'In Transit' },
            { timestamp: '2026-02-12 10:00', status: 'Delivered', note: 'Phase 1 delivered successfully', location: 'Rosebank, JHB' },
          ]
        },
        {
          id: '5',
          title: 'Brand Strategy Consulting - Future Systems',
          value: 55000,
          currency: 'ZAR',
          stage: { name: 'Closed Won', color: 'green' },
          pipeline: { name: 'Sales Pipeline' },
          lead: {
            id: 'lead5',
            name: 'Chris Green',
            email: 'chris.green@email.com',
            phone: '+27 21 555 0105'
          },
          invoices: [{
            id: 'inv6',
            amount: 55000,
            status: 'PAID',
            dueDate: '2026-02-22'
          }],
          fulfillmentStatus: 'pending',
          createdAt: '2026-02-12',
          expectedDelivery: '2026-03-01',
          priority: 'low',
          deliveryTimeline: [
            { timestamp: '2026-02-12 14:00', status: 'Order Received', note: 'New consultation order', location: 'System' },
            { timestamp: '2026-02-12 16:00', status: 'Processing', note: 'Order confirmed', location: 'Warehouse' },
          ]
        }
      ];

      // Filter orders based on selected status
      let filteredOrders = demoOrders;
      if (selectedStatus !== 'all') {
        filteredOrders = demoOrders.filter(order => order.fulfillmentStatus === selectedStatus);
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order =>
          order.title.toLowerCase().includes(query) ||
          order.lead.name.toLowerCase().includes(query) ||
          order.lead.email.toLowerCase().includes(query) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query))
        );
      }

      setOrders(filteredOrders);
      
      // Calculate stats
      const pending = demoOrders.filter(o => o.fulfillmentStatus === 'pending').length;
      const fulfilled = demoOrders.filter(o => o.fulfillmentStatus === 'fulfilled').length;
      const total = demoOrders.length;
      const rate = total > 0 ? (fulfilled / total) * 100 : 0;

      setStats({
        pending,
        fulfilled,
        total,
        fulfillmentRate: parseFloat(rate.toFixed(1))
      });
      
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFulfillment = async (
    orderId: string,
    status: 'pending' | 'fulfilled' | 'cancelled',
    trackingNumber?: string,
    deliveryNotes?: string
  ) => {
    try {
      // Update order in local state
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            fulfillmentStatus: status,
            trackingNumber: trackingNumber || order.trackingNumber,
            deliveryNotes: deliveryNotes || order.deliveryNotes
          };
        }
        return order;
      }));
      
      setShowFulfillModal(false);
      setSelectedOrder(null);
      
      // Show success message
      alert('✅ Order marked as fulfilled successfully!');
    } catch (error) {
      console.error('Failed to update fulfillment:', error);
      alert('❌ Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      fulfilled: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: string } = {
      pending: '⏳',
      fulfilled: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📦';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📦 Delivery War Room</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track orders, unblock drivers, and keep promises on time every day.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`text-center px-4 py-2 rounded-lg border cursor-pointer hover:scale-105 transition-all ${
                selectedStatus === 'pending' 
                  ? 'bg-yellow-100 border-yellow-300 shadow-lg' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </button>
            <button
              onClick={() => setSelectedStatus('fulfilled')}
              className={`text-center px-4 py-2 rounded-lg border cursor-pointer hover:scale-105 transition-all ${
                selectedStatus === 'fulfilled' 
                  ? 'bg-green-100 border-green-300 shadow-lg' 
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
              <div className="text-xs text-gray-600">Fulfilled</div>
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`text-center px-4 py-2 rounded-lg border cursor-pointer hover:scale-105 transition-all ${
                selectedStatus === 'all' 
                  ? 'bg-blue-100 border-blue-300 shadow-lg' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">
                {stats.fulfillmentRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Rate</div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">⏳ Pending</option>
            <option value="fulfilled">✅ Fulfilled</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Find any order, buyer, or tracking code in seconds"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Resync orders
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Syncing delivery lanes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-xl text-gray-500">📦 No orders routed</p>
            <p className="text-sm text-gray-400 mt-2">
              Close a deal or import jobs and this board lights up instantly.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.title}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                          order.fulfillmentStatus
                        )}`}
                      >
                        {getStatusIcon(order.fulfillmentStatus)}{' '}
                        {order.fulfillmentStatus.toUpperCase()}
                      </span>
                      {order.priority && (
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            order.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            order.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            order.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Customer Info */}
                      <div>
                        <p className="text-gray-500 mb-1">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{order.lead.name}</p>
                        <p className="text-gray-600">{order.lead.email}</p>
                        <p className="text-gray-600">{order.lead.phone}</p>
                      </div>

                      {/* Order Details */}
                      <div>
                        <p className="text-gray-500 mb-1">Order Details</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Value: {formatCurrency(order.value, order.currency)}
                        </p>
                        <p className="text-gray-600">
                          Stage: <span style={{ color: order.stage.color }}>●</span>{' '}
                          {order.stage.name}
                        </p>
                        <p className="text-gray-600">Pipeline: {order.pipeline.name}</p>
                      </div>

                      {/* Driver Info */}
                      {order.driver ? (
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">🚗 Assigned Driver</p>
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="font-medium text-gray-900">{order.driver.name}</p>
                            <p className="text-sm text-gray-600">{order.driver.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">{order.driver.vehicle}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">🚗 Driver</p>
                          <p className="text-sm text-orange-600 font-medium">Not assigned yet</p>
                        </div>
                      )}

                      {/* Fulfillment Info */}
                      {order.fulfillmentStatus !== 'pending' && (
                        <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-lg">
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Tracking:</span>{' '}
                              {order.trackingNumber}
                            </p>
                          )}
                          {order.fulfillmentDate && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fulfilled:</span>{' '}
                              {new Date(order.fulfillmentDate).toLocaleDateString()}
                            </p>
                          )}
                          {order.deliveryNotes && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Notes:</span>{' '}
                              {order.deliveryNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Invoices */}
                    {order.invoices.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Invoices ({order.invoices.length})
                        </p>
                        <div className="flex gap-2">
                          {order.invoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-xs"
                            >
                              {formatCurrency(invoice.amount, order.currency)} •{' '}
                              {invoice.status}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {order.fulfillmentStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowFulfillModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          ✅ Mark Fulfilled
                        </button>
                        {!order.driver && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDriverModal(true);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                          >
                            🚗 Assign Driver
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowTimelineModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      📍 View Timeline
                    </button>
                    <a
                      href="/dashboard/leads"
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium text-center"
                    >
                      👤 Jump to lead
                    </a>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                  {order.expectedDelivery && (
                    <span>
                      Expected: {new Date(order.expectedDelivery).toLocaleDateString()}
                    </span>
                  )}
                  {order.assignedTo && <span>Assigned to: {order.assignedTo.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mark Order as Fulfilled
            </h2>
            <p className="text-gray-600 mb-4">Order: {selectedOrder.title}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateFulfillment(
                  selectedOrder.id,
                  'fulfilled',
                  formData.get('trackingNumber') as string,
                  formData.get('deliveryNotes') as string
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number (optional)
                  </label>
                  <input
                    type="text"
                    name="trackingNumber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., TRACK123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Notes (optional)
                  </label>
                  <textarea
                    name="deliveryNotes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes about the delivery..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowFulfillModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ Mark Fulfilled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showDriverModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🚗 Assign Driver
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Order: {selectedOrder.title}
            </p>

            <div className="space-y-3 mb-6">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDriver === driver.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {driver.name}
                        </h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                          ⭐ {driver.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📞 {driver.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        🚙 {driver.vehicle}
                      </p>
                    </div>
                    {selectedDriver === driver.id && (
                      <div className="text-blue-600 text-xl">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDriverModal(false);
                  setSelectedDriver('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDriver) {
                    alert(`✅ Driver assigned successfully to order!`);
                    setShowDriverModal(false);
                    setSelectedDriver('');
                  }
                }}
                disabled={!selectedDriver}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚗 Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Timeline Modal */}
      {showTimelineModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📍 Delivery Timeline
              </h2>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {selectedOrder.title}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900 dark:text-white ml-2">
                    {selectedOrder.lead.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Expected:</span>
                  <span className="font-medium text-gray-900 dark:text-white ml-2">
                    {selectedOrder.expectedDelivery && new Date(selectedOrder.expectedDelivery).toLocaleDateString()}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-mono font-bold text-blue-600 ml-2">
                      {selectedOrder.trackingNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>
              
              <div className="space-y-6">
                {selectedOrder.deliveryTimeline && selectedOrder.deliveryTimeline.length > 0 ? (
                  selectedOrder.deliveryTimeline.map((event, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {selectedOrder.deliveryTimeline!.length - index}
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {event.status}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {event.note}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No timeline events yet
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
