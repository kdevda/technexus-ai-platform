import { Phone, Settings, Users, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSidebar = () => {
  return (
    <nav className="space-y-2">
      {/* ... other nav items ... */}
      
      <Link 
        to="/platform/admin/integrations"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md"
      >
        <Settings className="h-4 w-4" />
        <span>Integrations</span>
      </Link>
    </nav>
  );
}; 