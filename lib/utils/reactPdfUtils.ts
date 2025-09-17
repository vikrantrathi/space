import React from 'react';
import { pdf, Document } from '@react-pdf/renderer';
import { QuotationPDFDocument } from './reactPdfExport';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

interface CompanyDetails {
  name: string;
  tagline?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
}

interface ReactPDFOptions {
  quotation: IQuotation;
  companyDetails: CompanyDetails;
  standardContent?: IStandardContent;
  quotationUrl: string;
}

export const generateQuotationPDF = async (options: ReactPDFOptions) => {
  const { quotation, companyDetails, standardContent, quotationUrl } = options;
  
  try {
    console.log('Starting complex PDF generation...');
    console.log('Quotation data:', quotation);
    console.log('Company details:', companyDetails);
    
          // Generate PDF blob
          console.log('Creating PDF document...');
          const doc = React.createElement(QuotationPDFDocument, {
            quotation,
            companyDetails,
            standardContent,
            quotationUrl
          });
          console.log('PDF document created successfully');

          console.log('Converting to blob...');
          // @ts-expect-error - TypeScript type issue with @react-pdf/renderer
          const blob = await pdf(doc).toBlob();
    console.log('PDF blob generated successfully:', blob);
    console.log('Blob size:', blob.size, 'bytes');
    
    return blob;
  } catch (error: unknown) {
    console.error('PDF Generation Error:', error);
    console.error('Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack
    });
    throw error;
  }
};

export const downloadQuotationPDF = async (options: ReactPDFOptions) => {
  try {
    const blob = await generateQuotationPDF(options);
    const fileName = `quotation-${options.quotation.title?.replace(/\s+/g, '-').toLowerCase() || 'quotation'}.pdf`;
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
};
