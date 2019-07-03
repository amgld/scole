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
   <select id="regClassSel"></select> <select id="regPageSel"></select>
   <div id="regFilter"></div><br>
   <div id="regGrades">grades</div> <div id="regTopics">topics</div>
`);

// Формирование списка классов в селекте

// Формирование списка журальных страничек в селекте

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

