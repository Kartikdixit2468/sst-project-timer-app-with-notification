// Use window.onload to ensure all DOM elements are available before script execution
window.onload = function () {
  // DOM Elements
  const startButton = document.getElementById("startTimer");
  const durationInput = document.getElementById("duration");
  const timerDisplay = document.getElementById("timerDisplay");
  const permissionButton = document.getElementById("requestPermission");
  const statusMessage = document.getElementById("statusMessage");

  let countdownInterval;

  // --- UI and Formatting Functions ---

  // Helper function to format seconds into MM:SS
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Function to update UI based on permission status
  function updatePermissionStatus(permission) {
    if (permission === "granted") {
      statusMessage.textContent = "Notifications are granted. Ready to start!";
      statusMessage.className = "text-center text-sm text-green-400";
      startButton.disabled = false;
      permissionButton.disabled = true;
    } else if (permission === "denied") {
      statusMessage.textContent =
        "Notifications are denied. Timer will still run, but no pop-up alerts will appear.";
      statusMessage.className = "text-center text-sm text-red-400";
      startButton.disabled = true;
    } else {
      // default or initial load
      statusMessage.textContent = "Permission required to start the timer.";
      statusMessage.className = "text-center text-sm text-yellow-400";
      startButton.disabled = true;
    }
  }

  // --- Notification Functions ---

  // 1. Request Notification Permission
  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      statusMessage.textContent =
        "Browser does not support desktop notifications.";
      statusMessage.className = "text-center text-sm text-red-400";
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
        icon: "https://placehold.co/128x128/0000FF/FFFFFF?text=T",
      });
    } else {
      // Fallback to updating the status message
      statusMessage.textContent =
        "TIME'S UP! (Notification blocked by browser/user)";
      statusMessage.className = "text-center text-sm text-red-400 font-bold";
    }
  }

  // --- Timer Logic ---

  // 3. Start the Countdown Timer
  function startCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    let remainingTime = parseInt(durationInput.value, 10);

    if (isNaN(remainingTime) || remainingTime <= 0) {
      statusMessage.textContent =
        "Please enter a positive number of seconds to start.";
      statusMessage.className = "text-center text-sm text-red-400";
      return;
    }

    // Reset UI state
    updatePermissionStatus(Notification.permission);
    timerDisplay.textContent = formatTime(remainingTime);
    startButton.disabled = true;
    startButton.textContent = "Timer Running...";

    // Start the interval
    countdownInterval = setInterval(() => {
      remainingTime--;
      timerDisplay.textContent = formatTime(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        startButton.disabled = false;
        startButton.textContent = "2. Start Timer";

        // Action on timer end
        showTimerEndNotification();
      }
    }, 1000);
  }

  // --- Initialization ---

  // Set initial time display based on input value
  timerDisplay.textContent = formatTime(parseInt(durationInput.value, 10));

  // Set initial status of the buttons and message
  updatePermissionStatus(Notification.permission);

  // Event listeners
  permissionButton.addEventListener("click", requestNotificationPermission);
  startButton.addEventListener("click", startCountdown);
};
