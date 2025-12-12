// Get selected courses
function getSelectedCoursesFromUI() {
  const boxes = document.querySelectorAll('.course-select:checked');
  return Array.from(boxes).map(b => b.dataset.code);
}

// Call backend generator
async function callScheduleGenerator() {
  const courseCodes = getSelectedCoursesFromUI();

  if (courseCodes.length === 0) {
    alert("Please select at least one course.");
    return;
  }

  const res = await fetch('/schedule/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseCodes })
  });

  const data = await res.json();
  if (!data.success) {
    alert(data.message || "Failed to generate schedules.");
    return;
  }

  renderGeneratedSchedules(data.schedules);
}

// Show schedule options
function renderGeneratedSchedules(schedules) {
  const container = document.getElementById('generatedSchedules');
  container.innerHTML = '';

  if (!schedules || schedules.length === 0) {
    container.innerHTML = "<p>No conflict-free schedules found.</p>";
    return;
  }

  schedules.forEach((schedule, i) => {
    const div = document.createElement('div');
    div.className = "schedule-option";

    let html = `<h3>Schedule Option ${i + 1}</h3><ul>`;
    schedule.forEach(s => {
      html += `<li><strong>${s.courseCode}</strong> – Section ${s.sectionId}<br>
      ${s.meetings.map(m => `${m.day}: ${m.start_time}-${m.end_time}`).join(", ")}</li>`;
    });
    html += `</ul>
    <button class="use-schedule-btn" data-index="${i}">Use This Schedule</button>`;

    div.innerHTML = html;
    container.appendChild(div);
  });

  // Button handlers
  document.querySelectorAll('.use-schedule-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = schedules[btn.dataset.index];
      saveGeneratedSchedule(selected);
    });
  });
}

// Save selected schedule
async function saveGeneratedSchedule(selectedSchedule) {
  const sectionIds = selectedSchedule.map(s => s.sectionId);

  try {
  const res = await fetch('/schedule/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionIds })
  });

  const data = await res.json();
  if (data.success) {
    alert("Schedule saved! Go to /schedule to view it.");
  } else {
    alert(data.message);
  }
} catch (err) { 
    console.error("Error saving schedule:", err); 
    alert("Error saving schedule. Check console.")
}}
// Wire up button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generateScheduleButton');
  if (btn) btn.addEventListener('click', callScheduleGenerator);
});
