import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/matches',     label: 'Matches' },
  { to: '/groups',      label: 'Groups' },
  { to: '/players',     label: 'Players' },
  { to: '/learn',       label: 'Stats' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/history',     label: 'History' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-wcDark/96 backdrop-blur-xl border-b border-white/[0.06]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">

          <NavLink to="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-wcGreen" />
            <span className="font-black text-base tracking-tight text-white">
              WC<span className="text-wcGreen">2026</span>
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 text-sm font-medium transition-colors duration-150 rounded-md ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-x-0 -bottom-px h-px bg-wcGreen"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]">
              <span className="w-1.5 h-1.5 bg-wcGreen rounded-full live-pulse" />
              <span className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Demo</span>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded text-gray-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-5 h-px bg-current transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-wcDark/98 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-5 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-white bg-white/[0.05]' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
