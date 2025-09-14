'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Table,
  Space,
  Progress
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

interface CompanyDetails {
  name?: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  pricingDescription?: string;
}

const { Title, Text, Paragraph } = Typography;

interface PricingTimelineTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  formatCurrency: (amount: number, currency: string) => string;
}

const PricingTimelineTab: React.FC<PricingTimelineTabProps> = ({
  quotation,
  standardContent,
  formatCurrency
}) => {
  // Get validity days from quotationValidity field or calculate from dates
  const getValidityDays = () => {
    // First try to use the quotationValidity field
    if (quotation.quotationValidity) {
      return quotation.quotationValidity;
    }
    
    // Fallback to calculating from quotation date and expiration date
    if (quotation.quotationDate && quotation.expirationDate) {
      const timeDiff = quotation.expirationDate.getTime() - quotation.quotationDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
    }
    
    return null;
  };

  const validityDays = getValidityDays();

  // Calculate pricing totals
  const pricingTotals = React.useMemo(() => {
    if (!quotation.quantityPricing?.length) return null;
    
    const totals = quotation.quantityPricing.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discountPct = Number(item.discountPercentage) || 0;
      const taxPct = Number(item.taxPercentage) || 0;
      const discountedPrice = price * (1 - discountPct / 100);
      const subtotal = quantity * discountedPrice;
      const taxAmount = subtotal * (taxPct / 100);
      const total = subtotal + taxAmount;

      return {
        subtotal: acc.subtotal + subtotal,
        totalTax: acc.totalTax + taxAmount,
        totalDiscount: acc.totalDiscount + (quantity * price - subtotal),
        grandTotal: acc.grandTotal + total,
        itemsCount: acc.itemsCount + 1
      };
    }, { subtotal: 0, totalTax: 0, totalDiscount: 0, grandTotal: 0, itemsCount: 0 });

    return totals;
  }, [quotation.quantityPricing]);

  // Get company details for descriptions
  const companyDetails: CompanyDetails = quotation.companyDetails || standardContent?.companyDetails || {};

  const pricingColumns = [
    {
      title: 'Item Description',
      dataIndex: 'item',
      key: 'item',
      render: (text: string, record: NonNullable<typeof quotation.quantityPricing>[0]) => (
        <div>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '15px', 
            color: 'var(--ant-color-text)',
            marginBottom: record.description ? '4px' : '0'
          }}>
            {text}
          </div>
          {record.description && (
            <div style={{ 
              fontSize: '13px', 
              color: 'var(--ant-color-text-secondary)', 
              lineHeight: '1.4'
            }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      width: 80,
      render: (qty: number) => (
        <Text strong style={{ fontSize: '14px' }}>{qty}</Text>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      width: 120,
      render: (price: number) => (
        <Text style={{ fontSize: '14px' }}>
          {formatCurrency(price, quotation.currency || 'USD')}
        </Text>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      align: 'center' as const,
      width: 100,
      render: (discount: number) => (
        <Text style={{ 
          fontSize: '13px',
          color: discount ? 'var(--ant-color-success)' : 'var(--ant-color-text-secondary)'
        }}>
          {discount ? `${discount}%` : '-'}
        </Text>
      ),
    },
    {
      title: 'Tax',
      key: 'tax',
      align: 'center' as const,
      width: 100,
      render: (record: NonNullable<typeof quotation.quantityPricing>[0]) => (
        <Text style={{ 
          fontSize: '13px',
          color: record.taxPercentage ? 'var(--ant-color-warning)' : 'var(--ant-color-text-secondary)'
        }}>
          {record.taxPercentage ? `${record.taxPercentage}%` : '-'}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      width: 120,
      render: (total: number) => (
        <Text strong style={{ 
          fontSize: '15px', 
          color: 'var(--ant-color-primary)'
        }}>
          {formatCurrency(total, quotation.currency || 'USD')}
        </Text>
      ),
    },
  ];

  return (
    <Row gutter={[24, 24]}>
      {/* Pricing Table */}
      {quotation.quantityPricing && quotation.quantityPricing.length > 0 && (
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <DollarOutlined />
                Pricing Details
              </Space>
            } 
            style={{
              borderRadius: '12px',
              background: 'var(--ant-color-bg-container)',
              border: '1px solid var(--ant-color-border)'
            }}
          >
            {companyDetails.pricingDescription && (
              <Paragraph style={{ marginBottom: '16px', fontStyle: 'italic' }}>
                {companyDetails.pricingDescription}
              </Paragraph>
            )}
            <Table
              columns={pricingColumns}
              dataSource={quotation.quantityPricing.map((row, index: number) => ({ 
                ...row, 
                key: `${row.item}-${index}` 
              }))}
              pagination={false}
              size="middle"
            />
            
            {/* Pricing Summary */}
            {pricingTotals && (
              <div style={{ 
                marginTop: '24px', 
                padding: '24px', 
                background: 'var(--ant-color-fill-quaternary)',
                borderRadius: '12px',
                border: '1px solid var(--ant-color-border)'
              }}>
                <Row gutter={[24, 16]}>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 700, 
                        color: 'var(--ant-color-primary)',
                        marginBottom: '4px'
                      }}>
                        {pricingTotals.itemsCount}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--ant-color-text-secondary)',
                        fontWeight: 500
                      }}>
                        Total Items
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 600, 
                        color: 'var(--ant-color-success)',
                        marginBottom: '4px'
                      }}>
                        {formatCurrency(pricingTotals.subtotal, quotation.currency || 'USD')}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--ant-color-text-secondary)',
                        fontWeight: 500
                      }}>
                        Subtotal
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 600, 
                        color: 'var(--ant-color-warning)',
                        marginBottom: '4px'
                      }}>
                        {formatCurrency(pricingTotals.totalTax, quotation.currency || 'USD')}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--ant-color-text-secondary)',
                        fontWeight: 500
                      }}>
                        Total Tax
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '28px', 
                        fontWeight: 700, 
                        color: 'var(--ant-color-error)',
                        marginBottom: '4px'
                      }}>
                        {formatCurrency(pricingTotals.grandTotal, quotation.currency || 'USD')}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--ant-color-text-secondary)',
                        fontWeight: 500
                      }}>
                        Grand Total
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>
      )}

      {/* Payment Terms */}
      <Col xs={24}>
        <Card 
          title={
            <Space>
              <CreditCardOutlined />
              Payment Terms
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)'
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <div>
                <Title level={5} style={{ marginBottom: '12px', color: 'var(--ant-color-text)' }}>
                  Payment Information
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Payment Terms:</Text>
                    <br />
                    <Text style={{ fontSize: '14px', color: 'var(--ant-color-text-secondary)' }}>
                      {quotation.paymentTerms || 'Standard payment terms apply'}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Currency:</Text>
                    <br />
                    <Text style={{ fontSize: '14px', color: 'var(--ant-color-text-secondary)' }}>
                      {quotation.currency || 'USD'}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Quotation Validity:</Text>
                    <br />
                    <Text style={{ fontSize: '14px', color: 'var(--ant-color-text-secondary)' }}>
                      {validityDays ? `${validityDays} days` : 'Not specified'}
                    </Text>
                  </div>
                </Space>
              </div>
            </Col>
            
            {/* Payment Milestones */}
            {quotation.paymentMilestones && quotation.paymentMilestones.length > 0 && (
              <Col xs={24} lg={12}>
                <div>
                  <Title level={5} style={{ marginBottom: '12px', color: 'var(--ant-color-text)' }}>
                    Payment Milestones
                  </Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {quotation.paymentMilestones.map((milestone, index) => (
                      <div key={index} style={{ 
                        padding: '16px',
                        background: 'var(--ant-color-fill-quaternary)',
                        borderRadius: '8px',
                        border: '1px solid var(--ant-color-border)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '14px' }}>{milestone.milestone}</Text>
                          <Text strong style={{ color: 'var(--ant-color-primary)', fontSize: '14px' }}>
                            {formatCurrency(Number(milestone.amount) || 0, quotation.currency || 'USD')}
                          </Text>
                        </div>
                        <Progress 
                          percent={milestone.percentage} 
                          size="small" 
                          strokeColor="var(--ant-color-primary)"
                        />
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          Due: {milestone.dueDate.toLocaleDateString()}
                        </Text>
                      </div>
                    ))}
                  </Space>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default PricingTimelineTab;
