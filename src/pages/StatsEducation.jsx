import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import BayesianExplainer from '../components/BayesianExplainer.jsx';
import GoalDistribution from '../components/charts/GoalDistribution.jsx';
import MatchSimulator from '../components/MatchSimulator.jsx';

const SECTIONS = [
  { id: 'poisson', label: 'Poisson Goal Model' },
  { id: 'xg', label: 'Expected Goals (xG)' },
  { id: 'bayesian', label: 'Bayesian Probability' },
  { id: 'elo', label: 'ELO Ratings' },
  { id: 'match-stats', label: 'Match Statistics' },
  { id: 'monte-carlo', label: 'Monte Carlo Methods' },
];

function KeyConcept({ children }) {
  return (
    <div className="border-l-2 border-wcGreen/50 pl-4 my-5">
      <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}

function SectionHeader({ id, title }) {
  return (
    <div id={id} className="mb-5 pt-8">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="w-8 h-px bg-wcGreen mt-2" />
    </div>
  );
}

function Formula({ children, caption }) {
  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-xl p-4 my-4 text-center">
      <code className="text-wcGold text-sm font-mono">{children}</code>
      {caption && <p className="text-xs text-gray-500 mt-2">{caption}</p>}
    </div>
  );
}

function PoissonChart() {
  const svgRef = useRef(null);
  const [lambda, setLambda] = useState(1.5);

  useEffect(() => {
    if (!svgRef.current) return;
    const margin = { top: 15, right: 20, bottom: 45, left: 40 };
    const width = svgRef.current.parentElement?.clientWidth || 500;
    const height = 200;
    const iw = width - margin.left - margin.right;
    const ih = height - margin.top - margin.bottom;
    const maxK = 10;
    const data = Array.from({ length: maxK + 1 }, (_, k) => {
      let p = Math.exp(-lambda);
      for (let i = 1; i <= k; i++) p *= lambda / i;
      return { k, p };
    });
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const x = d3.scaleBand().domain(data.map(d => d.k)).range([0, iw]).padding(0.25);
    const y = d3.scaleLinear().domain([0, Math.max(...data.map(d => d.p)) * 1.15]).range([ih, 0]);
    y.ticks(4).forEach(t => {
      g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', y(t)).attr('y2', y(t)).attr('stroke', '#1f2937').attr('stroke-width', 1);
      g.append('text').attr('x', -6).attr('y', y(t)).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('fill', '#6B7280').attr('font-size', '10px').text((t * 100).toFixed(0) + '%');
    });
    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', d => x(d.k)).attr('width', x.bandwidth()).attr('y', d => y(d.p)).attr('height', d => ih - y(d.p))
      .attr('rx', 2).attr('fill', d => d.k === Math.round(lambda) ? '#00A550' : '#374151').attr('opacity', 0.9);
    data.forEach(d => {
      if (d.p > 0.01) {
        g.append('text').attr('x', x(d.k) + x.bandwidth() / 2).attr('y', y(d.p) - 4).attr('text-anchor', 'middle').attr('fill', '#9CA3AF').attr('font-size', '9px').text((d.p * 100).toFixed(1) + '%');
      }
    });
    data.forEach(d => {
      g.append('text').attr('x', x(d.k) + x.bandwidth() / 2).attr('y', ih + 15).attr('text-anchor', 'middle').attr('fill', '#6B7280').attr('font-size', '10px').text(d.k);
    });
    g.append('text').attr('x', iw / 2).attr('y', ih + 36).attr('text-anchor', 'middle').attr('fill', '#4B5563').attr('font-size', '10px').text('Goals scored');
  }, [lambda]);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">Goal probability distribution</span>
        <span className="text-xs text-gray-500">λ = {lambda.toFixed(1)} expected goals</span>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: '200px' }} />
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>λ = 0.5 (weak attack)</span>
          <span>λ = 3.0 (strong attack)</span>
        </div>
        <input type="range" min={0.5} max={3.0} step={0.1} value={lambda} onChange={e => setLambda(parseFloat(e.target.value))} className="w-full accent-wcGreen" />
      </div>
    </div>
  );
}

