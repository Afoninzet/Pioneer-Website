/**
 * Основной модуль приложения сайта "Пионеры Дальнего Космоса"
 * Управляет навигацией, модальным окном входа и состоянием интерфейса.
 */

(function() {
'use strict';

// Данные новостей теперь управляются через news-manager.js
// NEWS_DATA и PHOTOS_DATA определены глобально

// Функция открытия модального окна новости (должна быть доступна глобально)
window.openNewsModal = function(news) {
    var modal = document.getElementById('newsModal');
    var titleEl = document.getElementById('newsModalTitle');
    var dateEl = document.getElementById('newsModalDate');
    var contentEl = document.getElementById('newsModalContent');

    if (!modal || !titleEl || !dateEl || !contentEl) return;

    titleEl.textContent = news.title;
    dateEl.textContent = news.date + ' ' + (news.time || '');
    contentEl.textContent = news.content;

    modal.style.display = 'flex';
};

function closeNewsModal() {
    var modal = document.getElementById('newsModal');
    if (modal) modal.style.display = 'none';
}

function bootstrap() {
var loginBtn = document.getElementById('loginBtn');
var manageBtn = document.getElementById('manageBtn');
var logoutBtn = document.getElementById('logoutBtn');
var userIndicator = document.getElementById('userIndicator');
var loginModal = document.getElementById('loginModal');
var newsModal = document.getElementById('newsModal');
var loginForm = document.getElementById('loginForm');
var loginInput = document.getElementById('loginInput');
var passwordInput = document.getElementById('passwordInput');
var loginError = document.getElementById('loginError');
var closeModalBtn = document.getElementById('closeModalBtn');
var closeNewsModalBtn = document.getElementById('closeNewsModalBtn');
var navLinks = document.querySelectorAll('.nav-link');
var contentSections = document.querySelectorAll('.content-section');

if (!loginBtn) {
console.error('Кнопка loginBtn не найдена в DOM!');
return;
}

console.log('App: все DOM-элементы найдены, инициализация...');

// Регистрируем функцию openNewsModal в news-manager.js
if (typeof setGlobalOpenNewsModal === 'function') {
    setGlobalOpenNewsModal(window.openNewsModal);
}

var currentSection = 'news';

function loadNews() {
    // Используем глобальную функцию из news-manager.js
    if (typeof refreshNewsGrid === 'function') {
        refreshNewsGrid();
    } else {
        // fallback: загружаем вручную
        var newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;
        
        newsGrid.innerHTML = '';
        
        for (var i = 0; i < window.NEWS_DATA.length; i++) {
            var news = window.NEWS_DATA[i];
            var newsCard = document.createElement('div');
            newsCard.className = 'news-card hover-glow';
            newsCard.dataset.id = news.id;
            
            var newsDate = document.createElement('div');
            newsDate.className = 'news-date';
            newsDate.textContent = news.date;
            
            var newsTitle = document.createElement('h3');
            newsTitle.textContent = news.title;
            
            var newsExcerpt = document.createElement('p');
            var excerpt = news.content.substring(0, 100);
            if (news.content.length > 100) excerpt = excerpt + '...';
            newsExcerpt.textContent = excerpt;
            
            newsCard.appendChild(newsDate);
            newsCard.appendChild(newsTitle);
            newsCard.appendChild(newsExcerpt);
            
            newsCard.addEventListener('click', (function(n) {
                return function() { window.openNewsModal(n); };
            })(news));
            
            newsGrid.appendChild(newsCard);
        }
    }
}

function loadPhotos() {
var photoGallery = document.getElementById('photoGallery');
if (!photoGallery) return;

photoGallery.innerHTML = '';

if (!window.PHOTOS_DATA || window.PHOTOS_DATA.length === 0) {
var emptyMessage = document.createElement('div');
emptyMessage.className = 'empty-photo-message';
emptyMessage.textContent = '📸 Фото пока нет';
photoGallery.appendChild(emptyMessage);
return;
}

for (var i = 0; i < window.PHOTOS_DATA.length; i++) {
var photo = window.PHOTOS_DATA[i];
var photoCard = document.createElement('div');
photoCard.className = 'photo-card';

var photoPlaceholder = document.createElement('div');
photoPlaceholder.className = 'photo-placeholder';
photoPlaceholder.textContent = photo.icon || '🎸';

var photoTitle = document.createElement('p');
photoTitle.textContent = photo.title;

photoCard.appendChild(photoPlaceholder);
photoCard.appendChild(photoTitle);

photoGallery.appendChild(photoCard);
}
}

function updateAuthUI() {
var loggedIn = isLoggedIn();
var displayName = getCurrentUserDisplayName();

if (loggedIn) {
loginBtn.style.display = 'none';
manageBtn.style.display = 'inline-flex';
logoutBtn.style.display = 'inline-flex';
userIndicator.style.display = 'inline-block';
userIndicator.textContent = displayName;

// Если вошли и раздел управления активен, инициализируем менеджер новостей
if (currentSection === 'manage' && typeof initNewsManager === 'function') {
setTimeout(function() { initNewsManager(); }, 50);
}
} else {
loginBtn.style.display = 'inline-flex';
manageBtn.style.display = 'none';
logoutBtn.style.display = 'none';
userIndicator.style.display = 'none';
userIndicator.textContent = '';

if (currentSection === 'manage') {
showSection('news');
}
}
}

function showSection(sectionName) {
currentSection = sectionName;

for (var i = 0; i < contentSections.length; i++) {
contentSections[i].classList.remove('active');
}

var targetSection = document.getElementById('section-' + sectionName);
if (targetSection) {
targetSection.classList.add('active');
}

for (var j = 0; j < navLinks.length; j++) {
navLinks[j].classList.remove('active');
if (navLinks[j].dataset.section === sectionName) {
navLinks[j].classList.add('active');
}
}

if (sectionName === 'manage') {
var login = getCurrentUserLogin();
if (login && typeof renderCalendars === 'function') {
renderCalendars(login);
}
// Инициализируем менеджер новостей при переходе в раздел управления
if (typeof initNewsManager === 'function') {
setTimeout(function() { initNewsManager(); }, 50);
}
} else if (sectionName === 'news') {
// При переходе в раздел новостей обновляем их отображение
if (typeof refreshNewsGrid === 'function') {
refreshNewsGrid();
} else {
loadNews();
}
}
}

for (var k = 0; k < navLinks.length; k++) {
navLinks[k].addEventListener('click', function(e) {
e.preventDefault();
var section = this.dataset.section;
showSection(section);
});
}

function openLoginModal() {
loginModal.style.display = 'flex';
loginInput.value = '';
passwordInput.value = '';
loginError.style.display = 'none';
setTimeout(function() {
loginInput.focus();
}, 100);
}

function closeLoginModal() {
loginModal.style.display = 'none';
}

loginBtn.addEventListener('click', function(e) {
e.preventDefault();
e.stopPropagation();
openLoginModal();
});

manageBtn.addEventListener('click', function(e) {
e.preventDefault();
if (isLoggedIn()) {
showSection('manage');
} else {
openLoginModal();
}
});

logoutBtn.addEventListener('click', function(e) {
e.preventDefault();
clearSession();
updateAuthUI();
showSection('news');
});

closeModalBtn.addEventListener('click', function(e) {
e.preventDefault();
closeLoginModal();
});

if (closeNewsModalBtn) {
closeNewsModalBtn.addEventListener('click', function(e) {
e.preventDefault();
closeNewsModal();
});
}

loginModal.addEventListener('click', function(e) {
if (e.target === loginModal) {
closeLoginModal();
}
});

if (newsModal) {
newsModal.addEventListener('click', function(e) {
if (e.target === newsModal) {
closeNewsModal();
}
});
}

document.addEventListener('keydown', function(e) {
if (e.key === 'Escape') {
if (loginModal.style.display === 'flex') {
closeLoginModal();
}
if (newsModal && newsModal.style.display === 'flex') {
closeNewsModal();
}
}
});

loginForm.addEventListener('submit', function(e) {
e.preventDefault();

var login = loginInput.value;
var password = passwordInput.value;

var user = authenticate(login, password);
if (user) {
saveSession(user.login);
updateAuthUI();
closeLoginModal();
showSection('manage');
} else {
loginError.style.display = 'block';
passwordInput.value = '';
passwordInput.focus();
}
});

// Инициализация данных новостей через news-manager
if (typeof loadNewsFromLocal === 'function') {
loadNewsFromLocal();
if (typeof syncNews === 'function') syncNews();
}

loadNews();
loadPhotos();
updateAuthUI();
showSection('news');
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', bootstrap);
} else {
bootstrap();
}

})();