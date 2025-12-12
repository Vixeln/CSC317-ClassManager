/* ==========================================================
   /// LOAD SCHEDULE
   ========================================================== */
function loadSchedule() {
    const grid = document.getElementById("scheduleGrid");
    grid.innerHTML = "";

    const schedule = JSON.parse(localStorage.getItem("schedule")) || [];

    schedule.forEach(c => {
        const div = document.createElement("div");
        div.className = "schedule-block";
        div.innerHTML = `
            <strong>${c.subject}</strong><br>
            ${c.prof}<br>
            ${c.days} | ${c.start}-${c.end}
        `;
        grid.appendChild(div);
    });
}

/* ==========================================================
   /// CLEAR SCHEDULE
   ========================================================== */
function clearSchedule() {
    localStorage.removeItem("schedule");
    loadSchedule();
}

// SAVE SCHEDULE (BACKEND)
 
async function saveSchedule() {
  const schedule = JSON.parse(localStorage.getItem("schedule")) || [];

  if (schedule.length === 0) {
    alert("No classes in schedule to save.");
    return;
  }

  // IMPORTANT: each item must have a sectionId
  const sectionIds = [...new Set(
    schedule
      .map(c => c.sectionId)   // <-- make sure you set this when adding to localStorage
      .filter(Boolean)
  )];

  if (sectionIds.length === 0) {
    alert("No sectionIds found in schedule items. Make sure you store sectionId with each class.");
    return;
  }

  try {
    const res = await fetch("/schedule/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sectionIds })
    });

    const data = await res.json();

    if (data.success) {
      alert("Schedule saved to backend!");
    } else {
      alert(data.message || "Failed to save schedule.");
    }
  } catch (err) {
    console.error("Error saving schedule:", err);
    alert("Error saving schedule. Check console for details.");
  }
}
// EVENT LISTENERS
document.getElementById("clearSchedule").addEventListener("click", clearSchedule);
document.getElementById("saveSchedule").addEventListener("click", saveSchedule);

// Initial render
loadSchedule();
