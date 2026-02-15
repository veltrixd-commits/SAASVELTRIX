'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { addFinanceInvoice, markFinanceInvoicePaid, syncFinanceInvoicesFromSales } from '@/lib/commerceData';
import { downloadInvoicePdf } from '@/lib/utils/invoicePdf';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  lead: {
    id: string;
    name: string;
    email: string;
  };
  deal?: {
    title: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [createForm, setCreateForm] = useState({
    clientName: '',
    clientEmail: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'SENT' as 'SENT' | 'PAID',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const toInvoiceStatus = (status?: string): Invoice['status'] => {
    const value = (status || '').toUpperCase();
    if (value === 'PAID' || value === 'SENT' || value === 'DRAFT' || value === 'OVERDUE' || value === 'CANCELLED') {
      return value;
    }
    return 'SENT';
  };

  const loadInvoices = () => {
    const synced = syncFinanceInvoicesFromSales();
    const mappedInvoices: Invoice[] = synced
      .map((invoice, index) => {
        const normalizedItems = Array.isArray(invoice.items)
          ? invoice.items.map((item: any) => ({
              description: item.description || 'Item',
              quantity: Number(item.quantity || 1),
              unitPrice: Number(item.price || item.unitPrice || 0),
              total: Number(item.total || Number(item.quantity || 1) * Number(item.price || item.unitPrice || 0)),
            }))
          : [];

        return {
          id: invoice.id || `${index + 1}`,
          invoiceNumber: invoice.invoiceNumber || `INV-${1000 + index + 1}`,
          amount: Number(invoice.amount || 0),
          currency: 'ZAR',
          status: toInvoiceStatus(invoice.status),
          dueDate: invoice.dueDate || invoice.createdAt || new Date().toISOString(),
          paidAt: invoice.paidAt,
          lead: {
            id: `lead-${invoice.id || index + 1}`,
            name: invoice.clientName || 'Customer',
            email: invoice.clientEmail || 'customer@example.com',
          },
          deal: {
            title: `Invoice for ${invoice.clientName || 'Customer'}`,
          },
          items: normalizedItems,
          createdAt: invoice.createdAt || new Date().toISOString(),
        } as Invoice;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setInvoices(mappedInvoices);
  };

  useEffect(() => {
    loadInvoices();
    setLoading(false);
  }, []);

  const handleCreateInvoice = () => {
    if (!createForm.clientName.trim() || !createForm.clientEmail.trim() || !createForm.description.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    if (!createForm.clientEmail.includes('@')) {
      showToast('Please enter a valid client email address.', 'error');
      return;
    }

    if (createForm.quantity <= 0 || createForm.unitPrice <= 0) {
      showToast('Quantity and unit price must be greater than 0.', 'error');
      return;
    }

    const total = createForm.quantity * createForm.unitPrice;
    const now = new Date().toISOString();

    addFinanceInvoice({
      invoiceNumber: `INV-${Date.now()}`,
      clientName: createForm.clientName.trim(),
      clientEmail: createForm.clientEmail.trim().toLowerCase(),
      amount: total,
      dueDate: createForm.dueDate || now,
      status: createForm.status === 'PAID' ? 'paid' : 'pending',
      items: [
        {
          description: createForm.description.trim(),
          quantity: createForm.quantity,
          price: createForm.unitPrice,
        },
      ],
      paidAt: createForm.status === 'PAID' ? now : undefined,
      notes: 'Created from Invoices page',
    });

    loadInvoices();
    setShowCreateModal(false);
    setCreateForm({
      clientName: '',
      clientEmail: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'SENT',
    });
    showToast('Invoice created successfully.', 'success');
  };

  const handleMarkPaid = (invoiceId: string) => {
    markFinanceInvoicePaid(invoiceId);
    loadInvoices();
    showToast('Invoice marked as paid.', 'success');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    downloadInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      customerName: invoice.lead.name,
      customerEmail: invoice.lead.email,
      status: invoice.status,
      currency: invoice.currency,
      amount: invoice.amount,
      items: invoice.items,
    });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedStatus !== 'all' && invoice.status !== selectedStatus.toUpperCase()) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.lead.name.toLowerCase().includes(query) ||
        invoice.lead.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
      SENT: 'bg-blue-100 text-blue-800 border-blue-300',
      PAID: 'bg-green-100 text-green-800 border-green-300',
      OVERDUE: 'bg-red-100 text-red-800 border-red-300',
      CANCELLED: 'bg-gray-100 text-gray-500 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: string } = {
      DRAFT: '📝',
      SENT: '📤',
      PAID: '✅',
      OVERDUE: '⚠️',
      CANCELLED: '❌',
    };
    return icons[status] || '📄';
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[70]">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">🧾 Invoices</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all your invoices and payments</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Invoices', count: invoices.length },
            { id: 'paid', label: '✅ Paid', count: invoices.filter(i => i.status === 'PAID').length },
            { id: 'sent', label: '📤 Sent', count: invoices.filter(i => i.status === 'SENT').length },
            { id: 'draft', label: '📝 Draft', count: invoices.filter(i => i.status === 'DRAFT').length },
            { id: 'overdue', label: '⚠️ Overdue', count: invoices.filter(i => i.status === 'OVERDUE').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedStatus(tab.id);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Invoiced</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalAmount, 'ZAR')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Paid</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(paidAmount, 'ZAR')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs sm:text-sm text-gray-500">Outstanding</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">
            {formatCurrency(totalAmount - paidAmount, 'ZAR')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Invoices</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredInvoices.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">📝 Draft</option>
            <option value="sent">📤 Sent</option>
            <option value="paid">✅ Paid</option>
            <option value="overdue">⚠️ Overdue</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Search invoices, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <p className="text-lg sm:text-xl text-gray-500">📭 No invoices found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Invoice Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </h3>
                    <span
                      className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {getStatusIcon(invoice.status)} {invoice.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900 dark:text-white font-medium">{invoice.lead.name}</p>
                    <p className="text-gray-500">{invoice.lead.email}</p>
                    {invoice.deal && (
                      <p className="text-gray-600 text-xs">Deal: {invoice.deal.title}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.description} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total, invoice.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Amount and Actions */}
                <div className="flex flex-col items-start lg:items-end gap-3 lg:ml-4">
                  <div className="text-left lg:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                  </div>

                  <div className="text-left lg:text-right text-xs text-gray-500 space-y-1">
                    <p>
                      Created: {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                    {invoice.paidAt && (
                      <p className="text-green-600 font-medium">
                        Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button 
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowViewModal(true);
                      }}
                      className="flex-1 lg:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="flex-1 lg:flex-initial px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
                    >
                      Download
                    </button>
                    {invoice.status === 'SENT' && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="flex-1 lg:flex-initial px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={createForm.clientName}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Email *</label>
                  <input
                    type="email"
                    value={createForm.clientEmail}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Social Media Marketing Package"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.quantity}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        quantity: Math.max(1, Number(e.target.value || 1)),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Price (R) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.unitPrice}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        unitPrice: Number(e.target.value || 0),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total (R)</label>
                  <input
                    type="text"
                    disabled
                    value={formatCurrency(createForm.quantity * createForm.unitPrice, 'ZAR')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date *</label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as 'SENT' | 'PAID' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SENT">📤 Send to Client</option>
                  <option value="PAID">✅ Mark as Paid</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateInvoice}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all"
              >
                Create Invoice
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</h4>
                  <p className="text-sm text-gray-500">Created: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                  {getStatusIcon(selectedInvoice.status)} {selectedInvoice.status}
                </span>
              </div>

              {/* Client Info */}
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h5>
                <p className="text-gray-700">{selectedInvoice.lead.name}</p>
                <p className="text-gray-500 text-sm">{selectedInvoice.lead.email}</p>
              </div>

              {/* Items */}
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Items:</h5>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice, selectedInvoice.currency)}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.total, selectedInvoice.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                {selectedInvoice.paidAt && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Paid on: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700">
                Send to Client
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
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
