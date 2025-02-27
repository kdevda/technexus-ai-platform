import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Users, 
  ShieldAlert, 
  Wallet, 
  BarChart, 
  FileStack 
} from "lucide-react"

const modules = [
  {
    id: 'originate',
    name: 'OriginateAI',
    icon: FileText,
    path: '/platform/originate',
    description: 'Loan Origination System'
  },
  {
    id: 'relation',
    name: 'RelationAI',
    icon: Users,
    path: '/platform/relation',
    description: 'Customer Relationship Management'
  },
  {
    id: 'risk',
    name: 'RiskAI',
    icon: ShieldAlert,
    path: '/platform/risk',
    description: 'Risk Assessment System'
  },
  {
    id: 'service',
    name: 'ServiceAI',
    icon: Wallet,
    path: '/platform/service',
    description: 'Loan Servicing Platform'
  },
  {
    id: 'analytics',
    name: 'AnalyticsAI',
    icon: BarChart,
    path: '/platform/analytics',
    description: 'Analytics & Reporting'
  },
  {
    id: 'doc',
    name: 'DocAI',
    icon: FileStack,
    path: '/platform/doc',
    description: 'Document Management'
  }
]

export const ModuleSelector = ({ onModuleChange }: { onModuleChange: (path: string) => void }) => {
  return (
    <Select onValueChange={onModuleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Module" />
      </SelectTrigger>
      <SelectContent>
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <SelectItem key={module.id} value={module.path}>
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{module.name}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
} 