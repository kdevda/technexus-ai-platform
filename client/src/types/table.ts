export interface BaseRecord {
  id: string;
  [key: string]: any;
}

export interface TableRow extends BaseRecord {
  original: BaseRecord;
}

export interface Column {
  id: string;
  header?: string;
  accessorKey?: string;
  cell?: (props: { row: TableRow }) => React.ReactNode;
} 