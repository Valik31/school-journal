// js/core/router.js

export class Router {
    constructor(routes, defaultRoute = '#dashboard') {
        this.routes = routes;
        this.defaultRoute = defaultRoute;
        this.rootElement = document.getElementById('main-content');
        
        window.addEventListener('hashchange', () => this.handleRouteChange());
    }

    // Ініціалізація початкового маршруту
    init() {
        if (!window.location.hash) {
            window.location.hash = this.defaultRoute;
        } else {
            this.handleRouteChange();
        }
    }

    // Обробка зміни URL
    handleRouteChange() {
        const currentHash = window.location.hash || this.defaultRoute;
        const route = this.routes[currentHash];

        this.rootElement.innerHTML = ''; // Очищуємо попередній контент

        if (route && typeof route.render === 'function') {
            route.render(this.rootElement);
        } else {
            this.renderNotFound();
        }
    }

    // Сторінка 404 для невідомих маршрутів
    renderNotFound() {
        this.rootElement.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <h1 style="font-size: 48px; color: var(--primary-color);">404</h1>
                <p style="font-size: var(--font-size-lg); color: var(--text-secondary);">Модуль не знайдено або знаходиться в розробці.</p>
                <a href="#dashboard" class="btn btn-primary" style="margin-top: var(--spacing-lg);">На головну</a>
            </div>
        `;
    }
}