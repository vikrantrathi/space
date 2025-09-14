'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Form,
  Input,
  Button,
  Space,
  Card,
  Typography,
  App,
  Select,
  Spin,
  DatePicker,
  InputNumber,
  Upload,
  AutoComplete,
  Avatar,
  theme,
} from 'antd';
import {
  FileTextOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { CreateQuotationFormData, PricingItem, PaymentMilestone, Client } from './types';
import { useStandardContent, useClientSearch, usePricingCalculations } from './hooks';
import { countries } from '@/lib/data/countries';
import { QuantityPricingSection } from './shared/FormSections';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Custom Terms Input Component
const TermsInputComponent: React.FC<{ value?: string[]; onChange?: (value: string[]) => void }> = ({ value = [], onChange }) => {
  const [currentTerm, setCurrentTerm] = useState('');
  const { token } = theme.useToken();

  const addTerm = () => {
    if (currentTerm.trim() && !value.includes(currentTerm.trim())) {
      const newTerms = [...value, currentTerm.trim()];
      onChange?.(newTerms);
      setCurrentTerm('');
    }
  };

  const removeTerm = (index: number) => {
    const newTerms = value.filter((_, i) => i !== index);
    onChange?.(newTerms);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTerm();
    }
  };

  return (
    <div style={{ 
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      padding: token.paddingSM,
      minHeight: '40px',
      backgroundColor: token.colorBgContainer
    }}>
      {/* Display existing terms */}
      <div style={{ marginBottom: token.marginXS, display: 'flex', flexWrap: 'wrap', gap: token.marginXXS }}>
        {value.map((term, index) => (
          <div
            key={index}
            style={{
              background: token.colorFillSecondary,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusSM,
              padding: `${token.paddingXXS}px ${token.paddingXS}px`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: token.marginXXS,
              fontSize: token.fontSizeSM,
              color: token.colorText
            }}
          >
            <span>{term}</span>
            <span
              onClick={() => removeTerm(index)}
              style={{
                cursor: 'pointer',
                color: token.colorTextTertiary,
                fontSize: token.fontSizeLG,
                fontWeight: 'bold',
                marginLeft: token.marginXXS
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = token.colorText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = token.colorTextTertiary;
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>
      
      {/* Input for new term */}
      <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}>
        <Input
          value={currentTerm}
          onChange={(e) => setCurrentTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a term and press Enter to add it"
          size="large"
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          onClick={addTerm}
          disabled={!currentTerm.trim() || value.includes(currentTerm.trim())}
          size="large"
        >
          Add Term
        </Button>
      </div>
    </div>
  );
};

const uploadProps = {
  name: 'file',
  action: '/api/upload',
  headers: {
    authorization: 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('token') : ''),
  },
  data: {
    type: 'image'
  },
};

const AdminEditQuotationForm: React.FC = () => {
  const { notification } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [templateType, setTemplateType] = useState<'landing' | 'dashboard'>('landing');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR'>('USD');
  const [pricingKey, setPricingKey] = useState(0);

  const { standardContent, fetchStandardContent } = useStandardContent();
  const {
    clients,
    clientSearchValue,
    setClientSearchValue,
    clientSearchLoading,
    selectedClient,
    setSelectedClient,
    isClientAssociated,
    setIsClientAssociated,
    handleClientSearch,
    handleClientSelect,
    clearClientSelection,
  } = useClientSearch();
  const { getCurrencySymbol, getCurrencyPrefix, calculateRowTotal, calculateMilestoneAmount, getMilestoneAmount } = usePricingCalculations(form, selectedCurrency);

  // Get quotation ID from URL params
  const quotationId = searchParams.get('id');

  // Handle currency change
  const handleCurrencyChange = (value: 'USD' | 'INR') => {
    setSelectedCurrency(value);
    form.setFieldsValue({ currency: value });
    setPricingKey(prev => prev + 1);
  };

  // Handle template type change
  const handleTemplateTypeChange = (value: 'landing' | 'dashboard') => {
    setTemplateType(value);
    // No autofill - let user enter their own data
  };

  // Check client association
  const checkClientAssociation = async (clientId: string) => {
    if (!quotationId) {
      setIsClientAssociated(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/quotations/${quotationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsClientAssociated(data.quotation?.associatedUser?.toString() === clientId);
      }
    } catch (error) {
      console.error('Error checking client association:', error);
      setIsClientAssociated(false);
    }
  };

  // Fetch quotation data for editing
  const fetchQuotationData = async () => {
    if (!quotationId) {
      console.error('No quotation ID provided');
      notification.error({
        message: 'Invalid Quotation ID',
        description: 'No quotation ID found in URL parameters.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
      router.push('/dashboard/admin/quotations');
      return;
    }
    
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'No authentication token found. Please log in again.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
        return;
      }

      // Fetching quotation data
      const response = await fetch(`/api/admin/quotations/${quotationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Response received

      if (response.ok) {
        const data = await response.json();
        // Quotation data loaded successfully
        const quotation = data.quotation;

        if (quotation) {
          const templateTypeValue = quotation.templateType || 'landing';
          const currencyValue = quotation.currency || 'USD';
          setTemplateType(templateTypeValue);
          setSelectedCurrency(currencyValue);
          
          if (!quotation.currency) {
            form.setFieldsValue({ currency: 'USD' });
          }

          // Recompute missing derived pricing fields
          const recomputedPricing = (quotation.quantityPricing || []).map((row: PricingItem) => {
            const quantity = Number(row?.quantity) || 0;
            const price = Number(row?.price) || 0;
            const discountPercentage = Number(row?.discountPercentage) || 0;
            const taxPercentage = Number(row?.taxPercentage) || 0;
            const discountedPrice = isFinite(Number(row?.discountedPrice)) ? Number(row?.discountedPrice) : price * (1 - discountPercentage / 100);
            const subtotal = isFinite(Number(row?.subtotal)) ? Number(row?.subtotal) : quantity * discountedPrice;
            const taxAmount = isFinite(Number(row?.taxAmount)) ? Number(row?.taxAmount) : subtotal * (taxPercentage / 100);
            const total = isFinite(Number(row?.total)) ? Number(row?.total) : subtotal + taxAmount;
            return {
              ...row,
              quantity,
              price,
              discountPercentage,
              taxPercentage,
              discountedPrice: Math.round(discountedPrice * 100) / 100,
              subtotal: Math.round(subtotal * 100) / 100,
              taxAmount: Math.round(taxAmount * 100) / 100,
              total: Math.round(total * 100) / 100,
            };
          });

          // Set all form values
          form.setFieldsValue({
            title: quotation.title,
            templateType: templateTypeValue,
            currency: currencyValue,
            features: quotation.features || [],
            benefits: quotation.benefits || [],
            terms: quotation.terms,
            clientName: quotation.clientName,
            clientEmail: quotation.clientEmail,
            clientPhone: quotation.clientPhone,
            clientCompany: quotation.clientCompany,
            clientAddress: quotation.clientAddress || '',
            country: quotation.country || '',
            projectDescription: quotation.projectDescription,
            projectDeadline: quotation.projectDeadline || '',
            paymentTerms: quotation.paymentTerms,
            quotationNo: quotation.quotationNo,
            quotationDate: quotation.quotationDate ? dayjs(quotation.quotationDate) : undefined,
            expirationDate: quotation.expirationDate ? dayjs(quotation.expirationDate) : undefined,
            quantityPricing: recomputedPricing,
            paymentMilestones: quotation.paymentMilestones || [],
            coverImage: quotation.coverImage,
            coverTitle: quotation.coverTitle,
            selectedClientId: quotation.associatedUser?.toString(),
          });

          // Set cover image URL for preview
          if (quotation.coverImage) {
            setCoverImageUrl(quotation.coverImage);
          }

          // If quotation is associated with a client, set the client selection state
          if (quotation.associatedUser) {
            if (typeof quotation.associatedUser === 'object' && quotation.associatedUser._id) {
              const client: Client = {
                id: quotation.associatedUser._id,
                name: quotation.associatedUser.name,
                email: quotation.associatedUser.email,
                profilePicture: quotation.associatedUser.profilePicture,
                createdAt: quotation.associatedUser.createdAt,
              };
              setSelectedClient(client);
              setClientSearchValue(`${client.name} (${client.email})`);
              setIsClientAssociated(true);
            } else {
              try {
                const token = localStorage.getItem('token');
                const clientResponse = await fetch(`/api/admin/users/${quotation.associatedUser}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (clientResponse.ok) {
                  const clientData = await clientResponse.json();
                  const client: Client = {
                    id: clientData.user._id,
                    name: clientData.user.name,
                    email: clientData.user.email,
                    profilePicture: clientData.user.profilePicture,
                    createdAt: clientData.user.createdAt,
                  };
                  setSelectedClient(client);
                  setClientSearchValue(`${client.name} (${client.email})`);
                  setIsClientAssociated(true);
                }
              } catch (error) {
                console.error('Error fetching associated client:', error);
              }
            }
          }
          setCoverImageUrl(quotation.coverImage);
        } else {
          notification.error({
            message: 'Invalid Data',
            description: 'Quotation data is not in the expected format.',
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            duration: 4,
          });
          router.push('/dashboard/admin/quotations');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        notification.error({
          message: 'Failed to Load Quotation',
          description: `Unable to load quotation data for editing. ${errorData.error || `Status: ${response.status}`}`,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
        router.push('/dashboard/admin/quotations');
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      notification.error({
        message: 'Error Loading Quotation',
        description: `Network error occurred while loading quotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
      router.push('/dashboard/admin/quotations');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle edit quotation
  const handleSubmitQuotation = async (values: CreateQuotationFormData) => {
    if (!quotationId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'No authentication token found. Please log in again.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
        setLoading(false);
        return;
      }

      const normalizedPricing = values.quantityPricing?.map((row: PricingItem) => {
        const quantity = Number(row?.quantity) || 0;
        const price = Number(row?.price) || 0;
        const discountPercentage = Number(row?.discountPercentage) || 0;
        const taxPercentage = Number(row?.taxPercentage) || 0;
        const discountedPrice = price * (1 - discountPercentage / 100);
        const subtotal = quantity * discountedPrice;
        const taxAmount = subtotal * (taxPercentage / 100);
        const total = subtotal + taxAmount;
        return {
          ...row,
          quantity,
          price,
          discountPercentage,
          taxPercentage,
          discountedPrice: Math.round(discountedPrice * 100) / 100,
          subtotal: Math.round(subtotal * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
        };
      });

      const finalCurrency = values.currency || selectedCurrency || 'USD';
      
      const payload = {
        ...values,
        currency: finalCurrency,
        quantityPricing: normalizedPricing,
        associatedUser: (values.selectedClientId && typeof values.selectedClientId === 'string') ? values.selectedClientId : undefined,
        quotationDate: values.quotationDate ? new Date(values.quotationDate) : undefined,
        expirationDate: values.expirationDate ? new Date(values.expirationDate) : undefined,
        paymentMilestones: values.paymentMilestones?.map((m: PaymentMilestone) => ({
          ...m,
          dueDate: m?.dueDate ? new Date(m.dueDate) : undefined,
        })),
      };

      const response = await fetch(`/api/admin/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await response.json();
        notification.success({
          message: 'Quotation Updated',
          description: `Quotation "${values.title}" has been updated successfully.`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 4,
        });

        router.push('/dashboard/admin/quotations');
      } else {
        const error = await response.json();
        notification.error({
          message: 'Failed to Update Quotation',
          description: error.error || 'Unable to update quotation.',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4,
        });
      }
    } catch {
      notification.error({
        message: 'Error Updating Quotation',
        description: 'Network error occurred. Please try again.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch quotation data and standard content on mount
  useEffect(() => {
    if (quotationId) {
      fetchQuotationData();
    }
    fetchStandardContent();
  }, [quotationId]);

  // util: responsive grid columns
  const grid = (min = 240) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`,
    gap: '16px',
  } as React.CSSProperties);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/dashboard/admin/quotations')}
            style={{ marginBottom: 16, padding: 0 }}
          >
            Back to Quotations
          </Button>
          <Title level={2}>
            <EditOutlined style={{ marginRight: 8 }} />
            Edit Quotation
          </Title>
          <Text type="secondary" style={{ display: 'block' }}>
            Update the quotation details
          </Text>
        </div>
      </div>

      <Card>
        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading quotation data...</Text>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitQuotation}
            style={{ maxWidth: '100%' }}
          >
            {/* Quotation Title Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Basic Information
              </Title>
              <div style={grid()}>
                <Form.Item
                  name="title"
                  label="Quotation Title"
                  rules={[
                    { required: true, message: 'Please enter quotation title' },
                    { min: 3, message: 'Title must be at least 3 characters' }
                  ]}
                >
                  <Input placeholder="Enter quotation title" size="large" />
                </Form.Item>

                <Form.Item
                  name="templateType"
                  label="Template Type"
                  rules={[{ required: true, message: 'Please select a template type' }]}
                >
                  <Select size="large" value={templateType} onChange={handleTemplateTypeChange}>
                    <Select.Option value="landing">Landing Page Template</Select.Option>
                    <Select.Option value="dashboard">Dashboard Template</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: 'Please select a currency' }]}
                >
                  <Select size="large" value={selectedCurrency} onChange={handleCurrencyChange}>
                    <Select.Option value="USD">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>$</span>
                        <span>USD - US Dollar</span>
                      </span>
                    </Select.Option>
                    <Select.Option value="INR">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>₹</span>
                        <span>INR - Indian Rupee</span>
                      </span>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Client Information Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Client Information
              </Title>
              
              {/* Client Selection */}
              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label="Select Existing Client (Optional)"
                  help="Search and select an existing client to auto-fill their information"
                >
                  <div style={{ position: 'relative' }}>
                    <AutoComplete
                      value={clientSearchValue}
                      onSearch={handleClientSearch}
                      onSelect={(value) => {
                        handleClientSelect(value, form);
                        checkClientAssociation(value);
                      }}
                      placeholder="Search clients by name or email..."
                      size="large"
                      options={clients.map(client => ({
                        value: client.id,
                        label: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar size="small" src={client.profilePicture}>
                              {client.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <div style={{ fontWeight: 500 }}>{client.name}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{client.email}</div>
                            </div>
                          </div>
                        ),
                      }))}
                      notFoundContent={clientSearchLoading ? <Spin size="small" /> : 'No clients found'}
                      style={{ width: '100%' }}
                    />
                    {clientSearchLoading && (
                      <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                        <Spin size="small" />
                      </div>
                    )}
                  </div>
                </Form.Item>
                
                {selectedClient && (
                  <div style={{ 
                    padding: '12px', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size="small" src={selectedClient.profilePicture}>
                          {selectedClient.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 500 }}>{selectedClient.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{selectedClient.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isClientAssociated && (
                          <span style={{ 
                            color: '#52c41a', 
                            fontSize: '12px',
                            fontWeight: 500
                          }}>
                            ✓ Already Associated
                          </span>
                        )}
                        <Button 
                          type="text" 
                          size="small" 
                          onClick={() => clearClientSelection(form)}
                          style={{ color: '#ff4d4f' }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden field to ensure selectedClientId is included in form submission */}
              <Form.Item name="selectedClientId" style={{ display: 'none' }}>
                <Input type="hidden" />
              </Form.Item>

              <div style={grid()}>
                <Form.Item
                  name="clientName"
                  label="Client Name"
                  rules={[{ required: true, message: 'Please enter client name' }]}
                >
                  <Input placeholder="Enter client full name" size="large" />
                </Form.Item>

                <Form.Item
                  name="clientEmail"
                  label="Client Email"
                  rules={[
                    { required: true, message: 'Please enter client email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter client email address" size="large" />
                </Form.Item>
              </div>

              <div style={grid()}>
                <Form.Item
                  name="clientPhone"
                  label="Client Phone"
                >
                  <Input placeholder="Enter client phone number" size="large" />
                </Form.Item>

                <Form.Item
                  name="clientCompany"
                  label="Client Company"
                >
                  <Input placeholder="Enter client company name" size="large" />
                </Form.Item>
              </div>

              <div style={grid()}>
                <Form.Item
                  name="clientAddress"
                  label="Client Address"
                >
                  <TextArea 
                    placeholder="Enter client full address" 
                    size="large" 
                    rows={3}
                  />
                </Form.Item>

                <Form.Item
                  name="country"
                  label="Country"
                >
                  <Select
                    showSearch
                    placeholder="Select or search for a country"
                    size="large"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={countries.map(country => ({
                      value: country.name,
                      label: country.name
                    }))}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Project Details Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Project Details
              </Title>

              <div style={grid()}>
                <Form.Item
                  name="projectDescription"
                  label="Project Description"
                >
                  <TextArea
                    rows={4}
                    placeholder="Describe the project or services being quoted"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="projectDeadline"
                  label="Project Deadline"
                >
                  <Input placeholder="e.g., 30 days, 2 weeks, March 15, 2024" size="large" />
                </Form.Item>

                <Form.Item
                  name="paymentTerms"
                  label="Payment Terms"
                >
                  <Input placeholder="e.g., 50% upfront, 50% on completion" size="large" />
                </Form.Item>

              </div>
            </div>

            {/* Cover Image Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Cover Image
              </Title>
              
              <Form.Item
                name="coverImage"
                label="Cover Image"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {coverImageUrl && (
                      <div style={{ position: 'relative' }}>
                        <Image
                          src={coverImageUrl}
                          alt="Cover Preview"
                          width={120}
                          height={80}
                          style={{
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid #d9d9d9'
                          }}
                        />
                      </div>
                    )}
                    <Upload
                      {...uploadProps}
                      key={coverImageUrl ? 'has-image' : 'no-image'}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          notification.error({
                            message: 'Invalid File Type',
                            description: 'Please upload an image file (PNG, JPG, WEBP)',
                            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                            duration: 4,
                          });
                        }
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isLt10M) {
                          notification.error({
                            message: 'File Too Large',
                            description: 'Image must be smaller than 10MB',
                            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                            duration: 4,
                          });
                        }
                        return isImage && isLt10M;
                      }}
                      onChange={(info) => {
                        if (info.file.status === 'done') {
                          const res = info.file.response || {};
                          const url = res.url || res.Location || res.data?.url;
                          if (url) {
                            setCoverImageUrl(url);
                            form.setFieldsValue({ coverImage: url });
                            notification.success({
                              message: 'Cover Image Uploaded',
                              description: 'Cover image has been uploaded successfully',
                              icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                              duration: 3,
                            });
                          } else {
                            notification.warning({
                              message: 'Upload Warning',
                              description: 'Upload succeeded, but no URL returned',
                              icon: <CloseCircleOutlined style={{ color: '#faad14' }} />,
                              duration: 4,
                            });
                          }
                        } else if (info.file.status === 'error') {
                          const res = info.file.response;
                          notification.error({
                            message: 'Upload Failed',
                            description: res?.error || 'Failed to upload cover image',
                            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                            duration: 4,
                          });
                        }
                      }}
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        {coverImageUrl ? 'Change Cover Image' : 'Upload Cover Image'}
                      </Button>
                    </Upload>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Allowed: PNG, JPG, WEBP. Max size 10MB.
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </div>

            {/* Content Sections */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Quotation Content
              </Title>
              <div style={{ ...grid(260), gap: '24px' }}>
                <Form.Item
                  name="features"
                  label="Features (Page 2)"
                >
                  <Select
                    mode="tags"
                    placeholder="Enter features (press Enter to add)"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="benefits"
                  label="Benefits (Page 3)"
                >
                  <Select
                    mode="tags"
                    placeholder="Enter benefits (press Enter to add)"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </div>


              <Form.Item
                name="terms"
                label="Terms & Conditions (Page 5)"
                rules={[{ required: true, message: 'Please add at least one term and condition' }]}
              >
                <TermsInputComponent />
              </Form.Item>
            </div>

            {/* Quotation Details Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Quotation Details
              </Title>
              <div style={grid()}>
                <Form.Item
                  name="quotationNo"
                  label="Quotation No"
                >
                  <Input placeholder="Auto-generated if empty" size="large" />
                </Form.Item>

                <Form.Item
                  name="quotationDate"
                  label="Quotation Date"
                >
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="expirationDate"
                  label="Expiration Date"
                >
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </div>

            {/* Quantity & Pricing Section */}
            <QuantityPricingSection
              form={form}
              selectedCurrency={selectedCurrency}
              pricingKey={pricingKey}
              getCurrencyPrefix={getCurrencyPrefix}
              getCurrencySymbol={getCurrencySymbol}
              calculateRowTotal={calculateRowTotal}
            />

            {/* Payment Milestones Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Payment Milestones (Internal Use)
              </Title>
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                Define payment milestones for invoice generation. Amounts will be calculated automatically based on percentages.
              </Text>
              
              <Form.List name="paymentMilestones">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Text strong>Milestone {name + 1}</Text>
                          <Button 
                            type="text" 
                            danger 
                            onClick={() => remove(name)}
                            size="small"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'milestone']}
                            label="Milestone Name"
                            rules={[{ required: true, message: 'Please enter milestone name' }]}
                          >
                            <Input placeholder="e.g., Project Kickoff, 50% Complete, Final Delivery" size="large" />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'percentage']}
                            label="Percentage (%)"
                            rules={[
                              { required: true, message: 'Please enter percentage' },
                              { type: 'number', min: 0, max: 100, message: 'Percentage must be between 0-100' }
                            ]}
                          >
                            <InputNumber 
                              placeholder="0" 
                              size="large" 
                              style={{ width: '100%' }} 
                              min={0}
                              max={100}
                              step={0.01}
                              onChange={() => {
                                setTimeout(() => calculateMilestoneAmount(name), 100);
                              }}
                            />
                          </Form.Item>
                          
                          <Form.Item
                            {...restField}
                            name={[name, 'amount']}
                            label="Amount (Auto-calculated)"
                          >
                            <InputNumber 
                              placeholder="0.00" 
                              size="large" 
                              style={{ width: '100%' }} 
                              prefix={getCurrencyPrefix()}
                              disabled
                              value={getMilestoneAmount(name)}
                            />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                    
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      size="large"
                      style={{ marginTop: 16 }}
                    >
                      + Add Payment Milestone
                    </Button>
                  </>
                )}
              </Form.List>
            </div>

            {/* Form Actions */}
            <Form.Item style={{ marginBottom: 0, textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
              <Space size="large">
                <Button
                  size="large"
                  onClick={() => router.push('/dashboard/admin/quotations')}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{ minWidth: 140 }}
                >
                  Update Quotation
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default AdminEditQuotationForm;
