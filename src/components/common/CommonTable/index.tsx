import React, { FC } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, TableProps, getKeyValue } from '@nextui-org/react';
import { cn } from '@nextui-org/react';

export interface TableColumns<T = any> {
  dataIndex?: string;
  name: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

interface CommonTableProps<T = {}> extends TableProps {
  columns: TableColumns<T>[];
  dataList: T[]
}

const CommonTable = <T extends { id?: string }>(props: CommonTableProps<T>) => {
  const { columns, dataList, ...nextTableProps } = props;

  return (
    <Table
      aria-label="Example table with custom cells"
      classNames={{
        wrapper: 'bg-[#e5c9b1] rounded-[1.25rem]',
        thead: 'rounded-t-[1.25rem] rounded-b-[.625rem] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset]',
        th: 'bg-[#B68867] text-[#2E1A0F] text-lg leading-none outline-none pt-3 pb-4 px-6 h-auto',
      }}
      {...nextTableProps}
    >
      <TableHeader className='rounded-t-[1.25rem] rounded-b-[.625rem] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset]' columns={columns}>
        {columns.map((column, index) => (
          <TableColumn key={column.dataIndex || index}>
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
              <TableCell key={column.dataIndex || index}>
                {column.render
                  ? column.render(getKeyValue(item, column.dataIndex || '') || item, item, rowIdx)
                  : getKeyValue(item, column.dataIndex || '') || '-'}
              </TableCell>
            ))}
          </TableRow>
        ))}

      </TableBody>
    </Table >
  )
}

export default CommonTable;