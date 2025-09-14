'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AdminCreateQuotationForm from './AdminCreateQuotationForm';
import AdminEditQuotationForm from './AdminEditQuotationForm';

const AdminQuotationForm: React.FC = () => {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('id');
  const isEditMode = !!quotationId;

  if (isEditMode) {
    return <AdminEditQuotationForm />;
  }

  return <AdminCreateQuotationForm />;
};

export default AdminQuotationForm;
