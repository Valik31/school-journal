// js/app.js
import { authService } from './auth/auth.js';
import { appState } from './core/state.js';
import { LoginScreen } from './components/login.js';
import { Sidebar } from './components/sidebar.js';
import { Topbar } from './components/topbar.js';
import { Router } from './core/router.js';
import { Dashboard } from './modules/dashboard.js';
import { Journal } from './modules/journal.js';
import { Attendance } from './modules/attendance.js';
import { Homework } from './modules/homework.js';
import { Nush } from './modules/nush.js';
import { Schedule } from './modules/schedule.js'; // Імпорт модуля розкладу

class App {
    constructor() {
        this.isInitialized = false;
        this.sidebar = new Sidebar();
        this.topbar = new Topbar();
    }

    async init() {
        try {
            this.bindGlobalEvents();
            const isAuthenticated = authService.checkSession();

            if (!isAuthenticated) {
                this.showLoginScreen();
            } else {
                this.loadMainInterface();
            }
            this.isInitialized = true;
        } catch (error) {
            console.error('Помилка ініціалізації додатку:', error);
            this.showCriticalError();
        }
    }

    showLoginScreen() {
        const loginScreen = new LoginScreen(() => {
            this.loadMainInterface();
        });
        loginScreen.render();
    }

    loadMainInterface() {
        this.sidebar.render();
        this.topbar.render();

        const homeworkModule = new Homework();
        const nushModule = new Nush();
        
        // Реєстрація всіх маршрутів системи
        const routes = {
            '#dashboard': new Dashboard(),
            '#journal': new Journal(),
            '#attendance': new Attendance(),
            '#homework': homeworkModule,
            '#student-homework': homeworkModule,
            '#nush': nushModule,
            '#nush-certificates': nushModule,
            '#schedule': new Schedule() // Маршрут розкладу
        };

        this.router = new Router(routes, '#dashboard');
        this.router.init();
    }

    bindGlobalEvents() {
        window.addEventListener('theme-toggle', () => {
            document.body.classList.toggle('dark-theme');
            document.body.classList.toggle('light-theme');
        });
    }

    showCriticalError() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--danger-color);">
                    <h1>Критична помилка</h1>
                    <p>Не вдалося завантажити додаток. Будь ласка, оновіть сторінку.</p>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});