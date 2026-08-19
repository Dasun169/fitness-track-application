const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const WorkoutSet = require('../models/WorkoutSet');
const Exercise = require('../models/Exercise');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding Gym Activity Tracker Database...');

    // Clear existing data
    await User.deleteMany({});
    await WorkoutSet.deleteMany({});
    await Exercise.deleteMany({});

    console.log('Existing collections cleared.');

    // Default password for seeded users
    const defaultPassword = 'Password123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Create Predefined Users
    const users = await User.create([
      {
        username: 'dasun_navindu',
        passwordHash,
      },
      {
        username: 'gayan_maduranga',
        passwordHash,
      },
    ]);

    console.log('Predefined Users Created:');
    users.forEach((u) => console.log(`  - Username: ${u.username} | Password: ${defaultPassword}`));

    const dasun = users[0];
    const gayan = users[1];

    // 2. Create Workout Sets for dasun_navindu
    const dasunSets = await WorkoutSet.create([
      {
        userId: dasun._id,
        month: 1,
        year: 2024,
        name: 'January 2024 Strength Build',
      },
      {
        userId: dasun._id,
        month: 2,
        year: 2024,
        name: 'February 2024 Hypertrophy',
      },
      {
        userId: dasun._id,
        month: 3,
        year: 2024,
        name: 'March 2024 Peak Performance',
      },
    ]);

    // Exercises for dasun_navindu
    await Exercise.create([
      // Jan 2024
      { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 70, date: new Date('2024-01-05') },
      { workoutSetId: dasunSets[0]._id, name: 'Squat', weight: 90, date: new Date('2024-01-07') },
      { workoutSetId: dasunSets[0]._id, name: 'Deadlift', weight: 110, date: new Date('2024-01-10') },
      { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 72.5, date: new Date('2024-01-15') },
      { workoutSetId: dasunSets[0]._id, name: 'Barbell Curl', weight: 30, date: new Date('2024-01-18') },
      { workoutSetId: dasunSets[0]._id, name: 'Bench Press', weight: 75, date: new Date('2024-01-25') },

      // Feb 2024
      { workoutSetId: dasunSets[1]._id, name: 'Bench Press', weight: 77.5, date: new Date('2024-02-04') },
      { workoutSetId: dasunSets[1]._id, name: 'Squat', weight: 95, date: new Date('2024-02-08') },
      { workoutSetId: dasunSets[1]._id, name: 'Deadlift', weight: 115, date: new Date('2024-02-12') },
      { workoutSetId: dasunSets[1]._id, name: 'Bench Press', weight: 80, date: new Date('2024-02-18') },
      { workoutSetId: dasunSets[1]._id, name: 'Barbell Curl', weight: 32.5, date: new Date('2024-02-22') },

      // Mar 2024
      { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 82.5, date: new Date('2024-03-03') },
      { workoutSetId: dasunSets[2]._id, name: 'Squat', weight: 100, date: new Date('2024-03-10') },
      { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 85, date: new Date('2024-03-15') },
      { workoutSetId: dasunSets[2]._id, name: 'Overhead Press', weight: 55, date: new Date('2024-03-20') },
      { workoutSetId: dasunSets[2]._id, name: 'Bench Press', weight: 87.5, date: new Date('2024-03-28') },
    ]);

    // 3. Create Workout Sets for gayan_maduranga
    const gayanSets = await WorkoutSet.create([
      {
        userId: gayan._id,
        month: 2,
        year: 2024,
        name: 'February 2024 Powerlifting',
      },
      {
        userId: gayan._id,
        month: 3,
        year: 2024,
        name: 'March 2024 Conditioning',
      },
    ]);

    // Exercises for gayan_maduranga
    await Exercise.create([
      { workoutSetId: gayanSets[0]._id, name: 'Squat', weight: 105, date: new Date('2024-02-05') },
      { workoutSetId: gayanSets[0]._id, name: 'Bench Press', weight: 85, date: new Date('2024-02-10') },
      { workoutSetId: gayanSets[0]._id, name: 'Squat', weight: 110, date: new Date('2024-02-20') },
      
      { workoutSetId: gayanSets[1]._id, name: 'Squat', weight: 115, date: new Date('2024-03-05') },
      { workoutSetId: gayanSets[1]._id, name: 'Bench Press', weight: 90, date: new Date('2024-03-12') },
      { workoutSetId: gayanSets[1]._id, name: 'Squat', weight: 120, date: new Date('2024-03-25') },
    ]);

    console.log('Sample Workout Sets & Exercises seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
