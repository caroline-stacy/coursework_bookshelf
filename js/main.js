/**
 * main.js — Логика главной страницы
 * Отрисовка карточек, удаление, смена статуса, фильтрация, поиск
 */

// ---- Состояние ----
let currentFilter = 'all';
let searchQuery   = '';

// ---- Инициализация ----
document.addEventListener('DOMContentLoaded', function onPageLoad() {
  initDefaultData();
  attachToolbarEvents();
  renderAll();
});

// ---- Рендер ----

/**
 * Главная функция отрисовки — применяет фильтры и поиск
 */
function renderAll() {
  const books = getFilteredBooks();
  renderBookList(books);
  updateStats();
}

/**
 * Получить отфильтрованный список книг
 * @returns {Array}
 */
function getFilteredBooks() {
  let books = getData();

  // Фильтр по статусу
  if (currentFilter !== 'all') {
    books = books.filter(function filterByStatus(b) {
      return b.status === currentFilter;
    });
  }

  // Поиск по названию и автору
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    books = books.filter(function filterBySearch(b) {
      return b.title.toLowerCase().includes(q) ||
             b.author.toLowerCase().includes(q) ||
             (b.genre || '').toLowerCase().includes(q);
    });
  }

  return books;
}

/**
 * Отрисовать список книг в сетку
 * @param {Array} books
 */
function renderBookList(books) {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  if (books.length === 0) {
    grid.innerHTML = buildEmptyState();
    return;
  }

  grid.innerHTML = books.map(function buildCard(book) {
    return buildBookCard(book);
  }).join('');

  // Навешиваем обработчики на карточки
  attachCardEvents();
}

/**
 * Построить HTML одной карточки книги
 * @param {Object} book
 * @returns {string}
 */
function buildBookCard(book) {
  const coverHtml = book.coverUrl
    ? `<img src="${escapeHtml(book.coverUrl)}" alt="Обложка" onerror="this.parentElement.innerHTML='<div class=cover-placeholder>📚<span>Нет обложки</span></div>'">`
    : `<div class="cover-placeholder">📚<span>Нет обложки</span></div>`;

  const quoteHtml = book.quote
    ? `<p class="card-quote">&laquo;${escapeHtml(book.quote)}&raquo;</p>`
    : '';

  return `
    <div class="book-card" data-id="${book.id}">
      <div class="book-cover">
        ${coverHtml}
        <span class="status-badge ${escapeHtml(book.status)}">${getStatusLabel(book.status)}</span>
      </div>
      <div class="card-body">
        <span class="card-genre">${escapeHtml(book.genre || 'Без жанра')}</span>
        <h3 class="card-title">${escapeHtml(book.title)}</h3>
        <p class="card-author">${escapeHtml(book.author)}</p>
        <div class="card-rating">${renderStars(book.rating || 0)}</div>
        ${quoteHtml}
      </div>
      <div class="card-footer">
        <label class="card-checkbox-wrap">
          <input type="checkbox" class="status-toggle" data-id="${book.id}" ${book.isRead ? 'checked' : ''}>
          ${book.isRead ? 'Прочитано' : 'Отметить прочитанным'}
        </label>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="card-date">${formatDate(book.dateAdded)}</span>
          <button class="btn-delete" data-id="${book.id}" title="Удалить книгу" aria-label="Удалить">✕</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * HTML-заглушка для пустого состояния
 */
function buildEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">📖</div>
      <h3>Здесь пока пусто</h3>
      <p>Добавьте первую книгу на свою полку</p>
    </div>
  `;
}

// ---- Обновление статистики ----

/**
 * Обновить счётчики в шапке/тулбаре
 */
function updateStats() {
  const all = getData();
  const total   = all.length;
  const read    = all.filter(function(b) { return b.status === 'read'; }).length;
  const reading = all.filter(function(b) { return b.status === 'reading'; }).length;
  const want    = all.filter(function(b) { return b.status === 'want'; }).length;

  setTextContent('countTotal',   total);
  setTextContent('countRead',    read);
  setTextContent('countReading', reading);
  setTextContent('countWant',    want);
}

function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ---- Обработчики ----

/**
 * Навешать события на элементы тулбара (фильтры, поиск, кнопка добавить)
 */
function attachToolbarEvents() {
  // Фильтры
  document.querySelectorAll('.filter-btn').forEach(function attachFilter(btn) {
    btn.addEventListener('click', function onFilterClick() {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(function(b) {
        b.classList.toggle('active', b === btn);
      });
      renderAll();
    });
  });

  // Поиск
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function onSearch() {
      searchQuery = searchInput.value;
      renderAll();
    });
  }
}

/**
 * Навешать события на карточки (чекбоксы, кнопки удаления)
 */
function attachCardEvents() {
  // Чекбоксы статуса
  document.querySelectorAll('.status-toggle').forEach(function attachCheckbox(cb) {
    cb.addEventListener('change', function onToggle() {
      toggleReadStatus(Number(cb.dataset.id), cb.checked);
    });
  });

  // Кнопки удаления
  document.querySelectorAll('.btn-delete').forEach(function attachDelete(btn) {
    btn.addEventListener('click', function onDelete() {
      deleteBook(Number(btn.dataset.id));
    });
  });
}

// ---- Действия ----

/**
 * Переключить статус прочитано/не прочитано
 * @param {number} id
 * @param {boolean} isRead
 */
function toggleReadStatus(id, isRead) {
  const books = getData();
  const book = books.find(function findBook(b) { return b.id === id; });
  if (!book) return;

  book.isRead = isRead;
  if (isRead && book.status !== 'reading') {
    book.status = 'read';
  }
  saveData(books);
  renderAll();
}

/**
 * Удалить книгу с подтверждением
 * @param {number} id
 */
function deleteBook(id) {
  const books = getData();
  const book = books.find(function findBook(b) { return b.id === id; });
  if (!book) return;

  const confirmed = confirm(`Удалить книгу «${book.title}» с полки?`);
  if (!confirmed) return;

  const updated = books.filter(function filterOut(b) { return b.id !== id; });
  saveData(updated);
  renderAll();
}
