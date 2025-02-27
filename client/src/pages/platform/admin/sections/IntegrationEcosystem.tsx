import { useState, useEffect, useContext } from "react";
import { 
  Settings2, Power, ExternalLink, Search, 
  CheckCircle2, AlertCircle, XCircle, Filter,
  RefreshCcw, Database, CreditCard, FileText, 
  Mail, Phone, MessageSquare, Receipt, Bot,
  Users, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwilioConfig } from "@/components/integrations/TwilioConfig";
import { ResendConfig } from "@/components/integrations/ResendConfig";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from "@/config/api";
import { AuthContext } from "@/contexts/AuthContext";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "ai" | "data" | "payment" | "credit" | "document" | "communication" | "accounting" | "crm" | "verification";
  status: "connected" | "disconnected" | "error" | "configuring";
  isEnabled: boolean;
  lastSync?: string;
  apiVersion?: string;
  icon: string;
}

const categories = {
  ai: { label: "AI & Machine Learning", icon: Bot },
  data: { label: "Data & Analytics", icon: Database },
  payment: { label: "Payment Processing", icon: CreditCard },
  credit: { label: "Credit & Risk", icon: AlertCircle },
  document: { label: "Document Management", icon: FileText },
  communication: { label: "Communication", icon: MessageSquare },
  accounting: { label: "Accounting & Finance", icon: Receipt },
  crm: { label: "CRM & Sales", icon: Users },
  verification: { label: "Identity & Verification", icon: CheckCircle2 }
};

export const IntegrationEcosystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [integrationList, setIntegrationList] = useState<Integration[]>([]);
  const [showTwilioConfig, setShowTwilioConfig] = useState(false);
  const [showResendConfig, setShowResendConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/integrations`);
      setIntegrationList(response.data);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch integrations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "configuring":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleIntegration = async (integrationId: string) => {
    try {
      const response = await api.put(`/integrations/${integrationId}/toggle`);
      
      setIntegrationList(list => 
        list.map(integration => 
          integration.id === integrationId 
            ? { ...integration, isEnabled: !integration.isEnabled }
            : integration
        )
      );

      toast({
        title: "Success",
        description: "Integration status updated successfully",
      });
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
    }
  };

  const filteredIntegrations = integrationList.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfigure = (integrationName: string) => {
    // Use the integration name to determine which config dialog to show
    switch (integrationName.toLowerCase()) {
      case "twilio":
        setShowTwilioConfig(true);
        break;
      case "resend":
        setShowResendConfig(true);
        break;
      default:
        // For other integrations, navigate to a dedicated configuration page
        navigate(`/platform/admin/integrations/${integrationName.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading integrations...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              className="pl-10 w-full max-w-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="w-full overflow-x-auto">
            <div className="flex flex-wrap gap-2 min-w-max pb-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory(null)}
                className={!selectedCategory ? "bg-blue-50" : ""}
              >
                All
              </Button>
              {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => setSelectedCategory(key)}
                  className={`whitespace-nowrap ${selectedCategory === key ? "bg-blue-50" : ""}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-row">
                {/* Left column: Name and Description */}
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(integration.status)}`}
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
                
                {/* Right column: Toggle and Image */}
                <div className="flex flex-col items-center justify-between">
                  <Switch
                    checked={integration.isEnabled}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                    className="mb-4"
                  />
                  
                  <div className="mt-2">
                    <img 
                      src={integration.icon}
                      alt={`${integration.name} icon`}
                      className="w-[100px] h-[50px] object-contain"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleConfigure(integration.name.toLowerCase())}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showTwilioConfig && (
        <Dialog open={showTwilioConfig} onOpenChange={setShowTwilioConfig}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Twilio Configuration</DialogTitle>
              <DialogDescription>
                Configure your Twilio integration for voice calls
              </DialogDescription>
            </DialogHeader>
            <TwilioConfig
              onSubmit={async () => {
                setShowTwilioConfig(false);
                await fetchIntegrations();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {showResendConfig && (
        <Dialog open={showResendConfig} onOpenChange={setShowResendConfig}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Resend Configuration</DialogTitle>
              <DialogDescription>
                Configure your Resend integration for email delivery
              </DialogDescription>
            </DialogHeader>
            <ResendConfig
              onSuccess={() => {
                setShowResendConfig(false);
                fetchIntegrations();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}; 