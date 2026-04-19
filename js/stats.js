/**
 * stats.js — Логика страницы статистики
 */

document.addEventListener('DOMContentLoaded', function onStatsLoad() {
  initDefaultData();
  renderStats();
});

/**
 * Отрисовать всю статистику
 */
function renderStats() {
  const books = getData();

  renderCounters(books);
  renderGenreChart(books);
  renderRatingChart(books);
  renderTopQuotes(books);
}

/**
 * Счётчики-карточки наверху
 */
function renderCounters(books) {
  const total   = books.length;
  const read    = books.filter(function(b) { return b.status === 'read'; }).length;
  const reading = books.filter(function(b) { return b.status === 'reading'; }).length;
  const want    = books.filter(function(b) { return b.status === 'want'; }).length;
  const avgRating = total
    ? (books.reduce(function(sum, b) { return sum + (b.rating || 0); }, 0) / total).toFixed(1)
    : '—';

  setStatValue('statTotal',   total);
  setStatValue('statRead',    read);
  setStatValue('statReading', reading);
  setStatValue('statWant',    want);
  setStatValue('statAvgRating', avgRating);
}

/**
 * Диаграмма по жанрам
 */
function renderGenreChart(books) {
  const container = document.getElementById('genreChart');
  if (!container) return;

  const genreMap = {};
  books.forEach(function countGenre(b) {
    const g = b.genre || 'Без жанра';
    genreMap[g] = (genreMap[g] || 0) + 1;
  });

  const sorted = Object.entries(genreMap)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 8);

  if (sorted.length === 0) {
    container.innerHTML = '<p style="color:var(--ink-light);font-style:italic;">Нет данных</p>';
    return;
  }

  const maxVal = sorted[0][1];

  container.innerHTML = sorted.map(function buildBar(entry) {
    const pct = Math.round((entry[1] / maxVal) * 100);
    return `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(entry[0])}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="bar-count">${entry[1]}</span>
      </div>
    `;
  }).join('');
}

/**
 * Распределение по рейтингам
 */
function renderRatingChart(books) {
  const container = document.getElementById('ratingChart');
  if (!container) return;

  const ratingMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  books.forEach(function countRating(b) {
    if (b.rating >= 1 && b.rating <= 5) {
      ratingMap[b.rating]++;
    }
  });

  const maxVal = Math.max(...Object.values(ratingMap), 1);

  container.innerHTML = [5, 4, 3, 2, 1].map(function buildRatingBar(stars) {
    const count = ratingMap[stars];
    const pct   = Math.round((count / maxVal) * 100);
    return `
      <div class="bar-row">
        <span class="bar-label">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="bar-count">${count}</span>
      </div>
    `;
  }).join('');
}

/**
 * Топ цитат
 */
function renderTopQuotes(books) {
  const container = document.getElementById('topQuotes');
  if (!container) return;

  const withQuotes = books.filter(function(b) { return b.quote && b.quote.trim(); }).slice(0, 5);

  if (withQuotes.length === 0) {
    container.innerHTML = '<p style="color:var(--ink-light);font-style:italic;">Нет сохранённых цитат</p>';
    return;
  }

  container.innerHTML = withQuotes.map(function buildQuote(b) {
    return `
      <div style="background:var(--card-bg);border:1px solid rgba(28,16,8,0.08);border-radius:var(--radius-lg);padding:18px;box-shadow:var(--shadow);">
        <p style="font-style:italic;color:var(--ink-muted);line-height:1.7;margin-bottom:8px;">&laquo;${escapeHtml(b.quote)}&raquo;</p>
        <p style="font-family:'DM Mono',monospace;font-size:0.7rem;color:var(--gold);">— ${escapeHtml(b.author)}, <em style="font-style:italic;color:var(--ink-light);">${escapeHtml(b.title)}</em></p>
      </div>
    `;
  }).join('');
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
