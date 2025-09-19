#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CONFIG_PATH = path.join(__dirname, '..', 'js', 'config.js');
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'projetos.json');

function main() {
  try {
    const input = fs.readFileSync(CONFIG_PATH, 'utf8');
    const match = input.match(/const\s+PROJETOS\s*=\s*(\{[\s\S]*?\});/);
    if (!match) {
      throw new Error('Não foi possível localizar "const PROJETOS = {...};" em js/config.js');
    }

    const objetoLiteral = match[1];

    // Avalia o objeto em um contexto isolado.
    // Usamos parênteses para que o literal seja avaliado diretamente como expressão.
    const sandbox = {};
    const PROJETOS = vm.runInNewContext(`(${objetoLiteral})`, sandbox, { timeout: 1000 });

    // Garante diretório de saída
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(PROJETOS, null, 2) + '\n', 'utf8');

    console.log(`Arquivo gerado: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('Falha ao extrair PROJETOS:', err.message);
    process.exit(1);
  }
}

main();

