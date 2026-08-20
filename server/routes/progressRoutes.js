const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const WorkoutSet = require('../models/WorkoutSet');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

// Apply protection to progress routes
router.use(protect);

// @route   GET /api/progress/exercises
// @desc    Get distinct exercise names for shared workout sets
// @access  Protected
router.get('/exercises', async (req, res) => {
  try {
    const userSets = await WorkoutSet.find({}).select('_id');
    const setIds = userSets.map((set) => set._id);

    const exerciseNames = await Exercise.distinct('name', {
      workoutSetId: { $in: setIds },
    });

    res.json(exerciseNames.sort());
  } catch (error) {
    console.error('Error fetching exercise list for progress:', error);
    res.status(500).json({ message: 'Failed to fetch exercise list' });
  }
});

// @route   GET /api/progress/bar-chart
// @desc    Get exercise average weight comparison data per workout set for side-by-side bar chart
// @access  Protected
router.get('/bar-chart', async (req, res) => {
  try {
    const { workoutSetId } = req.query;

    let exQuery = {};
    if (workoutSetId) {
      exQuery.workoutSetId = workoutSetId;
    } else {
      const userSets = await WorkoutSet.find({}).select('_id');
      const setIds = userSets.map((set) => set._id);
      exQuery.workoutSetId = { $in: setIds };
    }

    // Fetch exercises in these workout sets populated with user info
    const exercises = await Exercise.find(exQuery).populate('userId', 'username');

    // Group by exercise name and username
    const statsMap = new Map();

    exercises.forEach((ex) => {
      if (!ex.name) return;
      const nameKey = ex.name.trim();

      let username = ex.userId && ex.userId.username ? ex.userId.username : null;
      if (!username && req.user) {
        username = req.user.username;
      }

      if (!statsMap.has(nameKey)) {
        statsMap.set(nameKey, {
          dasun_navindu: { sum: 0, count: 0 },
          gayan_maduranga: { sum: 0, count: 0 },
        });
      }

      const userStats = statsMap.get(nameKey);
      if (username) {
        if (!userStats[username]) {
          userStats[username] = { sum: 0, count: 0 };
        }

        const w = Number(ex.weight) || 0;
        if (w > 0) {
          userStats[username].sum += w;
          userStats[username].count += 1;
        }
      }
    });

    const barData = Array.from(statsMap.entries()).map(([nameKey, userStats]) => {
      const dasunData = userStats['dasun_navindu'];
      const gayanData = userStats['gayan_maduranga'];

      // Preserve exact floating-point precision up to 2 decimal places
      const dasunAvg = dasunData && dasunData.count > 0 ? +(dasunData.sum / dasunData.count).toFixed(2) : 0;
      const gayanAvg = gayanData && gayanData.count > 0 ? +(gayanData.sum / gayanData.count).toFixed(2) : 0;

      return {
        exerciseName: nameKey,
        dasun_navindu: dasunAvg,
        gayan_maduranga: gayanAvg,
      };
    }).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

    res.json(barData);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ message: 'Failed to fetch bar chart comparison data' });
  }
});

// @route   GET /api/progress/:exerciseName
// @desc    Get progress history for an exercise with user comparison and date range filtering
// @access  Protected
router.get('/:exerciseName', async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const { workoutSetId, startDate, endDate } = req.query;

    let setQuery = {};
    if (workoutSetId) {
      setQuery._id = workoutSetId;
    }

    const userSets = await WorkoutSet.find(setQuery).select('_id name');
    const setMap = new Map();
    const setIds = userSets.map((set) => {
      setMap.set(set._id.toString(), set.name);
      return set._id;
    });

    // Build exercise query
    let exQuery = {
      workoutSetId: { $in: setIds },
      name: { $regex: new RegExp(`^${exerciseName.trim()}$`, 'i') },
    };

    if (startDate || endDate) {
      exQuery.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        exQuery.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        exQuery.date.$lte = end;
      }
    }

    // Fetch exercises populated with user info
    const exercises = await Exercise.find(exQuery)
      .populate('userId', 'username')
      .sort({ date: 1 });

    // Pivot data by date to merge performance of both users into single points for comparison
    const dateMap = new Map();

    exercises.forEach((ex) => {
      const dateStr = new Date(ex.date).toISOString().split('T')[0];
      const username = ex.userId ? ex.userId.username : 'User';

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: ex.date,
          dateStr,
          workoutSetName: setMap.get(ex.workoutSetId.toString()) || 'Workout Set',
        });
      }

      const entry = dateMap.get(dateStr);
      entry[username] = ex.weight;
    });

    const progressData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Compute min and max dates in dataset
    let minDate = '';
    let maxDate = '';
    if (progressData.length > 0) {
      minDate = progressData[0].dateStr;
      maxDate = progressData[progressData.length - 1].dateStr;
    }

    res.json({
      progressData,
      minDate,
      maxDate,
    });
  } catch (error) {
    console.error('Error fetching progress comparison data:', error);
    res.status(500).json({ message: 'Failed to fetch exercise progress data' });
  }
});

module.exports = router;
