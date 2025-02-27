import { useState } from "react";
import { 
  Palette, Layout, Type, Globe, Bell, 
  Monitor, Moon, Sun, Laptop, Eye, 
  Clock, Calendar, Languages, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeSettings {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  fontSize: "small" | "medium" | "large";
  density: "comfortable" | "compact" | "spacious";
}

interface LocalizationSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

interface DashboardPreferences {
  defaultView: string;
  showWelcomeScreen: boolean;
  enableTutorials: boolean;
  autoRefresh: boolean;
}

export const Personalization = () => {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: "system",
    primaryColor: "blue",
    fontSize: "medium",
    density: "comfortable"
  });

  const [localization, setLocalization] = useState<LocalizationSettings>({
    language: "en-US",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "en-US"
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    desktopNotifications: false
  });

  const [dashboard, setDashboard] = useState<DashboardPreferences>({
    defaultView: "summary",
    showWelcomeScreen: true,
    enableTutorials: true,
    autoRefresh: true
  });

  const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Theme Customization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Theme & Appearance</h2>
          </div>
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Mode */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Theme Mode</label>
            <div className="flex space-x-2">
              <Button
                variant={theme.mode === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme({ ...theme, mode: "light" })}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme.mode === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme({ ...theme, mode: "dark" })}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme.mode === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme({ ...theme, mode: "system" })}
              >
                <Laptop className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>

          {/* Primary Color */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex space-x-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={`w-8 h-8 rounded-full ${color.class} ${
                    theme.primaryColor === color.value
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Font Size</label>
            <Select
              value={theme.fontSize}
              onValueChange={(value: any) => setTheme({ ...theme, fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Density */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Layout Density</label>
            <Select
              value={theme.density}
              onValueChange={(value: any) => setTheme({ ...theme, density: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Localization Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Localization</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Language</label>
            <Select
              value={localization.language}
              onValueChange={(value) => 
                setLocalization({ ...localization, language: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Timezone</label>
            <Select
              value={localization.timezone}
              onValueChange={(value) => 
                setLocalization({ ...localization, timezone: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Date Format</label>
            <Select
              value={localization.dateFormat}
              onValueChange={(value) => 
                setLocalization({ ...localization, dateFormat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number Format */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Number Format</label>
            <Select
              value={localization.numberFormat}
              onValueChange={(value) => 
                setLocalization({ ...localization, numberFormat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">1,234.56</SelectItem>
                <SelectItem value="de-DE">1.234,56</SelectItem>
                <SelectItem value="fr-FR">1 234,56</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound Effects</h3>
              <p className="text-sm text-gray-500">Play sounds for notifications</p>
            </div>
            <Switch
              checked={notifications.soundEnabled}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, soundEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Desktop Notifications</h3>
              <p className="text-sm text-gray-500">Show desktop notifications</p>
            </div>
            <Switch
              checked={notifications.desktopNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, desktopNotifications: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Dashboard Preferences */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Layout className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Dashboard Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Default Dashboard View</label>
            <Select
              value={dashboard.defaultView}
              onValueChange={(value) => 
                setDashboard({ ...dashboard, defaultView: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary View</SelectItem>
                <SelectItem value="detailed">Detailed View</SelectItem>
                <SelectItem value="compact">Compact View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Welcome Screen</h3>
                <p className="text-sm text-gray-500">Show welcome screen on login</p>
              </div>
              <Switch
                checked={dashboard.showWelcomeScreen}
                onCheckedChange={(checked) =>
                  setDashboard({ ...dashboard, showWelcomeScreen: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Feature Tutorials</h3>
                <p className="text-sm text-gray-500">Show feature tutorials</p>
              </div>
              <Switch
                checked={dashboard.enableTutorials}
                onCheckedChange={(checked) =>
                  setDashboard({ ...dashboard, enableTutorials: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto Refresh</h3>
                <p className="text-sm text-gray-500">Automatically refresh data</p>
              </div>
              <Switch
                checked={dashboard.autoRefresh}
                onCheckedChange={(checked) =>
                  setDashboard({ ...dashboard, autoRefresh: checked })
                }
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 