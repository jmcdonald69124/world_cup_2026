// World Cup 2022 Qatar — all 32 qualified teams
// ELO ratings are approximate pre-tournament values (Nov 2022)

export const WC2022_TEAMS = [
  // Group A
  { id: 'QAT', code: 'QAT', name: 'Qatar', group: 'A', confederation: 'AFC',
    eloRating: 1620, fifaRank: 50, flagEmoji: '🇶🇦',
    primaryColor: '#8D1B3D', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'ECU', code: 'ECU', name: 'Ecuador', group: 'A', confederation: 'CONMEBOL',
    eloRating: 1744, fifaRank: 44, flagEmoji: '🇪🇨',
    primaryColor: '#FFD100', secondaryColor: '#0033A0', finish: 'Group Stage' },
  { id: 'SEN', code: 'SEN', name: 'Senegal', group: 'A', confederation: 'CAF',
    eloRating: 1752, fifaRank: 18, flagEmoji: '🇸🇳',
    primaryColor: '#00853F', secondaryColor: '#FDEF42', finish: 'Round of 16' },
  { id: 'NED', code: 'NED', name: 'Netherlands', group: 'A', confederation: 'UEFA',
    eloRating: 1922, fifaRank: 8, flagEmoji: '🇳🇱',
    primaryColor: '#FF6600', secondaryColor: '#FFFFFF', finish: 'Quarterfinals' },

  // Group B
  { id: 'ENG', code: 'ENG', name: 'England', group: 'B', confederation: 'UEFA',
    eloRating: 1973, fifaRank: 5, flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primaryColor: '#003078', secondaryColor: '#FFFFFF', finish: 'Quarterfinals' },
  { id: 'IRN', code: 'IRN', name: 'IR Iran', group: 'B', confederation: 'AFC',
    eloRating: 1651, fifaRank: 20, flagEmoji: '🇮🇷',
    primaryColor: '#239F40', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'USA', code: 'USA', name: 'USA', group: 'B', confederation: 'CONCACAF',
    eloRating: 1771, fifaRank: 16, flagEmoji: '🇺🇸',
    primaryColor: '#B22234', secondaryColor: '#FFFFFF', finish: 'Round of 16' },
  { id: 'WAL', code: 'WAL', name: 'Wales', group: 'B', confederation: 'UEFA',
    eloRating: 1635, fifaRank: 19, flagEmoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    primaryColor: '#C8102E', secondaryColor: '#FFFFFF', finish: 'Group Stage' },

  // Group C
  { id: 'ARG', code: 'ARG', name: 'Argentina', group: 'C', confederation: 'CONMEBOL',
    eloRating: 2091, fifaRank: 3, flagEmoji: '🇦🇷',
    primaryColor: '#74ACDF', secondaryColor: '#FFFFFF', finish: 'Champion' },
  { id: 'KSA', code: 'KSA', name: 'Saudi Arabia', group: 'C', confederation: 'AFC',
    eloRating: 1636, fifaRank: 51, flagEmoji: '🇸🇦',
    primaryColor: '#006C35', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'MEX', code: 'MEX', name: 'Mexico', group: 'C', confederation: 'CONCACAF',
    eloRating: 1840, fifaRank: 13, flagEmoji: '🇲🇽',
    primaryColor: '#006847', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'POL', code: 'POL', name: 'Poland', group: 'C', confederation: 'UEFA',
    eloRating: 1744, fifaRank: 26, flagEmoji: '🇵🇱',
    primaryColor: '#DC143C', secondaryColor: '#FFFFFF', finish: 'Round of 16' },

  // Group D
  { id: 'FRA', code: 'FRA', name: 'France', group: 'D', confederation: 'UEFA',
    eloRating: 2003, fifaRank: 4, flagEmoji: '🇫🇷',
    primaryColor: '#002395', secondaryColor: '#ED2939', finish: 'Runner-up' },
  { id: 'AUS', code: 'AUS', name: 'Australia', group: 'D', confederation: 'AFC',
    eloRating: 1718, fifaRank: 38, flagEmoji: '🇦🇺',
    primaryColor: '#00843D', secondaryColor: '#FFD200', finish: 'Round of 16' },
  { id: 'DEN', code: 'DEN', name: 'Denmark', group: 'D', confederation: 'UEFA',
    eloRating: 1852, fifaRank: 10, flagEmoji: '🇩🇰',
    primaryColor: '#C60C30', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'TUN', code: 'TUN', name: 'Tunisia', group: 'D', confederation: 'CAF',
    eloRating: 1702, fifaRank: 30, flagEmoji: '🇹🇳',
    primaryColor: '#E70013', secondaryColor: '#FFFFFF', finish: 'Group Stage' },

  // Group E
  { id: 'ESP', code: 'ESP', name: 'Spain', group: 'E', confederation: 'UEFA',
    eloRating: 1975, fifaRank: 7, flagEmoji: '🇪🇸',
    primaryColor: '#AA151B', secondaryColor: '#F1BF00', finish: 'Round of 16' },
  { id: 'CRC', code: 'CRC', name: 'Costa Rica', group: 'E', confederation: 'CONCACAF',
    eloRating: 1673, fifaRank: 31, flagEmoji: '🇨🇷',
    primaryColor: '#002B7F', secondaryColor: '#CE1126', finish: 'Group Stage' },
  { id: 'GER', code: 'GER', name: 'Germany', group: 'E', confederation: 'UEFA',
    eloRating: 1905, fifaRank: 11, flagEmoji: '🇩🇪',
    primaryColor: '#000000', secondaryColor: '#DD0000', finish: 'Group Stage' },
  { id: 'JPN', code: 'JPN', name: 'Japan', group: 'E', confederation: 'AFC',
    eloRating: 1745, fifaRank: 24, flagEmoji: '🇯🇵',
    primaryColor: '#BC002D', secondaryColor: '#FFFFFF', finish: 'Round of 16' },

  // Group F
  { id: 'BEL', code: 'BEL', name: 'Belgium', group: 'F', confederation: 'UEFA',
    eloRating: 1931, fifaRank: 2, flagEmoji: '🇧🇪',
    primaryColor: '#ED2939', secondaryColor: '#000000', finish: 'Group Stage' },
  { id: 'CAN', code: 'CAN', name: 'Canada', group: 'F', confederation: 'CONCACAF',
    eloRating: 1694, fifaRank: 41, flagEmoji: '🇨🇦',
    primaryColor: '#FF0000', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'MAR', code: 'MAR', name: 'Morocco', group: 'F', confederation: 'CAF',
    eloRating: 1780, fifaRank: 22, flagEmoji: '🇲🇦',
    primaryColor: '#C1272D', secondaryColor: '#006233', finish: '4th Place' },
  { id: 'CRO', code: 'CRO', name: 'Croatia', group: 'F', confederation: 'UEFA',
    eloRating: 1850, fifaRank: 12, flagEmoji: '🇭🇷',
    primaryColor: '#FF0000', secondaryColor: '#FFFFFF', finish: '3rd Place' },

  // Group G
  { id: 'BRA', code: 'BRA', name: 'Brazil', group: 'G', confederation: 'CONMEBOL',
    eloRating: 2087, fifaRank: 1, flagEmoji: '🇧🇷',
    primaryColor: '#009C3B', secondaryColor: '#FFDF00', finish: 'Quarterfinals' },
  { id: 'SRB', code: 'SRB', name: 'Serbia', group: 'G', confederation: 'UEFA',
    eloRating: 1740, fifaRank: 21, flagEmoji: '🇷🇸',
    primaryColor: '#C6363C', secondaryColor: '#0C4076', finish: 'Group Stage' },
  { id: 'SUI', code: 'SUI', name: 'Switzerland', group: 'G', confederation: 'UEFA',
    eloRating: 1769, fifaRank: 15, flagEmoji: '🇨🇭',
    primaryColor: '#FF0000', secondaryColor: '#FFFFFF', finish: 'Round of 16' },
  { id: 'CMR', code: 'CMR', name: 'Cameroon', group: 'G', confederation: 'CAF',
    eloRating: 1670, fifaRank: 43, flagEmoji: '🇨🇲',
    primaryColor: '#007A5E', secondaryColor: '#CE1126', finish: 'Group Stage' },

  // Group H
  { id: 'POR', code: 'POR', name: 'Portugal', group: 'H', confederation: 'UEFA',
    eloRating: 1910, fifaRank: 9, flagEmoji: '🇵🇹',
    primaryColor: '#006600', secondaryColor: '#FF0000', finish: 'Quarterfinals' },
  { id: 'GHA', code: 'GHA', name: 'Ghana', group: 'H', confederation: 'CAF',
    eloRating: 1688, fifaRank: 61, flagEmoji: '🇬🇭',
    primaryColor: '#006B3F', secondaryColor: '#FCD116', finish: 'Group Stage' },
  { id: 'URU', code: 'URU', name: 'Uruguay', group: 'H', confederation: 'CONMEBOL',
    eloRating: 1848, fifaRank: 14, flagEmoji: '🇺🇾',
    primaryColor: '#5CB8E4', secondaryColor: '#FFFFFF', finish: 'Group Stage' },
  { id: 'KOR', code: 'KOR', name: 'South Korea', group: 'H', confederation: 'AFC',
    eloRating: 1742, fifaRank: 28, flagEmoji: '🇰🇷',
    primaryColor: '#C60C30', secondaryColor: '#003478', finish: 'Round of 16' },
];

export function getTeam(code) {
  return WC2022_TEAMS.find(t => t.code === code);
}

export const WC2022_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const WC2022_TOP_SCORERS = [
  { name: 'Kylian Mbappé', team: 'FRA', goals: 8, assists: 2 },
  { name: 'Lionel Messi', team: 'ARG', goals: 7, assists: 3 },
  { name: 'Olivier Giroud', team: 'FRA', goals: 4, assists: 0 },
  { name: 'Julián Álvarez', team: 'ARG', goals: 4, assists: 1 },
  { name: 'Marcus Rashford', team: 'ENG', goals: 3, assists: 0 },
  { name: 'Gavi', team: 'ESP', goals: 3, assists: 1 },
  { name: 'Cody Gakpo', team: 'NED', goals: 3, assists: 1 },
  { name: 'Enner Valencia', team: 'ECU', goals: 3, assists: 0 },
  { name: 'Ferran Torres', team: 'ESP', goals: 3, assists: 0 },
  { name: 'Bukayo Saka', team: 'ENG', goals: 3, assists: 2 },
];
