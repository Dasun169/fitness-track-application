const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

// Route Aliases
app.use('/auth', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/users', userRoutes);
app.use('/progress', progressRoutes);


// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Gym Activity Tracker API',
    version: '1.0.0',
    users: ['dasun_navindu', 'gayan_maduranga'],
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Running auto-seed...');
      const WorkoutSet = require('./models/WorkoutSet');
      const Exercise = require('./models/Exercise');

      const defaultPassword = 'Password123';
      const passwordHash = await User.hashPassword(defaultPassword);

      const users = await User.create([
        { username: 'dasun_navindu', passwordHash },
        { username: 'gayan_maduranga', passwordHash },
      ]);

      const dasun = users[0];
      const gayan = users[1];

      const dasunSets = await WorkoutSet.create([
        { userId: dasun._id, month: 1, year: 2024, name: 'January 2024 Strength Training' },
        { userId: dasun._id, month: 2, year: 2024, name: 'February 2024 Hypertrophy' },
        { userId: dasun._id, month: 3, year: 2024, name: 'March 2024 Peak Performance' },
      ]);

      await Exercise.create([
        { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 70, date: new Date('2024-01-05') },
        { workoutSetId: dasunSets[0]._id, name: 'Squat', weight: 90, date: new Date('2024-01-07') },
        { workoutSetId: dasunSets[0]._id, name: 'Deadlift', weight: 110, date: new Date('2024-01-10') },
        { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 72.5, date: new Date('2024-01-15') },
        { workoutSetId: dasunSets[0]._id, name: 'Barbell Curl', weight: 30, date: new Date('2024-01-18') },
        { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 75, date: new Date('2024-01-25') },

        { workoutSetId: dasunSets[1]._id, name: 'Bench Press', weight: 77.5, date: new Date('2024-02-04') },
        { workoutSetId: dasunSets[1]._id, name: 'Squat', weight: 95, date: new Date('2024-02-08') },
        { workoutSetId: dasunSets[1]._id, name: 'Deadlift', weight: 115, date: new Date('2024-02-12') },
        { workoutSetId: dasunSets[1]._id, name: 'Bench Press', weight: 80, date: new Date('2024-02-18') },
        { workoutSetId: dasunSets[1]._id, name: 'Barbell Curl', weight: 32.5, date: new Date('2024-02-22') },

        { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 82.5, date: new Date('2024-03-03') },
        { workoutSetId: dasunSets[2]._id, name: 'Squat', weight: 100, date: new Date('2024-03-10') },
        { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 85, date: new Date('2024-03-15') },
        { workoutSetId: dasunSets[2]._id, name: 'Overhead Press', weight: 55, date: new Date('2024-03-20') },
        { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 87.5, date: new Date('2024-03-28') },
      ]);

      const gayanSets = await WorkoutSet.create([
        { userId: gayan._id, month: 2, year: 2024, name: 'February 2024 Powerlifting' },
        { userId: gayan._id, month: 3, year: 2024, name: 'March 2024 Conditioning' },
      ]);

      await Exercise.create([
        { workoutSetId: gayanSets[0]._id, name: 'Squat', weight: 105, date: new Date('2024-02-05') },
        { workoutSetId: gayanSets[0]._id, name: 'Bench Press', weight: 85, date: new Date('2024-02-10') },
        { workoutSetId: gayanSets[0]._id, name: 'Squat', weight: 110, date: new Date('2024-02-20') },

        { workoutSetId: gayanSets[1]._id, name: 'Squat', weight: 115, date: new Date('2024-03-05') },
        { workoutSetId: gayanSets[1]._id, name: 'Bench Press', weight: 90, date: new Date('2024-03-12') },
        { workoutSetId: gayanSets[1]._id, name: 'Squat', weight: 120, date: new Date('2024-03-25') },
      ]);

      console.log('Auto-seed completed for dasun_navindu and gayan_maduranga (Password123).');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
