/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТРАНИЦЫ С ОТМЕТКАМИ И ТЕМАМИ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 * 
 *   Скрипт использует библиотеку reglib.js !
 */
"use strict";

// Класс, предмет и учитель для отображаемой странички
let rgClassName = '', rgSubjCode = '', rgTeachLgn = '';

// Объекты с темами уроков, дз, весами отметок, к-вом часов занятия, а также
// со списком детей и отметками (оба - для текущей отображаемой страницы)
// topicsObj = {d601: {t: "Африка", h: "Учить главу 4", w: 4, v:2},...}
// gradesObj =
//    {
//       puList: ["ivanov", "petrov",...],
//       pnList: ["Иванов", "Петров",...],
//       d601:   ["нн",     "5",     ...],
//       ...
//    }
let topicsObj = {}, gradesObj = {};

// Текст placeholder'а в поле редактирования темы урока
let regTopPH = `Введите тему урока\n(если тема пуста, колонка будет удалена)`;

// Содержимое select выбора веса отметки
let selWeightInner = '';
for (let i=0; i<9; i++) selWeightInner += `<option value=${i}>${i/2}</option>`;

// Содержимое select выбора количества часов
let selVolInner = '';
for (let i=1; i<8; i++) selVolInner += `<option value="${i}"> ${i} ч </option>`;

// Формирование контента страницы (regNow, regYst, regYfin определены в ini.js)
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
         <select id="regTopVol">${selVolInner}</select>
         <span>Вес отметок (от 0 до 4)</span>
         <select id="regTopWeight">${selWeightInner}</select>
         <button onClick="topicEdit()"> &gt;&gt; </button>
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
