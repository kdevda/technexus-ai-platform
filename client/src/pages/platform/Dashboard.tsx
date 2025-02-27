import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModuleSelector } from "@/components/dashboard/ModuleSelector"
import { UserMenu } from "@/components/dashboard/UserMenu"
import {
  FileText,
  Users,
  DollarSign,
  BarChart2,
  Clock,
  AlertCircle
} from "lucide-react"

export const Dashboard = () => {
  const navigate = useNavigate()
  
  const stats = [
    {
      title: "Active Applications",
      value: "23",
      change: "+15%",
      icon: FileText
    },
    {
      title: "New Leads",
      value: "45",
      change: "+32%",
      icon: Users
    },
    {
      title: "Pending Approvals",
      value: "12",
      icon: Clock
    },
    {
      title: "Revenue MTD",
      value: "$125K",
      change: "+8%",
      icon: DollarSign
    }
  ]

  const tasks = [
    {
      title: "Review Application #1234",
      priority: "High",
      due: "Today"
    },
    {
      title: "Follow up with John Doe",
      priority: "Medium",
      due: "Tomorrow"
    },
    {
      title: "Update risk assessment",
      priority: "Low",
      due: "Next Week"
    }
  ]

  const quickActions = [
    {
      title: "New Application",
      icon: FileText,
      action: () => navigate("/platform/loan/apply")
    },
    {
      title: "Add Lead",
      icon: Users,
      action: () => navigate("/platform/leads/new")
    },
    {
      title: "View Reports",
      icon: BarChart2,
      action: () => navigate("/platform/reports")
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    )}
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={action.action}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.title}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Tasks</h2>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-4 w-4 ${
                      task.priority === 'High' ? 'text-red-500' :
                      task.priority === 'Medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <span>{task.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{task.due}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
} 