'use client';

import React, { ReactNode } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { AuthProvider } from '@/lib/auth/auth-context';
import NotificationConfig from '@/components/shared/NotificationConfig';
import { GlobalLoaderProvider } from '@/components/shared/GlobalLoader';

function AntdBridge({ children }: { children: ReactNode }) {
  const { algorithm } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
      componentSize="middle"
    >
      <NotificationConfig />
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AntdBridge>
          <GlobalLoaderProvider>
            {children}
          </GlobalLoaderProvider>
        </AntdBridge>
      </AuthProvider>
    </ThemeProvider>
  );
}