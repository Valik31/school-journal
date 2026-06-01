// js/modules/dashboard.js
import { appState } from '../core/state.js';

export class Dashboard {
    render(container) {
        const user = appState.getUser();

        let contentHtml = `
            <div style="margin-bottom: var(--spacing-lg);">
                <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Вітаємо, ${user.fullName.split(' ')[0]}!</h1>
                <p style="color: var(--text-secondary);">Огляд системи на сьогодні.</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg);">
        `;

        if (user.role === 'teacher' || user.role === 'form_master') {
            contentHtml += `
                <div class="card">
                    <div class="card-header">
                        <h3 style="font-weight: 600; font-size: var(--font-size-base);">Мої класи на сьогодні</h3>
                    </div>
                    <ul style="padding: 0; margin: 0; list-style: none;">
                        <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                            <span>8-А (Алгебра)</span> <span class="badge badge-success">Проведено</span>
                        </li>
                        <li style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                            <span>9-Б (Інформатика)</span> <span class="badge badge-warning">12:00</span>
                        </li>
                        <li style="padding: var(--spacing-sm) 0; display: flex; justify-content: space-between;">
                            <span>11-А (Геометрія)</span> <span class="badge badge-warning">13:55</span>
                        </li>
                    </ul>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 style="font-weight: 600; font-size: var(--font-size-base);">Швидкі дії</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                        <a href="#journal" class="btn btn-primary" style="text-align: left; justify-content: flex-start;">Виставити оцінки</a>
                        <a href="#homework" class="btn btn-outline" style="text-align: left; justify-content: flex-start;">Додати домашнє завдання</a>
                    </div>
                </div>
            `;
        } else if (user.role === 'student') {
            contentHtml += `
                <div class="card">
                    <div class="card-header">
                        <h3 style="font-weight: 600; font-size: var(--font-size-base);">Останні оцінки</h3>
                    </div>
                    <div style="font-size: var(--font-size-xl); font-weight: 700; color: var(--success-color);">
                        11 <span style="font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: 400;">Алгебра</span>
                    </div>
                </div>
            `;
        }

        contentHtml += `</div>`;
        container.innerHTML = contentHtml;
    }
}