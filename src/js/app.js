import {
  calculateCFR,
  calculateMTTR,
  calculateDeploymentFrequency,
  evaluateHealthStatus,
  classifyDORAPerformance,
  calculateUptime
} from './devopsUtils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnRunPipeline = document.getElementById('btn-run-pipeline');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const terminalOutput = document.getElementById('terminal-output');
  const progressBar = document.getElementById('pipeline-progress-bar');
  const statusBadge = document.getElementById('pipeline-status-badge');
  const steps = {
    lint: document.getElementById('step-lint'),
    test: document.getElementById('step-test'),
    build: document.getElementById('step-build'),
    deploy: document.getElementById('step-deploy')
  };

  // DORA inputs
  const inputDeploys = document.getElementById('input-deploys-week');
  const inputTotalDeploys = document.getElementById('input-total-deploys');
  const inputFailedDeploys = document.getElementById('input-failed-deploys');
  const inputMttr = document.getElementById('input-mttr-minutes');
  const doraTierName = document.getElementById('dora-tier-name');
  const doraSummary = document.getElementById('dora-summary');

  // Health meters
  const meterCpu = document.getElementById('meter-cpu');
  const meterMem = document.getElementById('meter-mem');
  const meterDisk = document.getElementById('meter-disk');
  const labelCpu = document.getElementById('label-cpu');
  const labelMem = document.getElementById('label-mem');
  const labelDisk = document.getElementById('label-disk');

  // Quick stats
  const quickDf = document.getElementById('quick-df');
  const quickCfr = document.getElementById('quick-cfr');

  // Fetch build-info if available
  fetch('build-info.json')
    .then(res => res.json())
    .then(info => {
      const buildTimeEl = document.getElementById('build-time');
      if (buildTimeEl && info.builtAt) {
        buildTimeEl.textContent = new Date(info.builtAt).toLocaleString() + ` (${info.gitCommit || 'dev'})`;
      }
      const envBadge = document.getElementById('env-badge');
      if (envBadge && info.gitBranch) {
        envBadge.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span> Branch: ${info.gitBranch}`;
      }
    })
    .catch(() => {
      // Local dev mode without build-info.json
    });

  // --- DORA Calculator update logic ---
  function updateDoraMetrics() {
    const deploysWeek = Math.max(0, parseFloat(inputDeploys.value) || 0);
    const totalDeploys = Math.max(1, parseFloat(inputTotalDeploys.value) || 1);
    const failedDeploys = Math.min(totalDeploys, Math.max(0, parseFloat(inputFailedDeploys.value) || 0));
    const mttrMins = Math.max(0, parseFloat(inputMttr.value) || 0);

    const cfr = calculateCFR(failedDeploymentsToNumber(failedDeploys), totalDeploymentsToNumber(totalDeploys));
    const mttrHours = Number((mttrMins / 60).toFixed(2));
    const classification = classifyDORAPerformance(deploysWeek, mttrHours, cfr);

    doraTierName.textContent = classification.tier;
    doraTierName.style.color = classification.badgeColor;
    doraTierName.style.borderColor = classification.badgeColor;
    doraTierName.style.backgroundColor = `${classification.badgeColor}22`;
    doraSummary.textContent = classification.summary;

    if (quickDf) quickDf.textContent = `${(deploysWeek / 7).toFixed(1)} / día`;
    if (quickCfr) quickCfr.textContent = `${cfr}%`;
  }

  function failedDeploymentsToNumber(val) { return Number(val); }
  function totalDeploymentsToNumber(val) { return Number(val); }

  [inputDeploys, inputTotalDeploys, inputFailedDeploys, inputMttr].forEach(input => {
    input?.addEventListener('input', updateDoraMetrics);
  });
  updateDoraMetrics();

  // --- Terminal logging helper ---
  function appendLog(text, type = 'default') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${text}`;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function clearLogs() {
    terminalOutput.innerHTML = '';
    appendLog('Consola limpiada. Listo.', 'info');
  }

  btnClearLogs?.addEventListener('click', clearLogs);

  // --- Health Simulator Fluctuations ---
  let cpu = 28;
  let mem = 45;
  let disk = 38;

  function updateHealthUI() {
    cpu = Math.min(95, Math.max(12, cpu + (Math.random() * 8 - 4)));
    mem = Math.min(90, Math.max(25, mem + (Math.random() * 6 - 3)));

    const cpuVal = Math.round(cpu);
    const memVal = Math.round(mem);
    const diskVal = Math.round(disk);

    meterCpu.style.width = `${cpuVal}%`;
    meterMem.style.width = `${memVal}%`;
    meterDisk.style.width = `${diskVal}%`;

    labelCpu.textContent = `${cpuVal}%`;
    labelMem.textContent = `${memVal}%`;
    labelDisk.textContent = `${diskVal}%`;

    applyMeterColor(meterCpu, cpuVal);
    applyMeterColor(meterMem, memVal);
    applyMeterColor(meterDisk, diskVal);
  }

  function applyMeterColor(element, value) {
    element.className = 'health-meter-fill';
    if (value > 85) element.classList.add('critical');
    else if (value > 70) element.classList.add('warning');
  }

  setInterval(updateHealthUI, 3500);

  // --- Pipeline Simulation ---
  let isRunning = false;

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function resetPipelineVisuals() {
    progressBar.style.width = '0%';
    Object.values(steps).forEach(step => {
      step.className = 'pipeline-step';
    });
  }

  async function runPipeline() {
    if (isRunning) return;
    isRunning = true;
    btnRunPipeline.disabled = true;
    resetPipelineVisuals();

    statusBadge.textContent = 'Ejecutando...';
    statusBadge.className = 'badge-tag';
    statusBadge.style.color = '#38bdf8';
    statusBadge.style.borderColor = '#38bdf8';

    appendLog('🚀 GitHub Actions Runner inicializado (ubuntu-latest)', 'info');
    appendLog('Trigger: push en rama [develop] por Sebs0718', 'info');
    await sleep(600);

    // Stage 1: Lint
    steps.lint.classList.add('active');
    progressBar.style.width = '12%';
    appendLog('🔍 [STAGE 1: LINT] Ejecutando: node scripts/lint.js...', 'default');
    await sleep(700);
    appendLog('✓ Verificación de sintaxis y buenas prácticas superada.', 'success');
    steps.lint.classList.remove('active');
    steps.lint.classList.add('success');
    progressBar.style.width = '25%';

    // Stage 2: Test
    await sleep(400);
    steps.test.classList.add('active');
    progressBar.style.width = '37%';
    appendLog('🧪 [STAGE 2: TEST] Ejecutando: node --test tests/devopsUtils.test.js...', 'default');
    await sleep(800);
    appendLog('✓ 17/17 pruebas unitarias pasadas con 100% de éxito en 120ms.', 'success');
    steps.test.classList.remove('active');
    steps.test.classList.add('success');
    progressBar.style.width = '55%';

    // Stage 3: Build
    await sleep(400);
    steps.build.classList.add('active');
    progressBar.style.width = '70%';
    appendLog('📦 [STAGE 3: BUILD] Empaquetando distribución de producción en dist/...', 'default');
    await sleep(700);
    appendLog('✓ Generado manifiesto build-info.json y artefacto comprimido.', 'success');
    steps.build.classList.remove('active');
    steps.build.classList.add('success');
    progressBar.style.width = '80%';

    // Stage 4: Deploy
    await sleep(400);
    steps.deploy.classList.add('active');
    progressBar.style.width = '90%';
    appendLog('🌐 [STAGE 4: DEPLOY] Desplegando artefacto a GitHub Pages...', 'default');
    await sleep(900);
    appendLog('✨ Despliegue exitoso en GitHub Pages (Environment: github-pages)', 'success');
    steps.deploy.classList.remove('active');
    steps.deploy.classList.add('success');
    progressBar.style.width = '100%';

    // Finish
    statusBadge.textContent = 'Exitoso ✓';
    statusBadge.className = 'badge-tag emerald';
    appendLog('🎉 Pipeline completado satisfactoriamente (Status: SUCCESS).', 'success');

    isRunning = false;
    btnRunPipeline.disabled = false;
  }

  btnRunPipeline?.addEventListener('click', runPipeline);
});
