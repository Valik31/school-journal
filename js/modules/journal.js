// js/modules/journal.js
import { appState } from '../core/state.js';
import { UI } from '../components/ui.js';
import { apiService } from '../api/googleSheets.js'; // Підключаємо наш API сервіс

export class Journal {
    constructor() {
        this.currentClass = null;
        this.currentSubject = null;
        this.students = [];
        this.columns = [];
        this.grades = {};
        
        // Типи уроків згідно з вимогами МОН
        this.lessonTypes = ['Поточна', 'Самостійна', 'Контрольна', 'Зошит', 'Практична', 'Тематична', 'Семестрова'];
        
        // Групи результатів для НУШ (5-9 класи)
        this.nushGroups = ['Немає (звичайний урок)', 'ГР 1', 'ГР 2', 'ГР 3', 'ГР 4'];
    }

    async render(container) {
        this.container = container;
        this.buildInitialLayout();
        this.bindGlobalEvents();
        
        // Для демонстрації завантажуємо тестовий список учнів класу 5-В
        await this.loadClassData('5-В'); 
    }

    buildInitialLayout() {
        this.container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Журнал</h1>
                    
                    <select id="class-selector" class="form-control" style="width: 120px;">
                        <option value="5-В">5-В клас</option>
                        <option value="8-А">8-А клас</option>
                    </select>
                    
                    <select id="subject-selector" class="form-control" style="width: 250px;">
                        <option value="" disabled selected>Оберіть предмет...</option>
                        <option value="Математика">Математика</option>
                        <option value="Українська мова (І підгр.)">Українська мова (І підгр.)</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: var(--spacing-sm);">
                    <button id="create-journal-btn" class="btn btn-outline">+ Створити журнал</button>
                    <button id="add-lesson-btn" class="btn btn-primary" style="display: none;">+ Урок</button>
                </div>
            </div>

            <div id="journal-workspace" style="min-height: 400px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border-color); border-radius: var(--border-radius-md);">
                <p style="color: var(--text-secondary);">Оберіть клас та предмет для відображення журналу</p>
            </div>
        `;
    }

    async loadClassData(className) {
        this.currentClass = className;
        // Тут буде запит до apiService.getSheetData('Список учнів') для обраного класу
        // Імітуємо отримання алфавітного списку:
        this.classStudents = [
            { id: 1, name: 'Андрєєв Ярослав' },
            { id: 2, name: 'Василенко Роман' },
            { id: 3, name: 'Габріадзе Гіоргі' },
            { id: 4, name: 'Стойка Христина' }
        ].sort((a, b) => a.name.localeCompare(b.name, 'uk')); // Суворе сортування
    }

    bindGlobalEvents() {
        document.getElementById('subject-selector').addEventListener('change', (e) => {
            this.currentSubject = e.target.value;
            this.loadSubjectJournal();
        });

        document.getElementById('create-journal-btn').addEventListener('click', () => {
            this.openCreateJournalModal();
        });

        document.getElementById('add-lesson-btn').addEventListener('click', () => {
            this.openAddLessonModal();
        });
    }

    // ==========================================
    // ЛОГІКА СТВОРЕННЯ НОВОГО ЖУРНАЛУ (АРКУША)
    // ==========================================
    openCreateJournalModal() {
        const studentCheckboxes = this.classStudents.map(student => `
            <label style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                <input type="checkbox" class="student-select-cb" value="${student.id}" checked>
                ${student.name}
            </label>
        `).join('');

        const content = `
            <div class="form-group">
                <label class="form-label">Назва предмету (буде назвою аркуша)</label>
                <input type="text" id="new-subject-name" class="form-control" placeholder="Наприклад: Інформатика (ІІ підгр.)">
            </div>
            <div class="form-group">
                <label class="form-label">Учні, які вивчають предмет:</label>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); padding: var(--spacing-sm); border-radius: var(--border-radius-sm);">
                    ${studentCheckboxes}
                </div>
            </div>
        `;

        UI.showModal('Створення нового журналу', content, () => {
            const subjectName = document.getElementById('new-subject-name').value;
            if (!subjectName) return false;

            // Збираємо вибраних учнів
            const selectedIds = Array.from(document.querySelectorAll('.student-select-cb:checked')).map(cb => parseInt(cb.value));
            this.students = this.classStudents.filter(s => selectedIds.includes(s.id));
            this.currentSubject = subjectName;

            // Тут викликаємо API для створення аркуша в Google Sheets
            // apiService._request({ action: 'createSheet', sheetName: subjectName, students: this.students });

            this.columns = []; // Порожній журнал
            this.grades = {};
            this.renderJournalTable();
            
            // Додаємо в селект
            const selector = document.getElementById('subject-selector');
            selector.innerHTML += `<option value="${subjectName}" selected>${subjectName}</option>`;
            
            return true;
        });
    }

    // ==========================================
    // ЛОГІКА ДОДАВАННЯ УРОКУ (КОЛОНКИ)
    // ==========================================
    openAddLessonModal() {
        const today = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD для input type="date"

        const content = `
            <div class="form-group">
                <label class="form-label">Дата уроку</label>
                <input type="date" id="lesson-date" class="form-control" value="${today}">
            </div>
            <div class="form-group">
                <label class="form-label">Тип оцінки</label>
                <select id="lesson-type" class="form-control">
                    ${this.lessonTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Група результатів (НУШ 5-9 кл.)</label>
                <select id="lesson-gr" class="form-control">
                    ${this.nushGroups.map(gr => `<option value="${gr}">${gr}</option>`).join('')}
                </select>
            </div>
        `;

        UI.showModal('Додати урок', content, () => {
            const dateVal = document.getElementById('lesson-date').value;
            const typeVal = document.getElementById('lesson-type').value;
            const grVal = document.getElementById('lesson-gr').value;

            // Форматуємо дату для відображення (наприклад, 2026-09-01)
            const newCol = {
                id: 'col_' + Date.now(),
                date: dateVal,
                type: typeVal,
                gr: grVal !== 'Немає (звичайний урок)' ? grVal : null
            };

            this.columns.push(newCol);
            
            // Запит до Google Sheets на створення колонки
            // apiService._request({ action: 'addColumn', sheetName: this.currentSubject, columnData: newCol });

            this.renderJournalTable();
            return true;
        });
    }

    // ==========================================
    // ВІДОБРАЖЕННЯ ТАБЛИЦІ
    // ==========================================
    async loadSubjectJournal() {
        document.getElementById('journal-workspace').innerHTML = '<p>Завантаження даних з Google Таблиць...</p>';
        
        // Імітація завантаження існуючого журналу
        setTimeout(() => {
            this.students = this.classStudents; // Беремо всіх для прикладу
            this.columns = [
                { id: 'c1', date: '2026-09-01', type: 'Поточна', gr: null },
                { id: 'c2', date: '2026-09-02', type: 'Поточна', gr: null },
            ];
            this.grades = {
                1: { 'c1': 10 },
                2: { 'c1': 11, 'c2': 12 }
            };
            this.renderJournalTable();
        }, 500);
    }

    renderJournalTable() {
        document.getElementById('add-lesson-btn').style.display = 'block';
        
        const workspace = document.getElementById('journal-workspace');
        workspace.style.border = 'none';
        
        let html = `
            <div class="table-container">
                <table class="table" id="grades-table">
                    <thead>
                        <tr>
                            <th style="min-width: 40px; text-align: center;">№</th>
                            <th style="min-width: 200px; position: sticky; left: 0; background-color: var(--surface-hover); z-index: 10;">Прізвище Ім'я</th>
                            ${this.columns.map(col => `
                                <th style="text-align: center; min-width: 60px;">
                                    <div style="font-weight: 700;">${col.date.substring(5).replace('-', '.')}</div>
                                    <div style="font-size: 10px; color: var(--text-secondary);">${col.type.substring(0, 3)}.</div>
                                    ${col.gr ? `<div style="font-size: 10px; color: var(--primary-color); font-weight: bold;">${col.gr}</div>` : ''}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.students.map((student, index) => this.renderStudentRow(student, index + 1)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        workspace.innerHTML = html;
        this.bindTableEvents();
    }

    renderStudentRow(student, index) {
        const cellsHtml = this.columns.map(col => {
            const grade = this.grades[student.id]?.[col.id] || '';
            return `<td class="grade-cell" data-student-id="${student.id}" data-col-id="${col.id}">${grade}</td>`;
        }).join('');

        return `
            <tr>
                <td style="text-align: center; color: var(--text-secondary);">${index}</td>
                <td style="position: sticky; left: 0; background-color: var(--surface-color); font-weight: 500; border-right: 1px solid var(--border-color); z-index: 5;">
                    ${student.name}
                </td>
                ${cellsHtml}
            </tr>
        `;
    }

    bindTableEvents() {
        document.getElementById('grades-table').addEventListener('click', (e) => {
            if (e.target.classList.contains('grade-cell')) {
                const studentId = e.target.getAttribute('data-student-id');
                const colId = e.target.getAttribute('data-col-id');
                this.openGradeInput(e.target, studentId, colId);
            }
        });
    }

    // Швидке введення оцінки прямо в клітинку (як у Excel)
    openGradeInput(cellElement, studentId, colId) {
        if (cellElement.querySelector('input')) return; // Вже редагується

        const currentVal = cellElement.innerText;
        cellElement.innerHTML = `<input type="number" min="1" max="12" value="${currentVal}" style="width: 100%; text-align: center; border: 1px solid var(--primary-color); outline: none;">`;
        
        const input = cellElement.querySelector('input');
        input.focus();

        const saveGrade = async () => {
            let newVal = input.value;
            
            // Якщо введено значення, форматуємо до цілого числа
            if (newVal !== '') {
                newVal = parseInt(newVal, 10).toString(); 
            }

            // Оптимістичне оновлення UI
            cellElement.innerHTML = newVal;
            
            if (!this.grades[studentId]) this.grades[studentId] = {};
            this.grades[studentId][colId] = newVal;

            // Візуальна індикація збереження
            cellElement.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Блимає зеленим
            
            try {
                // Відправка у Google Sheets у фоні
                // await apiService.updateCell(this.currentSubject, `Row:${studentId}_Col:${colId}`, newVal);
                setTimeout(() => { cellElement.style.backgroundColor = ''; }, 500);
            } catch (error) {
                // Відкат у разі помилки
                cellElement.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                alert('Помилка збереження в Google Таблицю!');
            }
        };

        input.addEventListener('blur', saveGrade);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveGrade();
        });
    }
}