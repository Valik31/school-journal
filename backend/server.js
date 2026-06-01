// backend/server.js
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors()); // Дозволяємо запити з нашого фронтенду
app.use(express.json()); // Дозволяємо читати JSON з тіла запиту

// Ініціалізація доступу через службовий акаунт
const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json', // Твій файл з ключами від bot-worker
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Ендпоінт для отримання даних з аркуша
app.post('/api/read', async (req, res) => {
    try {
        const { spreadsheetId, sheetName, range } = req.body;
        
        // Враховуємо специфіку твоїх таблиць (дані починаються з 3-го рядка, бо 1 і 2 - це заголовки)
        const readRange = range || `${sheetName}!A3:Z`; 

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: readRange,
        });

        res.json({ status: 'success', data: response.data.values || [] });
    } catch (error) {
        console.error('Помилка читання:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Ендпоінт для оновлення клітинки (наприклад, виставлення оцінки)
app.post('/api/update', async (req, res) => {
    try {
        const { spreadsheetId, sheetName, range, value } = req.body;

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${range}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]]
            }
        });

        res.json({ status: 'success', response: response.data });
    } catch (error) {
        console.error('Помилка оновлення:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log('Готовий до роботи з Google Sheets API!');
});