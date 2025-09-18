'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Descriptions,
  Space,
  Tag
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Text, Paragraph, Title } = Typography;

interface LandingOverviewSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  getStatusColor: (status: string) => string;
  isDark?: boolean;
}

const LandingOverviewSection: React.FC<LandingOverviewSectionProps> = ({
  quotation,
  getStatusColor,
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
            Project Overview
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

        <Row gutter={[48, 48]}>
          {/* Left Side - Quotation Details and Project Description */}
          <Col xs={24} lg={14}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Quotation Details */}
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
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Quotation Details
                  </Title>
                </div>
                
                <div style={{ padding: '0 24px 24px 24px' }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Quotation No</Text>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.quotationNo || quotation._id?.toString().slice(-8) || 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Status</Text>
                        <div style={{ marginTop: '4px' }}>
                          <Tag 
                            color={getStatusColor(quotation.status)} 
                            style={{ 
                              fontSize: '14px', 
                              padding: '6px 16px', 
                              borderRadius: '20px',
                              fontWeight: '600'
                            }}
                          >
                            {quotation.status?.toUpperCase() || 'PENDING'}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Quotation Date</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.quotationDate?.toLocaleDateString() || new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Expiration Date</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.expirationDate?.toLocaleDateString() || 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Validity</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {validityDays ? `${validityDays} days` : 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Currency</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.currency || 'USD'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Project Deadline</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.projectDeadline || 'N/A'}
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: '20px' }}>
                        <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Payment Terms</Text>
                        <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                          {quotation.paymentTerms || 'N/A'}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>

              {/* Project Description */}
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
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Project Description
                  </Title>
                </div>
                
                <div style={{ padding: '0 24px 24px 24px' }}>
                  <Paragraph style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    lineHeight: '1.7',
                    color: isDark ? '#cbd5e0' : '#4a5568'
                  }}>
                    {quotation.projectDescription || 'No project description provided.'}
                  </Paragraph>
                </div>
              </Card>
            </Space>
          </Col>

          {/* Right Side - Client Information */}
          <Col xs={24} lg={10}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                background: isDark ? '#1a1a2e' : 'white',
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                  Client Information
                </Title>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Name</Text>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      {quotation.clientName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Company</Text>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      {quotation.clientCompany || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Email</Text>
                    <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      <Text copyable style={{ color: '#667eea', fontWeight: '500' }}>
                        {quotation.clientEmail || 'N/A'}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Phone</Text>
                    <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      <Text copyable style={{ color: '#667eea', fontWeight: '500' }}>
                        {quotation.clientPhone || 'N/A'}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Address</Text>
                    <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      {quotation.clientAddress || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px', color: isDark ? '#a0aec0' : '#718096', fontWeight: '600' }}>Country</Text>
                    <div style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#1a202c', marginTop: '4px' }}>
                      {quotation.country || 'N/A'}
                    </div>
                  </div>
                </Space>
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

export default LandingOverviewSection;
