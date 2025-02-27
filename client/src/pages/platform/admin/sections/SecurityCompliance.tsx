import { useState } from "react";
import { 
  Shield, Lock, Key, FileCheck, AlertTriangle, 
  RefreshCcw, Settings2, Plus, Eye, EyeOff, Check,
  FileWarning, UserCheck, Network, Database, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface SecurityControl {
  id: string;
  name: string;
  category: "authentication" | "data" | "network" | "compliance" | "monitoring";
  description: string;
  status: "enabled" | "disabled" | "warning" | "required";
  isEnabled: boolean;
  lastUpdated: string;
  riskLevel: "high" | "medium" | "low";
  complianceStandards?: string[];
  configuration?: {
    key: string;
    value: string | number | boolean;
  }[];
}

const sampleControls: SecurityControl[] = [
  {
    id: "1",
    name: "Multi-Factor Authentication",
    category: "authentication",
    description: "Require 2FA for all user accounts",
    status: "enabled",
    isEnabled: true,
    lastUpdated: "2023-12-10T15:30:00",
    riskLevel: "high",
    complianceStandards: ["SOC2", "ISO27001"],
    configuration: [
      { key: "enforceForAllUsers", value: true },
      { key: "allowedMethods", value: "app,sms,email" }
    ]
  },
  {
    id: "2",
    name: "Data Encryption at Rest",
    category: "data",
    description: "AES-256 encryption for stored data",
    status: "enabled",
    isEnabled: true,
    lastUpdated: "2023-12-09T14:45:00",
    riskLevel: "high",
    complianceStandards: ["GDPR", "CCPA", "SOC2"],
    configuration: [
      { key: "algorithm", value: "AES-256" },
      { key: "keyRotationDays", value: 90 }
    ]
  },
  {
    id: "3",
    name: "IP Whitelisting",
    category: "network",
    description: "Restrict access to specific IP ranges",
    status: "enabled",
    isEnabled: true,
    lastUpdated: "2023-12-08T10:15:00",
    riskLevel: "medium",
    configuration: [
      { key: "allowedIPs", value: "10.0.0.0/24,192.168.1.0/24" }
    ]
  },
  {
    id: "4",
    name: "Session Management",
    category: "authentication",
    description: "Control user session duration and concurrent logins",
    status: "warning",
    isEnabled: true,
    lastUpdated: "2023-12-07T09:30:00",
    riskLevel: "medium",
    configuration: [
      { key: "sessionTimeout", value: 3600 },
      { key: "maxConcurrentSessions", value: 1 }
    ]
  },
  {
    id: "5",
    name: "Audit Logging",
    category: "monitoring",
    description: "Comprehensive logging of security events",
    status: "enabled",
    isEnabled: true,
    lastUpdated: "2023-12-06T16:20:00",
    riskLevel: "medium",
    complianceStandards: ["SOC2", "ISO27001", "HIPAA"],
    configuration: [
      { key: "retentionDays", value: 365 },
      { key: "includeUserActions", value: true }
    ]
  }
];

export const SecurityCompliance = () => {
  const [controls, setControls] = useState<SecurityControl[]>(sampleControls);

  const getCategoryIcon = (category: SecurityControl["category"]) => {
    switch (category) {
      case "authentication":
        return UserCheck;
      case "data":
        return Database;
      case "network":
        return Network;
      case "compliance":
        return FileCheck;
      case "monitoring":
        return History;
      default:
        return Shield;
    }
  };

  const getRiskLevelColor = (level: SecurityControl["riskLevel"]) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: SecurityControl["status"]) => {
    switch (status) {
      case "enabled":
        return "bg-green-100 text-green-800";
      case "disabled":
        return "bg-gray-100 text-gray-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "required":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleControl = (controlId: string) => {
    setControls(controls.map(control => 
      control.id === controlId 
        ? { ...control, isEnabled: !control.isEnabled }
        : control
    ));
  };

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-50">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Security Score</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-green-600">Good Standing</div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Compliance Status</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600">3/3</div>
            <div className="text-sm text-blue-600">Standards Met</div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Active Alerts</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <div className="text-sm text-yellow-600">Require Attention</div>
          </div>
        </Card>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {controls.map((control) => {
          const CategoryIcon = getCategoryIcon(control.category);
          
          return (
            <Card key={control.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CategoryIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{control.name}</h3>
                      <Badge className={getStatusColor(control.status)}>
                        {control.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {control.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={control.isEnabled}
                  onCheckedChange={() => toggleControl(control.id)}
                />
              </div>

              {/* Control Details */}
              <div className="mt-4 space-y-3">
                {/* Compliance Standards */}
                {control.complianceStandards && (
                  <div className="flex flex-wrap gap-2">
                    {control.complianceStandards.map((standard) => (
                      <Badge key={standard} variant="outline">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Risk Level */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Risk Level</span>
                  </div>
                  <Badge className={getRiskLevelColor(control.riskLevel)}>
                    {control.riskLevel}
                  </Badge>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Last Updated</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(control.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 