function ShotMap() {
  const svgRef = useRef(null);
  const shots = [
    { x: 50, y: 12, xg: 0.72, scored: true, desc: 'Tap-in from 3m' },
    { x: 50, y: 25, xg: 0.45, scored: true, desc: 'Central shot, 8m' },
    { x: 35, y: 20, xg: 0.22, scored: false, desc: 'Angle shot, left' },
    { x: 65, y: 20, xg: 0.18, scored: false, desc: 'Angle shot, right' },
    { x: 50, y: 35, xg: 0.12, scored: false, desc: 'Edge of box' },
    { x: 30, y: 30, xg: 0.08, scored: false, desc: 'Wide angle, 15m' },
    { x: 70, y: 28, xg: 0.09, scored: false, desc: 'Wide angle, 14m' },
    { x: 50, y: 45, xg: 0.06, scored: false, desc: 'Long shot, 20m' },
    { x: 40, y: 42, xg: 0.04, scored: false, desc: 'Long shot, left' },
    { x: 60, y: 40, xg: 0.05, scored: false, desc: 'Long shot, right' },
    { x: 45, y: 18, xg: 0.35, scored: false, desc: 'Six-yard box' },
    { x: 55, y: 15, xg: 0.55, scored: true, desc: 'Close range, right' },
  ];
  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.parentElement?.clientWidth || 400;
    const height = 260;
    const scale = width / 100;
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height).attr('fill', '#0f4c21').attr('rx', 4);
    const paLeft = (50 - 16) * scale, paRight = (50 + 16) * scale, paBottom = 55 * scale;
    svg.append('rect').attr('x', paLeft).attr('y', 0).attr('width', paRight - paLeft).attr('height', paBottom).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1.5);
    svg.append('rect').attr('x', (50 - 5.5) * scale).attr('y', 0).attr('width', 11 * scale).attr('height', 18 * scale).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1.5);
    svg.append('rect').attr('x', (50 - 4) * scale).attr('y', -3).attr('width', 8 * scale).attr('height', 6).attr('fill', '#FFD700').attr('opacity', 0.8);
    svg.append('circle').attr('cx', 50 * scale).attr('cy', 36 * scale).attr('r', 2).attr('fill', 'rgba(255,255,255,0.4)');
    const colorScale = d3.scaleLinear().domain([0, 0.5, 1]).range(['#22c55e', '#FFD700', '#ef4444']);
    const tooltip = svg.append('g').attr('opacity', 0);
    const tooltipRect = tooltip.append('rect').attr('rx', 4).attr('fill', 'rgba(0,0,0,0.85)').attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);
    const tooltipText = tooltip.append('text').attr('fill', 'white').attr('font-size', 11);
    const tooltipText2 = tooltip.append('text').attr('fill', '#FFD700').attr('font-size', 11);
    shots.forEach((shot, i) => {
      const cx = shot.x * scale, cy = shot.y * scale, r = Math.max(6, shot.xg * 25), color = colorScale(shot.xg);
      const g = svg.append('g').style('cursor', 'pointer');
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r).attr('fill', color).attr('fill-opacity', 0.6).attr('stroke', color).attr('stroke-width', shot.scored ? 2.5 : 1.5).attr('opacity', 0).transition().delay(i * 60).duration(300).attr('opacity', 1);
      if (shot.scored) { g.append('text').attr('x', cx).attr('y', cy + 4).attr('text-anchor', 'middle').attr('font-size', Math.max(8, r * 0.8)).attr('opacity', 0).text('G').attr('fill', 'white').attr('font-weight', 'bold').transition().delay(i * 60 + 200).duration(300).attr('opacity', 1); }
      g.on('mouseover', function (e) {
        const t1 = shot.desc, t2 = `xG: ${shot.xg.toFixed(2)} — ${shot.scored ? 'GOAL' : 'Miss'}`;
        tooltipText.text(t1); tooltipText2.text(t2).attr('y', 26);
        const bw = Math.max(t1.length, t2.length) * 6.5 + 16;
        tooltipRect.attr('width', bw).attr('height', 34).attr('y', 2);
        tooltipText.attr('y', 14).attr('x', 8); tooltipText2.attr('x', 8);
        let tx = cx + 10, ty = cy - 15;
        if (tx + bw > width) tx = cx - bw - 5;
        if (ty < 0) ty = cy + 10;
        tooltip.attr('transform', `translate(${tx},${ty})`).attr('opacity', 1);
      }).on('mouseout', () => tooltip.attr('opacity', 0));
    });
    const legendY = height - 26;
    [{ label: 'Low xG (< 0.1)', color: '#22c55e' }, { label: 'Med xG (0.1-0.4)', color: '#FFD700' }, { label: 'High xG (> 0.4)', color: '#ef4444' }].forEach((item, i) => {
      svg.append('circle').attr('cx', 10 + i * (width / 3)).attr('cy', legendY + 8).attr('r', 5).attr('fill', item.color).attr('fill-opacity', 0.7);
      svg.append('text').attr('x', 20 + i * (width / 3)).attr('y', legendY + 12).attr('fill', 'rgba(255,255,255,0.65)').attr('font-size', 9).text(item.label);
    });
  }, []);
  return <svg ref={svgRef} className="w-full rounded-lg" style={{ height: '260px' }} />;
}

