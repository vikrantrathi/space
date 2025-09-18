'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Button,
  Image,
  Modal,
  Input,
  Tooltip,
  App
} from 'antd';
import {
  DownloadOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  PhoneFilled,
  MailFilled,
  CopyOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { downloadQuotationPDF } from '@/lib/utils/reactPdfUtils';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text } = Typography;

interface LandingQuotationHeaderProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorBgContainer: string;
    colorPrimary: string;
    colorTextSecondary: string;
    colorBorder: string;
  };
  isDark?: boolean;
}

const LandingQuotationHeader: React.FC<LandingQuotationHeaderProps> = ({
  quotation,
  standardContent,
  theme,
  isDark = false
}) => {
  const { message } = App.useApp();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Direct use of standard content - no merging needed!
  const companyDetails = standardContent?.companyDetails || {
    name: 'Your Company Name',
    logo: '',
    email: '',
    phone: '',
    website: '',
    tagline: 'Professional Services'
  };

  // Generate share URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const quotationId = quotation._id || quotation.id;
    const url = `${baseUrl}/quotation/${quotationId}`;
    setShareUrl(url);
    return url;
  };

  // Export PDF function using utility
  const handleExportPDF = async () => {
    try {
      message.loading('Generating comprehensive PDF...', 0);
      
      // Get the quotation URL
      const quotationUrl = generateShareUrl();
      
      // Call the React PDF utility
      await downloadQuotationPDF({
        quotation,
        companyDetails,
        standardContent,
        quotationUrl
      });
      
      message.destroy();
      message.success('Complete quotation PDF exported successfully!');
      
    } catch (error) {
      message.destroy();
      message.error('Failed to export PDF');
      console.error('PDF Export Error:', error);
    }
  };

  // Share function
  const handleShare = () => {
    generateShareUrl();
    setShareModalVisible(true);
  };

  // Copy to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success('URL copied to clipboard!');
  };

  // Share via different platforms
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(quotation.title || 'Quotation');
    const text = encodeURIComponent(`Check out this quotation: ${quotation.title}`);
    
    let socialShareUrl = '';
    switch (platform) {
      case 'whatsapp':
        socialShareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'twitter':
        socialShareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        socialShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        socialShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'email':
        socialShareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
    }
    
    if (socialShareUrl) {
      window.open(socialShareUrl, '_blank');
      message.success(`Opening ${platform}...`);
    }
  };

  return (
    <>
      {/* Modern Landing Page Header */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: isDark ? 'rgba(15, 15, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            padding: '16px 0',
            transition: 'all 0.3s ease'
          }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {companyDetails.logo && (
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
                    boxShadow: isDark 
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                  }}>
                    <Image
                      src={companyDetails.logo}
                      alt="Company Logo"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain'
                      }}
                      preview={false}
                    />
                  </div>
                )}
                <div>
                      <Title level={4} style={{ 
                        margin: 0, 
                        fontSize: '20px',
                        fontWeight: '700',
                        color: isDark ? '#ffffff' : '#1a202c'
                      }}>
                        {companyDetails.name}
                      </Title>
                      {companyDetails.tagline && (
                        <Text style={{ 
                          fontSize: '14px', 
                          color: isDark ? '#a0aec0' : '#718096',
                          display: 'block',
                          marginTop: '2px'
                        }}>
                          {companyDetails.tagline}
                        </Text>
                      )}
                </div>
              </div>
            </Col>
            
            <Col>
              <Space size="middle">
                {/* Contact Info */}
                <Space size="small" className="hidden md:flex">
                  {companyDetails.phone && (
                        <Tooltip title="Call us">
                          <Button
                            type="text"
                            icon={<PhoneFilled />}
                            style={{ 
                              color: isDark ? '#e2e8f0' : '#4a5568',
                              fontWeight: '500'
                            }}
                            onClick={() => window.open(`tel:${companyDetails.phone}`)}
                          >
                            <span style={{ fontSize: '14px' }}>{companyDetails.phone}</span>
                          </Button>
                        </Tooltip>
                      )}
                      {companyDetails.email && (
                        <Tooltip title="Email us">
                          <Button
                            type="text"
                            icon={<MailFilled />}
                            style={{ 
                              color: isDark ? '#e2e8f0' : '#4a5568',
                              fontWeight: '500'
                            }}
                            onClick={() => window.open(`mailto:${companyDetails.email}`)}
                          >
                            <span style={{ fontSize: '14px' }}>Email</span>
                          </Button>
                        </Tooltip>
                  )}
                </Space>

                {/* Action Buttons */}
                <Space size="small">
                  <Tooltip title="Export as PDF">
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleExportPDF}
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>PDF</span>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Share this quotation">
                    <Button 
                      icon={<ShareAltOutlined />}
                      onClick={handleShare}
                      style={{ 
                        borderRadius: '8px',
                        height: '40px',
                        fontWeight: '500',
                        background: 'white',
                        borderColor: '#e2e8f0',
                        color: '#4a5568',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>Share</span>
                    </Button>
                  </Tooltip>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div style={{ height: '80px' }} />

      {/* Share Modal */}
      <Modal
        title={
          <Space>
            <ShareAltOutlined style={{ color: theme.colorPrimary }} />
            <span>Share Quotation</span>
          </Space>
        }
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        width={500}
        style={{ borderRadius: '16px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Share Link:
            </Text>
            <Input.Group compact>
              <Input
                value={shareUrl}
                readOnly
                style={{ 
                  borderRadius: '8px 0 0 8px'
                }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyUrl}
                type="primary"
                style={{ 
                  borderRadius: '0 8px 8px 0'
                }}
              >
                Copy
              </Button>
            </Input.Group>
          </div>
          
          <div>
            <Text strong style={{ display: 'block', marginBottom: '12px' }}>
              Share on Social Media:
            </Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('whatsapp')}
                className="w-full"
                style={{ 
                  background: '#25D366', 
                  borderColor: '#25D366',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">WA</span>
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('twitter')}
                className="w-full"
                style={{ 
                  background: '#1DA1F2', 
                  borderColor: '#1DA1F2',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                <span className="hidden sm:inline">Twitter</span>
                <span className="sm:hidden">X</span>
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('linkedin')}
                className="w-full"
                style={{ 
                  background: '#0077B5', 
                  borderColor: '#0077B5',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                <span className="hidden sm:inline">LinkedIn</span>
                <span className="sm:hidden">LI</span>
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('facebook')}
                className="w-full"
                style={{ 
                  background: '#4267B2', 
                  borderColor: '#4267B2',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                <span className="hidden sm:inline">Facebook</span>
                <span className="sm:hidden">FB</span>
              </Button>
              <Button
                icon={<MailFilled />}
                onClick={() => handleSocialShare('email')}
                className="w-full col-span-2 sm:col-span-1"
                style={{ 
                  background: '#EA4335', 
                  borderColor: '#EA4335',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                <span className="hidden sm:inline">Email</span>
                <span className="sm:hidden">Mail</span>
              </Button>
            </div>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default LandingQuotationHeader;
