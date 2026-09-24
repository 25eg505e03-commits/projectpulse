const Project = require('../models/Project');
const Organization = require('../models/Organization');

const ROLE_PERMISSIONS = {
  admin: [
    'project:read', 'project:write', 'project:delete',
    'sprint:read', 'sprint:write', 'sprint:delete',
    'milestone:read', 'milestone:write', 'milestone:delete',
    'task:read', 'task:write', 'task:delete', 'task:status',
    'issue:read', 'issue:write', 'issue:delete',
    'org:write', 'org:admin'
  ],
  project_manager: [
    'project:read', 'project:write',
    'sprint:read', 'sprint:write', 'sprint:delete',
    'milestone:read', 'milestone:write', 'milestone:delete',
    'task:read', 'task:write', 'task:delete', 'task:status',
    'issue:read', 'issue:write', 'issue:delete'
  ],
  team_lead: [
    'project:read',
    'sprint:read', 'sprint:write',
    'milestone:read',
    'task:read', 'task:write', 'task:status',
    'issue:read', 'issue:write'
  ],
  developer: [
    'project:read',
    'sprint:read',
    'milestone:read',
    'task:read', 'task:status', 'task:comment',
    'issue:read', 'issue:write', 'issue:comment'
  ],
  stakeholder: [
    'project:read',
    'sprint:read',
    'milestone:read',
    'task:read',
    'issue:read',
    'report:read'
  ]
};

const getUserProjectRole = async (userId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  // Check if user is Org owner or Org admin
  const org = await Organization.findById(project.organization);
  if (org) {
    if (org.owner.toString() === userId.toString()) return 'admin';
    const orgMember = org.members.find(m => m.user.toString() === userId.toString());
    if (orgMember && orgMember.role === 'admin') return 'admin';
  }

  // Check direct project member role
  const projectMember = project.members.find(m => m.user.toString() === userId.toString());
  if (projectMember) {
    return projectMember.projectRole;
  }

  return null;
};

const hasPermission = (role, permission) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
};

module.exports = {
  ROLE_PERMISSIONS,
  getUserProjectRole,
  hasPermission
};
