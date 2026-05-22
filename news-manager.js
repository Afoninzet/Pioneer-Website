/**
 * Модуль управления новостями для сайта "Пионеры Дальнего Космоса"
 * Позволяет авторизованным музыкантам создавать и удалять новости.
 * Хранилище: localStorage + Firebase (двусторонняя синхронизация)
 */

var NEWS_STORAGE_KEY = 'pdk_news';
var NEWS_FIREBASE_PATH = 'news';

// Инициализация глобального массива новостей (если ещё нет)
if (typeof window.NEWS_DATA === 'undefined') {
    window.NEWS_DATA = [];
}

// Загрузка новостей из localStorage
function loadNewsFromLocal() {
    try {
        var raw = localStorage.getItem(NEWS_STORAGE_KEY);
        if (raw) {
            var savedNews = JSON.parse(raw);
            if (Array.isArray(savedNews) && savedNews.length > 0) {
                window.NEWS_DATA = savedNews;
                return true;
            }
        }
    } catch (e) {
        console.warn('Ошибка загрузки новостей из localStorage:', e);
    }
    
    // Если в localStorage пусто, загружаем тестовую новость
    if (window.NEWS_DATA.length === 0) {
        window.NEWS_DATA = [{
            id: Date.now(),
            title: "У нас новый сайт!",
            date: new Date().toLocaleDateString('ru-RU'),
            time: new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}),
            content: "Друзья! Мы рады представить вам наш обновлённый сайт. Здесь вы найдёте актуальные новости, афишу концертов, фотографии с выступлений и удобный календарь репетиций для музыкантов. Сайт выполнен в космическом стиле, который отражает нашу музыку — рок, летящий сквозь галактики! Приятного просмотра и до встречи на концертах!"
        }];
        saveNewsToLocal();
    }
    return true;
}

// Сохранение новостей в localStorage
function saveNewsToLocal() {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(window.NEWS_DATA));
}

// Загрузка новостей из Firebase
function loadNewsFromFirebase() {
    if (!window.firebaseDB || typeof window.firebaseGet !== 'function') {
        console.log('Firebase не доступен, используем только localStorage');
        return Promise.resolve(false);
    }
    
    return window.firebaseGet(window.firebaseRef(window.firebaseDB, NEWS_FIREBASE_PATH))
        .then(function(snapshot) {
            var firebaseNews = snapshot.val();
            if (firebaseNews && Array.isArray(firebaseNews) && firebaseNews.length > 0) {
                window.NEWS_DATA = firebaseNews;
                saveNewsToLocal();
                return true;
            }
            return false;
        })
        .catch(function(e) {
            console.warn('Ошибка загрузки новостей из Firebase:', e);
            return false;
        });
}

// Сохранение новостей в Firebase
function saveNewsToFirebase() {
    if (!window.firebaseDB || typeof window.firebaseSet !== 'function') {
        return Promise.resolve(false);
    }
    
    return window.firebaseSet(
        window.firebaseRef(window.firebaseDB, NEWS_FIREBASE_PATH),
        window.NEWS_DATA
    ).then(function() {
        console.log('Новости синхронизированы с Firebase');
        return true;
    }).catch(function(e) {
        console.warn('Ошибка синхронизации новостей с Firebase:', e);
        return false;
    });
}

// Синхронизация новостей (загрузка из Firebase, если есть, и сохранение обратно)
function syncNews() {
    return loadNewsFromFirebase().then(function(hasFirebaseData) {
        if (!hasFirebaseData && window.NEWS_DATA.length > 0) {
            return saveNewsToFirebase();
        }
        return true;
    });
}

// Создание новой новости
function createNews(title, content) {
    if (!title || !title.trim()) {
        throw new Error('Заголовок не может быть пустым');
    }
    if (!content || !content.trim()) {
        throw new Error('Текст новости не может быть пустым');
    }
    
    var now = new Date();
    var newsItem = {
        id: Date.now(),
        title: title.trim(),
        date: now.toLocaleDateString('ru-RU'),
        time: now.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}),
        content: content.trim()
    };
    
    window.NEWS_DATA.unshift(newsItem); // новые новости в начало
    saveNewsToLocal();
    saveNewsToFirebase().catch(function(e) { console.warn(e); });
    
    // Обновляем отображение новостей, если раздел активен
    if (typeof refreshNewsGrid === 'function') {
        refreshNewsGrid();
    }
    
    return newsItem;
}

