/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ВНЕУРОЧНАЯ ДЕЯТЕЛЬНОСТЬ (ИНТЕРФЕЙС СОТРУДНИКА)
 *   Copyright © 2021, А.М.Гольдин. Modified BSD License
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

// Экспорт странички текущей группы в html-файл
const expVD = async () => {

   // Получаем данные текущей выбранной группы
   let selElem = dqs("#vdGroupSel"),
       grName  = selElem.value.split('^')[0],
       teacher = selElem.value.split('^')[2],
       grFull  = selElem.options[selElem.selectedIndex].text;

   // Получаем файл со скриптом показа журнала   
   let scrContent = await (await fetch("/js/viewExportVD.js")).text();
   if (!scrContent.includes("use strict")) {
      info(1, "Не могу получить данные");
      return;
   }
   scrContent = scrContent.replace(/\r/g, '').replace(/\/\/.*?\n/g, '')
            . replace(/\/\*.*?\*\//g, '').replace(/ /g, '¤')
            . replace(/\s+/g, ' ').replace(/¤/g, ' ').trim();

   // Получаем отметки 
   let gradesStr = await apireq("gradesGet", [grName, "s000", teacher]);
   if (gradesStr == "none") {info(1, "Не могу получить данные"); return;}

   // Получаем темы уроков
   let topicsStr = await apireq("topicsGet", [grName, "s000", teacher]);
   if (topicsStr == "none") {info(1, "Не могу получить данные"); return;}

   // Формируем объект данных для экспорта
   // {
   //    pnList: ["Иванов И.", "Петров П.", ...],
   //    d601:   {t: "Африка", h: "Учить", w: 4, v: 2, g: ["нн", "5", ...]},
   //    ...
   // }

   let expObj = {},
       grades = JSON.parse(gradesStr),
       topics = JSON.parse(topicsStr);
   if (!grades.pnList) {info(1, "Нечего экспортировать!"); return;}
   let DSset = new Set([...Object.keys(grades), ...Object.keys(topics)]);
       DSset.delete("puList"); DSset.delete("pnList");
   let DS = [...DSset];
   for (let k of DS.sort()) {
      let kNew = k.length == 4 ? dateConv(k) : DTSIT[k][0];
      let tp = topics[k] ? topics[k] : {},
          gr = grades[k] ? grades[k] : new Array(grades.pnList.length).fill('');
      expObj[kNew] = {...tp, g: gr};
   }
   expObj.pnList = grades.pnList;

   let linkElem = dqs("#expVD");
   linkElem.innerHTML = "Ждите...";
   let fileContent = "<!DOCTYPE html><html lang='ru'><head>"
      + `<meta charset='utf-8'></head><body><article>${JSON.stringify(expObj)}`
      + `</article><script>"use strict"; const grFull = "${grFull}";`
      + `</script><script>${scrContent}</script></body></html>`;

   let dataLink = new Blob([fileContent], {type: "text/html"});
   linkElem.href = window.URL.createObjectURL(dataLink);
   linkElem.download  = `${grName}.html`;
   linkElem.innerHTML = "Скачать";
   linkElem.removeAttribute("onclick");
}

createSection("vdreg", `
   <select id="vdGroupSel" onChange="
      dqs('#expVD').innerHTML='&#128228;';
      dqs('#expVD').removeAttribute('href');
      dqs('#expVD').setAttribute('onclick', 'expVD(); return false');
      loadGrades(1)"></select>&nbsp;
   <a id="expVD" onclick="expVD(); return false" style="cursor:pointer"
      title="Экспорт">&#128228;</a><br>
   <div id="vdGrades"></div>
   <div id="vdTopics">
      <div id="vdNewTopic">
         <input id="vdTopDt" type="date" onChange="dtFocus(0, 1)"
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
      dqs("#expVD")      .style.display = "none";
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
