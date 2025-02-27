import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
}

const sampleRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    description: "Full system access and control",
    users: 5,
    permissions: ["all"]
  },
  {
    id: "2",
    name: "Loan Officer",
    description: "Manage loan applications and customer data",
    users: 12,
    permissions: ["read:applications", "write:applications", "read:customers"]
  },
  {
    id: "3",
    name: "Underwriter",
    description: "Review and approve loan applications",
    users: 8,
    permissions: ["read:applications", "write:applications", "write:decisions"]
  },
  {
    id: "4",
    name: "Customer Service",
    description: "Handle customer inquiries and support",
    users: 15,
    permissions: ["read:applications", "read:customers", "write:notes"]
  }
];

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>(sampleRoles);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search roles..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{roles.reduce((acc, role) => acc + role.users, 0)} Total Users</span>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles
          .filter(role => 
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((role) => (
            <Card key={role.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">{role.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {role.users}
                </Badge>
              </div>

              {/* Permissions Preview */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Permissions ({role.permissions.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}; 