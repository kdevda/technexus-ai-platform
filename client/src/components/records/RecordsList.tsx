import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Column, BaseRecord } from "@/types/table";
import { DatabaseTable } from "@/types/database";

interface RecordsListProps {
  tableId: string;
}

export const RecordsList = ({ tableId }: RecordsListProps) => {
  const [records, setRecords] = useState<BaseRecord[]>([]);
  const [table, setTable] = useState<DatabaseTable | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to fetch records
  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}/records`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to fetch records');
      }
      
      const data = await response.json();
      const formattedRecords = Array.isArray(data) ? data.map(record => ({
        ...record,
        created_at: new Date(record.created_at).toLocaleString(),
        updated_at: new Date(record.updated_at).toLocaleString()
      })) : [];
      
      setRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load records',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch table details
  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const response = await fetch(`/api/tables/${tableId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch table details');
        }
        
        const data = await response.json();
        setTable(data);
      } catch (error) {
        console.error('Error fetching table details:', error);
        toast({
          title: "Error",
          description: "Failed to load table details",
          variant: "destructive",
        });
      }
    };

    fetchTableDetails();
  }, [tableId, toast]);

  // Fetch records when table details are available
  useEffect(() => {
    if (table) {
      fetchRecords();
    }
  }, [table, tableId]);

  // Generate columns with proper sorting
  const generateColumns = (): Column[] => {
    if (!table) return [];
    
    const fieldColumns: Column[] = table.fields.map(field => ({
      id: field.name,
      header: field.label || field.name,
      accessorKey: field.name,
      cell: ({ row }) => {
        const value = row.original[field.name];
        switch (field.type) {
          case 'boolean':
            return value ? 'Yes' : 'No';
          case 'currency':
            return typeof value === 'number' 
              ? `$${value.toFixed(2)}` 
              : value;
          default:
            return value ?? '';
        }
      }
    }));

    // Add created_at and updated_at columns
    const timestampColumns: Column[] = [
      {
        id: 'created_at',
        header: 'Created At',
        accessorKey: 'created_at'
      },
      {
        id: 'updated_at',
        header: 'Updated At',
        accessorKey: 'updated_at'
      }
    ];

    // Add actions column
    const actionsColumn: Column = {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/platform/records/${tableId}/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/platform/records/${tableId}/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    };

    return [...fieldColumns, ...timestampColumns, actionsColumn];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Records</h2>
        <Button onClick={fetchRecords}>
          Refresh
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={generateColumns()}
          data={records}
          loading={loading}
        />
      </div>
    </div>
  );
}; 