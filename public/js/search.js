//This will hold all classes loaded from classes.json
let classes = [];

//loads classes.json into memory
fetch("courses/api/get-classes")
  .then((res) => res.json())
  .then((jsonRes) => {
    const data = jsonRes.data;

    //Some json files use arrays while others may warp,
    if (Array.isArray(data)) {
      classes = data;
    } else if (data.classes && Array.isArray(data.classes)) {
      classes = data.classes;
    } else {
      console.error("JSON format not recognized:", data);
      return;
    }
    //once all is loaded, this calls for the list to be displayed
    renderClassList(classes);
  })
  //incase of error
  .catch((err) => console.error("Error Loading classes.json:", err));

//displays all classes onto our search page
/**
 *
 * @param {TClass[]} list
 * @returns
 */
function renderClassList(list) {
  const container = document.getElementById("classList");
  //clrs old results
  container.innerHTML = "";

  if (!Array.isArray(list)) {
    console.error("renderClassList expected an array, received:", list);
    return;
  }

  //for every class, a card that displays their information is created
  list.forEach((c) => {
    const div = document.createElement("div");
    div.className = "class-item";

    div.innerHTML = `
            <div>
                <strong>${c.subject} ${c.number}</strong> - ${
      c.instructor ?? "TBD"
    }<br>
                ${c.days_of_week.join(", ")} | ${to12Hour(
      c.start_time
    )}-${to12Hour(c.end_time)}<br>
                Max Seats: ${c.max_seat ?? "TBD"}<br>
                Max Wait List: ${c.max_wait ?? "TBD"}

            </div>
            <button class="sm-btn" onclick='addToSchedule(${JSON.stringify(
              c
            )})'>Add</button>
        `;

    container.appendChild(div);
  });
}

//applying filters to seatch
function applyFilters() {
  const subject = document.getElementById("filterSubject").value;
  const time = document.getElementById("filterTime").value;

  //starting with full course list
  let result = classes;

  //filter by subject
  if (subject) {
    result = result.filter((c) => c.subject === subject);
  }

  //filter by time of day
  const hour = (c) => Number(c.start.split(":")[0]);
  if (time === "morning") result = result.filter((c) => hour(c) < 12);
  if (time === "afternoon")
    result = result.filter((c) => hour(c) >= 12 && hour(c) <= 16);
  if (time === "evening") result = result.filter((c) => hour(c) >= 17);

  //display updated search
  renderClassList(result);
}

//run filter when the button is pressed
document.getElementById("applyFilters").addEventListener("click", applyFilters);

//adding a class to schedule <decrements seat/wait availability
/**
 *
 * @typedef {import("../../models/Class.js").ClassFE } TClass
 *
 * @param {TClass} c
 * @returns
 */
function addToSchedule(c) {
  //current schedule
  /** @type {TClass[]} */
  let schedule = JSON.parse(localStorage.getItem("schedule")) || [];

  //calls helperfunction to used for checking for overlap
  const cStart = toMinutes(c.start_time);
  const cEnd = toMinutes(c.end_time);

  //checking for conflicting overlaps
  const hasConflict = schedule.some((item) => {
    //check if they share any days
    const daysOverlap = [...item.days_of_week].some((day) =>
      c.days_of_week.includes(day)
    );
    if (!daysOverlap) return false;

    const itemStart = toMinutes(item.start_time);
    const itemEnd = toMinutes(item.end_time);

    //time overlap checking
    return cStart < itemEnd && itemStart < cEnd;
  });

  if (hasConflict) {
    alert("This class conflicts with another class in your schedule.");
    return;
  }
  //Test for seeing if the functionality of decreasing class count works before enrolling
  console.log(
    `Before adding ${c.id}: available_seat=${c.available_seat}, availableWait=${c.available_wait_list}`
  );

  //check seat availability
  let enrolledSeat = null;
  if (c.available_seat > 0) {
    c.available_seat--;
    //enrolled in regular seat
    enrolledSeat = "seat";
  } else if (c.availableWait > 0) {
    c.availableWait--;
    //enrolled in waitlist
    enrolledSeat = "wait";
  } else {
    alert("No available seats or waitlist for this class.");
    return;
  }

  //Add to schedule, with info about which type of enrollment
  const classToAdd = { ...c, enrolledSeat };
  schedule.push(classToAdd);
  localStorage.setItem("schedule", JSON.stringify(schedule));

  //updates in-memory classes array to reflect new availablity counter
  const index = classes.findIndex((cl) => cl.id === c.id);
  if (index !== -1) {
    classes[index] = { ...c }; // overwrite with updated seat info
  }
  //test to see the counter after enrolling (test should be Before adding: 20 // After adding: 19)
  console.log(
    `After adding ${c.id}: available_seat=${c.available_seat}, availableWait=${c.availableWait}`
  );
  //lets users k ow
  alert("Class has been added to your schedule.");
}

// Helper function: convert HH:mm → total minutes
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

//converts military time to (1-12):(00-59) am/pm
function to12Hour(timeString) {
  // timeString is "HH:MM"
  let [hour, minute] = timeString.split(":").map(Number);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
