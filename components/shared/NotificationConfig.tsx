'use client';

import { notification } from 'antd';
import { useEffect } from 'react';

export default function NotificationConfig() {
  useEffect(() => {
    // Configure notifications when component mounts
    const configureNotifications = () => {
      notification.config({
        placement: 'bottomRight',
        duration: 4,
        maxCount: 3,
        rtl: false,
      });
    };
    
    configureNotifications();
    
    // Also configure after a short delay to ensure it's applied
    const timeoutId = setTimeout(configureNotifications, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}