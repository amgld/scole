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
   dqs("#expGet").innerHTML = "Скачать файл";
   dqs("#expGet").style.display = "block";
}

// Формирование контента страницы
createSection("export", `
   <h3>Экспорт журнала одного класса в файл</h3>
   <select id="expSelClass"></select>
   <button type="button" onClick="getExpFile()">Экспортировать</button>
   <p><a id="expGet">Скачать файл</a></p>
   
   <h3>Инструкция</h3><ol>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li>
   <li></li></ol>
`);
