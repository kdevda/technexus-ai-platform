import { useState } from "react";
import { Table } from "@/components/ui/table";
import { TableRow, Column, BaseRecord } from "@/types/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DataTableProps {
  columns: Column[];
  data: BaseRecord[];
  loading?: boolean;
}

export const DataTable = ({ columns, data, loading }: DataTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [];
  
  // Sort data if sort config exists
  const sortedData = [...dataArray].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const result = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? result : -result;
  });

  const formattedData: TableRow[] = sortedData.map(row => ({
    ...row,
    original: row
  }));

  const handleSort = (columnId: string) => {
    setSortConfig(current => {
      if (!current || current.key !== columnId) {
        return { key: columnId, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: columnId, direction: 'desc' };
      }
      return null;
    });
  };

  const renderSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.key !== columnId) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <Table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th 
              key={column.id} 
              className="px-4 py-2 cursor-pointer select-none"
              onClick={() => column.accessorKey && handleSort(column.accessorKey)}
            >
              <div className="flex items-center gap-2">
                {column.header}
                {column.accessorKey && renderSortIcon(column.accessorKey)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {formattedData.length === 0 ? (
          <tr>
            <td 
              colSpan={columns.length} 
              className="text-center py-4 text-gray-500"
            >
              No records found
            </td>
          </tr>
        ) : (
          formattedData.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-2">
                  {column.cell ? column.cell({ row }) : 
                   column.accessorKey ? row[column.accessorKey] : null}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}; 