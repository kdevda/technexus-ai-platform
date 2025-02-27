import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { DatabaseTable } from "@/types/database";
import { RecordsList } from "@/components/records/RecordsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateRecordForm } from "@/components/records/CreateRecordForm";

export const OriginateAI = () => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const activeTableData = tables.find(t => t.id === activeTable);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }

        const data = await response.json();
        setTables(data);
        if (data.length > 0) {
          setActiveTable(data[0].id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tables",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTable || ""} onValueChange={setActiveTable}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            {tables.map((table) => (
              <TabsTrigger key={table.id} value={table.id}>
                {table.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {activeTable && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="ml-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                New {activeTableData?.label || 'Record'}
              </Button>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New {activeTableData?.label || 'Record'}</DialogTitle>
                </DialogHeader>
                <CreateRecordForm 
                  tableId={activeTable} 
                  onSuccess={() => {
                    setShowCreateDialog(false);
                    // Refresh the records list
                    const recordsList = document.querySelector(`[data-table-id="${activeTable}"]`);
                    if (recordsList) {
                      (recordsList as any).__records?.refetch();
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {tables.map((table) => (
          <TabsContent key={table.id} value={table.id}>
            <RecordsList tableId={table.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}; 