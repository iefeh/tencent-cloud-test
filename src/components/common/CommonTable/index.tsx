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
      warpperClassNames
    ])}>
      <Table
        aria-label='Common Table'
        {...nextTableProps}
      >
        <TableHeader columns={columns}>
          {columns.map((column, index) => (
            <TableColumn
              key={column.dataIndex || index}
              className={cn([

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
                calcRowClassNames && calcRowClassNames(rowIdx)
              ])}
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