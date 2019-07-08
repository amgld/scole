/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТРАНИЦЫ С ОТМЕТКАМИ И ТЕМАМИ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 * 
 *   Скрипт использует библиотеку reglib.js !
 */
"use strict";

// Объекты с темами уроков, дз и весами отметок, а также
// со списком детей и отметками (оба - для текущей отображаемой страницы)
// topicsObj = {d601: {t: "Африка", h: "Учить главу 4", w: 4},...}
// gradesObj =
//    {
//       puList: ['',       "ivanov", "petrov",...],
//       pnList: ["&nbsp;", "Иванов", "Петров",...],
//       d601:   [8,        "нн",     "5",     ...],
//       ...
//    }
let topicsObj = {}, gradesObj = {};

let regDt = new Date(),
    regY  = regDt.getFullYear(),
    regM  = (regDt.getMonth() + 1).toString().padStart(2, '0'),
    regD  = regDt.getDate().toString().padStart(2, '0'),
    regNow = `${regY}-${regM}-${regD}`;

// Начало и окончание учебного года
let regYst  = regDt.getMonth() > 7 ? `${regY}-09-01` : `${regY - 1}-09-01`,
    regYfin = regDt.getMonth() > 7 ? `${regY + 1}-06-30` : `${regY}-06-30`;
    
// Текст placeholder'а в поле редактирования темы урока
let regTopPH = `Введите тему урока\n(если тема пуста, колонка будет удалена)`;

// Формирование контента страницы
createSection("register", `
   <select id="regClassSel" onChange="regPagesSelLoad(this.value);"></select>
   <select id="regPageSel"  onChange="loadGrades()"></select><br>
   <div id="regGrades"></div>
   <div id="regTopics">
      <div id="regNewTopic">
         <input id="regTopDt" type="date" onChange="dtFocus()"
                min="${regYst}" max="${regYfin}" value="${regNow}">
         <textarea placeholder="${regTopPH}"></textarea>
         <input id="regTopHTask" type="text" placeholder="Домашнее задание">
         <span>Вес отметок (от 1 до 8)</span>
         <input id="regTopWeight" type="number" min=1 max=8 value=2>
         <button onClick="topicEdit()">Добавить</button>
      </div>
      <div id="regJustTopics"></div>
   </div>
   <h3 id="regIsContent">У вас нет доступных журнальных страниц</h3>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.register = async () => {
   
   // Выдача сообщения и скрытие контента страницы, если нет
   // доступных юзеру журнальных страниц
   const regNoContent = () => {
      regIsContent = false;
      dqs("#regClassSel") .style.display = "none";
      dqs("#regPageSel")  .style.display = "none";
      dqs("#regIsContent").style.display = "block";
   }
   
   // Формирование списка классов в селекте
   let regRole = dqs("#selRole").value,
       regClList = [],
       regIsContent = true; // есть ли у юзера доступные журнальные страницы
   dqs("#regClassSel") .style.display = "inline";
   dqs("#regPageSel")  .style.display = "inline";
   dqs("#regIsContent").style.display = "none";
   
   if (regRole == "admin") { // администратору показываем все классы
      dqs("#regNewTopic").style.display = "none";
      let apiResp = await apireq("classesList");
      if (apiResp != "none") regClList = classSort(JSON.parse(apiResp));
   }
   else if (regRole == "tutor") {// кл. руководителю только свои классы
      dqs("#regNewTopic").style.display = "none";
      regClList = uTutorCls;
   }
   
   else if (regRole == "teacher") { // учителю только свои классы
      if (Object.keys(uTeachLoad).length == 0) regNoContent();
      else {
         dqs("#regNewTopic").style.display = "block";
         regClList = classSort(Object.keys(uTeachLoad));
      }
   }
   else regNoContent();
   
   let regSelClInner = '';
   for (let cls of regClList) regSelClInner += `<option>${cls}</option>`;
   dqs("#regClassSel").innerHTML = regSelClInner;

   if (regIsContent) {
      await regPagesSelLoad(regClList[0]); // список журальных страничек
      loadGrades(); // список класса, отметки и темы уроков
   }
}
