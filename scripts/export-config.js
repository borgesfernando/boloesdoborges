#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--in' || a === '-i') {
      opts.input = args[++i];
    } else if (a === '--out' || a === '-o') {
      opts.output = args[++i];
    }
  }
  return opts;
}

function main() {
  const { input, output } = parseArgs();
  if (!input || !output) {
    console.error('Uso: node scripts/export-config.js --in js/config.js --out js/config.json');
    process.exit(1);
  }
  const absIn = path.resolve(input);
  const absOut = path.resolve(output);

  const code = fs.readFileSync(absIn, 'utf8');
  const context = {};
  const script = new vm.Script(code + '\n;PROJETOS');
  const result = script.runInNewContext(context, { timeout: 1000 });

  const json = JSON.stringify(result, null, 2);
  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  fs.writeFileSync(absOut, json + '\n', 'utf8');

  console.log(`Gerado: ${absOut}`);
}

if (require.main === module) {
  main();
}

