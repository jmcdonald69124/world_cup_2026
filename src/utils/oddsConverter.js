export const convertOdds = {
  decimalToAmerican(decimal) {
    if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
    return `${Math.round(-100 / (decimal - 1))}`;
  },

  decimalToFractional(decimal) {
    const num = decimal - 1;
    if (num <= 0) return '1/100';
    const denom = 100;
    const numerator = Math.round(num * denom);
    const g = gcd(numerator, denom);
    return `${numerator / g}/${denom / g}`;
  },

  decimalToImplied(decimal) {
    return ((1 / decimal) * 100).toFixed(1) + '%';
  },

  americanToDecimal(american) {
    const n = parseInt(american);
    if (n > 0) return (n / 100 + 1).toFixed(2);
    return (100 / Math.abs(n) + 1).toFixed(2);
  },

  impliedToDecimal(impliedPct) {
    const prob = parseFloat(impliedPct) / 100;
    if (prob <= 0) return '999.00';
    return (1 / prob).toFixed(2);
  },

  formatAmerican(prob) {
    if (prob <= 0) return '+999';
    if (prob >= 1) return '-999';
    if (prob >= 0.5) return `-${Math.round((prob / (1 - prob)) * 100)}`;
    return `+${Math.round(((1 - prob) / prob) * 100)}`;
  },
};

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

export default convertOdds;
