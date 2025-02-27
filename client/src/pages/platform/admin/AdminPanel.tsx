import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings, Database, Users, UserCog, Layout, Workflow, History, 
  Route, BarChart2, MessageSquare, Phone, Shield, Plug, Palette, 
  Bot, Globe, Target, LayoutGrid, BookOpen, Grid, Settings2, Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TablesAndFields } from "./sections/TablesAndFields";
import { RecordViewManagement } from "./sections/RecordViewManagement";
import { RoleManagement } from "./sections/RoleManagement";
import { UserManagement } from "./sections/UserManagement";
import { WidgetManagement } from "./sections/WidgetManagement";
import { AdvancedAutomation } from "./sections/AdvancedAutomation";
import { AuditTrails } from "./sections/AuditTrails";
import { DataAnalytics } from "./sections/DataAnalytics";
import { CollaborationTools } from "./sections/CollaborationTools";
import { OmniChannel } from "./sections/OmniChannel";
import { SecurityCompliance } from "./sections/SecurityCompliance";
import { IntegrationEcosystem } from "./sections/IntegrationEcosystem";
import { Personalization } from "./sections/Personalization";
import { AIAgents } from "./sections/AIAgents";
import { Localization } from "./sections/Localization";
import { Gamification } from "./sections/Gamification";
import { Portals } from "./sections/Portals";
import { Training } from "./sections/Training";
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';

interface AdminSection {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const sections: AdminSection[] = [
  {
    id: "tables",
    label: "Tables & Fields",
    icon: Database,
    component: TablesAndFields
  },
  {
    id: "record_views",
    label: "Record View Management",
    icon: Layout,
    component: RecordViewManagement
  },
  {
    id: "role-management",
    label: "Role Management",
    icon: UserCog,
    component: RoleManagement
  },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    component: UserManagement
  },
  {
    id: "widget-management",
    label: "Widget Management",
    icon: LayoutGrid,
    component: WidgetManagement
  },
  {
    id: "advanced-automation",
    label: "Advanced Automation",
    icon: Workflow,
    component: AdvancedAutomation
  },
  {
    id: "audit-trails",
    label: "Audit Trails & Version Control",
    icon: History,
    component: AuditTrails
  },
  {
    id: "analytics-reporting",
    label: "Data Analytics and Reporting",
    icon: BarChart2,
    component: DataAnalytics
  },
  {
    id: "collaboration",
    label: "Collaboration Tools",
    icon: MessageSquare,
    component: CollaborationTools
  },
  {
    id: "omni-channel",
    label: "Omni-Channel",
    icon: Phone,
    component: OmniChannel
  },
  {
    id: "security",
    label: "Enhanced Security and Compliance",
    icon: Shield,
    component: SecurityCompliance
  },
  {
    id: "integrations",
    label: "Integration Ecosystem",
    icon: Plug,
    component: IntegrationEcosystem
  },
  {
    id: "personalization",
    label: "Personalization",
    icon: Palette,
    component: Personalization
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    icon: Bot,
    component: AIAgents
  },
  {
    id: "localization",
    label: "Multi-Language and Localization",
    icon: Globe,
    component: Localization
  },
  {
    id: "gamification",
    label: "Gamification",
    icon: Target,
    component: Gamification
  },
  {
    id: "portals",
    label: "Portals",
    icon: LayoutGrid,
    component: Portals
  },
  {
    id: "training",
    label: "Training and Help Resources",
    icon: BookOpen,
    component: Training
  }
];

export const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("tables");
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || TablesAndFields;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center text-left space-x-2 p-2 rounded ${
                activeSection === section.id 
                  ? "bg-blue-50 text-blue-600" 
                  : "hover:bg-gray-100"
              }`}
            >
              <section.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm truncate">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}; 