import { useState } from "react";
import { 
  Plus, Search, Filter, MoreVertical, Mail, Phone, 
  Shield, Calendar, MapPin, Building 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  avatar?: string;
}

const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@technexus.com",
    phone: "+1 (555) 123-4567",
    role: "Loan Officer",
    department: "Sales",
    location: "New York",
    status: "active",
    lastActive: "2023-12-10T15:30:00",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@technexus.com",
    phone: "+1 (555) 234-5678",
    role: "Underwriter",
    department: "Risk",
    location: "Chicago",
    status: "active",
    lastActive: "2023-12-10T14:45:00",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@technexus.com",
    phone: "+1 (555) 345-6789",
    role: "Administrator",
    department: "IT",
    location: "San Francisco",
    status: "active",
    lastActive: "2023-12-10T16:15:00",
  },
];

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <div className="divide-y">
          {users
            .filter(
              (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <h3 className="text-sm font-semibold">{user.name}</h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="flex items-start space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{user.role}</span>
                      </div>
                      <div className="mt-1 space-y-1 text-sm text-gray-500">
                        <div className="flex items-center justify-end">
                          <Building className="h-4 w-4 mr-1" />
                          {user.department}
                        </div>
                        <div className="flex items-center justify-end">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last active: {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}; 