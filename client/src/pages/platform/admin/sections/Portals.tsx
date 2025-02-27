import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Organization, organizationService } from "@/services/organizationService";

export const Portals = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState("");
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const { toast } = useToast();
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      
      // Ensure organizations is always an array
      if (data && Array.isArray(data)) {
        setOrganizations(data);
        console.log('Organizations loaded successfully:', data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setOrganizations([]);
        toast({
          title: "Warning",
          description: "Received unexpected data format from server",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
      toast({
        title: "Error",
        description: `Failed to load organizations: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      if (!newOrgName.trim()) {
        toast({
          title: "Error",
          description: "Organization name cannot be empty",
          variant: "destructive",
        });
        return;
      }

      const newOrg = await organizationService.create(newOrgName);
      setOrganizations([...organizations, newOrg]);
      setNewOrgName("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    }
  };

  const handleEditOrganization = async () => {
    try {
      if (!editOrgName.trim() || !editOrgId) {
        toast({
          title: "Error",
          description: "Organization name cannot be empty",
          variant: "destructive",
        });
        return;
      }

      const updatedOrg = await organizationService.update(editOrgId, editOrgName);
      setOrganizations(organizations.map(org => 
        org.id === editOrgId ? updatedOrg : org
      ));
      setEditOrgId(null);
      setEditOrgName("");
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      if (!deleteOrgId) return;

      await organizationService.delete(deleteOrgId);
      setOrganizations(organizations.filter(org => org.id !== deleteOrgId));
      setDeleteOrgId(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setTestData(null);
      
      // First try the test endpoint
      try {
        console.log('Testing API connection...');
        const testData = await organizationService.test();
        setTestData(testData);
        console.log('Test endpoint successful:', testData);
        
        toast({
          title: "API Test Successful",
          description: "Test endpoint is working",
        });
      } catch (error: any) {
        console.error('Test endpoint failed:', error);
        
        // Create a detailed error object
        const errorDetails = {
          error: 'Test endpoint failed',
          details: error.message || 'Unknown error',
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            baseURL: error.config.baseURL,
          } : 'No config available',
          status: error.response ? error.response.status : 'No response'
        };
        
        setTestData(errorDetails);
        
        toast({
          title: "API Test Failed",
          description: `Test endpoint error: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        
        // Don't try the regular endpoint if the test endpoint failed
        setLoading(false);
        return;
      }
      
      // Then try the regular endpoint
      try {
        console.log('Testing regular organizations endpoint...');
        const orgs = await organizationService.getAll();
        console.log('Regular endpoint response:', orgs);
        
        // Update test data with both results
        setTestData((prevData: any) => ({
          ...prevData,
          regularEndpoint: {
            success: true,
            data: orgs
          }
        }));
        
        if (Array.isArray(orgs) && orgs.length > 0) {
          toast({
            title: "Organizations Loaded",
            description: `Found ${orgs.length} organizations`,
          });
        } else {
          toast({
            title: "No Organizations",
            description: "The API returned an empty array",
          });
        }
      } catch (error: any) {
        console.error('Regular endpoint failed:', error);
        
        // Update test data with error
        setTestData((prevData: any) => ({
          ...prevData,
          regularEndpoint: {
            success: false,
            error: error.message || 'Unknown error',
            status: error.response ? error.response.status : 'No response'
          }
        }));
        
        toast({
          title: "Organizations Fetch Failed",
          description: `Could not load organizations: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Overall API test error:', error);
      
      setTestData({
        error: 'API test failed',
        details: error.message || 'Unknown error'
      });
      
      toast({
        title: "API Test Failed",
        description: "See console for details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portals & Organizations</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={testApiConnection}>
            <Bug className="mr-2 h-4 w-4" /> Test API
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Organization
          </Button>
        </div>
      </div>

      {testData && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">API Test Results:</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}

      <Tabs defaultValue="organizations">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="client-portals">Client Portals</TabsTrigger>
          <TabsTrigger value="employee-portals">Employee Portals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organizations" className="space-y-4">
          <p className="text-gray-600 mb-4">
            Manage organizations in your platform. Each organization represents a separate tenant with its own users, data, and configurations.
          </p>
          
          {loading ? (
            <div className="text-center py-8">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No organizations</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new organization.</p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Organization
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(organizations) && organizations.map((org) => (
                <Card key={org.id}>
                  <CardHeader>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>
                      Created on {new Date(org.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">ID: {org.id}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditOrgId(org.id);
                        setEditOrgName(org.name);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setDeleteOrgId(org.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="client-portals">
          <p className="text-gray-600">Client portal configuration coming soon...</p>
        </TabsContent>
        
        <TabsContent value="employee-portals">
          <p className="text-gray-600">Employee portal configuration coming soon...</p>
        </TabsContent>
      </Tabs>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization}>
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the organization details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter organization name"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditOrganization}>
              Update Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrganization}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 