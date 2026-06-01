// js/modules/homework.js
import { appState } from '../core/state.js';
import { UI } from '../components/ui.js';

export class Homework {
    constructor() {
        // Імітація бази даних домашніх завдань
        this.assignments = [
            { 
                id: 1, 
                targetClass: '8-А', 
                subject: 'Алгебра', 
                issueDate: '01.09', 
                deadline: '03.09', 
                text: 'Опрацювати параграф 1 (ст. 10-14). Виконати вправи № 12, 14 у робочому зошиті.' 
            },
            { 
                id: 2, 
                targetClass: '8-А', 
                subject: 'Інформатика', 
                issueDate: '02.09', 
                deadline: '05.09', 
                text: 'Підготувати презентацію на тему "Історія розвитку комп\'ютерної техніки" (мінімум 5 слайдів).' 
            },
            { 
                id: 3, 
                targetClass: '9-Б', 
                subject: 'Алгебра', 
                issueDate: '02.09', 
                deadline: '04.09', 
                text: 'Повторити формули скороченого множення.' 
            }
        ];
    }

    render(container) {
        this.container = container;
        const user = appState.getUser();

        // Розділення логіки відображення залежно від ролі
        if (user.role === 'student') {
            this.renderStudentView(user);
        } else {
            this.renderTeacherView();
        }
    }

    // ==========================================
    // ІНТЕРФЕЙС ВЧИТЕЛЯ / КЛАСНОГО КЕРІВНИКА
    // ==========================================
    renderTeacherView() {
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <div>
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Управління домашніми завданнями</h1>
                    <p style="color: var(--text-secondary);">Історія та призначення завдань</p>
                </div>
                <button id="add-homework-btn" class="btn btn-primary">+ Додати завдання</button>
            </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 10%;">Клас</th>
                            <th style="width: 15%;">Предмет</th>
                            <th style="width: 10%;">Дата видачі</th>
                            <th style="width: 10%;">Термін (до)</th>
                            <th style="width: 55%;">Текст завдання</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.assignments.map(hw => `
                            <tr>
                                <td style="font-weight: 600;">${hw.targetClass}</td>
                                <td>${hw.subject}</td>
                                <td>${hw.issueDate}</td>
                                <td style="color: var(--danger-color); font-weight: 500;">${hw.deadline}</td>
                                <td>${hw.text}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Прив'язка події для кнопки додавання
        document.getElementById('add-homework-btn').addEventListener('click', () => {
            this.openCreateModal();
        });
    }

    openCreateModal() {
        const content = `
            <div class="form-group" style="display: flex; gap: var(--spacing-md);">
                <div style="flex: 1;">
                    <label class="form-label">Клас</label>
                    <select id="hw-class" class="form-control">
                        <option value="8-А">8-А</option>
                        <option value="9-Б">9-Б</option>
                        <option value="11-А">11-А</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label class="form-label">Предмет</label>
                    <select id="hw-subject" class="form-control">
                        <option value="Алгебра">Алгебра</option>
                        <option value="Інформатика">Інформатика</option>
                        <option value="Геометрія">Геометрія</option>
                    </select>
                </div>
            </div>
            <div class="form-group" style="display: flex; gap: var(--spacing-md);">
                <div style="flex: 1;">
                    <label class="form-label">Дата видачі</label>
                    <input type="text" id="hw-issue-date" class="form-control" placeholder="ДД.ММ" required>
                </div>
                <div style="flex: 1;">
                    <label class="form-label">Термін виконання (до)</label>
                    <input type="text" id="hw-deadline" class="form-control" placeholder="ДД.ММ" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Текст завдання</label>
                <textarea id="hw-text" class="form-control" rows="4" placeholder="Введіть опис домашнього завдання..." required></textarea>
            </div>
        `;

        UI.showModal('Нове домашнє завдання', content, () => {
            const targetClass = document.getElementById('hw-class').value;
            const subject = document.getElementById('hw-subject').value;
            const issueDate = document.getElementById('hw-issue-date').value;
            const deadline = document.getElementById('hw-deadline').value;
            const text = document.getElementById('hw-text').value;

            // Валідація
            if (!issueDate || !deadline || !text) {
                alert('Будь ласка, заповніть усі поля.');
                return false; // Забороняє закриття модалки
            }

            // Додавання до стану
            const newAssignment = {
                id: this.assignments.length + 1,
                targetClass,
                subject,
                issueDate,
                deadline,
                text
            };
            
            this.assignments.unshift(newAssignment); // Додаємо на початок списку
            this.renderTeacherView(); // Перемальовуємо таблицю
            return true; // Дозволяє закриття модалки
        });
    }

    // ==========================================
    // ІНТЕРФЕЙС УЧНЯ
    // ==========================================
    renderStudentView(user) {
        // Фільтруємо завдання лише для класу учня
        const studentClass = user.studentClass || '8-А';
        const myAssignments = this.assignments.filter(hw => hw.targetClass === studentClass);

        let html = `
            <div style="margin-bottom: var(--spacing-lg);">
                <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Мої домашні завдання</h1>
                <p style="color: var(--text-secondary);">Клас: ${studentClass}</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
        `;

        if (myAssignments.length === 0) {
            html += `
                <div class="card" style="text-align: center; padding: var(--spacing-xl);">
                    <p style="color: var(--text-secondary); font-size: var(--font-size-lg);">Наразі домашніх завдань немає. Відпочивай! 🎉</p>
                </div>
            `;
        } else {
            myAssignments.forEach(hw => {
                html += `
                    <div class="card" style="border-left: 4px solid var(--primary-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                            <span style="font-weight: 700; font-size: var(--font-size-lg); color: var(--text-primary);">${hw.subject}</span>
                            <span class="badge badge-warning" style="font-size: var(--font-size-sm);">Здати до: ${hw.deadline}</span>
                        </div>
                        <p style="color: var(--text-primary); margin-bottom: var(--spacing-md); line-height: 1.6;">${hw.text}</p>
                        <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">
                            Дата видачі: ${hw.issueDate}
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        this.container.innerHTML = html;
    }
}