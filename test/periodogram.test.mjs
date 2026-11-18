import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateAtZero, generateRecord, moments, simulate, sampleMoments, validateParameters} from '../site/visualizations/periodogram-engine.js';

test('fixed sample calculation separates full periodogram and block average', () => {
  const a = estimateAtZero([1, 2, 3, 4], 2, 2);
  assert.deepEqual(a.blockSums, [3, 7]);
  assert.deepEqual(a.blockPowers, [4.5, 24.5]);
  assert.equal(a.full, 25);
  assert.equal(a.averaged, 14.5);
});

test('one block exactly equals the full-record periodogram', () => {
  const a = estimateAtZero([-2, 1, 6, 3], 1, 4);
  assert.equal(a.full, a.averaged);
  assert.equal(a.full, 16);
});

test('analytic expectations and variances are independent of block length', () => {
  assert.deepEqual(moments(2, 8), { power: 4, fullVariance: 32, averageVariance: 4 });
  assert.deepEqual(moments(1, 1), { power: 1, fullVariance: 2, averageVariance: 2 });
});

test('same seed yields identical Gaussian record; changing seed changes it', () => {
  assert.deepEqual(generateRecord(3, 7, 2, 42), generateRecord(3, 7, 2, 42));
  assert.notDeepEqual(generateRecord(3, 7, 2, 42).samples, generateRecord(3, 7, 2, 43).samples);
});

test('input validation rejects malformed and nonfinite data', () => {
  assert.throws(() => estimateAtZero([1, 2, 3], 2, 2));
  assert.throws(() => estimateAtZero([1, Infinity], 1, 2));
  assert.throws(() => validateParameters(0, 4, 1, 0));
  assert.throws(() => validateParameters(1, 0, 1, 0));
  assert.throws(() => validateParameters(1, 4, -1, 0));
  assert.throws(() => validateParameters(1, 4, 1, -1));
  assert.throws(() => sampleMoments([1]));
});

test('reproducible Monte Carlo approaches known white-noise moments', () => {
  const result = simulate(8, 2, 1, 17, 3500);
  assert.ok(Math.abs(result.fullStats.mean - 1) < 0.09);
  assert.ok(Math.abs(result.averageStats.mean - 1) < 0.04);
  assert.ok(Math.abs(result.fullStats.variance - 2) < 0.25);
  assert.ok(Math.abs(result.averageStats.variance - 0.25) < 0.04);
  assert.ok(result.averageStats.variance < result.fullStats.variance);
});
