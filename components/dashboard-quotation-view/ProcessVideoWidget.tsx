'use client';

import React from 'react';
import { Card, Typography, Space, theme } from 'antd';
import { PlayCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { IStandardContent } from '@/lib/db/models/StandardContent';

const { Title, Text } = Typography;

interface ProcessVideoWidgetProps {
  standardContent?: IStandardContent;
  theme?: {
    colorBgContainer: string;
    colorPrimary: string;
    colorTextSecondary: string;
    colorBorder: string;
  };
}

const ProcessVideoWidget: React.FC<ProcessVideoWidgetProps> = ({
  standardContent,
  theme: themeProps
}) => {
  const { token } = theme.useToken();

  // Use theme props if provided, otherwise use token
  const bgColor = themeProps?.colorBgContainer || token.colorBgContainer;
  const primaryColor = themeProps?.colorPrimary || token.colorPrimary;
  const textSecondary = themeProps?.colorTextSecondary || token.colorTextSecondary;
  const borderColor = themeProps?.colorBorder || token.colorBorder;

  const processVideo = standardContent?.processVideo;

  if (!processVideo) {
    return null;
  }

  // Function to extract video ID from different URL formats
  const getVideoId = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        id: youtubeMatch[1]
      };
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        id: vimeoMatch[1]
      };
    }

    // Direct video file
    if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      return {
        type: 'direct',
        url: url
      };
    }

    return null;
  };

  const videoInfo = getVideoId(processVideo);

  const renderVideo = () => {
    if (!videoInfo) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}25)`,
          borderRadius: '12px',
          border: `2px dashed ${primaryColor}40`
        }}>
          <VideoCameraOutlined style={{ fontSize: '48px', color: primaryColor, marginBottom: '16px' }} />
          <Text type="secondary" style={{ textAlign: 'center' }}>
            Invalid video URL format
          </Text>
        </div>
      );
    }

    if (videoInfo.type === 'youtube') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoInfo.id}?rel=0&modestbranding=1`}
            title="Process Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: '12px',
              border: 'none'
            }}
          />
        </div>
      );
    }

    if (videoInfo.type === 'vimeo') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://player.vimeo.com/video/${videoInfo.id}?title=0&byline=0&portrait=0`}
            title="Process Video"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: '12px',
              border: 'none'
            }}
          />
        </div>
      );
    }

    if (videoInfo.type === 'direct') {
      return (
        <video
          controls
          style={{
            width: '100%',
            height: '300px',
            borderRadius: '12px',
            objectFit: 'cover'
          }}
        >
          <source src={videoInfo.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return null;
  };

  return (
    <Card
      style={{
        borderRadius: '16px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        height: 'fit-content'
      }}
      styles={{ body: { padding: '20px' } }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ textAlign: 'center' }}>
          <Space align="center" size="small">
            <PlayCircleOutlined style={{ fontSize: '20px', color: primaryColor }} />
            <Title level={4} style={{ margin: 0, color: primaryColor }}>
              Process Video
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
            Watch our process in action
          </Text>
        </div>

        {renderVideo()}

        <div style={{
          padding: '12px',
          background: `${primaryColor}08`,
          borderRadius: '8px',
          border: `1px solid ${primaryColor}20`
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 This video demonstrates our proven process and methodology
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default ProcessVideoWidget;
