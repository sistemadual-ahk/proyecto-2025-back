#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const exampleEnvPath = path.join(projectRoot, 'env.example');
const targetEnvPath = path.join(projectRoot, '.env');

if (!fs.existsSync(exampleEnvPath)) {
  console.error('No se encontró "env.example" en la raíz del proyecto.');
  process.exit(1);
}

try {
  const content = fs.readFileSync(exampleEnvPath, 'utf8');
  fs.writeFileSync(targetEnvPath, content, { encoding: 'utf8' });
  console.log('Archivo ".env" generado en la raíz del proyecto.');
} catch (error) {
  console.error('Error al generar el archivo .env:', error.message);
  process.exit(1);
}


