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

/* ==========================================================
   /// SAVE SCHEDULE (FOR BACKEND)
   ========================================================== */
function saveSchedule() {
    const schedule = JSON.parse(localStorage.getItem("schedule")) || [];
    console.log("Upload this to backend:", schedule);
}

document.getElementById("clearSchedule").addEventListener("click", clearSchedule);
document.getElementById("saveSchedule").addEventListener("click", saveSchedule);

loadSchedule();
