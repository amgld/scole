/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ВНЕУРОЧНАЯ ДЕЯТЕЛЬНОСТЬ (ИНТЕРФЕЙС СОТРУДНИКА)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 * 
 *   Скрипт использует библиотеку reglib.js !
 */
"use strict";

// Объекты для хранения тем и отметок (аналогичные определенным в register.js)
let vdTopicsObj = {}, vdGradesObj = {};

// Список учителей {"pupking" : "Пупкин В. И."}
let vTeachList = {};

// Текст placeholder'а в поле редактирования темы урока
let vdTopPH = `Введите тему занятия\n(если тема пуста, колонка будет удалена)`;

// Содержимое select выбора веса отметки
let vdSelWInner = '';
for (let i=0; i<9; i++) vdSelWInner += `<option value=${i}>${i/2}</option>`;

// Содержимое select выбора количества часов
let vdSelVInner = '';
for (let i=1; i<8; i++) vdSelVInner += `<option value="${i}"> ${i} ч </option>`;

createSection("vdreg", `
   <select id="vdGroupSel"  onChange="loadGrades(1)"></select><br>
   <div id="vdGrades"></div>
   <div id="vdTopics">
      <div id="vdNewTopic">
         <input id="vdTopDt" type="date" onChange="dtFocus()"
               min="${regYst}" max="${regYfin}" value="${regNow}">
         <textarea placeholder="${vdTopPH}"></textarea>
         <div id="vdTopHTask" contenteditable="true"
            onFocus="clearPhr(1); clearPhr = () => {;}">Домашнее задание</div>
         <button id="vdLnk" onClick="insertLink('vdTopHTask')"
            title="Создать ссылку в домашнем задании">&#9875;</button>
         <select id="vdTopVol">${vdSelVInner}</select>
         <span>Вес отметок (от 0 до 4)</span>
         <select id="vdTopWeight">${vdSelWInner}</select>
         <button onClick="topicEdit(1)"> &gt;&gt; </button>
      </div>
      <div id="vdJustTopics"></div>
   </div>
   <h3 id="vdIsContent">У вас нет групп внеурочной деятельности</h3>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.vdreg = async () => {

   // Список учителей {"pupking" : "Пупкин В. И."}
   let apiResp = await apireq("teachList");
   if (apiResp != "none")
      for (let t of JSON.parse(apiResp)) vTeachList[t.login] = t.fio;

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

   // Получаем полный список всех групп
   // [
   //    ["29Б", "Доп. главы математики", "ivanov"],
   //    ...
   // ]
   apiResp = await apireq("interGroupList");
   if (apiResp != "none")
      vdGrList = JSON.parse(apiResp).sort((x,y) => x[0] > y[0]);

   // Администратору показываем все группы
   if (vdRole == "admin") {
      dqs("#vdNewTopic").style.display = "none";      
   }
   // Учителю только свои группы (uLogin записан скриптом login.js)
   else if (vdRole == "teacher") {
      vdGrList = vdGrList.filter(gr => gr[2] == uLogin);
      if (!vdGrList.length) vdNoContent();
      else dqs("#vdNewTopic").style.display = "block";
   }
   else vdNoContent();

   let vdSelGrInner = '';
   for (let grp of vdGrList) vdSelGrInner +=
      `<option value="${grp[0]}^s000^${grp[2]}">${grp[0]}: ${grp[1]} ` +
      `(${vTeachList[grp[2]]})</option>`;
   dqs("#vdGroupSel").innerHTML = vdSelGrInner;

   if (vdIsContent) loadGrades(1); // список группы, отметки и темы занятий
}
