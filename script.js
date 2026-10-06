// Grab all the elements I need from the page
const semesterInput = document.getElementById("semester");
const totalInput = document.getElementById("total");
const heldInput = document.getElementById("held");
const attendedInput = document.getElementById("attended");
const targetInput = document.getElementById("target");

const resultBox = document.getElementById("result");
const bigText = document.getElementById("big-text");
const smallText = document.getElementById("small-text");
const percentText = document.getElementById("current-percent");
const semesterLabel = document.getElementById("semester-label");
const resetBtn = document.getElementById("reset-btn");

const allInputs = [semesterInput, totalInput, heldInput, attendedInput, targetInput];

// ---------- the main calculation ----------
function calculate() {
  const total = Number(totalInput.value);
  const held = Number(heldInput.value);
  const attended = Number(attendedInput.value);
  const target = Number(targetInput.value);

  semesterLabel.textContent = semesterInput.value;

  // if something is empty, just show the default message
  if (!total || !target || heldInput.value === "" || attendedInput.value === "") {
    showResult("neutral", "Fill in the numbers above", "");
    percentText.textContent = "";
    return;
  }

  // check for numbers that don't make sense
  if (held > total || attended > held) {
    showResult("danger", "Check your numbers",
      "Held can't be more than total, and attended can't be more than held.");
    percentText.textContent = "";
    return;
  }

  // 1. current attendance percentage
  const currentPercent = held === 0 ? 0 : (attended / held) * 100;
  percentText.textContent = "Current attendance: " + currentPercent.toFixed(1) + "%";

  // 2. how many sessions I must attend in the whole semester
  //    (round UP because 44.2 sessions is really 45)
  const mustAttend = Math.ceil((target / 100) * total);

  // 3. how many I can miss in the whole semester
  const maxMissTotal = total - mustAttend;

  // 4. how many I have already missed
  const alreadyMissed = held - attended;

  // 5. how many more I can still miss
  const canSkip = maxMissTotal - alreadyMissed;
  const remaining = total - held;

  if (canSkip >= remaining) {
    // so much spare room that even skipping every remaining session is fine
    // (without this check the app said "skip 20" when only 5 were left)
    showResult("safe", "You can skip all " + remaining + " remaining session(s)",
      "You will still reach " + target + "% even if you miss every one.");
  } else if (canSkip >= 0) {
    // safe zone
    showResult("safe", "You can skip " + canSkip + " more session(s)",
      "Out of " + remaining + " remaining sessions.");
  } else {
    // danger zone: how many of the remaining ones must I attend?
    const needToAttend = mustAttend - attended;
    if (needToAttend > remaining) {
      showResult("danger", "Target is not possible anymore",
        "Even if you attend all " + remaining + " remaining sessions you will fall short.");
    } else {
      showResult("danger", "Attend the next " + needToAttend + " session(s)",
        "Out of " + remaining + " remaining. You can't miss any of those.");
    }
  }
}

// changes the text and colour of the result box
function showResult(type, big, small) {
  resultBox.className = "result " + type;
  bigText.textContent = big;
  smallText.textContent = small;
}

// ---------- localStorage ----------
function saveData() {
  const data = {
    semester: semesterInput.value,
    total: totalInput.value,
    held: heldInput.value,
    attended: attendedInput.value,
    target: targetInput.value
  };
  localStorage.setItem("attendanceData", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("attendanceData");
  if (saved === null) return; // first visit, nothing saved yet

  const data = JSON.parse(saved);
  semesterInput.value = data.semester;
  totalInput.value = data.total;
  heldInput.value = data.held;
  attendedInput.value = data.attended;
  targetInput.value = data.target;
}

// ---------- events ----------
// every time the user types anything: save and recalculate
allInputs.forEach(function (input) {
  input.addEventListener("input", function () {
    saveData();
    calculate();
  });
});

resetBtn.addEventListener("click", function () {
  localStorage.removeItem("attendanceData");
  allInputs.forEach(function (input) { input.value = ""; });
  targetInput.value = 75; // back to default
  calculate();
});

// when the page opens
loadData();
calculate();
