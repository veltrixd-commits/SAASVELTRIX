// Export utilities for downloading data in various formats

export type ExportFormat = 'csv' | 'json' | 'txt';

export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: string[]
) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = columns || Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

export const exportToJSON = <T>(data: T, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

export const exportToTXT = (content: string, filename: string) => {
  downloadFile(content, `${filename}.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTableToCSV = (tableId: string, filename: string) => {
  const table = document.getElementById(tableId) as HTMLTableElement;
  if (!table) {
    alert('Table not found');
    return;
  }

  const rows = Array.from(table.rows);
  const csvContent = rows.map(row =>
    Array.from(row.cells).map(cell => {
      const text = cell.textContent || '';
      if (text.includes(',') || text.includes('"')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    }).join(',')
  ).join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Generate report summaries
export const generateTextReport = (data: {
  title: string;
  date: string;
  sections: Array<{ heading: string; content: string }>;
}): string => {
  let report = `${data.title}\n`;
  report += `Generated: ${data.date}\n`;
  report += '='.repeat(50) + '\n\n';

  data.sections.forEach(section => {
    report += `${section.heading}\n`;
    report += '-'.repeat(section.heading.length) + '\n';
    report += `${section.content}\n\n`;
  });

  return report;
};

// Print functionality
export const printContent = (contentId: string) => {
  const content = document.getElementById(contentId);
  if (!content) {
    alert('Content not found');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
