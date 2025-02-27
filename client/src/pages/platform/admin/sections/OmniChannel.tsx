import { useState } from "react";
import { 
  Phone, Mail, MessageCircle, Video, Settings2, 
  Plus, ExternalLink,
  MessageSquare, BellRing, WholeWord, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Channel {
  id: string;
  name: string;
  type: "email" | "sms" | "voice" | "video" | "chat" | "whatsapp" | "push" | "call-center";
  provider: string;
  status: "active" | "inactive" | "configuring";
  isEnabled: boolean;
  configuration: {
    apiKey?: string;
    accountSid?: string;
    fromNumber?: string;
    emailDomain?: string;
    webhookUrl?: string;
    templates?: Template[];
  };
  stats: {
    deliveryRate: number;
    responseRate: number;
    averageResponseTime: string;
  };
}

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  isActive: boolean;
}

const sampleChannels: Channel[] = [
  {
    id: "1",
    name: "Email Communications",
    type: "email",
    provider: "SendGrid",
    status: "active",
    isEnabled: true,
    configuration: {
      apiKey: "sk_*****",
      emailDomain: "notifications.technexus.com",
      templates: [
        {
          id: "1",
          name: "Welcome Email",
          type: "onboarding",
          content: "Welcome to TechNexus...",
          isActive: true
        },
        {
          id: "2",
          name: "Application Update",
          type: "notification",
          content: "Your loan application status has been updated...",
          isActive: true
        }
      ]
    },
    stats: {
      deliveryRate: 99.8,
      responseRate: 45.2,
      averageResponseTime: "2h 15m"
    }
  },
  {
    id: "2",
    name: "SMS Notifications",
    type: "sms",
    provider: "Twilio",
    status: "active",
    isEnabled: true,
    configuration: {
      accountSid: "AC*****",
      fromNumber: "+1234567890",
      templates: [
        {
          id: "1",
          name: "OTP Verification",
          type: "authentication",
          content: "Your verification code is: {{code}}",
          isActive: true
        }
      ]
    },
    stats: {
      deliveryRate: 98.5,
      responseRate: 85.3,
      averageResponseTime: "5m"
    }
  },
  {
    id: "3",
    name: "Customer Support Chat",
    type: "chat",
    provider: "Intercom",
    status: "active",
    isEnabled: true,
    configuration: {
      apiKey: "sk_*****",
      webhookUrl: "https://api.technexus.com/webhooks/chat",
    },
    stats: {
      deliveryRate: 100,
      responseRate: 92.1,
      averageResponseTime: "45s"
    }
  },
  {
    id: "4",
    name: "Call Center Integration",
    type: "call-center",
    provider: "Amazon Connect",
    status: "configuring",
    isEnabled: false,
    configuration: {
      accountSid: "AC*****",
    },
    stats: {
      deliveryRate: 0,
      responseRate: 0,
      averageResponseTime: "N/A"
    }
  }
];

export const OmniChannel = () => {
  const [channels, setChannels] = useState<Channel[]>(sampleChannels);

  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "email":
        return Mail;
      case "sms":
        return MessageCircle;
      case "voice":
        return Phone;
      case "video":
        return Video;
      case "chat":
        return MessageSquare;
      case "whatsapp":
        return WholeWord;
      case "push":
        return BellRing;
      case "call-center":
        return Headphones;
      default:
        return MessageCircle;
    }
  };

  const getStatusColor = (status: Channel["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "configuring":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleChannel = (channelId: string) => {
    setChannels(channels.map(channel => 
      channel.id === channelId 
        ? { ...channel, isEnabled: !channel.isEnabled }
        : channel
    ));
  };

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => {
          const ChannelIcon = getChannelIcon(channel.type);
          
          return (
            <Card key={channel.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ChannelIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{channel.name}</h3>
                      <Badge className={getStatusColor(channel.status)}>
                        {channel.status}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Settings2 className="h-4 w-4 mr-1" />
                      {channel.provider}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={channel.isEnabled}
                  onCheckedChange={() => toggleChannel(channel.id)}
                />
              </div>

              {/* Channel Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">Delivery Rate</div>
                  <div className="text-sm font-semibold">
                    {channel.stats.deliveryRate}%
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">Response Rate</div>
                  <div className="text-sm font-semibold">
                    {channel.stats.responseRate}%
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500">Avg Response</div>
                  <div className="text-sm font-semibold">
                    {channel.stats.averageResponseTime}
                  </div>
                </div>
              </div>

              {/* Templates Preview - Show only count */}
              {channel.configuration.templates && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    {channel.configuration.templates.length} Templates
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    Manage Templates
                  </Button>
                </div>
              )}

              {/* Configuration Link */}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 