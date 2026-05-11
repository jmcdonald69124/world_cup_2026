import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import BayesianExplainer from '../components/BayesianExplainer.jsx';
import GoalDistribution from '../components/charts/GoalDistribution.jsx';
import PoissonDemo from '../components/models/PoissonDemo.jsx';
import MonteCarloDemo from '../components/models/MonteCarloDemo.jsx';
import PythagoreanDemo from '../components/models/PythagoreanDemo.jsx';
import BradleyTerryDemo from '../components/models/BradleyTerryDemo.jsx';
import BootstrapDemo from '../components/models/BootstrapDemo.jsx';
import MarkovDemo from '../components/models/MarkovDemo.jsx';

const SECTIONS = [
  { id: 'xg',           label: 'Expected Goals (xG)' },
  { id: 'elo',          label: 'ELO Ratings' },
  { id: 'bayesian',     label: 'Bayesian Updating' },
  { id: 'poisson',      label: 'Poisson + Dixon-Coles' },
  { id: 'montecarlo',   label: 'Monte Carlo Sim' },
  { id: 'pythagorean',  label: 'Pythagorean' },
  { id: 'bradleyterry', label: 'Bradley-Terry' },
  { id: 'bootstrap',    label: 'Bootstrap CI' },
  { id: 'markov',       label: 'Markov Chains' },
  { id: 'match-stats',  label: 'Reading Match Stats' },
];

function KeyConcept({ children }) {
  return (
    <div className="border-l-2 border-wcGreen pl-4 my-4 py-1">
      <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}

function SectionHeader({ id, title }) {
  return (
    <div id={id} className="mb-3 pt-8">
      <div className="text-2xs text-wcGreen uppercase tracking-widest font-semibold mb-1">Model</div>
      <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
    </div>
  );
}

function Formula({ children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-md px-4 py-3 my-3 font-mono text-sm text-wcGreen overflow-x-auto">
      {children}
    </div>
  );
}

function ShotMap() {
  const svgRef = useRef(null);

  const shots = [
    { x: 50, y: 12, xg: 0.72, scored: true,  desc: 'Tap-in from 3m' },
    { x: 50, y: 25, xg: 0.45, scored: true,  desc: 'Central shot, 8m' },
    { x: 35, y: 20, xg: 0.22, scored: false, desc: 'Angle shot, left' },
    { x: 65, y: 20, xg: 0.18, scored: false, desc: 'Angle shot, right' },
    { x: 50, y: 35, xg: 0.12, scored: false, desc: 'Edge of box' },
    { x: 30, y: 30, xg: 0.08, scored: false, desc: 'Wide angle, 15m' },
    { x: 70, y: 28, xg: 0.09, scored: false, desc: 'Wide angle, 14m' },
    { x: 50, y: 45, xg: 0.06, scored: false, desc: 'Long shot, 20m' },
    { x: 40, y: 42, xg: 0.04, scored: false, desc: 'Long shot, left' },
    { x: 60, y: 40, xg: 0.05, scored: false, desc: 'Long shot, right' },
    { x: 45, y: 18, xg: 0.35, scored: false, desc: 'Six-yard box' },
    { x: 55, y: 15, xg: 0.55, scored: true,  desc: 'Close range, right' },
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.parentElement?.clientWidth || 400;
    const height = 280;
    const scale = width / 100;
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height)
      .attr('fill', '#0d3318').attr('rx', 4);
    const paLeft = (50 - 16) * scale, paRight = (50 + 16) * scale, paBottom = 55 * scale;
    svg.append('rect').attr('x', paLeft).attr('y', 0).attr('width', paRight - paLeft).attr('height', paBottom)
      .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1);
    svg.append('rect').attr('x', (50 - 5.5) * scale).attr('y', 0).attr('width', 11 * scale).attr('height', 18 * scale)
      .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1);
    svg.append('rect').attr('x', (50 - 4) * scale).attr('y', -3).attr('width', 8 * scale).attr('height', 6)
      .attr('fill', '#00A550').attr('opacity', 0.7);
    svg.append('circle').attr('cx', 50 * scale).attr('cy', 36 * scale).attr('r', 2).attr('fill', 'rgba(255,255,255,0.3)');

    const colorScale = d3.scaleLinear().domain([0, 0.5, 1]).range(['#6b7280', '#00A550', '#DA291C']);

    const tooltip = svg.append('g').attr('opacity', 0);
    const tooltipRect = tooltip.append('rect').attr('rx', 4).attr('fill', 'rgba(0,0,0,0.9)').attr('stroke', 'rgba(255,255,255,0.15)');
    const tt1 = tooltip.append('text').attr('fill', 'white').attr('font-size', 11);
    const tt2 = tooltip.append('text').attr('fill', '#00A550').attr('font-size', 11);

    shots.forEach((shot, i) => {
      const cx = shot.x * scale, cy = shot.y * scale;
      const r = Math.max(6, shot.xg * 25);
      const color = colorScale(shot.xg);
      const g = svg.append('g').style('cursor', 'pointer');
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', color).attr('fill-opacity', 0.5)
        .attr('stroke', color).attr('stroke-width', shot.scored ? 2 : 1)
        .attr('opacity', 0).transition().delay(i * 50).duration(250).attr('opacity', 1);
      if (shot.scored) {
        g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 2).attr('fill', 'white')
          .attr('opacity', 0).transition().delay(i * 50 + 150).duration(250).attr('opacity', 1);
      }
      g.on('mouseover', () => {
        tt1.text(shot.desc).attr('x', 8).attr('y', 14);
        tt2.text(`xG ${shot.xg.toFixed(2)} · ${shot.scored ? 'GOAL' : 'miss'}`).attr('x', 8).attr('y', 26);
        const bw = Math.max(shot.desc.length, 14) * 6.5 + 16;
        tooltipRect.attr('width', bw).attr('height', 32).attr('y', 2);
        let tx = cx + 10, ty = cy - 15;
        if (tx + bw > width) tx = cx - bw - 5;
        if (ty < 0) ty = cy + 10;
        tooltip.attr('transform', `translate(${tx},${ty})`).attr('opacity', 1);
      }).on('mouseout', () => tooltip.attr('opacity', 0));
    });
  }, []);

  return <svg ref={svgRef} className="w-full rounded-md" style={{ height: '280px' }} />;
}

