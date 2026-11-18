// Original educational model: real, zero-mean, i.i.d. Gaussian samples.
// This module deliberately models f = 0 cycles/sample only.
export function validateParameters(blockCount, blockLength, sigma, seed) {
  if (!Number.isInteger(blockCount) || blockCount < 1 || blockCount > 32) throw new RangeError('Block count must be an integer from 1 to 32.');
  if (!Number.isInteger(blockLength) || blockLength < 1 || blockLength > 128) throw new RangeError('Block length must be an integer from 1 to 128.');
  if (!Number.isFinite(sigma) || sigma <= 0 || sigma > 20) throw new RangeError('Standard deviation must be between 0 (exclusive) and 20.');
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 4294967295) throw new RangeError('Seed must be an unsigned 32-bit integer.');
}

export function moments(sigma, blockCount) {
  validateParameters(blockCount, 1, sigma, 0);
  const power = sigma * sigma;
  return { power, fullVariance: 2 * power * power, averageVariance: 2 * power * power / blockCount };
}

// Every block contributes L samples; the full-record estimate uses K*L samples.
// For K independent blocks at f = 0, E[I] = sigma^2 and Var[I] = 2 sigma^4.
export function estimateAtZero(samples, blockCount, blockLength) {
  if (!Number.isInteger(blockCount) || blockCount < 1 ||
      !Number.isInteger(blockLength) || blockLength < 1 ||
      !Array.isArray(samples) || samples.length !== blockCount * blockLength ||
      samples.some(x => !Number.isFinite(x))) {
    throw new TypeError('Provide K*L finite real samples and positive integer block dimensions.');
  }
  const blockSums = [];
  const blockPowers = [];
  let fullSum = 0;
  for (let k = 0; k < blockCount; k++) {
    let sum = 0;
    for (let n = 0; n < blockLength; n++) sum += samples[k * blockLength + n];
    blockSums.push(sum);
    blockPowers.push(sum * sum / blockLength);
    fullSum += sum;
  }
  return {
    blockSums,
    blockPowers,
    full: fullSum * fullSum / samples.length,
    averaged: blockPowers.reduce((a, b) => a + b, 0) / blockCount
  };
}

export function seededUniform(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(uniform) {
  const u = Math.max(uniform(), Number.MIN_VALUE);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * uniform());
}

export function generateRecord(blockCount, blockLength, sigma, seed) {
  validateParameters(blockCount, blockLength, sigma, seed);
  const rng = seededUniform(seed);
  const samples = Array.from({length: blockCount * blockLength}, () => sigma * gaussian(rng));
  return { samples, ...estimateAtZero(samples, blockCount, blockLength) };
}

export function sampleMoments(values) {
  if (!Array.isArray(values) || values.length < 2 || values.some(x => !Number.isFinite(x))) {
    throw new TypeError('At least two finite observations are required.');
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / (values.length - 1);
  return { mean, variance };
}

// Independent records, seeded for reproducible classroom comparisons.
export function simulate(blockCount, blockLength, sigma, seed, trials = 320) {
  validateParameters(blockCount, blockLength, sigma, seed);
  if (!Number.isInteger(trials) || trials < 2 || trials > 5000) throw new RangeError('Trials must be between 2 and 5000.');
  const fullValues = [];
  const averageValues = [];
  for (let i = 0; i < trials; i++) {
    const record = generateRecord(blockCount, blockLength, sigma, (seed + Math.imul(i, 2654435761)) >>> 0);
    fullValues.push(record.full);
    averageValues.push(record.averaged);
  }
  return {
    fullValues,
    averageValues,
    fullStats: sampleMoments(fullValues),
    averageStats: sampleMoments(averageValues)
  };
}
