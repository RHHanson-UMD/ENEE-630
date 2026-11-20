import test from "node:test";
import assert from "node:assert/strict";
import {predictionState,covarianceAtLag} from "../site/visualizations/prediction-engine.js";
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12, `${a} != ${b}`);

test("independent order-one solution agrees with direct covariance normal equation",()=>{
 const s=predictionState({rho:0.4,variance:5,order:1,neighbor:3});
 const directCoefficient=covarianceAtLag(5,0.4,1)/covarianceAtLag(5,0.4,0);
 close(s.coefficients[0],directCoefficient);
 close(s.prediction,1.2);
 close(s.errorVariance,4.2);
 close(s.residualCovariances[0],0);
});
test("AR1 Markov order growth adds no information after nearest neighbor",()=>{
 const a=predictionState({rho:-0.6,variance:2,order:1,neighbor:4});
 const b=predictionState({rho:-0.6,variance:2,order:6,neighbor:4});
 close(a.prediction,-2.4);close(a.prediction,b.prediction);
 close(a.errorVariance,b.errorVariance);
 assert.deepEqual(b.coefficients,[-0.6,0,0,0,0,0]);
 for(const c of b.residualCovariances)close(c,0);
 assert.deepEqual(b.indices,[-1,-2,-3,-4,-5,-6]);
});
test("forward and backward stationary one-sided prediction are symmetric",()=>{
 const args={rho:0.7,variance:3,order:3,neighbor:-2};
 const a=predictionState({...args,direction:"forward"});
 const b=predictionState({...args,direction:"backward"});
 assert.deepEqual(a.indices,[-1,-2,-3]);
 assert.deepEqual(b.indices,[1,2,3]);
 close(a.prediction,b.prediction);close(a.errorVariance,b.errorVariance);
});
test("zero order and white noise boundaries",()=>{
 const z=predictionState({rho:0.95,variance:2,order:0,neighbor:100});
 assert.equal(z.prediction,0);assert.equal(z.errorVariance,2);
 assert.deepEqual(z.indices,[]);
 const w=predictionState({rho:0,variance:2,order:4,neighbor:100});
 assert.equal(w.prediction,0);assert.equal(w.errorVariance,2);
 assert.deepEqual(w.residualCovariances,[0,0,0,0]);
});
test("reject invalid and nonstationary models",()=>{
 const base={rho:0.5,variance:1,order:2,neighbor:1};
 for(const bad of [{rho:1},{rho:-1},{rho:NaN},{variance:0},{variance:-2},{order:7},{order:2.5},{neighbor:Infinity},{direction:"both"}]){
 assert.throws(()=>predictionState({...base,...bad}),RangeError);
 }
 assert.throws(()=>covarianceAtLag(1,0.4,0.25),RangeError);
});
