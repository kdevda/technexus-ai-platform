import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import api from '@/config/api';
import { handleApiError } from '@/utils/errorHandler';
import { AxiosError } from 'axios';

const twilioConfigSchema = z.object({
  accountSid: z.string().min(1, 'Account SID is required'),
  authToken: z.string().min(1, 'Auth Token is required'),
  apiKeySid: z.string().optional(),
  phoneNumbers: z.array(z.string()).min(1, 'At least one phone number is required'),
  webhookUrl: z.string().url().optional(),
  twimlAppSid: z.string().optional(),
  enabled: z.boolean(),
  integrationId: z.string().optional()
});

type TwilioConfigForm = z.infer<typeof twilioConfigSchema>;

export interface TwilioFormData {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  phoneNumbers: string[];
  webhookUrl?: string;
  twimlAppSid?: string;
  enabled: boolean;
  integrationId?: string;
}

interface TwilioConfigProps {
  onSubmit: (data: TwilioFormData) => Promise<void>;
  onSuccess?: () => void;
}

export const TwilioConfig: React.FC<TwilioConfigProps> = ({ onSubmit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [twilioIntegrationId, setTwilioIntegrationId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TwilioConfigForm>({
    resolver: zodResolver(twilioConfigSchema),
    defaultValues: {
      phoneNumbers: [''],
      enabled: true
    }
  });

  // Fetch Twilio integration ID
  useEffect(() => {
    const fetchTwilioIntegrationId = async () => {
      try {
        const response = await api.get(`/integrations`);
        const integrations = response.data;
        
        // Find the Twilio integration
        const twilioIntegration = integrations.find((integration: { name: string }) => 
          integration.name.toLowerCase() === 'twilio'
        );
        
        if (twilioIntegration) {
          setTwilioIntegrationId(twilioIntegration.id);
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    };

    fetchTwilioIntegrationId();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get(`/twilio/config`);
        if (response.data) {
          form.reset({
            ...response.data,
            integrationId: response.data.integrationId || twilioIntegrationId || undefined
          });
        }
      } catch (error) {
        console.error('Error fetching Twilio config:', error);
        // Only show error toast if it's not a 404 (config not found)
        if ((error as AxiosError)?.response?.status !== 404) {
          handleApiError(error, 'Twilio Configuration', 'Failed to fetch Twilio configuration');
        }
      }
    };

    fetchConfig();
  }, [form, twilioIntegrationId]);

  const onSubmitForm = async (data: TwilioConfigForm) => {
    setLoading(true);
    try {
      // Include the Twilio integration ID in the request
      const requestData = {
        ...data,
        phoneNumbers: Array.isArray(data.phoneNumbers) ? data.phoneNumbers : [data.phoneNumbers],
        integrationId: data.integrationId || twilioIntegrationId || undefined
      };

      const response = await api.put(`/twilio/config`, requestData);

      toast({
        title: 'Success',
        description: 'Twilio configuration updated successfully',
      });

      const formattedData: TwilioFormData = {
        accountSid: data.accountSid,
        authToken: data.authToken,
        apiKeySid: data.apiKeySid,
        phoneNumbers: Array.isArray(data.phoneNumbers) ? data.phoneNumbers : [data.phoneNumbers],
        webhookUrl: data.webhookUrl,
        twimlAppSid: data.twimlAppSid,
        enabled: data.enabled,
        integrationId: data.integrationId || twilioIntegrationId || undefined
      };

      await onSubmit(formattedData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating Twilio config:', error);
      
      // Use the handleApiError utility for consistent error handling
      handleApiError(error, 'Twilio Configuration Error', 'Failed to update Twilio configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Twilio Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure your Twilio integration for voice calls
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
          <FormField
            control={form.control}
            name="accountSid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account SID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your Twilio Account SID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auth Token</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password"
                    placeholder="Enter your Twilio Auth Token" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKeySid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key SID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''}
                    placeholder="Enter your Twilio API Key SID" 
                  />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">
                  For enhanced security, create an API Key in your Twilio console and enter the SID here.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Numbers */}
          <div className="space-y-2">
            <FormLabel>Phone Numbers</FormLabel>
            {form.watch('phoneNumbers').map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  {...form.register(`phoneNumbers.${index}`)}
                  placeholder="Enter phone number in E.164 format"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const current = form.getValues('phoneNumbers');
                      form.setValue('phoneNumbers', 
                        current.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const current = form.getValues('phoneNumbers');
                form.setValue('phoneNumbers', [...current, '']);
              }}
            >
              Add Phone Number
            </Button>
          </div>

          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    value={field.value || ''}
                    placeholder={`${window.location.protocol}//${window.location.hostname}${window.location.hostname === 'localhost' ? ':3001' : ''}/api/twilio/webhook`} 
                  />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">
                  This URL should be configured in your Twilio account. For local development with ngrok, use your ngrok URL.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twimlAppSid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TwiML Application SID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter your TwiML Application SID" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Enable Twilio Integration</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}; 