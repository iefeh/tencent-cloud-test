import React, { FC, CSSProperties } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, TableProps, getKeyValue } from '@nextui-org/react';
import { cn } from '@nextui-org/react';

export interface TableColumns<T = any> {
  dataIndex?: string;
  name: string | React.ReactNode;
  width?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

interface CommonTableProps<T = {}> extends TableProps {
  columns: TableColumns<T>[];
  dataList: T[];
  renderComp?: {
    renderContent: (props?: any) => React.ReactNode;
  }
  warpperClassNames?: string;
  bodyClassNames?: string;
  calcHeaderItemClassNames?: (idx: number) => string;
  calcRowClassNames?: (idx: number) => string;
  calcCellClassNames?: (idx: number, rowIdx: number) => string;
}

const CommonTable = <T extends {}>(props: CommonTableProps<T>) => {
  const {
    columns,
    dataList,
    renderComp,
    warpperClassNames,
    bodyClassNames,
    calcHeaderItemClassNames,
    calcRowClassNames,
    calcCellClassNames,
    ...nextTableProps
  } = props;

  return (
    <div className={cn([
      // 'bg-[#e5c9b1] rounded-[1.25rem] px-[1.875rem] py-6',
      warpperClassNames
    ])}>
      <Table
        classNames={{
          // table: 'border-collapse',
          // wrapper: 'bg-transparent shadow-none p-0',
          // thead: '[&>tr:nth-child(2)]:hidden bg-transparent rounded-t-[1.25rem] rounded-b-[.625rem] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset]',
          // th: 'bg-transparent text-[#2E1A0F] text-lg leading-none outline-none pt-3 pb-4 px-6 h-auto',
          // tr: '!rounded-lg',
        }}
        aria-label='Common Table'
        {...nextTableProps}
      >
        <TableHeader columns={columns}>
          {columns.map((column, index) => (
            <TableColumn
              key={column.dataIndex || index}
              className={cn([
                // 'bg-[rgba(210,168,138,.6)]',
                // index === 0 && '!rounded-tl-[1.25rem]',
                // index === columns.length - 1 && '!rounded-tr-[1.25rem]',
                calcHeaderItemClassNames && calcHeaderItemClassNames(index)
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
                // rowIdx % 2 === 0 ? 'bg-[#F3DCC8]' : 'bg-[#e5c9b1]',
                calcRowClassNames && calcRowClassNames(rowIdx)
              ])}
              style={{

              }}
              key={rowIdx}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={column.dataIndex || index}
                  style={{ width: column.width || 'auto' }}
                  className={cn([
                    index === 0 && 'rounded-l-lg',
                    index === columns.length - 1 && 'rounded-r-lg',
                    calcCellClassNames && calcCellClassNames(index, rowIdx)
                  ])}
                >
                  {column.render
                    ? column.render(getKeyValue(item, column.dataIndex || ''), item, rowIdx)
                    : getKeyValue(item, column.dataIndex || '') || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {
        renderComp
          ? <div>{renderComp.renderContent()}</div>
          : null
      }
    </div >
  )
}

export default CommonTable;