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

interface ProcessWorkflowTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  getStatusColor: (status: string) => string;
}

const ProcessWorkflowTab: React.FC<ProcessWorkflowTabProps> = ({
  quotation,
  standardContent,
  getStatusColor
}) => {
  // Merge process steps with standard content
  const processSteps = quotation.processSteps?.length ? quotation.processSteps : (standardContent?.processSteps || []);
  const processVideo = quotation.processVideo || standardContent?.processVideo;

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
    <Row gutter={[24, 24]}>
      {/* Process Steps */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <RocketOutlined />
              Our Process
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)'
          }}
        >
          <Steps direction="vertical" size="small">
            {processSteps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                icon={<RocketOutlined />}
                status="process"
                style={{
                  padding: '12px',
                  background: 'var(--ant-color-fill-quaternary)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid var(--ant-color-border)'
                }}
              />
            ))}
          </Steps>
          {processVideo && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              style={{ marginTop: '16px', width: '100%', borderRadius: '8px' }}
              onClick={() => window.open(processVideo, '_blank')}
            >
              Watch Process Video
            </Button>
          )}
        </Card>
      </Col>

      {/* Status Timeline */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <ClockCircleOutlined />
              Status Timeline
            </Space>
          } 
          style={{
            borderRadius: '12px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)'
          }}
        >
          <Timeline 
            items={detailedTimeline.map((item) => ({
              color: item.color,
              dot: item.icon,
              children: (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      {item.title}
                    </Text>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.timestamp.toLocaleString()}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>
                      {item.description}
                    </Text>
                  </div>
                </div>
              )
            }))}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ProcessWorkflowTab;
