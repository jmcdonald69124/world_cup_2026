import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SCHEDULE } from '../data/schedule.js';
import MatchCard from '../components/MatchCard.jsx';

function CountdownTimer() {
  const target = new Date('2026-06-11T00:00:00-05:00').getTime(); // ET timezone
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
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <motion.div
            key={value}
            initial={{ y: -8, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-16 h-16 glass-card rounded-xl flex items-center justify-center"
          >
            <span className="text-2xl font-black text-white tabular-nums">
              {String(value ?? 0).padStart(2, '0')}
            </span>
          </motion.div>
          <span className="text-xs text-gray-500 mt-1 block">{label}</span>
        </div>
      ))}
    </div>
  );
}

const FEATURE_CARDS = [
  {
    icon: '📊',
    title: 'Live Match Analysis',
    description: 'Real-time win probabilities powered by Bayesian statistics. Watch probabilities shift with every goal.',
    link: '/matches',
    color: 'from-wcGreen/20 to-wcGreen/5',
    border: 'border-wcGreen/20',
  },
  {
    icon: '🌍',
    title: 'Team Explorer',
    description: 'Compare any two of the 48 teams with radar charts. Explore ELO ratings, key players, and more.',
    link: '/groups',
    color: 'from-wcBlue/20 to-wcBlue/5',
    border: 'border-wcBlue/20',
  },
  {
    icon: '📚',
    title: 'Learn Statistics',
    description: 'xG, Bayesian updating, ELO ratings, bookmaker margins — explained with interactive visuals.',
    link: '/learn',
    color: 'from-wcGold/20 to-wcGold/5',
    border: 'border-wcGold/20',
  },
  {
    icon: '🎯',
    title: 'Make Predictions',
    description: 'Predict match outcomes and track your accuracy with the Brier Score — the honest way to grade predictions.',
    link: '/predictions',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/20',
  },
];

// Floating ball component
function FloatingBall({ style }) {
  return (
    <div
      className="absolute text-4xl select-none pointer-events-none float-ball"
      style={style}
    >
      ⚽
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const liveMatches = SCHEDULE.filter(m => m.status === 'LIVE');
  const upcomingMatches = SCHEDULE.filter(m => m.status === 'SCHEDULED').slice(0, 4);

  const balls = [
    { top: '10%', left: '5%', animationDuration: '8s', opacity: 0.06, fontSize: '48px' },
    { top: '20%', right: '8%', animationDuration: '12s', animationDelay: '2s', opacity: 0.04, fontSize: '64px' },
    { top: '60%', left: '3%', animationDuration: '10s', animationDelay: '4s', opacity: 0.05, fontSize: '40px' },
    { top: '70%', right: '5%', animationDuration: '9s', animationDelay: '1s', opacity: 0.04, fontSize: '56px' },
    { top: '40%', left: '50%', animationDuration: '14s', animationDelay: '3s', opacity: 0.03, fontSize: '80px' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        {/* Background */}
        <div className="absolute inset-0 animated-gradient opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-wcDark" />

        {/* Floating balls */}
        {balls.map((style, i) => (
          <FloatingBall key={i} style={style} />
        ))}

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-wcGreen/10 border border-wcGreen/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-wcGreen rounded-full live-pulse" />
              <span className="text-xs font-semibold text-wcGreen">{liveMatches.length} MATCHES LIVE NOW</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-4 leading-none">
              <span className="gradient-text">WORLD CUP</span>
              <br />
              <span className="text-white">2026</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              The most immersive football statistics experience. Live probabilities, Bayesian analysis, and deep stats for all 48 teams.
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-10"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Tournament Opens</p>
            <CountdownTimer />
            <p className="text-xs text-gray-600 mt-3">June 11, 2026 · Mexico City, USA & Canada</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link
              to="/matches"
              className="px-6 py-3 bg-wcGreen text-black font-bold rounded-xl hover:bg-wcGreen/90 transition-all"
            >
              View Live Matches
            </Link>
            <Link
              to="/learn"
              className="px-6 py-3 glass-card text-white font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              Learn Statistics
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          Everything you need to follow the tournament
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <Link
                to={card.link}
                className={`block h-full glass-card rounded-xl p-5 border ${card.border} bg-gradient-to-br ${card.color} hover:border-white/20 transition-all`}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Live Now</h2>
              <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />
                <span className="text-xs text-red-400 font-bold">{liveMatches.length}</span>
              </div>
            </div>
            <Link to="/matches" className="text-sm text-wcGreen hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Upcoming Matches</h2>
          <Link to="/matches" className="text-sm text-wcGreen hover:underline">Full schedule →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-white/5 py-10 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Teams', value: '48' },
              { label: 'Matches', value: '104' },
              { label: 'Stadiums', value: '16' },
              { label: 'Host Cities', value: '16' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-4xl font-black gradient-text">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
