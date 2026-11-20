// Original AR(1) Gaussian-process teaching engine. No DOM or private source data.
export function validateModel(rho, variance, order, neighbor) {
  if (!Number.isFinite(rho) || Math.abs(rho) >= 1) throw new RangeError("Require |rho| < 1 for the stationary AR(1) example.");
  if (!Number.isFinite(variance) || variance <= 0) throw new RangeError("Variance must be positive.");
  if (!Number.isInteger(order) || order < 0 || order > 6) throw new RangeError("Order must be an integer from 0 to 6.");
  if (!Number.isFinite(neighbor)) throw new RangeError("The observed adjacent sample must be finite.");
}
export function covarianceAtLag(variance, rho, lag) {
  if (!Number.isFinite(lag) || !Number.isInteger(lag)) throw new RangeError("Lag must be an integer.");
  if (!Number.isFinite(variance) || variance <= 0 || !Number.isFinite(rho) || Math.abs(rho) >= 1) {
    throw new RangeError("Invalid stationary AR(1) parameters.");
  }
  return variance * rho ** Math.abs(lag);
}
// For a zero-mean stationary Gaussian AR(1), X_0 is conditionally independent
// of all more distant past (or future) given the nearest sample.
export function predictionState({rho, variance, order, neighbor, direction = "forward"}) {
  validateModel(rho, variance, order, neighbor);
  if (direction !== "forward" && direction !== "backward") throw new RangeError("Invalid prediction direction.");
  const side = direction === "forward" ? -1 : 1;
  const indices = Array.from({length: order}, (_, k) => side * (k + 1));
  const coefficients = Array.from({length: order}, (_, k) => k === 0 ? rho : 0);
  const prediction = order === 0 ? 0 : rho * neighbor;
  const errorVariance = order === 0 ? variance : variance * (1 - rho ** 2);
  // Cov(e, X_neighbor[j]) = r[j] - rho*r[j-1] for every regressor j>=1.
  const residualCovariances = order === 0 ? [] : indices.map((_, k) =>
    covarianceAtLag(variance, rho, k + 1) - rho * covarianceAtLag(variance, rho, k));
  return {direction, indices, coefficients, prediction, errorVariance, residualCovariances,
    explanation: order === 0
      ? "Without observations, the zero-mean best linear estimate is zero."
      : "The nearest observed sample contains all linear prediction information for this AR(1) model; additional lags have zero optimal coefficients."};
}
