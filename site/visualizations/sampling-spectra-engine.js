// Original educational DSP engines, independent of rendering and course source files.
const tau = 2 * Math.PI;
function finite(value, name) {
  if (!Number.isFinite(value)) throw new RangeError(name + " must be finite.");
}
export function aliasFrequency(signalHz, sampleHz) {
  finite(signalHz, "Signal frequency");
  finite(sampleHz, "Sample rate");
  if (signalHz < 0 || sampleHz <= 0) throw new RangeError("Signal frequency must be nonnegative and sampling rate positive.");
  const remainder = ((signalHz % sampleHz) + sampleHz) % sampleHz;
  const frequency = Math.min(remainder, sampleHz - remainder);
  return {frequency, normalized:frequency/sampleHz, nyquist:sampleHz/2,
    strictlyUnaliased:signalHz < sampleHz/2, atNyquist:Math.abs(signalHz-sampleHz/2)<1e-10};
}
export function sampledCosine(signalHz,sampleHz,count=24,phase=0){
  const alias=aliasFrequency(signalHz,sampleHz);
  if (!Number.isInteger(count) || count<4 || count>256) throw new RangeError("Count must be an integer in 4..256.");
  finite(phase,"Phase");
  return {...alias, samples:Array.from({length:count},(_,n)=>({t:n/sampleHz,value:Math.cos(tau*signalHz*n/sampleHz+phase)}))};
}
export function dftWindowedCosine({N=32,frequency=5.5/32,window="rectangular",phase=0}={}){
  if (!Number.isInteger(N)||N<8||N>128) throw new RangeError("N must be an integer in 8..128.");
  finite(frequency,"Frequency");finite(phase,"Phase");
  if(frequency<0||frequency>0.5)throw new RangeError("Frequency must be within 0..0.5 cycles/sample.");
  if(!["rectangular","hann"].includes(window))throw new RangeError("Unknown window.");
  const samples=Array.from({length:N},(_,n)=>Math.cos(tau*frequency*n+phase));
  const weights=Array.from({length:N},(_,n)=>window==="rectangular"?1:0.5*(1-Math.cos(tau*n/(N-1))));
  const sumWeights=weights.reduce((a,b)=>a+b,0);
  const spectrum=Array.from({length:Math.floor(N/2)+1},(_,k)=>{
    let re=0,im=0;
    for(let n=0;n<N;n++){
      const a=tau*k*n/N, v=samples[n]*weights[n];
      re+=v*Math.cos(a);im-=v*Math.sin(a);
    }
    const magnitude=Math.hypot(re,im);
    const factor=(k===0||(N%2===0&&k===N/2))?1:2;
    return {bin:k,cyclesPerSample:k/N,magnitude,amplitude:factor*magnitude/sumWeights};
  });
  const nearest=Math.round(frequency*N);
  const peak=spectrum.reduce((a,b)=>b.amplitude>a.amplitude?b:a,spectrum[0]);
  const centerDistance=Math.abs(N*frequency-nearest);
  const weightedEnergy=weights.reduce((total,w,n)=>total+(samples[n]*w)**2,0);
  // Full two-sided Parseval energy from the half spectrum (no reliance on FFT library).
  const spectralEnergy=spectrum.reduce((total,x)=>total+(x.bin===0||(N%2===0&&x.bin===N/2)?1:2)*x.magnitude**2,0)/N;
  return {N,frequency,window,phase,samples,weights,sumWeights,spectrum,nearest,centerDistance,
    peak,weightedEnergy,spectralEnergy,resolution:1/N};
}
