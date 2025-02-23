document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        'Логин': this.login.value,
        'Пароль': this.password.value
    };
    fetch('http://85.193.82.65/users/login', {
        // mode:  'no-cors',
        method: 'POST',
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Ошибка ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Успех:', data.access_token);
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            alert(error.message);
        });
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        'Эл.почта': this.email.value,
        'Пароль': this.password.value,
        'ФИО': this.name.value,
        'Логин': this.username.value,
        'Номер телефона': this.phone.value
    };
    fetch('http://85.193.82.65/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Ошибка ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Успех:', data);
            // Здесь можно добавить логику для успешной регистрации
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            alert(error.message);
        });
});

document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
});