/**
 * Основной модуль приложения сайта "Пионеры Дальнего Космоса"
 * Управляет навигацией, модальным окном входа и состоянием интерфейса.
 * ВНИМАНИЕ: скрипт подключается в конце <body>, все DOM-элементы гарантированно существуют.
 */

(function() {
    'use strict';

    function bootstrap() {
        var loginBtn = document.getElementById('loginBtn');
        var manageBtn = document.getElementById('manageBtn');
        var logoutBtn = document.getElementById('logoutBtn');
        var userIndicator = document.getElementById('userIndicator');
        var loginModal = document.getElementById('loginModal');
        var loginForm = document.getElementById('loginForm');
        var loginInput = document.getElementById('loginInput');
        var passwordInput = document.getElementById('passwordInput');
        var loginError = document.getElementById('loginError');
        var closeModalBtn = document.getElementById('closeModalBtn');
        var navLinks = document.querySelectorAll('.nav-link');
        var contentSections = document.querySelectorAll('.content-section');

        if (!loginBtn) {
            console.error('Кнопка loginBtn не найдена в DOM!');
            return;
        }

        console.log('App: все DOM-элементы найдены, инициализация...');

        var currentSection = 'news';

        function updateAuthUI() {
            var loggedIn = isLoggedIn();
            var displayName = getCurrentUserDisplayName();

            console.log('updateAuthUI: loggedIn =', loggedIn, 'displayName =', displayName);

            if (loggedIn) {
                loginBtn.style.display = 'none';
                manageBtn.style.display = 'inline-flex';
                logoutBtn.style.display = 'inline-flex';
                userIndicator.style.display = 'inline-block';
                userIndicator.textContent = displayName;
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

            contentSections.forEach(function(section) {
                section.classList.remove('active');
            });

            var targetSection = document.getElementById('section-' + sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            navLinks.forEach(function(link) {
                link.classList.remove('active');
                if (link.dataset.section === sectionName) {
                    link.classList.add('active');
                }
            });

            if (sectionName === 'manage') {
                var login = getCurrentUserLogin();
                if (login) {
                    if (typeof renderCalendars === 'function') {
                        renderCalendars(login);
                    }
                }
            }
        }

        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var section = link.dataset.section;
                showSection(section);
            });
        });

        function openLoginModal() {
            console.log('openLoginModal called');
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
            console.log('Клик по кнопке входа');
            e.preventDefault();
            e.stopPropagation();
            openLoginModal();
        });

        manageBtn.addEventListener('click', function(e) {
            console.log('Клик по кнопке "Управление"');
            e.preventDefault();
            if (isLoggedIn()) {
                showSection('manage');
            } else {
                openLoginModal();
            }
        });

        logoutBtn.addEventListener('click', function(e) {
            console.log('Клик по кнопке "Выйти"');
            e.preventDefault();
            clearSession();
            updateAuthUI();
            showSection('news');
        });

        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
        });

        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.style.display === 'flex') {
                closeLoginModal();
            }
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Форма входа отправлена');

            var login = loginInput.value;
            var password = passwordInput.value;

            var user = authenticate(login, password);
            if (user) {
                console.log('Успешный вход:', user.displayName);
                saveSession(user.login);
                updateAuthUI();
                closeLoginModal();
                showSection('manage');
            } else {
                console.log('Неверные учётные данные');
                loginError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });

        updateAuthUI();
        showSection('news');
        console.log('App полностью инициализирован.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

})();