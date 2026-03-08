// Cross‑browser polyfills for Snake Game
(function() {
    // requestAnimationFrame polyfill
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (function() {
            return window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                function(id) {
                    clearTimeout(id);
                };
        })();
    }

    // performance.now polyfill (for older browsers)
    if (!window.performance || !window.performance.now) {
        (function() {
            var start = Date.now();
            if (!window.performance) window.performance = {};
            window.performance.now = function() {
                return Date.now() - start;
            };
        })();
    }

    // localStorage detection with graceful fallback
    if (!window.localStorage) {
        window.localStorage = (function() {
            var store = {};
            return {
                getItem: function(key) {
                    return store[key] || null;
                },
                setItem: function(key, value) {
                    store[key] = String(value);
                },
                removeItem: function(key) {
                    delete store[key];
                },
                clear: function() {
                    store = {};
                }
            };
        })();
    }

    // fetch polyfill (optional, only load if needed)
    // We'll not include a full fetch polyfill because it's large,
    // but we can provide a basic XMLHttpRequest-based fallback for critical API calls.
    // The game already has try‑catch around fetch calls, so we'll rely on that.
})();