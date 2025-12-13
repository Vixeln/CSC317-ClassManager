/**
 * Schedule Controller
 * Handles the user's personal schedule actions
 */
//const ClassModel = require('../models/Class');

const Section = require('../models/Section');
const { query } = require('../config/database');
const Registration = require('../models/Registration');
const Term = require('../models/Term'); 


//BEGIN NEW HELPER FUNCTIONS 
const getMeetingsForSection = async (sectionId) => {
  const sql = `
    SELECT day, start_time, end_time, location
    FROM meetings
    WHERE section_id = $1
  `;
  const result = await query(sql, [sectionId]);
  return result.rows;
};

const findTimeConflict = (existingMeetings, newMeetings) => {
  for (const n of newMeetings) {
    for (const e of existingMeetings) {
      if (n.day !== e.day) continue;
      if (n.start_time < e.end_time && n.end_time > e.start_time) {
        return { conflict: true, existing: e, incoming: n };
      }
    }
  }
  return { conflict: false };
};
// HELPERS for classes-based schedule generation
//  normalize Postgres text[] (days_of_week) into a JS array
function normalizeDays(days) {
  if (!days) return [];
  if (Array.isArray(days)) return days;
  if (typeof days === 'string') {
    return days
      .replace(/[{}]/g, '') // remove { }
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
// convert "HH:MM:SS" → minutes since midnight
function timeToMinutes(t) {
  if (!t) return null;
  const [h, m, s] = t.split(':').map(Number);
  return h * 60 + m;
}

//check if two CLASS ROWS from `classes` conflict
function classConflict(a, b) {
  const daysA = normalizeDays(a.days_of_week);
  const daysB = normalizeDays(b.days_of_week);

  const daySet = new Set(daysA);
  const sharedDay = daysB.some((d) => daySet.has(d));
  if (!sharedDay) return false;

  const aStart = timeToMinutes(a.start_time);
  const aEnd   = timeToMinutes(a.end_time);
  const bStart = timeToMinutes(b.start_time);
  const bEnd   = timeToMinutes(b.end_time);

  if (aStart == null || aEnd == null || bStart == null || bEnd == null) {
    return false;
  }

  // Overlap if NOT (one ends before the other starts)
  return !(aEnd <= bStart || bEnd <= aStart);
}
 
// load classes (with course info) for a set of course IDs
async function getClassesForCourses(courseIds = []) {
  let sql = `
    SELECT 
      c.id AS class_id,
      c.meeting_location,
      c.start_time,
      c.end_time,
      c.days_of_week,
      c.max_seat,
      c.available_seat,
      c.max_wait_list,
      c.available_wait_list,
      co.id      AS course_id,
      co.subject,
      co.number,
      co.credit
    FROM classes c
    JOIN courses co ON c.course_id = co.id
  `;

  const params = [];

  if (Array.isArray(courseIds) && courseIds.length > 0) {
    const placeholders = courseIds.map((_, i) => `$${i + 1}`).join(', ');
    sql += ` WHERE co.id IN (${placeholders})`;
    params.push(...courseIds);
  }

  sql += ` ORDER BY co.subject, co.number, c.start_time`;

  const result = await query(sql, params);
  return result.rows;
}



// View
exports.getSchedulePage = (req, res) => {
  res.render('schedule/index', { 
    title: 'My Schedule',
    user: req.session.user
  });
};

// API: Get My Classes
exports.getMyClasses = async (req, res) => {
  try {
    const classes = await Registration.getSchedule(req.session.user.id);
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  addClass ENDPOINT

// API: Save (Clear + Add New)
exports.addToSchedule = async (req, res) => {
  try {
    const userId = req.session.user.id;
    let { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({ success: false, message: "Missing sectionId" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }

    const hasSeats = await Section.hasSpace(sectionId);
    if (!hasSeats) {
      return res.status(400).json({ success: false, message: "Section is full" });
    }

    const existing = await Registration.getSchedule(userId);
    const existingMeetings = existing.map(m => ({
      day: m.day,
      start_time: m.start_time,
      end_time: m.end_time,
      location: m.location,
      code: m.code
    }));

    const newMeetingsRaw = await getMeetingsForSection(sectionId);
    const newMeetings = newMeetingsRaw.map(m => ({
      day: m.day,
      start_time: m.start_time,
      end_time: m.end_time,
      location: m.location
    }));

    const conflict = findTimeConflict(existingMeetings, newMeetings);
    if (conflict.conflict) {
      return res.status(400).json({
        success: false,
        message: `Time conflict with ${conflict.existing.code} on ${conflict.existing.day}.`
      });
    }

    await Registration.add(userId, sectionId);
    res.json({ success: true, message: "Class added." });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// API: Generate non-conflicting schedule options from selected courses
// POST /schedule/api/generate
//
// Expected body:
//   {
//     courseCodes: ["CSC317", "MATH221", "ENG110"],
//     termId: 1            // optional, will use active term if not provided
//   }
exports.generateSchedules = async (req, res) => {
  try {
    const userId = req.session.user?.id; // unused now, but available if needed
    const { courseIds } = req.body || {};

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'courseIds must be a non-empty array of numeric IDs (e.g., [1,2,3]).'
      });
    }

    //  convert to numbers safely
    const numericIds = courseIds
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));

    // now using correct class loader
    const classes = await getClassesForCourses(numericIds);

    if (!classes || classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No classes found for the selected courses.'
      });
    }

    // properly group by course_id
    const byCourse = new Map();
    for (const row of classes) {
      if (!byCourse.has(row.course_id)) {
        byCourse.set(row.course_id, []);
      }
      byCourse.get(row.course_id).push(row);
    }

    // correctly detect missing input courseIds
    const foundCourseIds = new Set([...byCourse.keys()]);
    const missingCourses = numericIds.filter((id) => !foundCourseIds.has(id));

    // generate list of course IDs (not sections!)
    const courseIdList = [...byCourse.keys()];

    //  sort courses with fewest options first
    courseIdList.sort((a, b) => byCourse.get(a).length - byCourse.get(b).length);

    const MAX_SCHEDULES = 20;
    const schedules = [];

    // rewritten backtracking using CLASS CONFLICT logic
    function backtrack(idx, chosen) {
      if (schedules.length >= MAX_SCHEDULES) return;

      //  stopping condition uses courseIdList.length (NOT courseData)
      if (idx === courseIdList.length) {
        schedules.push([...chosen]);
        return;
      }

      const courseId = courseIdList[idx];
      const options = byCourse.get(courseId) || [];

      for (const candidate of options) {
        let ok = true;

        // use classConflict() instead of findTimeConflict()
        for (const already of chosen) {
          if (classConflict(candidate, already)) {
            ok = false;
            break;
          }
        }

        if (!ok) continue;

        chosen.push(candidate);
        backtrack(idx + 1, chosen);
        chosen.pop();
      }
    }

    // correct starting call
    backtrack(0, []);

    if (schedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No conflict-free schedules found for the selected courses.',
        schedules: [],
        missingCourses
      });
    }

    //  final response
    res.json({
      success: true,
      message: 'Generated schedule options.',
      schedules,
      missingCourses,
      truncated: schedules.length >= MAX_SCHEDULES
    });

  } catch (err) {
    console.error('Error generating schedules:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate schedules.',
      error: err.message
    });
  }
};

exports.saveSchedule = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { sectionIds } = req.body; 

    await Registration.clearAll(userId); // Clear old
    
    if (sectionIds && sectionIds.length > 0) {
        for (const id of sectionIds) {
        await Registration.add(userId, id); // Add new
        }
    }

    res.json({ success: true, message: 'Saved!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// API: Clear
exports.clearSchedule = async (req, res) => {
  try {
    await Registration.clearAll(req.session.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};