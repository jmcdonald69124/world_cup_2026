import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamRadar from '../components/charts/TeamRadar.jsx';

const PLAYERS = [
  { id: 1, name: 'Lionel Messi', team: 'Argentina', teamCode: 'ARG', flagEmoji: '🇦🇷', position: 'FW', age: 38, club: 'Inter Miami', nationality: 'Argentine', stats: { goals: 104, assists: 56, passAccuracy: 84, dribbles: 78, tackles: 12, saves: 0 }, radarStats: { attack: 99, defense: 40, possession: 92, pace: 72, setpieces: 90, experience: 99 } },
  { id: 2, name: 'Kylian Mbappé', team: 'France', teamCode: 'FRA', flagEmoji: '🇫🇷', position: 'FW', age: 27, club: 'Real Madrid', nationality: 'French', stats: { goals: 48, assists: 26, passAccuracy: 80, dribbles: 88, tackles: 18, saves: 0 }, radarStats: { attack: 97, defense: 45, possession: 78, pace: 99, setpieces: 72, experience: 82 } },
  { id: 3, name: 'Erling Haaland', team: 'Norway', teamCode: 'NOR', flagEmoji: '🇳🇴', position: 'FW', age: 25, club: 'Man City', nationality: 'Norwegian', stats: { goals: 40, assists: 12, passAccuracy: 72, dribbles: 65, tackles: 8, saves: 0 }, radarStats: { attack: 98, defense: 30, possession: 68, pace: 90, setpieces: 80, experience: 70 } },
  { id: 4, name: 'Cristiano Ronaldo', team: 'Portugal', teamCode: 'POR', flagEmoji: '🇵🇹', position: 'FW', age: 41, club: 'Al Nassr', nationality: 'Portuguese', stats: { goals: 128, assists: 42, passAccuracy: 76, dribbles: 70, tackles: 15, saves: 0 }, radarStats: { attack: 94, defense: 38, possession: 72, pace: 75, setpieces: 88, experience: 99 } },
  { id: 5, name: 'Vinícius Jr.', team: 'Brazil', teamCode: 'BRA', flagEmoji: '🇧🇷', position: 'FW', age: 24, club: 'Real Madrid', nationality: 'Brazilian', stats: { goals: 35, assists: 28, passAccuracy: 78, dribbles: 92, tackles: 22, saves: 0 }, radarStats: { attack: 94, defense: 42, possession: 80, pace: 97, setpieces: 65, experience: 72 } },
  { id: 6, name: 'Harry Kane', team: 'England', teamCode: 'ENG', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'FW', age: 32, club: 'Bayern Munich', nationality: 'English', stats: { goals: 68, assists: 30, passAccuracy: 82, dribbles: 60, tackles: 18, saves: 0 }, radarStats: { attack: 95, defense: 45, possession: 82, pace: 70, setpieces: 88, experience: 90 } },
  { id: 7, name: 'Victor Osimhen', team: 'Nigeria', teamCode: 'NGA', flagEmoji: '🇳🇬', position: 'FW', age: 26, club: 'Galatasaray', nationality: 'Nigerian', stats: { goals: 22, assists: 10, passAccuracy: 68, dribbles: 72, tackles: 14, saves: 0 }, radarStats: { attack: 90, defense: 28, possession: 65, pace: 95, setpieces: 70, experience: 65 } },
  { id: 8, name: 'Antoine Griezmann', team: 'France', teamCode: 'FRA', flagEmoji: '🇫🇷', position: 'FW', age: 35, club: 'Atlético Madrid', nationality: 'French', stats: { goals: 44, assists: 30, passAccuracy: 84, dribbles: 75, tackles: 30, saves: 0 }, radarStats: { attack: 88, defense: 58, possession: 85, pace: 78, setpieces: 82, experience: 92 } },
  { id: 9, name: 'Kevin De Bruyne', team: 'Belgium', teamCode: 'BEL', flagEmoji: '🇧🇪', position: 'MF', age: 34, club: 'Man City', nationality: 'Belgian', stats: { goals: 28, assists: 60, passAccuracy: 89, dribbles: 70, tackles: 40, saves: 0 }, radarStats: { attack: 85, defense: 62, possession: 95, pace: 78, setpieces: 90, experience: 96 } },
  { id: 10, name: 'Jude Bellingham', team: 'England', teamCode: 'ENG', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', position: 'MF', age: 22, club: 'Real Madrid', nationality: 'English', stats: { goals: 25, assists: 22, passAccuracy: 87, dribbles: 80, tackles: 52, saves: 0 }, radarStats: { attack: 88, defense: 75, possession: 86, pace: 85, setpieces: 78, experience: 75 } },
  { id: 11, name: 'Luka Modrić', team: 'Croatia', teamCode: 'CRO', flagEmoji: '🇭🇷', position: 'MF', age: 40, club: 'Real Madrid', nationality: 'Croatian', stats: { goals: 20, assists: 38, passAccuracy: 91, dribbles: 72, tackles: 55, saves: 0 }, radarStats: { attack: 78, defense: 70, possession: 96, pace: 65, setpieces: 82, experience: 99 } },
  { id: 12, name: 'Pedri', team: 'Spain', teamCode: 'ESP', flagEmoji: '🇪🇸', position: 'MF', age: 23, club: 'Barcelona', nationality: 'Spanish', stats: { goals: 15, assists: 25, passAccuracy: 91, dribbles: 82, tackles: 48, saves: 0 }, radarStats: { attack: 80, defense: 72, possession: 94, pace: 78, setpieces: 74, experience: 70 } },
  { id: 13, name: 'Rodri', team: 'Spain', teamCode: 'ESP', flagEmoji: '🇪🇸', position: 'MF', age: 28, club: 'Man City', nationality: 'Spanish', stats: { goals: 8, assists: 18, passAccuracy: 93, dribbles: 62, tackles: 75, saves: 0 }, radarStats: { attack: 65, defense: 88, possession: 94, pace: 65, setpieces: 70, experience: 85 } },
  { id: 14, name: 'Frenkie de Jong', team: 'Netherlands', teamCode: 'NED', flagEmoji: '🇳🇱', position: 'MF', age: 27, club: 'Barcelona', nationality: 'Dutch', stats: { goals: 10, assists: 20, passAccuracy: 90, dribbles: 76, tackles: 55, saves: 0 }, radarStats: { attack: 72, defense: 72, possession: 92, pace: 75, setpieces: 68, experience: 78 } },
  { id: 15, name: 'Moisés Caicedo', team: 'Ecuador', teamCode: 'ECU', flagEmoji: '🇪🇨', position: 'MF', age: 23, club: 'Chelsea', nationality: 'Ecuadorian', stats: { goals: 6, assists: 12, passAccuracy: 86, dribbles: 68, tackles: 78, saves: 0 }, radarStats: { attack: 65, defense: 85, possession: 82, pace: 80, setpieces: 65, experience: 62 } },
  { id: 16, name: 'Bruno Fernandes', team: 'Portugal', teamCode: 'POR', flagEmoji: '🇵🇹', position: 'MF', age: 30, club: 'Man United', nationality: 'Portuguese', stats: { goals: 32, assists: 38, passAccuracy: 85, dribbles: 74, tackles: 38, saves: 0 }, radarStats: { attack: 85, defense: 60, possession: 86, pace: 74, setpieces: 88, experience: 82 } },
  { id: 17, name: 'Virgil van Dijk', team: 'Netherlands', teamCode: 'NED', flagEmoji: '🇳🇱', position: 'DF', age: 33, club: 'Liverpool', nationality: 'Dutch', stats: { goals: 12, assists: 6, passAccuracy: 88, dribbles: 40, tackles: 82, saves: 0 }, radarStats: { attack: 45, defense: 96, possession: 82, pace: 72, setpieces: 75, experience: 90 } },
  { id: 18, name: 'Achraf Hakimi', team: 'Morocco', teamCode: 'MAR', flagEmoji: '🇲🇦', position: 'DF', age: 26, club: 'PSG', nationality: 'Moroccan', stats: { goals: 14, assists: 22, passAccuracy: 84, dribbles: 75, tackles: 68, saves: 0 }, radarStats: { attack: 80, defense: 82, possession: 78, pace: 95, setpieces: 70, experience: 78 } },
  { id: 19, name: 'Kim Min-jae', team: 'South Korea', teamCode: 'KOR', flagEmoji: '🇰🇷', position: 'DF', age: 28, club: 'Bayern Munich', nationality: 'South Korean', stats: { goals: 5, assists: 3, passAccuracy: 86, dribbles: 35, tackles: 88, saves: 0 }, radarStats: { attack: 38, defense: 94, possession: 78, pace: 80, setpieces: 72, experience: 75 } },
  { id: 20, name: 'Kalidou Koulibaly', team: 'Senegal', teamCode: 'SEN', flagEmoji: '🇸🇳', position: 'DF', age: 33, club: 'Al-Hilal', nationality: 'Senegalese', stats: { goals: 8, assists: 4, passAccuracy: 84, dribbles: 38, tackles: 85, saves: 0 }, radarStats: { attack: 40, defense: 92, possession: 76, pace: 78, setpieces: 70, experience: 88 } },
  { id: 21, name: 'Alphonso Davies', team: 'Canada', teamCode: 'CAN', flagEmoji: '🇨🇦', position: 'DF', age: 24, club: 'Bayern Munich', nationality: 'Canadian', stats: { goals: 10, assists: 18, passAccuracy: 83, dribbles: 85, tackles: 70, saves: 0 }, radarStats: { attack: 78, defense: 80, possession: 80, pace: 99, setpieces: 65, experience: 72 } },
  { id: 22, name: 'Rúben Dias', team: 'Portugal', teamCode: 'POR', flagEmoji: '🇵🇹', position: 'DF', age: 27, club: 'Man City', nationality: 'Portuguese', stats: { goals: 8, assists: 5, passAccuracy: 88, dribbles: 42, tackles: 86, saves: 0 }, radarStats: { attack: 42, defense: 94, possession: 82, pace: 72, setpieces: 72, experience: 78 } },
  { id: 23, name: 'Thibaut Courtois', team: 'Belgium', teamCode: 'BEL', flagEmoji: '🇧🇪', position: 'GK', age: 32, club: 'Real Madrid', nationality: 'Belgian', stats: { goals: 0, assists: 0, passAccuracy: 72, dribbles: 0, tackles: 0, saves: 88 }, radarStats: { attack: 20, defense: 98, possession: 60, pace: 40, setpieces: 50, experience: 92 } },
  { id: 24, name: 'Édouard Mendy', team: 'Senegal', teamCode: 'SEN', flagEmoji: '🇸🇳', position: 'GK', age: 32, club: 'Al-Ahli', nationality: 'Senegalese', stats: { goals: 0, assists: 0, passAccuracy: 68, dribbles: 0, tackles: 0, saves: 82 }, radarStats: { attack: 15, defense: 90, possession: 55, pace: 38, setpieces: 45, experience: 85 } },
  { id: 25, name: 'Alisson Becker', team: 'Brazil', teamCode: 'BRA', flagEmoji: '🇧🇷', position: 'GK', age: 32, club: 'Liverpool', nationality: 'Brazilian', stats: { goals: 0, assists: 0, passAccuracy: 78, dribbles: 0, tackles: 0, saves: 86 }, radarStats: { attack: 18, defense: 96, possession: 65, pace: 42, setpieces: 48, experience: 88 } },
  { id: 26, name: 'Son Heung-min', team: 'South Korea', teamCode: 'KOR', flagEmoji: '🇰🇷', position: 'FW', age: 34, club: 'Tottenham', nationality: 'South Korean', stats: { goals: 38, assists: 22, passAccuracy: 82, dribbles: 78, tackles: 28, saves: 0 }, radarStats: { attack: 90, defense: 52, possession: 80, pace: 90, setpieces: 76, experience: 92 } },
  { id: 27, name: 'Sadio Mané', team: 'Senegal', teamCode: 'SEN', flagEmoji: '🇸🇳', position: 'FW', age: 32, club: 'Al-Nassr', nationality: 'Senegalese', stats: { goals: 36, assists: 22, passAccuracy: 78, dribbles: 85, tackles: 30, saves: 0 }, radarStats: { attack: 88, defense: 55, possession: 78, pace: 92, setpieces: 70, experience: 88 } },
  { id: 28, name: 'Mohamed Salah', team: 'Egypt', teamCode: 'EGY', flagEmoji: '🇪🇬', position: 'FW', age: 32, club: 'Liverpool', nationality: 'Egyptian', stats: { goals: 52, assists: 36, passAccuracy: 82, dribbles: 86, tackles: 24, saves: 0 }, radarStats: { attack: 95, defense: 48, possession: 80, pace: 90, setpieces: 82, experience: 90 } },
  { id: 29, name: 'Luis Díaz', team: 'Colombia', teamCode: 'COL', flagEmoji: '🇨🇴', position: 'FW', age: 27, club: 'Liverpool', nationality: 'Colombian', stats: { goals: 22, assists: 18, passAccuracy: 78, dribbles: 88, tackles: 28, saves: 0 }, radarStats: { attack: 88, defense: 48, possession: 80, pace: 92, setpieces: 68, experience: 72 } },
  { id: 30, name: 'Darwin Núñez', team: 'Uruguay', teamCode: 'URU', flagEmoji: '🇺🇾', position: 'FW', age: 25, club: 'Liverpool', nationality: 'Uruguayan', stats: { goals: 24, assists: 16, passAccuracy: 70, dribbles: 74, tackles: 18, saves: 0 }, radarStats: { attack: 88, defense: 36, possession: 68, pace: 94, setpieces: 70, experience: 65 } },
];

const POSITIONS = ['All', 'GK', 'DF', 'MF', 'FW'];

function PlayerCard({ player, selected, onSelect, onCompare, compareMode, compareSelected }) {
  const isCompareSelected = compareSelected?.id === player.id;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
        isCompareSelected ? 'border-wcGold/50 bg-wcGold/5' : 'hover:border-white/20'
      }`}
      onClick={() => onSelect(player)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{player.flagEmoji}</span>
          <div>
            <div className="font-bold text-white text-sm">{player.name}</div>
            <div className="text-xs text-gray-500">{player.team} · {player.club}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-wcBlue/20 text-wcBlue">{player.position}</span>
          <span className="text-xs text-gray-600">Age {player.age}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        {player.position === 'GK' ? (
          <>
            <div className="bg-white/5 rounded-lg py-1.5">
              <div className="text-sm font-bold text-white">{player.stats.saves}</div>
              <div className="text-xs text-gray-600">Saves</div>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5">
              <div className="text-sm font-bold text-white">{player.stats.passAccuracy}%</div>
              <div className="text-xs text-gray-600">Pass %</div>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5">
              <div className="text-sm font-bold text-white">{player.age}</div>
              <div className="text-xs text-gray-600">Age</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/5 rounded-lg py-1.5">
              <div className="text-sm font-bold text-wcGold">{player.stats.goals}</div>
              <div className="text-xs text-gray-600">Goals</div>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5">
              <div className="text-sm font-bold text-wcGreen">{player.stats.assists}</div>
              <div className="text-xs text-gray-600">Assists</div>
            </div>
            {player.position === 'DF' ? (
              <div className="bg-white/5 rounded-lg py-1.5">
                <div className="text-sm font-bold text-blue-400">{player.stats.tackles}</div>
                <div className="text-xs text-gray-600">Tackles</div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg py-1.5">
                <div className="text-sm font-bold text-blue-400">{player.stats.dribbles}</div>
                <div className="text-xs text-gray-600">Dribbles</div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onCompare(player); }}
        className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isCompareSelected
            ? 'bg-wcGold/20 text-wcGold border border-wcGold/30'
            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        {isCompareSelected ? '✓ Selected for compare' : 'Compare'}
      </button>
    </motion.div>
  );
}

export default function PlayerExplorer() {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    return PLAYERS.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase());
      const matchPos = posFilter === 'All' || p.position === posFilter;
      return matchSearch && matchPos;
    });
  }, [search, posFilter]);

  const handleCompare = (player) => {
    if (compareA?.id === player.id) { setCompareA(null); return; }
    if (compareB?.id === player.id) { setCompareB(null); return; }
    if (!compareA) { setCompareA(player); return; }
    if (!compareB) { setCompareB(player); setShowCompare(true); return; }
    setCompareA(player);
    setCompareB(null);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-2">Player Explorer</h1>
          <p className="text-gray-500">{PLAYERS.length} players · Compare any two with radar charts</p>
        </div>

        <AnimatePresence>
          {(compareA || compareB) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-4 mb-5 border border-wcGold/20 bg-wcGold/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-wcGold">COMPARING</span>
                  {compareA && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>{compareA.flagEmoji}</span>
                      <span className="text-white font-medium">{compareA.name}</span>
                    </div>
                  )}
                  {compareA && compareB && <span className="text-gray-500">vs</span>}
                  {compareB && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>{compareB.flagEmoji}</span>
                      <span className="text-white font-medium">{compareB.name}</span>
                    </div>
                  )}
                  {!compareB && <span className="text-gray-500 text-sm">Select one more player</span>}
                </div>
                <div className="flex gap-2">
                  {compareA && compareB && (
                    <button
                      onClick={() => setShowCompare(!showCompare)}
                      className="px-3 py-1.5 bg-wcGold/20 text-wcGold text-xs font-bold rounded-lg hover:bg-wcGold/30 transition-all"
                    >
                      {showCompare ? 'Hide' : 'View'} Comparison
                    </button>
                  )}
                  <button
                    onClick={() => { setCompareA(null); setCompareB(null); setShowCompare(false); }}
                    className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg hover:bg-white/10 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCompare && compareA && compareB && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Player Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <TeamRadar
                    teamA={{ name: compareA.name, primaryColor: '#00A550' }}
                    teamB={{ name: compareB.name, primaryColor: '#DA291C' }}
                    statsA={compareA.radarStats}
                    statsB={compareB.radarStats}
                  />
                </div>
                <div className="space-y-4">
                  {[compareA, compareB].map((p, pi) => (
                    <div key={p.id} className={`p-3 rounded-lg ${pi === 0 ? 'bg-wcGreen/10' : 'bg-wcRed/10'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span>{p.flagEmoji}</span>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Club: {p.club}</div>
                        <div>Age: {p.age}</div>
                        <div>Goals: {p.stats.goals} | Assists: {p.stats.assists}</div>
                        {p.position === 'GK' && <div>Saves: {p.stats.saves}</div>}
                        <div>Pass%: {p.stats.passAccuracy}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-wcGreen/50"
          />
          <div className="flex gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  posFilter === pos
                    ? 'bg-wcBlue text-white'
                    : 'glass-card text-gray-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-4">{filtered.length} players</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <PlayerCard
                player={player}
                onSelect={() => {}}
                onCompare={handleCompare}
                compareSelected={compareA?.id === player.id ? compareA : compareB?.id === player.id ? compareB : null}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
