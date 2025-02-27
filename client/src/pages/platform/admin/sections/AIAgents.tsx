import { useState } from "react";
import { 
  Bot, Brain, Zap, Settings2, Play, Pause, 
  BarChart2, RefreshCcw, Plus, History, 
  MessageSquare, FileText, Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: "assistant" | "analyzer" | "processor" | "validator";
  status: "active" | "training" | "idle" | "error";
  isEnabled: boolean;
  model: string;
  version: string;
  performance: {
    accuracy: number;
    latency: number;
    uptime: number;
  };
  lastTrained: string;
  taskCount: number;
}

const sampleAgents: AIAgent[] = [
  {
    id: "1",
    name: "Loan Application Assistant",
    description: "Guides users through loan application process",
    type: "assistant",
    status: "active",
    isEnabled: true,
    model: "GPT-4",
    version: "2.1.0",
    performance: {
      accuracy: 98.5,
      latency: 150,
      uptime: 99.9
    },
    lastTrained: "2023-12-10T15:30:00",
    taskCount: 1234
  },
  {
    id: "2",
    name: "Risk Assessment Analyzer",
    description: "Analyzes credit risk and loan viability",
    type: "analyzer",
    status: "active",
    isEnabled: true,
    model: "Custom ML",
    version: "3.0.1",
    performance: {
      accuracy: 99.2,
      latency: 200,
      uptime: 99.8
    },
    lastTrained: "2023-12-09T10:00:00",
    taskCount: 5678
  },
  {
    id: "3",
    name: "Document Processor",
    description: "Extracts and validates document information",
    type: "processor",
    status: "active",
    isEnabled: true,
    model: "DocumentAI",
    version: "1.5.0",
    performance: {
      accuracy: 97.8,
      latency: 300,
      uptime: 99.7
    },
    lastTrained: "2023-12-08T14:20:00",
    taskCount: 3456
  },
  {
    id: "4",
    name: "Compliance Validator",
    description: "Ensures compliance with regulations",
    type: "validator",
    status: "training",
    isEnabled: true,
    model: "RuleEngine",
    version: "2.0.0",
    performance: {
      accuracy: 99.9,
      latency: 100,
      uptime: 99.9
    },
    lastTrained: "2023-12-07T09:15:00",
    taskCount: 2345
  }
];

export const AIAgents = () => {
  const [agents, setAgents] = useState<AIAgent[]>(sampleAgents);

  const getTypeIcon = (type: AIAgent["type"]) => {
    switch (type) {
      case "assistant":
        return MessageSquare;
      case "analyzer":
        return Calculator;
      case "processor":
        return FileText;
      case "validator":
        return Bot;
      default:
        return Brain;
    }
  };

  const getStatusColor = (status: AIAgent["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-blue-100 text-blue-800";
      case "idle":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, isEnabled: !agent.isEnabled }
        : agent
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const TypeIcon = getTypeIcon(agent.type);
          
          return (
            <Card key={agent.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TypeIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={agent.isEnabled}
                  onCheckedChange={() => toggleAgent(agent.id)}
                />
              </div>

              {/* Agent Info */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    v{agent.version}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Accuracy</span>
                    <span className="font-medium">{agent.performance.accuracy}%</span>
                  </div>
                  <Progress value={agent.performance.accuracy} className="h-1" />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Latency</span>
                      <div className="font-medium">{agent.performance.latency}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Uptime</span>
                      <div className="font-medium">{agent.performance.uptime}%</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    {new Date(agent.lastTrained).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    {agent.taskCount.toLocaleString()} tasks
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t flex justify-between">
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Retrain
                </Button>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 