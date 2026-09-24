import React from 'react';
import { useProject } from '../../context/ProjectContext';

const RoleGuard = ({ allowedRoles = [], fallback = null, children }) => {
  const { userRole } = useProject();

  if (userRole === 'admin' || allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
