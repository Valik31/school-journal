// js/components/login.js
import { authService } from '../auth/auth.js';

export class LoginScreen {
    constructor(onLoginSuccess) {
        this.container = document.getElementById('main-content');
        this.onLoginSuccess = onLoginSuccess;
    }

    // Рендер форми входу
    render() {
        // Приховуємо бокове меню та верхню панель для сторінки логіну
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('topbar').style.display = 'none';

        this.container.innerHTML = `
            <div class="login-wrapper" style="display: flex; justify-content: center; align-items: center; height: 100vh; width: 100%;">
                <div class="card" style="width: 100%; max-width: 400px;">
                    <div class="card-header" style="justify-content: center; border-bottom: none;">
                        <h2 style="font-weight: 600; font-size: var(--font-size-xl);">Вхід до системи</h2>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label" for="username">Логін</label>
                            <input type="text" id="username" class="form-control" placeholder="Введіть логін" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="password">Пароль</label>
                            <input type="password" id="password" class="form-control" placeholder="Введіть пароль" required autocomplete="current-password">
                        </div>
                        <div id="login-error" style="color: var(--danger-color); font-size: var(--font-size-sm); margin-bottom: var(--spacing-md); display: none;"></div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Увійти</button>
                    </form>
                    <div style="margin-top: var(--spacing-md); text-align: center; font-size: var(--font-size-sm); color: var(--text-secondary);">
                        <p>Тестові акаунти: admin / teacher1 / student1</p>
                        <p>Пароль для всіх: password123</p>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    // Обробка події відправки форми
    bindEvents() {
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const submitBtn = form.querySelector('button[type="submit"]');

            // Стан завантаження
            submitBtn.disabled = true;
            submitBtn.textContent = 'Зачекайте...';
            errorDiv.style.display = 'none';

            try {
                await authService.login(usernameInput, passwordInput);
                
                // Відновлюємо видимість елементів макета
                document.getElementById('sidebar').style.display = 'flex';
                document.getElementById('topbar').style.display = 'flex';
                
                this.onLoginSuccess();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Увійти';
            }
        });
    }
}