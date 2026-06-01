// js/modules/attendance.js
import { appState } from '../core/state.js';
import { UI } from '../components/ui.js';

export class Attendance {
    constructor() {
        // Імітація даних учнів
        this.students = [
            { id: 1, name: 'Гриценко Максим' },
            { id: 2, name: 'Андрієнко Софія' },
            { id: 3, name: 'Василенко Іван' },
            { id: 4, name: 'Бойко Анна' }
        ];

        // Суворе алфавітне сортування списку учнів для зручності
        this.students.sort((a, b) => a.name.localeCompare(b.name, 'uk'));

        // Імітація колонок (дат занять)
        this.columns = [
            { id: 'd1', date: '01.09' },
            { id: 'd2', date: '02.09' },
            { id: 'd3', date: '03.09' },
            { id: 'd4', date: '04.09' },
            { id: 'd5', date: '05.09' }
        ];

        // Структура: attendanceRecord[studentId][columnId] = status
        // Статуси: 'Н' (відсутній), 'ПП' (поважна причина), 'ХВ' (хвороба), 'ПЗ' (запізнення)
        this.attendanceRecord = {
            1: { 'd2': 'Н' },
            2: { 'd3': 'ХВ', 'd4': 'ХВ' },
            3: { 'd1': 'ПЗ' },
            4: {} // Жодних пропусків
        };

        this.statusOptions = [
            { val: '', label: 'Присутній (очистити)' },
            { val: 'Н', label: 'Н - Відсутній (без причини)' },
            { val: 'ПП', label: 'ПП - Поважна причина' },
            { val: 'ХВ', label: 'ХВ - Хвороба' },
            { val: 'ПЗ', label: 'ПЗ - Запізнення' }
        ];
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
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Облік відвідування</h1>
                    <p style="color: var(--text-secondary);">Клас: 8-А | Вересень</p>
                </div>
                <button id="add-date-btn" class="btn btn-primary">+ Додати день</button>
            </div>

            <div class="table-container">
                <table class="table" id="attendance-table">
                    <thead>
                        <tr>
                            <th style="min-width: 200px; position: sticky; left: 0; background-color: var(--surface-hover); z-index: 10;">ПІБ Учня</th>
                            ${this.columns.map(col => `
                                <th style="text-align: center; min-width: 50px;">
                                    <div>${col.date}</div>
                                </th>
                            `).join('')}
                            <th style="text-align: center; background-color: rgba(239, 68, 68, 0.05); color: var(--danger-color);">Всього (Н)</th>
                            <th style="text-align: center; background-color: rgba(245, 158, 11, 0.05); color: var(--warning-color);">ХВ / ПП</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.students.map(student => this.renderStudentRow(student)).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
                <h3 style="font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--spacing-sm);">Умовні позначення:</h3>
                <div style="display: flex; gap: var(--spacing-lg); font-size: var(--font-size-sm); color: var(--text-secondary);">
                    <span><strong>Н</strong> - відсутній</span>
                    <span><strong>ПП</strong> - поважна причина</span>
                    <span><strong>ХВ</strong> - хвороба</span>
                    <span><strong>ПЗ</strong> - запізнення</span>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    renderStudentRow(student) {
        let totalN = 0;
        let totalValid = 0; // ХВ або ПП

        const cellsHtml = this.columns.map(col => {
            const status = this.attendanceRecord[student.id]?.[col.id] || '';
            
            // Підрахунок статистики
            if (status === 'Н') totalN++;
            if (status === 'ХВ' || status === 'ПП') totalValid++;

            // Стилізація комірки залежно від статусу
            let cellColor = '';
            if (status === 'Н') cellColor = 'color: var(--danger-color); font-weight: 700;';
            else if (status === 'ХВ' || status === 'ПП') cellColor = 'color: var(--warning-color); font-weight: 700;';
            else if (status === 'ПЗ') cellColor = 'color: var(--info-color); font-weight: 700;';

            return `<td class="grade-cell" data-student-id="${student.id}" data-col-id="${col.id}" style="${cellColor}">${status}</td>`;
        }).join('');

        return `
            <tr>
                <td style="position: sticky; left: 0; background-color: var(--surface-color); font-weight: 500; border-right: 1px solid var(--border-color); z-index: 5;">
                    ${student.name}
                </td>
                ${cellsHtml}
                <td style="text-align: center; font-weight: 600; background-color: rgba(239, 68, 68, 0.05);">${totalN > 0 ? totalN : '-'}</td>
                <td style="text-align: center; font-weight: 600; background-color: rgba(245, 158, 11, 0.05);">${totalValid > 0 ? totalValid : '-'}</td>
            </tr>
        `;
    }

    bindEvents() {
        document.getElementById('attendance-table').addEventListener('click', (e) => {
            if (e.target.classList.contains('grade-cell')) {
                const studentId = e.target.getAttribute('data-student-id');
                const colId = e.target.getAttribute('data-col-id');
                this.openAttendanceEditor(studentId, colId);
            }
        });

        document.getElementById('add-date-btn').addEventListener('click', () => {
            const newColId = 'd' + (this.columns.length + 1);
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}`;
            
            this.columns.push({ id: newColId, date: dateStr });
            this.buildLayout();
            this.bindEvents();
        });
    }

    openAttendanceEditor(studentId, colId) {
        const student = this.students.find(s => s.id == studentId);
        const column = this.columns.find(c => c.id == colId);
        const currentStatus = this.attendanceRecord[studentId]?.[colId] || '';

        const typeOptions = this.statusOptions.map(opt => 
            `<option value="${opt.val}" ${currentStatus === opt.val ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const content = `
            <div class="form-group">
                <label class="form-label">Учень</label>
                <input type="text" class="form-control" value="${student.name}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Дата</label>
                <input type="text" class="form-control" value="${column.date}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Відмітка</label>
                <select id="edit-attendance-val" class="form-control">
                    ${typeOptions}
                </select>
            </div>
        `;

        UI.showModal('Відмітка про відвідування', content, () => {
            const newVal = document.getElementById('edit-attendance-val').value;

            if (!this.attendanceRecord[studentId]) {
                this.attendanceRecord[studentId] = {};
            }

            if (newVal === '') {
                delete this.attendanceRecord[studentId][colId];
            } else {
                this.attendanceRecord[studentId][colId] = newVal;
            }

            this.buildLayout();
            this.bindEvents();
            return true;
        });
    }
}