'use client';

import React from 'react';
import { Table, theme } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';

type Props<RecordType> = TableProps<RecordType> & {
  // Enhanced pagination props
  defaultPageSize?: number;
  pageSizeOptions?: string[];
  showPaginationInfo?: boolean;
  paginationPosition?: ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[];
};

function UnifiedTable<RecordType extends object = object>(props: Props<RecordType>) {
  const { token } = theme.useToken();

  const { 
    size, 
    bordered, 
    pagination, 
    scroll, 
    style, 
    defaultPageSize = 10,
    pageSizeOptions = ['5', '10', '20', '50', '100'],
    showPaginationInfo = true,
    paginationPosition = ['bottomRight'],
    ...rest 
  } = props;

  let mergedPagination: false | TablePaginationConfig;
  if (pagination === false) {
    mergedPagination = false;
  } else {
    mergedPagination = {
      pageSize: defaultPageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      position: paginationPosition,
      pageSizeOptions,
      showTotal: showPaginationInfo ? (total, range) =>
        `${range[0]}-${range[1]} of ${total} items` : undefined,
      ...(pagination as TablePaginationConfig),
    };
  }

  const mergedScroll = {
    x: 'max-content',
    ...scroll,
  };

  const mergedStyle: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    ...style,
  };

  return (
    <Table<RecordType>
      size={size ?? 'middle'}
      bordered={bordered ?? true}
      pagination={mergedPagination}
      scroll={mergedScroll}
      style={mergedStyle}
      {...rest}
    />
  );
}

export default UnifiedTable;