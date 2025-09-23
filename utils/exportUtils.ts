/**
 * Utility functions for exporting data to CSV format
 */

export interface ExportableData {
  [key: string]: any;
}

export interface ExportColumn {
  key: string;
  title: string;
  render?: (value: any, record: any) => string;
}

/**
 * Convert data to CSV format
 */
export const convertToCSV = (
  data: ExportableData[],
  columns: ExportColumn[],
  filename: string = 'export.csv'
): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create CSV headers
  const headers = columns.map(col => `"${col.title}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(record => {
    return columns.map(col => {
      let value = record[col.key];
      
      // Apply custom render function if provided
      if (col.render) {
        value = col.render(value, record);
      }
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        value = value ? 'Yes' : 'No';
      } else {
        value = String(value);
      }
      
      // Escape quotes and wrap in quotes
      value = value.toString().replace(/"/g, '""');
      return `"${value}"`;
    }).join(',');
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export quotations data
 */
export const exportQuotations = (quotations: any[], filename?: string) => {
  const columns: ExportColumn[] = [
    { key: 'quotationNumber', title: 'Quotation Number' },
    { key: 'clientName', title: 'Client Name' },
    { key: 'clientEmail', title: 'Client Email' },
    { key: 'status', title: 'Status' },
    { key: 'totalAmount', title: 'Total Amount' },
    { key: 'createdAt', title: 'Created Date' },
    { key: 'validUntil', title: 'Valid Until' },
  ];

  convertToCSV(quotations, columns, filename || `quotations_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export users data
 */
export const exportUsers = (users: any[], filename?: string) => {
  const columns: ExportColumn[] = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
    { key: 'status', title: 'Status' },
    { key: 'isApproved', title: 'Approved', render: (value) => value ? 'Yes' : 'No' },
    { key: 'emailVerified', title: 'Email Verified', render: (value) => value ? 'Yes' : 'No' },
    { key: 'createdAt', title: 'Created Date' },
    { key: 'lastLoginAt', title: 'Last Login' },
  ];

  convertToCSV(users, columns, filename || `users_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export activities data
 */
export const exportActivities = (activities: any[], filename?: string) => {
  const columns: ExportColumn[] = [
    { key: 'type', title: 'Activity Type' },
    { key: 'description', title: 'Description' },
    { key: 'userEmail', title: 'User Email' },
    { key: 'ipAddress', title: 'IP Address' },
    { key: 'userAgent', title: 'User Agent' },
    { key: 'createdAt', title: 'Date' },
  ];

  convertToCSV(activities, columns, filename || `activities_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Generic export function for any data
 */
export const exportData = (
  data: ExportableData[],
  columns: ExportColumn[],
  filename: string = 'export.csv'
) => {
  convertToCSV(data, columns, filename);
};
