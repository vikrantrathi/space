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

const { Text, Paragraph } = Typography;

interface OverviewTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  getStatusColor: (status: string) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  quotation,
  getStatusColor
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
    <Row gutter={[24, 24]}>
      {/* Left Side - Quotation Details and Project Description */}
      <Col xs={24} lg={16}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Quotation Details */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Quotation Details
              </Space>
            } 
            style={{
              borderRadius: '12px',
              background: 'var(--ant-color-bg-container)',
              border: '1px solid var(--ant-color-border)'
            }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Quotation No">
                <Text strong>{quotation.quotationNo || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Quotation Date">
                <Text>{quotation.quotationDate?.toLocaleDateString() || new Date().toLocaleDateString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Expiration Date">
                <Text>{quotation.expirationDate?.toLocaleDateString() || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Quotation Validity (Days)">
                <Text>{validityDays ? `${validityDays} days` : 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(quotation.status)}>
                  {quotation.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Currency">
                <Text>{quotation.currency}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Project Deadline">
                <Text>{quotation.projectDeadline || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Project Description */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Project Description
              </Space>
            } 
            style={{
              borderRadius: '12px',
              background: 'var(--ant-color-bg-container)',
              border: '1px solid var(--ant-color-border)'
            }}
          >
            <Paragraph style={{ margin: 0, color: 'var(--ant-color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              {quotation.projectDescription || 'No project description provided.'}
            </Paragraph>
          </Card>
        </Space>
      </Col>

      {/* Right Side - Client Information */}
      <Col xs={24} lg={8}>
        <Card 
          title={
            <Space>
              <UserOutlined />
              Client Information
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Name:</Text>
              <br />
              <Text>{quotation.clientName || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Company:</Text>
              <br />
              <Text>{quotation.clientCompany || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Email:</Text>
              <br />
              <Text copyable>{quotation.clientEmail || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Phone:</Text>
              <br />
              <Text copyable>{quotation.clientPhone || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Address:</Text>
              <br />
              <Text>{quotation.clientAddress || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Country:</Text>
              <br />
              <Text>{quotation.country || 'N/A'}</Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewTab;
