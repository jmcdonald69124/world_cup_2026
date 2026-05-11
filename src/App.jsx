import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DemoBanner from './components/DemoBanner.jsx';
import Home from './pages/Home.jsx';
import MatchDashboard from './pages/MatchDashboard.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import Groups from './pages/Groups.jsx';
import PlayerExplorer from './pages/PlayerExplorer.jsx';
import StatsEducation from './pages/StatsEducation.jsx';
import Predictions from './pages/Predictions.jsx';
import WC2022 from './pages/WC2022.jsx';
import WCHistory from './pages/WCHistory.jsx';
import { pollForLiveData } from './services/tournamentPoller.js';

export default function App() {
  useEffect(() => {
    // Fire-and-forget: silently checks API once per day for WC 2026 fixtures.
    // No-ops if API key is missing or data was already fetched today.
    pollForLiveData();
  }, []);

  return (
    <div className="min-h-screen bg-wcDark">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<MatchDashboard />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/players" element={<PlayerExplorer />} />
          <Route path="/learn" element={<StatsEducation />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/2022" element={<WC2022 />} />
          <Route path="/history" element={<WCHistory />} />
        </Routes>
      </main>
      <DemoBanner />
    </div>
  );
}
