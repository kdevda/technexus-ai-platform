import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { PlatformLayout } from '@/components/layouts/PlatformLayout';
import { TwilioIntegration } from '@/pages/platform/admin/integrations/TwilioIntegration';

// Public Pages
import Landing from './pages/public/Landing';
import { About } from './pages/public/About';
import { Services } from './pages/public/Services';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Platform Pages
import { Dashboard } from '@/pages/platform/Dashboard';
import { LoanApplication } from './pages/platform/LoanApplication';
import { Profile } from './pages/platform/Profile';
import { AdminPanel } from './pages/platform/admin/AdminPanel';
import { TablesAndFields } from './pages/platform/admin/sections/TablesAndFields';
import { RoleManagement } from './pages/platform/admin/sections/RoleManagement';
import { UserManagement } from './pages/platform/admin/sections/UserManagement';
import { WidgetManagement } from './pages/platform/admin/sections/WidgetManagement';
import { AdvancedAutomation } from './pages/platform/admin/sections/AdvancedAutomation';
import { AuditTrails } from './pages/platform/admin/sections/AuditTrails';
import { DataAnalytics } from './pages/platform/admin/sections/DataAnalytics';
import { CollaborationTools } from './pages/platform/admin/sections/CollaborationTools';
import { OmniChannel } from './pages/platform/admin/sections/OmniChannel';
import { SecurityCompliance } from './pages/platform/admin/sections/SecurityCompliance';
import { IntegrationEcosystem } from './pages/platform/admin/sections/IntegrationEcosystem';
import { Personalization } from './pages/platform/admin/sections/Personalization';
import { AIAgents } from './pages/platform/admin/sections/AIAgents';
import { OriginateAI } from './pages/platform/OriginateAI';
import { RecordView } from './pages/platform/RecordView';

export const App = () => {
  const location = useLocation();
  const isPlatform = location.pathname.startsWith('/platform');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <OrganizationProvider>
          <ToastProvider>
            <div className="App" style={{ 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Navbar />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                
                {/* Protected Platform Routes */}
                <Route path="/platform" element={<PlatformLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="loan/apply" element={<LoanApplication />} />
                  <Route path="profile" element={<Profile />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={<AdminPanel />}>
                    <Route index element={<TablesAndFields />} />
                    <Route path="tables-fields" element={<TablesAndFields />} />
                    <Route path="role-management" element={<RoleManagement />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="widget-management" element={<WidgetManagement />} />
                    <Route path="advanced-automation" element={<AdvancedAutomation />} />
                    <Route path="audit-trails" element={<AuditTrails />} />
                    <Route path="analytics-reporting" element={<DataAnalytics />} />
                    <Route path="collaboration" element={<CollaborationTools />} />
                    <Route path="omni-channel" element={<OmniChannel />} />
                    <Route path="security" element={<SecurityCompliance />} />
                    <Route path="integrations" element={<IntegrationEcosystem />} />
                    <Route path="integrations/twilio" element={<TwilioIntegration />} />
                    <Route path="personalization" element={<Personalization />} />
                    <Route path="ai-agents" element={<AIAgents />} />
                    {/* Add other admin section routes as needed */}
                  </Route>
                </Route>
                <Route path="/platform/originate" element={<OriginateAI />} />
                <Route path="/platform/records/:tableId/:recordId" element={<RecordView />} />
                <Route path="/platform/records/:tableId/new" element={<RecordView />} />
              </Routes>
              {!isPlatform && <Footer />}
            </div>
            <ToastViewport />
          </ToastProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 