'use client';

import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Spin, App, theme } from 'antd';
import { useNotification } from '@/lib/utils/notification';
import { NOTIFICATION_MESSAGES } from '@/lib/utils/notificationMessages';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  MailOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../lib/auth/auth-context';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useGlobalLoader } from '@/components/shared/GlobalLoader';
import Breadcrumb from '@/components/shared/Breadcrumb';
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
  const notification = useNotification();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
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

  // Function to determine the active menu key and open keys based on the current path
  const getMenuState = (pathname: string): { selectedKeys: string[], openKeys: string[] } => {
    // Direct matches first
    if (pathname === '/dashboard' || pathname === '/dashboard/admin') {
      return { selectedKeys: [pathname], openKeys: [] };
    }
    
    // For sub-pages, find the parent menu key and handle sub-menus
    if (pathname.startsWith('/dashboard/admin/quotations')) {
      // For quotation sub-pages, show the parent quotations menu as active
      return { selectedKeys: ['/dashboard/admin/quotations'], openKeys: [] };
    }
    if (pathname.startsWith('/dashboard/admin/users')) {
      // For user sub-pages, show the parent users menu as active
      return { selectedKeys: ['/dashboard/admin/users'], openKeys: [] };
    }
    if (pathname.startsWith('/dashboard/admin/activities')) {
      // For activity sub-pages, show the parent activities menu as active
      return { selectedKeys: ['/dashboard/admin/activities'], openKeys: [] };
    }
    if (pathname.startsWith('/dashboard/admin/settings')) {
      // For settings sub-pages, show both the sub-menu item and parent as open
      return { 
        selectedKeys: [pathname], 
        openKeys: ['/dashboard/admin/settings-menu'] 
      };
    }
    if (pathname.startsWith('/dashboard/client/activities')) {
      // For client activity sub-pages, show the parent activities menu as active
      return { selectedKeys: ['/dashboard/client/activities'], openKeys: [] };
    }
    if (pathname.startsWith('/dashboard/client/quotations')) {
      // For client quotation sub-pages, show the parent quotations menu as active
      return { selectedKeys: ['/dashboard/client/quotations'], openKeys: [] };
    }
    if (pathname.startsWith('/dashboard/client/settings')) {
      // For client settings sub-pages, show the parent settings menu as active
      return { selectedKeys: ['/dashboard/client/settings'], openKeys: [] };
    }
    
    // Fallback to exact match
    return { selectedKeys: [pathname], openKeys: [] };
  };

  // Get menu state for current pathname
  const menuState = getMenuState(pathname);
  
  // Update openKeys when pathname changes
  useEffect(() => {
    setOpenKeys(menuState.openKeys);
  }, [pathname]);

  // Handle menu item clicks - close sidebar on mobile
  const handleMenuClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

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
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = user?.role === 'admin' ? [
     {
       key: '/dashboard/admin',
       icon: <DashboardOutlined />,
       label: <Link href="/dashboard/admin" onClick={handleMenuClick}>Dashboard</Link>,
     },
     {
       key: '/dashboard/admin/users',
       icon: <UserOutlined />,
       label: <Link href="/dashboard/admin/users" onClick={handleMenuClick}>Users</Link>,
     },
     {
       key: '/dashboard/admin/quotations',
       icon: <FileTextOutlined />,
       label: <Link href="/dashboard/admin/quotations" onClick={handleMenuClick}>Quotations</Link>,
     },
     {
       key: '/dashboard/admin/activities',
       icon: <HistoryOutlined />,
       label: <Link href="/dashboard/admin/activities" onClick={handleMenuClick}>Activity Log</Link>,
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
               onClick={handleMenuClick}
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
               onClick={handleMenuClick}
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
       label: <Link href="/dashboard" onClick={handleMenuClick}>Dashboard</Link>,
     },
     {
       key: '/dashboard/client/quotations',
       icon: <FileTextOutlined />,
       label: <Link href="/dashboard/client/quotations" onClick={handleMenuClick}>Quotations</Link>,
     },
     {
       key: '/dashboard/client/activities',
       icon: <HistoryOutlined />,
       label: <Link href="/dashboard/client/activities" onClick={handleMenuClick}>Activity Log</Link>,
     },
     {
       key: '/dashboard/client/settings',
       icon: <SettingOutlined />,
       label: <Link href="/dashboard/client/settings" onClick={handleMenuClick}>Settings</Link>,
     },
   ];

  const handleLogout = () => {
    const msg = NOTIFICATION_MESSAGES.AUTH.LOGOUT_SUCCESS;
    notification.success(msg.message, msg.description, msg.duration);
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
            marginBottom: collapsed ? '15px' : '-30px',
            transition: 'all 0.3s ease-in-out'
          }}>
            {/* Hide logo on mobile when sidebar is collapsed to prevent flash */}
            {!isMobile && collapsed ? (
              <Image 
                src="/s.png" 
                alt="Logo" 
                width={100} 
                height={100}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ) : !collapsed ? (
              <Image 
                src="/PNG.webp" 
                alt="Logo" 
                width={200} 
                height={100}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ) : null}
          </div>
           <Menu
             theme="dark"
             mode="inline"
             selectedKeys={menuState.selectedKeys}
             openKeys={openKeys}
             onOpenChange={setOpenKeys}
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
              padding: '0 12px',
              background: token.colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              position: 'fixed',
              top: 0,
              left: isMobile ? 0 : (collapsed ? 80 : 200),
              right: 0,
              zIndex: 1000,
            }}
            className="px-3 md:px-6"
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '16px', 
                width: 64, 
                height: 64,
                marginLeft: isMobile ? '-15px' : '-10px'
              }}
            />
            <Breadcrumb />
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              <Text className="hidden sm:block">Welcome, {user?.name}</Text>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  style={{ cursor: 'pointer' }}
                  src={user?.profilePicture}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: '4px 6px 0', padding: '12px', background: token.colorBgContainer, minHeight: 280, overflow: 'hidden' }} className="p-3 md:p-6">
            {children}
          </Content>
        </Layout>
      </Layout>
  );
};

export default DashboardLayout;

