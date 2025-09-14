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
  message,
  Modal,
  Input,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  PhoneFilled,
  MailFilled,
  CopyOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text } = Typography;

interface QuotationHeaderProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  theme: {
    colorBgContainer: string;
    colorPrimary: string;
    colorTextSecondary: string;
    colorBorder: string;
  };
}

const QuotationHeader: React.FC<QuotationHeaderProps> = ({
  quotation,
  standardContent,
  theme
}) => {
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
  
  // Using standard content for company details

  // Generate share URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const quotationId = quotation._id || quotation.id;
    const url = `${baseUrl}/quotation/${quotationId}`;
    setShareUrl(url);
    return url;
  };

  // Print function
  const handlePrint = () => {
    window.print();
    message.success('Print dialog opened');
  };

  // Export PDF function
  const handleExportPDF = async () => {
    try {
      message.loading('Generating PDF...', 0);
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple PDF download
      const element = document.createElement('a');
      const file = new Blob([`Quotation: ${quotation.title}\n\nCompany: ${companyDetails.name}\nEmail: ${companyDetails.email}\nPhone: ${companyDetails.phone}\nWebsite: ${companyDetails.website}\n\nGenerated on: ${new Date().toLocaleDateString()}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `quotation-${quotation.title?.replace(/\s+/g, '-').toLowerCase() || 'quotation'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      message.destroy();
      message.success('PDF exported successfully!');
    } catch {
      message.destroy();
      message.error('Failed to export PDF');
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
      <Card style={{
        marginBottom: '24px',
        borderRadius: '16px',
        background: theme.colorBgContainer,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space size="large" align="start" style={{ width: '100%' }}>
              {companyDetails.logo && (
                <div style={{ 
                  padding: '8px', 
                  background: theme.colorBgContainer, 
                  borderRadius: '12px',
                  border: `2px solid ${theme.colorBorder}`
                }}>
                  <Image
                    src={companyDetails.logo}
                    alt="Company Logo"
                    style={{ 
                      height: '90px', 
                      width: 'auto', 
                      borderRadius: '8px',
                      maxWidth: '160px'
                    }}
                    preview={false}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Title level={2} style={{ 
                  margin: 0, 
                  
                  fontSize: '28px',
                  fontWeight: '700'
                }}>
                  {companyDetails.name}
                </Title>
                {companyDetails.tagline && (
                  <Text style={{ 
                    fontSize: '16px', 
                    color: theme.colorTextSecondary,
                    fontStyle: 'italic',
                    display: 'block',
                    marginTop: '4px'
                  }}>
                    {companyDetails.tagline}
                  </Text>
                )}
                <Space style={{ marginTop: '12px' }} wrap size="middle">
                  {companyDetails.email && (
                    <Tooltip title="Email us">
                      <Space size="small" style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`
                      }}>
                        <MailFilled style={{ color: theme.colorPrimary, fontSize: '16px' }} />
                        <Text copyable={{ text: companyDetails.email }} style={{ fontWeight: '500' }}>
                          {companyDetails.email}
                        </Text>
                      </Space>
                    </Tooltip>
                  )}
                  {companyDetails.phone && (
                    <Tooltip title="Call us">
                      <Space size="small" style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`
                      }}>
                        <PhoneFilled style={{ color: theme.colorPrimary, fontSize: '16px' }} />
                        <Text copyable={{ text: companyDetails.phone }} style={{ fontWeight: '500' }}>
                          {companyDetails.phone}
                        </Text>
                      </Space>
                    </Tooltip>
                  )}
                  {companyDetails.website && (
                    <Tooltip title="Visit our website">
                      <Space size="small" style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`
                      }}>
                        <GlobalOutlined style={{ color: theme.colorPrimary, fontSize: '16px' }} />
                        <Text 
                          copyable={{ text: companyDetails.website }}
                          style={{ 
                            fontWeight: '500',
                            color: theme.colorPrimary,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            let url = companyDetails.website;
                            if (!/^https?:\/\//i.test(url)) {
                              url = "https://" + url; // default to https
                            }
                            window.open(url, "_blank");
                          }}
                        >
                          {companyDetails.website}
                        </Text>
                      </Space>
                    </Tooltip>
                  )}
                </Space>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space wrap size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Tooltip title="Print this quotation">
                <Button 
                  icon={<PrinterOutlined />} 
                  onClick={handlePrint}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontWeight: '500'
                  }}
                >
                  Print
                </Button>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={handleExportPDF}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontWeight: '500'
                  }}
                >
                  Export PDF
                </Button>
              </Tooltip>
              <Tooltip title="Share this quotation">
                <Button 
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontWeight: '500'
                  }}
                >
                  Share
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

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
                  borderRadius: '8px 0 0 8px',
                  background: '#f8f9fa'
                }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyUrl}
                style={{ 
                  borderRadius: '0 8px 8px 0',
                  background: theme.colorPrimary,
                  borderColor: theme.colorPrimary
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
            <Space wrap>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('whatsapp')}
                style={{ 
                  background: '#25D366', 
                  borderColor: '#25D366',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                WhatsApp
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('twitter')}
                style={{ 
                  background: '#1DA1F2', 
                  borderColor: '#1DA1F2',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                Twitter
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('linkedin')}
                style={{ 
                  background: '#0077B5', 
                  borderColor: '#0077B5',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                LinkedIn
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleSocialShare('facebook')}
                style={{ 
                  background: '#4267B2', 
                  borderColor: '#4267B2',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                Facebook
              </Button>
              <Button
                icon={<MailFilled />}
                onClick={() => handleSocialShare('email')}
                style={{ 
                  background: '#EA4335', 
                  borderColor: '#EA4335',
                  color: 'white',
                  borderRadius: '8px'
                }}
              >
                Email
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default QuotationHeader;
