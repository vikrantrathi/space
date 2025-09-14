'use client';

import React from 'react';
import { Segmented, Space, Typography } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useTheme } from '@/components/providers/ThemeProvider';

type Option = 'light' | 'dark' | 'system';

export default function ThemeModeSelect() {
  const { mode, setMode, resolved } = useTheme();

  const options = [
    { label: 'Light', value: 'light' as Option },
    { label: 'Dark', value: 'dark' as Option },
    { label: 'System', value: 'system' as Option },
  ];

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space size="small" align="center">
        <BulbOutlined />
        <Typography.Text strong>Appearance</Typography.Text>
        <Typography.Text type="secondary">
          Current: {resolved.toUpperCase()}
        </Typography.Text>
      </Space>
      <Segmented
        options={options}
        value={mode}
        onChange={(val) => setMode(val as Option)}
        block
      />
    </Space>
  );
}