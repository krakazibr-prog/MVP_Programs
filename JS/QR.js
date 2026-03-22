// Функция для генерации QR-кода
function generateQRCode(user) {
    // Формируем данные для QR-кода с временной меткой и временем истечения
    const timestamp = new Date().toISOString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // +5 минут
    const qrData = `NAME:${user.firstName} ${user.lastName}\nID:${user.employeeId}\nEMAIL:${user.email}\nPHONE:${user.phone}\nTIME:${timestamp}\nEXPIRES:${expirationTime}`;
    
    // Если библиотека QRious загружена, используем её
    if (typeof QRious !== 'undefined') {
        // Удаляем предыдущий QR-код контейнер, если он существует
        const existingContainer = document.getElementById('qr-container');
        if (existingContainer) {
            document.body.removeChild(existingContainer);
        }
        
        // Создаем новый QR-код с уникальными данными
        const qr = new QRious({
            element: document.createElement('canvas'),
            value: qrData,
            size: 300,
            level: 'H',
            mime: 'image/png'
        });
        
        // Создаем новый контейнер для отображения QR-кода
        const qrContainer = document.createElement('div');
        qrContainer.id = 'qr-container';
        qrContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
            border: 1px solid #ddd;
            animation: fadeIn 0.3s ease-in;
        `;
        
        // Добавляем CSS анимацию для плавного появления
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Добавляем заголовок
        const title = document.createElement('h3');
        title.textContent = 'Ваш QR-код';
        title.style.marginTop = '0';
        qrContainer.appendChild(title);
        
        // Добавляем подзаголовок с временем генерации и обратным отсчетом
        const subtitle = document.createElement('p');
        subtitle.textContent = `Сгенерирован: ${new Date().toLocaleString()}`;
        subtitle.style.color = '#666';
        subtitle.style.fontSize = '12px';
        subtitle.style.marginBottom = '15px';
        qrContainer.appendChild(subtitle);
        
        // Добавляем таймер обратного отсчета
        const timerDiv = document.createElement('div');
        timerDiv.id = 'qr-timer';
        timerDiv.textContent = 'Осталось: 5:00';
        timerDiv.style.color = '#007bff';
        timerDiv.style.fontWeight = 'bold';
        timerDiv.style.fontSize = '16px';
        timerDiv.style.marginBottom = '15px';
        qrContainer.appendChild(timerDiv);
        
        // Добавляем QR-код
        qrContainer.appendChild(qr.canvas);
        
        // Добавляем кнопку "QR просканирован" для демонстрации функции
        const scanBtn = document.createElement('button');
        scanBtn.textContent = 'QR просканирован';
        scanBtn.style.cssText = `
            margin-top: 10px;
            padding: 6px 12px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            font-size: 12px;
        `;
        scanBtn.onmouseover = () => scanBtn.style.backgroundColor = '#218838';
        scanBtn.onmouseout = () => scanBtn.style.backgroundColor = '#28a745';
        scanBtn.onclick = () => {
            handleQRScanned(qrContainer, user);
        };
        
        // Добавляем подсказку
        const hint = document.createElement('div');
        hint.textContent = '⚠️ При реальном сканировании QR-код обновится автоматически';
        hint.style.fontSize = '10px';
        hint.style.color = '#666';
        hint.style.marginTop = '5px';
        hint.style.fontStyle = 'italic';
        
        qrContainer.appendChild(scanBtn);
        qrContainer.appendChild(hint);
        
        // Добавляем кнопку закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.style.cssText = `
            margin-top: 15px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#0056b3';
        closeBtn.onmouseout = () => closeBtn.style.backgroundColor = '#007bff';
        closeBtn.onclick = () => {
            // Очищаем таймер при закрытии
            if (window.qrTimer) {
                clearInterval(window.qrTimer);
                window.qrTimer = null;
            }
            qrContainer.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(qrContainer);
            }, 300);
        };
        
        // Добавляем CSS анимацию для плавного исчезновения
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        qrContainer.appendChild(closeBtn);
        
        // Добавляем обработчик клика на фон для закрытия
        qrContainer.onclick = (e) => {
            if (e.target === qrContainer) {
                closeBtn.onclick();
            }
        };
        
        document.body.appendChild(qrContainer);
        
        // Запускаем таймер обратного отсчета
        startQRTimer(qrContainer, timerDiv);
        
        console.log('Новый динамический QR-код сгенерирован и отображен в браузере');
    } else {
        console.warn('Библиотека QRious не загружена');
        showMessage("⚠️ Библиотека для генерации QR недоступна", true);
    }
}

// Функция для запуска таймера QR-кода
function startQRTimer(container, timerDiv) {
    // Очищаем предыдущий таймер, если он существует
    if (window.qrTimer) {
        clearInterval(window.qrTimer);
    }
    
    let seconds = 300; // 5 минут = 300 секунд
    
    window.qrTimer = setInterval(() => {
        seconds--;
        
        // Обновляем отображение таймера
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        timerDiv.textContent = `Осталось: ${timeString}`;
        
        // Меняем цвет таймера на красный за 30 секунд до истечения
        if (seconds <= 30) {
            timerDiv.style.color = '#dc3545';
        }
        
        // Автоматическое обновление QR-кода по истечении времени
        if (seconds <= 0) {
            clearInterval(window.qrTimer);
            showMessage("🔄 QR-код автоматически обновлен", false);
            generateQRCode(getCurrentUser());
        }
    }, 1000);
}

// Функция обработки сканирования QR-кода
function handleQRScanned(container, user) {
    // Останавливаем текущий таймер
    if (window.qrTimer) {
        clearInterval(window.qrTimer);
        window.qrTimer = null;
    }
    
    // Плавно скрываем текущий QR-код
    container.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        // Удаляем текущий контейнер
        document.body.removeChild(container);
        
        // Показываем уведомление о сканировании
        showMessage("✅ QR-код просканирован. Генерируется новый...", false);
        
        // Генерируем новый QR-код через короткую паузу
        setTimeout(() => {
            generateQRCode(user);
        }, 500);
    }, 300);
}