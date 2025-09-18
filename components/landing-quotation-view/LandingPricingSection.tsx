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

interface LandingPricingSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  formatCurrency: (amount: number, currency: string) => string;
  isDark?: boolean;
}

const LandingPricingSection: React.FC<LandingPricingSectionProps> = ({
  quotation,
  standardContent,
  formatCurrency,
  isDark = false
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
            fontSize: '16px', 
            color: 'var(--ant-color-text)',
            marginBottom: record.description ? '6px' : '0'
          }}>
            {text}
          </div>
          {record.description && (
            <div style={{ 
              fontSize: '14px', 
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
        <Text strong style={{ fontSize: '15px' }}>{qty}</Text>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      width: 120,
      render: (price: number) => (
        <Text style={{ fontSize: '15px' }}>
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
          fontSize: '14px',
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
          fontSize: '14px',
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
          fontSize: '16px', 
          color: 'var(--ant-color-primary)'
        }}>
          {formatCurrency(total, quotation.currency || 'USD')}
        </Text>
      ),
    },
  ];

  return (
    <div style={{
      padding: 'clamp(40px, 6vw, 60px) 20px',
      background: isDark ? '#0f0f23' : '#f8fafc'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={2} style={{
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: '700',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: isDark ? '#ffffff' : '#1a202c'
          }}>
            Pricing & Investment
          </Title>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '0 auto',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }} />
        </div>

        <Row gutter={[32, 32]}>
          {/* Pricing Table */}
          {quotation.quantityPricing && quotation.quantityPricing.length > 0 && (
            <Col xs={24}>
              <Card 
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '30px',
                  color: 'white',
                  margin: '-24px -24px 24px -24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <DollarOutlined style={{ fontSize: '24px' }} />
                    <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                      Pricing Details
                    </Title>
                  </div>
                </div>
                
                <div style={{ padding: '0 24px 24px 24px' }}>
                  {companyDetails.pricingDescription && (
                    <div style={{
                      background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                      padding: '20px',
                      borderRadius: '16px',
                      marginBottom: '30px',
                      border: isDark ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid rgba(102, 126, 234, 0.1)',
                      textAlign: 'center'
                    }}>
                      <Paragraph style={{ 
                        margin: 0, 
                        fontStyle: 'italic', 
                        fontSize: '16px',
                        color: isDark ? '#cbd5e0' : '#4a5568',
                        lineHeight: '1.6',
                        fontWeight: '500'
                      }}>
                        {companyDetails.pricingDescription}
                      </Paragraph>
                    </div>
                  )}
                  
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={pricingColumns}
                      dataSource={quotation.quantityPricing.map((row, index: number) => ({ 
                        ...row, 
                        key: `${row.item}-${index}` 
                      }))}
                      pagination={false}
                      size="middle"
                      style={{
                        minWidth: '600px'
                      }}
                      className={isDark ? 'dark-table' : ''}
                    />
                  </div>
                  
                  {/* Pricing Summary */}
                  {pricingTotals && (
                    <div style={{ 
                      marginTop: '40px', 
                      padding: '40px', 
                      background: isDark ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: '20px',
                      border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0'
                    }}>
                      <Title level={4} style={{ 
                        textAlign: 'center', 
                        marginBottom: '30px',
                        color: isDark ? '#ffffff' : '#1a202c',
                        fontSize: '20px'
                      }}>
                        Investment Summary
                      </Title>
                      <Row gutter={[24, 24]}>
                        <Col xs={12} sm={6}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '20px',
                            background: isDark ? '#1a1a2e' : 'white',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ 
                              fontSize: '32px', 
                              fontWeight: 700, 
                              color: '#667eea',
                              marginBottom: '8px'
                            }}>
                              {pricingTotals.itemsCount}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: isDark ? '#a0aec0' : '#718096',
                              fontWeight: 600
                            }}>
                              Total Items
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '20px',
                            background: isDark ? '#1a1a2e' : 'white',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ 
                              fontSize: '28px', 
                              fontWeight: 700, 
                              color: '#10b981',
                              marginBottom: '8px'
                            }}>
                              {formatCurrency(pricingTotals.subtotal, quotation.currency || 'USD')}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: isDark ? '#a0aec0' : '#718096',
                              fontWeight: 600
                            }}>
                              Subtotal
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '20px',
                            background: isDark ? '#1a1a2e' : 'white',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ 
                              fontSize: '28px', 
                              fontWeight: 700, 
                              color: '#f59e0b',
                              marginBottom: '8px'
                            }}>
                              {formatCurrency(pricingTotals.totalTax, quotation.currency || 'USD')}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: isDark ? '#a0aec0' : '#718096',
                              fontWeight: 600
                            }}>
                              Total Tax
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                            color: 'white'
                          }}>
                            <div style={{ 
                              fontSize: '32px', 
                              fontWeight: 700, 
                              color: 'white',
                              marginBottom: '8px'
                            }}>
                              {formatCurrency(pricingTotals.grandTotal, quotation.currency || 'USD')}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: 'rgba(255,255,255,0.8)',
                              fontWeight: 600
                            }}>
                              Grand Total
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          )}

          {/* Payment Terms */}
          <Col xs={24}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                background: isDark ? '#1a1a2e' : 'white',
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <CreditCardOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Payment Terms
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                <div>
                  <Title level={4} style={{ 
                    marginBottom: '30px', 
                    color: isDark ? '#ffffff' : '#1a202c',
                    fontSize: '24px',
                    textAlign: 'center'
                  }}>
                    Payment Information
                  </Title>
                  <Row gutter={[24, 24]} justify="center">
                    <Col xs={24} sm={8} md={6}>
                      <div style={{
                        padding: '24px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                      }}
                      >
                        <Text strong style={{ fontSize: '18px', color: isDark ? '#ffffff' : '#1a202c', display: 'block', marginBottom: '12px' }}>Payment Terms</Text>
                        <Text style={{ fontSize: '16px', color: isDark ? '#cbd5e0' : '#4a5568', lineHeight: '1.5' }}>
                          {quotation.paymentTerms || 'Standard payment terms apply'}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <div style={{
                        padding: '24px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                      }}
                      >
                        <Text strong style={{ fontSize: '18px', color: isDark ? '#ffffff' : '#1a202c', display: 'block', marginBottom: '12px' }}>Currency</Text>
                        <Text style={{ fontSize: '16px', color: isDark ? '#cbd5e0' : '#4a5568', lineHeight: '1.5' }}>
                          {quotation.currency || 'USD'}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <div style={{
                        padding: '24px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                      }}
                      >
                        <Text strong style={{ fontSize: '18px', color: isDark ? '#ffffff' : '#1a202c', display: 'block', marginBottom: '12px' }}>Quotation Validity</Text>
                        <Text style={{ fontSize: '16px', color: isDark ? '#cbd5e0' : '#4a5568', lineHeight: '1.5' }}>
                          {validityDays ? `${validityDays} days` : 'Not specified'}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Section Separator */}
      <div style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
        margin: '60px 0 0 0'
      }} />
    </div>
  );
};

export default LandingPricingSection;

