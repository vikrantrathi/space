import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Typography, Card, Button, InputNumber, AutoComplete, Avatar, Spin, theme } from 'antd';
import { ReloadOutlined, PlusOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { countries } from '@/lib/data/countries';

interface PricingItem {
  item: string;
  description?: string;
  quantity: number;
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  taxPercentage?: number;
  taxAmount?: number;
  subtotal: number;
  total: number;
}

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

// Export TermsInputComponent
export { TermsInputComponent };

// Grid utility
const grid = (min = 240) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`,
  gap: '16px',
} as React.CSSProperties);

export const BasicInformationSection: React.FC<{
  form: FormInstance;
  templateType: 'landing' | 'dashboard';
  selectedCurrency: 'USD' | 'INR';
  onTemplateTypeChange: (value: 'landing' | 'dashboard') => void;
  onCurrencyChange: (value: 'USD' | 'INR') => void;
}> = ({ templateType, selectedCurrency, onTemplateTypeChange, onCurrencyChange }) => (
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
        <Select size="large" value={templateType} onChange={onTemplateTypeChange}>
          <Select.Option value="landing">Landing Page Template</Select.Option>
          <Select.Option value="dashboard">Dashboard Template</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="currency"
        label="Currency"
        rules={[{ required: true, message: 'Please select a currency' }]}
      >
        <Select size="large" value={selectedCurrency} onChange={onCurrencyChange}>
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
);

interface Client {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export const ClientInformationSection: React.FC<{
  form: FormInstance;
  clients: Client[];
  clientSearchValue: string;
  clientSearchLoading: boolean;
  selectedClient: Client | null;
  isClientAssociated: boolean;
  handleClientSearch: (value: string) => void;
  handleClientSelect: (value: string) => void;
  clearClientSelection: () => void;
}> = ({ 
  clients, 
  clientSearchValue, 
  clientSearchLoading, 
  selectedClient, 
  isClientAssociated,
  handleClientSearch, 
  handleClientSelect, 
  clearClientSelection 
}) => (
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
            onSelect={handleClientSelect}
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
                onClick={clearClientSelection}
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
);

export const ProjectDetailsSection: React.FC<{ form: FormInstance }> = () => (
  <div style={{ marginBottom: 32 }}>
    <Title level={4} style={{ marginBottom: 16 }}>
      Project Details
    </Title>
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

    <div style={grid()}>
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
);

export const QuotationContentSection: React.FC<{ form: FormInstance }> = () => (
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
);


export const QuotationDetailsSection: React.FC<{ form: FormInstance }> = () => (
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
);

export const QuantityPricingSection: React.FC<{
  form: FormInstance;
  selectedCurrency: 'USD' | 'INR';
  pricingKey: number;
  getCurrencyPrefix: () => string;
  getCurrencySymbol: (currency: string) => string;
  calculateRowTotal: (rowIndex: number) => void;
}> = ({ form, selectedCurrency, pricingKey, getCurrencyPrefix, getCurrencySymbol, calculateRowTotal }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Watch for changes in quantityPricing field for real-time updates
  const quantityPricing = Form.useWatch('quantityPricing', form) || [];


  // Calculate totals directly from quantityPricing - no useEffect needed
  const currentPricing = quantityPricing || [];
  const totalItems = currentPricing.length;
  const totalQuantity = currentPricing.reduce((sum: number, item: PricingItem) => sum + (item?.quantity || 0), 0);
  const subtotal = currentPricing.reduce((sum: number, item: PricingItem) => sum + (item?.subtotal || 0), 0);
  const totalTax = currentPricing.reduce((sum: number, item: PricingItem) => sum + (item?.taxAmount || 0), 0);
  const grandTotal = currentPricing.reduce((sum: number, item: PricingItem) => sum + (item?.total || 0), 0);

  return (
  <div key={pricingKey} style={{ marginBottom: 32 }}>
    <Title level={4} style={{ marginBottom: 16 }}>
      Quantity & Pricing ({getCurrencySymbol(selectedCurrency)})
    </Title>
    <Form.List name="quantityPricing">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Card key={key} style={{ marginBottom: 16 }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Item #{name + 1}</Text>
                <Button 
                  type="text" 
                  danger 
                  onClick={() => {
                    remove(name);
                    // Force totals recalculation after removing item
                    // Totals will update automatically via Form.useWatch
                  }} 
                  icon={<DeleteOutlined />} 
                  size="small" 
                />
              </div>
              
              {/* Row 1: Item Name and Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Item
                  {...restField}
                  name={[name, 'item']}
                  label="Item Name"
                  rules={[{ required: true, message: 'Please enter item name' }]}
                >
                  <Input placeholder="Item name" size="large" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'description']}
                  label="Description (Optional)"
                >
                  <Input placeholder="Brief description of the item" size="large" />
                </Form.Item>
              </div>

              {/* Row 2: Quantity, Unit Price, Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <Form.Item
                  {...restField}
                  name={[name, 'quantity']}
                  label="Quantity"
                  rules={[{ required: true, message: 'Please enter quantity' }]}
                >
                  <InputNumber 
                    placeholder="Qty" 
                    size="large" 
                    style={{ width: '100%' }} 
                    min={1}
                    onChange={() => {
                      setTimeout(() => {
                        calculateRowTotal(name);
                        // Force totals recalculation after row update
                        // Totals will update automatically via Form.useWatch
                      }, 100);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'price']}
                  label="Unit Price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber 
                    placeholder="Price" 
                    size="large" 
                    style={{ width: '100%' }} 
                    prefix={getCurrencyPrefix()} 
                    min={0}
                    step={0.01}
                    onChange={() => {
                      setTimeout(() => {
                        calculateRowTotal(name);
                        // Force totals recalculation after row update
                        // Totals will update automatically via Form.useWatch
                      }, 100);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'discountPercentage']}
                  label="Discount %"
                >
                  <InputNumber 
                    placeholder="0" 
                    size="large" 
                    style={{ width: '100%' }} 
                    min={0}
                    max={100}
                    step={0.1}
                    formatter={value => `${value}%`}
                    parser={(value: string | undefined) => parseFloat(value?.replace('%', '') || '0')}
                    onChange={() => {
                      setTimeout(() => {
                        calculateRowTotal(name);
                        // Force totals recalculation after row update
                        // Totals will update automatically via Form.useWatch
                      }, 100);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'taxPercentage']}
                  label="Tax %"
                >
                  <InputNumber 
                    placeholder="0" 
                    size="large" 
                    style={{ width: '100%' }} 
                    min={0}
                    max={100}
                    step={0.1}
                    formatter={value => `${value}%`}
                    parser={(value: string | undefined) => parseFloat(value?.replace('%', '') || '0')}
                    onChange={() => {
                      setTimeout(() => {
                        calculateRowTotal(name);
                        // Force totals recalculation after row update
                        // Totals will update automatically via Form.useWatch
                      }, 100);
                    }}
                  />
                </Form.Item>
              </div>

              {/* Row 3: Calculated Fields (Read-only) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px',  padding: '16px', borderRadius: '6px' }}>
                <Form.Item
                  {...restField}
                  name={[name, 'discountedPrice']}
                  label="Price After Discount"
                >
                  <InputNumber 
                    placeholder="Auto-calculated" 
                    size="large" 
                    style={{ width: '100%' }} 
                    prefix={getCurrencyPrefix()} 
                    disabled 
                    step={0.01}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'subtotal']}
                  label="Subtotal"
                >
                  <InputNumber 
                    placeholder="Auto-calculated" 
                    size="large" 
                    style={{ width: '100%' }} 
                    prefix={getCurrencyPrefix()} 
                    disabled 
                    step={0.01}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'taxAmount']}
                  label="Tax Amount"
                >
                  <InputNumber 
                    placeholder="Auto-calculated" 
                    size="large" 
                    style={{ width: '100%' }} 
                    prefix={getCurrencyPrefix()} 
                    disabled 
                    step={0.01}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'total']}
                  label="Total"
                >
                  <InputNumber 
                    placeholder="Auto-calculated" 
                    size="large" 
                    style={{ width: '100%', fontWeight: 'bold' }} 
                    prefix={getCurrencyPrefix()} 
                    disabled 
                    step={0.01}
                  />
                </Form.Item>
              </div>
            </Card>
          ))}
          <Form.Item>
            <Button 
              type="dashed" 
              onClick={() => {
                add({ discountPercentage: 0, taxPercentage: 0 });
                // Force totals recalculation after adding item
                // Totals will update automatically via Form.useWatch
              }} 
              block 
              icon={<PlusOutlined />}
              size="large"
            >
              Add Pricing Item
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>

    {/* Grand Total Section */}
    <Card style={{ border: '2px solid #e9ecef' }}>
      {/* Header with Refresh Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
          <BarChartOutlined style={{ marginRight: '8px' }} />
          Grand Total Summary
        </Text>
        <Button 
          type="primary" 
          size="small" 
          icon={<ReloadOutlined />}
          loading={isRefreshing}
          onClick={() => {
            // Debug log removed
            setIsRefreshing(true);
            // Force re-render by updating state
            setTimeout(() => {
              setIsRefreshing(false);
            }, 500);
          }}
          style={{ 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minWidth: '120px',
            height: '32px'
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Totals'}
        </Button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', textAlign: 'center' }}>
        <div>
          <Text type="secondary">Total Items</Text>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            transition: 'all 0.3s ease',
            transform: isRefreshing ? 'scale(1.05)' : 'scale(1)'
          }}>
            {totalItems}
          </div>
        </div>
        <div>
          <Text type="secondary">Total Quantity</Text>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#52c41a',
            transition: 'all 0.3s ease',
            transform: isRefreshing ? 'scale(1.05)' : 'scale(1)'
          }}>
            {totalQuantity}
          </div>
        </div>
        <div>
          <Text type="secondary">Subtotal</Text>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#fa8c16',
            transition: 'all 0.3s ease',
            transform: isRefreshing ? 'scale(1.05)' : 'scale(1)'
          }}>
            {getCurrencyPrefix()}{subtotal.toFixed(2)}
          </div>
        </div>
        <div>
          <Text type="secondary">Total Tax</Text>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#eb2f96',
            transition: 'all 0.3s ease',
            transform: isRefreshing ? 'scale(1.05)' : 'scale(1)'
          }}>
            {getCurrencyPrefix()}{totalTax.toFixed(2)}
          </div>
        </div>
        <div>
          <Text type="secondary">Grand Total</Text>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#f5222d',
            transition: 'all 0.3s ease',
            transform: isRefreshing ? 'scale(1.05)' : 'scale(1)'
          }}>
            {getCurrencyPrefix()}{grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  </div>
  );
};
