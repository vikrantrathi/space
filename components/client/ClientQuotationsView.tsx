'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Typography,
  Card,
  Button,
  Tooltip,
  theme,
  Modal,
  Form,
  Input,
  Space,
} from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import UnifiedSearchFilters from '@/components/shared/UnifiedSearchFilters';
import UnifiedSummaryCards from '@/components/shared/UnifiedSummaryCards';
import {
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import dayjs from 'dayjs';
 

const { Title, Text } = Typography;

interface Quotation {
  _id: string;
  title: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revision';
  clientName?: string;
  clientEmail?: string;
  projectDescription?: string;
  createdAt: string;
  updatedAt: string;
  actions: Array<{
    action: 'accept' | 'reject' | 'revision';
    reason?: string;
    timestamp: Date;
    verified: boolean;
  }>;
}

const ClientQuotationsView: React.FC = () => {
  const notification = useNotification();
  const { token } = theme.useToken();
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | 'revision' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionForm] = Form.useForm();
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Fetch quotations
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.LOGIN_FAILED;
        notification.error(msg.message, msg.description, msg.duration);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/client/user/quotations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuotations(data.quotations);
      } else {
        const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
        notification.error(msg.message, msg.description, msg.duration);
      }
    } catch {
      const msg = NOTIFICATION_MESSAGES.GENERAL.ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Search and filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleStatusFilterChange = (value: string | number | [string, string] | undefined) => {
    setStatusFilter(value as string);
  };

  const handleDateRangeChange = (value: string | number | [string, string] | undefined) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      setDateRange([
        start ? dayjs(start) : null,
        end ? dayjs(end) : null
      ]);
    } else {
      setDateRange(null);
    }
  };

  const handleRefresh = () => {
    fetchQuotations();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setDateRange(null);
  };

  // Filter quotations based on search and filters
  const getFilteredQuotations = () => {
    let filtered = quotations;

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(quotation => 
        quotation.title.toLowerCase().includes(searchLower) ||
        quotation.projectDescription?.toLowerCase().includes(searchLower) ||
        quotation.status.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(quotation => quotation.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(quotation => {
        const createdAt = dayjs(quotation.createdAt);
        return createdAt.isAfter(startDate) && createdAt.isBefore(endDate);
      });
    }

    return filtered;
  };

  // Summary cards data
  const summaryData = [
    {
      title: 'Total Quotations',
      value: quotations.length,
      icon: <FileTextOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Sent',
      value: quotations.filter(q => q.status === 'sent').length,
      icon: <EyeOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Accepted',
      value: quotations.filter(q => q.status === 'accepted').length,
      icon: <EyeOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Rejected',
      value: quotations.filter(q => q.status === 'rejected').length,
      icon: <EyeOutlined />,
      color: '#ff4d4f',
    },
  ];

  // Client action handlers (OTP flow)
  const openAction = (quotationId: string, action: 'accept' | 'reject' | 'revision') => {
    setSelectedQuotationId(quotationId);
    setSelectedAction(action);
    if (action === 'reject' || action === 'revision') {
      setActionModalOpen(true);
    } else {
      // Accept directly using logged-in user's info
      void submitActionDirect(quotationId, action);
    }
  };

  const submitActionDirect = async (
    quotationId: string,
    action: 'accept' | 'reject' | 'revision',
    reason?: string,
  ) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notification.error('Authentication Error', 'No token found. Please log in again.');
        setActionLoading(false);
        return;
      }
      const response = await fetch(`/api/client/user/quotation/${quotationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: user?.name,
          email: user?.email,
          phone: '',
          action,
          reason,
        }),
      });
      if (response.ok) {
        setActionModalOpen(false);
        actionForm.resetFields();
        notification.success('Done', 'Your response has been recorded.');
        fetchQuotations();
      } else {
        const err = await response.json();
        notification.error('Failed', err.error || 'Unable to send OTP.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const submitAction = async () => {
    const values = await actionForm.validateFields();
    if (!selectedQuotationId || !selectedAction) return;
    await submitActionDirect(selectedQuotationId, selectedAction, values.reason);
  };

  

  // Get status tag
  const getStatusTag = (status: string, quotation?: Quotation) => {
    switch (status) {
      case 'draft':
        return <Tag color="default">Draft</Tag>;
      case 'sent':
        return <Tag color="blue">Sent</Tag>;
      case 'accepted':
        return <Tag color="green">Accepted</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      case 'revision':
        // Check if the latest action was sent by admin
        const latestAction = quotation?.actions?.[quotation.actions.length - 1];
        const isAdminSent = latestAction?.reason?.includes('Admin sent revised quotation');
        return <Tag color="orange">{isAdminSent ? 'Revision Sent' : 'Revision Requested'}</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>
            System Template
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Quotation) => {
        if (record.status === 'sent' && (!record.actions || record.actions.length === 0)) {
          return <Tag color="blue">Waiting Approval</Tag>;
        }
        if (record.actions && record.actions.length > 0) {
          const latestAction = record.actions[record.actions.length - 1];
          
          // If status is 'sent' and latest action is revision with admin reason, it means admin sent revision back
          if (record.status === 'sent' && latestAction.action === 'revision' && 
              (latestAction.reason === 'Admin sent revised quotation to client' || 
               latestAction.reason === 'Admin updated quotation based on revision request')) {
            return <Tag color="blue">Revision Received</Tag>;
          }
          
          // If status is 'sent' and latest action is not revision, show waiting approval
          if (record.status === 'sent' && latestAction.action !== 'revision') {
            return <Tag color="blue">Waiting Approval</Tag>;
          }
          
          switch (latestAction.action) {
            case 'accept':
              return <Tag color="green">Approved</Tag>;
            case 'reject':
              return <Tag color="red">Rejected</Tag>;
            case 'revision':
              return <Tag color="orange">Revision Requested</Tag>;
            default:
              return <Tag>Unknown</Tag>;
          }
        }
        return getStatusTag(record.status, record);
      },
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record: Quotation) => {
        if (!record.actions || record.actions.length === 0) {
          return <Text type="secondary">No actions</Text>;
        }
        
        const latestAction = record.actions[record.actions.length - 1];
        const actionDate = new Date(latestAction.timestamp).toLocaleDateString();
        
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              {latestAction.action === 'accept' && <Tag color="green">Approved</Tag>}
              {latestAction.action === 'reject' && <Tag color="red">Rejected</Tag>}
              {latestAction.action === 'revision' && (
                (latestAction.reason === 'Admin sent revised quotation to client' || 
                 latestAction.reason === 'Admin updated quotation based on revision request') ? 
                <Tag color="blue">Revision Received</Tag> : 
                <Tag color="orange">Revision Requested</Tag>
              )}
            </div>
            <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
              {actionDate}
            </div>
            {record.actions.length > 1 && (
              <Button 
                type="link" 
                size="small" 
                style={{ padding: 0, fontSize: '11px', height: 'auto' }}
                onClick={() => {
                  const actionList = record.actions.map((action, index) => {
                    // Determine the display text and color based on action and reason
                    let displayText = '';
                    let tagColor = '';
                    
                    if (action.action === 'accept') {
                      displayText = 'Approved';
                      tagColor = 'green';
                    } else if (action.action === 'reject') {
                      displayText = 'Rejected';
                      tagColor = 'red';
                    } else if (action.action === 'revision') {
                      if (action.reason === 'Admin sent revised quotation to client' || 
                          action.reason === 'Admin updated quotation based on revision request') {
                        displayText = 'Revision Received';
                        tagColor = 'green';
                      } else {
                        displayText = 'Revision Requested';
                        tagColor = 'orange';
                      }
                    }
                    
                    return (
                      <div key={index} style={{ 
                        marginBottom: 12, 
                        padding: 12, 
                        backgroundColor: token.colorBgContainer,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: 6,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color={tagColor}>{displayText}</Tag>
                          <span style={{ 
                            fontSize: '12px', 
                            color: token.colorTextSecondary,
                            fontWeight: 'normal'
                          }}>
                            {new Date(action.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {action.reason && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: token.colorText,
                            lineHeight: '1.4',
                            marginTop: 4
                          }}>
                            {action.reason === 'Admin sent revised quotation to client' || 
                             action.reason === 'Admin updated quotation based on revision request' 
                              ? 'Revision received from admin' 
                              : action.reason}
                          </div>
                        )}
                      </div>
                    );
                  });
                  
                  Modal.info({
                    title: 'Quotation Timeline',
                    content: <div style={{ maxHeight: '400px', overflowY: 'auto' }}>{actionList}</div>,
                    width: 600,
                    styles: {
                      body: {
                        backgroundColor: token.colorBgElevated,
                        color: token.colorText
                      }
                    }
                  });
                }}
              >
                View Timeline ({record.actions.length})
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Quotation) => (
        <div>
          {record.status === 'accepted' ? (
            <div>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green">Accepted</Tag>
                <div style={{ fontSize: '12px', marginTop: 4 }}>
                  {(() => {
                    const accepted = record.actions?.filter(a => a.action === 'accept').slice(-1)[0];
                    const date = accepted?.timestamp ? new Date(accepted.timestamp) : new Date(record.updatedAt || record.createdAt);
                    return `on ${date.toLocaleDateString()}`;
                  })()}
                </div>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Tooltip title="View Quotation">
                  <Button
                    type="default"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(`/quotation/${record._id}`, '_blank')}
                  >
                    View
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <>
          <div style={{ marginBottom: '4px' }}>
            <Tooltip title="View Quotation">
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(`/quotation/${record._id}`, '_blank')}
              >
                View
              </Button>
            </Tooltip>
          </div>
          {(record.status === 'sent' || record.status === 'revision') && (() => {
            // Check if client has requested revision
            const hasClientRevision = record.actions?.some(action => 
              action.action === 'revision' && 
              action.reason !== 'Admin sent revised quotation to client' && 
              action.reason !== 'Admin updated quotation based on revision request'
            );
            
            // Check if admin sent revision back (status could be 'sent' or 'revision')
            const hasAdminRevision = record.actions?.some(action => 
              action.action === 'revision' && 
              (action.reason === 'Admin sent revised quotation to client' || 
               action.reason === 'Admin updated quotation based on revision request')
            );
            
            // If client has requested revision AND admin hasn't sent revision back, show disabled message
            if (hasClientRevision && !hasAdminRevision) {
              return (
                <div style={{ marginTop: 8 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: token.colorTextSecondary,
                    marginBottom: 4,
                    fontStyle: 'italic'
                  }}>
                    Actions Disabled till Revision Received from admin
                  </div>
                </div>
              );
            }
            
            // Otherwise show action buttons
            return (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="small" type="primary" onClick={() => openAction(record._id, 'accept')} className="w-full sm:w-auto">Approve</Button>
                <Button size="small" danger onClick={() => openAction(record._id, 'reject')} className="w-full sm:w-auto">Reject</Button>
                {(!hasClientRevision || hasAdminRevision) && (
                  <Button size="small" onClick={() => openAction(record._id, 'revision')} className="w-full sm:w-auto">Request Revision</Button>
                )}
              </div>
            );
          })()}
            </>
          )}
          {record.actions && record.actions.length > 0 && (
            <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
              <div>Last action: <strong>{record.actions[record.actions.length - 1].action}</strong></div>
              <div>{new Date(record.actions[record.actions.length - 1].timestamp).toLocaleDateString()}</div>
              {record.actions[record.actions.length - 1].verified && (
                <Tag color="green">Verified</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="px-2 md:px-0">
      <div className="mb-6">
        <Title level={2} className="text-lg md:text-2xl">
          <FileTextOutlined style={{ marginRight: 8 }} />
          My Quotations
        </Title>
        <Text type="secondary" style={{ display: 'block' }} className="text-sm md:text-base">
          View and manage your quotations
        </Text>
      </div>

      {/* Summary Cards */}
      <UnifiedSummaryCards
        data={summaryData}
        loading={loading}
        style={{ marginBottom: 24 }}
      />

      {/* Search and Filters */}
      <UnifiedSearchFilters
        searchText={searchText}
        onSearchTextChange={handleSearchChange}
        searchPlaceholder="Search quotations by title, description, or status..."
        filters={[
          {
            key: 'status',
            type: 'select',
            placeholder: 'Filter by status',
            value: statusFilter,
            onChange: handleStatusFilterChange,
            options: [
              { value: '', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'revision', label: 'Revision' },
            ],
          },
          {
            key: 'dateRange',
            type: 'dateRange',
            value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
            onChange: handleDateRangeChange,
          },
        ]}
        onRefresh={handleRefresh}
        onReset={handleResetFilters}
        loading={loading}
      />

      <UnifiedTable
        columns={columns}
        dataSource={getFilteredQuotations()}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} quotations`,
        }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'No quotations found' }}
      />
      {/* Action Modal */}
      <Modal
        title={selectedAction ? `Confirm ${selectedAction === 'accept' ? 'Approval' : selectedAction === 'reject' ? 'Rejection' : 'Revision Request'}` : 'Respond to Quotation'}
        open={actionModalOpen}
        onCancel={() => { setActionModalOpen(false); actionForm.resetFields(); }}
        onOk={submitAction}
        confirmLoading={actionLoading}
        okText="Submit"
      >
        <Form layout="vertical" form={actionForm}>
          {selectedAction && (selectedAction === 'reject' || selectedAction === 'revision') && (
            <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please provide a reason' }]}> 
              <Input.TextArea rows={3} placeholder="Provide reason" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* OTP flow removed for dashboard actions */}
    </div>
  );
};

export default ClientQuotationsView;