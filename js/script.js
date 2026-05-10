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
  button.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

/* REDACT CUSTOM TOKENS FUNCTION */
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
}

/* REDACTION FUNCTIONS */

function redactEntities(txt, extractFunc, replacement = "█████") {
  const entities = extractFunc(txt);
  console.log(entities);
  if (entities.length === 0) return txt;

  // Escape special regex characters in each pattern
  // This prevents errors if patterns contain characters like *, +, ?, etc.
  // For example, if a pattern is "a+b", we need to escape the "+"
  const escapedEntities = entities.map((pattern) =>
    pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  const regex = new RegExp(`\\b(${escapedEntities.join("|")})\\b`, "gi");
  console.log(regex);
  return txt.replace(regex, replacement);
}

// DOM Wrapper
async function redactTxtDOM(elementId, extractFunc, replacement = "█████") {
  const element = document.getElementById(elementId);
  const txt = element.innerText;
  const redactedText = redactEntities(txt, extractFunc, replacement);
  element.innerText = redactedText;
}

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
  const names = await loadNames();
  await redactTxtDOM(
    "clipboardText",
    (txt) =>
      // names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      names,
  );
}

nlp.plugin(compromiseDates);
async function redactDates() {
  await redactTxtDOM("clipboardText", (txt) => nlp(txt).dates().out("array"));
}

async function redactOrgs() {
  await redactTxtDOM("clipboardText", (txt) =>
    nlp(txt).organizations().out("array"),
  );
}

async function redactEmails() {
  await redactTxtDOM("clipboardText", (txt) => nlp(txt).emails().out("array"));
}

async function redactPhones() {
  await redactTxtDOM("clipboardText", (txt) => {
    const captRegex =
      /\s*(?:\+?(\d{1,4}))?[-. (]*(\d{2,3})[-. )]*(\d{3})[-. ]*(\d{3,4})(?: *x(\d+))?\s*/g;
    const matches = txt.match(captRegex);
    console.log(matches);
    return matches;
  });
}
