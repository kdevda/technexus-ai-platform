import { useState } from "react";
import { Plus, Settings, Move, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Widget {
  id: string;
  name: string;
  type: string;
  description: string;
  status: "active" | "draft" | "archived";
  lastModified: string;
}

const sampleWidgets: Widget[] = [
  {
    id: "1",
    name: "Application Stats",
    type: "statistics",
    description: "Shows key metrics about loan applications",
    status: "active",
    lastModified: "2023-12-10"
  },
  {
    id: "2",
    name: "Recent Applications",
    type: "table",
    description: "Displays recent loan applications with status",
    status: "active",
    lastModified: "2023-12-09"
  },
  {
    id: "3",
    name: "Approval Rate Chart",
    type: "chart",
    description: "Visualizes loan approval rates over time",
    status: "active",
    lastModified: "2023-12-08"
  },
  {
    id: "4",
    name: "Task List",
    type: "list",
    description: "Shows pending tasks and actions",
    status: "draft",
    lastModified: "2023-12-07"
  }
];

export const WidgetManagement = () => {
  const [widgets, setWidgets] = useState<Widget[]>(sampleWidgets);

  const getStatusColor = (status: Widget["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Widget
        </Button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{widget.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
              </div>
              <Badge className={getStatusColor(widget.status)}>
                {widget.status}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Settings className="h-4 w-4 mr-2" />
              {widget.type}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Last modified: {new Date(widget.lastModified).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Move className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 