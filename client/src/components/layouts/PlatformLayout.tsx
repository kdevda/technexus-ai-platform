import { Outlet } from 'react-router-dom';
import { PhoneBubble } from '@/components/softphone/PhoneBubble';

export const PlatformLayout = () => {
  return (
    <div className="relative min-h-screen">
      <Outlet />
      <PhoneBubble />
    </div>
  );
}; 