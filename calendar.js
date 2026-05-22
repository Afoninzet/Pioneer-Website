/**
 * Модуль календаря репетиций для сайта группы "Пионеры Дальнего Космоса"
 * Отображает текущий и следующий месяцы с возможностью отмечать доступность.
 * Данные хранятся в localStorage с ключом 'pdk_rehearsal_marks'.
 * Все участники видят отметки друг друга (синхронизированы через localStorage).
 */

var MARKS_KEY = 'pdk_rehearsal_marks';

var MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

var DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function loadMarks() {
    try {
        var raw = localStorage.getItem(MARKS_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function saveMarks(marks) {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

function getMarksForDate(dateStr) {
    var marks = loadMarks();
    return marks[dateStr] || [];
}

function toggleMark(dateStr, login) {
    var marks = loadMarks();
    if (!marks[dateStr]) {
        marks[dateStr] = [];
    }
    var index = marks[dateStr].indexOf(login);
    if (index === -1) {
        marks[dateStr].push(login);
        saveMarks(marks);
        return true;
    } else {
        marks[dateStr].splice(index, 1);
        if (marks[dateStr].length === 0) {
            delete marks[dateStr];
        }
        saveMarks(marks);
        return false;
    }
}

function formatDateKey(year, month, day) {
    var m = String(month).padStart(2, '0');
    var d = String(day).padStart(2, '0');
    return year + '-' + m + '-' + d;
}

function getFirstDayOfWeek(year, month) {
    var jsDay = new Date(year, month - 1, 1).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function createCalendarCard(year, month, currentUserLogin) {
    var card = document.createElement('div');
    card.className = 'calendar-card';

    var header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = MONTH_NAMES[month - 1] + ' ' + year;
    card.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'calendar-grid';

    DAY_NAMES_SHORT.forEach(function(dayName) {
        var dayNameEl = document.createElement('div');
        dayNameEl.className = 'calendar-day-name';
        dayNameEl.textContent = dayName;
        grid.appendChild(dayNameEl);
    });

    var daysInMonth = getDaysInMonth(year, month);
    var firstDayOfWeek = getFirstDayOfWeek(year, month);

    var today = new Date();
    var todayStr = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

    for (var i = 0; i < firstDayOfWeek; i++) {
        var emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var dateStr = formatDateKey(year, month, day);
        var dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = dateStr;

        if (dateStr === todayStr) {
            dayCell.classList.add('today');
        }

        var dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        var marksContainer = document.createElement('div');
        marksContainer.className = 'marks-container';
        dayCell.appendChild(marksContainer);

        (function(cell, dStr) {
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!currentUserLogin) return;
                toggleMark(dStr, currentUserLogin);
                // Обновляем все календари, чтобы показать изменения для всех пользователей
                refreshAllCalendars(currentUserLogin);
            });
        })(dayCell, dateStr);

        grid.appendChild(dayCell);
    }

    card.appendChild(grid);
    updateCalendarMarks(card, currentUserLogin);

    return card;
}

function updateCalendarMarks(card, currentUserLogin) {
    var dayCells = card.querySelectorAll('.calendar-day:not(.empty)');
    dayCells.forEach(function(cell) {
        var dateStr = cell.dataset.date;
        if (dateStr) {
            updateDayMarks(cell, dateStr, currentUserLogin);
        }
    });
}

function updateDayMarks(dayCell, dateStr, currentUserLogin) {
    var marksContainer = dayCell.querySelector('.marks-container');
    if (!marksContainer) return;

    marksContainer.innerHTML = '';

    var marks = getMarksForDate(dateStr);

    marks.forEach(function(login) {
        var badge = document.createElement('span');
        badge.className = 'mark-badge';
        if (login === currentUserLogin) {
            badge.classList.add('own-mark');
        }
        var user = USERS[login];
        badge.textContent = user ? user.displayName.charAt(0).toUpperCase() : login.charAt(0).toUpperCase();
        badge.title = user ? user.displayName : login;
        marksContainer.appendChild(badge);
    });
}

function refreshAllCalendars(currentUserLogin) {
    var container = document.getElementById('calendarContainer');
    if (!container) return;
    
    // Получаем текущие даты из существующих карточек или используем текущую дату
    var existingCards = container.querySelectorAll('.calendar-card');
    var dates = [];
    
    if (existingCards.length >= 2) {
        // Извлекаем год и месяц из заголовков
        var header1 = existingCards[0].querySelector('.calendar-header');
        var header2 = existingCards[1].querySelector('.calendar-header');
        if (header1 && header2) {
            var text1 = header1.textContent;
            var text2 = header2.textContent;
            var match1 = text1.match(/(\w+)\s+(\d+)/);
            var match2 = text2.match(/(\w+)\s+(\d+)/);
            if (match1 && match2) {
                var month1 = MONTH_NAMES.indexOf(match1[1]) + 1;
                var year1 = parseInt(match2[2]);
                var month2 = MONTH_NAMES.indexOf(match2[1]) + 1;
                var year2 = parseInt(match2[2]);
                dates.push({ year: year1, month: month1 });
                dates.push({ year: year2, month: month2 });
            }
        }
    }
    
    if (dates.length !== 2) {
        // Пересоздаём календари если не можем определить даты
        var today = new Date();
        var currentYear = today.getFullYear();
        var currentMonth = today.getMonth() + 1;
        var nextMonth = currentMonth + 1;
        var nextYear = currentYear;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
        }
        renderCalendars(currentUserLogin);
        return;
    }
    
    // Обновляем существующие карточки
    var cards = container.querySelectorAll('.calendar-card');
    cards.forEach(function(card, idx) {
        if (idx < 2) {
            updateCalendarMarks(card, currentUserLogin);
        }
    });
    
    // Обновляем легенду
    var oldLegend = container.querySelector('.members-legend');
    if (oldLegend) {
        var newLegend = createMembersLegend(currentUserLogin);
        container.replaceChild(newLegend, oldLegend);
    }
}

function createMembersLegend(currentUserLogin) {
    var legend = document.createElement('div');
    legend.className = 'members-legend';
    legend.innerHTML = '<h3>Участники</h3>';

    var list = document.createElement('ul');
    list.className = 'legend-list';

    var members = Object.values(USERS);
    members.forEach(function(user) {
        var item = document.createElement('li');
        item.className = 'legend-item';
        if (user.login === currentUserLogin) {
            item.classList.add('current-user');
        }

        var badge = document.createElement('span');
        badge.className = 'legend-badge';
        item.appendChild(badge);

        var name = document.createElement('span');
        name.textContent = user.displayName;
        item.appendChild(name);

        list.appendChild(item);
    });

    legend.appendChild(list);
    return legend;
}

function renderCalendars(currentUserLogin) {
    var container = document.getElementById('calendarContainer');
    if (!container) return;

    container.innerHTML = '';

    var today = new Date();
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth() + 1;

    var card1 = createCalendarCard(currentYear, currentMonth, currentUserLogin);
    container.appendChild(card1);

    var nextMonth = currentMonth + 1;
    var nextYear = currentYear;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
    }
    var card2 = createCalendarCard(nextYear, nextMonth, currentUserLogin);
    container.appendChild(card2);

    var legend = createMembersLegend(currentUserLogin);
    container.appendChild(legend);
}

// Экспортируем функцию для обновления календарей из app.js
window.renderCalendars = renderCalendars;
