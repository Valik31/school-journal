// js/core/state.js

class State {
    constructor() {
        this.currentUser = null;
        this.currentYear = '2025-2026';
        this.currentSemester = 2;
        this.activeClass = null;
    }

    // Встановлення поточного користувача
    setUser(user) {
        this.currentUser = user;
    }

    // Отримання поточного користувача
    getUser() {
        return this.currentUser;
    }

    // Очищення стану (при виході)
    clearState() {
        this.currentUser = null;
        this.activeClass = null;
    }
}

// Експортуємо єдиний екземпляр для всього додатку
export const appState = new State();