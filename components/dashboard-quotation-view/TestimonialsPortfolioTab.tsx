'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Carousel,
  Space,
  Rate,
  Button,
  Image,
  Avatar,
  Divider
} from 'antd';
import {
  StarOutlined,
  ProjectOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { IQuotation } from '@/lib/db/models/Quotation';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text, Paragraph } = Typography;

interface TestimonialsPortfolioTabProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
}

const TestimonialsPortfolioTab: React.FC<TestimonialsPortfolioTabProps> = ({
  quotation,
  standardContent
}) => {
  // Merge testimonials and previous work with standard content
  const testimonials = quotation.testimonials?.length ? quotation.testimonials : (standardContent?.testimonials || []);
  const previousWork = quotation.previousWork?.length ? quotation.previousWork : (standardContent?.previousWork || []);

  return (
    <Row gutter={[24, 24]}>
      {/* Testimonials */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <StarOutlined />
              Client Testimonials
            </Space>
          } 
          style={{
            borderRadius: '16px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ padding: '0 10px' }}>
            <Carousel 
              autoplay={true}
              autoplaySpeed={5000}
              dots={{ 
                className: 'custom-dots'
              }}
              arrows={true}
              infinite={true}
              slidesToShow={1}
              slidesToScroll={1}
              centerMode={true}
              centerPadding="40px"
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} style={{ padding: '0 8px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-quaternary) 100%)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid var(--ant-color-border)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    padding: '32px 24px',
                    textAlign: 'center',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.borderColor = 'var(--ant-color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.borderColor = 'var(--ant-color-border)';
                  }}
                  >
                    {/* User Avatar */}
                    <div style={{ marginBottom: '20px' }}>
                      <Avatar 
                        size={64} 
                        src={testimonial.avatar}
                        style={{ 
                          backgroundColor: testimonial.avatar ? 'transparent' : 'var(--ant-color-primary)',
                          fontSize: '24px',
                          fontWeight: 'bold'
                        }}
                      >
                        {!testimonial.avatar && (testimonial.name?.charAt(0) || 'U')}
                      </Avatar>
                    </div>
                    
                    {/* Rating */}
                    <Rate 
                      disabled 
                      defaultValue={testimonial.rating} 
                      style={{ 
                        fontSize: '24px', 
                        marginBottom: '24px',
                        color: '#FFD700'
                      }} 
                    />
                    
                    {/* Testimonial Message */}
                    <Paragraph style={{ 
                      fontSize: '16px', 
                      fontStyle: 'italic', 
                      margin: '0 0 24px 0',
                      color: 'var(--ant-color-text)',
                      lineHeight: '1.7',
                      fontWeight: '400'
                    }}>
                      {testimonial.message}
                    </Paragraph>
                    
                    {/* Divider */}
                    <div style={{
                      width: '60px',
                      height: '2px',
                      background: 'var(--ant-color-primary)',
                      margin: '0 auto 20px auto',
                      borderRadius: '1px'
                    }} />
                    
                    {/* Client Info */}
                    <div>
                      <Title level={4} style={{ 
                        margin: '0 0 4px 0',
                        color: 'var(--ant-color-text)',
                        fontSize: '18px',
                        fontWeight: '600'
                      }}>
                        {testimonial.name}
                      </Title>
                      <Text type="secondary" style={{ 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {testimonial.company}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </Card>
      </Col>

      {/* Previous Work */}
      <Col xs={24} lg={12}>
        <Card 
          title={
            <Space>
              <ProjectOutlined />
              Our Portfolio
            </Space>
          } 
          style={{
            borderRadius: '16px',
            background: 'var(--ant-color-bg-container)',
            border: '1px solid var(--ant-color-border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ padding: '0 10px' }}>
            <Carousel 
              autoplay={false}
              dots={{ 
                className: 'custom-dots'
              }}
              arrows={true}
              infinite={true}
              slidesToShow={1}
              slidesToScroll={1}
              centerMode={true}
              centerPadding="40px"
            >
            {previousWork.map((work, index) => (
              <div key={index} style={{ padding: '0 8px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--ant-color-bg-container) 0%, var(--ant-color-fill-quaternary) 100%)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '2px solid var(--ant-color-border)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = 'var(--ant-color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.borderColor = 'var(--ant-color-border)';
                }}
                >
                  {/* Project Image */}
                  <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                    <Image
                      src={work.image}
                      alt={work.title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        transition: 'transform 0.4s ease'
                      }}
                      preview={false}
                    />
                    {/* Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                    >
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<LinkOutlined />}
                        style={{ 
                          borderRadius: '50px',
                          height: '48px',
                          padding: '0 24px',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                        onClick={() => work.link && window.open(work.link, '_blank')}
                      >
                        View Project
                      </Button>
                    </div>
                    
                  </div>
                  
                  {/* Project Content */}
                  <div style={{ padding: '24px' }}>
                    <Title level={4} style={{ 
                      margin: '0 0 8px 0',
                      color: 'var(--ant-color-text)',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {work.title}
                    </Title>
                    <Paragraph style={{ 
                      fontSize: '14px', 
                      margin: '0 0 0 0',
                      color: 'var(--ant-color-text-secondary)',
                      lineHeight: '1.6'
                    }}>
                      {work.description}
                    </Paragraph>
                  </div>
                </div>
              </div>
            ))}
            </Carousel>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TestimonialsPortfolioTab;
