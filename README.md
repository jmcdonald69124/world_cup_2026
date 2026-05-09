# World Cup 2026 Stats

An immersive FIFA World Cup 2026 statistics and predictions app built with React, D3.js, and Firebase. Covers all 48 teams, 16 venues, and 104 matches across the USA, Canada, and Mexico.

## Features

- **Live Match Dashboard** — real-time scores, events, and win probability updates
- **Bayesian Win Probability** — probability gauge and history chart that updates on every goal using Bayesian inference
- **D3.js Visualizations** — semi-circular probability gauge, match timeline, radar charts, goal distribution, probability history area chart
- **Stats Education Hub** — interactive explainers for xG, Bayesian probability, ELO ratings, odds, and bookmaker margin
- **Odds Explorer** — convert between decimal, American, fractional, and implied probability with a live bet calculator
- **Group Stage Explorer** — all 12 groups with standings, qualification color coding, and collapsible match lists
- **Player Explorer** — 30+ players with radar chart comparison across Attack, Defense, Possession, Pace, Set Pieces, and Experience
- **Prediction Game** — pick match outcomes, compare against model probabilities, scored with the Brier Score
- **Live Weather** — per-stadium weather via Open-Meteo (no key required) with "good for football?" verdict
- **Smart Caching** — localStorage TTL cache protects free-tier API quotas (100 req/day API-Football, 10 req/min football-data.org)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | D3.js v7 |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Data Fetching | TanStack React Query v5 |
| Hosting | Firebase Hosting |
| HTTP | Axios |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jmcdonald69124/world_cup_2026.git
cd world_cup_2026
npm install
```

### 2. Configure API keys

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```env
VITE_FOOTBALL_DATA_API_KEY=your_key   # football-data.org — free
VITE_API_FOOTBALL_KEY=your_key        # api-sports.io — free
VITE_ODDS_API_KEY=your_key            # the-odds-api.com — free tier
```

| API | Free tier | Sign up |
|-----|-----------|--------|
| football-data.org | 10 req/min, full WC data | football-data.org/client/login |
| API-Football | 100 req/day, player stats, lineups | dashboard.api-football.com/register |
| The Odds API | 500 req/month | the-odds-api.com |
| Open-Meteo | Unlimited, no key | Built in |

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 4. Deploy to Firebase

```bash
npm run build
firebase deploy
```

## Project Structure

```
src/
├── components/
│   ├── charts/
│   │   ├── WinProbabilityGauge.jsx   # D3 semi-circular probability gauge
│   │   ├── ProbabilityHistory.jsx    # D3 area chart — probability over match time
│   │   ├── MatchTimeline.jsx         # D3 horizontal match event timeline
│   │   ├── TeamRadar.jsx             # D3 spider/radar chart
│   │   └── GoalDistribution.jsx      # D3 bar chart — goals by minute
│   ├── BayesianExplainer.jsx         # Interactive Bayesian probability demo
│   ├── OddsExplainer.jsx             # Odds converter + bet calculator
│   ├── MatchCard.jsx                 # Match card with live probability bar
│   ├── WeatherWidget.jsx             # Live weather per stadium
│   └── Navbar.jsx                    # Nav with cache/quota status indicator
├── data/
│   ├── teams.js                      # All 48 WC 2026 teams with ELO ratings
│   ├── stadiums.js                   # 16 venues with GPS coordinates
│   └── schedule.js                   # Match schedule with live fixture examples
├── pages/
│   ├── Home.jsx                      # Hero + countdown + live match strip
│   ├── MatchDashboard.jsx            # Filterable match grid
│   ├── MatchDetail.jsx               # Full match analysis page
│   ├── Groups.jsx                    # Group stage tables
│   ├── PlayerExplorer.jsx            # Player search + radar comparison
│   ├── StatsEducation.jsx            # Interactive stats learning hub
│   └── Predictions.jsx               # Fan prediction game
├── services/
│   ├── footballDataApi.js            # football-data.org client (cached)
│   ├── apiFootball.js                # API-Football v3 client (cached)
│   ├── weatherApi.js                 # Open-Meteo client
│   └── oddsApi.js                    # The Odds API client
└── utils/
    ├── cache.js                      # localStorage TTL cache with withCache()
    ├── bayesian.js                   # ELO probabilities, Bayesian updating, Brier score
    └── oddsConverter.js              # Decimal ↔ American ↔ Fractional ↔ Implied
```

## Caching Strategy

All API responses are cached in `localStorage` with TTLs tuned to each data type:

| Data | TTL | Reason |
|------|-----|--------|
| Live match events | 30 seconds | Fresh enough for live updates |
| Match details | 5 minutes | Balances freshness vs. API calls |
| Standings | 15 minutes | Updates only after each match ends |
| Fixture schedule | 1 hour | Rarely changes during tournament |
| Team / squad | 24 hours | Static during the tournament |
| Stadiums | 7 days | Never changes |

The Navbar shows a live `💾 N cached · X/100 API` indicator. If the localStorage quota fills up, the cache automatically evicts the oldest half of entries.

## How the Bayesian Probability Engine Works

Match win probabilities are calculated in three stages:

1. **Prior** — ELO rating difference converted to win probability using the standard ELO formula, with a +50 point home advantage
2. **Poisson model** — expected goals per team estimated from attack/defense strengths
3. **Live update** — each goal triggers a Bayesian update: `P(outcome | goal scored) ∝ P(goal scored | outcome) × P(outcome)`, weighted by match minute (early goals update more than late ones)

The `ProbabilityHistory` chart shows this updating in real-time as events come in.

## Tournament Facts

- **Dates:** June 11 – July 19, 2026
- **Teams:** 48 (expanded from 32)
- **Groups:** 12 groups of 4 teams
- **Venues:** 16 stadiums — 11 USA, 2 Canada, 3 Mexico
- **Final:** MetLife Stadium, East Rutherford, NJ
- **Matches:** 104 total
