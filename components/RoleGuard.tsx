'use client';

import React from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { UserRole } from '../types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <div>You do not have permission to access this content.</div>;
  }

  return <>{children}</>;
};

export default RoleGuard;
