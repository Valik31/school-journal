// js/modules/journal.js
import { appState } from '../core/state.js';
import { UI } from '../components/ui.js';
import { apiService } from '../api/googleSheets.js';

// Допоміжна функція для переведення номера колонки в букву (0 = A, 1 = B, 2 = C і т.д.)
function getColumnLetter(colIndex) {
    let letter = '';
    let temp = colIndex;
    while (temp >= 0) {
        letter = String.fromCharCode((temp % 26) + 65) + letter;
        temp = Math.floor(temp / 26) - 1;
    }
    return letter;
}

export class Journal {
    constructor() {
        this.currentClass = null;
        this.currentSubject = null;
        this.students = [];
        this.columns = [];
        this.grades = {};
        
        this.lessonTypes = ['Поточна', 'Самостійна', 'Контрольна', 'Зошит', 'Практична', 'Тематична', 'Семестрова'];
        this.nushGroups = ['Немає (звичайний урок)', 'ГР 1', 'ГР 2', 'ГР 3', 'ГР 4'];
    }

    async render(container) {
        this.container = container;
        this.buildInitialLayout();
        this.bindGlobalEvents();
        
        // Завантажуємо учнів для класу 5-В (можна зробити динамічним через UI)
        await this.loadClassData('5-В'); 
    }

    buildInitialLayout() {
        this.container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Журнал</h1>
                    
                    <select id="class-selector" class="form-control" style="width: 120px;">
                        <option value="5-В" selected>5-В клас</option>
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

    // РЕАЛЬНИЙ виклик API: Завантаження списку учнів
    async loadClassData(className) {
        this.currentClass = className;
        try {
            const response = await apiService.getSheetData(className, 'Список учнів');
            
            if (response && response.data) {
                // Парсимо дані з таблиці (колонка 0: №, колонка 1: Прізвище)
                this.classStudents = response.data.map((row, index) => {
                    return {
                        id: parseInt(row[0]) || index + 1,
                        name: row[1]
                    };
                }).filter(s => s.name); // Відкидаємо порожні рядки

                // Суворе сортування учнів за алфавітом
                this.classStudents.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
            } else {
                this.classStudents = [];
            }
        } catch (error) {
            console.error("Помилка завантаження списку учнів:", error);
            this.classStudents = [];
        }
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

    // РЕАЛЬНИЙ виклик API: Завантаження оцінок з конкретного аркуша
    async loadSubjectJournal() {
        document.getElementById('journal-workspace').innerHTML = '<p>Завантаження даних з Google Таблиць...</p>';
        
        try {
            const response = await apiService.getSheetData(this.currentClass, this.currentSubject);

            if (!response.headers || response.headers.length === 0) {
                 document.getElementById('journal-workspace').innerHTML = '<p>Журнал для цього предмета ще порожній або не існує.</p>';
                 this.students = this.classStudents;
                 this.columns = [];
                 this.grades = {};
                 return;
            }

            this.columns = [];
            // Парсимо дати уроків (вони починаються з 3-ї колонки, індекс 2)
            for (let i = 2; i < response.headers.length; i++) {
                const dateVal = response.headers[i];
                if (dateVal) {
                    this.columns.push({
                        id: 'col_' + i,
                        date: dateVal,
                        type: 'Поточна', 
                        gr: null,
                        index: i,
                        letter: getColumnLetter(i) // Конвертуємо індекс (2) у літеру ('C')
                    });
                }
            }

            this.students = [];
            this.grades = {};

            // Парсимо учнів та їхні оцінки
            response.data.forEach((row, rowIndex) => {
                if (!row[1]) return; // Пропускаємо рядки без прізвища

                const studentId = parseInt(row[0]) || rowIndex + 1;
                this.students.push({ 
                    id: studentId, 
                    name: row[1], 
                    // Реальний номер рядка в Google Sheets (A1-A2 - шапка, A3 - заголовки, A4 - перший учень)
                    rowIndex: rowIndex + 4 
                });

                this.grades[studentId] = {};
                this.columns.forEach((col) => {
                    this.grades[studentId][col.id] = row[col.index] || '';
                });
            });

            this.renderJournalTable();

        } catch (error) {
            console.error(error);
            document.getElementById('journal-workspace').innerHTML = `<p style="color:var(--danger-color)">Помилка з'єднання: ${error.message}</p>`;
        }
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

    // Швидке введення оцінки та відправка у Google Sheets
    openGradeInput(cellElement, studentId, colId) {
        if (cellElement.querySelector('input')) return;

        const currentVal = cellElement.innerText;
        cellElement.innerHTML = `<input type="number" min="1" max="12" value="${currentVal}" style="width: 100%; text-align: center; border: 1px solid var(--primary-color); outline: none;">`;
        
        const input = cellElement.querySelector('input');
        input.focus();

        const saveGrade = async () => {
            let newVal = input.value;
            
            // Якщо оцінка введена, гарантуємо, що це ціле число (без ком)
            if (newVal !== '') {
                newVal = parseInt(newVal, 10).toString(); 
            }

            // Оптимістичне оновлення інтерфейсу
            cellElement.innerHTML = newVal;
            if (!this.grades[studentId]) this.grades[studentId] = {};
            this.grades[studentId][colId] = newVal;

            cellElement.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Зелений колір (завантаження)
            
            try {
                // Знаходимо реальні координати (Рядок та Стовпець) для Google Sheets
                const student = this.students.find(s => s.id == studentId);
                const column = this.columns.find(c => c.id == colId);

                // РЕАЛЬНИЙ виклик API: Оновлення клітинки
                await apiService.updateCell(
                    this.currentClass, 
                    this.currentSubject, 
                    student.rowIndex, 
                    column.letter, 
                    newVal
                );

                setTimeout(() => { cellElement.style.backgroundColor = ''; }, 500); // Скидаємо колір
            } catch (error) {
                cellElement.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Червоний (помилка)
                alert('Помилка збереження в Google Таблицю: ' + error.message);
            }
        };

        input.addEventListener('blur', saveGrade);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveGrade();
        });
    }

    // Модалки для додавання (Логіку відправки на сервер для них додамо на наступному кроці, якщо потрібно)
    openCreateJournalModal() { alert('Цей функціонал підключимо до бекенду пізніше!'); }
    openAddLessonModal() { alert('Функціонал додавання стовпця підключимо пізніше!'); }
}
