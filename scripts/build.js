import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 [BUILD] Iniciando proceso de empaquetado y optimización para producción...');

// 1. Limpiar directorio dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Función recursiva para copiar archivos de src a dist
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, distDir);

// 3. Obtener metadatos de Git si están disponibles
let gitCommit = 'local-build';
let gitBranch = 'develop';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir }).toString().trim();
} catch (e) {
  // Ignorar si no está disponible git en el entorno
}

// 4. Generar manifiesto build-info.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const buildInfo = {
  name: packageJson.name,
  version: packageJson.version,
  builtAt: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'production',
  gitCommit: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : gitCommit,
  gitBranch: process.env.GITHUB_REF_NAME || gitBranch,
  builder: process.env.GITHUB_ACTOR || 'LocalDev'
};

fs.writeFileSync(path.join(distDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));

// 5. Inyectar metadatos en index.html si existe
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf-8');
  indexHtml = indexHtml.replace('{{BUILD_TIMESTAMP}}', buildInfo.builtAt);
  indexHtml = indexHtml.replace('{{BUILD_VERSION}}', buildInfo.version);
  indexHtml = indexHtml.replace('{{BUILD_COMMIT}}', buildInfo.gitCommit);
  fs.writeFileSync(indexPath, indexHtml);
}

console.log(`📦 [BUILD] Distribución generada con éxito en ${path.relative(rootDir, distDir)}/`);
console.log(`ℹ️ [BUILD] Versión: ${buildInfo.version} | Commit: ${buildInfo.gitCommit} | Fecha: ${buildInfo.builtAt}`);
