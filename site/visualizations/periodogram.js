import {generateRecord, moments, simulate, validateParameters} from './periodogram-engine.js';

const $ = id => document.getElementById(id);
const defaults = {blocks: 8, length: 16, sigma: 1, seed: 13};
let reasoningStep = 0;
const svgNS = 'http://www.w3.org/2000/svg';
const fmt = x => Number(x).toFixed(3);

function readControls() {
  const k = Number($('blocks').value), l = Number($('length').value);
  const sigma = Number($('sigma').value), seed = Number($('seed').value);
  if (!['blocks', 'length', 'sigma', 'seed'].every(id => $(id).validity.valid)) {
    throw new RangeError('Correct the highlighted input values to update the simulation.');
  }
  validateParameters(k, l, sigma, seed);
  return {k, l, sigma, seed};
}

function element(name, attributes, label) {
  const item = document.createElementNS(svgNS, name);
  Object.entries(attributes).forEach(([key, value]) => item.setAttribute(key, String(value)));
  if (label !== undefined) item.textContent = String(label);
  return item;
}

function drawHistogram(full, avg, power) {
  const svg = $('distribution');
  svg.replaceChildren();
  const bins = 20, startX = 65, width = 620, top = 27, bottom = 225;
  const counts = sets => {
    const result = Array(bins).fill(0);
    sets.forEach(v => result[Math.min(bins - 1, Math.max(0, Math.floor(v / (5 * power) * bins)))]++);
    return result;
  };
  const first = counts(full), second = counts(avg);
  const peak = Math.max(...first, ...second, 1);
  for (let t = 0; t <= 4; t++) {
    const y = bottom - t * (bottom - top) / 4;
    svg.append(element('line', {x1:startX,y1:y,x2:startX+width,y2:y,stroke:'var(--line)','stroke-width':1}));
    svg.append(element('text', {x:55,y:y+5,'text-anchor':'end',fill:'var(--faint)','font-size':12}, Math.round(peak*t/4)));
  }
  const binWidth = width / bins;
  for (let i = 0; i < bins; i++) {
    const x = startX + i * binWidth, w = binWidth * .43;
    const h1 = first[i] / peak * (bottom - top), h2 = second[i] / peak * (bottom - top);
    svg.append(element('rect', {x:x+1,y:bottom-h1,width:w,height:h1,rx:1,fill:'var(--violet)'}));
    svg.append(element('rect', {x:x+w+2,y:bottom-h2,width:w,height:h2,rx:1,fill:'var(--mint)'}));
  }
  for (let tick = 0; tick <= 5; tick++) {
    svg.append(element('text', {x:startX + tick/5*width,y:245,'text-anchor':'middle',fill:'var(--faint)','font-size':12}, tick === 5 ? '5+' : tick));
  }
  svg.append(element('text', {x:startX+width/2,y:270,'text-anchor':'middle',fill:'var(--muted)','font-size':12}, 'Estimated power / true power'));
  svg.append(element('text', {x:12,y:15,fill:'var(--faint)','font-size':12}, 'Trials'));
}

function renderSteps(model, parameters) {
  const k = parameters.k, l = parameters.l, sigma = parameters.sigma;
  const statements = [
    '1 / Model. We observe N = ' + (k*l) + ' independent samples from N(0, ' + fmt(sigma*sigma) + '). The true spectral power at f = 0 is σ².',
    '2 / Single estimate. Summing the entire record and squaring, then dividing by N, gives ' + fmt(model.full) + '. Its theoretical variance is 2σ⁴, regardless of N.',
    '3 / Block estimates. Compute Sₘ for each group of L = ' + l + ' samples, then Iₘ(0) = Sₘ²/L. Each block estimate is nonnegative and has expected value σ².',
    '4 / Average and check. The mean of K = ' + k + ' block estimates is ' + fmt(model.averaged) + '. Its theoretical variance is 2σ⁴/K. Change K to see why it becomes more concentrated.'
  ];
  $('step-explanation').textContent = statements[reasoningStep];
  $('next-step').textContent = reasoningStep === 3 ? 'Start reasoning again ↻' : 'Next reasoning step →';
  const body = $('block-rows');
  body.replaceChildren();
  const visible = Math.min(12, k);
  for (let i = 0; i < visible; i++) {
    const tr = document.createElement('tr');
    [String(i+1), fmt(model.blockSums[i]), fmt(model.blockPowers[i])].forEach(s => {
      const td = document.createElement('td');td.textContent = s;tr.append(td);
    });
    body.append(tr);
  }
  $('table-note').textContent = k > visible ? 'Showing the first ' + visible + ' of ' + k + ' blocks; all blocks are used in the average.' : 'All ' + k + ' blocks shown.';
}

function render() {
  try {
    const p = readControls();
    const record = generateRecord(p.k,p.l,p.sigma,p.seed);
    const theory = moments(p.sigma,p.k);
    const repetitions = simulate(p.k,p.l,p.sigma,p.seed,320);
    $('total').textContent = String(p.k*p.l);
    $('true-power').textContent = fmt(theory.power);
    $('single-result').textContent = fmt(record.full);
    $('average-result').textContent = fmt(record.averaged);
    $('single-variance').textContent = fmt(theory.fullVariance);
    $('average-variance').textContent = fmt(theory.averageVariance);
    $('empirical-single').textContent = fmt(repetitions.fullStats.variance);
    $('empirical-average').textContent = fmt(repetitions.averageStats.variance);
    $('hist-description').textContent = 'Theoretical variance is ' + fmt(theory.fullVariance) + ' for the full-record estimate and ' + fmt(theory.averageVariance) + ' for the block average. Individual Monte Carlo estimates fluctuate around these population values.';
    drawHistogram(repetitions.fullValues,repetitions.averageValues,theory.power);
    renderSteps(record,p);
    $('status').textContent = 'Seed ' + p.seed + ' · K = ' + p.k + ' · L = ' + p.l + ' · f = 0';
  } catch (error) { $('status').textContent = error.message; }
}

$('parameters').addEventListener('input', render);
$('parameters').addEventListener('submit', event => event.preventDefault());
$('resample').addEventListener('click', () => {
  try {
    const p = readControls();
    $('seed').value = String((p.seed + 1) >>> 0);
    render();
  } catch (error) { $('status').textContent = error.message; }
});
$('reset').addEventListener('click', () => {
  Object.entries(defaults).forEach(([key,value]) => { $(key).value = String(value); });
  reasoningStep = 0;
  render();
});
$('next-step').addEventListener('click', () => {reasoningStep = (reasoningStep + 1) % 4;render();});
render();
