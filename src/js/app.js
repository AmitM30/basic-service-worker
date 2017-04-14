'use strict';

var initServiceWorker = function () {
    if ('serviceWorker' in window.navigator) {
        window.navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (reg) {
            if (reg.installing) {
                console.log('Service worker installing');
            } else if (reg.waiting) {
                console.log('Service worker installed');
            } else if (reg.active) {
                console.log('Service worker active');
            }
        }).catch(function (error) { console.info('Service Worker Registration failed with ' + error); });
    }
}

initServiceWorker();
