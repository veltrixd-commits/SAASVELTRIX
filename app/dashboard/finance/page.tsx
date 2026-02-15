'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserType, getCurrentUserPermissions } from '@/lib/accessControl';
import { exportToCSV, exportToJSON, exportToTXT, generateTextReport } from '@/lib/utils/exportData';
import { getSalesHistory, syncFinanceInvoicesFromSales } from '@/lib/commerceData';
import { downloadInvoicePdf, downloadQuotationPdf } from '@/lib/utils/invoicePdf';
import { Plus, X, Send, Download, Upload, FileText, DollarSign, AlertCircle } from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  averageDealValue: number;
  revenueGrowth: number;
  projectedRevenue: number;
}

interface BudgetStats {
  totalIncome: number;
  monthlyIncome: number;
  totalExpenses: number;
   monthlyExpenses: number;
  savings: number;
  savingsRate: number;
  budgetUtilization: number;
}

interface RevenueByMonth{
  month: string;
  revenue: number;
  invoices: number;
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
  items: InvoiceItem[];
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Quotation {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  validUntil: string;
  status: 'pending' | 'accepted' | 'declined';
  quotationNumber: string;
  items: InvoiceItem[];
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addedAt: string;
}

interface EmailHealthStatus {
  configured: boolean;
  missing: string[];
}

export default function FinancePage() {
  const [userType, setUserType] = useState<'business' | 'employee' | 'creator' | 'individual'>('business');
  const [isBudgetingMode, setIsBudgetingMode] = useState(false);
  
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    averageDealValue: 0,
    revenueGrowth: 0,
    projectedRevenue: 0,
  });

  const [budgetStats, setBudgetStats] = useState<BudgetStats>({
    totalIncome: 0,
    monthlyIncome: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    savings: 0,
    savingsRate: 0,
    budgetUtilization: 0,
  });

  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sendingDocumentKey, setSendingDocumentKey] = useState<string | null>(null);
  const [emailHealth, setEmailHealth] = useState<EmailHealthStatus | null>(null);
  const [emailHealthLoading, setEmailHealthLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [newInvoiceItems, setNewInvoiceItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [newQuotationItems, setNewQuotationItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [expenses, setExpenses] = useState([
    { id: '1', date: '2026-02-14', category: 'Marketing', description: 'TikTok Ad Campaign', amount: 5000, vendor: 'TikTok Ads' },
    { id: '2', date: '2026-02-13', category: 'Software', description: 'Monthly SaaS subscriptions', amount: 1200, vendor: 'Various' },
    { id: '3', date: '2026-02-12', category: 'Office', description: 'Office supplies', amount: 350, vendor: 'Office Depot' },
  ]);

  // Initialize expense categories based on mode
  const businessExpenseCategories = ['Marketing', 'Software', 'Office', 'Travel', 'Equipment', 'Other'];
  const budgetingExpenseCategories = ['Housing', 'Food', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Savings'];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    // Load synced commerce data
    const syncedInvoices = syncFinanceInvoicesFromSales();
    const salesHistory = getSalesHistory();
    const savedQuotations = localStorage.getItem('financeQuotations');
    const savedClients = localStorage.getItem('financeClients');
    const savedLogo = localStorage.getItem('businessLogo');
    
    setInvoices(syncedInvoices as Invoice[]);
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedLogo) setBusinessLogo(savedLogo);
    
    // Detect user type and set mode
    const type = getCurrentUserType();
    const permissions = getCurrentUserPermissions();
    setUserType(type);
    setIsBudgetingMode(permissions.isBudgetingMode);
    
    // Set appropriate active tab based on mode
    if (permissions.isBudgetingMode) {
      setActiveTab('budget');
      // Load budgeting data
      setBudgetStats({
        totalIncome: 45000,
        monthlyIncome: 15000,
        totalExpenses: 28500,
        monthlyExpenses: 9500,
        savings: 16500,
        savingsRate: 36.7,
        budgetUtilization: 63.3,
      });
      
      // Set demo budget expenses
      setExpenses([
        { id: '1', date: '2026-02-14', category: 'Housing', description: 'Rent payment', amount: 3500, vendor: 'Landlord' },
        { id: '2', date: '2026-02-13', category: 'Food', description: 'Groceries', amount: 850, vendor: 'Woolworths' },
        { id: '3', date: '2026-02-12', category: 'Transport', description: 'Fuel', amount: 600, vendor: 'Shell' },
        { id: '4', date: '2026-02-10', category: 'Entertainment', description: 'Netflix subscription', amount: 199, vendor: 'Netflix' },
        { id: '5', date: '2026-02-08', category: 'Bills', description: 'Electricity', amount: 1200, vendor: 'Eskom' },
      ]);
    } else {
      // Business/Creator mode - derive business data from synced invoices + sales
      const paidInvoices = syncedInvoices.filter((invoice) => invoice.status === 'paid');
      const pendingInvoices = syncedInvoices.filter((invoice) => invoice.status === 'pending');
      const overdueInvoices = syncedInvoices.filter((invoice) => invoice.status === 'overdue');

      const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

      const currentMonthRevenue = salesHistory
        .filter((sale) => {
          const date = new Date(sale.timestamp);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

      const previousMonthRevenue = salesHistory
        .filter((sale) => {
          const date = new Date(sale.timestamp);
          return (
            date.getMonth() === previousMonthDate.getMonth() &&
            date.getFullYear() === previousMonthDate.getFullYear()
          );
        })
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

      const revenueGrowth = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : currentMonthRevenue > 0
          ? 100
          : 0;

      const averageDealValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

      setStats({
        totalRevenue,
        monthlyRevenue: currentMonthRevenue,
        pendingInvoices: pendingInvoices.length,
        paidInvoices: paidInvoices.length,
        overdueInvoices: overdueInvoices.length,
        averageDealValue,
        revenueGrowth,
        projectedRevenue: currentMonthRevenue * 1.25,
      });

      const monthlyBuckets = [2, 1, 0].map((offset) => {
        const date = new Date(currentYear, currentMonth - offset, 1);
        const monthRevenue = salesHistory
          .filter((sale) => {
            const saleDate = new Date(sale.timestamp);
            return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
        const monthInvoices = syncedInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
        }).length;

        return {
          month: date.toLocaleString('en-ZA', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          invoices: monthInvoices,
        };
      });

      setRevenueByMonth(monthlyBuckets);
    }

    if (permissions.isBudgetingMode) {
      setRevenueByMonth([]);
    }

    setLoading(false);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('financeInvoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('financeQuotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('financeClients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (isBudgetingMode) return;

    const salesHistory = getSalesHistory();
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid');
    const pendingInvoices = invoices.filter((invoice) => invoice.status === 'pending');
    const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue');

    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

    const currentMonthRevenue = salesHistory
      .filter((sale) => {
        const date = new Date(sale.timestamp);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    const previousMonthRevenue = salesHistory
      .filter((sale) => {
        const date = new Date(sale.timestamp);
        return date.getMonth() === previousMonthDate.getMonth() && date.getFullYear() === previousMonthDate.getFullYear();
      })
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0
        ? 100
        : 0;

    const averageDealValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    setStats({
      totalRevenue,
      monthlyRevenue: currentMonthRevenue,
      pendingInvoices: pendingInvoices.length,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      averageDealValue,
      revenueGrowth,
      projectedRevenue: currentMonthRevenue * 1.25,
    });

    const monthlyBuckets = [2, 1, 0].map((offset) => {
      const date = new Date(currentYear, currentMonth - offset, 1);
      const monthRevenue = salesHistory
        .filter((sale) => {
          const saleDate = new Date(sale.timestamp);
          return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
      const monthInvoices = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear();
      }).length;

      return {
        month: date.toLocaleString('en-ZA', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        invoices: monthInvoices,
      };
    });

    setRevenueByMonth(monthlyBuckets);
  }, [invoices, isBudgetingMode]);

  useEffect(() => {
    if (isBudgetingMode) return;

    const loadEmailHealth = async () => {
      setEmailHealthLoading(true);
      try {
        const response = await fetch('/api/finance/email-status');
        if (!response.ok) {
          setEmailHealth(null);
          return;
        }

        const data = await response.json();
        setEmailHealth({
          configured: Boolean(data?.configured),
          missing: Array.isArray(data?.missing) ? data.missing : [],
        });
      } catch {
        setEmailHealth(null);
      } finally {
        setEmailHealthLoading(false);
      }
    };

    loadEmailHealth();
  }, [isBudgetingMode]);

  const addOrUpdateClient = (name: string, email: string, phone?: string) => {
    const existing = clients.find(c => c.email === email);
    if (!existing) {
      const newClient: Client = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        addedAt: new Date().toISOString()
      };
      setClients([...clients, newClient]);
    }
  };

  const createInvoice = (data: any) => {
    const total = newInvoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Date.now()}`,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      amount: total,
      dueDate: data.dueDate,
      status: 'pending',
      items: newInvoiceItems,
      createdAt: new Date().toISOString(),
      notes: data.notes
    };
    setInvoices([...invoices, newInvoice]);
    addOrUpdateClient(data.clientName, data.clientEmail);
    setShowCreateInvoice(false);
    setNewInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
    showToast(`Invoice ${newInvoice.invoiceNumber} created successfully!`, 'success');
  };

  const createQuotation = (data: any) => {
    const total = newQuotationItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const newQuotation: Quotation = {
      id: Date.now().toString(),
      quotationNumber: `QUO-${Date.now()}`,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      amount: total,
      validUntil: data.validUntil,
      status: 'pending',
      items: newQuotationItems,
      createdAt: new Date().toISOString()
    };
    setQuotations([...quotations, newQuotation]);
    addOrUpdateClient(data.clientName, data.clientEmail);
    setShowCreateQuotation(false);
    setNewQuotationItems([{ description: '', quantity: 1, price: 0 }]);
    showToast(`Quotation ${newQuotation.quotationNumber} created successfully!`, 'success');
  };

  const markInvoiceAsPaid = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: 'paid', paidAt: new Date().toISOString() }
        : inv
    ));
  };

  const exportInvoices = () => {
    exportToCSV(invoices, 'invoices', ['invoiceNumber', 'clientName', 'amount', 'status', 'dueDate', 'createdAt']);
  };

  const exportExpenses = () => {
    exportToCSV(expenses, 'expenses', ['date', 'category', 'description', 'amount', 'vendor']);
  };

  const exportClients = () => {
    exportToCSV(clients, 'clients', ['name', 'email', 'phone', 'addedAt']);
  };

  const generateFinancialReport = () => {
    const report = generateTextReport({
      title: 'Financial Report',
      date: new Date().toLocaleDateString(),
      sections: [
        {
          heading: 'Revenue Summary',
          content: `Total Revenue: ${formatCurrency(stats.totalRevenue)}\nMonthly Revenue: ${formatCurrency(stats.monthlyRevenue)}\nGrowth: ${stats.revenueGrowth}%`
        },
        {
          heading: 'Invoices',
          content: `Total Invoices: ${invoices.length}\nPaid: ${invoices.filter(i => i.status === 'paid').length}\nPending: ${invoices.filter(i => i.status === 'pending').length}\nOverdue: ${invoices.filter(i => i.status === 'overdue').length}`
        },
        {
          heading: 'Expenses',
          content: `Total Expenses: ${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}\nTransactions: ${expenses.length}`
        }
      ]
    });
    exportToTXT(report, 'financial-report');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadInvoicePdf = (invoice: Invoice) => {
    downloadInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      customerName: invoice.clientName,
      customerEmail: invoice.clientEmail,
      status: invoice.status,
      currency: 'ZAR',
      amount: invoice.amount,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
      })),
    });
  };

  const handleDownloadQuotationPdf = (quotation: Quotation) => {
    downloadQuotationPdf({
      quotationNumber: quotation.quotationNumber,
      createdAt: quotation.createdAt,
      validUntil: quotation.validUntil,
      customerName: quotation.clientName,
      customerEmail: quotation.clientEmail,
      status: quotation.status,
      currency: 'ZAR',
      amount: quotation.amount,
      items: quotation.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
      })),
    });
  };

  const openMailto = (to: string, subject: string, body: string) => {
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleSendInvoiceEmail = async (invoice: Invoice) => {
    const lineItems = invoice.items
      .map((item) => `- ${item.description} x${item.quantity}: ${formatCurrency(item.quantity * item.price)}`)
      .join('\n');

    const subject = `Invoice ${invoice.invoiceNumber} from Veltrix`;
    const body = [
      `Hi ${invoice.clientName},`,
      '',
      `Please find your invoice ${invoice.invoiceNumber}.`,
      `Amount: ${formatCurrency(invoice.amount)}`,
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      '',
      'Line items:',
      lineItems,
      '',
      'Kind regards,',
      'Veltrix Finance Team',
    ].join('\n');

    setSendingDocumentKey(`invoice-${invoice.id}`);
    try {
      const response = await fetch('/api/finance/send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: invoice.clientEmail,
          subject,
          body,
          documentType: 'invoice',
          documentNumber: invoice.invoiceNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        openMailto(invoice.clientEmail, subject, body);
        showToast(result?.missingConfig?.length
          ? `SMTP not configured (${result.missingConfig.join(', ')}). Opened your email client instead.`
          : `Could not send from server (${result?.message || 'Unknown error'}). Opened your email client instead.`, 'error');
        return;
      }

      showToast(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}.`, 'success');
    } catch {
      openMailto(invoice.clientEmail, subject, body);
      showToast('Could not reach email service. Opened your email client instead.', 'error');
    } finally {
      setSendingDocumentKey(null);
    }
  };

  const handleSendQuotationEmail = async (quotation: Quotation) => {
    const lineItems = quotation.items
      .map((item) => `- ${item.description} x${item.quantity}: ${formatCurrency(item.quantity * item.price)}`)
      .join('\n');

    const subject = `Quotation ${quotation.quotationNumber} from Veltrix`;
    const body = [
      `Hi ${quotation.clientName},`,
      '',
      `Please find your quotation ${quotation.quotationNumber}.`,
      `Amount: ${formatCurrency(quotation.amount)}`,
      `Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`,
      '',
      'Line items:',
      lineItems,
      '',
      'Kind regards,',
      'Veltrix Sales Team',
    ].join('\n');

    setSendingDocumentKey(`quotation-${quotation.id}`);
    try {
      const response = await fetch('/api/finance/send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: quotation.clientEmail,
          subject,
          body,
          documentType: 'quotation',
          documentNumber: quotation.quotationNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        openMailto(quotation.clientEmail, subject, body);
        showToast(result?.missingConfig?.length
          ? `SMTP not configured (${result.missingConfig.join(', ')}). Opened your email client instead.`
          : `Could not send from server (${result?.message || 'Unknown error'}). Opened your email client instead.`, 'error');
        return;
      }

      showToast(`Quotation ${quotation.quotationNumber} sent to ${quotation.clientEmail}.`, 'success');
    } catch {
      openMailto(quotation.clientEmail, subject, body);
      showToast('Could not reach email service. Opened your email client instead.', 'error');
    } finally {
      setSendingDocumentKey(null);
    }
  };

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {isBudgetingMode ? '💰 Personal budget war room.' : '💰 Money control center.'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isBudgetingMode 
            ? 'See spend, cut waste, protect the cushion.'
            : 'See cash in, chase cash due, fix bottlenecks before payroll hits.'}
        </p>
      </div>

      {!isBudgetingMode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">📧 Email Health</h2>
            {emailHealthLoading ? (
              <p className="text-xs text-gray-500 mt-1">Checking SMTP wiring...</p>
            ) : emailHealth?.configured ? (
              <p className="text-xs text-green-600 mt-1">Mail guns are hot. Send from the server without touching Gmail.</p>
            ) : emailHealth ? (
              <p className="text-xs text-red-600 mt-1">
                SMTP missing: {emailHealth.missing.join(', ')}. Patch it or we fall back to manual sends.
              </p>
            ) : (
              <p className="text-xs text-yellow-600 mt-1">Can’t read SMTP right now. Assume manual sending until fixed.</p>
            )}
          </div>
          <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      )}

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {(isBudgetingMode ? [
            { id: 'budget', label: '📊 Budget Overview', icon: '📊' },
            { id: 'income', label: '💵 Income', icon: '💵' },
            { id: 'expenses', label: '💸 Expenses', icon: '💸' },
            { id: 'savings', label: '💰 Savings', icon: '💰' },
            { id: 'reports', label: '📈 Reports', icon: '📈' }
          ] : [
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'revenue', label: '💵 Revenue', icon: '💵' },
            { id: 'invoices', label: '🧾 Invoices', icon: '🧾' },
            { id: 'quotations', label: '📋 Quotations', icon: '📋' },
            { id: 'clients', label: '👥 Clients', icon: '👥' },
            { id: 'expenses', label: '💸 Expenses', icon: '💸' },
            { id: 'reports', label: '📈 Reports', icon: '📈' }
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Budgeting Mode */}
      {isBudgetingMode && activeTab === 'budget' && (
        <>
          {/* Budget Stats*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Monthly Income */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-100">Monthly Income</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(budgetStats.monthlyIncome)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💵</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-400">
                <p className="text-xs text-green-100">After Tax</p>
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-red-100">Monthly Expenses</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(budgetStats.monthlyExpenses)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💸</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-red-400">
                <p className="text-xs text-red-100">{budgetStats.budgetUtilization.toFixed(1)}% of income</p>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-100">Total Savings</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(budgetStats.savings)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💰</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-400">
                <p className="text-xs text-blue-100">{budgetStats.savingsRate.toFixed(1)}% savings rate</p>
              </div>
            </div>

            {/* Budget Health */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-100">Budget Health</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">
                    {budgetStats.budgetUtilization < 70 ? 'Excellent' : budgetStats.budgetUtilization < 90 ? 'Good' : 'Warning'}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">
                  {budgetStats.budgetUtilization < 70 ? '✅' : budgetStats.budgetUtilization < 90 ? '⚠️' : '🚨'}
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-400">
                <p className="text-xs text-purple-100">Financial Status</p>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Expenses</h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                + Add Expense
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-semibold text-gray-700 pb-2">Date</th>
                    <th className="text-left text-sm font-semibold text-gray-700 pb-2">Category</th>
                    <th className="text-left text-sm font-semibold text-gray-700 pb-2">Description</th>
                    <th className="text-right text-sm font-semibold text-gray-700 pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 5).map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100">
                      <td className="text-sm text-gray-600 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="text-sm text-gray-900 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600 py-3">{expense.description}</td>
                      <td className="text-sm font-semibold text-right text-red-600 py-3">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab Content - Business Mode */}
      {!isBudgetingMode && activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-100">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💵</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-400">
                <p className="text-xs text-green-100">All Time</p>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-100">This Month</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">📈</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-400">
                <p className="text-xs text-blue-100">
                  ↗️ +{stats.revenueGrowth}% from last month
                </p>
              </div>
            </div>

            {/* Average Deal Value */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-100">Avg Deal Value</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(stats.averageDealValue)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">💎</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-400">
                <p className="text-xs text-purple-100">{stats.paidInvoices} deals closed</p>
              </div>
            </div>

            {/* Projected Revenue */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-100">Projected</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{formatCurrency(stats.projectedRevenue)}</p>
                </div>
                <div className="text-3xl sm:text-4xl">🎯</div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-400">
                <p className="text-xs text-orange-100">Next 30 days</p>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💡 Performance Insights</h2>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <span className="text-xl sm:text-2xl">🎉</span>
                <div>
                  <p className="font-semibold">Great month! Revenue is up {stats.revenueGrowth}%</p>
                  <p className="text-indigo-100 text-xs sm:text-sm">Keep up the great work closing deals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl sm:text-2xl">💎</span>
                <div>
                  <p className="font-semibold">Average deal value: {formatCurrency(stats.averageDealValue)}</p>
                  <p className="text-indigo-100 text-xs sm:text-sm">Consider upselling to increase this metric</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl sm:text-2xl">🎯</span>
                <div>
                  <p className="font-semibold">On track to hit {formatCurrency(stats.projectedRevenue)} next month</p>
                  <p className="text-indigo-100 text-xs sm:text-sm">Based on your current pipeline velocity</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'revenue' && (
        <>
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Revenue Trend</h2>
            <div className="space-y-3 sm:space-y-4">
              {revenueByMonth.map((month, index) => {
                const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue));
                const percentage = (month.revenue / maxRevenue) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(month.revenue)}</span>
                        <span className="text-gray-500 ml-2 text-xs">({month.invoices} invoices)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'invoices' && (
        <>
          {/* Invoice Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Paid Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{stats.paidInvoices}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pending Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{stats.pendingInvoices}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                  ⏳
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Overdue Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{stats.overdueInvoices}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                  ⚠️
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Quick actions—keep cash moving</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="/dashboard/invoices"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🧾 Open every invoice
              </a>
              <a
                href="/dashboard/invoices?status=pending"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                ⏳ Chase pending
              </a>
              <a
                href="/dashboard/pipelines"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                🎯 Inspect pipeline
              </a>
              <a
                href="/dashboard/analytics"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                📊 Open analytics
              </a>
            </div>
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Expense Tracking</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              + Add Expense
            </button>
          </div>

          {/* Expense Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                R{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {expenses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                R{Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Transaction</div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{expense.vendor || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-red-600 dark:text-red-400">
                      R{expense.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Management</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                <Plus className="h-4 w-4" /> Create Invoice
              </button>
              <button
                onClick={exportInvoices}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          {/* Invoice Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Invoices</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invoices.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Paid</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {invoices.filter(i => i.status === 'paid').length}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {invoices.filter(i => i.status === 'pending').length}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overdue</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {invoices.filter(i => i.status === 'overdue').length}
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🧾</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Invoices haven’t gone out.</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Fire the first invoice so money starts moving.</p>
                <button
                  onClick={() => setShowCreateInvoice(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Create invoice now
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{invoice.clientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.clientEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}>
                          {invoice.status === 'paid' ? '✅ Paid' : invoice.status === 'pending' ? '⏳ Pending' : '⚠️ Overdue'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'pending' && (
                            <button
                              onClick={() => {
                                markInvoiceAsPaid(invoice.id);
                                showToast(`Invoice ${invoice.invoiceNumber} marked as paid!`, 'success');
                              }}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            disabled={sendingDocumentKey === `invoice-${invoice.id}`}
                            onClick={() => handleSendInvoiceEmail(invoice)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send Invoice"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoicePdf(invoice)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quotation Management</h3>
            <button
              onClick={() => setShowCreateQuotation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Quotation
            </button>
          </div>

          {/* Quotation Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Quotations</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quotations.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accepted</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {quotations.filter(q => q.status === 'accepted').length}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {quotations.filter(q => q.status === 'pending').length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Declined</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {quotations.filter(q => q.status === 'declined').length}
              </div>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {quotations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quotes in flight.</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Send a price anchor before the lead cools off.</p>
                <button
                  onClick={() => setShowCreateQuotation(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Create quote now
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quote #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valid Until</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {quotations.map(quotation => (
                    <tr key={quotation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {quotation.quotationNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{quotation.clientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{quotation.clientEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(quotation.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          quotation.status === 'accepted' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          quotation.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {quotation.status === 'accepted' ? '✅ Accepted' : quotation.status === 'pending' ? '⏳ Pending' : '❌ Declined'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={sendingDocumentKey === `quotation-${quotation.id}`}
                            onClick={() => handleSendQuotationEmail(quotation)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send Quotation"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadQuotationPdf(quotation)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Client Management</h3>
            <button
              onClick={exportClients}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" /> Export Clients
            </button>
          </div>

          {/* Client Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Clients</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{clients.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Invoiced</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg per Client</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {clients.length > 0 ? formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0) / clients.length) : formatCurrency(0)}
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {clients.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clients logged.</h3>
                <p className="text-gray-600 dark:text-gray-400">Create an invoice or quote and we’ll capture the buyer instantly.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Added</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoices</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Billed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clients.map(client => {
                    const clientInvoices = invoices.filter(i => i.clientEmail === client.email);
                    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                    
                    return (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {client.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {client.phone || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(client.addedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                          {clientInvoices.length}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(totalBilled)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Financial Reports & Exports</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" /> Export Data
              </h4>
              <div className="space-y-3">
                <button
                  onClick={exportInvoices}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Export Invoices</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{invoices.length} invoices</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                
                <button
                  onClick={exportExpenses}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Export Expenses</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{expenses.length} transactions</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                </button>
                
                <button
                  onClick={exportClients}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Export Clients</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{clients.length} clients</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </button>
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" /> Generate Reports
              </h4>
              <div className="space-y-3">
                <button
                  onClick={generateFinancialReport}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Full Financial Report</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Revenue, invoices & expenses</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                </button>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 <strong>Tip:</strong> Reports are generated in TXT format for easy sharing. CSV exports contain detailed data for spreadsheet analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Quick Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Invoices</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Expense Records</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{quotations.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Quotations Sent</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" /> Create Invoice
              </h3>
              <button
                onClick={() => {
                  setShowCreateInvoice(false);
                  setNewInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createInvoice({
                  clientName: formData.get('clientName'),
                  clientEmail: formData.get('clientEmail'),
                  dueDate: formData.get('dueDate'),
                  notes: formData.get('notes')
                });
              }}
              className="space-y-6"
            >
              {/* Client Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Email *</label>
                    <input
                      type="email"
                      name="clientEmail"
                      required
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Line Items</h4>
                  <button
                    type="button"
                    onClick={() => setNewInvoiceItems([...newInvoiceItems, { description: '', quantity: 1, price: 0 }])}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="text-left text-xs font-medium text-gray-600 dark:text-gray-400 pb-2">Description</th>
                        <th className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-20">Qty</th>
                        <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-28">Price</th>
                        <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-28">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newInvoiceItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-600">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...newInvoiceItems];
                                updated[idx].description = e.target.value;
                                setNewInvoiceItems(updated);
                              }}
                              placeholder="Item description"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...newInvoiceItems];
                                updated[idx].quantity = parseInt(e.target.value) || 1;
                                setNewInvoiceItems(updated);
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...newInvoiceItems];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setNewInvoiceItems(updated);
                              }}
                              className="w-full px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-1 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                          <td className="py-2 pl-1">
                            {newInvoiceItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewInvoiceItems(newInvoiceItems.filter((_, i) => i !== idx))}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Amount:</td>
                        <td className="pt-3 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(newInvoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Payment terms, thank you message, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateInvoice(false);
                    setNewInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateQuotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" /> Create Quotation
              </h3>
              <button
                onClick={() => {
                  setShowCreateQuotation(false);
                  setNewQuotationItems([{ description: '', quantity: 1, price: 0 }]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createQuotation({
                  clientName: formData.get('clientName'),
                  clientEmail: formData.get('clientEmail'),
                  validUntil: formData.get('validUntil')
                });
              }}
              className="space-y-6"
            >
              {/* Client Information */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Email *</label>
                    <input
                      type="email"
                      name="clientEmail"
                      required
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until *</label>
                <input
                  type="date"
                  name="validUntil"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Line Items</h4>
                  <button
                    type="button"
                    onClick={() => setNewQuotationItems([...newQuotationItems, { description: '', quantity: 1, price: 0 }])}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600">
                        <th className="text-left text-xs font-medium text-gray-600 dark:text-gray-400 pb-2">Description</th>
                        <th className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-20">Qty</th>
                        <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-28">Price</th>
                        <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-2 w-28">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newQuotationItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-600">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...newQuotationItems];
                                updated[idx].description = e.target.value;
                                setNewQuotationItems(updated);
                              }}
                              placeholder="Item description"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...newQuotationItems];
                                updated[idx].quantity = parseInt(e.target.value) || 1;
                                setNewQuotationItems(updated);
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...newQuotationItems];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setNewQuotationItems(updated);
                              }}
                              className="w-full px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="py-2 px-1 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                          <td className="py-2 pl-1">
                            {newQuotationItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewQuotationItems(newQuotationItems.filter((_, i) => i !== idx))}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Amount:</td>
                        <td className="pt-3 text-right text-lg font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(newQuotationItems.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateQuotation(false);
                    setNewQuotationItems([{ description: '', quantity: 1, price: 0 }]);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium transition-all"
                >
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>Marketing</option>
                  <option>Software</option>
                  <option>Office</option>
                  <option>Travel</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="What was this expense for?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (R)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor (Optional)</label>
                <input
                  type="text"
                  placeholder="Who did you pay?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Save expense to localStorage or API
                  setShowAddExpense(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
