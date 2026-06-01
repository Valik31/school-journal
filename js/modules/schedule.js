// js/modules/schedule.js
import { appState } from '../core/state.js';

export class Schedule {
    constructor() {
        // Розклад дзвінків
        this.bells = [
            { lesson: 1, start: '08:30', end: '09:15' },
            { lesson: 2, start: '09:25', end: '10:10' },
            { lesson: 3, start: '10:30', end: '11:15' },
            { lesson: 4, start: '11:35', end: '12:20' },
            { lesson: 5, start: '12:30', end: '13:15' },
            { lesson: 6, start: '13:25', end: '14:10' },
            { lesson: 7, start: '14:20', end: '15:05' }
        ];

        // Тижневий розклад (календар) для 8-А
        this.weekDays = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця'];
        
        // Структура: scheduleData[dayIndex][lessonIndex]
        this.scheduleData = {
            0: ['Алгебра', 'Українська мова', 'Інформатика', 'Фізика', 'Історія України', 'Фізкультура', ''],
            1: ['Геометрія', 'Англійська мова', 'Біологія', 'Алгебра', 'Зарубіжна літ.', 'Мистецтво', ''],
            2: ['Інформатика', 'Фізика', 'Хімія', 'Українська літ.', 'Англійська мова', 'Основи здоров\'я', ''],
            3: ['Алгебра', 'Геометрія', 'Географія', 'Українська мова', 'Фізкультура', 'Трудове навч.', ''],
            4: ['Англійська мова', 'Історія України', 'Інформатика', 'Біологія', 'Хімія', '', '']
        };

        // Заміни: об'єкт, де ключ "dayIndex-lessonIndex"
        this.substitutions = {
            '2-0': { original: 'Інформатика', new: 'Алгебра', teacher: 'Коваленко І.П.' }, // Середа, 1 урок
            '4-2': { original: 'Інформатика', new: 'Фізика', teacher: 'Шевченко О.І.' }    // П'ятниця, 3 урок
        };

        this.currentTab = 'lessons'; // 'lessons' або 'bells'
    }

    render(container) {
        this.container = container;
        this.buildLayout();
        this.bindEvents();
    }

    buildLayout() {
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <div>
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Розклад</h1>
                    <p style="color: var(--text-secondary);">Клас: 8-А</p>
                </div>
                
                <div style="display: flex; gap: var(--spacing-sm); background-color: var(--surface-hover); padding: 4px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
                    <button class="btn tab-btn ${this.currentTab === 'lessons' ? 'btn-primary' : ''}" data-tab="lessons" style="padding: 6px 16px;">Уроки</button>
                    <button class="btn tab-btn ${this.currentTab === 'bells' ? 'btn-primary' : ''}" data-tab="bells" style="padding: 6px 16px;">Дзвінки</button>
                </div>
            </div>
            
            <div id="schedule-content">
                ${this.currentTab === 'lessons' ? this.renderLessonsView() : this.renderBellsView()}
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderLessonsView() {
        // Генерація тижневої сітки (календаря)
        let theadHtml = `<th style="width: 50px; text-align: center;">№</th>`;
        this.weekDays.forEach(day => {
            theadHtml += `<th style="text-align: center; width: 19%;">${day}</th>`;
        });

        let tbodyHtml = '';
        for (let lessonIdx = 0; lessonIdx < 7; lessonIdx++) {
            tbodyHtml += `<tr>`;
            tbodyHtml += `<td style="text-align: center; font-weight: 600; color: var(--text-secondary); background-color: var(--surface-hover);">${lessonIdx + 1}</td>`;
            
            for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
                let subject = this.scheduleData[dayIdx][lessonIdx];
                let cellContent = subject ? `<span style="font-weight: 500;">${subject}</span>` : `<span style="color: var(--border-color);">-</span>`;
                let cellStyle = '';
                
                // Перевірка на заміну
                const subKey = `${dayIdx}-${lessonIdx}`;
                if (this.substitutions[subKey]) {
                    const sub = this.substitutions[subKey];
                    cellStyle = 'background-color: rgba(245, 158, 11, 0.05); border-left: 3px solid var(--warning-color);';
                    cellContent = `
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="text-decoration: line-through; color: var(--text-secondary); font-size: var(--font-size-xs);">${sub.original}</span>
                            <span style="font-weight: 700; color: var(--warning-color);">${sub.new}</span>
                            <span class="badge badge-warning" style="align-self: flex-start;">Заміна: ${sub.teacher}</span>
                        </div>
                    `;
                }

                tbodyHtml += `<td style="${cellStyle}">${cellContent}</td>`;
            }
            tbodyHtml += `</tr>`;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>${theadHtml}</tr>
                    </thead>
                    <tbody>
                        ${tbodyHtml}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: var(--spacing-md); color: var(--text-secondary); font-size: var(--font-size-sm);">
                * Увага: У розкладі можливі оперативні зміни. Слідкуйте за позначками <span class="badge badge-warning">Заміна</span>.
            </div>
        `;
    }

    renderBellsView() {
        // Генерація розкладу дзвінків
        let rowsHtml = this.bells.map(bell => `
            <tr>
                <td style="text-align: center; font-weight: 600; width: 100px; background-color: var(--surface-hover);">Урок ${bell.lesson}</td>
                <td style="font-weight: 500; font-size: var(--font-size-lg); text-align: center;">
                    ${bell.start} <span style="color: var(--text-secondary); margin: 0 var(--spacing-sm);">-</span> ${bell.end}
                </td>
            </tr>
        `).join('');

        return `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="table-container" style="border: none;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Урок</th>
                                <th style="text-align: center;">Час проведення</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const tabBtns = this.container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                if (this.currentTab !== targetTab) {
                    this.currentTab = targetTab;
                    this.buildLayout();
                    this.bindEvents(); // Переприв'язуємо події після перемальовування
                }
            });
        });
    }
}