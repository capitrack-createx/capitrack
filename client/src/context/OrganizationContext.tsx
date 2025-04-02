import React, { createContext, useContext, useEffect, useState } from "react";
import { Organization } from "@shared/types";
import { dbService } from "@/services/db-service";
import { useAuth } from "@/services/auth-service";

interface OrganizationContextType {
  organization: Organization | null;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);

  const refreshOrganizations = async () => {
    if (!user) return;
    const org = await dbService.getUserOrganization(user.uid);
    setOrganization(org);
  };

  useEffect(() => {
    refreshOrganizations();
  }, [user]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
