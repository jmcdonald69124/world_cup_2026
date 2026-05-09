import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cache } from '../utils/cache.js';
import { getDailyQuotaRemaining } from '../services/apiFootball.js';

const navLinks = [
  { to: '/matches', label: 'Matches' },
  { to: '/groups', label: 'Groups' },
  { to: '/players', label: 'Players' },
  { to: '/learn', label: 'Learn Stats' },
  { to: '/predictions', label: 'Predictions' },
];

function CacheStatus() {
  const [stats, setStats] = useState({ entries: 0, sizeKb: '0' });
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    setStats(cache.stats());
    setQuota(getDailyQuotaRemaining());
    const id = setInterval(() => {
      setStats(cache.stats());
      setQuota(getDailyQuotaRemaining());
    }, 10000);
    return () => clearInterval(id);
  }, []);

  if (stats.entries === 0 && quota === null) return null;

  return (
    <div
      title={`Cache: ${stats.entries} entries, ${stats.sizeKb} KB stored\nAPI-Football: ${quota ?? '?'} requests remaining today`}
      className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10 cursor-default"
    >
      <span className="text-[10px] text-gray-500">💾</span>
      <span className="text-[10px] text-gray-400 font-mono">{stats.entries} cached</span>
      {quota !== null && (
        <>
          <span className="text-gray-600">·</span>
          <span className={`text-[10px] font-mono ${quota < 20 ? 'text-orange-400' : 'text-gray-400'}`}>
            {quota}/100 API
          </span>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-wcDark/95 backdrop-blur-xl shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚽</span>
            <span className="gradient-text font-black text-xl tracking-tight">WC 2026</span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-wcGreen/20 text-wcGreen'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Live indicator + cache stats */}
          <div className="hidden md:flex items-center gap-3">
            <CacheStatus />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
              <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
              <span className="text-xs text-red-400 font-semibold">5 LIVE</span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-wcDark/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-wcGreen/20 text-wcGreen'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
                <span className="text-xs text-red-400 font-semibold">5 MATCHES LIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
