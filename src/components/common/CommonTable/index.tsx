import React, { FC } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, TableProps, getKeyValue } from '@nextui-org/react';
import { cn } from '@nextui-org/react';

export interface TableColumns<T = any> {
  dataIndex?: string;
  name: string;
  width?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

interface CommonTableProps<T = {}> extends TableProps {
  columns: TableColumns<T>[];
  dataList: T[];
  renderComp?: {
    renderContent: (props?: any) => React.ReactNode;
  }
}

const CommonTable = <T extends { id?: string }>(props: CommonTableProps<T>) => {
  const { columns, dataList, renderComp, ...nextTableProps } = props;

  return (
    <div className='bg-[#e5c9b1] rounded-[1.25rem] px-[1.875rem] py-6'>
      <Table
        aria-label="Example table with custom cells"
        classNames={{
          table: 'border-collapse',
          wrapper: 'bg-transparent shadow-none p-0',
          thead: '[&>tr:nth-child(2)]:hidden bg-transparent rounded-t-[1.25rem] rounded-b-[.625rem] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset]',
          th: 'bg-transparent text-[#2E1A0F] text-lg leading-none outline-none pt-3 pb-4 px-6 h-auto',
          tr: '!rounded-lg',
        }}
        {...nextTableProps}
      >
        <TableHeader columns={columns}>
          {columns.map((column, index) => (
            <TableColumn
              key={column.dataIndex || index}
              className={cn([
                'bg-[rgba(210,168,138,.6)]',
                index === 0 && '!rounded-tl-[1.25rem]',
                index === columns.length - 1 && '!rounded-tr-[1.25rem]',
              ])}
              style={{ width: column.width || 'auto' }}
            >
              {column.name}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody items={dataList}>
          {dataList.map((item, rowIdx) => (
            <TableRow
              className={cn([
                rowIdx % 2 === 0 ? 'bg-[#F3DCC8]' : 'bg-[#e5c9b1]',
              ])}
              key={item.id || rowIdx}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={column.dataIndex || index}
                  style={{ width: column.width || 'auto' }}
                  className={cn([
                    index === 0 && 'rounded-l-lg',
                    index === columns.length - 1 && 'rounded-r-lg',
                  ])}
                >
                  {column.render
                    ? column.render(getKeyValue(item, column.dataIndex || '') || item, item, rowIdx)
                    : getKeyValue(item, column.dataIndex || '') || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {renderComp
        ? <div>{renderComp.renderContent()}</div>
        : null
      }
    </div>
  )
}

export default CommonTable;