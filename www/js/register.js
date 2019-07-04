/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТРАНИЦЫ С ОТМЕТКАМИ И ТЕМАМИ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Фильтр дней недели (показывать день или нет); индексы: пн=1, ..., сб=6
let daysFilter = [0, 1, 1, 1, 1, 1, 1];

// Переключение фильтра дней недели в зависимости от действий пользователя
// и запись нового фильтра в базу с помощью API;
// одновременно показ на странице (если аргумент = 0, то только показ)
const checkDayFilter = day => {
   if (![0,1,2,3,4,5,6].includes(day)) return;
   if (day) {
      daysFilter[day] = (daysFilter[day] + 1) % 2;
      
      // Пишем обновленный фильтр в базу с помощью API
      // ...
   }
   
   // Показываем выставленные значения фильтра на странице
   for (let i=1; i<7; i++) {
      if (daysFilter[i]) dqs(`#rf${i}`).style.color = "#963";
      else               dqs(`#rf${i}`).style.color = "#ccc";
   }
}

// Формирование контента страницы
createSection("register", `
   <select id="regClassSel"></select>
   <select id="regPageSel"></select>
   <div id="regFilter"></div><br>
   <div id="regGrades"></div>
   <div id="regTopics"></div>
   <h3 id="regIsContent">У вас нет доступных журнальных страниц</h3>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.register = async () => {
   
   let apiOpt = {
      method: "POST",
      cache: "no-cache",
      body: `{
         "t":"${uCateg}", "l":"${uLogin}", "p":"${uToken}", "f":"classesList"
      }`      
   };
   
   // Выдача сообщения и скрытие контента страницы, если нет
   // доступных юзеру журнальных страниц
   const regNoContent = () => {
      regIsContent = false;
      dqs("#regClassSel") .style.display = "none";
      dqs("#regPageSel")  .style.display = "none";
      dqs("#regFilter")   .style.display = "none";
      dqs("#regIsContent").style.display = "block";
   }
   
   // Формирование списка классов в селекте
   let regRole = dqs("#selRole").value,
       regClList = [],
       regIsContent = true; // есть ли у юзера доступные журнальные страницы
   dqs("#regClassSel") .style.display = "inline";
   dqs("#regPageSel")  .style.display = "inline";
   dqs("#regFilter")   .style.display = "inline-block";
   dqs("#regIsContent").style.display = "none";
   // alert(regRole);   
   
   if (regRole == "admin") { // администратору показываем все классы
      apiOpt.f = "classesList";
      let apiResp   = await (await fetch("/", apiOpt)).text();
      if (apiResp != "none") regClList = classSort(JSON.parse(apiResp));
   }
   else if (regRole == "tutor") // кл. руководителю только свои классы
      regClList = uTutorCls;
   
   else if (regRole == "teacher") { // учителю только свои классы
      if (Object.keys(uTeachLoad).length == 0) regNoContent();
      else regClList = classSort(Object.keys(uTeachLoad));
      // педнагрузка: uTeachLoad = {"8Б": ["s230", "d710"], "10Ж": ["s110"]}
   }
   else regNoContent();
   
   let regSelClInner = '';
   for (let cls of regClList) regSelClInner += `<option>${cls}</option>`;
   dqs("#regClassSel").innerHTML = regSelClInner;

   // Формирование списка журальных страничек в селекте
   // {"pupkin": {"s110": ["8Б", "10Ж"], "d830": ["8Б"]}, "ivanov": ...}   
   if (regIsContent) {
      apiOpt.body = apiOpt.body.replace("classesList", "distrGet");      
   }   
   
   if (!regIsContent) return;
      
   // Формирование фильтра дней недели, показываемого на странице
   let daysFilterCont = '', dN = ['', "пн", "вт", "ср", "чт", "пт", "сб"];
   for (let i=1; i<7; i++) {
      daysFilterCont +=
         `<span id="rf${i}" onClick="checkDayFilter(${i})">${dN[i]}</span> `;
   }
   dqs("#regFilter").innerHTML = daysFilterCont;
   checkDayFilter(0);

   // Загрузка отметок

   // Загрузка тем уроков   
}



