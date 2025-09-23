'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Tag,
  Select,
  Space,
  Card,
  Typography,
  Tooltip,
  Tabs,
  App,
  theme,
} from 'antd';
import type { TablePaginationConfig } from 'antd';
import UnifiedTable from '@/components/shared/UnifiedTable';
import UnifiedSearchFilters from '@/components/shared/UnifiedSearchFilters';
import UnifiedSummaryCards from '@/components/shared/UnifiedSummaryCards';
import { exportQuotations } from '@/utils/exportUtils';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth/auth-context';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isApproved: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface QuotationAction {
  action: string;
  timestamp: string;
  userId?: string;
  notes?: string;
  reason?: string;
  userName?: string;
  userEmail?: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  adminEmail?: string;
  metadata?: {
    quotationId?: string;
    action?: string;
    reason?: string;
    [key: string]: unknown;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface Quotation {
  _id: string;
  title: string;
  templateType?: 'landing' | 'dashboard';
  features: string[];
  benefits: string[];
  pricing?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revision';
  associatedUser?: {
    _id: string;
    name: string;
    email: string;
  };
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  projectDescription?: string;
  paymentTerms?: string;
  quotationValidity?: number;
  actions?: QuotationAction[];
  statusTimeline?: Array<{
    status: string;
    date: Date;
    description: string;
  }>;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ActionData {
  userId?: string;
}

interface ActivityWithTimestamp {
  createdAt?: string;
  timestamp?: string;
  type: string;
  [key: string]: unknown;
}

const AdminQuotationsView: React.FC = () => {
  const { modal, notification } = App.useApp();
  const { token } = theme.useToken();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} quotations`,
  });

  // Fetch quotations
  const fetchQuotations = useCallback(async () => {
    if (isFetchingRef.current) {
      return; // Prevent duplicate calls
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    try {
      // Get token from localStorage (handled by auth context)
      const token = localStorage.getItem('token');

      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'No authentication token found. Please log in again.',
          duration: 4,
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/quotations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuotations(data.quotations || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        notification.error({
          message: 'Failed to Fetch Quotations',
          description: 'Unable to load quotation data. Please try again.',
          duration: 4,
        });
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      notification.error({
        message: 'Error Fetching Quotations',
        description: 'Network error occurred while loading quotations.',
        duration: 4,
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove notification dependency to prevent unnecessary re-renders

  // Fetch users for association
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users.filter((u: User) => u.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filter quotations based on active tab, search text, and filters
  const getFilteredQuotations = () => {
    let filtered = quotations;

    // Apply tab filter
    if (activeTab === 'draft') {
      filtered = filtered.filter(q => q.status === 'draft');
    } else if (activeTab === 'sent') {
      filtered = filtered.filter(q => q.status === 'sent');
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.clientName?.toLowerCase().includes(searchLower) ||
        q.clientEmail?.toLowerCase().includes(searchLower) ||
        q.clientCompany?.toLowerCase().includes(searchLower) ||
        q.projectDescription?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(q => {
        const createdAt = dayjs(q.createdAt);
        return createdAt.isAfter(startDate) && createdAt.isBefore(endDate);
      });
    }

    return filtered;
  };

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  // Export function
  const handleExport = () => {
    setExportLoading(true);
    try {
      const filteredData = getFilteredQuotations();
      exportQuotations(filteredData, `quotations_${new Date().toISOString().split('T')[0]}.csv`);
      notification.success({
        message: 'Export Successful',
        description: `Exported ${filteredData.length} quotations to CSV`,
        duration: 3,
      });
    } catch (error) {
      notification.error({
        message: 'Export Failed',
        description: 'Failed to export quotations. Please try again.',
        duration: 4,
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Filter handlers
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

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setDateRange(null);
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
      title: 'Draft Quotations',
      value: quotations.filter(q => q.status === 'draft').length,
      icon: <FileTextOutlined />,
      color: '#faad14',
    },
    {
      title: 'Sent Quotations',
      value: quotations.filter(q => q.status === 'sent').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Accepted Quotations',
      value: quotations.filter(q => q.status === 'accepted').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Rejected Quotations',
      value: quotations.filter(q => q.status === 'rejected').length,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
    },
    {
      title: 'Total Views',
      value: quotations.reduce((sum, q) => sum + (q.viewCount || 0), 0),
      icon: <EyeOutlined />,
      color: '#722ed1',
    },
  ];

  // Ref to prevent multiple rapid API calls
  const isFetchingRef = useRef(false);
  
  // Removed debounced function to prevent unnecessary re-renders

  useEffect(() => {
    fetchQuotations();
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Removed automatic refresh on tab switch to prevent unwanted refreshes
  // Data will be refreshed only when explicitly needed (actions, filters, etc.)

  // Handle quotation actions
  const handleQuotationAction = async (quotationId: string, action: string, data?: ActionData) => {
    setActionLoading(quotationId);
    try {
      // Get token from localStorage (handled by auth context)
      const token = localStorage.getItem('token');

      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'No authentication token found. Please log in again.',
          duration: 4,
        });
        setActionLoading(null);
        return;
      }

      let url = '/api/admin/quotations';
      let method: 'POST' | 'PUT' | 'DELETE' = 'POST';
      let body: Record<string, unknown> | undefined = {
        action,
        quotationId,
        adminId: currentUser?.id,
      };

      if (action === 'delete') {
        url = `/api/admin/quotations/${quotationId}`;
        method = 'DELETE';
        body = undefined;
      } else if (action === 'send') {
        url = `/api/admin/quotations/${quotationId}`;
        method = 'PUT';
        body = { status: 'sent' };
      } else if (action === 'send_revision') {
        url = `/api/admin/quotations/${quotationId}`;
        method = 'PUT';
        body = { status: 'sent', isRevision: true };
      } else if (action === 'associate') {
        url = `/api/admin/quotations/${quotationId}`;
        method = 'PUT';
        body = { associatedUserId: data?.userId };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        await response.json();
        notification.success({
          message: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful`,
          description: `Quotation ${action} action completed successfully.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });

        await fetchQuotations(); // Refresh the list
      } else {
        notification.error({
          message: `Failed to ${action} Quotation`,
          description: 'Unable to complete the requested action.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      notification.error({
        message: `Error Performing ${action} Action`,
        description: 'Network error occurred. Please try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setActionLoading(null);
    }
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
      render: (title: string, record: Quotation) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>
            {record.templateType ? `${record.templateType.charAt(0).toUpperCase() + record.templateType.slice(1)} Template` : 'Landing Template'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Quotation) => getStatusTag(status, record),
    },
    {
      title: 'Associated User',
      key: 'associatedUser',
      render: (record: Quotation) => (
        record.associatedUser ? (
          <div>
            <div>{record.associatedUser.name}</div>
            <div style={{ color: token.colorTextSecondary, fontSize: '12px' }}>{record.associatedUser.email}</div>
          </div>
        ) : (
          <Text type="secondary">Not associated</Text>
        )
      ),
    },
    {
      title: 'Client Actions & Views',
      key: 'actions',
      render: (record: Quotation) => {
        const hasActions = record.actions && record.actions.length > 0;
        const hasViews = record.viewCount && record.viewCount > 0;
        
        if (!hasActions && !hasViews) {
          return <Text type="secondary">No activity</Text>;
        }
        
        return (
          <div>
            {hasActions && (
              <div style={{ marginBottom: hasViews ? 8 : 0 }}>
                {(() => {
                  const latestAction = record.actions![record.actions!.length - 1];
        const actionDate = new Date(latestAction.timestamp).toLocaleDateString();
        
        return (
          <div>
            <div style={{ fontSize: '12px', color: token.colorTextSecondary, marginBottom: 4 }}>
              {actionDate}
            </div>
            {latestAction.reason && (
              <Tooltip title={latestAction.reason} placement="topLeft">
                <div style={{ 
                  fontSize: '11px', 
                  color: token.colorTextTertiary, 
                  marginTop: 2,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'help'
                }}>
                  {latestAction.reason}
                </div>
              </Tooltip>
            )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {hasViews && (
              <div style={{ 
                fontSize: '12px', 
                color: token.colorTextSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <EyeOutlined />
                <span>{record.viewCount} view{record.viewCount && record.viewCount > 1 ? 's' : ''}</span>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, fontSize: '10px', height: 'auto', marginLeft: 4 }}
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/activities?type=quotation_viewed&quotationId=${record._id}`);
                      const data = await response.json();
                      
                      const viewList = data.activities.map((view: Activity, index: number) => (
                        <div key={index} style={{ 
                          marginBottom: 12, 
                          padding: 12, 
                          backgroundColor: token.colorBgContainer,
                          border: `1px solid ${token.colorBorder}`,
                          borderRadius: 6,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag color="blue">Viewed</Tag>
                            <span style={{ 
                              fontSize: '12px', 
                              color: token.colorTextSecondary,
                              fontWeight: 'normal'
                            }}>
                              {new Date(view.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: token.colorText,
                            lineHeight: '1.4',
                            marginBottom: 4
                          }}>
                            {view.description}
                          </div>
                          {view.ipAddress && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: token.colorTextTertiary,
                              marginTop: 4,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <span>🌐 IP: {view.ipAddress}</span>
                            </div>
                          )}
                          {view.userAgent && (
                            <div style={{ 
                              fontSize: '10px', 
                              color: token.colorTextTertiary,
                              marginTop: 2,
                              fontStyle: 'italic'
                            }}>
                              {view.userAgent}
                            </div>
                          )}
                        </div>
                      ));
                      
                      modal.info({
                        title: `Quotation Views (${record.title})`,
                        content: <div style={{ maxHeight: '400px', overflowY: 'auto' }}>{viewList}</div>,
                        width: 800,
                        styles: {
                          body: {
                            backgroundColor: token.colorBgElevated,
                            color: token.colorText
                          }
                        }
                      });
                    } catch (error) {
                      console.error('Failed to fetch views:', error);
                      notification.error({ message: 'Failed to load view details' });
                    }
                  }}
                >
                  (details)
                </Button>
              </div>
            )}
            
            {hasActions && record.actions!.length > 1 && !hasViews ? (
              <Button 
                type="link" 
                size="small" 
                style={{ padding: 0, fontSize: '11px', height: 'auto', marginTop: 4 }}
                onClick={() => {
                  const actionList = record.actions!.map((action: QuotationAction, index: number) => (
                    <div key={index} style={{ 
                      marginBottom: 12, 
                      padding: 12, 
                      backgroundColor: token.colorBgContainer,
                      border: `1px solid ${token.colorBorder}`,
                      borderRadius: 6,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {action.action === 'accept' && <Tag color="green">Accepted</Tag>}
                        {action.action === 'reject' && <Tag color="red">Rejected</Tag>}
                        {action.action === 'revision' && <Tag color="orange">Revision Requested</Tag>}
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
                          {action.reason}
                        </div>
                      )}
                    </div>
                  ));
                  
                  modal.info({
                    title: 'All Client Actions',
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
                View All ({record.actions!.length})
              </Button>
            ) : null}
            
            {(hasActions && record.actions!.length > 1) || hasViews ? (
              <Button 
                type="link" 
                size="small" 
                style={{ padding: 0, fontSize: '11px', height: 'auto', marginTop: 4 }}
                onClick={async () => {
                  try {
                    // Fetch both views and actions
                    const [viewsResponse, actionsResponse] = await Promise.all([
                      fetch(`/api/admin/activities?type=quotation_viewed&quotationId=${record._id}`),
                      fetch(`/api/admin/activities?type=quotation_action&quotationId=${record._id}`)
                    ]);
                    
                    const viewsData = await viewsResponse.json();
                    const actionsData = await actionsResponse.json();
                    
                    // Use only activities from Activity collection to avoid duplicates
                    const allActivities = actionsData.activities
                      .filter((activity: Activity) => activity.type !== 'view') // Filter out view activities
                      .map((action: Activity) => ({ ...action, type: 'action' }))
                      .sort((a: Activity, b: Activity) => {
                        const aTime = new Date(a.createdAt || (a as unknown as ActivityWithTimestamp).timestamp || '').getTime();
                        const bTime = new Date(b.createdAt || (b as unknown as ActivityWithTimestamp).timestamp || '').getTime();
                        return bTime - aTime;
                      });
                    
                    // Create comprehensive timeline
                    const createTimeline = () => {
                      const timelineItems = [];
                      
                      // Add quotation creation
                      timelineItems.push({
                        key: 'created',
                        timestamp: new Date(record.createdAt),
                        type: 'created',
                        title: 'Quotation Created',
                        description: 'Quotation was created and saved',
                        icon: '📝',
                        color: 'blue'
                      });

                      // Add quotation sent to client
                      if (record.statusTimeline) {
                        const sentEntry = record.statusTimeline.find((item: { status: string; date: Date; description: string }) => item.status === 'sent');
                        if (sentEntry) {
                          timelineItems.push({
                            key: 'sent',
                            timestamp: new Date(sentEntry.date),
                            type: 'sent',
                            title: 'Quotation Sent to Client',
                            description: 'Quotation was sent to client for review',
                            icon: '📤',
                            color: 'blue'
                          });
                        }
                      }

                      // Add actions from actions array
                      if (record.actions && record.actions.length > 0) {
                        record.actions.forEach((action, index) => {
                          const actionDate = new Date(action.timestamp);
                          let title = '';
                          let description = '';
                          let icon = '⏰';
                          let color = 'blue';

                          switch (action.action) {
                            case 'accept':
                              title = 'Quotation Accepted';
                              description = `Client accepted the quotation${action.reason ? ` - ${action.reason}` : ''}`;
                              icon = '✅';
                              color = 'green';
                              break;
                            case 'reject':
                              title = 'Quotation Rejected';
                              description = `Client rejected the quotation${action.reason ? ` - ${action.reason}` : ''}`;
                              icon = '❌';
                              color = 'red';
                              break;
                            case 'revision':
                              if (action.reason === 'Admin sent revised quotation to client' || 
                                  action.reason === 'Admin updated quotation based on revision request') {
                                title = 'Revision Received from Admin';
                                description = 'Admin sent revised quotation back to client';
                                icon = '✏️';
                                color = 'green';
                              } else {
                                title = 'Revision Requested by Client';
                                description = `Client requested changes${action.reason ? ` - ${action.reason}` : ''}`;
                                icon = '⚠️';
                                color = 'orange';
                              }
                              break;
                            default:
                              title = `Action: ${action.action}`;
                              description = action.reason || 'Action performed';
                          }

                          // Add client details if available
                          if (record.clientName || record.clientEmail || record.clientPhone) {
                            const clientDetails = [];
                            if (record.clientName) clientDetails.push(`Name: ${record.clientName}`);
                            if (record.clientEmail) clientDetails.push(`Email: ${record.clientEmail}`);
                            if (record.clientPhone) clientDetails.push(`Phone: ${record.clientPhone}`);
                            
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

                      // Add activities from Activity collection
                      allActivities.forEach((activity: Activity & { type: string }, index: number) => {
                        const activityDate = new Date(activity.createdAt || (activity as unknown as ActivityWithTimestamp).timestamp || '');
                        let title = '';
                        let description = activity.description || '';
                        let icon = '📋';
                        let color = 'blue';

                        if (activity.type === 'action' && activity.metadata?.action) {
                          switch (activity.metadata.action) {
                            case 'accept':
                              title = 'Quotation Accepted';
                              icon = '✅';
                              color = 'green';
                              break;
                            case 'reject':
                              title = 'Quotation Rejected';
                              icon = '❌';
                              color = 'red';
                              break;
                            case 'revision':
                              if (activity.metadata.reason === 'Admin sent revised quotation to client' || 
                                  activity.metadata.reason === 'Admin updated quotation based on revision request') {
                                title = 'Revision Received from Admin';
                                icon = '✏️';
                                color = 'green';
                              } else {
                                title = 'Revision Requested by Client';
                                icon = '⚠️';
                                color = 'orange';
                              }
                              break;
                            default:
                              title = `Action: ${activity.metadata.action}`;
                          }
                        } else {
                          title = 'Activity Log';
                        }

                        // Add client details from activity metadata
                        if (activity.metadata && (activity.metadata as { clientName?: string })?.clientName) {
                          const clientDetails = [];
                          const metadata = activity.metadata as { clientName?: string; clientEmail?: string; clientPhone?: string };
                          if (metadata.clientName) clientDetails.push(`Name: ${metadata.clientName}`);
                          if (metadata.clientEmail) clientDetails.push(`Email: ${metadata.clientEmail}`);
                          if (metadata.clientPhone) clientDetails.push(`Phone: ${metadata.clientPhone}`);
                          
                          if (clientDetails.length > 0) {
                            description += `\nClient Details: ${clientDetails.join(', ')}`;
                          }
                        }

                        // Add IP and User Agent info
                        if (activity.ipAddress) {
                          description += `\n🌐 IP: ${activity.ipAddress}`;
                        }
                        if (activity.userAgent) {
                          description += `\nUser Agent: ${activity.userAgent}`;
                        }

                        timelineItems.push({
                          key: `activity-${index}`,
                          timestamp: activityDate,
                          type: 'activity',
                          title,
                          description,
                          icon,
                          color
                        });
                      });

                      // Sort by timestamp
                      return timelineItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                    };

                    const timelineItems = createTimeline();
                    
                    const activityList = timelineItems.map((item, index) => (
                      <div key={item.key} style={{ 
                        marginBottom: 16, 
                        padding: 16, 
                        backgroundColor: token.colorBgContainer,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ 
                            fontSize: '20px', 
                            marginTop: 2,
                            flexShrink: 0
                          }}>
                            {item.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 6 }}>
                              <Text strong style={{ fontSize: '14px', color: item.color === 'green' ? '#52c41a' : item.color === 'red' ? '#ff4d4f' : item.color === 'orange' ? '#fa8c16' : token.colorText }}>
                                {item.title}
                              </Text>
                            </div>
                            <div style={{ marginBottom: 6 }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {item.timestamp.toLocaleString()}
                              </Text>
                            </div>
                            <div>
                              <Text style={{ fontSize: '13px', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                                {item.description}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                    
                    modal.info({
                      title: 'All Client Activity',
                      content: <div style={{ maxHeight: '400px', overflowY: 'auto' }}>{activityList}</div>,
                      width: 800,
                      styles: {
                        body: {
                          backgroundColor: token.colorBgElevated,
                          color: token.colorText
                        }
                      }
                    });
                  } catch (error) {
                    console.error('Failed to fetch activities:', error);
                    notification.error({ message: 'Failed to load activities' });
                  }
                }}
              >
                View all activity
              </Button>
            ) : null}
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
        <div className="flex flex-col sm:flex-row gap-1">
          <Tooltip title="Edit Quotation">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                router.push(`/dashboard/admin/quotations/create?id=${record._id}`);
              }}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Tooltip>
          <Tooltip title="View Quotation">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/quotation/${record._id}`, '_blank')}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">View</span>
            </Button>
          </Tooltip>
          {record.status === 'draft' && (
            <>
              {record.actions && record.actions.some((action: QuotationAction) => action.action === 'revision') ? (
                <Tooltip title="Send Revision to Client">
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    loading={actionLoading === record._id}
                    onClick={() => handleQuotationAction(record._id, 'send_revision')}
                    style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Send Revision</span>
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip title="Send Quotation">
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    loading={actionLoading === record._id}
                    onClick={() => handleQuotationAction(record._id, 'send')}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </Tooltip>
              )}
            </>
          )}
          {/* Copy public view link for sharing */}
          <Tooltip title="Copy public link">
            <Button
              type="default"
              size="small"
              icon={<SendOutlined />}
              onClick={async () => {
                const url = `${window.location.origin}/quotation/${record._id}`;
                try {
                  await navigator.clipboard.writeText(url);
                  notification.success({ message: 'Link copied', description: 'Public quotation link copied to clipboard.' });
                } catch (error) {
                  console.error('Failed to copy to clipboard:', error);
                  // Fallback prompt
                  window.prompt('Copy link', url);
                }
              }}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Copy Link</span>
            </Button>
          </Tooltip>
          {!record.associatedUser && (
            <Tooltip title="Associate with User">
              <Button
                type="default"
                size="small"
                icon={<UserOutlined />}
                className="w-full sm:w-auto"
                onClick={() => {
                  // Show user selection modal - exclude current admin
                  const userOptions = users
                    .filter(u => u._id !== currentUser?.id)
                    .map(u => ({ label: `${u.name} (${u.email})`, value: u._id }));
                  let selectedUserId: string | null = null;
                  
                  modal.confirm({
                    title: 'Associate Quotation with User',
                    content: (
                      <Select
                        placeholder="Select user"
                        style={{ width: '100%' }}
                        options={userOptions}
                        onChange={(userId) => { selectedUserId = userId; }}
                      />
                    ),
                    okText: 'Associate',
                    cancelText: 'Cancel',
                    onOk: () => {
                      if (selectedUserId) {
                        handleQuotationAction(record._id, 'associate', { userId: selectedUserId });
                      }
                    },
                  });
                }}
              >
                <span className="hidden sm:inline">Associate</span>
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Delete Quotation">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={actionLoading === record._id}
              className="w-full sm:w-auto"
              onClick={() => {
                modal.confirm({
                  title: 'Delete Quotation',
                  content: `Are you sure you want to permanently delete "${record.title}"? This action cannot be undone.`,
                  okText: 'Delete',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk: () => handleQuotationAction(record._id, 'delete'),
                });
              }}
            >
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <FileTextOutlined />
          All Quotations ({quotations.length})
        </span>
      ),
      children: (
        <>
          <UnifiedSearchFilters
            searchText={searchText}
            onSearchTextChange={handleSearchChange}
            searchPlaceholder="Search quotations by title, client, or description..."
            filters={[
              {
                key: 'status',
                type: 'select',
                placeholder: 'Filter by status',
                value: statusFilter,
                onChange: handleStatusFilterChange,
                options: [
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
            onExport={handleExport}
            onReset={handleResetFilters}
            loading={loading}
            exportLoading={exportLoading}
          />
        <UnifiedTable
          columns={columns}
            dataSource={getFilteredQuotations()}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
        </>
      ),
    },
    {
      key: 'draft',
      label: (
        <span>
          <FileTextOutlined />
          Draft ({quotations.filter(q => q.status === 'draft').length})
        </span>
      ),
      children: (
        <>
          <UnifiedSearchFilters
            searchText={searchText}
            onSearchTextChange={handleSearchChange}
            searchPlaceholder="Search draft quotations..."
            filters={[
              {
                key: 'dateRange',
                type: 'dateRange',
                value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
                onChange: handleDateRangeChange,
              },
            ]}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onReset={handleResetFilters}
            loading={loading}
            exportLoading={exportLoading}
          />
        <UnifiedTable
          columns={columns}
          dataSource={getFilteredQuotations()}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No draft quotations' }}
        />
        </>
      ),
    },
    {
      key: 'sent',
      label: (
        <span>
          <SendOutlined />
          Sent ({quotations.filter(q => q.status === 'sent').length})
        </span>
      ),
      children: (
        <>
          <UnifiedSearchFilters
            searchText={searchText}
            onSearchTextChange={handleSearchChange}
            searchPlaceholder="Search sent quotations..."
            filters={[
              {
                key: 'dateRange',
                type: 'dateRange',
                value: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : undefined,
                onChange: handleDateRangeChange,
              },
            ]}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onReset={handleResetFilters}
            loading={loading}
            exportLoading={exportLoading}
          />
        <UnifiedTable
          columns={columns}
          dataSource={getFilteredQuotations()}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No sent quotations' }}
        />
        </>
      ),
    },
  ];

  return (
    <div className="px-2 md:px-0">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
        <div className="mb-4 lg:mb-0">
          <Title level={2} className="text-lg md:text-2xl">
            <FileTextOutlined style={{ marginRight: 8 }} />
            Quotation Management
          </Title>
          <Text type="secondary" style={{ display: 'block' }} className="text-sm md:text-base">
            Create, manage, and track quotations
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => router.push('/dashboard/admin/quotations/standard-content')}
            size="large"
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Standard Content</span>
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/dashboard/admin/quotations/create')}
            size="large"
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Create Quotation</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <UnifiedSummaryCards 
        data={summaryData}
        loading={loading}
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default AdminQuotationsView;