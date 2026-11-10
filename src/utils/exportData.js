/**
 * Build a complete date-by-date calendar index combining transactions, meals, and habits.
 */
export function buildCalendarReport(data) {
  const calendar = {};

  const ensureDay = (dateKey) => {
    if (!dateKey) return null;
    if (!calendar[dateKey]) {
      calendar[dateKey] = {
        date: dateKey,
        income: 0,
        expense: 0,
        transactions: [],
        meals: { breakfast: 0, lunch: 0, dinner: 0, guest: 0, totalMeals: 0, cost: 0 },
        habits: { namazDone: 0, minoxidilDone: 0, gymDone: false, customDoneCount: 0 }
      };
    }
    return calendar[dateKey];
  };

  // 1. Transactions
  const ratePerMeal = Number(data.meals?.ratePerMeal || 55);
  (data.finance?.transactions || []).forEach((tx) => {
    const day = ensureDay(tx.date);
    if (!day) return;
    if (tx.type === 'in' && tx.category !== 'Wallet Transfer') {
      day.income += Number(tx.amount || 0);
    } else if (tx.type === 'out' && tx.category !== 'Wallet Transfer') {
      day.expense += Number(tx.amount || 0);
    }
    day.transactions.push(tx);
  });

  // 2. Meal logs
  Object.entries(data.meals?.logs || {}).forEach(([dateKey, m]) => {
    const day = ensureDay(dateKey);
    if (!day) return;
    const total =
      Number(m.breakfast || 0) +
      Number(m.lunch || 0) +
      Number(m.dinner || 0) +
      Number(m.guest || 0);
    day.meals = {
      ...m,
      totalMeals: total,
      cost: Math.round(total * ratePerMeal)
    };
  });

  // 3. Habit logs
  Object.entries(data.habits?.dailyLogs || {}).forEach(([dateKey, h]) => {
    const day = ensureDay(dateKey);
    if (!day) return;
    const namazDone = h.namaz ? Object.values(h.namaz).filter(Boolean).length : 0;
    const minoxidilDone = h.minoxidil ? Object.values(h.minoxidil).filter(Boolean).length : 0;
    const customDoneCount = h.custom ? Object.values(h.custom).filter(Boolean).length : 0;
    day.habits = {
      namazDone,
      minoxidilDone,
      gymDone: Boolean(h.gym?.done),
      customDoneCount
    };
  });

  // Sort chronologically descending (newest first)
  return Object.values(calendar).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Download complete OS state + date-indexed Calendar Archive as JSON
 */
export function downloadFullOSBackupJSON(data) {
  const calendarTimeline = buildCalendarReport(data);
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'KM Mahim Life OS',
    version: '4.5',
    calendarTimeline,
    rawState: data
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `KM-Mahim-OS-Calendar-Backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download Spreadsheet-friendly CSV sorted by calendar date
 */
export function downloadCalendarCSV(data) {
  const rows = buildCalendarReport(data);
  const headers = [
    'Date',
    'Income (BDT)',
    'Expense (BDT)',
    'Transaction Details',
    'Meals Eaten',
    'Meal Cost (BDT)',
    'Namaz (/5)',
    'Gym Completed',
    'Custom Habits Completed'
  ];

  const escapeCsv = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];

  rows.forEach((r) => {
    const txSummary = r.transactions
      .map((t) => `${t.type === 'in' ? '+' : '-'}${t.amount} (${t.wallet}: ${t.note || t.category})`)
      .join(' | ');

    lines.push(
      [
        r.date,
        r.income,
        r.expense,
        escapeCsv(txSummary || 'No transactions'),
        r.meals.totalMeals,
        r.meals.cost,
        `${r.habits.namazDone}/5`,
        r.habits.gymDone ? 'Yes' : 'No',
        r.habits.customDoneCount
      ].join(',')
    );
  });

  const csvContent = '\uFEFF' + lines.join('\n'); // UTF-8 BOM for Bengali support in Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `KM-Mahim-Calendar-Report-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
