import { useState } from "react";
import { 
  Plus, Play, Pause, Settings2, ArrowRight, Clock, 
  AlertCircle, CheckCircle2, XCircle, MoreVertical 
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

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: "active" | "paused" | "draft";
  lastRun: string;
  executionCount: number;
  successRate: number;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action";
  name: string;
  description: string;
}

const sampleWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Loan Application Processing",
    description: "Automatically process new loan applications",
    trigger: "New Application Submitted",
    status: "active",
    lastRun: "2023-12-10T15:30:00",
    executionCount: 1234,
    successRate: 98.5,
    steps: [
      {
        id: "1",
        type: "trigger",
        name: "Application Submitted",
        description: "When a new application is submitted"
      },
      {
        id: "2",
        type: "condition",
        name: "Credit Score Check",
        description: "Check if credit score meets minimum requirements"
      },
      {
        id: "3",
        type: "action",
        name: "Assign Underwriter",
        description: "Route application to available underwriter"
      }
    ]
  },
  {
    id: "2",
    name: "Document Verification",
    description: "Verify submitted documents automatically",
    trigger: "Document Upload",
    status: "active",
    lastRun: "2023-12-10T14:45:00",
    executionCount: 856,
    successRate: 95.2,
    steps: [
      {
        id: "1",
        type: "trigger",
        name: "Document Uploaded",
        description: "When documents are uploaded"
      },
      {
        id: "2",
        type: "action",
        name: "OCR Processing",
        description: "Extract information from documents"
      }
    ]
  },
  {
    id: "3",
    name: "Risk Assessment",
    description: "Automated risk scoring workflow",
    trigger: "Daily Schedule",
    status: "paused",
    lastRun: "2023-12-09T10:15:00",
    executionCount: 452,
    successRate: 92.8,
    steps: [
      {
        id: "1",
        type: "trigger",
        name: "Schedule",
        description: "Run daily at 9 AM"
      },
      {
        id: "2",
        type: "action",
        name: "Data Collection",
        description: "Gather applicant data"
      }
    ]
  }
];

export const AdvancedAutomation = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows);

  const getStatusColor = (status: Workflow["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStepIcon = (type: WorkflowStep["type"]) => {
    switch (type) {
      case "trigger":
        return Play;
      case "condition":
        return AlertCircle;
      case "action":
        return Settings2;
      default:
        return Settings2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{workflow.name}</h3>
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Workflow</DropdownMenuItem>
                  <DropdownMenuItem>View History</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Delete Workflow
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Workflow Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last Run
                </div>
                <div className="mt-1 font-medium">
                  {new Date(workflow.lastRun).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  Executions
                </div>
                <div className="mt-1 font-medium">
                  {workflow.executionCount.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Success Rate
                </div>
                <div className="mt-1 font-medium">
                  {workflow.successRate}%
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Workflow Steps</div>
              <div className="space-y-2">
                {workflow.steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  return (
                    <div key={step.id} className="flex items-center">
                      {index > 0 && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 flex items-center bg-gray-50 p-2 rounded-lg">
                        <StepIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">{step.name}</div>
                          <div className="text-xs text-gray-500">{step.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 