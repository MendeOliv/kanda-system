const fs = require('fs');
const backup = fs.readFileSync('src/ai/ai.service.ts.bak', 'utf8');
let lines = backup.split('\n');
// We are going to replace lines 151 to 167 (inclusive) with the newLines array.
const newLines = [
    "            this.logger.log(`Formatted results for Gemini: ${JSON.stringify(formattedResults)}`);",
    "            // Append the function call and result to the contents",
    "            contents.push({ role: 'model' as const, parts: [call] });",
    "            contents.push({",
    "              role: 'function' as const,",
    "              parts: [{",
    "                functionResponse: {",
    "                  name: call.name,",
    "                  response: formattedResults",
    "                }",
        "              }]",
    "            });",
    "            // Log the contents we are sending to the model for the final response",
    "            this.logger.log(`Contents for final generation: ${JSON.stringify(contents)}`);",
    "            // Break after first function call (we only support one for now)",
    "            break;"
];
// Remove the old 17 lines (from index 151 to 167 inclusive) and insert the newLines.
lines.splice(151, 17, ...newLines);
const updated = lines.join('\n');
fs.writeFileSync('src/ai/ai.service.ts', updated, 'utf8');
console.log('File updated');