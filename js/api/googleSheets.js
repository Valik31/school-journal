// js/api/googleSheets.js
import { CONFIG } from '../config.js';

export class GoogleSheetsService {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
    }

    async _request(endpoint, payload) {
        try {
            const response = await fetch(`${this.apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Помилка мережі: ${response.status}`);
            
            const result = await response.json();
            if (result.status === 'error') throw new Error(result.message);

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Читання аркуша. 
    // Зверни увагу, бекенд автоматично читає з A3:Z, щоб пропустити перші два рядки.
    async getSheetData(className, sheetName) {
        const spreadsheetId = CONFIG.CLASS_SHEETS[className];
        if (!spreadsheetId) throw new Error(`Таблицю для ${className} не знайдено.`);

        const result = await this._request('read', {
            spreadsheetId,
            sheetName
        });

        const rows = result.data;
        if (!rows || rows.length === 0) return { headers: [], data: [] };

        // Перший рядок (A3) — це заголовки
        const headers = rows[0];
        // Решта — це дані учнів
        const data = rows.slice(1);

        return { headers, data };
    }

    // Оновлення клітинки. Нам треба знайти правильний рядок і стовпець.
    async updateCell(className, sheetName, rowNumber, colLetter, value) {
        const spreadsheetId = CONFIG.CLASS_SHEETS[className];
        
        // Якщо учень в 4-му рядку масиву даних (A6 в таблиці), передаємо A6
        const range = `${colLetter}${rowNumber}`; 

        return this._request('update', {
            spreadsheetId,
            sheetName,
            range,
            value
        });
    }
}

export const apiService = new GoogleSheetsService();