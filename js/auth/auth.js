// js/auth/auth.js
import { appState } from '../core/state.js';

export class AuthService {
    constructor() {
        this.storageKey = 'ejournal_auth_token';
        
        // Тестова база користувачів для розробки (імітація БД)
        this.mockUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'password123', // У реальному житті тут хеш
                role: 'admin',
                fullName: 'Адміністратор Системи'
            },
            {
                id: 2,
                username: 'teacher1',
                password: 'password123',
                role: 'teacher',
                fullName: 'Січкар Валентин Сергійович',
                subjects: ['Математика', 'Інформатика'],
                workplace: 'Ліцей'
            },
            {
                id: 3,
                username: 'form_master',
                password: 'password123',
                role: 'form_master',
                fullName: 'Шевченко Олег Іванович',
                managedClass: '8-А'
            },
            {
                id: 4,
                username: 'student1',
                password: 'password123',
                role: 'student',
                fullName: 'Бойко Анна',
                studentClass: '8-А'
            }
        ];
    }

    // Перевірка наявності активної сесії при завантаженні
    checkSession() {
        const token = localStorage.getItem(this.storageKey);
        if (token) {
            // Імітація розшифровки токена
            const user = this.mockUsers.find(u => u.username === token);
            if (user) {
                appState.setUser(user);
                return true;
            }
        }
        return false;
    }

    // Логіка входу
    async login(username, password) {
        return new Promise((resolve, reject) => {
            // Штучна затримка для імітації мережевого запиту
            setTimeout(() => {
                const user = this.mockUsers.find(
                    u => u.username === username && u.password === password
                );

                if (user) {
                    // Зберігаємо імпровізований токен
                    localStorage.setItem(this.storageKey, user.username);
                    appState.setUser(user);
                    resolve({ success: true, user });
                } else {
                    reject({ success: false, message: 'Невірний логін або пароль' });
                }
            }, 500);
        });
    }

    // Логіка виходу
    logout() {
        localStorage.removeItem(this.storageKey);
        appState.clearState();
        window.location.reload(); // Перезавантаження для очищення пам'яті
    }
}

export const authService = new AuthService();