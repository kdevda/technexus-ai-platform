import { useState } from "react";
import { 
  BarChart2, PieChart, LineChart, Plus, Filter, 
  Download, Share2, MoreVertical, RefreshCcw, Calendar,
  Maximize2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: "dashboard" | "report";
  category: string;
  lastUpdated: string;
  schedule?: string;
  views: number;
  shared: boolean;
  charts: Chart[];
}

interface Chart {
  id: string;
  type: "bar" | "line" | "pie" | "table";
  title: string;
  description: string;
}

const sampleDashboards: Dashboard[] = [
  {
    id: "1",
    name: "Loan Performance Overview",
    description: "Key metrics and trends for loan portfolio",
    type: "dashboard",
    category: "Performance",
    lastUpdated: "2023-12-10T15:30:00",
    views: 1234,
    shared: true,
    charts: [
      {
        id: "1",
        type: "line",
        title: "Monthly Loan Volume",
        description: "Total loan amount approved per month"
      },
      {
        id: "2",
        type: "pie",
        title: "Loan Distribution",
        description: "Distribution by loan type"
      },
      {
        id: "3",
        type: "bar",
        title: "Approval Rate",
        description: "Approval rate by loan officer"
      }
    ]
  },
  {
    id: "2",
    name: "Risk Analysis Report",
    description: "Detailed risk metrics and analysis",
    type: "report",
    category: "Risk",
    lastUpdated: "2023-12-09T14:45:00",
    schedule: "Daily at 9 AM",
    views: 856,
    shared: true,
    charts: [
      {
        id: "1",
        type: "bar",
        title: "Risk Score Distribution",
        description: "Distribution of risk scores"
      },
      {
        id: "2",
        type: "line",
        title: "Default Rate Trends",
        description: "Historical default rates"
      }
    ]
  },
  {
    id: "3",
    name: "Operational Efficiency",
    description: "Processing times and efficiency metrics",
    type: "dashboard",
    category: "Operations",
    lastUpdated: "2023-12-08T10:15:00",
    views: 567,
    shared: false,
    charts: [
      {
        id: "1",
        type: "line",
        title: "Processing Time",
        description: "Average application processing time"
      }
    ]
  }
];

export const DataAnalytics = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>(sampleDashboards);

  const getChartIcon = (type: Chart["type"]) => {
    switch (type) {
      case "bar":
        return BarChart2;
      case "line":
        return LineChart;
      case "pie":
        return PieChart;
      default:
        return BarChart2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      </div>

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{dashboard.name}</h3>
                  <Badge variant={dashboard.type === "dashboard" ? "default" : "secondary"}>
                    {dashboard.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Open Full Screen
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Charts Preview */}
            <div className="space-y-2 mb-4">
              {dashboard.charts.map((chart) => {
                const ChartIcon = getChartIcon(chart.type);
                return (
                  <div key={chart.id} className="flex items-center bg-gray-50 p-2 rounded-lg">
                    <ChartIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{chart.title}</div>
                      <div className="text-xs text-gray-500">{chart.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>
                  Updated {new Date(dashboard.lastUpdated).toLocaleDateString()}
                </span>
                {dashboard.schedule && (
                  <Badge variant="outline" className="text-xs">
                    {dashboard.schedule}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{dashboard.views.toLocaleString()} views</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 