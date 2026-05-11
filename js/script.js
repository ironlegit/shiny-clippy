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

// REDACTION PLACEHOLDER TOGGLE LOGIC

// false is block style placeholder
let redactionPlaceholder = "false";

function toggleRedactionPlaceholder() {
  redactionPlaceholder = document.querySelector(
    'input[name="placeholderMode"]:checked',
  ).value;
}

const PLACEHOLDERS = {
  name: { labelled: "[REDACTED-NAME]", block: "█████" },
  date: { labelled: "[REDACTED-DATE]", block: "█████" },
  email: { labelled: "[REDACTED-EMAIL]", block: "█████" },
  phone: { labelled: "[REDACTED-PHONE]", block: "█████" },
  org: { labelled: "[REDACTED-ORG]", block: "█████" },
  place: { labelled: "[REDACTED-PLACE]", block: "█████" },
  custom: { labelled: "[REDACTED-WORD]", block: "█████" },
};

function getPlaceholder(type) {
  if (redactionPlaceholder === "false") {
    return PLACEHOLDERS[type].block;
  } else {
    return PLACEHOLDERS[type].labelled;
  }
}

// REDACTION FUNCTIONS

// DOM Wrapper - Gets text and applies redaction function
async function redactTxtDOM(elementId, redactFunc, replacement = "█████") {
  const element = document.getElementById(elementId);
  element.innerText = redactFunc(element.innerText, replacement);
}

// Strategy 1: Use NLP-extracted entities and name lists with word boundaries
function replaceWords(txt, words, replacement = "█████") {
  if (words.length === 0) return txt;

  const escaped = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  return txt.replace(regex, replacement);
}

// Strategy 2: Regex-based patterns
function replacePattern(txt, regex, replacement = "█████") {
  return txt.replace(regex, replacement);
}

async function redactOrgs() {
  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(
      txt,
      nlp(txt).organizations().out("array"),
      getPlaceholder("org"),
    ),
  );
}

// Custom entity level function
nlp.plugin(compromiseDates);
async function redactDates() {
  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(txt, nlp(txt).dates().out("array"), getPlaceholder("date")),
  );
}

async function redactEmails() {
  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(txt, nlp(txt).emails().out("array"), getPlaceholder("email")),
  );
}

// TODO: Places ending with a point don't work, e.g. "I live in France."
async function redactPlaces() {
  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(txt, nlp(txt).places().out("array"), getPlaceholder("place")),
  );
}

async function redactPhones() {
  const phoneRegex =
    /\s*(?:\+?(\d{1,4}))?[-. (]*(\d{2,3})[-. )]*(\d{3})[-. ]*(\d{3,4})(?: *x(\d+))?\s*/g;
  redactTxtDOM("clipboardText", (txt) => replacePattern(txt, phoneRegex));
}

// Cache for the name list (loaded once)
let nameList = null;

// TODO: International names + ignore case leads to false positives
async function loadNames() {
  if (nameList) return nameList; // Return cached list if already loaded

  const response = await fetch("data/names.txt");
  const text = await response.text();
  nameList = text.split("\n").filter((name) => name.trim().length > 0);
  return nameList;
}

async function redactNames() {
  const names = await loadNames();
  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(txt, names, getPlaceholder("name")),
  );
}

function redactText() {
  const patterns = document
    .getElementById("redactPatterns")
    .innerText.split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (patterns.length === 0) {
    alert("Please enter patterns to redact.");
    return;
  }

  redactTxtDOM("clipboardText", (txt) =>
    replaceWords(txt, patterns, getPlaceholder("custom")),
  );
}
