
const colors = ['#0072B2', '#F59700', '#F0E442', '#37124A'];
const colorNames = {
  '#0072B2': 'Blue',
  '#F59700': 'Orange',
  '#F0E442': 'Yellow',
  '#37124A': 'Purple'
};

let monsters = [];
let score = 0;
let round = 1;
let correctLabels = [];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMonster(color, eyes, horns, highlight = false) {
  let hornsSVG = horns
    ? '<polygon points="20,10 30,0 40,10" fill="white" /><polygon points="60,10 70,0 80,10" fill="white" />'
    : '';

  let eyesSVG = eyes === 1
    ? '<circle cx="50" cy="50" r="8" fill="white" /><circle cx="50" cy="50" r="4" fill="black" />'
    : '<circle cx="35" cy="50" r="8" fill="white" /><circle cx="35" cy="50" r="4" fill="black" />' +
      '<circle cx="65" cy="50" r="8" fill="white" /><circle cx="65" cy="50" r="4" fill="black" />';

  let highlightSVG = highlight
    ? '<circle class="highlight-ring" cx="50" cy="50" r="38" fill="none" />'
    : '';

  const svgHTML = `
    <svg class="monster" viewBox="0 0 100 100">
      ${highlightSVG}
      <rect x="20" y="20" width="60" height="60" rx="10" fill="${color}" />
      ${hornsSVG}
      ${eyesSVG}
    </svg>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = svgHTML;
  return wrapper.firstElementChild;
}

function renderGrid(monsterList) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  monsterList.forEach(monster => {
    const monsterSVG = generateMonster(monster.color, monster.eyes, monster.horns, monster.highlight);
    grid.appendChild(monsterSVG);
  });
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function nextRound() {
  if (round >= 10) {
    alert("Game Over! Final score: " + score);
    round = 1;
    score = 0;
  } else {
    round++;
  }

  document.getElementById("round").textContent = round;
  document.getElementById("next-round").disabled = true;
  document.getElementById("submit-answer").disabled = false;
  document.getElementById("feedback").textContent = "";
  generateClassificationQuestion();
  updateScore();
}

function generateClassificationQuestion() {
  const questionEl = document.getElementById("question");
  const answersEl = document.getElementById("answers");
  answersEl.innerHTML = "";
  correctLabels = [];

  let highlightFilter, useSample, traitType, value;

  // Generate real monster set and retry if no highlights
  do {
    useSample = Math.random() < 0.5;
    traitType = getRandomElement(['horns', 'color']);
    value = traitType === 'horns' ? true : getRandomElement(colors);

    highlightFilter = useSample
      ? m => m[traitType] === value && Math.random() < 0.5
      : m => m[traitType] === value;

    monsters = [];
    for (let i = 0; i < 20; i++) {
      const color = getRandomElement(colors);
      const eyes = Math.random() < 0.5 ? 1 : 2;
      const horns = Math.random() < 0.5;
      const m = { color, eyes, horns };
      m.highlight = highlightFilter(m);
      monsters.push(m);
    }
  } while (monsters.filter(m => m.highlight).length === 0);

  renderGrid(monsters);

  const total = monsters.length;
  const highlighted = monsters.filter(m => m.highlight).length;
  const traitLabel = traitType === 'horns' ? "horned monster" : `${colorNames[value]} monster`;

  if (useSample) correctLabels.push(`A sample of the ${traitLabel} population`);
  else correctLabels.push(`The whole ${traitLabel} population`);

  if (highlighted === total) correctLabels.push(`The whole monster population`);
  else correctLabels.push(`A sample of the whole monster population`);

  const allOptions = [
    `A sample of the ${traitLabel} population`,
    `The whole ${traitLabel} population`,
    `The whole monster population`,
    `A sample of the whole monster population`
  ];

  const options = [...new Set(allOptions)].sort(() => Math.random() - 0.5);

  questionEl.textContent = "What can we call the highlighted group?";

  options.forEach(label => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => {
      btn.classList.toggle("selected");
    };
    answersEl.appendChild(btn);
  });
}

document.getElementById("submit-answer").onclick = () => {
  const buttons = Array.from(document.getElementById("answers").children);
  const selected = buttons.filter(btn => btn.classList.contains("selected")).map(btn => btn.textContent);

  let allCorrect = selected.length > 0 &&
                   selected.every(label => correctLabels.includes(label)) &&
                   correctLabels.every(label => selected.includes(label));

  buttons.forEach(btn => {
    const label = btn.textContent;
    if (correctLabels.includes(label)) btn.classList.add("correct");
    if (btn.classList.contains("selected") && !correctLabels.includes(label)) {
      btn.classList.add("wrong");
    }
    btn.disabled = true;
  });

  const feedback = document.getElementById("feedback");
  if (allCorrect) {
    score += 10;
    feedback.textContent = "✅ Nice! You got it right.";
  } else {
    score -= 5;
    feedback.textContent = "❌ Oops! Some selections were incorrect.";
  }

  updateScore();
  document.getElementById("next-round").disabled = false;
  document.getElementById("submit-answer").disabled = true;
};

document.getElementById("next-round").onclick = nextRound;

document.addEventListener("DOMContentLoaded", () => {
  generateClassificationQuestion();
  updateScore();
});
