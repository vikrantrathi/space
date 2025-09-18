'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Button
} from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Paragraph, Text } = Typography;

interface LandingQuotationHeroProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorBgContainer: string;
  };
  formatCurrency?: (amount: number, currency: string) => string;
  getStatusColor?: (status: string) => string;
  isDark?: boolean;
}

const LandingQuotationHero: React.FC<LandingQuotationHeroProps> = ({
  quotation,
  standardContent,
  theme,
  formatCurrency,
  getStatusColor,
  isDark = false
}) => {
  // Calculate total amount
  const totalAmount = quotation.quantityPricing?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  
  // Format currency function
  const formatCurrencyValue = (amount: number, currency: string = 'USD') => {
    if (formatCurrency) return formatCurrency(amount, currency);
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status color
  const getStatusColorValue = (status: string) => {
    if (getStatusColor) return getStatusColor(status);
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'revision': return 'blue';
      default: return 'blue';
    }
  };

  return (
    <div style={{
      background: isDark 
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(60px, 10vw, 100px) 0'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        <Row align="middle" gutter={[48, 48]}>
          <Col xs={24} lg={14}>
            <div style={{ color: 'white' }}>
              {/* Project Title */}
              <Title level={1} style={{
                color: 'white',
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: '800',
                margin: '0 0 20px 0',
                lineHeight: '1.2'
              }}>
                {quotation.title || 'Project Proposal'}
              </Title>

              {/* Project Description */}
              <Text style={{
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.6',
                marginBottom: '20px',
                display: 'block'
              }}>
                {quotation.projectDescription || 'Comprehensive solution tailored for your business needs'}
              </Text>


              {/* Key Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    fontSize: 'clamp(18px, 2.5vw, 24px)',
                    fontWeight: '700',
                    color: '#ffd700',
                    marginBottom: '8px',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {quotation.quotationNo || quotation._id?.toString().slice(-8) || 'N/A'}
                  </div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: 'clamp(11px, 1.5vw, 13px)',
                    fontWeight: '600'
                  }}>
                    Quotation No
                  </Text>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    fontSize: 'clamp(18px, 2.5vw, 24px)',
                    fontWeight: '700',
                    color: '#ffd700',
                    marginBottom: '8px',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {quotation.quotationValidity || '30'}d
                  </div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: 'clamp(11px, 1.5vw, 13px)',
                    fontWeight: '600'
                  }}>
                    Validity
                  </Text>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    fontSize: 'clamp(18px, 2.5vw, 24px)',
                    fontWeight: '700',
                    color: '#ffd700',
                    marginBottom: '8px',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {quotation.currency || 'USD'}
                  </div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: 'clamp(11px, 1.5vw, 13px)',
                    fontWeight: '600'
                  }}>
                    Currency
                  </Text>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    fontWeight: '700',
                    color: '#ffd700',
                    marginBottom: '8px',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {quotation.status?.toUpperCase() || 'PENDING'}
                  </div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: 'clamp(11px, 1.5vw, 13px)',
                    fontWeight: '600'
                  }}>
                    Status
                  </Text>
                </div>
              </div>

              {/* CTA Description */}
              {standardContent?.companyDetails?.ctaDescription && (
                <Text style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.6',
                  marginBottom: '30px',
                  display: 'block',
                  fontStyle: 'italic'
                }}>
                  {standardContent.companyDetails.ctaDescription}
                </Text>
              )}
            </div>
          </Col>

          <Col xs={24} lg={10}>
            {/* Client Info Card */}
            <Card style={{
              background: isDark 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: isDark 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 40px)',
              color: 'white',
              boxShadow: isDark 
                ? '0 8px 32px rgba(0,0,0,0.3)' 
                : '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Title level={3} style={{ 
                color: 'white', 
                marginBottom: '30px', 
                textAlign: 'center',
                fontSize: 'clamp(20px, 3vw, 24px)'
              }}>
                Project Details
              </Title>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Client Name
                  </Text>
                  <div style={{ 
                    fontSize: 'clamp(16px, 2.5vw, 18px)', 
                    fontWeight: '600', 
                    color: 'white' 
                  }}>
                    {quotation.clientName || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Company
                  </Text>
                  <div style={{ 
                    fontSize: 'clamp(16px, 2.5vw, 18px)', 
                    fontWeight: '600', 
                    color: 'white' 
                  }}>
                    {quotation.clientCompany || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Total Investment
                  </Text>
                  <div style={{ 
                    fontSize: 'clamp(20px, 3vw, 24px)', 
                    fontWeight: '700', 
                    color: '#ffd700' 
                  }}>
                    {formatCurrencyValue(totalAmount, quotation.currency || 'USD')}
                  </div>
                </div>

                <div>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Status
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Tag 
                      color={getStatusColorValue(quotation.status || 'pending')}
                      style={{ 
                        fontSize: 'clamp(12px, 2vw, 14px)',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        border: 'none'
                      }}
                    >
                      {quotation.status?.toUpperCase() || 'PENDING'}
                    </Tag>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LandingQuotationHero;
