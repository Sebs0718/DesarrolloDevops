/**
 * DevOps Utilities & DORA Metrics Calculator Engine
 * Core calculations and health checking for CI/CD environments.
 */

/**
 * Calculates system uptime percentage.
 * @param {number} downtimeMinutes - Minutes the system was down.
 * @param {number} periodDays - Total observation period in days (default 30).
 * @returns {number} Uptime percentage (0 - 100) rounded to 3 decimal places.
 */
export function calculateUptime(downtimeMinutes = 0, periodDays = 30) {
  if (periodDays <= 0) throw new Error("Period days must be greater than 0");
  if (downtimeMinutes < 0) throw new Error("Downtime minutes cannot be negative");

  const totalMinutes = periodDays * 24 * 60;
  const uptimeMinutes = Math.max(0, totalMinutes - downtimeMinutes);
  const uptimePercentage = (uptimeMinutes / totalMinutes) * 100;
  return Number(uptimePercentage.toFixed(3));
}

/**
 * Calculates Change Failure Rate (CFR) - DORA Metric.
 * @param {number} failedDeployments - Number of deployments that caused incidents/rollbacks.
 * @param {number} totalDeployments - Total number of deployments attempted.
 * @returns {number} CFR percentage (0 - 100) rounded to 2 decimal places.
 */
export function calculateCFR(failedDeployments = 0, totalDeployments = 0) {
  if (totalDeployments < 0 || failedDeployments < 0) {
    throw new Error("Deployments count cannot be negative");
  }
  if (failedDeployments > totalDeployments) {
    throw new Error("Failed deployments cannot exceed total deployments");
  }
  if (totalDeployments === 0) return 0;

  const cfr = (failedDeployments / totalDeployments) * 100;
  return Number(cfr.toFixed(2));
}

/**
 * Calculates Mean Time to Resolution / Recovery (MTTR) in hours - DORA Metric.
 * @param {number[]} incidentDurationsInMinutes - Array of incident resolution durations in minutes.
 * @returns {number} MTTR in hours rounded to 2 decimal places.
 */
export function calculateMTTR(incidentDurationsInMinutes = []) {
  if (!Array.isArray(incidentDurationsInMinutes)) {
    throw new Error("Incident durations must be an array");
  }
  if (incidentDurationsInMinutes.length === 0) return 0;

  const validDurations = incidentDurationsInMinutes.filter(d => typeof d === 'number' && d >= 0);
  if (validDurations.length === 0) return 0;

  const totalMinutes = validDurations.reduce((acc, curr) => acc + curr, 0);
  const averageMinutes = totalMinutes / validDurations.length;
  const mttrHours = averageMinutes / 60;
  return Number(mttrHours.toFixed(2));
}

/**
 * Calculates Deployment Frequency (Deploys per day) - DORA Metric.
 * @param {number} deploymentsCount - Total successful deployments in timeframe.
 * @param {number} periodDays - Number of days in timeframe.
 * @returns {number} Deploys per day rounded to 2 decimal places.
 */
export function calculateDeploymentFrequency(deploymentsCount = 0, periodDays = 7) {
  if (periodDays <= 0) throw new Error("Period days must be greater than 0");
  if (deploymentsCount < 0) throw new Error("Deployments count cannot be negative");

  return Number((deploymentsCount / periodDays).toFixed(2));
}

/**
 * Evaluates overall infrastructure health based on metric thresholds.
 * @param {number} cpuPercent - Current CPU utilization (0-100).
 * @param {number} memoryPercent - Current Memory utilization (0-100).
 * @param {number} diskPercent - Current Disk utilization (0-100).
 * @returns {{ status: 'HEALTHY' | 'WARNING' | 'CRITICAL', score: number, issues: string[] }}
 */
export function evaluateHealthStatus(cpuPercent = 0, memoryPercent = 0, diskPercent = 0) {
  const issues = [];

  if (cpuPercent > 90) issues.push("CPU critical usage (>90%)");
  else if (cpuPercent > 75) issues.push("CPU warning usage (>75%)");

  if (memoryPercent > 90) issues.push("Memory critical usage (>90%)");
  else if (memoryPercent > 80) issues.push("Memory warning usage (>80%)");

  if (diskPercent > 90) issues.push("Disk storage nearly full (>90%)");
  else if (diskPercent > 85) issues.push("Disk storage warning (>85%)");

  const averageUsage = (cpuPercent + memoryPercent + diskPercent) / 3;
  const score = Math.max(0, Math.min(100, Math.round(100 - (averageUsage * 0.7 + (issues.length * 10)))));

  let status = 'HEALTHY';
  if (issues.some(i => i.includes('critical'))) {
    status = 'CRITICAL';
  } else if (issues.length > 0 || score < 70) {
    status = 'WARNING';
  }

  return {
    status,
    score,
    issues
  };
}

/**
 * Classifies DORA engineering team tier (Elite, High, Medium, Low).
 * @param {number} deploysPerWeek - Deploys per week.
 * @param {number} mttrHours - Mean time to recovery in hours.
 * @param {number} cfrPercent - Change failure rate percentage.
 * @returns {{ tier: 'Elite' | 'High' | 'Medium' | 'Low', badgeColor: string, summary: string }}
 */
export function classifyDORAPerformance(deploysPerWeek, mttrHours, cfrPercent) {
  if (deploysPerWeek >= 7 && mttrHours <= 1 && cfrPercent <= 5) {
    return {
      tier: 'Elite',
      badgeColor: '#10b981',
      summary: 'Multiple on-demand deploys per day, recovery in < 1h, CFR < 5%'
    };
  }
  if (deploysPerWeek >= 1 && mttrHours <= 24 && cfrPercent <= 15) {
    return {
      tier: 'High',
      badgeColor: '#3b82f6',
      summary: 'Weekly/Daily deploys, recovery < 1 day, CFR < 15%'
    };
  }
  if (deploysPerWeek >= 0.25 && mttrHours <= 168 && cfrPercent <= 30) {
    return {
      tier: 'Medium',
      badgeColor: '#f59e0b',
      summary: 'Monthly deploys, recovery < 1 week, CFR < 30%'
    };
  }
  return {
    tier: 'Low',
    badgeColor: '#ef4444',
    summary: 'Less than monthly deploys, slow recovery, higher failure rate'
  };
}
