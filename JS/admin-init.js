'use strict';

/**
 * ============================================================
 * ЕДИНАЯ ФУНКЦИЯ ХЕШИРОВАНИЯ ПАРОЛЯ
 * Используется ВО ВСЕХ файлах приложения
 * ============================================================
 */

const CRYPTO_SALT = 'unified_app_crypto_salt_v1_2024_';

/**
 * Генерация хеша пароля - ЕДИНАЯ ДЛЯ ВСЕГО ПРИЛОЖЕНИЯ
 */
function generatePasswordHash(password) {
    if (typeof password !== 'string') {
        throw new Error('Пароль должен быть строкой');
    }

    if (password.length === 0) {
        throw new Error('Пароль не может быть пустым');
    }

    let hash = 0;
    const combined = CRYPTO_SALT + password;

    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
}

// ✅ Экспортируем в глобальную область
if (typeof window !== 'undefined') {
    window.generatePasswordHash = generatePasswordHash;
}

/**
 * ============================================================
 * КОНФИГУРАЦИЯ АДМИНИСТРАТОРА
 * ============================================================
 */

const ADMIN_INIT_CONFIG = {
    STORAGE_KEYS: {
        USERS: 'users',
        ADMIN_INITIALIZED: 'admin_initialized'
    },
    ADMIN_ACCOUNT: {
        ID: 'admin-system-001',
        FIRST_NAME: 'Администратор',
        LAST_NAME: 'Системный',
        MIDDLE_NAME: 'Главный',
        EMAIL: 'admin@system.local',
        PHONE: '+7-000-000-00-00',
        POSITION: 'Системный администратор'
    },
    VALIDATION: {
        MAX_USERS: 10000,
        CHECK_INTERVAL: 300000
    },
    LOGGING: {
        ENABLED: true,
        LOG_SENSITIVE: false
    }
};

function adminInitLog(message, data = null, level = 'log') {
    if (!ADMIN_INIT_CONFIG.LOGGING.ENABLED) return;

    if (typeof console === 'object' && typeof console[level] === 'function') {
        if (data && !ADMIN_INIT_CONFIG.LOGGING.LOG_SENSITIVE) {
            console[level](message, '***REDACTED***');
        } else if (data) {
            console[level](message, data);
        } else {
            console[level](message);
        }
    }
}

function loadUsers() {
    try {
        const data = localStorage.getItem(ADMIN_INIT_CONFIG.STORAGE_KEYS.USERS);
        const users = data ? JSON.parse(data) : [];

        if (!Array.isArray(users)) {
            adminInitLog('Некорректный формат данных users', null, 'warn');
            return [];
        }

        if (users.length > ADMIN_INIT_CONFIG.VALIDATION.MAX_USERS) {
            adminInitLog('Превышено максимальное количество пользователей', null, 'error');
            return [];
        }

        return users.filter(user => {
            if (!user || typeof user !== 'object') {
                return false;
            }

            return user.employeeId && 
                   user.firstName && 
                   user.lastName && 
                   user.email;
        });

    } catch (e) {
        adminInitLog('Ошибка при чтении users из localStorage', e, 'error');
        return [];
    }
}

function saveUsers(users) {
    try {
        if (!Array.isArray(users)) {
            throw new Error('users должен быть массивом');
        }

        if (users.length > ADMIN_INIT_CONFIG.VALIDATION.MAX_USERS) {
            throw new Error('Превышено максимальное количество пользователей');
        }

        const jsonString = JSON.stringify(users);

        if (jsonString.length > 5 * 1024 * 1024) {
            throw new Error('Размер данных превышает лимит localStorage');
        }

        localStorage.setItem(ADMIN_INIT_CONFIG.STORAGE_KEYS.USERS, jsonString);
        adminInitLog('✅ Пользователи успешно сохранены');

    } catch (e) {
        adminInitLog('Ошибка при сохранении users', e, 'error');
        throw new Error('Не удалось сохранить пользователей');
    }
}

function validateUserStructure(user) {
    if (!user || typeof user !== 'object') {
        return false;
    }

    const requiredFields = [
        'lastName',
        'firstName',
        'email',
        'position',
        'employeeId',
        'passwordHash',
        'isAdmin'
    ];

    return requiredFields.every(field => {
        const value = user[field];
        
        if (field === 'isAdmin') {
            return typeof value === 'boolean';
        }
        
        if (field === 'passwordHash') {
            return typeof value === 'string' && value.length > 0;
        }
        
        return typeof value === 'string' && value.trim().length > 0;
    });
}

