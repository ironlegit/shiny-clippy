// HELPER FUNCTIONS
function flushOutput() {
  document.getElementById("clipboardOut").textContent = "";
}

// REDACTION FUNCTIONS

// DOM Wrapper - Gets text and applies redaction function
async function redactTxtDOM(redactFunc, replacement = "█████") {
  const inEl = document.getElementById("clipboardIn");

  // Feels more natural
  if (inEl.innerText.trim() === "") {
    flushOutput();
  }

  const outEl = document.getElementById("clipboardOut");

  // Apply redaction on output if non-empty
  const source = outEl.innerText.trim() ? outEl : inEl;
  outEl.innerText = redactFunc(source.innerText, replacement);
  switchToOut();
}

// Strategy 1: Use NLP-extracted entities and name lists with word boundaries
function replaceWords(txt, words, replacement = "█████") {
  if (words.length === 0) return txt;

  const escaped = words.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})`, "g");
  console.log(regex);
  return txt.replace(regex, replacement);
}

// Strategy 2: Regex-based patterns
function replacePattern(txt, regex, replacement = "█████") {
  return txt.replace(regex, replacement);
}

async function redactOrgs() {
  redactTxtDOM((txt) =>
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
  redactTxtDOM((txt) =>
    replaceWords(txt, nlp(txt).dates().out("array"), getPlaceholder("date")),
  );
}

async function redactEmails() {
  redactTxtDOM((txt) =>
    replaceWords(txt, nlp(txt).emails().out("array"), getPlaceholder("email")),
  );
}

// TODO: Places ending with a point don't work, e.g. "I live in France."
async function redactPlaces() {
  redactTxtDOM((txt) =>
    replaceWords(txt, nlp(txt).places().out("array"), getPlaceholder("place")),
  );
}

async function redactPhones() {
  const phoneRegex =
    /\s*(?:\+?(\d{1,4}))?[-. (]*(\d{2,3})[-. )]*(\d{3})[-. ]*(\d{3,4})(?: *x(\d+))?\s*/g;
  redactTxtDOM((txt) => replacePattern(txt, phoneRegex));
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
  redactTxtDOM((txt) => replaceWords(txt, names, getPlaceholder("name")));
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

  redactTxtDOM((txt) => replaceWords(txt, patterns, getPlaceholder("custom")));
}
