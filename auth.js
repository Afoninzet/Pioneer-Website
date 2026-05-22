/**

- Модуль аутентификации для сайта группы "Пионеры Дальнего Космоса"
- Управляет входом/выходом музыкантов и хранением сессии в localStorage.
*/

var USERS = {
'Dima':   { login: 'Dima',   password: 'Dima',   displayName: 'Дима' },
'Piter':  { login: 'Piter',  password: 'Piter',  displayName: 'Пётр' },
'Kirill': { login: 'Kirill', password: 'Kirill', displayName: 'Кирилл' },
'Ilya':   { login: 'Ilya',   password: 'Ilya',   displayName: 'Илья' }
};

var SESSION_KEY = 'pdk_auth_session';

function getSession() {
try {
var raw = localStorage.getItem(SESSION_KEY);
if (!raw) return null;
var session = JSON.parse(raw);
if (session && session.login && USERS[session.login]) {
return session;
}
} catch (e) {}
clearSession();
return null;
}

function saveSession(login) {
var session = {
login: login,
displayName: USERS[login].displayName,
timestamp: Date.now()
};
localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
localStorage.removeItem(SESSION_KEY);
}

function authenticate(login, password) {
var normalizedLogin = login.trim();
var user = USERS[normalizedLogin];
if (user && user.password === password) {
return user;
}
return null;
}

function isLoggedIn() {
return getSession() !== null;
}

function getCurrentUserDisplayName() {
var session = getSession();
return session ? session.displayName : null;
}

function getCurrentUserLogin() {
var session = getSession();
return session ? session.login : null;
}