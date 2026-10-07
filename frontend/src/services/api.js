import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://projectpulse-1-s2by.onrender.com/api';
  
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('projectpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('projectpulse_token');
      localStorage.removeItem('projectpulse_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Modules
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const orgService = {
  getOrgs: () => api.get('/organizations'),
  getOrgById: (id) => api.get(`/organizations/${id}`),
  createOrg: (data) => api.post('/organizations', data),
  updateOrg: (id, data) => api.put(`/organizations/${id}`, data),
  deleteOrg: (id) => api.delete(`/organizations/${id}`),
  removeMember: (orgId, userId) => api.delete(`/organizations/${orgId}/members/${userId}`),
};

export const invitationService = {
  createInvitation: (data) => api.post('/invitations', data),
  getInvitations: () => api.get('/invitations'),
  respondInvitation: (id, action) => api.patch(`/invitations/${id}/respond`, { action }),
};

export const teamService = {
  getTeams: (orgId) => api.get(`/teams${orgId ? `?organization=${orgId}` : ''}`),
  getTeamById: (id) => api.get(`/teams/${id}`),
  createTeam: (data) => api.post('/teams', data),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
};

export const projectService = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
};

export const milestoneService = {
  getMilestones: (projectId) => api.get(`/milestones?project=${projectId}`),
  getMilestoneById: (id) => api.get(`/milestones/${id}`),
  createMilestone: (data) => api.post('/milestones', data),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};

export const sprintService = {
  getSprints: (projectId, status) => api.get(`/sprints?project=${projectId}${status ? `&status=${status}` : ''}`),
  getSprintById: (id) => api.get(`/sprints/${id}`),
  createSprint: (data) => api.post('/sprints', data),
  updateSprint: (id, data) => api.put(`/sprints/${id}`, data),
  startSprint: (id) => api.patch(`/sprints/${id}/start`),
  completeSprint: (id) => api.patch(`/sprints/${id}/complete`),
  deleteSprint: (id) => api.delete(`/sprints/${id}`),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  assignTask: (id, assignee) => api.patch(`/tasks/${id}/assign`, { assignee }),
  assignSprint: (id, sprintId) => api.patch(`/tasks/${id}/sprint`, { sprintId }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const issueService = {
  getIssues: (params) => api.get('/issues', { params }),
  getIssueById: (id) => api.get(`/issues/${id}`),
  createIssue: (data) => api.post('/issues', data),
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  updateIssueStatus: (id, status, resolution) => api.patch(`/issues/${id}/status`, { status, resolution }),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
};

export const commentService = {
  getComments: (entityType, entityId) => api.get(`/comments/${entityType}/${entityId}`),
  addComment: (data) => api.post('/comments', data),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const labelService = {
  getLabels: (projectId) => api.get(`/labels?project=${projectId}`),
  createLabel: (data) => api.post('/labels', data),
  updateLabel: (id, data) => api.put(`/labels/${id}`, data),
  deleteLabel: (id) => api.delete(`/labels/${id}`),
};

export const attachmentService = {
  uploadFile: (formData) => api.post('/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAttachment: (id) => api.get(`/attachments/${id}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const activityService = {
  getActivities: (params) => api.get('/activity', { params }),
};

export const reportService = {
  getProjectReport: (projectId) => api.get(`/reports/project/${projectId}`),
  getWorkloadReport: (projectId) => api.get(`/reports/workload/${projectId}`),
};

export default api;
