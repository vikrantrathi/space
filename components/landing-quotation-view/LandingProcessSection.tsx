'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Steps,
  Timeline,
  Space,
  Button
} from 'antd';
import {
  RocketOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UserOutlined,
  EditOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface LandingProcessSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  getStatusColor: (status: string) => string;
  isDark?: boolean;
}

const LandingProcessSection: React.FC<LandingProcessSectionProps> = ({
  quotation,
  standardContent,
  getStatusColor,
  isDark = false
}) => {
  // Merge process steps with standard content
  const processSteps = quotation.processSteps?.length ? quotation.processSteps : (standardContent?.processSteps || []);
  const processVideo = quotation.processVideo || standardContent?.processVideo;
  
  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return as is
    if (url.includes('embed')) return url;
    
    // Convert YouTube URL to embed URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return url;
  };
  
  const embedVideoUrl = getEmbedUrl(processVideo || '');
  
  // Debug logging
  console.log('Process Steps Debug:', {
    quotationProcessSteps: quotation.processSteps,
    standardProcessSteps: standardContent?.processSteps,
    finalProcessSteps: processSteps,
    processStepsLength: processSteps.length
  });

  // Create comprehensive timeline from actions and statusTimeline
  const createDetailedTimeline = () => {
    const timelineItems = [];
    
    // Add quotation creation
    timelineItems.push({
      key: 'created',
      timestamp: new Date(quotation.createdAt),
      type: 'created',
      title: 'Quotation Created',
      description: 'Quotation was created and saved',
      icon: <EditOutlined />,
      color: 'blue'
    });

    // Add quotation sent to client
    if (quotation.statusTimeline) {
      const sentEntry = quotation.statusTimeline.find(item => item.status === 'sent');
      if (sentEntry) {
        timelineItems.push({
          key: 'sent',
          timestamp: new Date(sentEntry.date),
          type: 'sent',
          title: 'Quotation Sent to Client',
          description: 'Quotation was sent to client for review',
          icon: <SendOutlined />,
          color: 'blue'
        });
      }
    }

    // Add actions from actions array
    if (quotation.actions && quotation.actions.length > 0) {
      quotation.actions.forEach((action, index) => {
        const actionDate = new Date(action.timestamp);
        let title = '';
        let description = '';
        let icon = <ClockCircleOutlined />;
        let color = 'blue';

        switch (action.action) {
          case 'accept':
            title = 'Quotation Accepted';
            description = `Client accepted the quotation${action.reason ? ` - ${action.reason}` : ''}`;
            icon = <CheckCircleOutlined />;
            color = 'green';
            break;
          case 'reject':
            title = 'Quotation Rejected';
            description = `Client rejected the quotation${action.reason ? ` - ${action.reason}` : ''}`;
            icon = <CloseCircleOutlined />;
            color = 'red';
            break;
          case 'revision':
            if (action.reason === 'Admin sent revised quotation to client' || 
                action.reason === 'Admin updated quotation based on revision request') {
              title = 'Revision Received from Admin';
              description = 'Admin sent revised quotation back to client';
              icon = <EditOutlined />;
              color = 'green';
            } else {
              title = 'Revision Requested by Client';
              description = `Client requested changes${action.reason ? ` - ${action.reason}` : ''}`;
              icon = <ExclamationCircleOutlined />;
              color = 'orange';
            }
            break;
          default:
            title = `Action: ${action.action}`;
            description = action.reason || 'Action performed';
        }

        // Add client details if available
        if (quotation.clientName || quotation.clientEmail || quotation.clientPhone) {
          const clientDetails = [];
          if (quotation.clientName) clientDetails.push(`Name: ${quotation.clientName}`);
          if (quotation.clientEmail) clientDetails.push(`Email: ${quotation.clientEmail}`);
          if (quotation.clientPhone) clientDetails.push(`Phone: ${quotation.clientPhone}`);
          
          if (clientDetails.length > 0) {
            description += `\nClient Details: ${clientDetails.join(', ')}`;
          }
        }

        timelineItems.push({
          key: `action-${index}`,
          timestamp: actionDate,
          type: action.action,
          title,
          description,
          icon,
          color
        });
      });
    }

    // Sort by timestamp
    return timelineItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const detailedTimeline = createDetailedTimeline();

  return (
    <div style={{
      padding: 'clamp(40px, 6vw, 60px) 20px',
      background: isDark ? '#0f0f23' : 'white'
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
            Process & Timeline
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
          {/* Process Steps */}
          <Col xs={24} lg={12}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <RocketOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Our Process
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px', maxHeight: '500px', overflowY: 'auto' }}>
                {processSteps.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {processSteps.map((step, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '24px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: isDark ? '#ffffff' : '#1a202c',
                          marginBottom: '8px'
                        }}>
                          {step.title}
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: isDark ? '#cbd5e0' : '#4a5568',
                          lineHeight: '1.6'
                        }}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: isDark ? '#a0aec0' : '#6b7280'
                  }}>
                    <RocketOutlined style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      color: isDark ? '#4a5568' : '#d1d5db'
                    }} />
                    <div style={{ 
                      fontSize: '18px',
                      color: isDark ? '#cbd5e0' : '#4a5568',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      No Process Steps Available
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: isDark ? '#a0aec0' : '#9ca3af'
                    }}>
                      Process steps will be provided upon request.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Status Timeline */}
          <Col xs={24} lg={12}>
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
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <ClockCircleOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Status Timeline
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '24px', maxHeight: '500px', overflowY: 'auto' }}>
                <Timeline 
                  className={isDark ? 'dark-timeline' : ''}
                  items={detailedTimeline.map((item) => ({
                    color: item.color,
                    dot: (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color === 'green' ? '#10b981' : 
                               item.color === 'red' ? '#ef4444' : 
                               item.color === 'orange' ? '#f59e0b' : '#667eea',
                        fontSize: '20px',
                        border: 'none',
                        boxShadow: 'none'
                      }}>
                        {item.icon}
                      </div>
                    ),
                    children: (
                      <div style={{ 
                        marginBottom: '24px',
                        padding: '24px',
                        background: isDark ? '#2d3748' : '#f8fafc',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = isDark ? '#4a5568' : '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = isDark ? '#2d3748' : '#f8fafc';
                      }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ 
                            fontSize: '16px',
                            color: isDark ? '#ffffff' : '#1a202c',
                            fontWeight: '600'
                          }}>
                            {item.title}
                          </Text>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <Text style={{ 
                            fontSize: '14px',
                            color: isDark ? '#a0aec0' : '#6b7280',
                            fontWeight: '500'
                          }}>
                            {item.timestamp.toLocaleString()}
                          </Text>
                        </div>
                        <div>
                          <Text style={{ 
                            fontSize: '15px', 
                            whiteSpace: 'pre-line', 
                            lineHeight: '1.6',
                            color: isDark ? '#cbd5e0' : '#4a5568'
                          }}>
                            {item.description}
                          </Text>
                        </div>
                      </div>
                    )
                  }))}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Process Video Widget */}
        {processVideo && (
          <div style={{ marginTop: '60px' }}>
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <PlayCircleOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Process Video
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{
                  background: isDark ? '#2d3748' : '#f8fafc',
                  borderRadius: '16px',
                  padding: '24px',
                  border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  <Title level={4} style={{ 
                    color: isDark ? '#ffffff' : '#1a202c',
                    marginBottom: '20px',
                    fontSize: '20px',
                    textAlign: 'center'
                  }}>
                    Watch Our Process in Action
                  </Title>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '0',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#000'
                  }}>
                    <iframe
                      src={embedVideoUrl}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Process Video"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
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

export default LandingProcessSection;

