import { TwilioConfig, TwilioFormData } from '@/components/integrations/TwilioConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';
import { handleApiError } from '@/utils/errorHandler';

export const TwilioSettings = () => {
  const { toast } = useToast();

  const handleSubmit = async (data: TwilioFormData) => {
    try {
      const response = await api.put('/twilio/config', data);

      console.log('Configuration updated:', response.data);
      toast({
        title: "Success",
        description: "Twilio configuration updated successfully"
      });
    } catch (error) {
      console.error('Error updating Twilio config:', error);
      handleApiError(error, 'Twilio Configuration Error', 'Failed to update Twilio configuration');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Twilio Integration Settings</CardTitle>
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