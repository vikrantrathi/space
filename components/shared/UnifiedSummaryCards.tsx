'use client';

import React from 'react';
import { Card, Row, Col, theme, Skeleton } from 'antd';

export interface SummaryCardData {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
  prefix?: string;
}

export interface UnifiedSummaryCardsProps {
  data: SummaryCardData[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Unified summary cards component for displaying key metrics
 */
const UnifiedSummaryCards: React.FC<UnifiedSummaryCardsProps> = ({
  data,
  loading = false,
  className,
  style,
}) => {
  const { token } = theme.useToken();

  const getCardStyle = (color?: string) => ({
    background: `linear-gradient(135deg, ${color || token.colorPrimary}15, ${color || token.colorPrimary}05)`,
    border: `1px solid ${color || token.colorPrimary}20`,
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    height: '100%',
  });

  const getLoadingCardStyle = (color?: string) => ({
    background: `linear-gradient(135deg, ${color || token.colorPrimary}15, ${color || token.colorPrimary}05)`,
    border: `1px solid ${color || token.colorPrimary}20`,
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    height: '80%',
    minHeight: '40px', // Compact height with proper content
    display: 'flex',
    alignItems: 'center',
    padding: '8px', // Reduced padding but content size maintained
  });


  return (
    <div className={className} style={style}>
      <Row gutter={[12, 12]}>
        {data.map((item, index) => (
          <Col 
            key={index}
            xs={24} 
            sm={12} 
            md={8} 
            lg={6} 
            xl={4}
          >
            <Card
              style={loading ? getLoadingCardStyle(item.color) : getCardStyle(item.color)}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
                  {/* Loading icon placeholder */}
                  <Skeleton.Avatar 
                    size={24} 
                    shape="square" 
                    active 
                    style={{ minWidth: '24px' }}
                  />
                  
                  {/* Loading content placeholders */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Skeleton.Input 
                      size="small" 
                      active 
                      style={{ 
                        width: '60%', 
                        marginBottom: '8px',
                        height: '12px'
                      }} 
                    />
                    <Skeleton.Input 
                      size="small" 
                      active 
                      style={{ 
                        width: '40%',
                        height: '18px'
                      }} 
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0px' }}>
                  {/* Icon on the left */}
                  {item.icon && (
                    <div style={{
                      fontSize: '20px',
                      color: item.color || token.colorPrimary,
                      minWidth: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </div>
                  )}
                  
                  {/* Content on the right */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      color: token.colorTextSecondary,
                      marginBottom: '2px',
                      fontWeight: 500,
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: item.color || token.colorPrimary,
                      lineHeight: 1.2,
                    }}>
                      {item.prefix}{item.value}{item.suffix}
                    </div>
                    {item.trend && (
                      <div style={{ 
                        fontSize: '10px',
                        color: item.trend.isPositive ? '#52c41a' : '#ff4d4f',
                        marginTop: '2px',
                      }}>
                        {item.trend.isPositive ? '↗' : '↘'} {Math.abs(item.trend.value)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default UnifiedSummaryCards;
