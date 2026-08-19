const mongoose = require('mongoose');

const workoutSetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    name: {
      type: String,
      required: [true, 'Workout set name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize queries per user by year and month
workoutSetSchema.index({ userId: 1, year: -1, month: -1 });

const WorkoutSet = mongoose.model('WorkoutSet', workoutSetSchema);

module.exports = WorkoutSet;
