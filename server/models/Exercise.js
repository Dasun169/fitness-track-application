const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    workoutSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSet',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [0, 'Weight must be non-negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for progress lookups by user, exercise name, and date
exerciseSchema.index({ userId: 1, name: 1, date: 1 });
exerciseSchema.index({ workoutSetId: 1, name: 1, date: 1 });

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
