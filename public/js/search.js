//Helper
  
// Convert numeric DB time like 930 or 1430 → "09:30", "14:30"
function formatTime(time) {
  if (time == null) return 'TBA';
  const s = time.toString().padStart(4, '0');
  const h = s.slice(0, 2);
  const m = s.slice(2);
  return `${h}:${m}`;
}

//RENDER CLASS LIST (data from backend)
function renderClassList(list) {
  const container = document.getElementById('classList');
  container.innerHTML = '';

  if (!list || list.length === 0) {
    container.innerHTML =
      '<p style="color:#666;font-style:italic;">No classes found for those filters.</p>';
    return;
  }

  list.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'class-item';

    const dayText = c.day || 'TBA';
    const timeText =
      c.start_time && c.end_time
        ? `${formatTime(c.start_time)} - ${formatTime(c.end_time)}`
        : 'TBA';

    div.innerHTML = `
      <div class="class-main">
        <strong>${c.code}</strong> - ${c.title}<br>
        Instructor: ${c.instructor || 'TBA'}<br>
        ${dayText} | ${timeText}<br>
        Location: ${c.location || 'TBA'}<br>
        Seats: ${c.open_seats}/${c.total_seats}
      </div>
      <div class="class-actions">
        <label style="display:block; margin-bottom:6px;">
          <input 
            type="checkbox" 
            class="course-select" 
            data-code="${c.code}">
          Select for schedule generator
        </label>
        <button 
          class="sm-btn add-to-schedule" 
          data-section-id="${c.section_id}">
          Add
        </button>
      </div>
    `;

    container.appendChild(div);
  });

  // Attach click handlers to all "Add" buttons
  const addButtons = container.querySelectorAll('.add-to-schedule');
  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.sectionId;
      addToSchedule(sectionId);
    });
  });
}

//FILTER CLASSES (CALL BACKEND API)
  
async function applyFilters() {
  const subject = document.getElementById('filterSubject').value;
  const time = document.getElementById('filterTime').value;

  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (time) params.append('time', time);

  try {
    const res = await fetch(`/courses/api/search?${params.toString()}`);
    const data = await res.json();

    if (!data.success) {
      console.error('Search failed:', data.message);
      alert('Failed to load classes.');
      return;
    }

    renderClassList(data.data);
  } catch (err) {
    console.error('Error calling /courses/api/search:', err);
    alert('Error loading classes. Check console.');
  }
}

//ADD CLASS TO SCHEDULE (CALL BACKEND)
   
async function addToSchedule(sectionId) {
  try {
    const res = await fetch('/schedule/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId })
    });

    const data = await res.json();

    if (data.success) {
      alert('Class added to your schedule.');
    } else {
      alert(data.message || 'Failed to add class.');
    }
  } catch (err) {
    console.error('Error adding class:', err);
    alert('Error adding class. Check console.');
  }
}
