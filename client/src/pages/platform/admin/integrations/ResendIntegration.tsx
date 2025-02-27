import { ResendConfig } from '@/components/integrations/ResendConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/components/ui/use-toast';

export const ResendIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Resend configuration updated successfully'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/platform/admin/integrations')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Integrations
        </Button>
        <h1 className="text-2xl font-bold">Resend Configuration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Resend Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ResendConfig 
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 