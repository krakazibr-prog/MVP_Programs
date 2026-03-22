// main.js

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

function setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = (hash << 5) - hash + password.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString();
}

function showError(message) {
    console.log('Показываю ошибку:', message);
    
    const oldMessage = document.getElementById('dynamicMessage');
    if (oldMessage) {
        oldMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.id = 'dynamicMessage';
    messageDiv.className = 'message error-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('reg-form');
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
        console.log('Сообщение об ошибке добавлено в форму');
    } else {
        console.error('Форма не найдена!');
        alert(message);
    }

    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

function showSuccess(message) {
    console.log('Показываю успех:', message);
    
    const oldMessage = document.getElementById('dynamicMessage');
    if (oldMessage) {
        oldMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.id = 'dynamicMessage';
    messageDiv.className = 'message success-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('reg-form');
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
        console.log('Сообщение об успехе добавлено в форму');
    } else {
        console.error('Форма не найдена!');
        alert(message);
    }
}

// ============ РЕГИСТРАЦИЯ ============
function initRegistration() {
    console.log('Инициализация регистрации');
    const form = document.getElementById('reg-form');
    
    if (!form) {
        console.error('Форма не найдена!');
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Форма отправлена');

        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const position = document.getElementById('position').value.trim();
        const employeeId = document.getElementById('employeeId').value.trim();
        const password = document.getElementById('password').value.trim();

        console.log('Данные из формы:', { lastName, firstName, phone, email, position, employeeId });

        if (!lastName || !firstName || !phone || !email || !position || !employeeId || !password) {
            console.warn('Не все поля заполнены');
            showError('⚠️ Пожалуйста, заполните все обязательные поля.');
            return;
        }

        const users = loadUsers();
        console.log('Загруженные пользователи:', users);
        
        const exists = users.some(user => 
            user.lastName.toLowerCase() === lastName.toLowerCase() && 
            user.firstName.toLowerCase() === firstName.toLowerCase() && 
            user.employeeId === employeeId
        );

        console.log('Пользователь существует?', exists);

        if (exists) {
            console.warn('Попытка регистрации существующего пользователя');
            showError('❌ Пользователь с такими данными уже существует в системе.');
            return;
        }

        users.push({
            lastName,
            firstName,
            middleName,
            phone,
            email,
            position,
            employeeId,
            passwordHash: hashPassword(password)
        });

        saveUsers(users);
        console.log('Пользователь сохранен. Всего пользователей:', users.length);
        
        showSuccess(`✅ Регистрация успешна! Добро пожаловать, ${firstName}!`);
        form.reset();
        
        setTimeout(() => {
            console.log('Переход на авто.html');
            window.location.href = 'авто.html';
        }, 2000);
    });
}

// ============ ВХОД ============
function initLogin() {
    console.log('Инициализация входа');
    const form = document.getElementById('login-form-element');
    const welcomeBlock = document.getElementById('welcome');
    const loginBlock = document.getElementById('login-form');

    const currentUser = getCurrentUser();
    if (currentUser) {
        if (loginBlock) loginBlock.classList.add('hidden');
        if (welcomeBlock) {
            welcomeBlock.classList.remove('hidden');
            welcomeBlock.querySelector('p').textContent = `Вы уже вошли как ${currentUser}.`;
        }
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            const users = loadUsers();
            const user = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());

            if (!user) {
                showError('❌ Пользователь не найден. Зарегистрируйтесь сначала.');
                return;
            }

            if (user.passwordHash !== hashPassword(password)) {
                showError('❌ Неверный пароль. Попробуйте снова.');
                return;
            }

            setCurrentUser(user.username);
            if (loginBlock) loginBlock.classList.add('hidden');
            if (welcomeBlock) {
                welcomeBlock.classList.remove('hidden');
                welcomeBlock.querySelector('p').textContent = `Добро пожаловать, ${user.username}! Вы успешно вошли.`;
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена. Заголовок:', document.title);
    
    if (document.title === 'Регистрация') {
        initRegistration();
    } else if (document.title === 'Вход') {
        initLogin();
    }
});

// Альтернативный способ - если DOMContentLoaded не срабатывает
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded сработал');
        if (document.title === 'Регистрация') {
            initRegistration();
        } else if (document.title === 'Вход') {
            initLogin();
        }
    });
} else {
    console.log('Документ уже загружен, инициализирую напрямую');
    if (document.title === 'Регистрация') {
        initRegistration();
    } else if (document.title === 'Вход') {
        initLogin();
    }
}