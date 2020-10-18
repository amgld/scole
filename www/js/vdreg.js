/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ВНЕУРОЧНАЯ ДЕЯТЕЛЬНОСТЬ (ИНТЕРФЕЙС СОТРУДНИКА)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 * 
 *   Скрипт использует библиотеку reglib.js !
 */
"use strict";

// Имя группы (типа 23Р), предмет ВД и учитель для отображаемой группы
let vdGroupName = '', vdSubjName = '', vdTeachLgn = '';

// Объекты с темами занятий, дз, весами отметок, к-вом часов занятия, а также
// со списком детей и отметками (оба - для текущей отображаемой группы)
// vdTopicsObj = {d601: {t: "Африка", h: "Учить главу 4", w: 4, v:2},...}
// vdGradesObj = {
//    puList: ["ivanov", "petrov",...],
//    pnList: ["Иванов", "Петров",...],
//    d601:   ["нн",     "5",     ...],
//    ...
// }
let vdTopicsObj = {}, vdGradesObj = {};

// Текст placeholder'а в поле редактирования темы урока
let vdTopPH = `Введите тему занятия\n(если тема пуста, колонка будет удалена)`;

// Содержимое select выбора веса отметки
let vdSelWInner = '';
for (let i=0; i<9; i++) vdSelWInner += `<option value=${i}>${i/2}</option>`;

// Содержимое select выбора количества часов
let vdSelVInner = '';
for (let i=1; i<8; i++) vdSelVInner += `<option value="${i}"> ${i} ч </option>`;

createSection("vdreg", `
   <select id="vdGroupSel"  onChange="loadVdGrades()"></select><br>
   <div id="vdGrades"></div>
   <div id="vdTopics">
      <div id="vdNewTopic">
         <input id="vdTopDt" type="date" onChange="dtFocus()"
               min="${regYst}" max="${regYfin}" value="${regNow}">
         <textarea placeholder="${vdTopPH}"></textarea>
         <div id="vdTopHTask" contenteditable="true"
            onFocus="clearPhr(); clearPhr = () => {;}">Домашнее задание</div>
         <button id="vdLnk" onClick="insertLink('vdTopHTask')"
            title="Создать ссылку в домашнем задании">&#9875;</button>
         <select id="vdTopVol">${vdSelVInner}</select>
         <span>Вес отметок (от 0 до 4)</span>
         <select id="vdTopWeight">${vdSelWInner}</select>
         <button onClick="vdTopicEdit()"> &gt;&gt; </button>
      </div>
      <div id="vdJustTopics"></div>
   </div>
   <h3 id="vdIsContent">У вас нет групп внеурочной деятельности</h3>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.vdreg = async () => {

   // Выдача сообщения и скрытие контента страницы, если нет
   // доступных юзеру журнальных страниц
   const vdNoContent = () => {
      vdIsContent = false;
      dqs("#vdGroupSel") .style.display = "none";
      dqs("#vdGrades")   .style.display = "none";
      dqs("#vdTopics")   .style.display = "none";
      dqs("#vdIsContent").style.display = "block";
   }

   // Формирование списка групп в селекте и отображение блоков контента
   let vdRole = dqs("#selRole").value,
       vdGrList = [],
       vdIsContent = true; // есть ли у юзера доступные журнальные страницы
   dqs("#vdGroupSel") .style.display = "inline";
   dqs("#vdGrades")   .style.display = "inline-block";
   dqs("#vdTopics")   .style.display = "inline-block";
   dqs("#vdIsContent").style.display = "none";

   if (vdRole == "admin") { // администратору показываем все группы
      dqs("#vdNewTopic").style.display = "none";
      let apiResp = await apireq("interGroupList");
      if (apiResp != "none") vdGrList = classSort(JSON.parse(apiResp));
   }
   else if (vdRole == "tutor") {// кл. рук. - группы с детьми своих классов
      dqs("#vdNewTopic").style.display = "none";
      vdGrList = []; // uTutorCls;
   }
   else if (vdRole == "teacher") { // учителю только свои группы
      let vdTeachLoad = {};
      if (Object.keys(vdTeachLoad).length == 0) vdNoContent();
      else {
         dqs("#vdNewTopic").style.display = "block";
         vdGrList = classSort(Object.keys(vdTeachLoad));
      }
   }
   else vdNoContent();

   let vdSelGrInner = '';
   for (let grp of vdGrList) vdSelGrInner += `<option>${grp}</option>`;
   dqs("#vdGroupSel").innerHTML = vdSelGrInner;

   if (vdIsContent) loadVdGrades(); // список группы, отметки и темы занятий
}
