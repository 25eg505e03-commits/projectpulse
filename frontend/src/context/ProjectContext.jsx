import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectService } from '../services/api';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const { activeOrg } = useOrganization();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [userRole, setUserRole] = useState('developer');

  const fetchProjects = async () => {
    if (!activeOrg) {
      setProjects([]);
      setActiveProject(null);
      return;
    }
    setLoadingProjects(true);
    try {
      const { data } = await projectService.getProjects({ organization: activeOrg._id });
      if (data.success) {
        setProjects(data.data);
        if (data.data.length > 0 && (!activeProject || !data.data.some(p => p._id === activeProject._id))) {
          setActiveProject(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeOrg]);

  // Derive current user's project role dynamically
  useEffect(() => {
    if (activeProject && user) {
      if (activeOrg && activeOrg.owner.toString() === user._id.toString()) {
        setUserRole('admin');
        return;
      }

      const member = activeProject.members.find(
        (m) => (m.user._id || m.user).toString() === user._id.toString()
      );
      if (member) {
        setUserRole(member.projectRole || 'developer');
      } else {
        setUserRole('stakeholder');
      }
    }
  }, [activeProject, user, activeOrg]);

  const selectProject = (project) => {
    setActiveProject(project);
  };

  const isRole = (roles) => {
    if (!Array.isArray(roles)) roles = [roles];
    return roles.includes(userRole) || userRole === 'admin';
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        loadingProjects,
        userRole,
        selectProject,
        refreshProjects: fetchProjects,
        isRole,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
