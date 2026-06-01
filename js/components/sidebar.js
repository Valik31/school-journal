// js/components/sidebar.js
import { appState } from '../core/state.js';

export class Sidebar {
    constructor() {
        this.container = document.getElementById('sidebar');
    }

    render() {
        const user = appState.getUser();
        const menuItems = this.getMenuItemsByRole(user.role);

        let menuHtml = `
            <div style="padding: var(--spacing-lg); border-bottom: 1px solid var(--border-color);">
                <h2 style="font-size: var(--font-size-lg); font-weight: 700; color: var(--primary-color);">Є-Журнал</h2>
                <span style="font-size: var(--font-size-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Система управління</span>
            </div>
            <nav style="padding: var(--spacing-md) 0; flex: 1; overflow-y: auto;">
                <ul style="list-style: none; padding: 0; margin: 0;">
        `;

        menuItems.forEach(item => {
            menuHtml += `
                <li>
                    <a href="${item.hash}" class="menu-link" style="display: flex; align-items: center; padding: var(--spacing-sm) var(--spacing-lg); color: var(--text-primary); transition: background-color var(--transition-fast); text-decoration: none;">
                        <span style="font-weight: 500;">${item.title}</span>
                    </a>
                </li>
            `;
        });

        menuHtml += `
                </ul>
            </nav>
        `;

        this.container.innerHTML = menuHtml;
        this.highlightCurrentRoute();
        
        // Оновлення активного пункту при зміні хешу
        window.addEventListener('hashchange', () => this.highlightCurrentRoute());
    }

    highlightCurrentRoute() {
        const currentHash = window.location.hash || '#dashboard';
        const links = this.container.querySelectorAll('.menu-link');
        
        links.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.style.backgroundColor = 'var(--surface-hover)';
                link.style.borderRight = '3px solid var(--primary-color)';
                link.style.color = 'var(--primary-color)';
            } else {
                link.style.backgroundColor = 'transparent';
                link.style.borderRight = '3px solid transparent';
                link.style.color = 'var(--text-primary)';
            }
        });
    }

    getMenuItemsByRole(role) {
        const commonItems = [
            { title: 'Головна панель', hash: '#dashboard' },
            { title: 'Розклад', hash: '#schedule' }
        ];

        switch (role) {
            case 'admin':
                return [
                    ...commonItems,
                    { title: 'Управління класами', hash: '#admin-classes' },
                    { title: 'Користувачі', hash: '#admin-users' },
                    { title: 'Статистика школи', hash: '#admin-reports' }
                ];
            case 'teacher':
                return [
                    ...commonItems,
                    { title: 'Журнали класів', hash: '#journal' },
                    { title: 'Домашні завдання', hash: '#homework' },
                    { title: 'Оцінювання НУШ', hash: '#nush' },
                    { title: 'Мої звіти', hash: '#reports' }
                ];
            case 'form_master':
                return [
                    ...commonItems,
                    { title: 'Мій клас (Журнал)', hash: '#journal' },
                    { title: 'Відвідування', hash: '#attendance' },
                    { title: 'Свідоцтва досягнень', hash: '#nush-certificates' },
                    { title: 'Звіти для батьків', hash: '#reports' }
                ];
            case 'student':
                return [
                    ...commonItems,
                    { title: 'Мої оцінки', hash: '#student-grades' },
                    { title: 'Домашні завдання', hash: '#student-homework' }
                ];
            default:
                return commonItems;
        }
    }
}