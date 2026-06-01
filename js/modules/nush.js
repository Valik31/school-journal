// js/modules/nush.js
import { appState } from '../core/state.js';
import { UI } from '../components/ui.js';

export class Nush {
    constructor() {
        // Дані для 8-го класу, відсортовані за алфавітом
        this.students = [
            { id: 1, name: 'Андрієнко Софія' },
            { id: 2, name: 'Бойко Анна' },
            { id: 3, name: 'Василенко Іван' },
            { id: 4, name: 'Гриценко Максим' }
        ];

        this.students.sort((a, b) => a.name.localeCompare(b.name, 'uk'));

        this.subjectInfo = {
            className: '8-А',
            subjectName: 'Інформатика',
            groups: [
                { id: 'gr1', title: 'ГР 1', desc: 'Працює з інформацією, даними, моделями' },
                { id: 'gr2', title: 'ГР 2', desc: 'Створює інформаційні продукти' },
                { id: 'gr3', title: 'ГР 3', desc: 'Працює в цифровому середовищі' },
                { id: 'gr4', title: 'ГР 4', desc: 'Безпечно та відповідально використовує ІТ' }
            ]
        };

        // Структура: grades[studentId][groupId] = grade
        this.grades = {
            1: { 'gr1': 11, 'gr2': 10, 'gr3': 12, 'gr4': 11 },
            2: { 'gr1': 9, 'gr2': 10, 'gr3': 9, 'gr4': 10 },
            3: { 'gr1': 7, 'gr2': 8, 'gr3': 7 },
            4: { 'gr1': 12, 'gr2': 11, 'gr3': 12, 'gr4': 12 }
        };
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
                    <h1 style="font-size: var(--font-size-xl); font-weight: 700;">Оцінювання НУШ (Групи результатів)</h1>
                    <p style="color: var(--text-secondary);">Клас: ${this.subjectInfo.className} | Предмет: ${this.subjectInfo.subjectName}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom: var(--spacing-lg); background-color: var(--surface-hover);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-sm);">
                    ${this.subjectInfo.groups.map(gr => `
                        <div style="font-size: var(--font-size-sm);">
                            <strong>${gr.title}:</strong> <span style="color: var(--text-secondary);">${gr.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="table-container">
                <table class="table" id="nush-table">
                    <thead>
                        <tr>
                            <th style="min-width: 250px;">ПІБ Учня</th>
                            ${this.subjectInfo.groups.map(gr => `
                                <th style="text-align: center; width: 100px;" title="${gr.desc}">${gr.title}</th>
                            `).join('')}
                            <th style="text-align: center; background-color: rgba(16, 185, 129, 0.05);">Підсумкова</th>
                            <th style="text-align: center; width: 150px;">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.students.map(student => this.renderStudentRow(student)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.container.innerHTML = html;
    }

    renderStudentRow(student) {
        let sum = 0;
        let count = 0;

        const cellsHtml = this.subjectInfo.groups.map(gr => {
            const grade = this.grades[student.id]?.[gr.id] || '';
            if (grade) {
                sum += Number(grade);
                count++;
            }
            return `<td class="grade-cell" data-student-id="${student.id}" data-gr-id="${gr.id}">${grade}</td>`;
        }).join('');

        let avgRaw = count > 0 ? sum / count : 0;
        let finalGrade = avgRaw > 0 ? Math.round(avgRaw) : '-'; // Завжди ціле число

        return `
            <tr>
                <td style="font-weight: 500;">${student.name}</td>
                ${cellsHtml}
                <td style="text-align: center; font-weight: 700; color: var(--success-color); background-color: rgba(16, 185, 129, 0.05);">
                    ${finalGrade}
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-outline print-cert-btn" data-student-id="${student.id}" style="padding: 4px 8px; font-size: var(--font-size-xs);">
                        Свідоцтво
                    </button>
                </td>
            </tr>
        `;
    }

    bindEvents() {
        // Редагування оцінки ГР
        document.getElementById('nush-table').addEventListener('click', (e) => {
            if (e.target.classList.contains('grade-cell')) {
                const studentId = e.target.getAttribute('data-student-id');
                const grId = e.target.getAttribute('data-gr-id');
                this.openGrEditor(studentId, grId);
            }
            
            if (e.target.classList.contains('print-cert-btn')) {
                const studentId = e.target.getAttribute('data-student-id');
                this.generateCertificate(studentId);
            }
        });
    }

    openGrEditor(studentId, grId) {
        const student = this.students.find(s => s.id == studentId);
        const group = this.subjectInfo.groups.find(g => g.id == grId);
        const currentGrade = this.grades[studentId]?.[grId] || '';

        const content = `
            <div class="form-group">
                <label class="form-label">Учень</label>
                <input type="text" class="form-control" value="${student.name}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Група результатів</label>
                <input type="text" class="form-control" value="${group.title}: ${group.desc}" disabled>
            </div>
            <div class="form-group">
                <label class="form-label">Оцінка (1-12)</label>
                <input type="number" id="nush-grade-val" class="form-control" value="${currentGrade}" min="1" max="12" step="1">
            </div>
        `;

        UI.showModal('Оцінювання НУШ', content, () => {
            const newVal = document.getElementById('nush-grade-val').value;

            if (!this.grades[studentId]) {
                this.grades[studentId] = {};
            }

            if (newVal === '') {
                delete this.grades[studentId][grId];
            } else {
                this.grades[studentId][grId] = parseInt(newVal, 10); // Форматування до цілого
            }

            this.buildLayout(); // Перемальовуємо для оновлення середнього бала
            return true;
        });
    }

    generateCertificate(studentId) {
        const student = this.students.find(s => s.id == studentId);
        const year = appState.currentYear;
        
        let gradesHtml = '';
        let sum = 0;
        let count = 0;

        this.subjectInfo.groups.forEach(gr => {
            const grade = this.grades[student.id]?.[gr.id] || '-';
            if (grade !== '-') {
                sum += Number(grade);
                count++;
            }
            gradesHtml += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #000;">${gr.desc}</td>
                    <td style="padding: 8px; border: 1px solid #000; text-align: center; font-weight: bold;">${grade}</td>
                </tr>
            `;
        });

        let avgRaw = count > 0 ? sum / count : 0;
        let finalGrade = avgRaw > 0 ? Math.round(avgRaw) : '-';

        // Формуємо HTML для друку
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Свідоцтво досягнень - ${student.name}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
                    h1, h2, h3 { text-align: center; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <button class="no-print" onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; font-size: 16px; cursor: pointer;">🖨 Друк</button>
                
                <h2>СВІДОЦТВО ДОСЯГНЕНЬ</h2>
                <h3>здобувача освіти класу ${this.subjectInfo.className}</h3>
                <h1 style="text-decoration: underline;">${student.name}</h1>
                <p style="text-align: center;">Навчальний рік: ${year}</p>
                
                <h3 style="margin-top: 30px; text-align: left;">Предмет: ${this.subjectInfo.subjectName}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Характеристика результатів навчання</th>
                            <th style="width: 100px; text-align: center;">Рівень / Бал</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gradesHtml}
                        <tr>
                            <td style="text-align: right; font-weight: bold; border: 1px solid #000; padding: 8px;">Підсумкова оцінка:</td>
                            <td style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px;">${finalGrade}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="footer">
                    <div>Вчитель: _________________</div>
                    <div>Керівник закладу: _________________</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}