'use client';

import React from 'react';
import { Breadcrumb as AntBreadcrumb, theme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const { token } = theme.useToken();

  // Create a mapping of routes to human-readable labels
  const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/admin': 'Admin Dashboard',
    '/dashboard/client': 'Client Dashboard',
    '/dashboard/admin/users': 'Users',
    '/dashboard/admin/quotations': 'Quotations',
    '/dashboard/admin/activities': 'Activity Log',
    '/dashboard/admin/settings': 'Settings',
    '/dashboard/admin/settings/email-templates': 'Email Templates',
    '/dashboard/client/activities': 'My Activities',
    '/dashboard/client/quotations': 'My Quotations',
    '/dashboard/client/settings': 'Settings',
    '/dashboard/admin/quotations/create': 'Create Quotation',
    '/dashboard/admin/quotations/standard-content': 'Standard Content',
    '/dashboard/admin/users/[id]/profile': 'User Profile',
  };

  // Handle dynamic routes by checking if the path matches a pattern
  const getDynamicRouteLabel = (path: string): string | null => {
    // Handle user profile pages with dynamic IDs
    if (path.match(/^\/dashboard\/admin\/users\/[^\/]+\/profile$/)) {
      return 'User Profile';
    }
    return null;
  };

  // Generate breadcrumb items from the current pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // If we're on the root dashboard, just show "Dashboard"
    if (pathname === '/dashboard') {
      return [{
        title: 'Dashboard',
        href: undefined,
      }];
    }

    // Determine the base dashboard path based on the route
    const isAdminRoute = pathname.startsWith('/dashboard/admin');
    const isClientRoute = pathname.startsWith('/dashboard/client');
    
    // Set the appropriate base dashboard path
    // For client routes, use /dashboard as the home (since there's no separate client home)
    // For admin routes, use /dashboard/admin as the home
    const baseDashboardPath = isAdminRoute ? '/dashboard/admin' : '/dashboard';

    // Always start with Home
    breadcrumbs.push({
      title: 'Home',
      href: baseDashboardPath,
    });

    // Build breadcrumbs from path segments, skipping the base dashboard segments
    let currentPath = '';
    const startIndex = isAdminRoute ? 2 : isClientRoute ? 2 : 1; // Skip 'dashboard' and 'admin'/'client'
    
    for (let i = startIndex; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      
      // Skip dynamic segments like [id]
      if (pathSegments[i].startsWith('[') && pathSegments[i].endsWith(']')) {
        continue;
      }

      // Build the full path correctly for both admin and client routes
      const fullPath = isAdminRoute ? `/dashboard/admin${currentPath}` : 
                      isClientRoute ? `/dashboard/client${currentPath}` : 
                      `/dashboard${currentPath}`;
      
      const label = routeLabels[fullPath] || getDynamicRouteLabel(fullPath);
      if (label) {
        // Don't make the last item clickable
        const isLast = i === pathSegments.length - 1;
        breadcrumbs.push({
          title: label,
          href: isLast ? undefined : fullPath,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <div className="hidden md:block">
      <AntBreadcrumb
        style={{ 
          margin: 0,
          flex: 1,
          marginLeft: 16,
          marginRight: 16,
        }}
        items={breadcrumbItems.map((item, index) => ({
          title: item.href ? (
            <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
              {index === 0 && <HomeOutlined style={{ marginRight: 4 }} />}
              {item.title}
            </Link>
          ) : (
            <span style={{ color: token.colorTextSecondary }}>
              {index === 0 && <HomeOutlined style={{ marginRight: 4 }} />}
              {item.title}
            </span>
          ),
        }))}
      />
    </div>
  );
};

export default Breadcrumb;
