'use strict';

/**
 * ============================================================
 * КРИПТОГРАФИЧЕСКИЕ УТИЛИТЫ
 * ============================================================
 * 
 * ⚠️ ВАЖНО: Это ТОЛЬКО ДЛЯ ДЕМОНСТРАЦИИ И РАЗРАБОТКИ!
 * В production используйте bcrypt/argon2 на сервере.
 */

/**
 * ГЛОБАЛЬНАЯ КОНФИГУРАЦИЯ ДЛЯ ХЕШИРОВАНИЯ
 * Используется ВО ВСЕХ файлах для единообразности
 */
const CRYPTO_CONFIG = {
    // ✅ ЕДИНАЯ СОЛЬ ДЛЯ ВСЕХ ОПЕРАЦИЙ
    SALT: 'unified_app_crypto_salt_v1_2024_',
    
    // ✅ ВЕРСИЯ АЛГОРИТМА (для миграции в будущем)
    VERSION: 1,
    
    LOGGING: {
        ENABLED: false  // Не логируем пароли!
    }
};

/**
 * ЕДИНСТВЕННАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ХЕША
 * Используется везде в приложении
 */
function generatePasswordHash(password) {
    // Валидация входа
    if (typeof password !== 'string') {
        throw new Error('Пароль должен быть строкой');
    }

    if (password.length === 0) {
        throw new Error('Пароль не может быть пустым');
    }

    // Используем ЕДИНУЮ СОЛЬ из конфигурации
    let hash = 0;
    const combined = CRYPTO_CONFIG.SALT + password;

    // Генерируем хеш
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Конвертируем в 32-bit целое число
    }

    const result = Math.abs(hash).toString(16);

    // Логируем только для отладки (БЕЗ самого пароля!)
    if (CRYPTO_CONFIG.LOGGING.ENABLED) {
        console.log(`[CRYPTO] Хеш сгенерирован (версия: ${CRYPTO_CONFIG.VERSION}, длина: ${password.length})`);
    }

    return result;
}

/**
 * ПРОВЕРКА ПАРОЛЯ
 * Сравнивает хеши
 */
function verifyPassword(password, hash) {
    if (typeof password !== 'string' || typeof hash !== 'string') {
        return false;
    }

    try {
        const computedHash = generatePasswordHash(password);
        return computedHash === hash;
    } catch (e) {
        console.error('Ошибка при проверке пароля:', e);
        return false;
    }
}

/**
 * Экспортируем для глобального использования
 */
if (typeof window !== 'undefined') {
    window.cryptoUtils = {
        generatePasswordHash,
        verifyPassword,
        config: CRYPTO_CONFIG
    };
}