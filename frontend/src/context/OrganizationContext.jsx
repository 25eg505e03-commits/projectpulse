import React, { createContext, useContext, useState, useEffect } from 'react';
import { orgService } from '../services/api';
import { useAuth } from './AuthContext';

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const fetchOrganizations = async () => {
    if (!isAuthenticated) return;
    setLoadingOrgs(true);
    try {
      const { data } = await orgService.getOrgs();
      if (data.success) {
        setOrganizations(data.data);
        const savedOrgId = localStorage.getItem('projectpulse_active_org');
        const found = data.data.find((o) => o._id === savedOrgId);

        if (found) {
          setActiveOrg(found);
        } else if (data.data.length > 0) {
          setActiveOrg(data.data[0]);
          localStorage.setItem('projectpulse_active_org', data.data[0]._id);
        } else {
          setActiveOrg(null);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [isAuthenticated]);

  const selectOrganization = (org) => {
    setActiveOrg(org);
    if (org) {
      localStorage.setItem('projectpulse_active_org', org._id);
    } else {
      localStorage.removeItem('projectpulse_active_org');
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrg,
        loadingOrgs,
        selectOrganization,
        refreshOrganizations: fetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);
