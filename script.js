window.onload = function () {
  const startStopButton = document.getElementById("startStopButton");
  const resetButton = document.getElementById("resetButton");
  const durationInput = document.getElementById("duration");
  const timerDisplay = document.getElementById("timerDisplay");
  const permissionButton = document.getElementById("requestPermission");
  const statusMessage = document.getElementById("statusMessage");

  let countdownInterval = null;
  let remainingTime = 0;
  let initialDuration = 0;
  let isTimerRunning = false;

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateStartStopButton() {
    if (isTimerRunning) {
      startStopButton.textContent = "Stop";
      startStopButton.classList.remove("btn-primary");
      startStopButton.classList.add("btn-stop");
      resetButton.disabled = true;
    } else {
      startStopButton.textContent = "Start";
      startStopButton.classList.remove("btn-stop");
      startStopButton.classList.add("btn-primary");
      resetButton.disabled = false;
    }
  }

  function updatePermissionStatus(permission) {
    if (permission === "granted") {
      statusMessage.textContent = "Notifications are granted. Ready to start!";
      statusMessage.className = "status-message status-green";
      permissionButton.disabled = true;
    } else if (permission === "denied") {
      statusMessage.textContent =
        "Notifications are denied. Timer will run, but no system pop-up will appear.";
      statusMessage.className = "status-message status-red";
      permissionButton.disabled = false;
    } else {
      statusMessage.textContent =
        "Click 'Request Access' to enable system pop-ups, or just start the timer.";
      statusMessage.className = "status-message status-yellow";
      permissionButton.disabled = false;
    }
  }

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
        updatePermissionStatus("default");
      });
  }

  function showTimerEndNotification() {
    if (Notification.permission === "granted") {
      new Notification("🚀 Timer Complete!", {
        body: "Your countdown has finished. Time for your next task!",
        icon: "https://placehold.co/128x128/4f46e5/FFFFFF?text=T",
      });
    } else {
      statusMessage.textContent = "TIME'S UP! (Notification blocked/denied)";
      statusMessage.className = "status-message status-red font-bold";
    }
  }

  function tick() {
    remainingTime--;
    timerDisplay.textContent = formatTime(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      isTimerRunning = false;
      showTimerEndNotification();
      remainingTime = initialDuration;
      timerDisplay.textContent = formatTime(initialDuration);
      updateStartStopButton();
      updatePermissionStatus(Notification.permission);
    }
  }

  function startStopTimer() {
    if (isTimerRunning) {
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

    if (remainingTime === initialDuration || remainingTime <= 0) {
      let newDuration = parseInt(durationInput.value, 10);

      if (isNaN(newDuration) || newDuration <= 0) {
        statusMessage.textContent =
          "Please enter a positive number of seconds to start.";
        statusMessage.className = "status-message status-red";
        return;
      }

      remainingTime = newDuration;
      initialDuration = newDuration;
      timerDisplay.textContent = formatTime(remainingTime);
    }

    isTimerRunning = true;
    updateStartStopButton();
    updatePermissionStatus(Notification.permission);
    countdownInterval = setInterval(tick, 1000);
  }

  function resetTimer() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    isTimerRunning = false;

    initialDuration = parseInt(durationInput.value, 10);
    if (isNaN(initialDuration) || initialDuration <= 0) {
      initialDuration = 60;
      durationInput.value = 60;
    }
    remainingTime = initialDuration;

    timerDisplay.textContent = formatTime(initialDuration);
    updateStartStopButton();
    updatePermissionStatus(Notification.permission);
  }

  initialDuration = parseInt(durationInput.value, 10);
  remainingTime = initialDuration;
  timerDisplay.textContent = formatTime(initialDuration);

  updatePermissionStatus(Notification.permission);
  updateStartStopButton();

  permissionButton.addEventListener("click", requestNotificationPermission);
  startStopButton.addEventListener("click", startStopTimer);
  resetButton.addEventListener("click", resetTimer);

  durationInput.addEventListener("input", () => {
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
