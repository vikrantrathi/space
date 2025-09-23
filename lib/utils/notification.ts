import { App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { NOTIFICATION_MESSAGES, getNotificationMessage } from './notificationMessages';

// Hook to get notification instance from App context
export const useNotification = () => {
  const { notification } = App.useApp();
  
  // Configure notifications when hook is used
  React.useEffect(() => {
    // Note: notification.config is not available on NotificationInstance
    // Configuration is handled at the App level in Providers.tsx
  }, [notification]);

  return React.useMemo(() => ({
    success: (message: string, description?: string, duration?: number) => {
      return notification.success({
        message,
        description,
        duration: duration || 4,
        icon: React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }),
        placement: 'bottomRight',
      });
    },

    error: (message: string, description?: string, duration?: number) => {
      return notification.error({
        message,
        description,
        duration: duration || 4,
        icon: React.createElement(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
        placement: 'bottomRight',
      });
    },

    warning: (message: string, description?: string, duration?: number) => {
      return notification.warning({
        message,
        description,
        duration: duration || 4,
        icon: React.createElement(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
        placement: 'bottomRight',
      });
    },

    info: (message: string, description?: string, duration?: number) => {
      return notification.info({
        message,
        description,
        duration: duration || 4,
        icon: React.createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }),
        placement: 'bottomRight',
      });
    },
  }), [notification]);
};

// Centralized notification functions using App context
export const showNotification = {
  success: () => {
    // This will be replaced by the hook-based approach
    console.warn('showNotification.success called without App context. Use useNotification hook instead.');
  },

  error: () => {
    console.warn('showNotification.error called without App context. Use useNotification hook instead.');
  },

  warning: () => {
    console.warn('showNotification.warning called without App context. Use useNotification hook instead.');
  },

  info: () => {
    console.warn('showNotification.info called without App context. Use useNotification hook instead.');
  },
};

// Export centralized messages
export { NOTIFICATION_MESSAGES, getNotificationMessage };
