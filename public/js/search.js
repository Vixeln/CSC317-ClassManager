/* ==========================================================
   DUMMY CLASS DATABASE
   ========================================================== */
const classes = [
    { prof: "Ms. Booker", subject: "SCI", days: "MW", start: "09:00", end: "10:15", credits: 4 },
    { prof: "Mr. Douglas", subject: "SCI", days: "MWF", start: "10:00", end: "10:30", credits: 4 },
    { prof: "Ms. Sanchez", subject: "SCI", days: "TTh", start: "10:00", end: "11:45", credits: 4 },

    { prof: "Ms. Matt", subject: "MATH", days: "TTh", start: "11:00", end: "12:15", credits: 4 },
    { prof: "Ms. Cruz", subject: "MATH", days: "TTh", start: "12:00", end: "13:00", credits: 4 },
    { prof: "Mr. Mogh", subject: "MATH", days: "MW", start: "09:00", end: "10:15", credits: 4 },

    { prof: "Mr. Lee", subject: "ENGL", days: "TTh", start: "11:00", end: "12:15", credits: 4 },
    { prof: "Ms. McGrath", subject: "ENGL", days: "TTh", start: "10:00", end: "11:45", credits: 4 },
    { prof: "Mr. Peterson", subject: "ENGL", days: "TTh", start: "12:00", end: "13:00", credits: 4 },

    { prof: "Mr. LW", subject: "HIST", days: "MW", start: "09:00", end: "10:15", credits: 4 },
    { prof: "Mr. Duddly", subject: "HIST", days: "MWF", start: "10:00", end: "10:30", credits: 4 },
    { prof: "Ms. Smith", subject: "HIST", days: "TTh", start: "12:00", end: "13:00", credits: 4 },
];

/* ==========================================================
   /// RENDER CLASS LIST
   ========================================================== */
function renderClassList(list) {
    const container = document.getElementById("classList");
    container.innerHTML = "";

    list.forEach(c => {
        const div = document.createElement("div");
        div.className = "class-item";

        div.innerHTML = `
            <div>
                <strong>${c.subject}</strong> - ${c.prof}<br>
                ${c.days} | ${c.start}-${c.end}
            </div>
            <button class="sm-btn" onclick='addToSchedule(${JSON.stringify(c)})'>Add</button>
        `;

        container.appendChild(div);
    });
}

/* ==========================================================
   /// FILTER CLASSES
   ========================================================== */
function applyFilters() {
    const subject = document.getElementById("filterSubject").value;
    const time = document.getElementById("filterTime").value;

    let result = classes;

    if (subject) {
        result = result.filter(c => c.subject === subject);
    }

    if (time === "morning") result = result.filter(c => Number(c.start.split(":")[0]) < 12);
    if (time === "afternoon") result = result.filter(c => Number(c.start.split(":")[0]) >= 12 && Number(c.start.split(":")[0]) <= 16);
    if (time === "evening") result = result.filter(c => Number(c.start.split(":")[0]) >= 17);

    renderClassList(result);
}

/* ==========================================================
   /// ADD CLASS TO SCHEDULE (LOCAL STORAGE)
   ========================================================== */
function addToSchedule(c) {
    let schedule = JSON.parse(localStorage.getItem("schedule")) || [];
    schedule.push(c);
    localStorage.setItem("schedule", JSON.stringify(schedule));
}

document.getElementById("applyFilters").addEventListener("click", applyFilters);

// Initial render
renderClassList(classes);
