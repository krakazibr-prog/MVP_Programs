// admin-init.js
// Инициализация аккаунта администратора при первой загрузке

function initializeAdminAccount() {
    const adminData = {
        lastName: 'Админов',
        firstName: 'Админ',
        middleName: 'Админович',
        phone: '+88005553535',
        email: 'admin@example.com',
        position: 'Админ',
        employeeId: '000-000',
        passwordHash: hashPassword('admin'),
        isAdmin: true
    };

    const users = loadUsers();
    
    // Проверяем, существует ли уже администратор
    const adminExists = users.some(u => u.employeeId === '000-000' && u.isAdmin);
    
    if (!adminExists) {
        users.push(adminData);
        saveUsers(users);
        console.log('✅ Аккаунт администратора инициализирован');
    }
}

// Функции для работы с localStorage
function loadUsers() {
    try {
        return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        console.warn('Не удалось считать users из localStorage', e);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString();
}

// Инициализируем админа при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminAccount);
} else {
    initializeAdminAccount();
}