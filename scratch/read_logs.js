const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\rjkaj\\.gemini\\antigravity\\brain\\9231b99d-f066-40ab-b69d-90e4c6516f01\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  for await (const line of rl) {
    lines.push(JSON.parse(line));
  }

  console.log('Total steps:', lines.length);
  console.log('--- RECENT 10 STEPS ---');
  for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
    const step = lines[i];
    console.log(`Step ${step.step_index} | Source: ${step.source} | Type: ${step.type}`);
    if (step.content) {
      console.log('Content preview:', step.content.substring(0, 300));
    }
    if (step.tool_calls) {
      console.log('Tool calls:', JSON.stringify(step.tool_calls));
    }
    console.log('-----------------------------');
  }
}

main().catch(console.error);
