import { useState } from "react";
import { 
  History, Filter, Search, Download, 
  User, Calendar, ArrowUpDown, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  action: string;
  component: string;
  user: {
    name: string;
    email: string;
  };
  timestamp: string;
  details: string;
  version?: string;
  changeType: "create" | "update" | "delete" | "view";
}

const sampleLogs: AuditLog[] = [
  {
    id: "1",
    action: "Updated Workflow",
    component: "Advanced Automation",
    user: {
      name: "John Smith",
      email: "john.smith@technexus.com"
    },
    timestamp: "2023-12-10T15:30:00",
    details: "Modified credit score threshold in loan approval workflow",
    version: "1.2.0",
    changeType: "update"
  },
  {
    id: "2",
    action: "Created New Role",
    component: "Role Management",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@technexus.com"
    },
    timestamp: "2023-12-10T14:45:00",
    details: "Added Senior Underwriter role with custom permissions",
    version: "1.0.0",
    changeType: "create"
  },
  {
    id: "3",
    action: "Deleted Field",
    component: "Tables and Fields",
    user: {
      name: "Michael Chen",
      email: "m.chen@technexus.com"
    },
    timestamp: "2023-12-10T13:15:00",
    details: "Removed deprecated field 'oldStatus' from Applications table",
    version: "2.1.0",
    changeType: "delete"
  }
];

export const AuditTrails = () => {
  const [logs, setLogs] = useState<AuditLog[]>(sampleLogs);
  const [searchTerm, setSearchTerm] = useState("");

  const getChangeTypeColor = (type: AuditLog["changeType"]) => {
    switch (type) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "view":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search audit logs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Audit Logs */}
      <Card>
        <div className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{log.action}</h3>
                    <Badge className={getChangeTypeColor(log.changeType)}>
                      {log.changeType}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{log.details}</p>
                </div>
                {log.version && (
                  <Badge variant="outline">Version {log.version}</Badge>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {log.user.name}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {log.component}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}; 