/**
 * storage.js — Работа с localStorage
 * Модуль для чтения и записи данных книг
 */

const STORAGE_KEY = 'bookshelf_books';

/**
 * Получить все книги из localStorage
 * @returns {Array} массив объектов книг
 */
function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Ошибка чтения из localStorage:', e);
    return [];
  }
}

/**
 * Сохранить массив книг в localStorage
 * @param {Array} books — массив объектов книг
 */
function saveData(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Ошибка записи в localStorage:', e);
  }
}

/**
 * Инициализация — заполнить хранилище тестовыми данными,
 * если оно пустое
 */
function initDefaultData() {
  const existing = getData();
  if (existing.length > 0) return;

  const defaults = [
    {
      id: 1700000001000,
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      genre: 'Классика',
      rating: 5,
      status: 'read',
      coverUrl: '',
      quote: 'Трусость — главный грех на свете.',
      dateAdded: '2024-09-15',
      isRead: true
    },
    {
      id: 1700000002000,
      title: 'Дюна',
      author: 'Фрэнк Герберт',
      genre: 'Фантастика',
      rating: 5,
      status: 'read',
      coverUrl: '',
      quote: 'Страх — убийца разума. Страх — это малая смерть.',
      dateAdded: '2024-11-03',
      isRead: true
    },
    {
      id: 1700000003000,
      title: '1984',
      author: 'Джордж Оруэлл',
      genre: 'Антиутопия',
      rating: 4,
      status: 'reading',
      coverUrl: '',
      quote: 'Большой брат следит за тобой.',
      dateAdded: '2025-01-20',
      isRead: false
    }
  ];

  saveData(defaults);
}
