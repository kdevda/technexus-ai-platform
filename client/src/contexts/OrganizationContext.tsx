import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Organization {
  id: string;
  name: string;
  // Add other organization fields as needed
}

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (org: Organization | null) => void;
}

export const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  setOrganization: () => {},
});

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrganization = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/organizations/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setOrganization(data);
          }
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
    };

    fetchOrganization();
  }, [user]);

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}; 