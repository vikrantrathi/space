import { sendEmailTemplate } from './email';
import { IQuotation } from '../db/models/Quotation';

interface QuotationEmailData {
  quotation: IQuotation;
  clientName: string;
  clientEmail: string;
  action: 'sent' | 'accepted' | 'rejected' | 'revision_requested' | 'revision_sent';
  reason?: string;
  quotationLink?: string;
}

export class QuotationEmailService {
  private static getCompanyDetails(quotation: IQuotation) {
    return {
      name: quotation.companyDetails?.name || 'Startupzila',
      email: quotation.companyDetails?.email || 'contact@startupzila.com',
    };
  }

  private static getQuotationDetails(quotation: IQuotation) {
    const totalAmount = quotation.quantityPricing?.reduce((sum, item) => sum + item.total, 0) || 0;
    const currency = quotation.currency || 'USD';
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    
    return {
      title: quotation.title,
      number: quotation.quotationNo || 'N/A',
      validUntil: quotation.expirationDate 
        ? new Date(quotation.expirationDate).toLocaleDateString()
        : 'N/A',
      totalAmount: `${currencySymbol}${totalAmount.toLocaleString()}`,
    };
  }

  private static getQuotationLink(quotation: IQuotation): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/quotation/${quotation._id}`;
  }

  static async sendQuotationSentEmail(data: QuotationEmailData): Promise<boolean> {
    try {
      const company = this.getCompanyDetails(data.quotation);
      const quotationDetails = this.getQuotationDetails(data.quotation);
      const quotationLink = this.getQuotationLink(data.quotation);

      const templateData = {
        clientName: data.clientName,
        quotationTitle: quotationDetails.title,
        quotationNumber: quotationDetails.number,
        validUntil: quotationDetails.validUntil,
        totalAmount: quotationDetails.totalAmount,
        quotationLink,
        companyName: company.name,
      };

      await sendEmailTemplate({
        to: data.clientEmail,
        templateType: 'quotation_sent',
        variables: templateData,
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation sent email:', error);
      return false;
    }
  }

  static async sendQuotationAcceptedEmail(data: QuotationEmailData): Promise<boolean> {
    try {
      const company = this.getCompanyDetails(data.quotation);
      const quotationDetails = this.getQuotationDetails(data.quotation);

      const templateData = {
        clientName: data.clientName,
        quotationTitle: quotationDetails.title,
        quotationNumber: quotationDetails.number,
        totalAmount: quotationDetails.totalAmount,
        companyName: company.name,
      };

      await sendEmailTemplate({
        to: data.clientEmail,
        templateType: 'quotation_accepted',
        variables: templateData,
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation accepted email:', error);
      return false;
    }
  }

  static async sendQuotationRejectedEmail(data: QuotationEmailData): Promise<boolean> {
    try {
      const company = this.getCompanyDetails(data.quotation);
      const quotationDetails = this.getQuotationDetails(data.quotation);

      const templateData = {
        clientName: data.clientName,
        quotationTitle: quotationDetails.title,
        rejectionReason: data.reason || 'No reason provided',
        companyEmail: company.email,
        companyName: company.name,
      };

      await sendEmailTemplate({
        to: data.clientEmail,
        templateType: 'quotation_rejected',
        variables: templateData,
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation rejected email:', error);
      return false;
    }
  }

  static async sendQuotationRevisionRequestedEmail(data: QuotationEmailData): Promise<boolean> {
    try {
      const company = this.getCompanyDetails(data.quotation);
      const quotationDetails = this.getQuotationDetails(data.quotation);

      const templateData = {
        clientName: data.clientName,
        quotationTitle: quotationDetails.title,
        revisionReason: data.reason || 'No reason provided',
        companyEmail: company.email,
        companyName: company.name,
      };

      await sendEmailTemplate({
        to: data.clientEmail,
        templateType: 'quotation_revision_requested',
        variables: templateData,
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation revision requested email:', error);
      return false;
    }
  }

  static async sendQuotationRevisionSentEmail(data: QuotationEmailData): Promise<boolean> {
    try {
      const company = this.getCompanyDetails(data.quotation);
      const quotationDetails = this.getQuotationDetails(data.quotation);
      const quotationLink = this.getQuotationLink(data.quotation);

      const templateData = {
        clientName: data.clientName,
        quotationTitle: quotationDetails.title,
        quotationNumber: quotationDetails.number,
        validUntil: quotationDetails.validUntil,
        totalAmount: quotationDetails.totalAmount,
        quotationLink,
        companyName: company.name,
      };

      await sendEmailTemplate({
        to: data.clientEmail,
        templateType: 'quotation_revision_sent',
        variables: templateData,
      });

      return true;
    } catch (error) {
      console.error('Failed to send quotation revision sent email:', error);
      return false;
    }
  }

  static async sendQuotationActionEmail(data: QuotationEmailData): Promise<boolean> {
    switch (data.action) {
      case 'sent':
        return this.sendQuotationSentEmail(data);
      case 'accepted':
        return this.sendQuotationAcceptedEmail(data);
      case 'rejected':
        return this.sendQuotationRejectedEmail(data);
      case 'revision_requested':
        return this.sendQuotationRevisionRequestedEmail(data);
      case 'revision_sent':
        return this.sendQuotationRevisionSentEmail(data);
      default:
        console.error('Unknown quotation action:', data.action);
        return false;
    }
  }
}
