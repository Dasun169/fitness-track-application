const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const WorkoutSet = require('../models/WorkoutSet');
const Exercise = require('../models/Exercise');

// Apply protection to all workout routes
router.use(protect);

// @route   GET /api/workouts
// @desc    Get all shared workout sets for authorized users
// @access  Protected
router.get('/', async (req, res) => {
  try {
    // Shared workout sets across predefined users
    const workoutSets = await WorkoutSet.find({})
      .populate('userId', 'username')
      .sort({ year: -1, month: -1, createdAt: -1 });
    res.json(workoutSets);
  } catch (error) {
    console.error('Error fetching workout sets:', error);
    res.status(500).json({ message: 'Failed to fetch workout sets' });
  }
});

// @route   POST /api/workouts
// @desc    Create new shared workout set
// @access  Protected
router.post('/', async (req, res) => {
  try {
    const { month, year, name } = req.body;

    if (!month || !year || !name) {
      return res.status(400).json({ message: 'Month, year, and name are required' });
    }

    // Check if workout set already exists for this month & year
    let workoutSet = await WorkoutSet.findOne({
      month: Number(month),
      year: Number(year),
    });

    if (!workoutSet) {
      workoutSet = new WorkoutSet({
        userId: req.user._id,
        month: Number(month),
        year: Number(year),
        name: name.trim(),
      });
      workoutSet = await workoutSet.save();
    }

    res.status(201).json(workoutSet);
  } catch (error) {
    console.error('Error creating workout set:', error);
    res.status(500).json({ message: 'Failed to create workout set' });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete a workout set and associated exercises
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    // Delete associated exercises
    await Exercise.deleteMany({ workoutSetId: workoutSet._id });
    await workoutSet.deleteOne();

    res.json({ message: 'Workout set and exercises deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout set:', error);
    res.status(500).json({ message: 'Failed to delete workout set' });
  }
});

// @route   GET /api/workouts/:id/exercises
// @desc    Get exercise matrix grid for a shared workout set with per-user weight values
// @access  Protected
router.get('/:id/exercises', async (req, res) => {
  try {
    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    // All exercises in this workout set across all users (to extract shared rows & dates)
    const allExercises = await Exercise.find({ workoutSetId: workoutSet._id })
      .sort({ date: 1, createdAt: 1 });

    // Pivot ALL exercises to get shared master list of dates & exercise names
    const datesSet = new Set();
    const namesSet = new Set();

    allExercises.forEach((ex) => {
      const dateStr = new Date(ex.date).toISOString().split('T')[0];
      datesSet.add(dateStr);
      namesSet.add(ex.name);
    });

    // Extract current logged-in user's weights for matrix cells
    const userExercises = allExercises.filter(
      (ex) => ex.userId && ex.userId.toString() === req.user._id.toString()
    );

    const matrix = {};
    userExercises.forEach((ex) => {
      const dateStr = new Date(ex.date).toISOString().split('T')[0];
      if (!matrix[ex.name]) {
        matrix[ex.name] = {};
      }
      matrix[ex.name][dateStr] = {
        id: ex._id,
        weight: ex.weight,
        date: ex.date,
      };
    });

    const dates = Array.from(datesSet).sort();
    const exerciseNames = Array.from(namesSet).sort();

    res.json({
      workoutSet,
      exercises: userExercises,
      dates,
      exerciseNames,
      matrix,
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Failed to fetch exercises' });
  }
});

// @route   POST /api/workouts/:id/matrix-batch
// @desc    Batch save/update user's exercise matrix weights
// @access  Protected
router.post('/:id/matrix-batch', async (req, res) => {
  try {
    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    const { updates } = req.body; // Array of { name, date, weight }

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Invalid updates payload' });
    }

    const savePromises = updates.map(async (item) => {
      if (!item.name || !item.date || item.weight === undefined || item.weight === null || item.weight === '') {
        return;
      }

      const dateObj = new Date(item.date);
      // Look for existing record matching workoutSetId, name, and date
      const startOfDay = new Date(dateObj);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(dateObj);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Find exercise matching workoutSetId, current userId, name, and date
      const existing = await Exercise.findOne({
        workoutSetId: workoutSet._id,
        userId: req.user._id,
        name: item.name.trim(),
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existing) {
        existing.weight = Number(item.weight);
        return existing.save();
      } else {
        const newExercise = new Exercise({
          workoutSetId: workoutSet._id,
          userId: req.user._id,
          name: item.name.trim(),
          weight: Number(item.weight),
          date: dateObj,
        });
        return newExercise.save();
      }
    });

    await Promise.all(savePromises);
    res.json({ message: 'Matrix batch saved successfully' });
  } catch (error) {
    console.error('Error saving matrix batch:', error);
    res.status(500).json({ message: 'Failed to save matrix grid updates' });
  }
});

// @route   DELETE /api/workouts/:id/date/:dateStr
// @desc    Delete all exercise logs for a specific date column in a workout set
// @access  Protected
router.delete('/:id/date/:dateStr', async (req, res) => {
  try {
    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    const dateObj = new Date(req.params.dateStr);
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);

    await Exercise.deleteMany({
      workoutSetId: workoutSet._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({ message: 'Date column deleted successfully' });
  } catch (error) {
    console.error('Error deleting date column:', error);
    res.status(500).json({ message: 'Failed to delete date column' });
  }
});

// @route   DELETE /api/workouts/:id/exercise-name/:name
// @desc    Delete all logs for a specific exercise row in a workout set
// @access  Protected
router.delete('/:id/exercise-name/:name', async (req, res) => {
  try {
    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    const exerciseName = decodeURIComponent(req.params.name);

    await Exercise.deleteMany({
      workoutSetId: workoutSet._id,
      name: { $regex: new RegExp(`^${exerciseName.trim()}$`, 'i') },
    });

    res.json({ message: 'Exercise row deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise row:', error);
    res.status(500).json({ message: 'Failed to delete exercise row' });
  }
});


// @route   POST /api/workouts/:id/exercises
// @desc    Add exercise to workout set
// @access  Protected
router.post('/:id/exercises', async (req, res) => {
  try {
    const { name, weight, date } = req.body;

    if (!name || weight === undefined || weight === null) {
      return res.status(400).json({ message: 'Exercise name and weight are required' });
    }

    const workoutSet = await WorkoutSet.findById(req.params.id);

    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }

    const exercise = new Exercise({
      workoutSetId: workoutSet._id,
      userId: req.user._id,
      name: name.trim(),
      weight: Number(weight),
      date: date ? new Date(date) : new Date(),
    });

    const savedExercise = await exercise.save();
    res.status(201).json(savedExercise);
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ message: 'Failed to add exercise' });
  }
});

// @route   PUT /api/workouts/exercises/:id
// @desc    Update exercise weight, date, or name
// @access  Protected
router.put('/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Verify ownership via WorkoutSet
    const workoutSet = await WorkoutSet.findOne({
      _id: exercise.workoutSetId,
      userId: req.user._id,
    });

    if (!workoutSet) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.body.name !== undefined) exercise.name = req.body.name.trim();
    if (req.body.weight !== undefined) exercise.weight = Number(req.body.weight);
    if (req.body.date !== undefined) exercise.date = new Date(req.body.date);

    const updatedExercise = await exercise.save();
    res.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ message: 'Failed to update exercise' });
  }
});

// @route   DELETE /api/workouts/exercises/:id
// @desc    Delete exercise
// @access  Protected
router.delete('/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Verify ownership via WorkoutSet
    const workoutSet = await WorkoutSet.findOne({
      _id: exercise.workoutSetId,
      userId: req.user._id,
    });

    if (!workoutSet) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await exercise.deleteOne();
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Failed to delete exercise' });
  }
});

module.exports = router;

