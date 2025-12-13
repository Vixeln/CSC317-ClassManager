//load and display the current schedule on page
function loadSchedule() {
    const grid = document.getElementById("scheduleGrid");
    //meant to clr old contents
    grid.innerHTML = "";
    //pull saved schedule from localStorage
  /**
   * @type { import("../../models/Class.js").ClassFE[]}
   */
    const schedule = JSON.parse(localStorage.getItem("schedule")) || [];
    console.log(localStorage.getItem("schedule"));
    //loop thru schedule and display each class block
  schedule.forEach((classItem, index) => {
        const div = document.createElement("div");
        div.className = "schedule-block";
        div.innerHTML = `
				<div>
            <strong>${classItem.subject} | ${classItem.number}</strong><br>
            Instructor: ${classItem.instructor ?? "TBD"}<br>
            Meeting Time: ${classItem.days_of_week.join(", ")} | ${to12Hour(
      classItem.start_time
    )}-${to12Hour(classItem.end_time)}
		<div>
            <button class="btn" onclick="removeFromSchedule(${index})">Remove</button>
            
            `;
        grid.appendChild(div);
    });
}

//save schedule (currently a placeholder for a person from backend to code in this functinality)
function saveSchedule() {
    const schedule = JSON.parse(localStorage.getItem("schedule")) || [];
    console.log("Upload this to backend:", schedule);
}

//clear all classes from schedule
function clearAllSchedule() {
    localStorage.removeItem("schedule");
    loadSchedule();
}

//connects saveSchedule to button
document.getElementById("saveSchedule").addEventListener("click", saveSchedule);

//connects clearSchedule to button
document.getElementById("clearSchedule").addEventListener("click", clearAllSchedule);

window.addEventListener('storage', (e) => {
  if (e.key === 'schedule') {
    loadSchedule(); // reload when localStorage changes
  }
});

//same as in search.js
function to12Hour(timeString) {
    let [hour, minute] = timeString.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

//removal of a class <includes a way to restore a seat for availablity
function removeFromSchedule(index) {
    let schedule = JSON.parse(localStorage.getItem("schedule")) || [];
    //checks to see if curring index is valid or not
    if (index < 0 || index >= schedule.length) return;
    //class that we will remove
    const c = schedule[index];
    
    //update availableSeats / availableWait in classes array
    //classes must exist in search.js
    if (typeof classes !== "undefined") { 
       //finding matching class in list
        const classIndex = classes.findIndex(cl => cl.id === c.id);
        if (classIndex !== -1) {
            //add back whichever seat was used
            //plan for future implementation: allow the case that if there are students in the wait list to be moved into
            //the class if a student from availableSeats removes the class. from there increment the subsequent students
            //in the waitlist up a spot 
            if (c.enrolledSeat === "seat") classes[classIndex].available_seat++;
            else if (c.enrolledSeat === "wait") classes[classIndex].available_wait_list++;
        }
    }

    //Remove from schedule
    schedule.splice(index, 1);
    //saves updated schedule
    localStorage.setItem("schedule", JSON.stringify(schedule));
    //Refreshes schedule
    loadSchedule();


}

//load schedule on page load
loadSchedule();

