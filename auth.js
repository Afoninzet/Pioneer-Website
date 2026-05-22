/**
 * Модуль аутентификации для сайта группы "Пионеры Дальнего Космоса"
 * Управляет входом/выходом музыкантов и хранением сессии в localStorage.
 */

// База учётных записей музыкантов
const USERS = {
    'Dima':   { login: 'Dima',   password: 'Dima',   displayName: 'Дима' },
    'Piter':  { login: 'Piter',  password: 'Piter',  displayName: 'Пётр' },
    'Kirill': { login: 'Kirill', password: 'Kirill', displayName: 'Кирилл' },
    'Ilya':   { login: 'Ilya',   password: 'Ilya',   displayName: 'Илья' }
};

const SESSION_KEY = 'pdk_auth_session';

/**
 * Возвращает текущую сессию из localStorage или null.
 */
function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Проверяем валидность сессии
        if (session && session.login && USERS[session.login]) {
            return session;
        }
    } catch (e) {
        // игнорируем ошибки парсинга
    }
    clearSession();
    return null;
}

/**
 * Сохраняет сессию в localStorage.
 */
function saveSession(login) {
    const session = {
        login: login,
        displayName: USERS[login].displayName,
        timestamp: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Удаляет сессию из localStorage.
 */
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Проверяет учётные данные и возвращает пользователя или null.
 */
function authenticate(login, password) {
    const normalizedLogin = login.trim();
    const user = USERS[normalizedLogin];
    if (user && user.password === password) {
        return user;
    }
    return null;
}

/**
 * Проверяет, авторизован ли пользователь в данный момент.
 */
function isLoggedIn() {
    return getSession() !== null;
}

/**
 * Возвращает отображаемое имя текущего пользователя или null.
 */
function getCurrentUserDisplayName() {
    const session = getSession();
    return session ? session.displayName : null;
}

/**
 * Возвращает логин текущего пользователя или null.
 */
function getCurrentUserLogin() {
    const session = getSession();
    return session ? session.login : null;
}