const fs = require('fs');
const path = require('path');

const categories = [
  'morning',
  'discipline',
  'self_love',
  'anxiety',
  'mindset',
  'success',
];

const starters = [
  'You are',
  'Today is',
  'Your mind is',
  'Discipline is',
  'Success comes from',
  'Peace begins when',
];

const endings = [
  'stronger than you think.',
  'a new chance to grow.',
  'your greatest weapon.',
  'built one small step at a time.',
  'the result of daily effort.',
  "letting go of what you can't control.",
  'already within you.',
  'earned through consistency.',
];

function random(arr: any) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const quotes: any = [];

let idCounter = 1;

categories.forEach((category) => {
  for (let i = 0; i < 25; i++) {
    quotes.push({
      id: `q${idCounter++}`,
      text: `${random(starters)} ${random(endings)}`,
      category,
    });
  }
});

const outputPath = path.join(__dirname, '../assets/data/quotes.json');

fs.writeFileSync(outputPath, JSON.stringify(quotes, null, 2));

console.log(`✅ Seeded ${quotes.length} quotes successfully!`);
