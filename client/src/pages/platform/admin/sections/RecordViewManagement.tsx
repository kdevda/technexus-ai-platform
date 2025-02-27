import { useState, useEffect } from "react";
import { 
  Layout, Plus, Grip, Settings2, Trash2, 
  MoveLeft, MoveRight, ChevronDown, ChevronUp,
  Columns as ColumnsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableLayout, LayoutSection, LayoutComponent } from "@/types/recordView";
import { DatabaseTable, TableField } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

export const RecordViewManagement = () => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [layouts, setLayouts] = useState<TableLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);
  const [showNewLayoutDialog, setShowNewLayoutDialog] = useState(false);
  const [newLayoutData, setNewLayoutData] = useState({
    name: "",
    isDefault: false
  });

  // Add this useEffect to fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tables', {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }

        const data = await response.json();
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Error",
          description: "Failed to load tables. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Add loading state handling
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const handleCreateLayout = async () => {
    if (!selectedTable) return;

    try {
      const response = await fetch(`/api/tables/${selectedTable.id}/layouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLayoutData.name,
          isDefault: newLayoutData.isDefault,
          sections: []
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create layout');
      }

      const createdLayout = await response.json();
      setLayouts([...layouts, createdLayout]);
      setSelectedLayout(createdLayout);
      setShowNewLayoutDialog(false);
      
      toast({
        title: "Success",
        description: "Layout created successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating layout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create layout',
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const handleAddSection = () => {
    if (!selectedLayout) return;

    const newSection: LayoutSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      columns: 1,
      order: selectedLayout.sections.length,
      components: []
    };

    const updatedLayout = {
      ...selectedLayout,
      sections: [...selectedLayout.sections, newSection]
    };

    setSelectedLayout(updatedLayout);
    // TODO: Save to backend
  };

  const handleAddComponent = (sectionId: string) => {
    if (!selectedLayout) return;

    const newComponent: LayoutComponent = {
      id: `component-${Date.now()}`,
      type: 'field',
      width: 'full',
      order: selectedLayout.sections.find(s => s.id === sectionId)?.components.length || 0
    };

    const updatedSections = selectedLayout.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          components: [...section.components, newComponent]
        };
      }
      return section;
    });

    setSelectedLayout({
      ...selectedLayout,
      sections: updatedSections
    });
    // TODO: Save to backend
  };

  const renderLayoutEditor = () => {
    if (!selectedLayout) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{selectedLayout.name}</h3>
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {selectedLayout.sections.map((section, sectionIndex) => (
            <Card key={section.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Grip className="h-4 w-4 text-gray-400 cursor-move" />
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        const updatedSections = selectedLayout.sections.map(s => 
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        );
                        setSelectedLayout({
                          ...selectedLayout,
                          sections: updatedSections
                        });
                      }}
                      className="w-48"
                    />
                    <Select
                      value={section.columns.toString()}
                      onValueChange={(value) => {
                        const updatedSections = selectedLayout.sections.map(s => 
                          s.id === section.id ? { ...s, columns: parseInt(value) } : s
                        );
                        setSelectedLayout({
                          ...selectedLayout,
                          sections: updatedSections
                        });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Column</SelectItem>
                        <SelectItem value="2">2 Columns</SelectItem>
                        <SelectItem value="3">3 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAddComponent(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className={`grid grid-cols-${section.columns} gap-4`}>
                  {section.components.map((component, componentIndex) => (
                    <Card 
                      key={component.id} 
                      className={`p-4 border-2 border-dashed ${
                        component.width === 'full' ? 'col-span-full' :
                        component.width === '1/2' ? 'col-span-1' :
                        component.width === '2/3' ? 'col-span-2' :
                        'col-span-1'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Grip className="h-4 w-4 text-gray-400 cursor-move" />
                          <Select
                            value={component.type}
                            onValueChange={(value: LayoutComponent['type']) => {
                              const updatedSections = selectedLayout.sections.map(s => {
                                if (s.id === section.id) {
                                  const updatedComponents = s.components.map(c =>
                                    c.id === component.id ? { ...c, type: value } : c
                                  );
                                  return { ...s, components: updatedComponents };
                                }
                                return s;
                              });
                              setSelectedLayout({
                                ...selectedLayout,
                                sections: updatedSections
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="field">Field</SelectItem>
                              <SelectItem value="related_list">Related List</SelectItem>
                              <SelectItem value="widget">Widget</SelectItem>
                              <SelectItem value="custom">Custom Component</SelectItem>
                            </SelectContent>
                          </Select>
                          {component.type === 'field' && (
                            <Select
                              value={component.fieldId}
                              onValueChange={(value) => {
                                const updatedSections = selectedLayout.sections.map(s => {
                                  if (s.id === section.id) {
                                    const updatedComponents = s.components.map(c =>
                                      c.id === component.id ? { ...c, fieldId: value } : c
                                    );
                                    return { ...s, components: updatedComponents };
                                  }
                                  return s;
                                });
                                setSelectedLayout({
                                  ...selectedLayout,
                                  sections: updatedSections
                                });
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedTable?.fields.map((field: TableField) => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoveLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoveRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Layout className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Record View Management</h2>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-64">
          <Select
            value={selectedTable?.id}
            onValueChange={(value) => {
              const table = tables.find(t => t.id === value);
              setSelectedTable(table || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  {table.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTable && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Layouts</h3>
                <Dialog open={showNewLayoutDialog} onOpenChange={setShowNewLayoutDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Layout</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Layout Name</label>
                        <Input
                          placeholder="Enter layout name"
                          value={newLayoutData.name}
                          onChange={(e) => setNewLayoutData({
                            ...newLayoutData,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newLayoutData.isDefault}
                          onChange={(e) => setNewLayoutData({
                            ...newLayoutData,
                            isDefault: e.target.checked
                          })}
                        />
                        <label htmlFor="isDefault">Set as default layout</label>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleCreateLayout}
                        disabled={!newLayoutData.name}
                      >
                        Create Layout
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-1">
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedLayout?.id === layout.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLayout(layout)}
                  >
                    <span className="text-sm">{layout.name}</span>
                    {layout.isDefault && (
                      <span className="text-xs text-blue-500">Default</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {renderLayoutEditor()}
        </div>
      </div>
    </div>
  );
}; 