function EloDemo() {
  const [teamA, setTeamA] = useState({ name: 'Argentina', elo: 2091 });
  const [teamB, setTeamB] = useState({ name: 'Chile',     elo: 1690 });
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
    <div className="card rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[{ team: teamA, setTeam: setTeamA }, { team: teamB, setTeam: setTeamB }].map(({ team, setTeam }, i) => (
          <div key={i}>
            <label className="text-xs text-gray-500 block mb-1">{i === 0 ? 'Team A' : 'Team B'} ELO</label>
            <input type="range" min="1400" max="2200" value={team.elo}
              onChange={(e) => { setTeam({ ...team, elo: parseInt(e.target.value, 10) }); setResult(null); }}
              className="w-full accent-wcGreen" />
            <div className="text-sm font-bold text-white mt-1">{team.name}: <span className="text-wcGreen tabular-nums">{team.elo}</span></div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] rounded-md p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">{teamA.name} win probability</span>
          <span className="text-wcGreen font-bold tabular-nums">{(expectedA * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{teamB.name} win probability</span>
          <span className="text-wcRed font-bold tabular-nums">{(expectedB * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div>
        <p className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Simulate a result</p>
        <div className="flex gap-2">
          {[
            { label: `${teamA.name} wins`, value: 'win'  },
            { label: 'Draw',                value: 'draw' },
            { label: `${teamB.name} wins`, value: 'loss' },
          ].map(({ label, value }) => (
            <button key={value} onClick={() => simulate(value)}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                result?.outcome === value ? 'bg-wcGreen/20 text-wcGreen' : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3">
          {[
            { team: teamA, newElo: result.newEloA, delta: result.deltaA },
            { team: teamB, newElo: result.newEloB, delta: result.deltaB },
          ].map(({ team, newElo, delta }, i) => (
            <div key={i} className="bg-white/[0.03] rounded-md p-3 text-center">
              <div className="text-2xs text-gray-600 uppercase tracking-widest">{team.name}</div>
              <div className="text-lg font-black text-white tabular-nums">{team.elo} → {newElo}</div>
              <div className={`text-sm font-bold tabular-nums ${delta > 0 ? 'text-wcGreen' : delta < 0 ? 'text-wcRed' : 'text-gray-500'}`}>
                {delta > 0 ? '+' : ''}{delta}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function StatsEducation() {
  const [activeSection, setActiveSection] = useState('xg');

  useEffect(() => {
    const ids = SECTIONS.map(s => s.id);
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top < 120) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="mb-10">
          <p className="text-2xs text-gray-600 uppercase tracking-widest mb-3">Learn</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3 leading-none">
            Statistical models<br />for football
          </h1>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed">
            Ten interactive demos, from xG and ELO to Markov chains and bootstrap CIs.
            Every model is a different lens on the same question: what is going to happen, and how confident should we be?
          </p>
        </div>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <div className="text-2xs text-gray-600 uppercase tracking-widest mb-3">Contents</div>
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      activeSection === s.id
                        ? 'text-wcGreen bg-wcGreen/[0.06]'
                        : 'text-gray-500 hover:text-gray-200'
                    }`}>{s.label}</button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-12">

            <section>
              <SectionHeader id="xg" title="Expected Goals (xG)" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Each shot gets a probability of becoming a goal based on its location, angle, body part, and context.
                An xG of 0.3 means that shot, taken thousands of times, would score about 30% of the time.
              </p>
              <div className="card rounded-xl p-4 mb-3">
                <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">Shot map — hover for details</div>
                <ShotMap />
              </div>
              <KeyConcept>
                Teams regress to their xG over time. A striker scoring 20 goals from 10 xG is on a hot streak; one
                scoring 5 from 12 xG is unlucky. xG predicts future scoring better than past goals.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="elo" title="ELO Ratings" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Originally designed for chess by Arpad Elo. Each team has a rating; after a match, points flow from
                the loser to the winner. Beating a much stronger opponent gains more points than beating a weak one.
              </p>
              <Formula>New rating = old + K · (actual − expected)</Formula>
              <p className="text-2xs text-gray-600 mb-3">
                K = 32 (sensitivity). Expected = 1 / (1 + 10^((opp − you) / 400)).
              </p>
              <EloDemo />
              <KeyConcept>
                ELO is a moving estimator of true strength. It can be slow to react to roster changes and ignores
                margin of victory in its basic form — extensions like Elo-Goals or World Football Elo address both.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="bayesian" title="Bayesian Updating" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Start with a prior (e.g. ELO-based win probability). As goals are scored, update the probability
                using Bayes' rule. An early goal for the underdog is far more informative than one for the favourite.
              </p>
              <Formula>P(outcome | goal) ∝ P(goal | outcome) · P(outcome)</Formula>
              <BayesianExplainer />
              <KeyConcept>
                Bayesian updating is what lets a model's win-probability curve react in real time. A 1–0 score line
                means very different things if it came from a 70% or a 30% favourite — Bayes captures that.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="poisson" title="Poisson + Dixon-Coles" />
              <p className="text-gray-400 leading-relaxed mb-3">
                The Poisson distribution is the workhorse of football scoring models. If a team's expected goals
                in a match is λ, then the probability of scoring exactly k goals is Pois(k; λ). Modelling each
                team independently gives you the full grid of score-line probabilities.
              </p>
              <Formula>P(X = k) = (λ^k · e^−λ) / k!</Formula>
              <p className="text-gray-400 leading-relaxed mb-3 text-sm">
                Dixon &amp; Coles (1997) noticed that pure Poisson under-predicts 0-0, 1-1 and other low-score
                draws. Their correction multiplies the four low-score cells by a small factor τ(i, j) parameterised
                by ρ (typically ≈ −0.1 for football). Toggle it below.
              </p>
              <PoissonDemo />
              <KeyConcept>
                Most professional models start from Poisson and then layer on corrections: time-decayed strengths
                (recent form weighs more), home/away splits, and Dixon-Coles for low scores. The skeleton survives.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="montecarlo" title="Monte Carlo simulation" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Rather than computing probabilities in closed form, simulate the tournament thousands of times
                and count outcomes. Each simulated match draws goals from Poisson(λ) using the teams' ELO
                ratings; each simulated group plays all six fixtures; the fraction of sims where a team finishes
                top-2 is the empirical advance probability.
              </p>
              <Formula>P(advance) ≈ (# simulations where team is top-2) / N</Formula>
              <MonteCarloDemo />
              <KeyConcept>
                Monte Carlo trades closed-form elegance for flexibility. You can plug in any rule — best-third
                tiebreakers, sudden-death penalties, group-of-death effects — and get a probability out, as long
                as you can simulate it.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="pythagorean" title="Pythagorean expectation" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Bill James invented this in 1980 to predict baseball wins from runs scored and runs allowed.
                The football-fit exponent is around 1.3 (much lower than baseball's 2). A team consistently
                outperforming its Pythagorean expectation is usually getting lucky in close games.
              </p>
              <Formula>Win% = GF^e / (GF^e + GA^e)</Formula>
              <PythagoreanDemo />
              <KeyConcept>
                Why it works: scoring is roughly proportional to true strength; defending is too. The ratio of
                scoring rates is a noise-robust estimator of relative quality, and it mean-reverts.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="bradleyterry" title="Bradley-Terry pairwise model" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Assigns each team a positive strength π. The probability that team i beats team j is simply
                π_i / (π_i + π_j). Given a list of past results, the strengths can be estimated by maximum
                likelihood — iterating until convergence.
              </p>
              <Formula>P(i beats j) = π_i / (π_i + π_j)</Formula>
              <BradleyTerryDemo />
              <KeyConcept>
                Unlike ELO, Bradley-Terry has no decay or update rule — it fits all past results jointly. It's
                the basis for many pairwise ranking systems, including some chess and esports ratings.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="bootstrap" title="Bootstrap confidence intervals" />
              <p className="text-gray-400 leading-relaxed mb-3">
                A single number prediction lies about the world's uncertainty. The bootstrap (Efron, 1979)
                resamples the data with replacement many times and recomputes the statistic on each resample.
                The spread of those values is your confidence interval — no normality assumption required.
              </p>
              <Formula>resample n times → recompute → take 2.5% and 97.5% quantiles</Formula>
              <BootstrapDemo />
              <KeyConcept>
                Bootstrap is one of the most useful tools in applied stats. It turns a model into an honest
                uncertainty interval, even when the underlying distribution has no clean analytic form.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="markov" title="Markov chains" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Model a possession as moving between discrete states — defensive third, middle, attacking,
                shot, goal. Each transition is governed only by the current state (the Markov property).
                Multiply transition probabilities to get end-to-end outcomes.
              </p>
              <Formula>P(next | current, history) = P(next | current)</Formula>
              <MarkovDemo />
              <KeyConcept>
                Real football has memory — fatigue, scoreline pressure, momentum — that Markov chains throw away.
                But the state-machine framing is powerful: extensions like xT (expected threat) value every
                pass and dribble by where it moves the ball in the chain.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="match-stats" title="Reading match statistics" />
              <p className="text-gray-400 leading-relaxed mb-3">
                Raw stats lie. 70% possession can mean dominance or sterile passing under a low block.
                Context — what the score was, who was pressing, where on the pitch — turns numbers into stories.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  { stat: 'Possession %',          desc: 'Time controlling the ball. >60% can indicate control or sterility. Counter-attackers win with 35%.' },
                  { stat: 'PPDA (pressing index)', desc: 'Passes allowed per defensive action. Lower = more intense press. Elite teams ~5-7; passive teams 12+.' },
                  { stat: 'Pass accuracy %',       desc: 'Completed passes / attempted. Top sides hit 90%+. A drop under pressure exposes squad depth.' },
                  { stat: 'xG difference (xGD)',   desc: 'xG for minus xG against. Best leading indicator of future results. Positive xGD with negative actual GD = unlucky.' },
                ].map(({ stat, desc }) => (
                  <div key={stat} className="card rounded-xl p-4">
                    <div className="text-sm font-bold text-white mb-1.5">{stat}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="card rounded-xl p-4">
                <div className="text-2xs text-gray-600 uppercase tracking-widest mb-2">When goals happen in World Cups</div>
                <GoalDistribution />
                <p className="text-2xs text-gray-700 mt-2">Goals cluster at 86–90' (teams chasing) and 41–45' (push before halftime).</p>
              </div>
              <KeyConcept>
                The single most underrated stat in football analytics is xG difference. It survives small-sample
                noise better than goals scored and predicts future tables more reliably than current ones.
              </KeyConcept>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
