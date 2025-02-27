import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { TableLayout } from "@/types/recordView";
import { useToast } from "@/components/ui/use-toast";

export const RecordView = () => {
  const { tableId, recordId } = useParams();
  const [layout, setLayout] = useState<TableLayout | null>(null);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch layout
        const layoutResponse = await fetch(`/api/tables/${tableId}/layouts/default`);
        const layoutData = await layoutResponse.json();
        setLayout(layoutData);

        // Fetch record data
        const recordResponse = await fetch(`/api/tables/${tableId}/records/${recordId}`);
        const recordData = await recordResponse.json();
        setRecord(recordData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load record",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableId, recordId, toast]);

  if (loading) return <div>Loading...</div>;
  if (!layout || !record) return <div>Not found</div>;

  return (
    <div className="container mx-auto py-6">
      {layout.sections.map((section) => (
        <Card key={section.id} className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          <div className={`grid grid-cols-${section.columns} gap-4`}>
            {section.components.map((component) => (
              <div
                key={component.id}
                className={`col-span-${
                  component.width === 'full' ? section.columns : '1'
                }`}
              >
                {/* Render component based on type */}
                {component.type === 'field' && component.fieldId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {component.title}
                    </label>
                    <div className="mt-1">
                      {record[component.fieldId] || ''}
                    </div>
                  </div>
                )}
                {/* Add other component type renderers */}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}; 