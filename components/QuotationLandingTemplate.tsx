'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Spin,
  message,
  Divider,
  List,
  Row,
  Col,
  Badge,
  Steps,
  Tooltip,
  theme
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/lib/auth/auth-context';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined,
  RocketOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ActionData {
  name: string;
  email: string;
  phone: string;
  action: string;
  reason?: string;
}

interface QuotationLandingTemplateProps {
  quotation: IQuotation;
  onAction: (values: ActionData) => void;
  onOtpSubmit?: (values: { otp: string }) => void;
  loading?: boolean;
  printMode?: boolean;
  actionModalVisible?: boolean;
  setActionModalVisible?: (visible: boolean) => void;
  otpModalVisible?: boolean;
  setOtpModalVisible?: (visible: boolean) => void;
  actionForm?: FormInstance;
  otpForm?: FormInstance;
  actionLoading?: boolean;
  otpLoading?: boolean;
}

const QuotationLandingTemplate: React.FC<QuotationLandingTemplateProps> = ({
  quotation,
  onAction,
  onOtpSubmit,
  loading = false,
  printMode = false,
  actionModalVisible = false,
  setActionModalVisible,
  otpModalVisible = false,
  setOtpModalVisible,
  actionForm,
  otpForm,
  actionLoading = false,
  otpLoading = false
}) => {
  const { token } = theme.useToken();
  const { resolved } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  // Check if quotation is valid for actions
  const isValidForActions = () => {
    // If status is not 'sent' or 'revision', actions are not valid
    if (quotation.status !== 'sent' && quotation.status !== 'revision') {
      console.log('isValidForActions: Status not valid', quotation.status);
      return false;
    }
    
    // Check if client has requested revision
    const hasClientRevision = quotation.actions?.some(action => 
      action.action === 'revision' && 
      action.reason !== 'Admin sent revised quotation to client' && 
      action.reason !== 'Admin updated quotation based on revision request'
    );
    
    // Check if admin sent revision back
    const hasAdminRevision = quotation.actions?.some(action => 
      action.action === 'revision' && 
      (action.reason === 'Admin sent revised quotation to client' || 
       action.reason === 'Admin updated quotation based on revision request')
    );
    
    console.log('isValidForActions debug:', {
      status: quotation.status,
      hasClientRevision,
      hasAdminRevision,
      actions: quotation.actions
    });
    
    // If client has requested revision AND admin hasn't sent revision back, disable actions
    if (hasClientRevision && !hasAdminRevision) {
      console.log('isValidForActions: Client revision but no admin revision - disabled');
      return false;
    }
    
    console.log('isValidForActions: Actions valid');
    return true;
  };

  // Check if client has requested revision (for display purposes)
  const hasClientRequestedRevision = () => {
    return quotation.actions?.some(action => 
      action.action === 'revision' && 
      action.reason !== 'Admin sent revised quotation to client' && 
      action.reason !== 'Admin updated quotation based on revision request'
    );
  };

  // Check if admin has sent revision back
  const hasAdminSentRevision = () => {
    const result = quotation.actions?.some(action => 
      action.action === 'revision' && 
      (action.reason === 'Admin sent revised quotation to client' || 
       action.reason === 'Admin updated quotation based on revision request')
    );
    console.log('hasAdminSentRevision debug:', {
      actions: quotation.actions,
      result,
      status: quotation.status
    });
    return result;
  };
  
  // Debug logging removed for production
  const handleAction = (action: string) => {
    if (!isValidForActions()) {
      return; // Don't allow actions if not valid
    }
    console.log('Landing Template handleAction called:', { action, isAuthenticated, user: !!user });
    if (isAuthenticated && user) {
      // For logged-in users, use the parent's onAction logic which handles authentication properly
      onAction({
        name: user.name || '',
        email: user.email || '',
        phone: '', // Phone not available in user object
        action,
        reason: action === 'reject' || action === 'revision' ? '' : undefined
      });
    } else {
      // For public users, open modal to collect details first
      console.log('Opening modal for public user in landing template');
      if (actionForm) {
        actionForm.setFieldsValue({ action });
      }
      setActionModalVisible?.(true);
    }
  };

  const handleActionSubmit = (values: ActionData) => {
    if (isAuthenticated && user) {
      // For logged-in users, call action directly
      onAction(values);
      setActionModalVisible?.(false);
      actionForm?.resetFields();
    } else {
      // For public users, start OTP flow
      onAction(values);
      // Don't close modal yet - it will be closed when OTP is sent
    }
  };

  const handleOtpSubmit = (values: { otp: string }) => {
    onOtpSubmit?.(values);
    setOtpModalVisible?.(false);
    otpForm?.resetFields();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#faad14';
      case 'accepted': return '#52c41a';
      case 'rejected': return '#ff4d4f';
      case 'revision': return '#722ed1';
      default: return '#1890ff';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: token.colorBgContainer
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: resolved === 'dark'
        ? 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: printMode ? '0' : '10px'
    }} className="px-2 md:px-5">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            background: #1a365d !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-content" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: token.colorBgContainer,
        borderRadius: printMode ? '0' : '24px',
        boxShadow: printMode ? 'none' : `0 25px 50px ${resolved === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}`,
        overflow: 'hidden'
      }}>

        {/* Header Section */}
        <div className="print-header p-4 md:p-10" style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            transform: 'translate(50px, -50px)'
          }} />

          <Row justify="space-between" align="top">
            <Col xs={24} md={16}>
              <div style={{ marginBottom: '10px' }}>
                <CrownOutlined style={{ fontSize: '32px', marginRight: '15px', color: '#ffd700' }} />
                <Title level={1} style={{
                  color: 'white',
                  margin: 0,
                  display: 'inline-block',
                  fontSize: '28px',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }} className="text-2xl md:text-4xl">
                  {quotation.companyDetails?.name || 'STARTUPZILA'}
                </Title>
              </div>
              <Text style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                display: 'block',
                marginBottom: '20px',
                fontWeight: '300'
              }} className="text-sm md:text-lg">
                {'Premium Digital Solutions & Innovation Partner'}
              </Text>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '25px',
                marginTop: '25px'
              }}>
                {quotation.companyDetails?.email && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: '10px', fontSize: '16px' }} />
                    <span>{quotation.companyDetails.email}</span>
                  </div>
                )}
                {quotation.companyDetails?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ marginRight: '10px', fontSize: '16px' }} />
                    <span>{quotation.companyDetails.phone}</span>
                  </div>
                )}
                {quotation.companyDetails?.website && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileTextOutlined style={{ marginRight: '10px', fontSize: '16px' }} />
                    <span>{quotation.companyDetails.website}</span>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                  Quotation ID
                </Text>
                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', display: 'block' }}>
                  #{quotation._id?.toString().slice(-8).toUpperCase()}
                </Text>

                <div style={{ marginTop: '15px' }}>
                  <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                    Status
                  </Text>
                  <Badge
                    color={getStatusColor(quotation.status)}
                    text={
                      <span style={{ color: 'white', fontWeight: '600', textTransform: 'capitalize' }}>
                        {quotation.status || 'Pending'}
                      </span>
                    }
                  />
                </div>

                <div style={{ marginTop: '15px' }}>
                  <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                    Date
                  </Text>
                  <Text style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>
                    {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Action Buttons / Accepted status - Only show when not printing */}
        <div className="no-print" style={{
          padding: '20px 40px',
          background: token.colorBgLayout,
          borderBottom: `1px solid ${token.colorBorder}`
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                  style={{ borderRadius: '8px' }}
                >
                  Print
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  style={{ borderRadius: '8px' }}
                >
                  Download PDF
                </Button>
              </Space>
            </Col>
            <Col>
              <div style={{ textAlign: 'center', marginBottom: 8, color: 'blue', fontSize: '10px' }}>
                DEBUG: status={quotation.status}, hasClient={hasClientRequestedRevision()}, hasAdmin={hasAdminSentRevision()}
              </div>
              {quotation.status === 'accepted' ? (
                <div>
                  <Tag color="green" style={{ fontSize: 16, padding: '6px 12px', borderRadius: 8 }}>Accepted</Tag>
                  <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4 }}>
                    {(() => {
                      const accepted = quotation.actions?.filter((a: { action: string; timestamp: Date }) => a.action === 'accept').slice(-1)[0];
                      const date = accepted?.timestamp || new Date(quotation.updatedAt || quotation.createdAt);
                      return `on ${date.toLocaleDateString()}`;
                    })()}
                  </div>
                </div>
              ) : hasAdminSentRevision() ? (
                <div>
                  <Tag color="green" style={{ fontSize: 16, padding: '6px 12px', borderRadius: 8 }}>Revision Received</Tag>
                  <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: token.colorTextSecondary }}>
                    {(() => {
                      const revisionAction = quotation.actions?.find(action => 
                        action.action === 'revision' && 
                        (action.reason === 'Admin sent revised quotation to client' || 
                         action.reason === 'Admin updated quotation based on revision request')
                      );
                      const date = revisionAction?.timestamp ? new Date(revisionAction.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
                      return `Received on ${date.toLocaleDateString()}`;
                    })()}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, marginTop: 2, color: token.colorTextTertiary, marginBottom: 16 }}>
                    Please review and take action
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: 16, color: 'red', fontSize: '12px' }}>
                    DEBUG: hasAdminSentRevision() = true, showing action buttons
                  </div>
                  <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleAction('accept')}
                      style={{
                        borderRadius: '12px',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: token.colorSuccess,
                        borderColor: token.colorSuccess
                      }}
                    >
                      Accept Quotation
                    </Button>
                    <Button
                      size="large"
                      icon={<ExclamationCircleOutlined />}
                      onClick={() => handleAction('revision')}
                      style={{
                        borderRadius: '12px',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleAction('reject')}
                      style={{
                        borderRadius: '12px',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: token.colorError,
                        borderColor: token.colorError
                      }}
                    >
                      Reject Quotation
                    </Button>
                  </Space>
                </div>
              ) : hasClientRequestedRevision() ? (
                <div>
                  <Tag color="orange" style={{ fontSize: 16, padding: '6px 12px', borderRadius: 8 }}>Revision Requested</Tag>
                  <div style={{ textAlign: 'right', fontSize: 12, marginTop: 4, color: token.colorTextSecondary }}>
                    {(() => {
                      const revisionAction = quotation.actions?.find(action => 
                        action.action === 'revision' && 
                        action.reason !== 'Admin sent revised quotation to client' && 
                        action.reason !== 'Admin updated quotation based on revision request'
                      );
                      const date = revisionAction?.timestamp ? new Date(revisionAction.timestamp) : new Date(quotation.updatedAt || quotation.createdAt);
                      return `Requested on ${date.toLocaleDateString()}`;
                    })()}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, marginTop: 2, color: token.colorTextTertiary }}>
                    Actions Disabled till Revision Received from admin
                  </div>
                </div>
              ) : (
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleAction('accept')}
                    style={{
                      borderRadius: '12px',
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="large"
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => handleAction('revision')}
                    style={{
                      borderRadius: '12px',
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
                    }}
                  >
                    Request Changes
                  </Button>
                  <Button
                    danger
                    size="large"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleAction('reject')}
                    style={{
                      borderRadius: '12px',
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
                    }}
                  >
                    Decline
                  </Button>
                </Space>
              )}
            </Col>
          </Row>
        </div>

        {/* Client Information */}
        {quotation?.clientName && (
          <div style={{
            padding: '40px',
            background: resolved === 'dark'
              ? 'linear-gradient(135deg, #262626 0%, #1f1f1f 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: `1px solid ${token.colorBorder}`
          }}>
            <div style={{ marginBottom: '30px' }}>
              <Title level={3} style={{
                margin: 0,
                color: token.colorText,
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                <TeamOutlined style={{ marginRight: '12px', color: '#3182ce' }} />
                Client Information
              </Title>
            </div>

            <Card style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: resolved === 'dark'
                ? '0 10px 25px rgba(0,0,0,0.3)'
                : '0 10px 25px rgba(0,0,0,0.08)',
              background: token.colorBgContainer
            }}>
              <Row gutter={[32, 24]}>
                <Col xs={24} md={12} lg={6}>
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: 'white'
                  }}>
                    <UserOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Client Name</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{quotation.clientName}</div>
                  </div>
                </Col>

                {quotation.clientEmail && (
                  <Col xs={24} md={12} lg={6}>
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '12px',
                      color: 'white'
                    }}>
                      <MailOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Email</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', wordBreak: 'break-word' }}>
                        {quotation.clientEmail}
                      </div>
                    </div>
                  </Col>
                )}

                {quotation.clientPhone && (
                  <Col xs={24} md={12} lg={6}>
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      borderRadius: '12px',
                      color: 'white'
                    }}>
                      <PhoneOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Phone</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{quotation.clientPhone}</div>
                    </div>
                  </Col>
                )}

                {quotation.clientCompany && (
                  <Col xs={24} md={12} lg={6}>
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      borderRadius: '12px',
                      color: 'white'
                    }}>
                      <FileTextOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Company</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{quotation.clientCompany}</div>
                    </div>
                  </Col>
                )}
              </Row>

              {quotation.projectDescription && (
                <div style={{
                  marginTop: '30px',
                  padding: '25px',
                  background: resolved === 'dark'
                    ? 'linear-gradient(135deg, #2d2d2d 0%, #1f1f1f 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '12px',
                  border: `1px solid ${token.colorBorder}`
                }}>
                  <Title level={5} style={{
                    margin: '0 0 15px 0',
                    color: token.colorText,
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    Project Description
                  </Title>
                  <Text style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: token.colorTextSecondary
                  }}>
                    {quotation.projectDescription}
                  </Text>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Project Title */}
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: token.colorBgContainer
        }}>
          <Title level={1} style={{
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '36px',
            fontWeight: '800'
          }}>
            {quotation?.title || 'Project Proposal'}
          </Title>
          <Text style={{
            fontSize: '18px',
            color: token.colorTextSecondary,
            fontWeight: '400'
          }}>
            {quotation.projectDescription || 'Comprehensive solution tailored for your business needs'}
          </Text>
        </div>

        {/* Features Section */}
        <div style={{
          padding: '40px',
          background: token.colorBgContainer
        }}>
          <div style={{ marginBottom: '35px', textAlign: 'center' }}>
            <Title level={2} style={{
              margin: '0 0 10px 0',
              color: token.colorText,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <RocketOutlined style={{ marginRight: '15px', color: '#3182ce' }} />
              What&apos;s Included
            </Title>
            <Text style={{ fontSize: '16px', color: token.colorTextSecondary }}>
              {'Complete feature set designed to exceed your expectations'}
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {quotation?.features.map((feature, index) => (
              <Col key={index} xs={24} md={12} lg={8}>
                <Card style={{
                  height: '100%',
                  borderRadius: '16px',
                  border: `1px solid ${token.colorBorder}`,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  background: resolved === 'dark'
                    ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
                  boxShadow: resolved === 'dark'
                    ? '0 4px 12px rgba(0,0,0,0.2)'
                    : '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    height: '100%'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      flexShrink: 0
                    }}>
                      <CheckCircleOutlined style={{
                        color: 'white',
                        fontSize: '20px'
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: token.colorText,
                        fontWeight: '500'
                      }}>
                        {feature}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Benefits Section */}
        <div style={{
          padding: '40px',
          background: resolved === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)'
            : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
        }}>
          <div style={{ marginBottom: '35px', textAlign: 'center' }}>
            <Title level={2} style={{
              margin: '0 0 10px 0',
              color: token.colorText,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <SafetyOutlined style={{ marginRight: '15px', color: '#38a169' }} />
              Why Choose Us
            </Title>
            <Text style={{ fontSize: '16px', color: token.colorTextSecondary }}>
              {'The advantages that set us apart from the competition'}
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {quotation?.benefits.map((benefit, index) => (
              <Col key={index} xs={24} md={12} lg={8}>
                <Card style={{
                  height: '100%',
                  borderRadius: '16px',
                  border: 'none',
                  background: token.colorBgContainer,
                  boxShadow: resolved === 'dark'
                    ? '0 8px 25px rgba(0,0,0,0.3)'
                    : '0 8px 25px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px auto',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <Text style={{
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: token.colorText,
                      fontWeight: '500'
                    }}>
                      {benefit}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Pricing Section */}
        <div style={{
          padding: '40px',
          background: token.colorBgContainer
        }}>
          <div style={{ marginBottom: '35px', textAlign: 'center' }}>
            <Title level={2} style={{
              margin: '0 0 10px 0',
              color: token.colorText,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <DollarOutlined style={{ marginRight: '15px', color: '#e53e3e' }} />
              Investment & Terms
            </Title>
            <Text style={{ fontSize: '16px', color: token.colorTextSecondary }}>
              Transparent pricing with flexible payment options
            </Text>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} lg={16}>
              <Card style={{
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                color: 'white',
                boxShadow: '0 20px 40px rgba(26, 54, 93, 0.3)'
              }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={3} style={{
                    color: 'white',
                    margin: '0 0 20px 0',
                    fontSize: '24px'
                  }}>
                    Project Investment
                  </Title>

                  <div style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: '#ffd700',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    marginBottom: '20px'
                  }}>
                    {quotation?.quantityPricing && quotation.quantityPricing.length > 0 ? quotation.quantityPricing[0].item : 'Contact for Quote'}
                  </div>

                  <Text style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '400'
                  }}>
                    {'Complete project delivery with ongoing support'}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Payment Terms */}
          {quotation?.paymentTerms && (
            <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>

              {quotation.paymentTerms && (
                <Col xs={24} md={12}>
                  <Card style={{
                    borderRadius: '16px',
                    border: '1px solid #c6f6d5',
                    background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <DollarOutlined style={{
                        fontSize: '32px',
                        color: '#38a169',
                        marginBottom: '15px'
                      }} />
                      <Title level={4} style={{
                        margin: '0 0 10px 0',
                        color: '#22543d',
                        fontSize: '18px'
                      }}>
                        Payment Terms
                      </Title>
                      <Text style={{
                        fontSize: '16px',
                        color: '#4a5568',
                        fontWeight: '500'
                      }}>
                        {quotation.paymentTerms}
                      </Text>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </div>

        {/* Terms & Conditions */}
        <div style={{
          padding: '40px',
          background: resolved === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)'
            : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
        }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <Title level={2} style={{
              margin: '0 0 10px 0',
              color: token.colorText,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <FileTextOutlined style={{ marginRight: '15px', color: '#805ad5' }} />
              Terms & Conditions
            </Title>
            <Text style={{ fontSize: '16px', color: token.colorTextSecondary }}>
              {'Important information about our service agreement'}
            </Text>
          </div>

          <Card style={{
            borderRadius: '16px',
            border: 'none',
            background: token.colorBgContainer,
            boxShadow: resolved === 'dark'
              ? '0 10px 25px rgba(0,0,0,0.3)'
              : '0 10px 25px rgba(0,0,0,0.08)'
          }}>
            <div style={{ padding: '20px' }}>
              {quotation?.terms && (
                <div>
                  {quotation.terms.map((term, index) => (
                    term.trim() && (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                        padding: '15px',
                        background: resolved === 'dark'
                          ? 'linear-gradient(135deg, #2d2d2d 0%, #1f1f1f 100%)'
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: '12px',
                        border: `1px solid ${token.colorBorder}`
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '15px',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <Text style={{
                          fontSize: '15px',
                          lineHeight: '1.6',
                          color: token.colorText,
                          margin: 0
                        }}>
                          {term.trim()}
                        </Text>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
          color: 'white',
          padding: '50px 40px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <Title level={2} style={{
              color: 'white',
              margin: '0 0 15px 0',
              fontSize: '32px',
              fontWeight: '700'
            }}>
              Ready to Get Started?
            </Title>
            <Text style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '300'
            }}>
              {'Let\'s transform your vision into reality together'}
            </Text>
          </div>

          <div style={{
            marginTop: '30px',
            padding: '25px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            <div style={{ marginBottom: '10px' }}>
              This quotation is valid for the period mentioned above and subject to our standard terms and conditions.
            </div>
            <div style={{ fontWeight: '600', color: '#ffd700' }}>
              Questions? Contact us at {quotation.companyDetails?.email || 'contact@startupzila.com'} or {quotation.companyDetails?.phone || '+91 98765 43210'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
            <Title level={3} style={{ margin: 0, color: '#1a365d' }}>
              Quotation Response
            </Title>
            <Text type="secondary">Please provide your details to proceed</Text>
          </div>
        }
        open={actionModalVisible}
        onCancel={() => {
          setActionModalVisible?.(false);
          actionForm?.resetFields();
        }}
        footer={null}
        width={650}
        style={{ borderRadius: '20px' }}
        styles={{ body: { padding: '30px' } }}
      >
        <Form
          form={actionForm}
          layout="vertical"
          onFinish={handleActionSubmit}
          style={{ marginTop: '20px' }}
        >
          {/* Only show name, email, phone fields for public users */}
          {!isAuthenticated && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label={<span style={{ fontWeight: '600', color: '#4a5568' }}>Full Name</span>}
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                      placeholder="Enter your full name"
                      size="large"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label={<span style={{ fontWeight: '600', color: '#4a5568' }}>Phone Number</span>}
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />}
                      placeholder="Enter your phone number"
                      size="large"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label={<span style={{ fontWeight: '600', color: '#4a5568' }}>Email Address</span>}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#a0aec0' }} />}
                  placeholder="Enter your email address"
                  size="large"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item name="action" rules={[{ required: true }]}>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<span style={{ fontWeight: '600', color: '#4a5568' }}>Additional Comments</span>}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const action = getFieldValue('action');
                  if ((action === 'reject' || action === 'revision') && !value) {
                    return Promise.reject(new Error('Please provide a reason for your decision'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please share your thoughts or reasons for this action..."
              size="large"
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '30px' }}>
            <Space size="large">
              <Button
                onClick={() => {
                  setActionModalVisible?.(false);
                  actionForm?.resetFields();
                }}
                size="large"
                style={{
                  borderRadius: '10px',
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  height: '48px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: '10px',
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Send Verification Code
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* OTP Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
            <Title level={3} style={{ margin: 0, color: '#1a365d' }}>
              Email Verification
            </Title>
            <Text type="secondary">Enter the 6-digit code sent to your email</Text>
          </div>
        }
        open={otpModalVisible}
        onCancel={() => {
          setOtpModalVisible?.(false);
          otpForm?.resetFields();
        }}
        footer={null}
        width={450}
        style={{ borderRadius: '20px' }}
        styles={{ body: { padding: '30px' } }}
      >
        <Form
          form={otpForm}
          layout="vertical"
          onFinish={handleOtpSubmit}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="otp"
            label={<span style={{ fontWeight: '600', color: '#4a5568' }}>Verification Code</span>}
            rules={[
              { required: true, message: 'Please enter the verification code' },
              { pattern: /^\d{6}$/, message: 'Code must be 6 digits' }
            ]}
          >
            <Input
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                textAlign: 'center',
                fontSize: '28px',
                letterSpacing: '12px',
                height: '70px',
                borderRadius: '15px',
                fontWeight: 'bold'
              }}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '30px' }}>
            <Space size="large">
              <Button
                onClick={() => {
                  setOtpModalVisible?.(false);
                  otpForm?.resetFields();
                }}
                size="large"
                style={{
                  borderRadius: '10px',
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  height: '48px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={otpLoading}
                size="large"
                style={{
                  borderRadius: '10px',
                  paddingLeft: '30px',
                  paddingRight: '30px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none'
                }}
              >
                Verify & Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuotationLandingTemplate;