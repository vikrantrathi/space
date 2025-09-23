'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Form,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Select,
  Spin,
  Divider,
  Upload,
  message
} from 'antd';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { TermsInputComponent } from '@/components/admin/quotations/shared/FormSections';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Upload response interface
interface UploadResponse {
  url?: string;
  Location?: string;
  data?: {
    url?: string;
  };
  error?: string;
}

// Extended upload file type with response
interface UploadFileWithResponse extends UploadFile {
  response?: UploadResponse;
}

interface StandardContentFormData {
  companyDetails: {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    website: string;
  };
  defaultFeatures: string[];
  defaultBenefits: string[];
  defaultTerms: string | string[];
  processSteps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  processVideo?: string;
  testimonials: Array<{
    name: string;
    company: string;
    message: string;
    rating: number;
    avatar?: string;
  }>;
  previousWork: Array<{
    title: string;
    description: string;
    image: string;
    link?: string;
  }>;
}

const StandardContentPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [logoKey, setLogoKey] = useState(0); // Force re-render when logo changes
  const [avatarKeys, setAvatarKeys] = useState<Record<number, number>>({}); // Force re-render when avatars change
  const notification = useNotification();

  const fetchStandardContent = useCallback(async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.AUTHENTICATION_ERROR;
        notification.error(msg.message, msg.description, msg.duration);
        return;
      }

      const response = await fetch('/api/admin/standard-content', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.standardContent) {
          // Convert defaultTerms from string to array if needed
          const standardContent = {
            ...data.standardContent,
            defaultTerms: Array.isArray(data.standardContent.defaultTerms) 
              ? data.standardContent.defaultTerms 
              : data.standardContent.defaultTerms 
                ? data.standardContent.defaultTerms.split('\n').filter((term: string) => term.trim())
                : []
          };
          form.setFieldsValue(standardContent);
        }
      } else {
        // If no content exists, set default values
        form.setFieldsValue({
          companyDetails: {
            name: 'STARTUPZILA',
            email: 'contact@startupzila.com',
            phone: '+91 98765 43210',
            website: 'www.startupzila.com'
          },
          defaultFeatures: [],
          defaultBenefits: [],
          defaultTerms: ['Standard terms and conditions apply.'],
          processSteps: [],
          testimonials: [],
          previousWork: []
        });
      }
    } catch {
        const msg = NOTIFICATION_MESSAGES.STANDARD_CONTENT.LOAD_ERROR;
        notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setFetchLoading(false);
    }
  }, [form, notification]);

  // Fetch existing standard content
  useEffect(() => {
    fetchStandardContent();
  }, [fetchStandardContent]);

  // Handle save standard content
  const handleSaveContent = async (values: StandardContentFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        const msg = NOTIFICATION_MESSAGES.AUTH.AUTHENTICATION_ERROR;
        notification.error(msg.message, msg.description, msg.duration);
        setLoading(false);
        return;
      }

      // Convert defaultTerms array back to string for API
      const apiData = {
        ...values,
        defaultTerms: Array.isArray(values.defaultTerms) 
          ? values.defaultTerms.join('\n')
          : values.defaultTerms
      };

      const response = await fetch('/api/admin/standard-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const msg = NOTIFICATION_MESSAGES.STANDARD_CONTENT.UPDATE_SUCCESS;
        notification.success(msg.message, msg.description, msg.duration);
      } else {
        const error = await response.json();
        const msg = NOTIFICATION_MESSAGES.STANDARD_CONTENT.UPDATE_ERROR;
        notification.error(msg.message, error.error || msg.description, msg.duration);
      }
    } catch {
      const msg = NOTIFICATION_MESSAGES.STANDARD_CONTENT.UPDATE_NETWORK_ERROR;
      notification.error(msg.message, msg.description, msg.duration);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info: UploadChangeParam<UploadFile>) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

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
            Standard Content Management
          </Title>
          <Text type="secondary" style={{ display: 'block' }}>
            Manage default content used in quotation templates
          </Text>
        </div>
      </div>

      <Card>
        <Spin spinning={fetchLoading} >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveContent}
            style={{ maxWidth: '100%' }}
            disabled={fetchLoading}
          >
            {/* Company Details Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Company Details
              </Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name={['companyDetails', 'name']}
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input placeholder="Enter company name" size="large" />
                </Form.Item>

                <Form.Item
                  name={['companyDetails', 'email']}
                  label="Company Email"
                  rules={[
                    { required: true, message: 'Please enter company email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter company email" size="large" />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name={['companyDetails', 'phone']}
                  label="Company Phone"
                  rules={[{ required: true, message: 'Please enter company phone' }]}
                >
                  <Input placeholder="Enter company phone" size="large" />
                </Form.Item>

                <Form.Item
                  name={['companyDetails', 'website']}
                  label="Company Website"
                  rules={[{ required: true, message: 'Please enter company website' }]}
                >
                  <Input placeholder="Enter company website" size="large" />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name={['companyDetails', 'tagline']}
                  label="Company Tagline"
                >
                  <Input placeholder="Premium Digital Solutions & Innovation Partner" size="large" />
                </Form.Item>

                <Form.Item
                  name={['companyDetails', 'featuresDescription']}
                  label="Features Section Description"
                >
                  <Input placeholder="Complete feature set designed to exceed your expectations" size="large" />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name={['companyDetails', 'benefitsDescription']}
                  label="Benefits Section Description"
                >
                  <Input placeholder="The advantages that set us apart from the competition" size="large" />
                </Form.Item>

                <Form.Item
                  name={['companyDetails', 'pricingDescription']}
                  label="Pricing Section Description"
                >
                  <Input placeholder="Complete project delivery with ongoing support" size="large" />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name={['companyDetails', 'termsDescription']}
                  label="Terms Section Description"
                >
                  <Input placeholder="Important information about our service agreement" size="large" />
                </Form.Item>

                <Form.Item
                  name={['companyDetails', 'ctaDescription']}
                  label="Call-to-Action Description"
                >
                  <Input placeholder="Let's transform your vision into reality together" size="large" />
                </Form.Item>
              </div>

              <Form.Item
                name={['companyDetails', 'logo']}
                label="Company Logo"
              >
                <div key={logoKey}>
                  {form.getFieldValue(['companyDetails', 'logo']) ? (
                    <Space align="center">
                      <Image
                        src={form.getFieldValue(['companyDetails', 'logo'])}
                        alt="Logo Preview"
                        width={48}
                        height={48}
                        style={{ border: '1px solid #f0f0f0', borderRadius: 6 }}
                      />
                      <Upload
                        {...uploadProps}
                        showUploadList={false}
                        accept="image/*"
                        data={{ type: 'image' }}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith('image/');
                          if (!isImage) {
                            const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                            notification.error(msg.message, msg.description, msg.duration);
                            return false;
                          }
                          const isLt10M = file.size / 1024 / 1024 < 10;
                          if (!isLt10M) {
                            const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                            notification.error(msg.message, msg.description, msg.duration);
                            return false;
                          }
                          return true;
                        }}
                        onChange={(info: UploadChangeParam<UploadFileWithResponse>) => {
                          if (info.file.status === 'done') {
                            const res = info.file.response || {};
                            // Debug log removed
                            const url = res.url || res.Location || res.data?.url;
                            if (url) {
                              const current = form.getFieldValue('companyDetails') || {};
                              form.setFieldsValue({ companyDetails: { ...current, logo: url } });
                              setLogoKey(prev => prev + 1); // Force re-render
                              const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.LOGO_UPLOAD_SUCCESS;
                              notification.success(msg.message, msg.description, msg.duration);
                            } else {
                              // Debug log removed
                              const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                              notification.warning(msg.message, msg.description, msg.duration);
                            }
                          } else if (info.file.status === 'error') {
                            const res = info.file.response;
                            // Debug log removed
                            const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.LOGO_UPLOAD_ERROR;
                            notification.error(msg.message, res?.error || msg.description, msg.duration);
                          }
                        }}
                      >
                        <Button icon={<UploadOutlined />}>Replace</Button>
                      </Upload>
                      <Button
                        danger
                        onClick={() => {
                          const current = form.getFieldValue('companyDetails') || {};
                          form.setFieldsValue({ companyDetails: { ...current, logo: undefined } });
                          setLogoKey(prev => prev + 1); // Force re-render
                        }}
                      >
                        Remove
                      </Button>
                    </Space>
                  ) : (
                    <Upload
                      {...uploadProps}
                      showUploadList={false}
                      accept="image/*"
                      data={{ type: 'image' }}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                          notification.error(msg.message, msg.description, msg.duration);
                          return false;
                        }
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isLt10M) {
                          const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                          notification.error(msg.message, msg.description, msg.duration);
                          return false;
                        }
                        return true;
                      }}
                      onChange={(info: UploadChangeParam<UploadFileWithResponse>) => {
                        if (info.file.status === 'done') {
                          const res = info.file.response || {};
                          // Debug log removed
                          const url = res.url || res.Location || res.data?.url;
                          if (url) {
                            const current = form.getFieldValue('companyDetails') || {};
                            form.setFieldsValue({ companyDetails: { ...current, logo: url } });
                            setLogoKey(prev => prev + 1); // Force re-render
                            const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.LOGO_UPLOAD_SUCCESS;
                            notification.success(msg.message, msg.description, msg.duration);
                          } else {
                            // Debug log removed
                            const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                            notification.warning(msg.message, msg.description, msg.duration);
                          }
                        } else if (info.file.status === 'error') {
                          const res = info.file.response;
                          // Debug log removed
                          const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.LOGO_UPLOAD_ERROR;
                          notification.error(msg.message, res?.error || msg.description, msg.duration);
                        }
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Allowed: PNG, JPG, WEBP. Max size 10MB.
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </div>

            <Divider />

            {/* Default Content Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Default Content
              </Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <Form.Item
                  name="defaultFeatures"
                  label="Default Features"
                >
                  <Select
                    mode="tags"
                    placeholder="Enter default features (press Enter to add)"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="defaultBenefits"
                  label="Default Benefits"
                >
                  <Select
                    mode="tags"
                    placeholder="Enter default benefits (press Enter to add)"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="defaultTerms"
                label="Default Terms & Conditions"
                rules={[{ required: true, message: 'Please enter default terms' }]}
              >
                <TermsInputComponent />
              </Form.Item>
            </div>

            <Divider />

            {/* Process Steps Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Process Steps
              </Title>
              <Form.List name="processSteps">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ display: 'flex', gap: '16px', alignItems: 'end', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <Form.Item {...restField} name={[name, 'step']} label="Step #" rules={[{ required: true, message: 'Enter step number' }]} style={{ flex: '0.5 1 100px' }}>
                          <Input placeholder="1" size="large" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'title']} label="Title" rules={[{ required: true, message: 'Enter step title' }]} style={{ flex: '1 1 200px' }}>
                          <Input placeholder="Step title" size="large" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'description']} label="Description" rules={[{ required: true, message: 'Enter step description' }]} style={{ flex: '2 1 300px' }}>
                          <Input placeholder="Step description" size="large" />
                        </Form.Item>
                        <Button type="text" danger onClick={() => remove(name)} icon={<span>🗑️</span>} />
                      </div>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<span>+</span>}>
                        Add Step
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="processVideo"
                label="Process Video URL"
              >
                <Input placeholder="Enter process video URL" size="large" />
              </Form.Item>
            </div>

            <Divider />

            {/* Testimonials Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Testimonials
              </Title>
              <Form.List name="testimonials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                          <Form.Item {...restField} name={[name, 'name']} label="Name" rules={[{ required: true, message: 'Enter name' }]}>
                            <Input placeholder="Client name" size="large" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'company']} label="Company" rules={[{ required: true, message: 'Enter company' }]}>
                            <Input placeholder="Client company" size="large" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'rating']} label="Rating" rules={[{ required: true, message: 'Enter rating' }]}>
                            <Input placeholder="5" size="large" />
                          </Form.Item>
                        </div>
                        
                        {/* Avatar Upload */}
                        <Form.Item {...restField} name={[name, 'avatar']} label="Client Avatar" rules={[{ required: true, message: 'Please upload client avatar' }]}>
                          <div key={avatarKeys[name] || 0}>
                            {form.getFieldValue(['testimonials', name, 'avatar']) ? (
                              <Space align="center">
                                <Image
                                  src={form.getFieldValue(['testimonials', name, 'avatar'])}
                                  alt="Avatar Preview"
                                  width={48}
                                  height={48}
                                  style={{ border: '1px solid #f0f0f0', borderRadius: 6, objectFit: 'cover' }}
                                />
                                <Upload
                                  {...uploadProps}
                                  showUploadList={false}
                                  accept="image/*"
                                  data={{ type: 'image' }}
                                  beforeUpload={(file) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                            notification.error(msg.message, msg.description, msg.duration);
                                      return false;
                                    }
                                    const isLt10M = file.size / 1024 / 1024 < 10;
                                    if (!isLt10M) {
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                                      notification.error(msg.message, msg.description, msg.duration);
                                      return false;
                                    }
                                    return true;
                                  }}
                                  onChange={async (info) => {
                                    if (info.file.status === 'done') {
                                      const res = await info.file.response;
                                      const url = res?.url;
                                      if (url) {
                                        form.setFieldValue(['testimonials', name, 'avatar'], url);
                                        setAvatarKeys(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.AVATAR_UPLOAD_SUCCESS;
                                        notification.success(msg.message, msg.description, msg.duration);
                                      } else {
                                        // Debug log removed
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                              notification.warning(msg.message, msg.description, msg.duration);
                                      }
                                    } else if (info.file.status === 'error') {
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_ERROR;
                                      notification.error(msg.message, msg.description, msg.duration);
                                    }
                                  }}
                                >
                                  <Button size="small">Change</Button>
                                </Upload>
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => {
                                    form.setFieldValue(['testimonials', name, 'avatar'], '');
                                    setAvatarKeys(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                                  }}
                                >
                                  Remove
                                </Button>
                              </Space>
                            ) : (
                              <Upload
                                {...uploadProps}
                                showUploadList={false}
                                accept="image/*"
                                data={{ type: 'image' }}
                                beforeUpload={(file) => {
                                  const isImage = file.type.startsWith('image/');
                                  if (!isImage) {
                                    const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                            notification.error(msg.message, msg.description, msg.duration);
                                    return false;
                                  }
                                  const isLt10M = file.size / 1024 / 1024 < 10;
                                  if (!isLt10M) {
                                    const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                                    notification.error(msg.message, msg.description, msg.duration);
                                    return false;
                                  }
                                  return true;
                                }}
                                onChange={async (info) => {
                                  if (info.file.status === 'done') {
                                    const res = await info.file.response;
                                    const url = res?.url;
                                    if (url) {
                                      form.setFieldValue(['testimonials', name, 'avatar'], url);
                                      setAvatarKeys(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.AVATAR_UPLOAD_SUCCESS;
                                      notification.success(msg.message, msg.description, msg.duration);
                                    } else {
                                      // Debug log removed
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                              notification.warning(msg.message, msg.description, msg.duration);
                                    }
                                  } else if (info.file.status === 'error') {
                                    const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_ERROR;
                                    notification.error(msg.message, msg.description, msg.duration);
                                  }
                                }}
                              >
                                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                              </Upload>
                            )}
                          </div>
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'message']} label="Message" rules={[{ required: true, message: 'Enter message' }]}>
                          <TextArea rows={3} placeholder="Testimonial message" size="large" />
                        </Form.Item>
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                          <Button type="text" danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<span>+</span>}>
                        Add Testimonial
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>

            <Divider />

            {/* Previous Work Section */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Previous Work
              </Title>
              <Form.List name="previousWork">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
                          <Form.Item {...restField} name={[name, 'title']} label="Project Title" rules={[{ required: true, message: 'Enter title' }]}>
                            <Input placeholder="Project title" size="large" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'image']} label="Project Image" rules={[{ required: true, message: 'Upload project image' }]}>
                            <div>
                              {form.getFieldValue(['previousWork', name, 'image']) ? (
                                <Space align="center">
                                  <Image
                                    src={form.getFieldValue(['previousWork', name, 'image'])}
                                    alt="Project Preview"
                                    width={80}
                                    height={80}
                                    style={{ border: '1px solid #f0f0f0', borderRadius: 6 }}
                                  />
                                  <Upload
                                    {...uploadProps}
                                    showUploadList={false}
                                    accept="image/*"
                                    data={{ type: 'image' }}
                                    beforeUpload={(file) => {
                                      const isImage = file.type.startsWith('image/');
                                      if (!isImage) {
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                            notification.error(msg.message, msg.description, msg.duration);
                                        return false;
                                      }
                                      const isLt10M = file.size / 1024 / 1024 < 10;
                                      if (!isLt10M) {
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                            notification.error(msg.message, msg.description, msg.duration);
                                        return false;
                                      }
                                      return true;
                                    }}
                                    onChange={(info: UploadChangeParam<UploadFileWithResponse>) => {
                                      if (info.file.status === 'done') {
                                        const res = info.file.response || {};
                                        const url = res.url || res.Location || res.data?.url;
                                        if (url) {
                                          const currentPreviousWork = form.getFieldValue('previousWork') || [];
                                          const updatedPreviousWork = [...currentPreviousWork];
                                          updatedPreviousWork[name] = { ...updatedPreviousWork[name], image: url };
                                          form.setFieldsValue({ previousWork: updatedPreviousWork });
                                          const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.IMAGE_UPLOAD_SUCCESS;
                                          notification.success(msg.message, msg.description, msg.duration);
                                        } else {
                                          const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                              notification.warning(msg.message, msg.description, msg.duration);
                                        }
                                      } else if (info.file.status === 'error') {
                                        const res = info.file.response;
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.IMAGE_UPLOAD_ERROR;
                                        notification.error(msg.message, res?.error || msg.description, msg.duration);
                                      }
                                    }}
                                  >
                                    <Button icon={<UploadOutlined />}>Replace</Button>
                                  </Upload>
                                  <Button
                                    danger
                                    onClick={() => {
                                      const currentPreviousWork = form.getFieldValue('previousWork') || [];
                                      const updatedPreviousWork = [...currentPreviousWork];
                                      updatedPreviousWork[name] = { ...updatedPreviousWork[name], image: undefined };
                                      form.setFieldsValue({ previousWork: updatedPreviousWork });
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Space>
                              ) : (
                                <Upload
                                  {...uploadProps}
                                  showUploadList={false}
                                  accept="image/*"
                                  data={{ type: 'image' }}
                                  beforeUpload={(file) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.INVALID_TYPE;
                            notification.error(msg.message, msg.description, msg.duration);
                                      return false;
                                    }
                                    const isLt10M = file.size / 1024 / 1024 < 10;
                                    if (!isLt10M) {
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.FILE_TOO_LARGE;
                            notification.error(msg.message, msg.description, msg.duration);
                                      return false;
                                    }
                                    return true;
                                  }}
                                  onChange={(info: UploadChangeParam<UploadFileWithResponse>) => {
                                    if (info.file.status === 'done') {
                                      const res = info.file.response || {};
                                      const url = res.url || res.Location || res.data?.url;
                                      if (url) {
                                        const currentPreviousWork = form.getFieldValue('previousWork') || [];
                                        const updatedPreviousWork = [...currentPreviousWork];
                                        updatedPreviousWork[name] = { ...updatedPreviousWork[name], image: url };
                                        form.setFieldsValue({ previousWork: updatedPreviousWork });
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.IMAGE_UPLOAD_SUCCESS;
                                        notification.success(msg.message, msg.description, msg.duration);
                                      } else {
                                        const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.UPLOAD_WARNING;
                              notification.warning(msg.message, msg.description, msg.duration);
                                      }
                                    } else if (info.file.status === 'error') {
                                      const res = info.file.response;
                                      const msg = NOTIFICATION_MESSAGES.FILE_UPLOAD.IMAGE_UPLOAD_ERROR;
                                      notification.error(msg.message, res?.error || msg.description, msg.duration);
                                    }
                                  }}
                                >
                                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                                </Upload>
                              )}
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Allowed: PNG, JPG, WEBP. Max size 10MB.
                                </Text>
                              </div>
                            </div>
                          </Form.Item>
                        </div>
                        <Form.Item {...restField} name={[name, 'description']} label="Description" rules={[{ required: true, message: 'Enter description' }]}>
                          <TextArea rows={2} placeholder="Project description" size="large" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'link']} label="Project Link (Optional)">
                          <Input placeholder="Project website or case study link" size="large" />
                        </Form.Item>
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                          <Button type="text" danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<span>+</span>}>
                        Add Previous Work
                      </Button>
                    </Form.Item>
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
                  icon={<SaveOutlined />}
                  style={{ minWidth: 140 }}
                >
                  Save Standard Content
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default StandardContentPage;