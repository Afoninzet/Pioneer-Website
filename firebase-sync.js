/**
 * Firebase синхронизация для календаря репетиций
 * Обеспечивает синхронизацию отметок между всеми устройствами
 */

let firebaseEnabled = false;
let firebaseDB = null;
let currentListener = null;

// Проверяем доступность Firebase
function initFirebase() {
    if (typeof window.firebaseDB !== 'undefined' && window