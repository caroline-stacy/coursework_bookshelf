/**
 * utils.js — Вспомогательные функции
 */

/**
 * Сгенерировать уникальный ID
 * @returns {number}
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Отрисовать звёзды рейтинга (HTML)
 * @param {number} rating — от 0 до 5
 * @returns {string} HTML со звёздами
 */
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
  }
  return html;
}

/**
 * Получить метку статуса на русском
 * @param {string} status — 'read' | 'reading' | 'want'
 * @returns {string}
 */
function getStatusLabel(status) {
  const labels = {
    read:    'Прочитано',
    reading: 'Читаю',
    want:    'Хочу читать'
  };
  return labels[status] || status;
}

/**
 * Форматировать дату в читаемый вид
 * @param {string} dateStr — 'YYYY-MM-DD'
 * @returns {string} — '15 сент. 2024'
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Экранировать HTML-спецсимволы
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
