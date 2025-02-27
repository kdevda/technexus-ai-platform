import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <nav>
      {/* ... other nav items */}
      <Link 
        to="/platform/settings/twilio"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
      >
        <Phone className="h-4 w-4" />
        <span>Twilio Settings</span>
      </Link>
    </nav>
  );
}; 