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

const resendConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  fromEmail: z.string().email('Valid email is required'),
  domain: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  enabled: z.boolean(),
  integrationId: z.string().optional()
});

type ResendConfigForm = z.infer<typeof resendConfigSchema>;

interface ResendConfigProps {
  onSuccess?: () => void;
}

export const ResendConfig = ({ onSuccess }: ResendConfigProps) => {
  const [loading, setLoading] = useState(false);
  const [resendIntegrationId, setResendIntegrationId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ResendConfigForm>({
    resolver: zodResolver(resendConfigSchema),
    defaultValues: {
      enabled: true
    }
  });

  // Fetch Resend integration ID
  useEffect(() => {
    const fetchResendIntegrationId = async () => {
      try {
        const response = await api.get(`/integrations`);
        const integrations = response.data;
        
        // Find the Resend integration
        const resendIntegration = integrations.find((integration: { name: string }) => 
          integration.name.toLowerCase() === 'resend'
        );
        
        if (resendIntegration) {
          setResendIntegrationId(resendIntegration.id);
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      }
    };

    fetchResendIntegrationId();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get(`/resend/config`);
        if (response.data) {
          form.reset({
            ...response.data,
            integrationId: response.data.integrationId || resendIntegrationId || undefined
          });
        }
      } catch (error) {
        console.error('Error fetching Resend config:', error);
        // Only show error toast if it's not a 404 (config not found)
        if ((error as any)?.response?.status !== 404) {
          handleApiError(error, 'Resend Configuration', 'Failed to fetch Resend configuration');
        }
      }
    };

    fetchConfig();
  }, [form, resendIntegrationId]);

  const onSubmit = async (data: ResendConfigForm) => {
    setLoading(true);
    try {
      // Include the Resend integration ID in the request
      const requestData = {
        ...data,
        integrationId: data.integrationId || resendIntegrationId || undefined
      };

      const response = await api.put(`/resend/config`, requestData);

      toast({
        title: 'Success',
        description: 'Resend configuration updated successfully',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating Resend config:', error);
      handleApiError(error, 'Resend Configuration Error', 'Failed to update Resend configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Resend Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure your Resend integration for email delivery
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password"
                    placeholder="Enter your Resend API Key" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fromEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter the email address to send from" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter your verified domain" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="Enter webhook URL for email events" 
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
                <FormLabel>Enable Resend Integration</FormLabel>
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