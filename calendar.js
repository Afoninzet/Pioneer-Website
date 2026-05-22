/**
 * Модуль календаря репетиций для сайта группы "Пионеры Дальнего Космоса"
 * Отображает текущий и следующий месяцы с возможностью отмечать доступность.
 * Данные хранятся в localStorage с ключом 'pdk_rehearsal_marks'.
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

        var hint = document.createElement('span');
        hint.className = 'toggle-mark-hint';
        hint.textContent = '✓';
        dayCell.appendChild(hint);

        (function(cell, dStr) {
            cell.addEventListener('click', function() {
                if (!currentUserLogin) return;
                toggleMark(dStr, currentUserLogin);
                updateDayMarks(cell, dStr, currentUserLogin);
                refreshAllCalendars(year, month, currentUserLogin);
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

function refreshAllCalendars(year, month, currentUserLogin) {
    var container = document.getElementById('calendarContainer');
    if (!container) return;
    var cards = container.querySelectorAll('.calendar-card');
    cards.forEach(function(card) {
        updateCalendarMarks(card, currentUserLogin);
    });
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