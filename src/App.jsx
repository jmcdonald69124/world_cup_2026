import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import MatchDashboard from './pages/MatchDashboard.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import Groups from './pages/Groups.jsx';
import PlayerExplorer from './pages/PlayerExplorer.jsx';
import StatsEducation from './pages/StatsEducation.jsx';
import Predictions from './pages/Predictions.jsx';

export default function App() {
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
        </Routes>
      </main>
    </div>
  );
}
