/**
 * models.js — Statistical models for football prediction & evaluation.
 *
 * Pure functions only; no UI. Used by StatsEducation interactive demos and
 * for offline tournament forecasting.
 *
 *   Poisson + Dixon-Coles   Score-line probability matrix
 *   Monte Carlo              Tournament simulation
 *   Pythagorean              Win % from goals scored/conceded
 *   Bradley-Terry            Pairwise strength MLE from match results
 *   Bootstrap                Resampling for confidence intervals
 *   Markov chain             State machine for possession sequences
 */

function factorial(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poissonPmf(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function samplePoisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

export function dixonColesTau(homeGoals, awayGoals, lambdaH, lambdaA, rho) {
  if (homeGoals === 0 && awayGoals === 0) return 1 - lambdaH * lambdaA * rho;
  if (homeGoals === 0 && awayGoals === 1) return 1 + lambdaH * rho;
  if (homeGoals === 1 && awayGoals === 0) return 1 + lambdaA * rho;
  if (homeGoals === 1 && awayGoals === 1) return 1 - rho;
  return 1;
}

export function scoreMatrix(lambdaH, lambdaA, maxGoals = 6, rho = 0) {
  const grid = [];
  let total = 0;
  for (let i = 0; i <= maxGoals; i++) {
    const row = [];
    for (let j = 0; j <= maxGoals; j++) {
      const indep = poissonPmf(lambdaH, i) * poissonPmf(lambdaA, j);
      const tau = rho ? dixonColesTau(i, j, lambdaH, lambdaA, rho) : 1;
      const p = indep * tau;
      row.push(p);
      total += p;
    }
    grid.push(row);
  }
  if (total > 0 && Math.abs(total - 1) > 1e-9) {
    for (let i = 0; i <= maxGoals; i++)
      for (let j = 0; j <= maxGoals; j++) grid[i][j] /= total;
  }
  return grid;
}

export function outcomeProbs(matrix) {
  let home = 0, draw = 0, away = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (i > j) home += matrix[i][j];
      else if (i === j) draw += matrix[i][j];
      else away += matrix[i][j];
    }
  }
  return { home, draw, away };
}

export function simulateMatch(lambdaH, lambdaA) {
  const h = samplePoisson(lambdaH);
  const a = samplePoisson(lambdaA);
  return { home: h, away: a, result: h > a ? 'home' : h === a ? 'draw' : 'away' };
}

export function monteCarloMatch(lambdaH, lambdaA, n = 10000) {
  let home = 0, draw = 0, away = 0;
  for (let i = 0; i < n; i++) {
    const r = simulateMatch(lambdaH, lambdaA).result;
    if (r === 'home') home++;
    else if (r === 'draw') draw++;
    else away++;
  }
  return { home: home / n, draw: draw / n, away: away / n, n };
}

export function monteCarloGroup(teams, lambdaFn, n = 5000) {
  const fixtures = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ];
  const stats = teams.map(t => ({ code: t.code, totalPts: 0, top2Count: 0, top1Count: 0 }));

  for (let sim = 0; sim < n; sim++) {
    const pts = [0, 0, 0, 0];
    const gd = [0, 0, 0, 0];
    for (const [h, a] of fixtures) {
      const [lH, lA] = lambdaFn(teams[h].elo, teams[a].elo);
      const m = simulateMatch(lH, lA);
      gd[h] += m.home - m.away;
      gd[a] += m.away - m.home;
      if (m.result === 'home') pts[h] += 3;
      else if (m.result === 'away') pts[a] += 3;
      else { pts[h] += 1; pts[a] += 1; }
    }
    const ranked = [0, 1, 2, 3]
      .map(i => ({ i, pts: pts[i], gd: gd[i] }))
      .sort((x, y) => y.pts - x.pts || y.gd - x.gd);
    stats[ranked[0].i].top1Count++;
    stats[ranked[0].i].top2Count++;
    stats[ranked[1].i].top2Count++;
    for (let i = 0; i < 4; i++) stats[i].totalPts += pts[i];
  }
  return stats.map(s => ({
    code: s.code,
    avgPts: s.totalPts / n,
    top2: s.top2Count / n,
    win: s.top1Count / n,
  }));
}

