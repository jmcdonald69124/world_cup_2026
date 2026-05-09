// Convert ELO rating difference to win probability
export function eloProbability(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Poisson probability: P(X=k) given mean lambda
export function poissonGoalProb(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export function matchProbabilities(homeElo, awayElo, homeAdvantage = 50) {
  const adjustedHomeElo = homeElo + homeAdvantage;
  const pHome = eloProbability(adjustedHomeElo, awayElo);
  const pAway = eloProbability(awayElo, adjustedHomeElo);
  const drawFactor = 0.25 * (1 - Math.abs(pHome - pAway));
  const pWin = pHome * (1 - drawFactor);
  const pDraw = drawFactor * 2 * Math.min(pHome, pAway) + drawFactor;
  const pLoss = pAway * (1 - drawFactor);
  const total = pWin + pDraw + pLoss;
  return { home: pWin / total, draw: pDraw / total, away: pLoss / total };
}

export function bayesianUpdate(priorProbs, goalScoredBy, minute) {
  const timeWeight = minute < 45 ? 1.2 : minute < 75 ? 1.0 : 0.8;
  const pScoredGivenWin = 0.7;
  const pScoredGivenDraw = 0.4;
  const pScoredGivenLoss = 0.2;
  let newHome, newDraw, newAway;
  if (goalScoredBy === 'home') {
    newHome = priorProbs.home * pScoredGivenWin * timeWeight;
    newDraw = priorProbs.draw * pScoredGivenDraw;
    newAway = priorProbs.away * pScoredGivenLoss;
  } else {
    newHome = priorProbs.home * pScoredGivenLoss;
    newDraw = priorProbs.draw * pScoredGivenDraw;
    newAway = priorProbs.away * pScoredGivenWin * timeWeight;
  }
  const total = newHome + newDraw + newAway;
  return { home: newHome / total, draw: newDraw / total, away: newAway / total };
}

export function applyMatchEvents(initialProbs, events) {
  return events.reduce((probs, event) => {
    if (event.type === 'goal') return bayesianUpdate(probs, event.scoredBy, event.minute);
    return probs;
  }, initialProbs);
}

export function buildProbabilityHistory(initialProbs, events, finalMinute = 90) {
  const history = [{ minute: 0, ...initialProbs }];
  const sortedEvents = [...events].filter(e => e.type === 'goal').sort((a, b) => a.minute - b.minute);
  let currentProbs = { ...initialProbs };
  for (const event of sortedEvents) {
    if (event.minute > 1) history.push({ minute: event.minute - 0.5, ...currentProbs });
    currentProbs = bayesianUpdate(currentProbs, event.scoredBy, event.minute);
    history.push({ minute: event.minute, ...currentProbs });
  }
  if (finalMinute > 0 && (history.length === 0 || history[history.length - 1].minute < finalMinute)) {
    history.push({ minute: finalMinute, ...currentProbs });
  }
  return history;
}

export function decimalToImplied(decimal) { return 1 / decimal; }

export function probToAmerican(prob) {
  if (prob <= 0) return '+999';
  if (prob >= 1) return '-999';
  if (prob >= 0.5) return `-${Math.round((prob / (1 - prob)) * 100)}`;
  return `+${Math.round(((1 - prob) / prob) * 100)}`;
}

export function probToDecimal(prob) {
  if (prob <= 0) return '999.00';
  return (1 / prob).toFixed(2);
}

export function bookmakerMargin(homeOdds, drawOdds, awayOdds) {
  return ((1 / homeOdds + 1 / drawOdds + 1 / awayOdds - 1) * 100).toFixed(2);
}

export function expectedValue(trueProb, decimalOdds, stake = 100) {
  const profit = stake * (decimalOdds - 1);
  const loss = stake;
  return (trueProb * profit - (1 - trueProb) * loss).toFixed(2);
}

export function brierScore(predictedProbs, actualOutcome) {
  const actual = {
    home: actualOutcome === 'home' ? 1 : 0,
    draw: actualOutcome === 'draw' ? 1 : 0,
    away: actualOutcome === 'away' ? 1 : 0,
  };
  return (
    Math.pow(predictedProbs.home - actual.home, 2) +
    Math.pow(predictedProbs.draw - actual.draw, 2) +
    Math.pow(predictedProbs.away - actual.away, 2)
  );
}
