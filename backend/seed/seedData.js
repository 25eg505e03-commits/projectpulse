const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Label = require('../models/Label');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');

dotenv.config({ path: __dirname + '/../.env' });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projectpulse');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Milestone.deleteMany({});
    await Sprint.deleteMany({});
    await Task.deleteMany({});
    await Issue.deleteMany({});
    await Label.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});
    await Notification.deleteMany({});
    await Invitation.deleteMany({});

    console.log('Cleared existing database collections.');

    // 1. Create Users
    const users = await User.create([
      { name: 'Rahul Sharma', email: 'admin@technova.com', password: 'password123', phone: '+91 9876543210' },
      { name: 'Anjali Verma', email: 'pm@technova.com', password: 'password123', phone: '+91 9876543211' },
      { name: 'Vikram Patel', email: 'lead@technova.com', password: 'password123', phone: '+91 9876543212' },
      { name: 'Siddharth Rao', email: 'dev1@technova.com', password: 'password123', phone: '+91 9876543213' },
      { name: 'Priya Nair', email: 'dev2@technova.com', password: 'password123', phone: '+91 9876543214' },
      { name: 'Amitabh Sen', email: 'stakeholder@technova.com', password: 'password123', phone: '+91 9876543215' },
    ]);

    const [admin, pm, lead, dev1, dev2, stakeholder] = users;
    console.log('Created 6 demo users.');

    // 2. Create Organization
    const org = await Organization.create({
      name: 'TechNova Solutions',
      description: 'Enterprise Software & Cloud Engineering Solutions',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: pm._id, role: 'member' },
        { user: lead._id, role: 'member' },
        { user: dev1._id, role: 'member' },
        { user: dev2._id, role: 'member' },
        { user: stakeholder._id, role: 'member' },
      ],
    });
    console.log('Created Organization: TechNova Solutions');

    // 3. Create Teams
    const frontendTeam = await Team.create({
      organization: org._id,
      name: 'Frontend Team',
      description: 'React, Vite & UI Component Design Experts',
      lead: lead._id,
      members: [lead._id, dev1._id],
    });

    const backendTeam = await Team.create({
      organization: org._id,
      name: 'Backend Team',
      description: 'Node.js, Express & MongoDB Microservices Team',
      lead: lead._id,
      members: [lead._id, dev2._id],
    });

    const qaTeam = await Team.create({
      organization: org._id,
      name: 'QA & DevOps Team',
      description: 'Automated Testing, CI/CD & Security Audits',
      lead: pm._id,
      members: [pm._id, dev1._id, dev2._id],
    });
    console.log('Created 3 Teams: Frontend, Backend, QA Team.');

    // 4. Create Projects
    const projectPulse = await Project.create({
      organization: org._id,
      name: 'ProjectPulse Suite',
      description: 'Agile Project Management and Team Collaboration Platform',
      projectKey: 'PULSE',
      owner: admin._id,
      members: [
        { user: admin._id, projectRole: 'admin' },
        { user: pm._id, projectRole: 'project_manager' },
        { user: lead._id, projectRole: 'team_lead' },
        { user: dev1._id, projectRole: 'developer' },
        { user: dev2._id, projectRole: 'developer' },
        { user: stakeholder._id, projectRole: 'stakeholder' },
      ],
      status: 'active',
      priority: 'high',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    const campusConnect = await Project.create({
      organization: org._id,
      name: 'CampusConnect Portal',
      description: 'University Student and Alumni Networking Portal',
      projectKey: 'CAMPUS',
      owner: admin._id,
      members: [
        { user: admin._id, projectRole: 'admin' },
        { user: pm._id, projectRole: 'project_manager' },
        { user: dev1._id, projectRole: 'developer' },
      ],
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
    });
    console.log('Created 2 Projects: ProjectPulse & CampusConnect.');

    // 5. Create Labels
    const labels = await Label.create([
      { project: projectPulse._id, name: 'frontend', color: '#3b82f6' },
      { project: projectPulse._id, name: 'backend', color: '#10b981' },
      { project: projectPulse._id, name: 'bug', color: '#ef4444' },
      { project: projectPulse._id, name: 'urgent', color: '#f59e0b' },
      { project: projectPulse._id, name: 'documentation', color: '#8b5cf6' },
      { project: projectPulse._id, name: 'security', color: '#ec4899' },
    ]);
    const [lblFrontend, lblBackend, lblBug, lblUrgent, lblDoc, lblSec] = labels;

    // 6. Create Milestones
    const milestones = await Milestone.create([
      {
        project: projectPulse._id,
        name: 'Phase 1: Core REST APIs & Auth',
        description: 'JWT Authentication, Org Management, and Database Schemas',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        progress: 100,
        createdBy: pm._id,
      },
      {
        project: projectPulse._id,
        name: 'Phase 2: Kanban & Agile Sprints',
        description: 'Drag and Drop Kanban Board, Backlog Manager, Sprint Velocity',
        startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        progress: 65,
        createdBy: pm._id,
      },
      {
        project: projectPulse._id,
        name: 'Phase 3: Analytics & Recharts Reports',
        description: 'Workload distribution charts and project completion reporting',
        startDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'not-started',
        progress: 0,
        createdBy: pm._id,
      },
    ]);

    // 7. Create Sprints
    const sprint1 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 1 - Foundation & Authentication',
      goal: 'Complete user registration, JWT login, and Organization creation APIs.',
      startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'completed',
    });

    const sprint2 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 2 - Kanban Board & Backlog',
      goal: 'Implement task status drag-and-drop, sprint assignment, and blocker tracking.',
      startDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const sprint3 = await Sprint.create({
      project: projectPulse._id,
      name: 'Sprint 3 - Reports & Notifications',
      goal: 'In-app notifications, @mentions, and Recharts reporting dashboard.',
      startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'planned',
    });
    console.log('Created Sprints and Milestones.');

    // 8. Create 20+ Tasks
    const tasksData = [
      {
        project: projectPulse._id,
        sprint: sprint1._id,
        title: 'Design MongoDB Schemas for Users and Organizations',
        description: 'Create Mongoose models with strict validations, indexing, and bcrypt pre-hooks.',
        type: 'task',
        status: 'done',
        priority: 'critical',
        assignee: dev2._id,
        reporter: pm._id,
        team: backendTeam._id,
        storyPoints: 5,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint1._id,
        title: 'Implement JWT Auth Controller and Cookies',
        description: 'Build register, login, logout, and getMe API endpoints with token verification.',
        type: 'story',
        status: 'done',
        priority: 'high',
        assignee: dev2._id,
        reporter: pm._id,
        team: backendTeam._id,
        storyPoints: 8,
        labels: [lblBackend._id, lblUrgent._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint1._id,
        title: 'Setup React Vite Frontend Boilerplate',
        description: 'Configure React Router, Context API state store, and Tailwind CSS design tokens.',
        type: 'task',
        status: 'done',
        priority: 'medium',
        assignee: dev1._id,
        reporter: lead._id,
        team: frontendTeam._id,
        storyPoints: 3,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Build Drag and Drop Kanban Board View',
        description: 'Interactive columns for TODO, IN PROGRESS, REVIEW, and DONE with optimistic updates.',
        type: 'story',
        status: 'in-progress',
        priority: 'critical',
        assignee: dev1._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 8,
        labels: [lblFrontend._id, lblUrgent._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'API endpoint for Task Status PATCH updates',
        description: 'Handle instant status mutation with backend validation and activity logging.',
        type: 'task',
        status: 'done',
        priority: 'high',
        assignee: dev2._id,
        reporter: lead._id,
        team: backendTeam._id,
        storyPoints: 5,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Implement Project-Scoped RBAC Middleware',
        description: 'Enforce strict permission checks (Admin, PM, Team Lead, Developer, Stakeholder).',
        type: 'task',
        status: 'in-progress',
        priority: 'critical',
        assignee: dev2._id,
        reporter: admin._id,
        team: backendTeam._id,
        storyPoints: 5,
        labels: [lblBackend._id, lblSec._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Backlog Management & Sprint Accordion',
        description: 'Allow moving tasks between backlog and planned sprints with story points tally.',
        type: 'story',
        status: 'in-progress',
        priority: 'medium',
        assignee: dev1._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 5,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Task Dependencies & Blocker Badges',
        description: 'Display blocker warnings and validate non-cyclical task dependencies.',
        type: 'improvement',
        status: 'review',
        priority: 'high',
        assignee: lead._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 3,
        labels: [lblFrontend._id],
        blockers: ['Waiting on backend API payload clarification'],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'File Attachments Upload using Multer',
        description: 'Secure file upload with mime-type checking and 10MB file limit.',
        type: 'task',
        status: 'done',
        priority: 'medium',
        assignee: dev2._id,
        reporter: pm._id,
        team: backendTeam._id,
        storyPoints: 5,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Comment Stream with @Mentions Detection',
        description: 'Parse comment text for @username and send automated notifications.',
        type: 'story',
        status: 'todo',
        priority: 'high',
        assignee: dev1._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 5,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint3._id,
        title: 'Project Analytics Reports with Recharts',
        description: 'Render Task Status Pie Chart, Priority Distribution Bar, and Workload Distribution.',
        type: 'story',
        status: 'todo',
        priority: 'high',
        assignee: dev1._id,
        reporter: stakeholder._id,
        team: frontendTeam._id,
        storyPoints: 8,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint3._id,
        title: 'Workload Dashboard for Team Lead',
        description: 'Show task assignment counts, story points, and active sprint burden per developer.',
        type: 'story',
        status: 'todo',
        priority: 'medium',
        assignee: lead._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 5,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: null, // Backlog
        title: 'Dark Mode Theme Switcher',
        description: 'Add sleek dark mode toggle with CSS variables persistence.',
        type: 'improvement',
        status: 'todo',
        priority: 'low',
        assignee: null,
        reporter: dev1._id,
        team: frontendTeam._id,
        storyPoints: 2,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: null, // Backlog
        title: 'Export Sprint Summary to PDF/CSV',
        description: 'Generate report export files for project stakeholders.',
        type: 'improvement',
        status: 'todo',
        priority: 'low',
        assignee: null,
        reporter: stakeholder._id,
        team: qaTeam._id,
        storyPoints: 3,
        labels: [lblDoc._id],
      },
      {
        project: projectPulse._id,
        sprint: null, // Backlog
        title: 'Automated Jest Integration Tests for Backend APIs',
        description: 'Write test suites for Auth, Projects, Tasks, and RBAC security checks.',
        type: 'task',
        status: 'todo',
        priority: 'high',
        assignee: dev2._id,
        reporter: pm._id,
        team: qaTeam._id,
        storyPoints: 5,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'In-App Notification Feed & Unread Badge',
        description: 'Header notification bell dropdown with mark as read functionality.',
        type: 'task',
        status: 'in-progress',
        priority: 'high',
        assignee: dev1._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 5,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint1._id,
        title: 'Global Search bar for tasks and issues',
        description: 'Backend search endpoint with multi-field regex matching.',
        type: 'task',
        status: 'done',
        priority: 'medium',
        assignee: dev2._id,
        reporter: lead._id,
        team: backendTeam._id,
        storyPoints: 3,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Audit Activity Feed Stream',
        description: 'Log audit events for project creation, task status change, and sprint start.',
        type: 'task',
        status: 'done',
        priority: 'medium',
        assignee: dev2._id,
        reporter: admin._id,
        team: backendTeam._id,
        storyPoints: 3,
        labels: [lblBackend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'Project Timeline Gantt View',
        description: 'Visual timeline depicting milestones, sprint durations, and deadlines.',
        type: 'story',
        status: 'review',
        priority: 'medium',
        assignee: lead._id,
        reporter: pm._id,
        team: frontendTeam._id,
        storyPoints: 5,
        labels: [lblFrontend._id],
      },
      {
        project: projectPulse._id,
        sprint: sprint2._id,
        title: 'User Profile & Password Reset Modal',
        description: 'Allow users to update name, avatar, and phone number.',
        type: 'task',
        status: 'done',
        priority: 'low',
        assignee: dev1._id,
        reporter: admin._id,
        team: frontendTeam._id,
        storyPoints: 2,
        labels: [lblFrontend._id],
      },
      {
        project: campusConnect._id,
        sprint: null,
        title: 'Database Schema Design for Student Profiles',
        description: 'Create student registration and course mapping models.',
        type: 'task',
        status: 'todo',
        priority: 'medium',
        assignee: dev1._id,
        reporter: pm._id,
        team: backendTeam._id,
        storyPoints: 3,
      },
    ];

    const tasks = await Task.create(tasksData);
    console.log(`Created ${tasks.length} Tasks across sprints and backlog.`);

    // Add tasks to sprints
    const s1Tasks = tasks.filter(t => t.sprint && t.sprint.toString() === sprint1._id.toString()).map(t => t._id);
    const s2Tasks = tasks.filter(t => t.sprint && t.sprint.toString() === sprint2._id.toString()).map(t => t._id);
    await Sprint.findByIdAndUpdate(sprint1._id, { tasks: s1Tasks });
    await Sprint.findByIdAndUpdate(sprint2._id, { tasks: s2Tasks });

    // 9. Create 10+ Issues
    const issuesData = [
      {
        project: projectPulse._id,
        title: 'CORS header mismatch on localhost API calls during dev',
        description: 'Frontend requests from localhost:5173 blocked by Express CORS policy.',
        severity: 'high',
        priority: 'high',
        status: 'resolved',
        reporter: dev1._id,
        assignee: dev2._id,
        reproductionSteps: '1. Start Vite dev server on 5173\n2. Call POST /api/auth/login\n3. Inspect browser console',
        expectedResult: 'Access-Control-Allow-Origin header returned',
        actualResult: 'Blocked by CORS header missing',
        resolution: 'Added allowedOrigins whitelist in server.js',
      },
      {
        project: projectPulse._id,
        title: 'JWT Cookie not saving on Chrome cross-site request',
        description: 'SameSite=strict setting prevents cookie transmission on dev ports.',
        severity: 'critical',
        priority: 'critical',
        status: 'resolved',
        reporter: dev1._id,
        assignee: dev2._id,
        reproductionSteps: 'Login via frontend, then refresh page',
        expectedResult: 'Cookie retained in browser',
        actualResult: 'Cookie cleared on refresh',
        resolution: 'Attached Bearer header fallback alongside cookies',
      },
      {
        project: projectPulse._id,
        title: 'Kanban board card glitch on quick drag between columns',
        description: 'Rapid drag triggers temporary duplicate card render before API response.',
        severity: 'medium',
        priority: 'medium',
        status: 'in-progress',
        reporter: pm._id,
        assignee: dev1._id,
        reproductionSteps: 'Drag task card twice rapidly between TODO and IN PROGRESS',
        expectedResult: 'Optimistic UI replaces card cleanly',
        actualResult: 'Card blinks twice',
      },
      {
        project: projectPulse._id,
        title: 'Milestone progress percentage calculation off by 5%',
        description: 'Progress bar rounds down integer division incorrectly.',
        severity: 'low',
        priority: 'low',
        status: 'open',
        reporter: stakeholder._id,
        assignee: lead._id,
        reproductionSteps: 'Complete 1 out of 3 tasks in milestone',
        expectedResult: '33.3% displayed',
        actualResult: '30% displayed',
      },
      {
        project: projectPulse._id,
        title: 'Multer upload fails when file extension is uppercase .PNG',
        description: 'Regex test in uploadMiddleware was case-sensitive.',
        severity: 'medium',
        priority: 'medium',
        status: 'closed',
        reporter: dev1._id,
        assignee: dev2._id,
        reproductionSteps: 'Upload screenshot.PNG in task attachment modal',
        expectedResult: 'File uploaded',
        actualResult: 'Invalid file type error',
        resolution: 'Added /i flag to file extension check regex',
      },
      {
        project: projectPulse._id,
        title: 'Stakeholder can see edit button on project settings',
        description: 'Frontend component RoleGuard check missing on project header button.',
        severity: 'high',
        priority: 'high',
        status: 'in-progress',
        reporter: stakeholder._id,
        assignee: dev1._id,
        reproductionSteps: 'Log in as stakeholder@technova.com and visit project overview',
        expectedResult: 'Edit button hidden',
        actualResult: 'Edit button visible (though backend rejects API call)',
      },
      {
        project: projectPulse._id,
        title: 'Story points summation NaN on unassigned task creation',
        description: 'When story points input is left blank, backend saves null instead of default 1.',
        severity: 'medium',
        priority: 'low',
        status: 'resolved',
        reporter: lead._id,
        assignee: dev2._id,
        resolution: 'Added default 1 in Mongoose schema',
      },
      {
        project: projectPulse._id,
        title: 'Sprint Complete modal does not move unfinished tasks to backlog',
        description: 'Sprint complete endpoint failed to clear sprint field on incomplete tasks.',
        severity: 'critical',
        priority: 'high',
        status: 'resolved',
        reporter: pm._id,
        assignee: dev2._id,
        resolution: 'Added Task.updateMany({ sprint: sprintId, status: { $ne: "done" } }, { sprint: null })',
      },
      {
        project: projectPulse._id,
        title: 'Notification badge count does not auto-update without page reload',
        description: 'Need reactive state refresh in Auth/Notification context.',
        severity: 'low',
        priority: 'medium',
        status: 'open',
        reporter: dev1._id,
        assignee: dev1._id,
      },
      {
        project: projectPulse._id,
        title: 'Task dependency dropdown allows selecting the task itself',
        description: 'Self-referential dependency check missing on task form.',
        severity: 'medium',
        priority: 'high',
        status: 'resolved',
        reporter: lead._id,
        assignee: dev2._id,
        resolution: 'Added backend validation in task update controller to reject self-dependency',
      },
    ];

    const issues = await Issue.create(issuesData);
    console.log(`Created ${issues.length} Issues.`);

    // 10. Create Comments
    await Comment.create([
      {
        author: pm._id,
        content: '@Rahul please review the project setup and RBAC roles before demo.',
        entityType: 'Task',
        entityId: tasks[3]._id, // Kanban task
      },
      {
        author: dev1._id,
        content: 'Working on drag-and-drop Optimistic UI update now!',
        entityType: 'Task',
        entityId: tasks[3]._id,
      },
      {
        author: lead._id,
        content: 'I have tested the CORS fix and it resolves the Chrome cross-site cookie error.',
        entityType: 'Issue',
        entityId: issues[0]._id,
      },
      {
        author: stakeholder._id,
        content: 'The milestone timeline looks great! Please keep the sprint velocity report updated.',
        entityType: 'Project',
        entityId: projectPulse._id,
      },
    ]);

    // 11. Create Activity Logs
    await Activity.create([
      {
        organization: org._id,
        project: projectPulse._id,
        user: admin._id,
        action: 'PROJECT_CREATED',
        entityType: 'Project',
        entityId: projectPulse._id,
        description: 'Rahul Sharma created project "ProjectPulse Suite" [PULSE]',
      },
      {
        organization: org._id,
        project: projectPulse._id,
        user: pm._id,
        action: 'SPRINT_STARTED',
        entityType: 'Sprint',
        entityId: sprint2._id,
        description: 'Anjali Verma started sprint "Sprint 2 - Kanban Board & Backlog"',
      },
      {
        organization: org._id,
        project: projectPulse._id,
        user: dev2._id,
        action: 'TASK_STATUS_CHANGED',
        entityType: 'Task',
        entityId: tasks[1]._id,
        description: 'Siddharth Rao moved "Implement JWT Auth Controller" from IN PROGRESS to DONE',
      },
      {
        organization: org._id,
        project: projectPulse._id,
        user: dev1._id,
        action: 'ISSUE_CREATED',
        entityType: 'Issue',
        entityId: issues[2]._id,
        description: 'Siddharth Rao reported issue "Kanban board card glitch on quick drag"',
      },
    ]);

    // 12. Create Notifications
    await Notification.create([
      {
        user: dev1._id,
        message: 'Anjali Verma assigned task "Build Drag and Drop Kanban Board View" to you',
        type: 'task_assigned',
        relatedEntity: { entityType: 'Task', entityId: tasks[3]._id },
        read: false,
      },
      {
        user: admin._id,
        message: 'Anjali Verma mentioned you in a comment on Task',
        type: 'mention',
        relatedEntity: { entityType: 'Task', entityId: tasks[3]._id },
        read: false,
      },
      {
        user: dev2._id,
        message: 'You were assigned issue "CORS header mismatch on localhost API calls"',
        type: 'issue_assigned',
        relatedEntity: { entityType: 'Issue', entityId: issues[0]._id },
        read: true,
      },
    ]);

    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDB();
