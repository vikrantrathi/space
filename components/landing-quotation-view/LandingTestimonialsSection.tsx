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

interface LandingTestimonialsSectionProps {
  quotation: IQuotation;
  standardContent?: IStandardContent;
  isDark?: boolean;
}

const LandingTestimonialsSection: React.FC<LandingTestimonialsSectionProps> = ({
  quotation,
  standardContent,
  isDark = false
}) => {
  // Merge testimonials and previous work with standard content
  const testimonials = quotation.testimonials?.length ? quotation.testimonials : (standardContent?.testimonials || []);
  const previousWork = quotation.previousWork?.length ? quotation.previousWork : (standardContent?.previousWork || []);

  return (
    <div style={{
      padding: 'clamp(40px, 6vw, 60px) 20px',
      background: isDark ? '#0f0f23' : '#f8fafc'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={2} style={{
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: '700',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: isDark ? '#ffffff' : '#1a202c'
          }}>
            Testimonials & Portfolio
          </Title>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '0 auto',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }} />
        </div>

        <Row gutter={[32, 32]}>
          {/* Testimonials */}
          <Col xs={24} lg={12}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <StarOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Client Testimonials
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                {testimonials.length > 0 ? (
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
                      centerMode={false}
                      centerPadding="0px"
                      responsive={[
                        {
                          breakpoint: 768,
                          settings: {
                            centerMode: false,
                            centerPadding: "0px",
                            arrows: false
                          }
                        }
                      ]}
                    >
                    {testimonials.map((testimonial, index) => (
                      <div key={index} style={{ padding: '0 8px' }}>
                        <div style={{
                          background: isDark ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                          e.currentTarget.style.boxShadow = isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)';
                          e.currentTarget.style.borderColor = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = isDark ? '#4a5568' : '#e2e8f0';
                        }}
                        >
                          {/* User Avatar */}
                          <div style={{ marginBottom: '24px' }}>
                            <Avatar 
                              size={80} 
                              src={testimonial.avatar}
                              style={{ 
                                backgroundColor: testimonial.avatar ? 'transparent' : '#667eea',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
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
                              color: '#fbbf24'
                            }}
                          />
                          
                          {/* Testimonial Message */}
                          <Paragraph style={{ 
                            fontSize: '18px', 
                            fontStyle: 'italic', 
                            margin: '0 0 24px 0',
                            color: isDark ? '#ffffff' : '#1a202c',
                            lineHeight: '1.7',
                            fontWeight: '400',
                            textAlign: 'center'
                          }}>
                            &ldquo;{testimonial.message}&rdquo;
                          </Paragraph>
                          
                          {/* Divider */}
                          <div style={{
                            width: '80px',
                            height: '3px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            margin: '0 auto 24px auto',
                            borderRadius: '2px'
                          }} />
                          
                          {/* Client Info */}
                          <div>
                            <Title level={3} style={{ 
                              margin: '0 0 8px 0',
                              color: isDark ? '#ffffff' : '#1a202c',
                              fontSize: '20px',
                              fontWeight: '700'
                            }}>
                              {testimonial.name}
                            </Title>
                            <Text style={{ 
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#6b7280'
                            }}>
                              {testimonial.company}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                    </Carousel>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: isDark ? '#a0aec0' : '#6b7280'
                  }}>
                    <StarOutlined style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      color: isDark ? '#4a5568' : '#d1d5db'
                    }} />
                    <div style={{ 
                      fontSize: '18px',
                      color: isDark ? '#cbd5e0' : '#4a5568',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      No Testimonials Available
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: isDark ? '#a0aec0' : '#9ca3af'
                    }}>
                      Client testimonials will be displayed here.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Previous Work */}
          <Col xs={24} lg={12}>
            <Card 
              style={{
                borderRadius: '20px',
                border: 'none',
                  background: isDark ? '#1a1a2e' : 'white',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '30px',
                color: 'white',
                margin: '-24px -24px 24px -24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <ProjectOutlined style={{ fontSize: '24px' }} />
                  <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                    Our Portfolio
                  </Title>
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                {previousWork.length > 0 ? (
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
                      centerMode={false}
                      centerPadding="0px"
                      responsive={[
                        {
                          breakpoint: 768,
                          settings: {
                            centerMode: false,
                            centerPadding: "0px",
                            arrows: false
                          }
                        }
                      ]}
                    >
                    {previousWork.map((work, index) => (
                      <div key={index} style={{ padding: '0 8px' }}>
                        <div style={{
                          background: isDark ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          border: isDark ? '1px solid #4a5568' : '1px solid #e2e8f0',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                          e.currentTarget.style.boxShadow = isDark ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)';
                          e.currentTarget.style.borderColor = '#f59e0b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = isDark ? '#4a5568' : '#e2e8f0';
                        }}
                        >
                          {/* Project Image */}
                          <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                            <Image
                              src={work.image}
                              alt={work.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
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
                              background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
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
                                  height: '52px',
                                  padding: '0 28px',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  border: 'none',
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
                            <Title level={3} style={{ 
                              margin: '0 0 12px 0',
                              color: isDark ? '#ffffff' : '#1a202c',
                              fontSize: '20px',
                              fontWeight: '700'
                            }}>
                              {work.title}
                            </Title>
                            <Paragraph style={{ 
                              fontSize: '16px', 
                              margin: '0 0 0 0',
                              color: isDark ? '#cbd5e0' : '#6b7280',
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
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: isDark ? '#a0aec0' : '#6b7280'
                  }}>
                    <ProjectOutlined style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      color: isDark ? '#4a5568' : '#d1d5db'
                    }} />
                    <div style={{ 
                      fontSize: '18px',
                      color: isDark ? '#cbd5e0' : '#4a5568',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      No Portfolio Items Available
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: isDark ? '#a0aec0' : '#9ca3af'
                    }}>
                      Portfolio items will be displayed here.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Section Separator */}
      <div style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
        margin: '60px 0 0 0'
      }} />
    </div>
  );
};

export default LandingTestimonialsSection;

