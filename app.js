/**
 * Основной модуль приложения сайта "Пионеры Дальнего Космоса"
 * Управляет навигацией, модальным окном входа и состоянием интерфейса.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM-элементы ===
    const loginBtn = document.getElementById('loginBtn');
    const manageBtn = document.getElementById('manageBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userIndicator = document.getElementById('userIndicator');
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    // === Состояние ===
    let currentSection = 'news'; // Активный раздел по умолчанию

    // === Инициализация ===
    function init() {
        updateAuthUI();

        // Если пользователь авторизован и хочет перейти в управление,
        // показываем раздел новостей по умолчанию
        showSection('news');

        // Если есть активная сессия, не показываем модалку
    }

    // === Обновление UI в зависимости от авторизации ===
    function updateAuthUI() {
        const loggedIn = isLoggedIn();
        const displayName = getCurrentUserDisplayName();

        if (loggedIn) {
            loginBtn.style.display = 'none';
            manageBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
            userIndicator.style.display = 'inline-block';
            userIndicator.textContent = displayName;
        } else {
            loginBtn.style.display = 'inline-block';
            manageBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            userIndicator.style.display = 'none';
            userIndicator.textContent = '';

            // Если мы на странице управления, возвращаем на новости