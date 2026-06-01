// js/components/ui.js

export const UI = {
    /**
     * Відображає модальне вікно
     * @param {string} title - Заголовок вікна
     * @param {string} contentHtml - HTML вміст тіла модалки
     * @param {Function} onSave - Колбек при натисканні "Зберегти" (повинен повертати true для закриття)
     */
    showModal(title, contentHtml, onSave) {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-overlay active" id="app-modal">
                <div class="modal-content">
                    <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: var(--spacing-sm);">
                        <h3 style="font-weight: 600; font-size: var(--font-size-lg);">${title}</h3>
                        <button id="close-modal" style="font-size: 24px; color: var(--text-secondary);">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: var(--spacing-md) 0;">
                        ${contentHtml}
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: var(--spacing-sm); border-top: 1px solid var(--border-color); padding-top: var(--spacing-md);">
                        <button class="btn btn-outline" id="cancel-modal">Скасувати</button>
                        <button class="btn btn-primary" id="save-modal">Зберегти</button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => {
            const overlay = document.getElementById('app-modal');
            overlay.classList.remove('active');
            setTimeout(() => { container.innerHTML = ''; }, 300); // Чекаємо завершення анімації
        };

        document.getElementById('close-modal').addEventListener('click', closeModal);
        document.getElementById('cancel-modal').addEventListener('click', closeModal);
        document.getElementById('save-modal').addEventListener('click', () => {
            if (onSave()) {
                closeModal();
            }
        });
    }
};