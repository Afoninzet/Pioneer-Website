/**
 * Модуль календаря репетиций для сайта группы "Пионеры Дальнего Космоса"
 * Отображает текущий и следующий месяцы с возможностью отмечать доступность.
 * Данные хранятся в localStorage с ключом 'pdk_rehearsal_marks'.
 */

const MARKS_KEY = 'pdk_rehearsal_marks';

// Русские названия месяцев и дней недели
const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Загружает все отметки из localStorage.
 * Структура: { "2026-05-22": ["Dima", "Piter"], "2026-05-23": ["Kirill"] }
 */
function loadMarks() {
    try {
        const raw = localStorage.getItem(MARKS_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

/**
 * Сохраняет все отметки в localStorage.
 */
function saveMarks(marks) {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

/**
 * Возвращает список логинов, отметивших указанную дату.
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 */
function getMarksForDate(dateStr) {
    const marks = loadMarks();
    return marks[dateStr] || [];
}

/**
 * Переключает отметку текущего пользователя на указанную дату.
 * @param {string} dateStr - дата в формате YYYY-MM-DD
 * @param {string} login - логин пользователя
 * @returns {boolean} - true если отметка добавлена, false если удалена
 */
function toggleMark(dateStr, login) {
    const marks = loadMarks();
    if (!marks[dateStr]) {
        marks[dateStr] = [];
    }
    const index = marks[dateStr].indexOf(login);
    if (index === -1) {
        // Добавляем отметку
        marks[dateStr].push(login);
        saveMarks(marks);
        return true;
    } else {
        // Удаляем отметку
        marks[dateStr].splice(index, 1);
        if (marks[dateStr].length === 0) {
            delete marks[dateStr];
        }
        saveMarks(marks);
        return false;
    }
}

/**
 * Форматирует дату в строку YYYY-MM-DD.
 */
function formatDateKey(year, month, day) {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

/**
 * Возвращает день недели для первого числа месяца (0 = Пн, 6 = Вс)
 * с коррекцией: JS getDay() возвращает 0 = Вс, нам нужно 0 = Пн.
 */
function getFirstDayOfWeek(year, month) {
    // month в JS: 0-январь ... 11-декабрь
    const jsDay = new Date(year, month - 1, 1).getDay();
    // Преобразуем: Вс (0) -> 6, Пн (1) -> 0, ..., Сб (6) -> 5
    return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Возвращает количество дней в месяце.
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * Создаёт DOM-элемент карточки календаря на заданный месяц.
 * @param {number} year
 * @param {number} month - номер месяца (1-12)
 * @param {string} currentUserLogin - логин текущего пользователя
 * @returns {HTMLElement}
 */
function createCalendarCard(year, month, currentUserLogin) {
    const card = document.createElement('div');
    card.className = 'calendar-card';

    // Заголовок
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
    card.appendChild(header);

    // Сетка календаря
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // Заголовки дней недели
    DAY_NAMES_SHORT.forEach(dayName => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'calendar-day-name';
        dayNameEl.textContent = dayName;
        grid.appendChild(dayNameEl);
    });

    // Вычисляем параметры месяца
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfWeek(year, month);

    // Сегодняшняя дата для подсветки
    const today = new Date();
    const todayStr = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

    // Пустые ячейки перед первым днём
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    // Ячейки дней месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateKey(year, month, day);
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = dateStr;

        // Подсветка сегодняшнего дня
        if (dateStr === todayStr) {
            dayCell.classList.add('today');
        }

        // Номер дня
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        // Контейнер для отметок
        const marksContainer = document.createElement('div');
        marksContainer.className = 'marks-container';
        dayCell.appendChild(marksContainer);

        // Подсказка
        const hint = document.createElement('span');
        hint.className = 'toggle-mark-hint';
        hint.textContent = '✓';
        dayCell.appendChild(hint);

        // Обработчик клика
        dayCell.addEventListener('click', () => {
            if (!currentUserLogin) return;
            const added = toggleMark(dateStr, currentUserLogin);
            // Обновляем отображение отметок для этой ячейки
            updateDayMarks(dayCell, dateStr, currentUserLogin);
            // Обновляем все календари (так как месяц может быть показан дважды не должен, но для надёжности)
            refreshAllCalendars(year, month, currentUserLogin);
        });

        grid.appendChild(dayCell);
    }

    card.appendChild(grid);

    // Заполняем отметки сразу
    updateCalendarMarks(card, currentUserLogin);

    return card;
}

/**
 * Обновляет отметки во всех ячейках карточки календаря.
 */
function updateCalendarMarks(card, currentUserLogin) {
    const dayCells = card.querySelectorAll('.calendar-day:not(.empty)');
    dayCells.forEach(cell => {
        const dateStr = cell.dataset.date;
        if (dateStr) {
            updateDayMarks(cell, dateStr, currentUserLogin);
        }
    });
}

/**
 * Обновляет отображение отметок в конкретной ячейке дня.
 */
function updateDayMarks(dayCell, dateStr, currentUserLogin) {
    const marksContainer = dayCell.querySelector('.marks-container');
    if (!marksContainer) return;

    // Очищаем
    marksContainer.innerHTML = '';

    const marks = getMarksForDate(dateStr);

    marks.forEach(login => {
        const badge = document.createElement('span');
        badge.className = 'mark-badge';
        if (login === currentUserLogin) {
            badge.classList.add('own-mark');
        }
        // Показываем инициалы или короткое имя
        const user = USERS[login];
        badge.textContent = user ? user.displayName.charAt(0).toUpperCase() : login.charAt(0).toUpperCase();
        badge.title = user ? user.displayName : login;
        marksContainer.appendChild(badge);
    });
}

/**
 * Полное обновление всех календарей в контейнере.
 */
function refreshAllCalendars(year, month, currentUserLogin) {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    const cards = container.querySelectorAll('.calendar-card');
    cards.forEach(card => {
        updateCalendarMarks(card, currentUserLogin);
    });
}

/**
 * Создаёт легенду участников группы.
 */
function createMembersLegend(currentUserLogin) {
    const legend = document.createElement('div');
    legend.className = 'members-legend';
    legend.innerHTML = '<h3>Участники</h3>';

    const list = document.createElement('ul');
    list.className = 'legend-list';

    const members = Object.values(USERS);
    members.forEach(user => {
        const item = document.createElement('li');
        item.className = 'legend-item';
        if (user.login === currentUserLogin) {
            item.classList.add('current-user');
        }

        const badge = document.createElement('span');
        badge.className = 'legend-badge';
        item.appendChild(badge);

        const name = document.createElement('span');
        name.textContent = user.displayName;
        item.appendChild(name);

        list.appendChild(item);
    });

    legend.appendChild(list);
    return legend;
}

/**
 * Рендерит все календари в контейнер.
 */
function renderCalendars(currentUserLogin) {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    container.innerHTML = '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Текущий месяц
    const card1 = createCalendarCard(currentYear, currentMonth, currentUserLogin);
    container.appendChild(card1);

    // Следующий месяц
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
    }
    const card2 = createCalendarCard(nextYear, nextMonth, currentUserLogin);
    container.appendChild(card2);

    // Легенда
    const legend = createMembersLegend(currentUserLogin);
    container.appendChild(legend);
}