export function pythagoreanWinPct(gf, ga, exp = 1.3) {
  if (gf <= 0 && ga <= 0) return 0.5;
  const num = Math.pow(gf, exp);
  return num / (num + Math.pow(ga, exp));
}

export function bradleyTerryFit(matches, teamCount, iterations = 100) {
  const wins = Array(teamCount).fill(0);
  const opponents = Array.from({ length: teamCount }, () => []);
  for (const m of matches) {
    if (m.result === 'draw') {
      wins[m.home] += 0.5; wins[m.away] += 0.5;
    } else if (m.result === 'home') {
      wins[m.home] += 1;
    } else {
      wins[m.away] += 1;
    }
    opponents[m.home].push(m.away);
    opponents[m.away].push(m.home);
  }
  let pi = Array(teamCount).fill(1);
  for (let iter = 0; iter < iterations; iter++) {
    const next = Array(teamCount).fill(0);
    for (let i = 0; i < teamCount; i++) {
      let denom = 0;
      for (const j of opponents[i]) denom += 1 / (pi[i] + pi[j]);
      next[i] = denom > 0 ? wins[i] / denom : pi[i];
    }
    const mean = next.reduce((s, v) => s + v, 0) / teamCount || 1;
    pi = next.map(v => v / mean);
  }
  return pi;
}

export function bootstrap(sample, statFn, nBoot = 1000, alpha = 0.05) {
  if (!sample.length) return { mean: 0, lo: 0, hi: 0 };
  const stats = [];
  for (let b = 0; b < nBoot; b++) {
    const resample = Array(sample.length);
    for (let i = 0; i < sample.length; i++) {
      resample[i] = sample[Math.floor(Math.random() * sample.length)];
    }
    stats.push(statFn(resample));
  }
  stats.sort((a, b) => a - b);
  const mean = stats.reduce((s, v) => s + v, 0) / nBoot;
  const loIdx = Math.floor((alpha / 2) * nBoot);
  const hiIdx = Math.floor((1 - alpha / 2) * nBoot);
  return { mean, lo: stats[loIdx], hi: stats[hiIdx] };
}

export function simulateMarkov(transitionMatrix, startState, maxSteps = 100) {
  const path = [startState];
  let current = startState;
  for (let step = 0; step < maxSteps; step++) {
    const row = transitionMatrix[current];
    const rowSum = row.reduce((s, v) => s + v, 0);
    if (rowSum === 0) break;
    if (row[current] === 1) break;
    const r = Math.random() * rowSum;
    let cum = 0;
    let next = current;
    for (let j = 0; j < row.length; j++) {
      cum += row[j];
      if (r <= cum) { next = j; break; }
    }
    path.push(next);
    if (next === current && row[current] === rowSum) break;
    current = next;
  }
  return path;
}

export function steadyState(transitionMatrix, iterations = 200) {
  const n = transitionMatrix.length;
  let dist = Array(n).fill(1 / n);
  for (let it = 0; it < iterations; it++) {
    const next = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) next[j] += dist[i] * transitionMatrix[i][j];
    }
    const total = next.reduce((s, v) => s + v, 0) || 1;
    dist = next.map(v => v / total);
  }
  return dist;
}

export function eloToLambda(homeElo, awayElo, baseGoals = 1.35, homeAdv = 0.3) {
  const diff = (homeElo - awayElo) / 400;
  const lambdaH = baseGoals * Math.pow(10, diff / 2) + homeAdv;
  const lambdaA = baseGoals * Math.pow(10, -diff / 2);
  return [Math.max(0.1, lambdaH), Math.max(0.1, lambdaA)];
}
