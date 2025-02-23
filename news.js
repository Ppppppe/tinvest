document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("results-container");

    const responseData = JSON.parse(localStorage.getItem("queryResults"));

    if (!responseData || responseData.length === 0) {
        container.innerHTML = "<p>Нет данных для отображения.</p>";
        return;
    }

    responseData.forEach(item => {
        const resultDiv = document.createElement("div");
        resultDiv.className = "result";
        resultDiv.innerHTML = `
            <h2>${item.title}</h2>
            <p><strong>Источник:</strong> ${item.source.name || "Неизвестно"}</p>
            <p><strong>Автор:</strong> ${item.author || "Неизвестно"}</p>
            <p>${item.description || "Описание отсутствует"}</p>
            <img src="${item.urlToImage}" alt="Изображение">
            <a href="${item.url}" target="_blank">Читать далее</a>
        `;
        container.appendChild(resultDiv);
    });

    localStorage.removeItem("queryResults");
});