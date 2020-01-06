/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЭКСПОРТ ЭЛЕКТРОННОГО ЖУРНАЛА В ФАЙЛ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Функция получает файл журнала с бэкенда и отдает его юзеру
const getExpFile = async () => {
   // Получаем файл со скриптом показа журнала   
   let scrContent = await (await fetch("/static/viewExport.js")).text();
   if (!scrContent.includes("use strict")) {
      info(1, "Не могу получить данные");
      return;
   }
   scrContent = scrContent.replace(/\r/g, '').replace(/\/\/.*?\n/g, '')
              . replace(/\/\*.*?\*\//g, '').replace(/ /g, '¤')
              . replace(/\s+/g, ' ').replace(/¤/g, ' ').trim();
   
   // Получаем собственно файл с данными журнала
   dqs("#expGet").innerHTML = "<img src='/static/preloader.gif'>";
   let className = dqs("#expSelClass");
   className = "10З";
   let fileContent = await apireq("export", [className]);
   if (fileContent == "none") {info(1, "Не могу получить данные"); return;}
   
   fileContent = "<!DOCTYPE html><html lang='ru'><head>"
      + `<meta charset='utf-8'></head><body><article>${fileContent}`
      + `</article><script>${scrContent}</script></body></html>`;

   let dataLink = new Blob([fileContent], {type: "text/html"});
   dqs("#expGet").href = window.URL.createObjectURL(dataLink);
   dqs("#expGet").download = `${className}.html`;
   dqs("#expGet").innerHTML = `Скачать файл ${className}.html`;
   dqs("#expGet").style.display = "block";
}

// Формирование контента страницы
createSection("export", `
   <h3>Экспорт журнала одного класса в файл</h3>
   <select id="expSelClass"></select>
   <button type="button" onClick="getExpFile()">Экспортировать</button>
   <p><a id="expGet">Скачать файл</a></p>
   
   <h3 id="expMan">Инструкция</h3><ol>
   <li>Выберите класс из выпадающего списка и нажмите кнопку «Экс&shy;пор&shy;ти&shy;ро&shy;вать».</li>
   <li>После загрузки электронного журнала выбранного класса (это может занять
   некоторое время) появится ссылка «Скачать файл». Кликните по ней и выберите
   один из вариантов: «Открыть в...» или «Сохранить» (этот вариант
   предпочтительнее, так как позволит работать с экспортированным электронным
   журналом в последующем).</li>
   <li>Если вы выбрали вариант «Сохранить», для просмотра сохраненного журнала
   просто откройте соответствующий html-файл в браузере. Предпочтительнее
   использовать браузер, поддерживающий русские переносы, например, Mozilla
   Firefox. В случае выбора варианта «Открыть в...» экспортированный журнал
   откроется для просмотра сразу (в отдельной вкладке браузера).</li>
   <li>Для печати нажмите на значок принтера в правом верхнем углу окна
   просмотра экспортированного журнала. Вы можете как напечатать журнал на
   бумаге, так и сохранить его в виде pdf-файла (выберите необходимый способ в
   появившемся окне выбора принтера). В случае печати на бумаге печатать
   необходимо <b>на двух сторонах листа</b>.</li></ol>
`);
