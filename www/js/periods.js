/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РЕДАКТИРОВАНИЯ УЧЕБНЫХ ПЕРИОДОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Массив учебных периодов (для главного администратора)
// Каждый период - это что-то типа ["1 четверть", "p001", "p230"]
// где p230 - это 30 ноября (сентябрь это 0-й месяц, май это 8-й месяц)
let rootPerList = [];

// Публикация списка периодов на страничке из массива perObj
const perListPubl = perObj => {
   if (!perObj.length) {
      dqs("#perList").innerHTML = "Учебных периодов не найдено.";
      return;
   }
   /*
   // Сначала сортируем массив периодов правильным образом,
   // затем публикуем с иконками удаления
   let massiv = classSort(clArr); // определена в ini.js
   let cont = '',
       currNum = Number(massiv[0].substr(0, massiv[0].length - 1));
   for (let currCl of massiv) {            
      let num = Number(currCl.substr(0, currCl.length - 1));
      if (num != currNum) {
         currNum = num;
         cont += "<br>";
      }
      cont += `<span>
         <div onclick=classNumDel("${currCl}")>&#10060;</div>${currCl}</span>`;
   }
   dqs("#clList").innerHTML = cont;
   */
};

/*
// Отправка запроса к API для добавления класса
const classAdd = async () => {
   let newClassName = dqs("#addClassNum").value.toString()
                    + dqs("#addClassLit").value;
   dqs("#addClassNum").value = '1';
   dqs("#addClassLit").value = 'А';
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "classAdd",
      "z": "${newClassName}"
   }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp == "none") info(1, "Запрашиваемая операция отклонена.");
   else {
      classesList.push(newClassName);
      clListPubl(classesList);
   }
};

// Удаление класса
const classNumDel = async (clNum) => {
   if (!confirm("Вы уверены?")) return;
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "classDel",
      "z": "${clNum}"
   }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp == "none") info(1, "Запрашиваемая операция отклонена.");
   else {
      let clIndex = classesList.indexOf(clNum);
      if (clIndex > -1) classesList.splice(clIndex, 1);
      clListPubl(classesList);
   }
}
*/

// Формирование контента странички
createSection("periods", `
   <h3>Учебные периоды</h3>
   <div id="perList"></div><br>
   <input type="text" id="addPerName" placeholder="Название">
    с&nbsp;<select id="addPerDstart"></select>
           <select id="addPerMstart"></select>
   по&nbsp;<select id="addPerDfin"></select>
           <select id="addPerMfin"></select>
   <button type="button" onclick="periodAdd()">Добавить</button>
`);

// Динамически подгружаем список периодов в массив rootPerList
// с помощью API и публикуем его на страничке (имя метода = имени пункта меню!)
getContent.periods = async () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "getPers"
   }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") rootPerList = JSON.parse(apiResp);
   perListPubl(rootPerList);
   dqs("#addPerName").focus();
}
