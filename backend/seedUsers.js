const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const demoUsers = [
  {
    name: 'Admin',
    email: 'admin@technova.com',
    password: 'password123',
    phone: '',
  },
  {
    name: 'Project Manager',
    email: 'pm@technova.com',
    password: 'password123',
    phone: '',
  },
  {
    name: 'Team Lead',
    email: 'lead@technova.com',
    password: 'password123',
    phone: '',
  },
  {
    name: 'Developer',
    email: 'dev1@technova.com',
    password: 'password123',
    phone: '',
  },
];

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('Connected to MongoDB');

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({
        email: userData.email,
      }).select('+password');

      if (existingUser) {
        // Reset password so the demo login definitely works
        existingUser.password = userData.password;
        existingUser.name = userData.name;
        existingUser.phone = userData.phone;

        await existingUser.save();

        console.log(`Updated: ${userData.email}`);
      } else {
        await User.create(userData);

        console.log(`Created: ${userData.email}`);
      }
    }

    console.log('\nDemo users are ready!');
    console.log('Password for all users: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();