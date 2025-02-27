import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Field {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  description: string;
  defaultValue: string | null;
  validation: string | null;
}

interface Table {
  id: string;
  name: string;
  label: string;
  description: string;
  fields: Field[];
  createdAt: string;
  updatedAt: string;
}

// Add this after your imports
const DEBUG = true;

// Add this component
const DebugPanel = ({ data }: { data: any }) => {
  if (!DEBUG) return null;
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg max-w-lg max-h-96 overflow-auto">
      <h3 className="font-mono text-sm mb-2">Debug Info:</h3>
      <pre className="text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default function TablesAndFields() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  // Move fetchTables outside useEffect
  const fetchTables = async () => {
    try {
      setLoading(true);
      console.log('Fetching tables...');
      
      const response = await axios.get<Table[]>('/api/tables');

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (Array.isArray(response.data)) {
        console.log('Received tables:', response.data.length);
        setTables(response.data);
        setError(null);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || err.message;
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: errorMessage
        });
        setError(`Failed to fetch tables: ${errorMessage}`);
      } else {
        setError('Failed to fetch tables');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use fetchTables in useEffect
  useEffect(() => {
    fetchTables();
  }, []);

  // Now handleManualFetch can access fetchTables
  const handleManualFetch = () => {
    console.log('Manual fetch triggered');
    setLastFetch(new Date().toISOString());
    fetchTables();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-lg">Loading tables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tables.length) {
    return (
      <div className="p-4">
        <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
          No tables found. Create your first table to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tables and Fields</h1>
        <button
          onClick={handleManualFetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Tables
        </button>
      </div>
      <div className="space-y-6">
        {tables.map(table => (
          <div key={table.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold">{table.label}</h2>
            <p className="text-gray-600">{table.description}</p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Fields:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {table.fields.map(field => (
                  <div key={field.id} className="border p-3 rounded-md bg-gray-50">
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-gray-600">
                      Type: {field.type}
                      {field.required && ' • Required'}
                      {field.unique && ' • Unique'}
                    </div>
                    {field.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {field.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <DebugPanel data={{
        API_URL: '/api',
        loading,
        error,
        tableCount: tables.length,
        tables: tables.map(t => ({
          id: t.id,
          name: t.name,
          fieldCount: t.fields.length
        }))
      }} />
    </div>
  );
} 