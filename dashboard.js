const userToken = document.cookie.split('; ').find(row => row.startsWith('user_access_token='));
if (!userToken) {
    // window.location.href = 'index.html';
}

const tickers = ["AAPL", "MSFT", "AMZN", "GOOGL", "FB", "TSLA", "BRK.B", "NVDA", "JPM", "JNJ", "V", "PG", "UNH", "HD", "DIS", "PYPL", "VZ", "NFLX", "INTC", "CMCSA"]; // Топ-30 тикеров

window.onload = function () {

    document.getElementById('ticker-input').addEventListener('input', function () {
        const input = this.value.toUpperCase();
        const suggestions = tickers.filter(ticker => ticker.startsWith(input));
        document.getElementById('suggestions').innerHTML = suggestions.map(ticker => `<div>${ticker}</div>`).join('');
    });

    document.getElementById('suggestions').addEventListener('click', function (event) {
        if (event.target.tagName === 'DIV') {
            document.getElementById('ticker-input').value = event.target.innerText;
            document.getElementById('suggestions').innerHTML = '';
        }
    });

    document.getElementById('price-button').addEventListener('click', function () {
        const ticker = document.getElementById('ticker-input').value;
        fetch(`http://85.193.82.65/subscriptions/last_prices/${ticker}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Ошибка ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                const price = data[0].price.units + '.' + (data[0].price.nano / 1000000000).toFixed(3).slice(2);
                document.getElementById('price').value = price;
            }).catch(err => alert(err.message));
    });

    document.getElementById('news-button').addEventListener('click', function () {
        const ticker = document.getElementById('ticker-input').value;
        if (ticker === "") {
            alert("Укажите тикер!");
            return;
        }
        fetch(`http://85.193.82.65/subscriptions/news/${ticker}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Ошибка ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem("queryResults", JSON.stringify(data));
                window.open("news.html", "_blank");
            }).catch(err => alert(err.message));
    });

    document.getElementById('dividend-button').addEventListener('click', function () {
        const ticker = document.getElementById('ticker-input').value;
        fetch(`http://85.193.82.65/subscriptions/dividends/${ticker}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Ошибка ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                const dividendNet = data[0].dividendNet;
                document.getElementById('dividend').value = dividendNet.units + '.' + (dividendNet.nano / 1000000000).toFixed(3).slice(2);
                document.getElementById('currency').value = dividendNet.currency;
            }).catch(error => alert(error.message));
    });

    document.getElementById('subscribe-button').addEventListener('click', function () {
        const ticker = document.getElementById('ticker-input').value;
        const priceChangeStep = document.getElementById('price-change-step').value;

        fetch('http://85.193.82.65/subscriptions/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Cookie' : 'user_access_token=' + userToken
            },
            body: JSON.stringify({ticker_name: ticker, price_change_step: parseFloat(priceChangeStep)})
        })
            .then(response => {
                if (response.ok) {
                    return response.text().then(text => {
                        alert("Подписка добавлена");
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.detail === "Подписка на эту бумагу уже существует") {
                    fetch('http://85.193.82.65/subscriptions/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ticker_name: ticker, price_change_step: parseFloat(priceChangeStep)})
                    }).then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                throw new Error(`Ошибка ${response.status}: ${text}`);
                            });
                        } else {
                            alert("Подписка обновлена")
                        }
                        return response.json();
                    }).catch(error => alert(error.message));
                }
            }).catch(error => alert(error.message));
    });

    // Обработчик для кнопки "Выход"
    document.getElementById('logout-button').addEventListener('click', function () {
        // Удаляем куки
        document.cookie = "user_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Переходим на страницу авторизации
        window.location.href = 'index.html';
    });

    document.getElementById('account-button').addEventListener('click', function () {
        window.open("me.html", "_blank");
    });

    // обновление настроек уведомлений
    document.getElementById("notifications_form").addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = {
            notify_start_time: document.getElementById("notify_start_time").value,
            notify_end_time: document.getElementById("notify_end_time").value,
            max_repeats: document.getElementById("max_repeats").value,
            notify_dividends: document.getElementById("notify_dividends").checked,
            notify_news: document.getElementById("notify_news").checked,
            notification_channel: document.getElementById("notification_channel").value
        }

        fetch('http://85.193.82.65/users/notifications/settings/', {
            method: 'PUT',
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
                alert('Успех!');
            })
            .catch((error) => {
                alert(error.message);
            });
    });
};
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://85.193.82.65/subscriptions");
        if (!response.ok) {
            alert(`Ошибка: ${response.statusText}`);
            return;
        }

        const data = await response.json();

        const container = document.getElementById("subscriptions");
        data.forEach(item => {
            const itemDiv = document.createElement("div");
            // itemDiv.classList.add("inter-block");
            itemDiv.classList.add("subscriptions-list-div");

            Object.entries(item).forEach(([key, value]) => {
                const fieldDiv = document.createElement("div");
                fieldDiv.classList.add("field");
                itemDiv.classList.add("inter-block");

                const keyFieldDiv = document.createElement("div");
                keyFieldDiv.textContent = key;
                const valueFieldDiv = document.createElement("div");
                valueFieldDiv.textContent = value;
                fieldDiv.appendChild(keyFieldDiv);
                fieldDiv.appendChild(valueFieldDiv);
                if (key === "ticker_name") {
                    keyFieldDiv.textContent = "Название тикера";
                }
                if (key === "price_change_step") {
                    keyFieldDiv.textContent = "Шаг цены";
                }
                itemDiv.appendChild(fieldDiv);
            });

            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
});
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://85.193.82.65/users/history-notifications/");
        if (!response.ok) {
            alert(`Ошибка: ${response.statusText}`);
            return;
        }

        const data = await response.text();
        // const data = await response.json();

        const container = document.getElementById("notifications_history");
        const itemDiv = document.createElement("div");
        itemDiv.textContent = data;
        container.appendChild(itemDiv);
        // data.forEach(item => {
        //     const itemDiv = document.createElement("div");
        //     // itemDiv.classList.add("inter-block");
        //     itemDiv.classList.add("subscriptions-list-div");
        //
        //     Object.entries(item).forEach(([key, value]) => {
        //         const fieldDiv = document.createElement("div");
        //         fieldDiv.classList.add("field");
        //         itemDiv.classList.add("inter-block");
        //
        //         const keyFieldDiv = document.createElement("div");
        //         keyFieldDiv.textContent = key;
        //         const valueFieldDiv = document.createElement("div");
        //         valueFieldDiv.textContent = value;
        //         fieldDiv.appendChild(keyFieldDiv);
        //         fieldDiv.appendChild(valueFieldDiv);
        //         if (key === "ticker_name") {
        //             keyFieldDiv.textContent = "Название тикера";
        //         }
        //         if (key === "price_change_step") {
        //             keyFieldDiv.textContent = "Шаг цены";
        //         }
        //         itemDiv.appendChild(fieldDiv);
        //     });
        //
        //     container.appendChild(itemDiv);
        // });
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
});

async function fetchData() {
    try {
        let response = await fetch('URL_ЭНДПОИНТА');
        if (!response.ok) {
            alert(`Ошибка: ${response.statusText}`);
            return;
        }
        let data = await response.json();
        fillForm(data);
    } catch (error) {
        alert(`Ошибка: ${error}`);
    }
}

function fillForm(data) {
    document.getElementById('notify_start_time').value = data.notify_start_time;
    document.getElementById('notify_end_time').value = data.notify_end_time;
    document.getElementById('max_repeats').value = data.max_repeats;
    document.getElementById('notify_dividends').checked = data.notify_dividends;
    document.getElementById('notify_news').checked = data.notify_news;
    document.getElementById('notification_channel').value = data.notification_channel || '';
}

document.addEventListener("DOMContentLoaded", fetchData);