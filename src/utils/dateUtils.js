/**
 * Local-timezone safe date formatting helpers (fixes UTC+6 midnight rollover bugs).
 */

export function getLocalDateStr(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalMonthStr(d = new Date()) {
  return getLocalDateStr(d).slice(0, 7);
}

export function getLocalYearStr(d = new Date()) {
  return getLocalDateStr(d).slice(0, 4);
}

export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(dateStr);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function diffCalendarDays(aStr, bStr) {
  const a = parseLocalDate(aStr);
  const b = parseLocalDate(bStr);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}
