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
// import { testPDFGeneration } from '@/lib/utils/simplePdfUtils';
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
  
  // Using standard content for company details

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
      <Card style={{
        marginBottom: '24px',
        borderRadius: '16px',
        background: theme.colorBgContainer,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {companyDetails.logo && (
                <div style={{ 
                  padding: '8px', 
                  background: theme.colorBgContainer, 
                  borderRadius: '12px',
                  border: `2px solid ${theme.colorBorder}`
                }} className="flex-shrink-0">
                  <Image
                    src={companyDetails.logo}
                    alt="Company Logo"
                    style={{ 
                      height: '70px', 
                      width: 'auto', 
                      borderRadius: '8px',
                      maxWidth: '140px'
                    }}
                    className="sm:h-[90px] sm:max-w-[160px]"
                    preview={false}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Title level={2} style={{ 
                  margin: 0, 
                  fontSize: '24px',
                  fontWeight: '700'
                }} className="text-xl sm:text-2xl md:text-3xl">
                  {companyDetails.name}
                </Title>
                {companyDetails.tagline && (
                  <Text style={{ 
                    fontSize: '14px', 
                    color: theme.colorTextSecondary,
                    fontStyle: 'italic',
                    display: 'block',
                    marginTop: '4px'
                  }} className="text-sm sm:text-base">
                    {companyDetails.tagline}
                  </Text>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {companyDetails.email && (
                    <Tooltip title="Email us">
                      <div style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }} className="text-xs sm:text-sm">
                        <MailFilled style={{ color: theme.colorPrimary, fontSize: '14px' }} />
                        <Text copyable={{ text: companyDetails.email }} style={{ fontWeight: '500', fontSize: '12px' }}>
                          <span className="hidden sm:inline">{companyDetails.email}</span>
                          <span className="sm:hidden">Email</span>
                        </Text>
                      </div>
                    </Tooltip>
                  )}
                  {companyDetails.phone && (
                    <Tooltip title="Call us">
                      <div style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }} className="text-xs sm:text-sm">
                        <PhoneFilled style={{ color: theme.colorPrimary, fontSize: '14px' }} />
                        <Text copyable={{ text: companyDetails.phone }} style={{ fontWeight: '500', fontSize: '12px' }}>
                          <span className="hidden sm:inline">{companyDetails.phone}</span>
                          <span className="sm:hidden">Call</span>
                        </Text>
                      </div>
                    </Tooltip>
                  )}
                  {companyDetails.website && (
                    <Tooltip title="Visit our website">
                      <div style={{ 
                        padding: '6px 12px', 
                        background: theme.colorBgContainer, 
                        borderRadius: '20px',
                        border: `1px solid ${theme.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }} className="text-xs sm:text-sm">
                        <GlobalOutlined style={{ color: theme.colorPrimary, fontSize: '14px' }} />
                        <Text 
                          copyable={{ text: companyDetails.website }}
                          style={{ 
                            fontWeight: '500',
                            color: theme.colorPrimary,
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={() => {
                            let url = companyDetails.website;
                            if (!/^https?:\/\//i.test(url)) {
                              url = "https://" + url; // default to https
                            }
                            window.open(url, "_blank");
                          }}
                        >
                          <span className="hidden sm:inline">{companyDetails.website}</span>
                          <span className="sm:hidden">Website</span>
                        </Text>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
              <Tooltip title="Export as PDF">
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={handleExportPDF}
                  className="w-full sm:w-auto"
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontWeight: '500'
                  }}
                >
                  <span className="hidden sm:inline">Export PDF</span>
                </Button>
              </Tooltip>
              <Tooltip title="Share this quotation">
                <Button 
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  className="w-full sm:w-auto"
                  style={{ 
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontWeight: '500'
                  }}
                >
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </Tooltip>
            </div>
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

export default QuotationHeader;
