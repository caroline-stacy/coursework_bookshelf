/**
 * form.js — Логика страницы добавления книги
 * Валидация, создание объекта, сохранение в localStorage
 */

document.addEventListener('DOMContentLoaded', function onFormLoad() {
  attachFormEvents();
  attachCoverPreview();
  attachStarRating();
});

// ---- Обработчики ----

/**
 * Навешать основные события формы
 */
function attachFormEvents() {
  const form = document.getElementById('bookForm');
  if (!form) return;

  form.addEventListener('submit', function onFormSubmit(event) {
    event.preventDefault();
    handleFormSubmit();
  });

  // Кнопка Отмена
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function onCancel() {
      window.location.href = 'index.html';
    });
  }
}

/**
 * Превью обложки при вводе URL
 */
function attachCoverPreview() {
  const coverInput   = document.getElementById('coverUrl');
  const previewImg   = document.getElementById('coverPreview');
  if (!coverInput || !previewImg) return;

  coverInput.addEventListener('input', function onCoverInput() {
    const url = coverInput.value.trim();
    if (url) {
      previewImg.src = url;
      previewImg.classList.add('visible');
      previewImg.onerror = function handleImgError() {
        previewImg.classList.remove('visible');
      };
    } else {
      previewImg.classList.remove('visible');
    }
  });
}

/**
 * Интерактивный выбор звёзд рейтинга (порядок 1 → 5 слева направо)
 */
function attachStarRating() {
  const starLabels = document.querySelectorAll('.star-input label');

  starLabels.forEach(function attachStarHover(label, index) {
    // При наведении — закрасить все звёзды от 1 до текущей
    label.addEventListener('mouseover', function highlightStars() {
      starLabels.forEach(function(l, i) {
        l.style.color = i <= index ? 'var(--gold-lt)' : 'var(--bg-dark)';
      });
    });

    // При уходе мыши — показать текущий выбор (или сбросить)
    label.addEventListener('mouseout', function resetStars() {
      updateStarDisplay();
    });

    // При клике — зафиксировать выбор
    label.addEventListener('click', function selectStar() {
      updateStarDisplay();
    });
  });

  /**
   * Обновить отображение звёзд по текущему значению radio
   */
  function updateStarDisplay() {
    const checked = document.querySelector('.star-input input[type="radio"]:checked');
    const selectedIndex = checked
      ? Array.from(starLabels).findIndex(function(l) { return l.htmlFor === checked.id; })
      : -1;

    starLabels.forEach(function(l, i) {
      l.style.color = i <= selectedIndex ? 'var(--gold)' : '';
    });
  }
}

// ---- Валидация ----

/**
 * Проверить обязательные поля формы
 * @returns {boolean} true если всё заполнено правильно
 */
function validateForm() {
  const fields = [
    { id: 'title',  label: 'Название книги' },
    { id: 'author', label: 'Автор' },
    { id: 'genre',  label: 'Жанр' }
  ];

  let valid = true;
  const errors = [];

  // Сбросить предыдущие ошибки
  fields.forEach(function clearError(f) {
    const el = document.getElementById(f.id);
    if (el) el.classList.remove('error');
  });

  // Проверить каждое поле
  fields.forEach(function checkField(f) {
    const el = document.getElementById(f.id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      errors.push(f.label);
      valid = false;
    }
  });

  // Проверка статуса (select)
  const statusEl = document.getElementById('status');
  if (statusEl && !statusEl.value) {
    statusEl.classList.add('error');
    errors.push('Статус чтения');
    valid = false;
  }

  if (!valid) {
    alert('Пожалуйста, заполните обязательные поля:\n• ' + errors.join('\n• '));
  }

  return valid;
}

// ---- Обработка отправки ----

/**
 * Собрать данные формы, сохранить книгу и перейти на главную
 */
function handleFormSubmit() {
  if (!validateForm()) return;

  const newBook = buildBookObject();
  const books   = getData();
  books.push(newBook);
  saveData(books);

  // Переход на главную страницу
  window.location.href = 'index.html';
}

/**
 * Собрать объект книги из значений формы
 * @returns {Object}
 */
function buildBookObject() {
  const ratingInput = document.querySelector('.star-input input[type="radio"]:checked');

  return {
    id:        generateId(),
    title:     getFieldValue('title'),
    author:    getFieldValue('author'),
    genre:     getFieldValue('genre'),
    status:    getFieldValue('status') || 'want',
    rating:    ratingInput ? Number(ratingInput.value) : 0,
    coverUrl:  getFieldValue('coverUrl'),
    quote:     getFieldValue('quote'),
    dateAdded: new Date().toISOString().split('T')[0],
    isRead:    getFieldValue('status') === 'read'
  };
}

/**
 * Получить значение поля формы по id
 * @param {string} id
 * @returns {string}
 */
function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
