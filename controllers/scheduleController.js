/**
 * Schedule Controller
 * Handles the user's personal schedule actions
 */
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
// Load all sections (with meetings) for a list of course codes in a given term
const getSectionsForCourses = async (courseCodes, termId) => {
  const sql = `
    SELECT 
      c.code,
      s.id AS section_id,
      s.instructor,
      m.day,
      m.start_time,
      m.end_time,
      m.location
    FROM courses c
    JOIN sections s ON c.id = s.course_id
    LEFT JOIN meetings m ON s.id = m.section_id
    WHERE c.code = ANY($1)
      AND ($2::INT IS NULL OR s.term_id = $2)
    ORDER BY c.code, s.id, m.day, m.start_time
  `;

  const result = await query(sql, [courseCodes, termId || null]);
  const rows = result.rows;

  // Group by course code and section
  const courseMap = new Map();

  for (const row of rows) {
    if (!courseMap.has(row.code)) {
      courseMap.set(row.code, {
        courseCode: row.code,
        sections: []
      });
    }
    const course = courseMap.get(row.code);

    let section = course.sections.find(sec => sec.sectionId === row.section_id);
    if (!section) {
      section = {
        sectionId: row.section_id,
        instructor: row.instructor,
        meetings: []
      };
      course.sections.push(section);
    }

    if (row.day) {
      section.meetings.push({
        day: row.day,
        start_time: row.start_time,
        end_time: row.end_time,
        location: row.location
      });
    }
  }

  return Array.from(courseMap.values());
};


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
    const userId = req.session.user.id; // unused now, but available if needed
    let { courseCodes, termId } = req.body;

    // Basic validation
    if (!Array.isArray(courseCodes) || courseCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'courseCodes must be a non-empty array (e.g., ["CSC317", "MATH221"]).'
      });
    }

    // If termId not provided, use the active term
    if (!termId) {
      const active = await Term.findActive();
      if (!active) {
        return res.status(400).json({
          success: false,
          message: 'No active term found and no termId provided.'
        });
      }
      termId = active.id;
    }

    // Load sections for given course codes
    const courseData = await getSectionsForCourses(courseCodes, termId);

    // Figure out which requested codes had no sections
    const foundCodes = new Set(courseData.map(c => c.courseCode));
    const missing = courseCodes.filter(code => !foundCodes.has(code));

    if (courseData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sections found for the selected courses in this term.',
        missingCourses: missing
      });
    }

    // Sort courses by number of sections (optimization: fewer branches first)
    courseData.sort((a, b) => a.sections.length - b.sections.length);

    const MAX_SCHEDULES = 20;
    const schedules = [];

    const backtrack = (courseIndex, chosenSections, chosenMeetings) => {
      if (schedules.length >= MAX_SCHEDULES) return; // limit results

      if (courseIndex === courseData.length) {
        // We picked one section per course, no conflicts
        schedules.push([...chosenSections]);
        return;
      }

      const course = courseData[courseIndex];

      // If this course has no sections, skip it
      if (!course.sections || course.sections.length === 0) {
        backtrack(courseIndex + 1, chosenSections, chosenMeetings);
        return;
      }

      for (const section of course.sections) {
        const conflictInfo = findTimeConflict(chosenMeetings, section.meetings);
        if (conflictInfo.conflict) {
          continue; // skip conflicting section
        }

        backtrack(
          courseIndex + 1,
          [
            ...chosenSections,
            {
              courseCode: course.courseCode,
              sectionId: section.sectionId,
              instructor: section.instructor,
              meetings: section.meetings
            }
          ],
          [...chosenMeetings, ...section.meetings]
        );
      }
    };

    backtrack(0, [], []);

    if (schedules.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No conflict-free schedules found for the selected courses.',
        schedules: [],
        missingCourses: missing
      });
    }

    res.json({
      success: true,
      message: 'Generated schedule options.',
      schedules,
      missingCourses: missing,
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