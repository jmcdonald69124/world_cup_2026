import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import OddsExplainer from '../components/OddsExplainer.jsx';
import BayesianExplainer from '../components/BayesianExplainer.jsx';
import GoalDistribution from '../components/charts/GoalDistribution.jsx';

const SECTIONS = [
  { id: 'odds', label: 'Understanding Odds' },
  { id: 'xg', label: 'Expected Goals (xG)' },
  { id: 'bayesian', label: 'Bayesian Probability' },
  { id: 'elo', label: 'ELO Ratings' },
  { id: 'match-stats', label: 'Match Statistics' },
  { id: 'bookmaker', label: "The Bookmaker's Edge" },
];

function KeyConcept({ children }) {
  return (
    <div className="bg-wcGold/10 border border-wcGold/20 rounded-xl p-4 my-4">
      <div className="flex items-start gap-3">
        <span className="text-wcGold text-lg flex-shrink-0">💡</span>
        <p className="text-sm text-gray-200 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function SectionHeader({ id, title, emoji }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-4 pt-8">
      <span className="text-3xl">{emoji}</span>
      <h2 className="text-2xl font-black text-white">{title}</h2>
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
    const height = 280;
    const scale = width / 100;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', width).attr('height', height)
      .attr('fill', '#0f4c21')
      .attr('rx', 4);

    const paLeft = (50 - 16) * scale;
    const paRight = (50 + 16) * scale;
    const paBottom = 55 * scale;
    svg.append('rect')
      .attr('x', paLeft).attr('y', 0)
      .attr('width', paRight - paLeft).attr('height', paBottom)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 1.5);

    svg.append('rect')
      .attr('x', (50 - 5.5) * scale).attr('y', 0)
      .attr('width', 11 * scale).attr('height', 18 * scale)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 1.5);

    svg.append('rect')
      .attr('x', (50 - 4) * scale).attr('y', -3)
      .attr('width', 8 * scale).attr('height', 6)
      .attr('fill', '#FFD700')
      .attr('opacity', 0.8);

    svg.append('circle')
      .attr('cx', 50 * scale).attr('cy', 36 * scale)
      .attr('r', 2).attr('fill', 'rgba(255,255,255,0.4)');

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(10 * scale)
      .startAngle(-1.1)
      .endAngle(1.1);
    svg.append('path')
      .attr('d', arc())
      .attr('transform', `translate(${50 * scale}, ${36 * scale})`)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1.5);

    const colorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(['#22c55e', '#FFD700', '#ef4444']);

    const tooltip = svg.append('g').attr('opacity', 0);
    const tooltipRect = tooltip.append('rect').attr('rx', 4).attr('fill', 'rgba(0,0,0,0.85)').attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);
    const tooltipText = tooltip.append('text').attr('fill', 'white').attr('font-size', 11);
    const tooltipText2 = tooltip.append('text').attr('fill', '#FFD700').attr('font-size', 11);

    shots.forEach((shot, i) => {
      const cx = shot.x * scale;
      const cy = shot.y * scale;
      const r = Math.max(6, shot.xg * 25);
      const color = colorScale(shot.xg);

      const g = svg.append('g').style('cursor', 'pointer');

      g.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', r)
        .attr('fill', color)
        .attr('fill-opacity', 0.6)
        .attr('stroke', color)
        .attr('stroke-width', shot.scored ? 2.5 : 1.5)
        .attr('opacity', 0)
        .transition().delay(i * 60).duration(300)
        .attr('opacity', 1);

      if (shot.scored) {
        g.append('text')
          .attr('x', cx).attr('y', cy + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', Math.max(8, r * 0.8))
          .attr('opacity', 0)
          .text('⚽')
          .transition().delay(i * 60 + 200).duration(300)
          .attr('opacity', 1);
      }

      g.on('mouseover', function (e) {
        const tText = `${shot.desc}`;
        const tText2 = `xG: ${shot.xg.toFixed(2)} ${shot.scored ? '✓ GOAL' : '✗ Miss'}`;
        tooltipText.text(tText);
        tooltipText2.text(tText2).attr('y', 26);
        const bw = Math.max(tText.length, tText2.length) * 6.5 + 16;
        tooltipRect.attr('width', bw).attr('height', 34).attr('y', 2);
        tooltipText.attr('y', 14).attr('x', 8);
        tooltipText2.attr('x', 8);

        let tx = cx + 10, ty = cy - 15;
        if (tx + bw > width) tx = cx - bw - 5;
        if (ty < 0) ty = cy + 10;
        tooltip.attr('transform', `translate(${tx},${ty})`).attr('opacity', 1);
      }).on('mouseout', function () {
        tooltip.attr('opacity', 0);
      });
    });

    const legendY = height - 28;
    const legendItems = [
      { label: 'Low xG (0.0-0.1)', color: '#22c55e' },
      { label: 'Med xG (0.1-0.4)', color: '#FFD700' },
      { label: 'High xG (0.4+)', color: '#ef4444' },
    ];
    legendItems.forEach((item, i) => {
      svg.append('circle')
        .attr('cx', 12 + i * (width / 3))
        .attr('cy', legendY + 8)
        .attr('r', 5)
        .attr('fill', item.color).attr('fill-opacity', 0.7);
      svg.append('text')
        .attr('x', 22 + i * (width / 3))
        .attr('y', legendY + 12)
        .attr('fill', 'rgba(255,255,255,0.7)')
        .attr('font-size', 9)
        .text(item.label);
    });

    svg.append('text')
      .attr('x', width - 5)
      .attr('y', legendY)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('font-size', 9)
      .text('Circle size = xG value');

  }, []);

  return <svg ref={svgRef} className="w-full rounded-lg" style={{ height: '280px' }} />;
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
            <input
              type="range"
              min="1400"
              max="2200"
              value={team.elo}
              onChange={(e) => { setTeam({ ...team, elo: parseInt(e.target.value) }); setResult(null); }}
              className="w-full accent-wcGold"
            />
            <div className="text-sm font-bold text-white mt-1">{team.name}: <span className="text-wcGold">{team.elo}</span></div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 rounded-lg p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">{teamA.name} win probability:</span>
          <span className="text-wcGreen font-bold">{(expectedA * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{teamB.name} win probability:</span>
          <span className="text-wcRed font-bold">{(expectedB * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Simulate a result:</p>
        <div className="flex gap-2">
          {[
            { label: `${teamA.name} wins`, value: 'win' },
            { label: 'Draw', value: 'draw' },
            { label: `${teamB.name} wins`, value: 'loss' },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => simulate(value)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                result?.outcome === value ? 'bg-wcGold/20 text-wcGold' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { team: teamA, newElo: result.newEloA, delta: result.deltaA },
            { team: teamB, newElo: result.newEloB, delta: result.deltaB },
          ].map(({ team, newElo, delta }, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{team.name}</div>
              <div className="text-lg font-black text-white">{team.elo} → {newElo}</div>
              <div className={`text-sm font-bold ${delta > 0 ? 'text-wcGreen' : delta < 0 ? 'text-wcRed' : 'text-gray-400'}`}>
                {delta > 0 ? '+' : ''}{delta} ELO
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function StatsEducation() {
  const [activeSection, setActiveSection] = useState('odds');

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Learn Statistics</h1>
          <p className="text-gray-500">Master the numbers behind the beautiful game — interactive explanations for every level.</p>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24 glass-card rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</h3>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === s.id
                        ? 'bg-wcGreen/20 text-wcGreen font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-12">
            <section>
              <SectionHeader id="odds" title="Understanding Odds" emoji="📊" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Betting odds are just a way of expressing probability. A bookmaker sets odds based on their assessment of what's likely to happen — but they also build in a margin (the "vig") to guarantee profit. Understanding how to convert between odds formats and calculate implied probabilities is the first step to critical thinking about football predictions.
              </p>
              <OddsExplainer homeTeam="Argentina" awayTeam="France" />
              <KeyConcept>
                Odds tell you both the payout and the implied probability. If you understand the margin, you can find "value bets" — outcomes where the true probability is higher than what the odds imply.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="xg" title="Expected Goals (xG)" emoji="🎯" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Expected Goals (xG) is a statistical measure that assigns a probability to each shot of resulting in a goal. It considers the shot's position on the pitch, the angle to goal, whether it was a header, whether it came from open play, and dozens of other factors. An xG of 0.3 means that shot had a 30% chance of being a goal.
              </p>

              <div className="glass-card rounded-xl p-4 mb-4">
                <h4 className="text-sm font-semibold text-white mb-3">Shot Map — hover for details</h4>
                <ShotMap />
                <p className="text-xs text-gray-500 mt-2 text-center">⚽ = Goal scored. Size and color represent xG value.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-wcGold mb-2">Why xG matters</h4>
                  <ul className="text-sm text-gray-400 space-y-1.5">
                    <li>• A team can win 3-0 but have an xG of 0.8 vs 2.1 — they got lucky</li>
                    <li>• xG predicts future performance better than goals scored</li>
                    <li>• Helps identify elite forwards vs lucky finishers</li>
                    <li>• Used by clubs to evaluate squad needs</li>
                  </ul>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-wcGold mb-2">xG by shot type</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { type: 'Tap-in (< 3m)', xg: 0.75 },
                      { type: 'Penalty', xg: 0.79 },
                      { type: 'Header from cross', xg: 0.12 },
                      { type: 'Long shot (> 25m)', xg: 0.03 },
                      { type: 'Direct free kick', xg: 0.07 },
                    ].map(({ type, xg }) => (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-400">{type}</span>
                          <span className="text-wcGold font-bold">{xg}</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-wcGold/60 rounded-full" style={{ width: `${xg * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <KeyConcept>
                xG is not destiny — a team can consistently outperform or underperform their xG. But over a full season, teams tend to regress toward their xG. A striker scoring 20 goals from 10 xG is on a hot streak; they'll likely come back down to earth.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="bayesian" title="Bayesian Probability in Football" emoji="🧭" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Bayesian probability is about updating your beliefs with new evidence. In football, we start with a prior probability based on team quality (ELO ratings), and then update it live as goals are scored. A goal for the underdog is much more informative than a goal for the heavy favorite.
              </p>
              <BayesianExplainer />
              <KeyConcept>
                The key insight of Bayesian thinking: your prediction should reflect all available information, and you should update it rationally when new information arrives. A 1-0 scoreline means very different things if it came from a 70% or a 30% favorite.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="elo" title="ELO Ratings Explained" emoji="⚡" />
              <p className="text-gray-400 leading-relaxed mb-4">
                The ELO system — originally developed for chess — is a way to rank teams based on match results. Win against a strong opponent: gain lots of points. Beat a weak team: gain fewer. Lose to a strong team: lose fewer points. The key formula uses the "expected" result vs. the actual result.
              </p>

              <div className="bg-gray-900/50 rounded-xl p-4 mb-4 text-center">
                <code className="text-wcGold text-sm font-mono">
                  New ELO = Old ELO + K × (Actual Score − Expected Score)
                </code>
                <p className="text-xs text-gray-500 mt-2">K = 32 (sensitivity factor) | Expected = 1 / (1 + 10^((OpponentELO - YourELO) / 400))</p>
              </div>

              <EloDemo />

              <KeyConcept>
                ELO ratings are more predictive of future match outcomes than FIFA rankings, which are based on a political formula. Argentina's ELO of ~2091 means they're expected to beat 95%+ of teams in a direct matchup.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="match-stats" title="Reading Match Statistics" emoji="📈" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Raw match stats can be deceptive. A team with 70% possession might be dominating — or they might be passing sideways while the opposition sits deep and counters. Context matters enormously.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { stat: 'Possession %', desc: "Percentage of time team controls the ball. High possession teams (>60%) tend to control tempo but don't always win. Counter-attacking teams can win with 35%.", good: '>55%', neutral: '45-55%', bad: '<40%' },
                  { stat: 'PPDA (Passes Allowed Per Defensive Action)', desc: 'How aggressively a team presses. Lower PPDA = more intense pressing. Elite pressing teams like Liverpool or Man City have PPDA of 5-7. Passive teams can be 12+.', good: '<7', neutral: '7-10', bad: '>12' },
                  { stat: 'Pass Accuracy %', desc: 'Percentage of passes successfully completed. Barcelona and Spain regularly achieve 92%+. Lower pass accuracy under pressure indicates team struggles when pressed.', good: '>85%', neutral: '75-85%', bad: '<70%' },
                  { stat: 'xG Difference (xGD)', desc: 'Expected Goals For minus Expected Goals Against. The best predictor of future results. Teams with consistently positive xGD tend to outperform their league table position.', good: '+0.5+', neutral: '-0.2 to +0.2', bad: '<-0.5' },
                ].map(({ stat, desc, good, neutral, bad }) => (
                  <div key={stat} className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-2">{stat}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{desc}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-wcGreen/15 text-wcGreen px-2 py-0.5 rounded">Good: {good}</span>
                      <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded">{neutral}</span>
                      <span className="bg-wcRed/15 text-wcRed px-2 py-0.5 rounded">Weak: {bad}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-white mb-3">When goals happen in World Cups</h4>
                <GoalDistribution />
                <p className="text-xs text-gray-500 mt-2">Goals peak in the 86-90' window as teams chase results. The 41-45' spike shows teams pushing before halftime.</p>
              </div>

              <KeyConcept>
                The most underrated stat: xG difference. A team winning matches despite negative xGD is getting lucky. A team losing despite positive xGD is unlucky. Both tend to revert to mean.
              </KeyConcept>
            </section>

            <section>
              <SectionHeader id="bookmaker" title="The Bookmaker's Edge" emoji="🏦" />
              <p className="text-gray-400 leading-relaxed mb-4">
                Bookmakers don't bet — they arbitrage. By setting odds that sum to more than 100% probability, they guarantee a profit regardless of the outcome. Understanding this "overround" (or "vig") is essential to thinking critically about betting.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-3">How bookmakers make money</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>1. Set odds so implied probabilities sum to ~105-108%</p>
                    <p>2. The extra 5-8% is pure profit margin</p>
                    <p>3. Try to balance book so liability is equal on all sides</p>
                    <p>4. Adjust odds in real-time based on betting patterns</p>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <h4 className="text-sm font-bold text-wcGold mb-3">Value Betting Concept</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">
                    A "value bet" is when you believe the true probability is higher than what the odds imply.
                  </p>
                  <div className="bg-white/5 rounded-lg p-3 text-xs">
                    <div>Bookmaker: Argentina at 1.80 (implied: 55.6%)</div>
                    <div>Your model: Argentina probability: 68%</div>
                    <div className="text-wcGreen font-semibold mt-1">→ Value bet! True prob &gt; implied prob</div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 border border-wcRed/20 bg-wcRed/5">
                <h4 className="text-sm font-bold text-white mb-2">⚠️ Important Disclaimer</h4>
                <p className="text-sm text-gray-400">
                  Even "value bets" lose frequently. The edge in sports betting is tiny and requires thousands of bets to materialize. Most casual bettors lose money long-term. This app is for educational purposes only — always gamble responsibly if you choose to bet.
                </p>
              </div>

              <KeyConcept>
                The house edge in sports betting (5-8%) is much lower than casino games (roulette: 2.7%, slots: 5-10%), but it's still nearly impossible to overcome at scale. Professional bettors who do beat the market typically have proprietary data models and bet at high volume.
              </KeyConcept>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
