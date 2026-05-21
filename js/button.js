// TOGGLE DARK MODE FUNCTION
function toggleDarkMode() {
  // Trigger the CSS rules that change colors for dark mode
  document.body.classList.toggle("dark-mode");

  // Get the toggle button element
  const button = document.querySelector(".toggle-btn");

  // Update button text based on current mode
  button.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

// TOGGLE SIDE PANEL
function togglePanel() {
  const panel = document.querySelector(".side-panel");
  panel.classList.toggle("active");
}

// CLIPBOARD TOGGLE IN / OUT
function switchToOut() {
  document.getElementById("clipboardIn").style.display = "none";
  document.getElementById("clipboardOut").style.display = "block";
}

function switchToIn() {
  document.getElementById("clipboardIn").style.display = "block";
  document.getElementById("clipboardOut").style.display = "none";
}