// Удаление новости по ID
function deleteNews(newsId) {
    var index = window.NEWS_DATA.findIndex(function(n) { return n.id === newsId; });
    if (index === -1) return false;
    
    window.NEWS_DATA.splice(index, 1);
    saveNewsToLocal();
    saveNewsToFirebase().catch(function(e) { console.warn(e); });
    
    if (typeof refreshNewsGrid === 'function') {
        refreshNewsGrid();
    }
    
    return true;
}

// Обновление отображения новостей (вызывается из app.js)
function refreshNewsGrid() {
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
        
        // Добавляем кнопку удаления для авторизованных пользователей
        if (typeof isLoggedIn === 'function' && isLoggedIn()) {
            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'news-delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Удалить новость';
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Удалить новость "' + news.title + '"?')) {
                    deleteNews(news.id);
                }
            });
            newsCard.appendChild(deleteBtn);
        }
        
        newsCard.addEventListener('click', (function(n) {
            return function() { 
                if (typeof openNewsModal === 'function') {
                    openNewsModal(n);
                }
            };
        })(news));
        
        newsGrid.appendChild(newsCard);
    }
    
    if (window.NEWS_DATA.length === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-news-message';
        emptyMsg.textContent = '📭 Новостей пока нет. Будьте первым!';
        newsGrid.appendChild(emptyMsg);
    }
}

// Инициализация формы создания новостей в разделе управления
function initNewsManager() {
    var manageSection = document.getElementById('section-manage');
    if (!manageSection) return;
    
    // Проверяем, не добавлен ли уже блок
    if (document.getElementById('newsCreatorPanel')) return;
    
    var creatorPanel = document.createElement('div');
    creatorPanel.id = 'newsCreatorPanel';
    creatorPanel.className = 'news-creator-panel';
    creatorPanel.innerHTML = `
        <h3 class="news-creator-title">📝 Создать новость</h3>
        <div class="news-creator-form">
            <input type="text" id="newsTitleInput" class="news-title-input" placeholder="Заголовок новости" maxlength="100">
            <textarea id="newsContentInput" class="news-content-input" rows="4" placeholder="Текст новости..."></textarea>
            <div class="news-creator-buttons">
                <button id="publishNewsBtn" class="btn-publish-news">📰 Опубликовать</button>
            </div>
            <div id="newsCreatorError" class="news-creator-error" style="display: none;"></div>
        </div>
        <hr class="news-creator-divider">
    `;
    
    // Вставляем перед календарём или в начало
    var calendarContainer = document.getElementById('calendarContainer');
    if (calendarContainer && calendarContainer.parentNode === manageSection) {
        manageSection.insertBefore(creatorPanel, calendarContainer);
    } else {
        manageSection.insertBefore(creatorPanel, manageSection.firstChild.nextSibling);
    }
    
    // Навешиваем обработчики
    var publishBtn = document.getElementById('publishNewsBtn');
    var titleInput = document.getElementById('newsTitleInput');
    var contentInput = document.getElementById('newsContentInput');
    var errorDiv = document.getElementById('newsCreatorError');
    
    function publishNews() {
        var title = titleInput ? titleInput.value : '';
        var content = contentInput ? contentInput.value : '';
        
        errorDiv.style.display = 'none';
        
        if (!title.trim()) {
            errorDiv.textContent = '❌ Введите заголовок новости';
            errorDiv.style.display = 'block';
            titleInput.focus();
            return;
        }
        
        if (!content.trim()) {
            errorDiv.textContent = '❌ Введите текст новости';
            errorDiv.style.display = 'block';
            contentInput.focus();
            return;
        }
        
        try {
            createNews(title, content);
            titleInput.value = '';
            contentInput.value = '';
            
            // Показываем уведомление об успехе
            errorDiv.style.color = '#5aad5a';
            errorDiv.textContent = '✅ Новость опубликована!';
            errorDiv.style.display = 'block';
            setTimeout(function() {
                errorDiv.style.display = 'none';
                errorDiv.style.color = '#b54a4a';
            }, 3000);
            
        } catch (e) {
            errorDiv.textContent = '❌ ' + e.message;
            errorDiv.style.display = 'block';
        }
    }
    
    if (publishBtn) {
        publishBtn.addEventListener('click', publishNews);
    }
    
    if (titleInput) {
        titleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (contentInput) contentInput.focus();
            }
        });
    }
    
    if (contentInput) {
        contentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                publishNews();
            }
        });
    }
}

// Загружаем новости при старте
loadNewsFromLocal();
syncNews().catch(function(e) { console.warn(e); });

// Экспортируем функции в глобальную область
window.createNews = createNews;
window.deleteNews = deleteNews;
window.refreshNewsGrid = refreshNewsGrid;
window.initNewsManager = initNewsManager;
window.syncNews = syncNews;
window.loadNewsFromLocal = loadNewsFromLocal;