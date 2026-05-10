import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SCHEDULE } from '../data/schedule.js';
import MatchCard from '../components/MatchCard.jsx';

function CountdownTimer() {
  const target = new Date('2026-06-11T00:00:00-05:00').getTime();
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'Days',    value: timeLeft.days },
    { label: 'Hours',   value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-end gap-5 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <motion.span
            key={value}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter tabular-nums leading-none"
          >
            {String(value ?? 0).padStart(2, '0')}
          </motion.span>
          <span className="text-2xs text-gray-600 uppercase tracking-widest mt-2">{label}</span>
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    num: '01',
    title: 'Live Match Analysis',
    desc: 'Bayesian win probabilities updated with every goal. See how each event reshapes the distribution.',
    to: '/matches',
  },
  {
    num: '02',
    title: 'Team & Group Explorer',
    desc: 'Compare 48 national teams with ELO ratings, radar charts, and squad depth profiles.',
    to: '/groups',
  },
  {
    num: '03',
    title: 'Poisson Simulation',
    desc: 'Adjustable attack, defense, and home-advantage sliders generate a full scoreline probability matrix.',
    to: '/learn',
  },
  {
    num: '04',
    title: 'Prediction Scoring',
    desc: 'Make outcome predictions and measure accuracy with the Brier Score — the mathematically honest rule.',
    to: '/predictions',
  },
];

const STATS = [
  { value: '48',  label: 'Teams' },
  { value: '104', label: 'Matches' },
  { value: '16',  label: 'Stadiums' },
  { value: '16',  label: 'Host Cities' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function Home() {
  const liveMatches     = SCHEDULE.filter(m => m.status === 'LIVE');
  const upcomingMatches = SCHEDULE.filter(m => m.status === 'SCHEDULED').slice(0, 4);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-5">
        <div className="max-w-4xl mx-auto">

          {liveMatches.length > 0 && (
            <motion.div {...fadeUp(0)} className="mb-8">
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-wcGreen rounded-full live-pulse" />
                {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} live now
              </Link>
            </motion.div>
          )}

          <motion.h1
            {...fadeUp(0.05)}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-6 text-white"
          >
            World<br />
            Cup<br />
            <span className="text-wcGreen">2026</span>
          </motion.h1>

          <motion.p {...fadeUp(0.12)} className="text-base text-gray-500 max-w-md leading-relaxed mb-14">
            Poisson simulation, Bayesian analysis, and deep statistics
            for all 48 teams and 104 matches. No noise — just math.
          </motion.p>

          <motion.div {...fadeUp(0.18)} className="mb-14">
            <p className="text-2xs text-gray-600 uppercase tracking-widest mb-5">
              Tournament opens · Jun 11, 2026
            </p>
            <CountdownTimer />
          </motion.div>

          <motion.div {...fadeUp(0.22)} className="flex flex-wrap gap-3">
            <Link
              to="/matches"
              className="px-5 py-2.5 bg-wcGreen text-black text-sm font-bold rounded-lg hover:bg-wcGreen/90 transition-colors"
            >
              View Matches
            </Link>
            <Link
              to="/learn"
              className="px-5 py-2.5 border border-white/10 text-sm font-medium text-gray-300 rounded-lg hover:border-white/25 hover:text-white transition-colors"
            >
              Explore Models
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="section-divider">
        <div className="max-w-4xl mx-auto px-5 py-8 grid grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white tabular-nums">{value}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <section className="max-w-4xl mx-auto px-5 py-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xs text-gray-600 uppercase tracking-widest mb-8"
        >
          What you can do
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.06]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={f.to}
                className="group flex flex-col gap-4 p-6 bg-wcCard hover:bg-white/[0.05] transition-colors h-full"
              >
                <span className="text-2xs font-black text-wcGreen tracking-widest">{f.num}</span>
                <div>
                  <h3 className="font-bold text-white mb-2 group-hover:text-wcGreen transition-colors">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section className="max-w-4xl mx-auto px-5 pb-16 section-divider pt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-wcGreen rounded-full live-pulse" />
              <h2 className="text-sm font-semibold text-white">Live now</h2>
              <span className="text-xs text-gray-600">{liveMatches.length}</span>
            </div>
            <Link to="/matches" className="text-xs text-gray-600 hover:text-wcGreen transition-colors">
              All matches →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="max-w-4xl mx-auto px-5 pb-20 section-divider pt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-white">Upcoming matches</h2>
          <Link to="/matches" className="text-xs text-gray-600 hover:text-wcGreen transition-colors">
            Full schedule →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>

    </div>
  );
}
