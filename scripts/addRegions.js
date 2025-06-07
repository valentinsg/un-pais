// #region addRegions.js
const fs = require('fs');
const path = require('path');

function processFile(file) {
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;
  let data = fs.readFileSync(file, 'utf8');
  // Skip if already processed
  if (data.startsWith('// #region')) return;
  const regionStart = `// #region ${path.basename(file)}`;
  const regionEnd = '// #endregion';
  data = `${regionStart}\n${data}\n${regionEnd}\n`;
  fs.writeFileSync(file, data);
  console.log(`Processed ${file}`);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, '..'));

// #endregion
