/*
 * TOGGLE DARK MODE FUNCTION
 * Switches between light and dark themes
 */
function toggleDarkMode() {
  // Trigger the CSS rules that change colors for dark mode
  document.body.classList.toggle("dark-mode");

  // Get the toggle button element
  const button = document.querySelector(".toggle-btn");

  // Update button text based on current mode
  button.textContent = document.body.classList.contains("dark-mode")
    ? "Switch to Light Mode"
    : "Switch to Dark Mode";
}

/*
 * REDACT CUSTOM TOKENS FUNCTION
 */
function redactText() {
  // Get text and tokens to redact
  const clipboardText = document.getElementById("clipboardText");
  const redactPatterns = document.getElementById("redactPatterns");

  // Get the text to process from the clipboard
  let text = clipboardText.innerText;

  // Get patterns to redact (one per line)
  // 1. Split by newlines to get each pattern
  // 2. Trim whitespace from each pattern
  // 3. Filter out any empty lines
  const patterns = redactPatterns.innerText
    .split("\n")
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern.length > 0);

  // If no patterns were entered, show an alert and exit
  if (patterns.length === 0) {
    alert("Please enter patterns to redact in the box below.");
    return;
  }

  // Escape special regex characters in each pattern
  // This prevents errors if patterns contain characters like *, +, ?, etc.
  // For example, if a pattern is "a+b", we need to escape the "+"
  const escapedPatterns = patterns.map((pattern) =>
    pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  // Create a regex that matches any of our patterns
  // Use 'gi' flags for global (find all matches) and case insensitive
  const regex = new RegExp(escapedPatterns.join("|"), "gi");

  // Redaction
  const redactedText = text.replace(regex, "█████");

  // Update the clipboard text
  clipboardText.innerText = redactedText;

  // Show a confirmation message with the number of patterns redacted
  // alert(`Successfully redacted ${patterns.length} pattern(s) from the text.`);
}

/*
 * REDACT NAME FUNCTIONS
 */
// Cache for the name list (loaded once)
let nameList = null;

async function loadNames() {
  if (nameList) return nameList; // Return cached list if already loaded

  const response = await fetch("data/names.txt");
  const text = await response.text();
  nameList = text.split("\n").filter((name) => name.trim().length > 0);
  return nameList;
}

async function redactNames() {
  const names = await loadNames(); // Load only on first click

  const clipboardText = document.getElementById("clipboardText");
  let text = clipboardText.innerText;

  // Escape names for regex
  const escapedNames = names.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  // Create regex to match whole words (case insensitive)
  const regex = new RegExp("\\b(" + escapedNames.join("|") + ")\\b", "gi");

  // Redact matches
  const redactedText = text.replace(regex, "█████");
  clipboardText.innerText = redactedText;
}

/*
 * REDACT DATE FUNCTIONS
 */
async function redactDates() {
  const clipboardText = document.getElementById("clipboardText");
  let text = clipboardText.innerText;

  // Escape names for regex
  const SEP = "[—\\\-/. ]?";
  const DAY = "(3[01]|[12][0-9]|0?[1-9])";
  const MONTH = "(1[0-2]|0?[1-9])";
  const YEAR = "([12][0-9]{3}|[0-9]{2})";

  const DMY = `${DAY}${SEP}${MONTH}${SEP}${YEAR}`;
  const YMD = `${YEAR}${SEP}${MONTH}${SEP}${DAY}`;
  const MDY = `${MONTH}${SEP}${DAY}${SEP}${YEAR}`;

  const combined = `${DMY}|${YMD}|${MDY}`;
  const regex = new RegExp(combined, "g");

  // Redact matches
  const redactedText = text.replace(regex, "█████");
  clipboardText.innerText = redactedText;
}
