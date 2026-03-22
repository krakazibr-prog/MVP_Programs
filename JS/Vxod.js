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

    // Инициализация администратора
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
        } else {
            console.log('✅ Администратор уже существует');
        }
    }

    // DOM элементы
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const successMessageDiv = document.getElementById('successMessage');
    const infoMessageDiv = document.getElementById('infoMessage');
    const loginBtn = document.getElementById('loginBtn');
    const registerLink = document.getElementById('registerLink');
    const forgotLink = document.getElementById('forgotLink');
    
    // Вспомогательные функции уведомлений
    function hideAllMessages() {
        if (errorMessageDiv) errorMessageDiv.classList.remove('show');
        if (successMessageDiv) successMessageDiv.classList.remove('show');
        if (infoMessageDiv) infoMessageDiv.classList.remove('show');
    }
    
    function showError(message) {
        hideAllMessages();
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.classList.add('show');
            
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
            
            setTimeout(() => {
                errorMessageDiv.classList.remove('show');
            }, 3200);
        }
    }
    
    function showSuccess(message) {
        hideAllMessages();
        if (successMessageDiv) {
            successMessageDiv.textContent = message;
            successMessageDiv.classList.add('show');
            
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(30);
            }
            
            setTimeout(() => {
                successMessageDiv.classList.remove('show');
            }, 2500);
        }
    }
    
    function showInfo(message) {
        hideAllMessages();
        if (infoMessageDiv) {
            infoMessageDiv.textContent = message;
            infoMessageDiv.classList.add('show');
            
            setTimeout(() => {
                infoMessageDiv.classList.remove('show');
            }, 2800);
        }
    }
    
    // Функция красного свечения и перехода на меню.html
    function applyRedGlowAndRedirect(element, redirectUrl) {
        element.classList.add('red-glow');
        
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(80);
        }
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 200);
    }
    
    // Обработчик для входа — ПРОВЕРКА ДАННЫХ ИЗ LOCALSTORAGE
    function handleSubmit(event) {
        event.preventDefault();
        
        hideAllMessages();
        
        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const employeeId = document.getElementById('employeeId').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('Попытка входа:', { lastName, firstName, middleName, employeeId });
        
        // Проверка на пустые поля
        if (!lastName || !firstName || !middleName || !employeeId || !password) {
            showError('⚠️ Пожалуйста, заполните все поля');
            return;
        }
        
        // Загружаем пользователей из localStorage
        const users = loadUsers();
        console.log('Загруженные пользователи:', users);
        
        // Ищем пользователя по фамилии, имени, отчеству и ID
        const user = users.find(u => 
            u.lastName.toLowerCase() === lastName.toLowerCase() && 
            u.firstName.toLowerCase() === firstName.toLowerCase() && 
            u.middleName.toLowerCase() === middleName.toLowerCase() && 
            u.employeeId === employeeId
        );
        
        console.log('Найденный пользователь:', user);
        
        // Если пользователь не найден
        if (!user) {
            showError('❌ Пользователь с такими данными не найден. Пожалуйста, проверьте данные или зарегистрируйтесь.');
            console.warn('Пользователь не найден в системе');
            return;
        }
        
        // Проверяем пароль
        const passwordHash = hashPassword(password);
        console.log('Хеш пароля:', passwordHash, 'Сохраненный хеш:', user.passwordHash);
        
        if (user.passwordHash !== passwordHash) {
            showError('❌ Неверный пароль. Попробуйте снова.');
            console.warn('Неверный пароль');
            return;
        }
        
        // ✅ Вход успешен
        console.log(`✅ Пользователь ${firstName} ${lastName} успешно вошел`);
        
        // Показываем сообщение об успехе
        showSuccess(`✅ Добро пожаловать, ${firstName}! Перенаправление...`);
        
        // Сохраняем информацию о текущем пользователе
        localStorage.setItem('currentUser', JSON.stringify({
            lastName,
            firstName,
            middleName,
            employeeId,
            email: user.email,
            phone: user.phone,
            position: user.position,
            isAdmin: user.isAdmin || false
        }));
        
        // Применяем красноватый эффект на кнопку и переходим на меню.html
        setTimeout(() => {
            applyRedGlowAndRedirect(loginBtn, 'меню.html');
        }, 400);
    }
    
    // Обработчик для "Забыли пароль?"
    function handleForgotClick(e) {
        e.preventDefault();
        showInfo('Демо-режим: восстановление пароля недоступно. Обратитесь к администратору.');
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(40);
        }
        forgotLink.style.transform = 'scale(0.97)';
        setTimeout(() => {
            forgotLink.style.transform = '';
        }, 150);
    }
    
    // Инициализируем администратора при загрузке
    initializeAdminAccount();
    
    // Добавляем обработчик отправки формы
    if (loginForm) {
        loginForm.addEventListener('submit', handleSubmit);
    }
    
    // Обработка нажатия Enter на полях ввода
    const allInputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSubmit(e);
                }
            });
        }
    });
    
    // Ссылка "Регистрация" — переходит на страницу регистрации
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'меню.html';
        });
    }
    
    // Ссылка "Забыли пароль?"
    if (forgotLink) {
        forgotLink.addEventListener('click', handleForgotClick);
        forgotLink.setAttribute('title', 'Демо-режим: восстановление пароля отключено');
    }
    
    // Адаптивный скролл для мобильных при фокусе
    const inputsFocus = document.querySelectorAll('input');
    inputsFocus.forEach(input => {
        input.addEventListener('focus', (e) => {
            setTimeout(() => {
                if (window.innerWidth <= 560) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        });
    });
    
    // Фокус на первое поле при загрузке
    setTimeout(() => {
        const firstInput = document.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 200);
    
    console.log('✅ Авторизация: проверка данных из localStorage активирована');
    console.log('Для входа введите данные зарегистрированного пользователя');
})();