function adminExists(users) {
    if (!Array.isArray(users)) {
        return false;
    }

    return users.some(user => {
        return user &&
               typeof user === 'object' &&
               user.employeeId === ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.ID &&
               user.isAdmin === true;
    });
}

function createAdminObject() {
    try {
        // ✅ ИСПОЛЬЗУЕМ ЕДИНУЮ ФУНКЦИЮ
        const passwordHash = generatePasswordHash('admin');

        const adminData = {
            lastName: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.LAST_NAME,
            firstName: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.FIRST_NAME,
            middleName: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.MIDDLE_NAME,
            phone: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.PHONE,
            email: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.EMAIL,
            position: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.POSITION,
            employeeId: ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.ID,
            passwordHash: passwordHash,
            isAdmin: true,
            createdAt: new Date().toISOString(),
            createdBy: 'system'
        };

        if (!validateUserStructure(adminData)) {
            throw new Error('Некорректная структура администратора');
        }

        return adminData;

    } catch (error) {
        adminInitLog('Ошибка при создании объекта администратора', error, 'error');
        throw error;
    }
}

function initializeAdminAccount() {
    try {
        adminInitLog('Начало инициализации администратора');

        const wasInitialized = localStorage.getItem(ADMIN_INIT_CONFIG.STORAGE_KEYS.ADMIN_INITIALIZED);
        if (wasInitialized === 'true') {
            adminInitLog('✅ Администратор уже был инициализирован ранее');
            return;
        }

        const users = loadUsers();

        if (adminExists(users)) {
            adminInitLog('✅ Администратор уже существует в системе');
            localStorage.setItem(ADMIN_INIT_CONFIG.STORAGE_KEYS.ADMIN_INITIALIZED, 'true');
            return;
        }

        const adminData = createAdminObject();
        users.push(adminData);
        saveUsers(users);
        localStorage.setItem(ADMIN_INIT_CONFIG.STORAGE_KEYS.ADMIN_INITIALIZED, 'true');

        adminInitLog(`✅ Аккаунт администратора успешно инициализирован`);
        adminInitLog(`ID: ${ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.ID}`);
        adminInitLog(`Хеш пароля: ${adminData.passwordHash}`);
        adminInitLog(`Email: ${ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.EMAIL}`);

    } catch (error) {
        adminInitLog('❌ Критическая ошибка при инициализации администратора', error, 'error');
    }
}

function verifyAdminIntegrity() {
    try {
        const users = loadUsers();

        if (!adminExists(users)) {
            adminInitLog('⚠️ Администратор отсутствует. Пересоздание...', null, 'warn');
            initializeAdminAccount();
        }

        const admin = users.find(u => u.employeeId === ADMIN_INIT_CONFIG.ADMIN_ACCOUNT.ID);
        if (admin && !validateUserStructure(admin)) {
            adminInitLog('⚠️ Структура администратора повреждена', null, 'warn');
        }

    } catch (error) {
        adminInitLog('Ошибка при проверке целостности администратора', error, 'warn');
    }
}

function startIntegrityCheck() {
    setInterval(verifyAdminIntegrity, ADMIN_INIT_CONFIG.VALIDATION.CHECK_INTERVAL);
}

if (typeof window !== 'undefined') {
    window.adminInit = {
        initialize: initializeAdminAccount,
        verify: verifyAdminIntegrity,
        loadUsers: loadUsers,
        saveUsers: saveUsers,
        validateUser: validateUserStructure,
        config: ADMIN_INIT_CONFIG
    };
}

(function() {
    function runInitialization() {
        try {
            if (typeof localStorage === 'undefined') {
                adminInitLog('localStorage не поддерживается браузером', null, 'error');
                return;
            }

            try {
                localStorage.setItem('__test__', 'test');
                localStorage.removeItem('__test__');
            } catch (e) {
                adminInitLog('localStorage недоступен (возможно, приватный режим)', e, 'warn');
                return;
            }

            initializeAdminAccount();
            startIntegrityCheck();

        } catch (error) {
            adminInitLog('Необработанная ошибка при инициализации', error, 'error');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInitialization, { once: true });
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        runInitialization();
    }
})();