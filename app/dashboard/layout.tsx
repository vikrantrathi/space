'use client';

import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Spin, App, theme } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  MailOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../lib/auth/auth-context';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useGlobalLoader } from '@/components/shared/GlobalLoader';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { notification } = App.useApp();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();
  const { mode, setMode, resolved } = useTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show global loading during authentication check
  useEffect(() => {
    setGlobalLoading(isLoading);
  }, [isLoading, setGlobalLoading]);
  
  // Handle client-side mounting
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Auto-collapse sidebar on small screens and update on resize
  useEffect(() => {
    if (!isClientMounted) return;
    
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isClientMounted]);

  // Show loading spinner during authentication check or if not authenticated
  if (isLoading || !isAuthenticated || !isClientMounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        {isClientMounted && <Spin size="large" />}
        {!isClientMounted && (
          <>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #1890ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </>
        )}
      </div>
    );
  }

  const menuItems = user?.role === 'admin' ? [
     {
       key: '/dashboard/admin',
       icon: <DashboardOutlined />,
       label: <Link href="/dashboard/admin">Dashboard</Link>,
     },
     {
       key: '/dashboard/admin/users',
       icon: <UserOutlined />,
       label: <Link href="/dashboard/admin/users">Users</Link>,
     },
     {
       key: '/dashboard/admin/quotations',
       icon: <FileTextOutlined />,
       label: <Link href="/dashboard/admin/quotations">Quotations</Link>,
     },
     {
       key: '/dashboard/admin/activities',
       icon: <HistoryOutlined />,
       label: <Link href="/dashboard/admin/activities">Activity Log</Link>,
     },
     {
       key: '/dashboard/admin/settings-menu',
       icon: <SettingOutlined />,
       label: 'Settings',
       children: [
         {
           key: '/dashboard/admin/settings',
           icon: <UserOutlined style={{ fontSize: '14px' }} />,
           label: (
             <Link
               href="/dashboard/admin/settings"
               style={{
                 fontSize: '13px',
               }}
             >
               Profile & Security
             </Link>
           ),
         },
         {
           key: '/dashboard/admin/settings/email-templates',
           icon: <MailOutlined style={{ fontSize: '14px' }} />,
           label: (
             <Link
               href="/dashboard/admin/settings/email-templates"
               style={{
                 fontSize: '13px',
               }}
             >
               Email Templates
             </Link>
           ),
         },
       ],
     },
   ] : [
     {
       key: '/dashboard',
       icon: <DashboardOutlined />,
       label: <Link href="/dashboard">Dashboard</Link>,
     },
     {
       key: '/dashboard/client/quotations',
       icon: <FileTextOutlined />,
       label: <Link href="/dashboard/client/quotations">Quotations</Link>,
     },
     {
       key: '/dashboard/client/settings',
       icon: <SettingOutlined />,
       label: <Link href="/dashboard/client/settings">Settings</Link>,
     },
   ];

  const handleLogout = () => {
    notification.success({
      message: 'Logged Out Successfully',
      description: 'You have been logged out. Redirecting to login page...',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      duration: 2,
    });
    logout();
  };

  const handleProfileClick = () => {
    const settingsPath = user?.role === 'admin' ? '/dashboard/admin/settings' : '/dashboard/client/settings';
    router.push(settingsPath);
  };

  const themeMenuItems = [
    {
      key: 'theme:light',
      icon: <BulbOutlined />,
      label: <span>Light {resolved === 'light' && <strong>(active)</strong>}</span>,
      onClick: () => setMode('light'),
    },
    {
      key: 'theme:dark',
      icon: <BulbOutlined />,
      label: <span>Dark {resolved === 'dark' && <strong>(active)</strong>}</span>,
      onClick: () => setMode('dark'),
    },
    {
      key: 'theme:system',
      icon: <BulbOutlined />,
      label: <span>System {mode === 'system' && <strong>(active)</strong>}</span>,
      onClick: () => setMode('system'),
    },
  ];

  const userMenuItems = [
    ...themeMenuItems,
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: handleProfileClick,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={200}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
          style={{
            position: 'fixed',
            height: '100vh',
            left: 0,
            zIndex: 1000,
            background: resolved === 'dark' ? token.colorBgContainer : '#001529',
          }}
        >
          <div style={{
            padding: collapsed ? '0px 20px' : '0px 0px',
            textAlign: 'center',
            marginTop: collapsed ? '10px' : '-40px',
            marginBottom: collapsed ? '15px' : '-30px'
          }}>
            {collapsed ? (
              <Image src="/s.png" alt="Logo" width={100} height={100} />
            ) : (
              <Image src="/PNG.webp" alt="Logo" width={200} height={100} />
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
          />
        </Sider>
        {isMobile && !collapsed && (
          <div
            onClick={() => setCollapsed(true)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999,
            }}
          />
        )}
        <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), marginTop: 64 }}>
          <Header
            style={{
              padding: '0 24px',
              background: token.colorBgContainer,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'fixed',
              top: 0,
              left: isMobile ? 0 : (collapsed ? 80 : 200),
              right: 0,
              zIndex: 1000,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 ,marginLeft: -25}}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Text>Welcome, {user?.name}</Text>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  style={{ cursor: 'pointer' }}
                  src={user?.profilePicture}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: '4px 6px 0', padding: 24, background: token.colorBgContainer, minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
  );
};

export default DashboardLayout;

