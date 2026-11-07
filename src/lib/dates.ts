const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** "today" or "mar 4" */
export function whenOf(ms: number) {
  const d = new Date(ms);
  return d.toDateString() === new Date().toDateString() ? 'today' : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** strip date stamp: 2026.11.07 */
export function stampOf(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
