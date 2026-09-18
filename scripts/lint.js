import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 [LINT] Iniciando análisis estático y validación de sintaxis...');

const filesToLint = [
  path.join(rootDir, 'src', 'js', 'devopsUtils.js'),
  path.join(rootDir, 'src', 'js', 'app.js'),
  path.join(rootDir, 'tests', 'devopsUtils.test.js')
];

let errorsFound = 0;

for (const filePath of filesToLint) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  [LINT] Archivo omitido (no encontrado): ${path.relative(rootDir, filePath)}`);
    continue;
  }

  const relativePath = path.relative(rootDir, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check 1: Disallowed statements (like debugger)
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (/\bdebugger\b/.test(line)) {
      console.error(`❌ [LINT] ${relativePath}:${index + 1} - Se encontró instrucción 'debugger' no permitida en producción.`);
      errorsFound++;
    }
  });

  // Check 2: Node.js official syntax check (node --check)
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log(`✅ [LINT] Sintaxis válida: ${relativePath}`);
  } catch (err) {
    console.error(`❌ [LINT] Error de sintaxis en ${relativePath}:`, err.message);
    errorsFound++;
  }
}

if (errorsFound > 0) {
  console.error(`\n🚨 [LINT] Se encontraron ${errorsFound} errores durante la revisión.`);
  process.exit(1);
} else {
  console.log('\n✨ [LINT] Todos los archivos pasaron la validación de calidad.');
}
