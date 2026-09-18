import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUptime,
  calculateCFR,
  calculateMTTR,
  calculateDeploymentFrequency,
  evaluateHealthStatus,
  classifyDORAPerformance
} from '../src/js/devopsUtils.js';

describe('DevOps Metrics & Calculation Engine Tests', () => {

  describe('calculateUptime', () => {
    test('should calculate 100% uptime when downtime is 0', () => {
      const uptime = calculateUptime(0, 30);
      assert.strictEqual(uptime, 100);
    });

    test('should calculate 99.9% uptime for ~43.2 minutes downtime in 30 days', () => {
      const uptime = calculateUptime(43.2, 30);
      assert.strictEqual(uptime, 99.9);
    });

    test('should throw error on invalid inputs', () => {
      assert.throws(() => calculateUptime(-5, 30), /negative/);
      assert.throws(() => calculateUptime(10, 0), /greater than 0/);
    });
  });

  describe('calculateCFR (Change Failure Rate)', () => {
    test('should return 0% when no failed deployments', () => {
      const cfr = calculateCFR(0, 20);
      assert.strictEqual(cfr, 0);
    });

    test('should return 10% for 2 failures in 20 deployments', () => {
      const cfr = calculateCFR(2, 20);
      assert.strictEqual(cfr, 10);
    });

    test('should return 0% when total deployments is 0', () => {
      const cfr = calculateCFR(0, 0);
      assert.strictEqual(cfr, 0);
    });

    test('should throw error when failures exceed total', () => {
      assert.throws(() => calculateCFR(15, 10), /exceed/);
    });
  });

  describe('calculateMTTR (Mean Time to Recovery)', () => {
    test('should calculate MTTR in hours correctly', () => {
      // 30 mins + 90 mins = 120 mins average 60 mins = 1.00 hour
      const mttr = calculateMTTR([30, 90]);
      assert.strictEqual(mttr, 1);
    });

    test('should return 0 for empty incident list', () => {
      assert.strictEqual(calculateMTTR([]), 0);
    });

    test('should handle single incident correctly', () => {
      assert.strictEqual(calculateMTTR([150]), 2.5);
    });
  });

  describe('calculateDeploymentFrequency', () => {
    test('should calculate daily deployments correctly', () => {
      const df = calculateDeploymentFrequency(14, 7);
      assert.strictEqual(df, 2);
    });

    test('should throw on negative deployment count', () => {
      assert.throws(() => calculateDeploymentFrequency(-1, 7), /negative/);
    });
  });

  describe('evaluateHealthStatus', () => {
    test('should return HEALTHY for low resource usage', () => {
      const health = evaluateHealthStatus(30, 45, 50);
      assert.strictEqual(health.status, 'HEALTHY');
      assert.strictEqual(health.issues.length, 0);
      assert.ok(health.score >= 70);
    });

    test('should return WARNING for high CPU usage', () => {
      const health = evaluateHealthStatus(78, 50, 40);
      assert.strictEqual(health.status, 'WARNING');
      assert.ok(health.issues.some(i => i.includes('CPU')));
    });

    test('should return CRITICAL for near exhaustion (>90%)', () => {
      const health = evaluateHealthStatus(95, 92, 50);
      assert.strictEqual(health.status, 'CRITICAL');
      assert.ok(health.issues.length >= 2);
    });
  });

  describe('classifyDORAPerformance', () => {
    test('should classify high-performing setup as Elite', () => {
      const dora = classifyDORAPerformance(10, 0.5, 3);
      assert.strictEqual(dora.tier, 'Elite');
    });

    test('should classify medium tier correctly', () => {
      const dora = classifyDORAPerformance(0.5, 48, 20);
      assert.strictEqual(dora.tier, 'Medium');
    });
  });

});
