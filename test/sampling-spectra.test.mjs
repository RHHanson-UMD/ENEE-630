import test from "node:test";
import assert from "node:assert/strict";
import {aliasFrequency,sampledCosine,dftWindowedCosine} from "../site/visualizations/sampling-spectra-engine.js";
import {readFileSync} from "node:fs";
const near=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`Expected ${a} ≈ ${b}`);
test("Nyquist alias folding examples and sampling boundaries",()=>{
 near(aliasFrequency(28,40).frequency,12);
 near(aliasFrequency(12,40).frequency,12);
 near(aliasFrequency(80,40).frequency,0);
 near(aliasFrequency(20,40).frequency,20);
 assert.equal(aliasFrequency(20,40).atNyquist,true);
 assert.equal(aliasFrequency(12,40).strictlyUnaliased,true);
 assert.equal(aliasFrequency(28,40).strictlyUnaliased,false);
});
test("aliased zero-phase cosines have identical sample sequences",()=>{
 const a=sampledCosine(12,40,36);
 const b=sampledCosine(28,40,36);
 for(let i=0;i<a.samples.length;i++)near(a.samples[i].value,b.samples[i].value,1e-10);
 // With nonzero phase, reflected aliases need opposite phase to coincide.
 const c=sampledCosine(12,40,36,Math.PI/3);
 const d=sampledCosine(28,40,36,-Math.PI/3);
 for(let i=0;i<c.samples.length;i++)near(c.samples[i].value,d.samples[i].value,1e-10);
});
test("DFT rectangular coherent bin isolates interior cosine peak",()=>{
 const s=dftWindowedCosine({N:32,frequency:5/32,window:"rectangular"});
 near(s.peak.amplitude,1);
 assert.equal(s.peak.bin,5);
 for(const bin of s.spectrum)if(bin.bin!==5)near(bin.amplitude,0,1e-10);
 near(s.weightedEnergy,s.spectralEnergy);
});
test("off-bin rectangular cosine spreads into other bins",()=>{
 const s=dftWindowedCosine({N:32,frequency:5.5/32,window:"rectangular"});
 assert.ok(s.spectrum.filter(x=>x.amplitude>.02).length>2);
 near(s.centerDistance,.5);
 near(s.weightedEnergy,s.spectralEnergy);
});
test("symmetric Hann taper and Parseval invariant across boundary cases",()=>{
 for(const N of [8,9,32,63,128]){
  for(const frequency of [0,.1,.5]){
   const s=dftWindowedCosine({N,frequency,window:"hann",phase:Math.PI/4});
   near(s.weights[0],0);near(s.weights[N-1],0);
   near(s.sumWeights,(N-1)/2,1e-9);
   near(s.weightedEnergy,s.spectralEnergy,1e-8);
  }
 }
});
test("reject invalid arguments",()=>{
 for(const params of [{N:0},{N:129},{N:9.5},{frequency:-.1},{frequency:.51},{frequency:NaN},{phase:Infinity},{window:"unknown"}]){
  assert.throws(()=>dftWindowedCosine(params),RangeError);
 }
 for(const args of [[-1,40],[10,0],[Infinity,40]])assert.throws(()=>aliasFrequency(...args),RangeError);
 assert.throws(()=>sampledCosine(10,40,3),RangeError);
});
test("course-cover and both lesson links are present in live-site source tree",()=>{
 const html=readFileSync("site/index.html","utf8");
 assert.match(html,/ENEE%20630%20Cover\.png/);
 assert.match(html,/sampling-aliasing\.html/);
 assert.match(html,/spectral-leakage\.html/);
 for(const page of ["site/visualizations/sampling-aliasing.html","site/visualizations/spectral-leakage.html"]){
  const src=readFileSync(page,"utf8");
  assert.match(src,/sampling-spectra-engine\.js/);
  assert.match(src,/Reset|Reset inputs/);
  assert.match(src,/aria-live="polite"/);
  assert.match(src,/type="module"/);
 }
});

test("original user-uploaded course cover is a valid PNG asset in the published tree",()=>{
 const bytes=readFileSync("site/assets/ENEE 630 Cover.png");
 assert.ok(bytes.byteLength>1000);
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(bytes.toString("ascii",12,16),"IHDR");
 assert.ok(bytes.readUInt32BE(16)>=500);
 assert.ok(bytes.readUInt32BE(20)>=500);
});
