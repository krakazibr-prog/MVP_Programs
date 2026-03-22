(function() {
    // Функции для работы с localStorage
    function loadUsers() {
        try {
            return JSON.parse(localStorage.getItem('users') || '[]');
        } catch (e) {
            console.warn('Не удалось считать users из localStorage', e);
            return [];
        }
    }

    function getCurrentUserData() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            return null;
        }
    }

    function showToast(message) {
        const toast = document.getElementById('toastMsg');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // Инициализация меню
    function initMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        const currentUser = getCurrentUserData();

        // Добавляем обработчики для пунктов меню
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleMenuAction(action, currentUser);
            });
        });

        // Если пользователь администратор, добавляем кнопку регистрации
        if (currentUser && currentUser.isAdmin) {
            addAdminRegistrationButton();
        }

        // Обновляем информацию профиля
        updateProfileInfo(currentUser);
    }

    function updateProfileInfo(user) {
        if (!user) return;

        const greeting = document.querySelector('.greeting h2');
        const greetingEmail = document.querySelector('.greeting p');

        if (greeting) {
            greeting.textContent = `${user.lastName} ${user.firstName}`;
        }
        if (greetingEmail) {
            greetingEmail.textContent = user.email || 'email@example.com';
        }

        // Добавляем статус администратора
        if (user.isAdmin) {
            const badgeStatus = document.querySelector('.badge-status');
            if (badgeStatus) {
                badgeStatus.textContent = '👨‍💼 Администратор';
                badgeStatus.style.background = '#fff1f0';
                badgeStatus.style.color = '#c2412c';
            }
        }
    }

    function addAdminRegistrationButton() {
        const menuSections = document.querySelector('.menu-items');
        if (!menuSections) return;

        // Создаем новую секцию для администратора
        const adminSection = document.createElement('div');
        adminSection.className = 'menu-section';
        adminSection.innerHTML = `
            <div class="section-title">АДМИНИСТРАТОР</div>
            <div class="menu-item admin-register-item" data-action="register-employee">
                <div class="menu-left">
                    <div class="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M12 5V19" stroke="currentColor" stroke-linecap="round" />
                            <path d="M5 12H19" stroke="currentColor" stroke-linecap="round" />
                            <circle cx="12" cy="12" r="10" stroke="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <div class="menu-text">Регистрация сотрудника</div>
                        <div class="menu-desc">Добавить нового сотрудника в систему</div>
                    </div>
                </div>
                <div class="chevron">›</div>
            </div>
            <div class="menu-item admin-view-item" data-action="view-employees">
                <div class="menu-left">
                    <div class="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M23 11V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19 17H23" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <div class="menu-text">Список сотрудников</div>
                        <div class="menu-desc">Просмотр всех зарегистрированных сотрудников</div>
                    </div>
                </div>
                <div class="chevron">›</div>
            </div>
        `;

        menuSections.insertBefore(adminSection, menuSections.querySelector('.divider'));

        // Добавляем обработчик для новых кнопок
        const adminItems = adminSection.querySelectorAll('.menu-item');
        adminItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleMenuAction(action);
            });
        });
    }

    function handleMenuAction(action, currentUser) {
        switch(action) {
            case 'profile':
                showToast('Редактирование профиля (в разработке)');
                break;
            case 'security':
                showToast('Настройки безопасности (в разработке)');
                break;
            case 'generate-pass':
                if (typeof generateQRCode === 'function') {
                    generateQRCode(currentUser);
                }
                break;
            case 'notify-toggle':
                showToast('Уведомления переключены');
                break;
            case 'manage-data':
                showToast('Управление данными (в разработке)');
                break;
            case 'history':
                showToast('История действий (в разработке)');
                break;
            case 'privacy':
                showToast('Настройки приватности (в разработке)');
                break;
            case 'register-employee':
                window.location.href = 'index.html';
                break;
            case 'view-employees':
                showEmployeeList();
                break;
            case 'delete-account':
                if (confirm('Вы уверены? Это действие необратимо.')) {
                    showToast('Удаление аккаунта (в разработке)');
                }
                break;
            case 'logout':
                localStorage.removeItem('currentUser');
                window.location.href = 'авто.html';
                break;
        }
    }

    function showEmployeeList() {
        const users = loadUsers();
        const employees = users.filter(u => !u.isAdmin);

        const modal = document.createElement('div');
        modal.className = 'employee-list-modal';

        const content = document.createElement('div');
        content.className = 'employee-list-content';

        let html = `<h2>Список сотрудников (${employees.length})</h2>`;
        
        if (employees.length === 0) {
            html += '<p class="empty-list">Нет зарегистрированных сотрудников</p>';
        } else {
            html += '<div class="employees-table-wrapper"><table class="employees-table">';
            html += '<thead><tr><th>ФИО</th><th>ID</th><th>Должность</th></tr></thead><tbody>';
            
            employees.forEach((emp, index) => {
                html += `<tr>
                    <td>${emp.lastName} ${emp.firstName}</td>
                    <td class="employee-id">${emp.employeeId}</td>
                    <td>${emp.position}</td>
                </tr>`;
            });
            
            html += '</tbody></table></div>';
        }

        html += '<div class="modal-footer"><button id="close-list-btn" class="close-btn">Закрыть</button></div>';

        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);

        document.getElementById('close-list-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 200);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 200);
            }
        });

        // Триггер анимации появления
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = (hash << 5) - hash + password.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString();
    }

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', initMenu);
})();