import { TwilioConfig, TwilioFormData } from '@/components/integrations/TwilioConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/components/ui/use-toast';

export const TwilioIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: TwilioFormData) => {
    try {
      // Handle the form submission
      toast({
        title: 'Success',
        description: 'Twilio configuration updated successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update Twilio configuration'
      });
    }
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
        <h1 className="text-2xl font-bold">Twilio Configuration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Twilio Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <TwilioConfig 
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 