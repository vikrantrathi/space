'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Spin, theme } from 'antd';
import { useTheme } from '../providers/ThemeProvider';

interface GlobalLoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | null>(null);

export const useGlobalLoader = () => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    throw new Error('useGlobalLoader must be used within GlobalLoaderProvider');
  }
  return context;
};

interface GlobalLoaderProviderProps {
  children: ReactNode;
}

export const GlobalLoaderProvider: React.FC<GlobalLoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = theme.useToken();
  const { resolved } = useTheme();

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Dynamic background color based on theme
  const backgroundColor = resolved === 'dark'
    ? 'rgba(0, 0, 0, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Spin size="large" />
          {/* <div
            style={{
              marginTop: '16px',
              color: token.colorTextSecondary,
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Refreshing...
          </div> */}
        </div>
      )}
    </GlobalLoaderContext.Provider>
  );
};

export default GlobalLoaderProvider;