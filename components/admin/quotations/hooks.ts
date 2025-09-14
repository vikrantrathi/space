import { useState, useEffect } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { StandardContentData, Client, PricingItem } from './types';

export const useStandardContent = () => {
  const [standardContent, setStandardContent] = useState<StandardContentData | null>(null);

  const fetchStandardContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/admin/standard-content${cacheBuster}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.standardContent) {
          setStandardContent(data.standardContent);
        }
      } else {
        console.error('Failed to fetch standard content:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch standard content:', error);
    }
  };

  return { standardContent, fetchStandardContent };
};

export const useClientSearch = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearchValue, setClientSearchValue] = useState('');
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientAssociated, setIsClientAssociated] = useState(false);

  const searchClients = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setClients([]);
      return;
    }

    setClientSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients?search=${encodeURIComponent(searchTerm)}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        console.error('Failed to fetch clients');
        setClients([]);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      setClients([]);
    } finally {
      setClientSearchLoading(false);
    }
  };

  const handleClientSearch = (value: string) => {
    setClientSearchValue(value);
    searchClients(value);
  };

  const handleClientSelect = (value: string, form: FormInstance) => {
    const client = clients.find(c => c.id === value);
    if (client) {
      setSelectedClient(client);
      setClientSearchValue(`${client.name} (${client.email})`);
      
      form.setFieldsValue({
        clientName: client.name,
        clientEmail: client.email,
        selectedClientId: client.id,
      });
    }
  };

  const clearClientSelection = (form: FormInstance) => {
    setSelectedClient(null);
    setClientSearchValue('');
    setClients([]);
    setIsClientAssociated(false);
    form.setFieldsValue({
      selectedClientId: undefined,
    });
  };

  return {
    clients,
    clientSearchValue,
    setClientSearchValue,
    clientSearchLoading,
    selectedClient,
    setSelectedClient,
    isClientAssociated,
    setIsClientAssociated,
    searchClients,
    handleClientSearch,
    handleClientSelect,
    clearClientSelection,
  };
};

export const usePricingCalculations = (form: FormInstance, selectedCurrency: 'USD' | 'INR') => {
  const getCurrencySymbol = (currency: string) => {
    return currency === 'INR' ? '₹' : '$';
  };

  const getCurrencyPrefix = () => {
    return getCurrencySymbol(selectedCurrency);
  };

  const calculateRowTotal = (rowIndex: number) => {
    const quantityPricing = form.getFieldValue('quantityPricing') || [];
    const item = quantityPricing[rowIndex];
    
    if (!item || !item.quantity || !item.price) return;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const discountPercentage = Number(item.discountPercentage) || 0;
    const taxPercentage = Number(item.taxPercentage) || 0;

    const discountAmount = price * (discountPercentage / 100);
    const discountedPrice = price - discountAmount;
    const subtotal = quantity * discountedPrice;
    const taxAmount = subtotal * (taxPercentage / 100);
    const total = subtotal + taxAmount;

    const updatedQuantityPricing = [...quantityPricing];
    updatedQuantityPricing[rowIndex] = {
      ...item,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    form.setFieldsValue({ quantityPricing: updatedQuantityPricing });
  };

  // Calculate milestone amount based on percentage
  const calculateMilestoneAmount = (milestoneIndex: number) => {
    const quantityPricing = form.getFieldValue('quantityPricing') || [];
    const totalAmount = quantityPricing.reduce((sum: number, item: PricingItem) => sum + (item?.total || 0), 0);
    
    const paymentMilestones = form.getFieldValue('paymentMilestones') || [];
    const percentage = paymentMilestones[milestoneIndex]?.percentage || 0;
    const amount = (totalAmount * percentage) / 100;
    
    // Update the specific milestone amount
    const updatedMilestones = [...paymentMilestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      amount: Math.round(amount * 100) / 100
    };
    
    form.setFieldsValue({ paymentMilestones: updatedMilestones });
  };

  // Get milestone amount for display
  const getMilestoneAmount = (milestoneIndex: number) => {
    const quantityPricing = form.getFieldValue('quantityPricing') || [];
    const totalAmount = quantityPricing.reduce((sum: number, item: PricingItem) => sum + (item?.total || 0), 0);
    
    const paymentMilestones = form.getFieldValue('paymentMilestones') || [];
    const percentage = paymentMilestones[milestoneIndex]?.percentage || 0;
    const amount = (totalAmount * percentage) / 100;
    
    return Math.round(amount * 100) / 100;
  };

  return {
    getCurrencySymbol,
    getCurrencyPrefix,
    calculateRowTotal,
    calculateMilestoneAmount,
    getMilestoneAmount,
  };
};
