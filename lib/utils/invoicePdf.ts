import { jsPDF } from 'jspdf';

export interface InvoicePdfItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePdfData {
  invoiceNumber: string;
  createdAt: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  status: string;
  currency: string;
  amount: number;
  items: InvoicePdfItem[];
}

export interface QuotationPdfData {
  quotationNumber: string;
  createdAt: string;
  validUntil: string;
  customerName: string;
  customerEmail: string;
  status: string;
  currency: string;
  amount: number;
  items: InvoicePdfItem[];
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency || 'ZAR',
  }).format(amount);

function renderDocumentPdf(options: {
  documentTitle: 'INVOICE' | 'QUOTATION';
  numberLabel: string;
  numberValue: string;
  dateLabel: string;
  dateValue: string;
  dueLabel: string;
  dueValue: string;
  status: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  amount: number;
  items: InvoicePdfItem[];
  filename: string;
}) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(options.documentTitle, 14, 18);

  doc.setFontSize(11);
  doc.text(`${options.numberLabel}: ${options.numberValue}`, 14, 28);
  doc.text(`${options.dateLabel}: ${new Date(options.dateValue).toLocaleDateString()}`, 14, 34);
  doc.text(`${options.dueLabel}: ${new Date(options.dueValue).toLocaleDateString()}`, 14, 40);
  doc.text(`Status: ${options.status}`, 14, 46);

  doc.text(`Customer: ${options.customerName}`, 120, 28);
  doc.text(`Email: ${options.customerEmail}`, 120, 34);

  let y = 58;
  doc.setFontSize(10);
  doc.text('Description', 14, y);
  doc.text('Qty', 120, y);
  doc.text('Unit', 140, y);
  doc.text('Total', 170, y);
  y += 4;
  doc.line(14, y, 196, y);

  y += 6;
  options.items.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(item.description.slice(0, 50), 14, y);
    doc.text(String(item.quantity), 120, y);
    doc.text(formatCurrency(item.unitPrice, options.currency), 140, y, { align: 'left' });
    doc.text(formatCurrency(item.total, options.currency), 170, y, { align: 'left' });
    y += 7;
  });

  y += 2;
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(options.amount, options.currency)}`, 14, y);

  doc.save(options.filename);
}

export function downloadInvoicePdf(invoice: InvoicePdfData): void {
  const filename = `${invoice.invoiceNumber.replace(/[^a-z0-9-]/gi, '_')}.pdf`;
  renderDocumentPdf({
    documentTitle: 'INVOICE',
    numberLabel: 'Invoice',
    numberValue: invoice.invoiceNumber,
    dateLabel: 'Created',
    dateValue: invoice.createdAt,
    dueLabel: 'Due',
    dueValue: invoice.dueDate,
    status: invoice.status,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    currency: invoice.currency,
    amount: invoice.amount,
    items: invoice.items,
    filename,
  });
}

export function downloadQuotationPdf(quotation: QuotationPdfData): void {
  const filename = `${quotation.quotationNumber.replace(/[^a-z0-9-]/gi, '_')}.pdf`;
  renderDocumentPdf({
    documentTitle: 'QUOTATION',
    numberLabel: 'Quotation',
    numberValue: quotation.quotationNumber,
    dateLabel: 'Created',
    dateValue: quotation.createdAt,
    dueLabel: 'Valid Until',
    dueValue: quotation.validUntil,
    status: quotation.status,
    customerName: quotation.customerName,
    customerEmail: quotation.customerEmail,
    currency: quotation.currency,
    amount: quotation.amount,
    items: quotation.items,
    filename,
  });
}
