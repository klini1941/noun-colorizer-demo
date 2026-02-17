// Noun Colorizer (Demo v2) — predict → reveal → fade
const BASE_NOUNS = new Set([
  "time","year","people","person","man","woman","child","children","day","way","thing","world","life","work","school",
  "state","family","student","group","country","problem","hand","part","place","case","week","company","system","program",
  "question","government","number","night","point","home","water","room","mother","area","money","story","fact","month",
  "lot","right","study","book","eye","job","word","business","issue","side","kind","head","house","service","friend",
  "power","hour","game","line","end","member","law","car","city","community","name","president","team","meeting",
  "proposal","timeline","launch","report","trend","prices","article","methods","studies","results","sentence","sentences",
  "clauses","camera","page","tool","support","practice","structure","lens","reader","readers","attention","anchor","anchors",
  "idea","ideas","object","objects","museum","morning","staff","exhibits","doors","changes","lighting","visitors","color",
  "detail","artifact","display","curator","preservation","case","public","gallery","checklist","security","setup","climate","controls"
]);

const NOUN_SUFFIXES = ["tion","sion","ment","ness","ity","ship","ism","age","ance","ence","hood","dom","ery","or","er"];

const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","so","because","while","as","of","to","in","on","at","for","with","from",
  "by","into","over","under","after","before","during","between","within","without","about","against","through",
  "is","am","are","was","were","be","been","being","do","does","did","have","has","had",
  "i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","their","our",
  "this","that","these","those","there","here",
  "not","no","yes","very","more","most","less","least","just","only","also"
]);

function tokenize(text) {
  return text.match(/\w+['’]?\w*|[^\w\s]+|\s+/g) || [];
}

function isLikelyNoun(word, conservative=false) {
  const w = word.toLowerCase();
  if (!w || STOPWORDS.has(w)) return false;
  if (/^\d+$/.test(w)) return false;
  if (BASE_NOUNS.has(w)) return true;

  for (const suf of NOUN_SUFFIXES) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) return true;
  }

  const isCapitalized = word[0] && word[0] === word[0].toUpperCase() && word.slice(1) !== word.slice(1).toUpperCase();
  if (isCapitalized && !conservative) return true;

  if (!conservative && w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) return true;

  return false;
}

function escapeHtml(s) {
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll("\"","&quot;")
    .replaceAll("'","&#039;");
}

function render(text, showLines, conservative) {
  const tokens = tokenize(text);
  return tokens.map(tok => {
    if (/^\s+$/.test(tok)) return tok;
    if (/^\w/.test(tok) && showLines && isLikelyNoun(tok, conservative)) {
      return `<span class="noun">${escapeHtml(tok)}</span>`;
    }
    return escapeHtml(tok);
  }).join("");
}

const inp = document.getElementById("inp");
const out = document.getElementById("out");
const revealBtn = document.getElementById("reveal");
const hideBtn = document.getElementById("hide");
const resetBtn = document.getElementById("reset");
const conservativeChk = document.getElementById("conservative");
const prompt = document.getElementById("prompt");

let state = "predict"; // predict | revealed | hidden

function setPrompt() {
  if (state === "predict") {
    prompt.innerHTML = "<b>Step 1:</b> Before revealing anything, notice which words feel like anchors (people, places, things, ideas).";
  } else if (state === "revealed") {
    prompt.innerHTML = "<b>Step 2:</b> Lines confirm likely nouns. Key line: <i>This isn’t giving answers — it’s giving feedback.</i>";
  } else {
    prompt.innerHTML = "<b>Step 3:</b> Now read with the lines off. The goal is noticing structure without support.";
  }
}

function update() {
  const conservative = conservativeChk.checked;
  const showLines = (state === "revealed");
  out.innerHTML = render(inp.value || "", showLines, conservative);

  revealBtn.disabled = (state === "revealed");
  hideBtn.disabled = (state !== "revealed");
  setPrompt();
}

revealBtn.addEventListener("click", () => { state = "revealed"; update(); });
hideBtn.addEventListener("click", () => { state = "hidden"; update(); });
resetBtn.addEventListener("click", () => { state = "predict"; update(); });
conservativeChk.addEventListener("change", update);
inp.addEventListener("input", () => { if (state !== "revealed") update(); });

// initial render: no lines, predict mode
update();
