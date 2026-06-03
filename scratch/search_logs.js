const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\rjkaj\\.gemini\\antigravity\\brain\\9231b99d-f066-40ab-b69d-90e4c6516f01\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const matches = [];
  let index = 0;
  for await (const line of rl) {
    const step = JSON.parse(line);
    const content = JSON.stringify(step);
    if (content.includes('invalid input syntax') || content.includes('type uuid')) {
      matches.push({ index, step });
    }
    index++;
  }

  console.log(`Found ${matches.length} matches in logs:`);
  for (const match of matches) {
    console.log(`\n--- Match at index ${match.index} (Step ${match.step.step_index}) | Source: ${match.step.source} | Type: ${match.step.type} ---`);
    console.log(JSON.stringify(match.step, null, 2));
  }
}

main().catch(console.error);
