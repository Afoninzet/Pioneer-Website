/**

- Firebase синхронизация для календаря репетиций
- Обеспечивает синхронизацию отметок между всеми устройствами
*/

var firebaseEnabled = false;
var firebaseDB = null;
var currentListener = null;

function initFirebase() {
try {
if (typeof window.firebaseDB !== 'undefined' && window.firebaseDB) {
firebaseDB = window.firebaseDB;
firebaseEnabled = true;
console.log('Firebase инициализирован успешно');
return true;
}
} catch (e) {
console.warn('Ошибка инициализации Firebase:', e.message);
}

console.log('Firebase не доступен, работаем в офлайн режиме');
return false;
}

function isFirebaseEnabled() {
return firebaseEnabled;
}

function getFirebaseDB() {
return firebaseDB;
}

initFirebase();