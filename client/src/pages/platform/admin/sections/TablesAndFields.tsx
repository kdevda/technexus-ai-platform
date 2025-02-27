import { useState, useEffect } from "react";
import { 
  Database, Table, Plus, Settings2, Search,
  Columns, ArrowLeft, Edit, Trash2, Eye,
  Save, X, AlertCircle, Type, Hash, CheckSquare, Calendar, DollarSign, List, FunctionSquare,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from '@/config/api';

interface TableField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
  description?: string;
  validation?: string;
}

interface DatabaseTable {
  id: string;
  name: string;
  label: string;
  description: string;
  fields: TableField[];
  createdAt: string;
  updatedAt: string;
}

const sampleTables: DatabaseTable[] = [
  {
    id: "1",
    name: "users",
    label: "Users",
    description: "User account information",
    fields: [
      {
        id: "1",
        name: "id",
        label: "ID",
        type: "uuid",
        required: true,
        unique: true,
        description: "Primary key"
      },
      {
        id: "2",
        name: "email",
        label: "Email Address",
        type: "string",
        required: true,
        unique: true,
        validation: "email"
      },
      {
        id: "3",
        name: "password",
        label: "Password",
        type: "string",
        required: true,
        unique: false,
        description: "Hashed password"
      }
    ],
    createdAt: "2023-12-01T10:00:00",
    updatedAt: "2023-12-10T15:30:00"
  },
  {
    id: "2",
    name: "loan_applications",
    label: "Loan Applications",
    description: "Loan application records",
    fields: [
      {
        id: "1",
        name: "id",
        label: "ID",
        type: "uuid",
        required: true,
        unique: true,
        description: "Primary key"
      },
      {
        id: "2",
        name: "user_id",
        label: "User",
        type: "uuid",
        required: true,
        unique: false,
        description: "Reference to users table"
      },
      {
        id: "3",
        name: "amount",
        label: "Loan Amount",
        type: "decimal",
        required: true,
        unique: false,
        description: "Loan amount requested"
      }
    ],
    createdAt: "2023-12-02T11:00:00",
    updatedAt: "2023-12-09T14:20:00"
  }
];

interface FieldType {
  value: string;
  label: string;
  icon: LucideIcon;
  requiresExtra: boolean;
  extraFields?: {
    lookup?: boolean;
    options?: boolean;
    formula?: boolean;
    currency?: boolean;
    precision?: boolean;
    timezone?: boolean;
    startingNumber?: boolean;
    prefix?: boolean;
    suffix?: boolean;
    padding?: boolean;
  };
}

const fieldTypes: FieldType[] = [
  { value: "string", label: "Text", icon: Type, requiresExtra: false },
  { value: "number", label: "Number", icon: Hash, requiresExtra: false },
  { value: "boolean", label: "Checkbox", icon: CheckSquare, requiresExtra: false },
  { 
    value: "datetime", 
    label: "Date & Time", 
    icon: Calendar, 
    requiresExtra: true,
    extraFields: { timezone: true }
  },
  { 
    value: "currency", 
    label: "Currency", 
    icon: DollarSign, 
    requiresExtra: true,
    extraFields: { currency: true, precision: true }
  },
  { 
    value: "lookup", 
    label: "Lookup", 
    icon: Search, 
    requiresExtra: true,
    extraFields: { lookup: true }
  },
  { 
    value: "select", 
    label: "Dropdown", 
    icon: List, 
    requiresExtra: true,
    extraFields: { options: true }
  },
  { 
    value: "formula", 
    label: "Formula", 
    icon: FunctionSquare, 
    requiresExtra: true,
    extraFields: { formula: true }
  },
  { 
    value: "auto_number", 
    label: "Auto Number", 
    icon: Hash, 
    requiresExtra: true,
    extraFields: { 
      startingNumber: true,
      prefix: true,
      suffix: true,
      padding: true 
    }
  },
];

interface NewFieldData {
  label: string;
  apiName: string;
  type: string;
  required: boolean;
  unique: boolean;
  description: string;
  defaultValue?: string;
  validation?: string;
  lookupTable?: string;
  lookupField?: string;
  currencyCode?: string;
  precision?: number;
  options?: string[];
  formula?: string;
  timezone?: string;
  startingNumber?: string;
  prefix?: string;
  suffix?: string;
  padding?: string;
}

interface NewTableData {
  label: string;
  apiName: string;
  description: string;
}

