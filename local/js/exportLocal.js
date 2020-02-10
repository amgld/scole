/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЭКСПОРТ ЭЖ В ФАЙЛ (ЛОКАЛЬНО)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Объект со списком всех предметов
let expSbListFull = {};

// Учебные периоды типа ["1ч", "2ч", ...]
let PERDS = [];
for (let perN=0; perN<STPER.length; perN++) PERDS[perN] = STPER[perN][0];

// Функция получает файл журнала с бэкенда и отдает его юзеру
const getExpFile = async () => {   
   // scrContent (скрипт показа журнала) определен в viewExportLocal.js
   scrContent = scrContent.replace(/\r/g, '').replace(/\/\/.*?\n/g, '')
              . replace(/\/\*.*?\*\//g, '').replace(/ /g, '¤')
              . replace(/\s+/g, ' ').replace(/¤/g, ' ').trim();
   
   // Получаем собственно файл с данными журнала
   dqs("#expGet").innerHTML = "<img src='static/preloader.gif'>";
   dqs("#expGet").style.display = "inline";
   let className = dqs("#expSelClass").value;
   let fileContent = await apireq("export", [className]);
   if (fileContent == "none") {info(1, "Не могу получить данные"); return;}
   
   // Заменяем коды предметов и дат на названия и собственно даты
   let expObj = JSON.parse(fileContent);
   for (let i=0; i<expObj.content.length; i++) {
      // Код предмета заменяем на название      
      expObj.content[i].s = expSbListFull[expObj.content[i].s];
      
      // Заменяем код даты на собственно дату
      for (let j=0; j<expObj.content[i].l.length; j++) {
         let dtCode = (expObj.content[i].l)[j].d;
         let dt = (dtCode.length == 4) ?
            dateConv(dtCode) : `<b>${DTSIT[dtCode][0]}</b>`;
         (expObj.content[i].l)[j].d = dt;
      }
   }
   
   fileContent = "<!DOCTYPE html><html lang='ru'><head>"
      + `<meta charset='utf-8'></head><body><article>${JSON.stringify(expObj)}`
      + `</article><script>"use strict"; const PERDS = ${JSON.stringify(PERDS)}`
      + `</script><script>${scrContent}</script></body></html>`;

   // Отдаем юзеру
   let dataLink = new Blob([fileContent], {type: "text/html"});
   let linkElem = dqs("#expGet");
   linkElem.href = window.URL.createObjectURL(dataLink);
   linkElem.download = `${className}.html`;
   linkElem.innerHTML = `Скачать файл ${className}.html`;
}

// Формирование контента страницы
createSection("export", `
   <h3>Экспорт журнала одного класса в файл</h3>
   <select id="expSelClass"></select>
   <button type="button" onClick="getExpFile()">Экспортировать</button>
   <p>&nbsp;<a id="expGet">Скачать файл</a></p>   
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.export = async () => {
   
   let selClassInner = '';
   dqs("#expGet").style.display = "none";
   
   // Показываем ему все классы
   let apiResp = await apireq("classesList");
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let absAllClasses = classSort(JSON.parse(apiResp));
   for (let cl of absAllClasses) selClassInner += `<option>${cl}</option>`;

   dqs("#expSelClass").innerHTML = selClassInner;
   
   // Заполняем объект со списком всех предметов
   expSbListFull = await sbListFullGet();
};