function EloDemo() {
  const [teamA, setTeamA] = useState({ name: 'Argentina', elo: 2091 });
  const [teamB, setTeamB] = useState({ name: 'Chile', elo: 1690 });
  const [result, setResult] = useState(null);
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (teamB.elo - teamA.elo) / 400));
  const expectedB = 1 - expectedA;
  const simulate = (outcome) => {
    const sA = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
    const sB = 1 - sA;
    const newEloA = Math.round(teamA.elo + K * (sA - expectedA));
    const newEloB = Math.round(teamB.elo + K * (sB - expectedB));
    setResult({ newEloA, newEloB, deltaA: newEloA - teamA.elo, deltaB: newEloB - teamB.elo, outcome });
  };
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[{ team: teamA, setTeam: setTeamA }, { team: teamB, setTeam: setTeamB }].map(({ team, setTeam }, i) => (
          <div key={i}>
            <label className="text-xs text-gray-500 block mb-1">{i === 0 ? 'Team A' : 'Team B'} ELO</label>
            <input type="range" min="1400" max="2200" value={team.elo} onChange={(e) => { setTeam({ ...team, elo: parseInt(e.target.value) }); setResult(null); }} className="w-full accent-wcGold" />
            <div className="text-sm font-bold text-white mt-1">{team.name}: <span className="text-wcGold">{team.elo}</span></div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-400">{teamA.name} win probability:</span><span className="text-wcGreen font-bold">{(expectedA * 100).toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-gray-400">{teamB.name} win probability:</span><span className="text-wcRed font-bold">{(expectedB * 100).toFixed(1)}%</span></div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Simulate a result:</p>
        <div className="flex gap-2">
          {[{ label: `${teamA.name} wins`, value: 'win' }, { label: 'Draw', value: 'draw' }, { label: `${teamB.name} wins`, value: 'loss' }].map(({ label, value }) => (
            <button key={value} onClick={() => simulate(value)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${result?.outcome === value ? 'bg-wcGold/20 text-wcGold' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          {[{ team: teamA, newElo: result.newEloA, delta: result.deltaA }, { team: teamB, newElo: result.newEloB, delta: result.deltaB }].map(({ team, newElo, delta }, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{team.name}</div>
              <div className="text-lg font-black text-white">{team.elo} → {newElo}</div>
              <div className={`text-sm font-bold ${delta > 0 ? 'text-wcGreen' : delta < 0 ? 'text-wcRed' : 'text-gray-400'}`}>{delta > 0 ? '+' : ''}{delta} ELO</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function MonteCarloDemo() {
  const [homeElo] = useState(2091);
  const [awayElo] = useState(1820);
  const [N, setN] = useState(1000);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  function poissonSample(lambda) {
    let L = Math.exp(-lambda), p = 1, k = 0;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }
  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const eloFactor = (homeElo - awayElo) / 400;
      const homeXG = Math.max(0.3, 1.35 * Math.pow(10, eloFactor / 2) * 1.1);
      const awayXG = Math.max(0.3, 1.05 / Math.pow(10, eloFactor / 2));
      let homeWins = 0, draws = 0, awayWins = 0;
      const scoreCounts = {};
      for (let i = 0; i < N; i++) {
        const h = poissonSample(homeXG), a = poissonSample(awayXG);
        const key = `${h}-${a}`;
        scoreCounts[key] = (scoreCounts[key] || 0) + 1;
        if (h > a) homeWins++; else if (h === a) draws++; else awayWins++;
      }
      const topScores = Object.entries(scoreCounts).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([score, count]) => ({ score, pct: (count / N * 100).toFixed(1) }));
      setResults({ homeWins, draws, awayWins, topScores, N });
      setRunning(false);
    }, 50);
  };
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Simulations to run</p>
          <select value={N} onChange={e => setN(parseInt(e.target.value))} className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 outline-none">
            {[100, 500, 1000, 5000, 10000].map(n => (<option key={n} value={n}>{n.toLocaleString()} matches</option>))}
          </select>
        </div>
        <button onClick={run} disabled={running} className="px-5 py-2 bg-wcGreen text-black font-bold rounded-lg text-sm hover:bg-wcGreen/90 transition-all disabled:opacity-50">{running ? 'Running...' : 'Run simulation'}</button>
      </div>
      <div className="text-xs text-gray-600 bg-white/3 rounded-lg p-3">Argentina (ELO {homeElo}) vs France (ELO {awayElo}) · Home advantage ×1.1</div>
      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Argentina win', value: results.homeWins, color: 'text-wcGreen', bg: 'bg-wcGreen/10' }, { label: 'Draw', value: results.draws, color: 'text-gray-300', bg: 'bg-gray-700/30' }, { label: 'France win', value: results.awayWins, color: 'text-wcRed', bg: 'bg-wcRed/10' }].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <div className={`text-xl font-black ${color}`}>{(value / results.N * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                <div className="text-xs text-gray-600">{value} / {results.N}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">Most frequent scorelines</div>
            {results.topScores.map(({ score, pct }) => {
              const [h, a] = score.split('-').map(Number);
              const color = h > a ? 'bg-wcGreen' : h === a ? 'bg-gray-500' : 'bg-wcRed';
              return (
                <div key={score} className="flex items-center gap-3 mb-1.5">
                  <span className="w-10 text-right font-bold text-white text-xs tabular-nums">{score}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>
                  <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600">Each of the {results.N.toLocaleString()} simulations drew independent Poisson samples for home and away goals. Increasing N reduces sampling variance — the distribution converges to the analytical Poisson result.</p>
        </motion.div>
      )}
    </div>
  );
}

export default function StatsEducation() {
  const [activeSection, setActiveSection] = useState('poisson');
  const scrollTo = (id) => { setActiveSection(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Statistics & Modelling</h1>
          <p className="text-gray-500">The mathematical foundations behind football outcome prediction — with interactive tools you can manipulate.</p>
        </div>
        <div className="flex gap-8">
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24 glass-card rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</h3>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSection === s.id ? 'bg-wcGreen/20 text-wcGreen font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{s.label}</button>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-12">
            <section>
              <SectionHeader id="poisson" title="Poisson Goal Model" />
              <p className="text-gray-400 leading-relaxed mb-4">Football goals are rare, independent events — which makes the Poisson distribution a natural model. Given an expected number of goals λ (lambda), the Poisson formula gives the exact probability of scoring exactly k goals.</p>
              <Formula caption="λ = expected goals · k = goals scored · e ≈ 2.718 · k! = factorial">{'P(X = k) = (λᵏ · e⁻λ) / k!'}</Formula>
              <p className="text-gray-400 leading-relaxed mb-4">Drag the slider to see how the distribution shifts as λ changes. A team with λ = 1.5 is most likely to score 1 goal, while a λ = 2.5 team peaks at 2–3 goals.</p>
              <PoissonChart />
              <KeyConcept>For a full match, we model home and away goals as independent Poisson processes with means λH and λA. The joint probability of a scoreline (h, a) is P(h) × P(a) — multiplied because the two teams’ goals are treated as statistically independent.</KeyConcept>
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">The simulator below derives λH and λA from ELO ratings, then lets you adjust attack, defense, and home-advantage multipliers. The scoreline matrix shows P(h, a) for all h, a ≤ 6.</p>
                <MatchSimulator homeTeam="Argentina" awayTeam="France" homeElo={2091} awayElo={1820} />
              </div>
            </section>
            <section>
              <SectionHeader id="xg" title="Expected Goals (xG)" />
              <p className="text-gray-400 leading-relaxed mb-4">Expected Goals (xG) is the probability that a given shot results in a goal, based on historical data from thousands of similar shots. It accounts for position, angle, shot type, and game state. An xG of 0.3 means that shot had a 30% chance of being converted.</p>
              <div className="glass-card rounded-xl p-4 mb-4">
                <h4 className="text-sm font-semibold text-white mb-3">Shot map — hover for xG values</h4>
                <ShotMap />
                <p className="text-xs text-gray-500 mt-2 text-center">G = goal scored. Circle size and color represent xG value.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-2">Why xG matters</h4>
                  <ul className="text-sm text-gray-400 space-y-1.5">
                    <li>· A team can win 3–0 but have xG of 0.8 vs 2.1 — they overperformed</li>
                    <li>· xG is a stronger predictor of future performance than goals scored</li>
                    <li>· Identifies elite finishers vs statistical variance</li>
                    <li>· Used by clubs to evaluate squad and tactical needs</li>
                  </ul>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-2">xG by shot type</h4>
                  <div className="space-y-2 text-sm">
                    {[{ type: 'Tap-in (< 3m)', xg: 0.75 }, { type: 'Penalty', xg: 0.79 }, { type: 'Header from cross', xg: 0.12 }, { type: 'Long shot (> 25m)', xg: 0.03 }, { type: 'Direct free kick', xg: 0.07 }].map(({ type, xg }) => (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{type}</span><span className="text-wcGold font-bold">{xg}</span></div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-wcGold/60 rounded-full" style={{ width: `${xg * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <KeyConcept>xG is not destiny. A striker can consistently overperform their xG through elite placement or timing. But over hundreds of shots, most players revert toward expected conversion rates. A full season of xG data is much more reliable than a single match sample.</KeyConcept>
            </section>
            <section>
              <SectionHeader id="bayesian" title="Bayesian Probability in Football" />
              <p className="text-gray-400 leading-relaxed mb-4">Bayesian probability is about updating beliefs with new evidence. We start with a prior probability from ELO ratings, then update it live as goals are scored. The key insight: a goal from the underdog is more informative than a goal from the heavy favorite — it shifts probabilities further.</p>
              <BayesianExplainer />
              <KeyConcept>The update rule: posterior ∝ prior × likelihood. After a home goal, the new home-win probability is proportional to the old probability times “how likely would home score if they win.” This is Bayes’ theorem applied to match events.</KeyConcept>
            </section>
            <section>
              <SectionHeader id="elo" title="ELO Ratings" />
              <p className="text-gray-400 leading-relaxed mb-4">Originally developed for chess, the ELO system ranks teams based on match outcomes weighted by opponent strength. Win against a strong team: gain many points. Beat a weak team: gain fewer. The update formula compares the actual result against the statistically expected result.</p>
              <Formula caption="K = sensitivity factor (32) · Expected = 1 / (1 + 10^((Opp ELO − Your ELO) / 400))">{'New ELO = Old ELO + K × (Actual − Expected)'}</Formula>
              <EloDemo />
              <KeyConcept>ELO ratings are more predictive than FIFA rankings, which use a political weighting formula. ELO is purely historical: every past result is encoded in a single number. Argentina’s ELO of ~2091 implies a win probability of over 95% against a median international side.</KeyConcept>
            </section>
            <section>
              <SectionHeader id="match-stats" title="Reading Match Statistics" />
              <p className="text-gray-400 leading-relaxed mb-4">Raw match statistics can be misleading without context. A team with 70% possession might be dominating — or sitting deep against a high press. The most reliable stats are those that correlate with goals across large samples.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { stat: 'Possession %', desc: "Percentage of time a team controls the ball. High possession doesn't guarantee dominance — counter-attacking teams regularly win with 35–40%.", good: '> 55%', neutral: '45–55%', bad: '< 40%' },
                  { stat: 'PPDA', desc: 'Passes Allowed Per Defensive Action — a pressing intensity metric. Lower PPDA = more aggressive pressing. Elite pressing teams hit 5–7; passive teams exceed 12.', good: '< 7', neutral: '7–10', bad: '> 12' },
                  { stat: 'Pass Accuracy %', desc: 'Percentage of passes completed. High accuracy under pressure signals technical quality. Barcelona and Spain routinely achieve 92%+.', good: '> 85%', neutral: '75–85%', bad: '< 70%' },
                  { stat: 'xG Difference', desc: 'Expected Goals For minus Expected Goals Against per match. The strongest predictor of future results. Teams with positive xGD that underperform in results tend to recover.', good: '> +0.5', neutral: '−0.2 to +0.2', bad: '< −0.5' },
                ].map(({ stat, desc, good, neutral, bad }) => (
                  <div key={stat} className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-2">{stat}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{desc}</p>
                    <div className="flex gap-2 text-xs flex-wrap">
                      <span className="bg-wcGreen/15 text-wcGreen px-2 py-0.5 rounded">Strong: {good}</span>
                      <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded">{neutral}</span>
                      <span className="bg-wcRed/15 text-wcRed px-2 py-0.5 rounded">Weak: {bad}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-white mb-3">When goals are scored in World Cups</h4>
                <GoalDistribution />
                <p className="text-xs text-gray-500 mt-2">Goals peak in the 86–90 minute window as teams chase results. The 41–45 spike reflects pressure before halftime.</p>
              </div>
              <KeyConcept>The most underrated stat: xG difference. A team winning matches despite negative xGD is getting lucky — variance will correct. A team losing with positive xGD is unlucky. In a short tournament like the World Cup, such variance can determine the winner.</KeyConcept>
            </section>
            <section>
              <SectionHeader id="monte-carlo" title="Monte Carlo Methods" />
              <p className="text-gray-400 leading-relaxed mb-4">Monte Carlo simulation estimates probabilities by running thousands of random trials. Instead of computing the analytical Poisson probability, we draw random goal totals for each team in each simulated match and count outcomes. With enough trials, the distribution converges to the true analytical result.</p>
              <Formula caption="Draw independent Poisson samples for home and away goals N times, then count outcomes">{'Simulate N matches → count(home wins) / N ≈ P(home win)'}</Formula>
              <p className="text-gray-400 leading-relaxed mb-4">Run the simulator below and observe how the estimated probabilities stabilize as N increases. At N = 100 you see visible noise; at N = 10,000 the result closely matches the analytical Poisson calculation.</p>
              <MonteCarloDemo />
              <KeyConcept>Monte Carlo methods shine when analytical solutions are intractable — for example, simulating an entire 104-match tournament bracket, accounting for group-stage tiebreakers and round-of-32 seeding rules. Running 100,000 tournament simulations gives a full probability distribution over every possible outcome.</KeyConcept>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