export const TablesAndFields = () => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTableDialog, setShowNewTableDialog] = useState(false);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [newTableData, setNewTableData] = useState<NewTableData>({
    label: "",
    apiName: "",
    description: ""
  });
  const [newFieldData, setNewFieldData] = useState<NewFieldData>({
    label: "",
    apiName: "",
    type: "string",
    required: false,
    unique: false,
    description: "",
    defaultValue: "",
    validation: ""
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const handleTableLabelChange = (label: string) => {
    const apiName = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    setNewTableData({
      ...newTableData,
      label,
      apiName
    });
  };

  const checkServerConnection = async () => {
    try {
      console.log('Checking server connection...');
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Server response:', response.status);
      if (!response.ok) {
        console.error('Server returned error status:', response.status);
        return false;
      }

      const data = await response.json();
      console.log('Server health check response:', data);
      return data.status === 'ok';
    } catch (error) {
      console.error('Server connection check failed:', error);
      return false;
    }
  };

  const handleCreateTable = async () => {
    try {
      const isServerConnected = await checkServerConnection();
      if (!isServerConnected) {
        throw new Error('Cannot connect to server. Please ensure the server is running.');
      }

      console.log('Sending request with data:', {
        name: newTableData.apiName,
        displayName: newTableData.label,
        description: newTableData.description
      });

      const response = await fetch('http://localhost:3001/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newTableData.apiName,
          displayName: newTableData.label,
          description: newTableData.description
        })
      });

      // First check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response was not JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create table');
      }

      // Update local state
      const newTable: DatabaseTable = {
        id: data.id,
        name: newTableData.apiName,
        label: newTableData.label,
        description: newTableData.description,
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTables([...tables, newTable]);
      setNewTableData({ label: "", apiName: "", description: "" });
      setShowNewTableDialog(false);
    } catch (error: unknown) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        alert(`Error creating table: ${error.message}`);
      } else {
        alert('An unknown error occurred while creating the table');
      }
    }
  };

  const handleCreateField = async () => {
    if (!selectedTable) return;

    try {
      // Create field in database
      const response = await fetch(`/api/tables/${selectedTable.id}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFieldData.apiName,
          displayName: newFieldData.label,
          type: newFieldData.type,
          required: newFieldData.required,
          unique: newFieldData.unique,
          description: newFieldData.description,
          defaultValue: newFieldData.defaultValue,
          validation: newFieldData.validation,
          // Add extra fields based on type
          ...(newFieldData.lookupTable && {
            lookup: {
              tableId: newFieldData.lookupTable,
              fieldId: newFieldData.lookupField
            }
          }),
          ...(newFieldData.currencyCode && {
            currency: {
              code: newFieldData.currencyCode,
              precision: newFieldData.precision
            }
          }),
          ...(newFieldData.options && {
            options: newFieldData.options
          }),
          ...(newFieldData.formula && {
            formula: newFieldData.formula
          }),
          ...(newFieldData.timezone && {
            timezone: newFieldData.timezone
          }),
          ...(newFieldData.startingNumber && {
            startingNumber: newFieldData.startingNumber
          }),
          ...(newFieldData.prefix && {
            prefix: newFieldData.prefix
          }),
          ...(newFieldData.suffix && {
            suffix: newFieldData.suffix
          }),
          ...(newFieldData.padding && {
            padding: newFieldData.padding
          })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create field');
      }

      const createdField = await response.json();

      // Update local state
      const newField: TableField = {
        id: createdField.id,
        name: newFieldData.apiName,
        label: newFieldData.label,
        type: newFieldData.type,
        required: newFieldData.required,
        unique: newFieldData.unique,
        description: newFieldData.description,
        defaultValue: newFieldData.defaultValue,
        validation: newFieldData.validation
      };

      const updatedTable = {
        ...selectedTable,
        fields: [...selectedTable.fields, newField],
        updatedAt: new Date().toISOString()
      };

      setTables(tables.map(table => 
        table.id === selectedTable.id ? updatedTable : table
      ));
      setSelectedTable(updatedTable);
      setNewFieldData({
        label: "",
        apiName: "",
        type: "string",
        required: false,
        unique: false,
        description: "",
        defaultValue: "",
        validation: ""
      });
      setShowNewFieldDialog(false);
    } catch (error) {
      console.error('Error creating field:', error);
      // Add error handling/notification here
    }
  };

  const handleLabelChange = (label: string) => {
    // Convert label to API name (snake_case)
    const apiName = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    setNewFieldData({
      ...newFieldData,
      label,
      apiName
    });
  };

  const renderExtraFields = () => {
    const selectedType = fieldTypes.find(type => type.value === newFieldData.type);
    if (!selectedType?.requiresExtra) return null;

    return (
      <>
        {selectedType.extraFields?.lookup && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lookup Table</label>
              <Select
                value={newFieldData.lookupTable}
                onValueChange={(value) => setNewFieldData({
                  ...newFieldData,
                  lookupTable: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newFieldData.lookupTable && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Lookup Field</label>
                <Select
                  value={newFieldData.lookupField}
                  onValueChange={(value) => setNewFieldData({
                    ...newFieldData,
                    lookupField: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .find(t => t.id === newFieldData.lookupTable)
                      ?.fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {selectedType.extraFields?.currency && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency Code</label>
              <Select
                value={newFieldData.currencyCode}
                onValueChange={(value) => setNewFieldData({
                  ...newFieldData,
                  currencyCode: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  {/* Add more currencies as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Decimal Precision</label>
              <Input
                type="number"
                min="0"
                max="4"
                value={newFieldData.precision}
                onChange={(e) => setNewFieldData({
                  ...newFieldData,
                  precision: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
        )}

        {selectedType.extraFields?.options && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Options (one per line)</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              value={newFieldData.options?.join('\n') || ''}
              onChange={(e) => setNewFieldData({
                ...newFieldData,
                options: e.target.value.split('\n').filter(opt => opt.trim())
              })}
            />
          </div>
        )}

        {selectedType.extraFields?.formula && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Formula</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md font-mono"
              value={newFieldData.formula}
              onChange={(e) => setNewFieldData({
                ...newFieldData,
                formula: e.target.value
              })}
              placeholder="Enter formula expression..."
            />
          </div>
        )}

        {selectedType.extraFields?.timezone && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Select
              value={newFieldData.timezone}
              onValueChange={(value) => setNewFieldData({
                ...newFieldData,
                timezone: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="local">Browser Local</SelectItem>
                {/* Add more timezone options */}
              </SelectContent>
            </Select>
          </div>
        )}

        {newFieldData.type === 'auto_number' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Starting Number</label>
              <Input
                type="number"
                placeholder="1"
                value={newFieldData.startingNumber}
                onChange={(e) => setNewFieldData({
                  ...newFieldData,
                  startingNumber: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prefix</label>
              <Input
                placeholder="PRE-"
                value={newFieldData.prefix}
                onChange={(e) => setNewFieldData({
                  ...newFieldData,
                  prefix: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Suffix</label>
              <Input
                placeholder="-SUFF"
                value={newFieldData.suffix}
                onChange={(e) => setNewFieldData({
                  ...newFieldData,
                  suffix: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Padding Length</label>
              <Input
                type="number"
                placeholder="5"
                value={newFieldData.padding}
                onChange={(e) => setNewFieldData({
                  ...newFieldData,
                  padding: e.target.value
                })}
              />
              <p className="text-xs text-gray-500">
                Example: Padding 5 with prefix "INV-" starting at 1 will generate: INV-00001
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!selectedTable ? (
        <>
          {/* Tables List View */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Database Tables</h2>
            </div>
            <Dialog open={showNewTableDialog} onOpenChange={setShowNewTableDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Table Label</label>
                    <Input
                      placeholder="Enter table label"
                      value={newTableData.label}
                      onChange={(e) => handleTableLabelChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Name</label>
                    <Input
                      placeholder="table_name"
                      value={newTableData.apiName}
                      onChange={(e) => setNewTableData({
                        ...newTableData,
                        apiName: e.target.value
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      This will be used as the database table name
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Enter table description"
                      value={newTableData.description}
                      onChange={(e) => setNewTableData({
                        ...newTableData,
                        description: e.target.value
                      })}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateTable}
                    disabled={!newTableData.label || !newTableData.apiName}
                  >
                    Create Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tables..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => (
              <Card 
                key={table.id} 
                className="p-4 cursor-pointer hover:border-blue-500"
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{table.name}</h3>
                    <p className="text-sm text-gray-500">{table.description}</p>
                  </div>
                  <Badge>{table.fields.length} fields</Badge>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Last updated: {new Date(table.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Table Detail View */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedTable(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tables
                </Button>
                <h2 className="text-lg font-semibold">{selectedTable.name}</h2>
              </div>
              <Dialog open={showNewFieldDialog} onOpenChange={setShowNewFieldDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Field
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Field</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field Label</label>
                      <Input
                        placeholder="Enter field label"
                        value={newFieldData.label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Name</label>
                      <Input
                        placeholder="api_field_name"
                        value={newFieldData.apiName}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          apiName: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={newFieldData.type}
                        onValueChange={(value) => setNewFieldData({
                          ...newFieldData,
                          type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <type.icon className="h-4 w-4 mr-2" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {renderExtraFields()}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newFieldData.required}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          required: e.target.checked
                        })}
                      />
                      <label htmlFor="required">Required</label>
                      <input
                        type="checkbox"
                        id="unique"
                        checked={newFieldData.unique}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          unique: e.target.checked
                        })}
                      />
                      <label htmlFor="unique">Unique</label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Enter field description"
                        value={newFieldData.description}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          description: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Value</label>
                      <Input
                        placeholder="Enter default value"
                        value={newFieldData.defaultValue}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          defaultValue: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Validation</label>
                      <Input
                        placeholder="Enter validation rules"
                        value={newFieldData.validation}
                        onChange={(e) => setNewFieldData({
                          ...newFieldData,
                          validation: e.target.value
                        })}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCreateField}
                      disabled={!newFieldData.label}
                    >
                      Add Field
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p>{selectedTable.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Fields</h3>
                  <div className="space-y-2">
                    {selectedTable.fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{field.name}</span>
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && (
                              <Badge className="bg-red-100 text-red-800">Required</Badge>
                            )}
                            {field.unique && (
                              <Badge className="bg-purple-100 text-purple-800">Unique</Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}; 