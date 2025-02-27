import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ModuleSelector } from '@/components/dashboard/ModuleSelector';
import { UserMenu } from '@/components/dashboard/UserMenu';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navbar on landing page as it has its own header
  if (location.pathname === '/') {
    return null;
  }

  // If user is not logged in, show simple navbar with sign in option
  if (!user) {
    return (
      <>
        <nav className="fixed top-0 w-full bg-white border-b z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 
                onClick={() => navigate('/')} 
                className="text-2xl font-bold text-black cursor-pointer"
              >
                TECHNEXUS
              </h1>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
                onClick={() => navigate('/auth/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </nav>
        <div className="h-16" />
      </>
    );
  }

  // Logged in user navbar
  return (
    <>
      <nav className="fixed top-0 w-full bg-white border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo */}
            <h1 
              onClick={() => navigate('/platform/dashboard')} 
              className="text-2xl font-bold text-black cursor-pointer"
            >
              TECHNEXUS
            </h1>

            {/* Right side: Module Selector and User Menu */}
            <div className="flex items-center space-x-4">
              <ModuleSelector 
                onModuleChange={(path) => navigate(path)} 
              />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}; 