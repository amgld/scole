/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РЕДАКТИРОВАНИЯ СПИСКА ПРЕДМЕТОВ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Объект названий предметов {"s110": "Русский язык", ...}
// (в ini.js определен еще объект названий предметов по умолчанию subjDef)
let subjList = {};

// Публикация списка предметов на страничке из объекта sbObj
const sbListPubl = sbObj => {
   // Сначала сортируем объект по числовым полям ключей (d480 > s110),
   // затем публикуем с иконками удаления (только для ключей, начинающихся с d)
   let sbObjSort = subjSort(sbObj); // определена в ini.js
   let cont = '';
   for (let sbKey in sbObjSort) {
      let divDel = (sbKey[0] == 'd') ?
          `<div onclick="subjDel('${sbKey}')" title="Удалить">&#10060;</div>` :
          "<div class='noCur'></div>";
      let divEdit = (sbKey[0] == 'd') ?
          `<div onclick="subjEdit.getInp('${sbKey}', '${sbObjSort[sbKey]}')" title="Редактировать">&#9874;</div>` :
          "<div class='noCur'></div>";
      cont += `<span id="sb-${sbKey}">${divDel}${divEdit}`
            + `${sbKey.substr(1,3)}&emsp;${sbObjSort[sbKey]}</span>`;
   }
   dqs("#sbList").innerHTML = cont;  
};

/*
// Отправка запроса к API для добавления класса
const classAdd = () => {
   let newClassName = dqs("#addClassNum").value.toString()
                    + dqs("#addClassLit").value;
   dqs("#addClassNum").value = '1';
   dqs("#addClassLit").value = 'А';
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t":  "a", "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "classAdd",
      "z":  "${newClassName}"
   }`};
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") info(1, "Такой класс уже существует.");
      else {
         info(0, `${newClassName} класс успешно добавлен.`);
         classesList.push(newClassName);
         clListPubl(classesList);
      }
   })();
};
*/

/*
// Удаление класса
const classNumDel = clNum => {
   if (confirm("Вы уверены?")) {
      let apiOpt = {method: "POST", cache: "no-cache", body: `{
         "t":  "a", "l":  "${uLogin}", "p":  "${uToken}",
         "f":  "classDel",
         "z":  "${clNum}"
      }`};
      (async () => {
         let apiResp = await (await fetch("/", apiOpt)).text();
         if (apiResp == "none") info(1, "Ошибка на сервере.");
         else {
            info(0, clNum + " удален!");
            let clIndex = classesList.indexOf(clNum);
            if (clIndex > -1) classesList.splice(clIndex, 1);
            clListPubl(classesList);
         }
      })();      
   }
}
*/

// Редактирование названия предмета
const subjEdit = {
   getInp: (sbKey, oldName) => {   
      dqs(`#sb-${sbKey}`).innerHTML =
         `<input class="sbEd" type="text" value="${oldName}"
           onKeyDown="if (event.keyCode == 13)
           subjEdit.subm('${sbKey}', this.value)">`;
   },
   subm: (sbKey, newName) => {
      // Отправляем запрос к API на редактирование, в случае успеха публикуем
      // обновленные данные
      newName = newName.trim();
      subjList[sbKey] = newName;
      sbListPubl(subjList);
   }
}

// Формирование контента странички
createSection("subjects", `
   <h3>Список предметов</h3>
   <div id="sbList"></div><br>
   <input type="text" id="sbNewKod" placeholder="Условный номер">
   <input type="text" id="sbNewName" placeholder="Наименование">
   <button type="button" onclick="subjAdd()">Добавить</button>
`);

// Динамически подгружаем список предметов в объект subjList (сливаем объект
// названий предметов по умолчанию subjDef и то, что получено с помощью API)
// и публикуем его на страничке (имя метода = имени пункта меню!)
getContent.subjects = () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t":  "a", "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "subjList"
   }`};
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      let subjListDop = JSON.parse(apiResp);
      subjList = {...subjDef, ...subjListDop};
      sbListPubl(subjList);
   })();
}
