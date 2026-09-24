const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Organization = require('../models/Organization');

describe('Project & Organization API Endpoints', () => {
  let token;
  let user;
  let org;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    user = await User.findOne({ email: 'admin@technova.com' });
    if (!user) {
      user = await User.create({
        name: 'Test Admin',
        email: 'admin@technova.com',
        password: 'password123',
      });
    }

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@technova.com', password: 'password123' });

    token = loginRes.body.data.token;
    org = await Organization.findOne({ name: 'TechNova Solutions' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fetch user organizations', async () => {
    const res = await request(app)
      .get('/api/organizations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch project list for authorized user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
