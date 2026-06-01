// js/components/topbar.js
import { appState } from '../core/state.js';
import { authService } from '../auth/auth.js';

export class Topbar {
    constructor() {
        this.container = document.getElementById('topbar');
    }

    render() {
        const user = appState.getUser();
        const roleNames = {
            admin: 'Адміністратор',
            teacher: 'Вчитель',
            form_master: 'Класний керівник',
            student: 'Учень'
        };

        this.container.innerHTML = `
            <div class="school-info" style="display: flex; align-items: center; gap: var(--spacing-md);">
                <div style="font-weight: 600; font-size: var(--font-size-base); color: var(--text-primary);">
                    Криворізький ліцей №35 "Імпульс"
                </div>
                <span class="badge badge-info" style="background-color: var(--surface-hover); color: var(--secondary-color);">
                    Навчальний рік: ${appState.currentYear}
                </span>
            </div>
            
            <div class="user-controls" style="display: flex; align-items: center; gap: var(--spacing-lg);">
                <div class="user-profile" style="text-align: right;">
                    <div style="font-weight: 500; font-size: var(--font-size-sm); color: var(--text-primary);">
                        ${user.fullName}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">
                        ${roleNames[user.role]}
                    </div>
                </div>
                <button id="logout-btn" class="btn btn-outline" style="padding: var(--spacing-xs) var(--spacing-sm); border: 1px solid var(--border-color);">
                    Вийти
                </button>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            authService.logout();
        });
    }
}