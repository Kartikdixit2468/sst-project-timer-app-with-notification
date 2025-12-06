// Use window.onload to ensure all DOM elements are available before script execution
window.onload = function () {
  // DOM Elements
  const startStopButton = document.getElementById("startStopButton");
  const resetButton = document.getElementById("resetButton");
  const durationInput = document.getElementById("duration");
  const timerDisplay = document.getElementById("timerDisplay");
  const permissionButton = document.getElementById("requestPermission");
  const statusMessage = document.getElementById("statusMessage");

  let countdownInterval = null;
  let remainingTime = 0; // State variable for current time left
  let initialDuration = 0; // State variable for the duration set on start/reset
  let isTimerRunning = false; // State variable for timer status

  // --- UI and Formatting Functions ---

  // Helper function to format seconds into MM:SS
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Function to handle Start/Stop button appearance
  function updateStartStopButton() {
    if (isTimerRunning) {
      startStopButton.textContent = "Stop";
      startStopButton.classList.remove("btn-primary");
      startStopButton.classList.add("btn-stop"); // Use red for Stop
      resetButton.disabled = true;
    } else {
      startStopButton.textContent = "Start";
      startStopButton.classList.remove("btn-stop");
      startStopButton.classList.add("btn-primary"); // Use indigo for Start
      resetButton.disabled = false;
    }
  }

  // Function to update UI based on permission status
  function updatePermissionStatus(permission) {
    // Timer is always runnable now, regardless of notification status

    if (permission === "granted") {
      statusMessage.textContent = "Notifications are granted. Ready to start!";
      statusMessage.className = "status-message status-green";
      permissionButton.disabled = true; // Disable after granted
    } else if (permission === "denied") {
      statusMessage.textContent =
        "Notifications are denied. Timer will run, but no system pop-up will appear.";
      statusMessage.className = "status-message status-red";
    } else {
      // default or initial load
      statusMessage.textContent =
        "Click 'Request Access' to enable system pop-ups, or just start the timer.";
      statusMessage.className = "status-message status-yellow";
      permissionButton.disabled = false;
    }
  }

  // --- Notification Functions ---

  // 1. Request Notification Permission
  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      statusMessage.textContent =
        "Browser does not support desktop notifications.";
      statusMessage.className = "status-message status-red";
      return;
    }

    Notification.requestPermission()
      .then((permission) => {
        updatePermissionStatus(permission);
      })
      .catch((error) => {
        console.error("Error requesting permission:", error);
        updatePermissionStatus("default");
      });
  }

  // 2. Show the notification
  function showTimerEndNotification() {
    if (Notification.permission === "granted") {
      new Notification("🚀 Timer Complete!", {
        body: "Your countdown has finished. Time for your next task!",
        icon: "https://placehold.co/128x128/4f46e5/FFFFFF?text=T",
      });
    } else {
      // Fallback to updating the status message on the page
      statusMessage.textContent = "TIME'S UP! (Notification blocked/denied)";
      statusMessage.className = "status-message status-red font-bold";
    }
  }

  // --- Timer Logic ---

  // Function to handle the actual countdown logic (called every second)
  function tick() {
    remainingTime--;
    timerDisplay.textContent = formatTime(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      isTimerRunning = false;

      showTimerEndNotification();

      // Reset state after completion
      remainingTime = initialDuration;
      timerDisplay.textContent = formatTime(remainingTime);
      updateStartStopButton();
      updatePermissionStatus(Notification.permission);
    }
  }

  // 3. Start/Stop Timer Handler
  function startStopTimer() {
    if (isTimerRunning) {
      // STOP/PAUSE logic
      clearInterval(countdownInterval);
      countdownInterval = null;
      isTimerRunning = false;
      updateStartStopButton();
      statusMessage.textContent = `Timer Paused at ${formatTime(
        remainingTime
      )}.`;
      statusMessage.className = "status-message status-yellow";
      return;
    }

    // START/RESUME logic

    // Check if we need to load a new duration (only if timer is currently reset/0)
    if (countdownInterval === null) {
      let newDuration = parseInt(durationInput.value, 10);
      if (isNaN(newDuration) || newDuration <= 0) {
        statusMessage.textContent =
          "Please enter a positive number of seconds to start.";
        statusMessage.className = "status-message status-red";
        return;
      }
      // If starting from a full reset, use the input value
      remainingTime = newDuration;
      initialDuration = newDuration;
    }

    // Start Interval
    isTimerRunning = true;
    updateStartStopButton();

    // Update status message immediately
    updatePermissionStatus(Notification.permission);

    // Start interval
    countdownInterval = setInterval(tick, 1000);
  }

  // 4. Reset Timer Handler
  function resetTimer() {
    // 1. Stop any running interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    // 2. Reset state variables
    isTimerRunning = false;

    // Get the current value from the input field to reset
    initialDuration = parseInt(durationInput.value, 10);
    if (isNaN(initialDuration) || initialDuration <= 0) {
      initialDuration = 60; // Fallback to 60 if invalid
      durationInput.value = 60;
    }
    remainingTime = initialDuration;

    // 3. Update display and buttons
    timerDisplay.textContent = formatTime(initialDuration);
    updateStartStopButton();
    updatePermissionStatus(Notification.permission);
  }

  // --- Initialization ---

  // Set initial duration from input
  initialDuration = parseInt(durationInput.value, 10);
  remainingTime = initialDuration;
  timerDisplay.textContent = formatTime(initialDuration);

  // Set initial status of the buttons and message
  updatePermissionStatus(Notification.permission);
  updateStartStopButton(); // Set initial button text to "Start"

  // Event listeners
  permissionButton.addEventListener("click", requestNotificationPermission);
  startStopButton.addEventListener("click", startStopTimer);
  resetButton.addEventListener("click", resetTimer);

  // Listener for input change: updates the duration on reset/initial load
  durationInput.addEventListener("input", () => {
    // Only update initialDuration if the timer is not running
    if (!isTimerRunning && countdownInterval === null) {
      let newDuration = parseInt(durationInput.value, 10);
      if (!isNaN(newDuration) && newDuration > 0) {
        initialDuration = newDuration;
        remainingTime = newDuration;
        timerDisplay.textContent = formatTime(newDuration);
      }
    }
  });
};
