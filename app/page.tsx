'use client';

import { useEffect } from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect authenticated users to dashboard
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Redirect unauthenticated users to login page
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading spinner while checking authentication
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );
}
