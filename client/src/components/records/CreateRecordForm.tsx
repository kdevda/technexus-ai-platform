import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DatabaseTable, TableField } from "@/types/database";

interface CreateRecordFormProps {
  tableId: string;
  onSuccess?: () => void;
}

const renderField = (field: TableField, value: any, onChange: (value: any) => void) => {
  switch (field.type) {
    case 'boolean':
      return (
        <Checkbox
          id={field.name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );

    case 'select':
      let options: string[] = [];
      try {
        // Parse options if it's a string, or use directly if it's already an array
        options = typeof field.options === 'string' 
          ? JSON.parse(field.options) 
          : (field.options || []);
      } catch (e) {
        console.error('Error parsing options:', e);
      }
      
      return (
        <Select
          value={value || ''}
          onValueChange={(value) => onChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select an option</SelectItem>
            {options.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'number':
    case 'currency':
      return (
        <Input
          id={field.name}
          type="number"
          step={field.type === 'currency' ? "0.01" : "1"}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'datetime':
      return (
        <Input
          id={field.name}
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'date':
      return (
        <Input
          id={field.name}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    default:
      return (
        <Input
          id={field.name}
          type={field.type === 'password' ? 'password' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
  }
};

export const CreateRecordForm = ({ tableId, onSuccess }: CreateRecordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [table, setTable] = useState<DatabaseTable | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const response = await fetch(`/api/tables/${tableId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || `Failed to fetch table details: ${response.status}`);
        }

        const data = await response.json();
        setTable(data);
        
        // Initialize form data with default values
        const initialData: Record<string, any> = {};
        data.fields.forEach((field: TableField) => {
          initialData[field.name] = field.defaultValue || '';
        });
        setFormData(initialData);
      } catch (error) {
        console.error('Error fetching table details:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch table details',
          variant: "destructive",
        });
      }
    };

    fetchTableDetails();
  }, [tableId, toast]);

  const formatValue = (field: TableField, value: any) => {
    switch (field.type) {
      case 'number':
      case 'currency':
        return value === '' ? null : Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
      case 'datetime':
        return value || null;
      default:
        return value;
    }
  };

  const handleFieldChange = (field: TableField, value: any) => {
    setFormData({
      ...formData,
      [field.name]: formatValue(field, value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting form data:', formData);

      const response = await fetch(`/api/tables/${tableId}/records`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Failed to create record');
      }

      toast({
        title: "Success",
        description: data.message || "Record created successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create record',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!table) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {table.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.name} className="flex items-center">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField(field, formData[field.name], (value) => handleFieldChange(field, value))}
          {field.description && (
            <p className="text-sm text-gray-500">{field.description}</p>
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Record'}
        </Button>
      </div>
    </form>
  );
}; 