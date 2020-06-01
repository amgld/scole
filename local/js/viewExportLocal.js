let scrContent = `
"use strict";

// Получаем объект с данными журнала, вырезаем все ссылки
let body = document.querySelector("article");
let bodyInner = body.innerHTML.replace(/<a .+?>/g, '').replace(/<\/a>/g, '');
let scole = JSON.parse(bodyInner);

// Формируем заголовок страницы и определения стилей
let title = document.createElement("title");
title.textContent = \`Журнал \${scole.className} класса\`;
document.head.prepend(title);

let stl = document.createElement("style");
stl.textContent = \`
   @page {size: A4 portrait; margin:1.5cm 2.5cm}
   body {width:16cm; margin:auto; font:10pt Arial, sans-serif; text-align:center}
   nav {text-align:center; margin-bottom:6pt; page-break-before:always}
   h1, h2, h3, p {text-align:center;}
   h1 {font-size:18pt; margin:0pt}
   h2 {font-size:12pt; margin:36pt 0pt 12pt}
   h2:first-of-type {font-size:10pt; margin:12pt 0pt 0pt}
   h3 {font-size:12pt; margin:0pt 0pt 12pt}
   p {margin:48pt 0pt; border-top:0.25pt solid black}
   button {position:fixed; top:5px; right:20px; font-size:24pt; display:none;}
   
   /* Оглавление */
   section p {text-align:left; margin:3pt 0pt; border:none}
   section b {display:inline-block; width:3em; text-align:right}
   
   /* Последняя страница */
   aside {width:10cm; margin:auto; padding-top:5cm; page-break-before:always}
   aside p {border:none}
   aside p:nth-child(2) {border-top:0.25pt solid black}
   aside p:nth-child(3) {text-align:left; font-style:italic}
   
   /* Таблица с отметками */
   .pupCol, .gradeCol {
      display:inline-block; width:3.5cm; border-top:0.25pt solid black;}
   .gradeCol {width:1.1cm;}
   .pupCol div, .gradeCol div {
      border-bottom:0.25pt solid black; padding:1pt 0pt; text-align:left;}
   .gradeCol div {text-align:center; border-left:0.25pt solid black;}
   .gradeCol div:first-child {font-stretch:condensed}
   
   /* Таблица с темами */
   .topicsStr {border:0.25pt solid black; border-style:none none solid}
   h3 + .topicsStr {border-top:0.25pt solid black}
   .topicsStr div {
      display:inline-block; padding:3pt; text-align:center; vertical-align:top;
      -webkit-hyphens:auto; -moz-hyphens:auto; -ms-hyphens:auto; hiphens:auto;}
   .topicsStr div:nth-child(1) {width:1cm; border-left:none}
   .topicsStr div:nth-child(2) {width:0.6cm}
   .topicsStr div:nth-child(3) {width:0.8cm}
   .topicsStr div:nth-child(4) {width:6.4cm; text-align:left}
   .topicsStr div:nth-child(5) {width:6cm; text-align:left}
   h3 + .topicsStr div:nth-child(3),
   h3 + .topicsStr div:nth-child(4),
   h3 + .topicsStr div:nth-child(5) {
      text-align:center;}
   h3 + .topicsStr div {border-left:0.25pt solid black}
   h3 + .topicsStr div:first-child {border-left:none}
   
   /* Таблица со сводной ведомостью успеваемости */
   table {border-collapse:collapse; width:100%}
   th, td {padding:2pt; border:0.25pt solid black; text-align:center}
   th {font-weight:normal}
   td:first-child {text-align:left}
   
   @media screen {
      html {background:#ccc}
      body {background:white; margin:2cm auto; padding-top:1cm;}
      nav, aside {padding-top:12pt; border-top:5px groove #ccc; margin-top:24pt}
      aside {padding:12pt 3cm 2cm}
      button {display:block;}
   }
\`;
document.head.prepend(stl);

let doc = \`
   <button type="button" onClick="window.print()" title="Печать"
      >&#128424;</button>
   <p><small>(наименование образовательной организации)</small></p>
   <h1>Классный журнал \${scole.className} класса</h1>
   <h2>20_____/_____ учебный год</h2>
   <h2>Содержание</h2>\`;

doc += \`<section>{{toc}}</section>\`;
let toc = '';

let listFull = new Set(); // полный список класса
let vedom = [];           // массив со сводной ведомостью
let pageNum = 2;

// Цикл по предметам в данном классе
for (let subjObj of scole.content) {
   
   // Формируем колонку с фамилиями учащихся;
   // заодно накапливаем все фамилии в множестве listFull
   let pupCol = "<div class='pupCol'><div>&nbsp;</div>";
   for (let pupil of subjObj.list) {
      pupCol += \`<div>\${pupil}</div>\`;
      listFull.add(pupil);
   }
   pupCol += "</div>";
   
   // Формируем элемент оглавления
   let teachArr = subjObj.p.split(' '),
       teach = \`\${teachArr[0]}&nbsp;\${teachArr[1][0]}.&nbsp;\${teachArr[2][0]}.\`;
   toc += \`<p><b>\${pageNum}</b>&emsp;\${subjObj.s} (\${teach})</p>\`;
   
   // Пополняем массив со сводной ведомостью vedom =
   // [
   //    [
   //       "Русский язык (Петров К. С.)",
   //       {"Иванов В.": {"1ч.": 5, ...}, "Петров П.": {"1ч.": 3, ...}, ...}
   //    ],
   //    ...
   // ]
   // (массив учебных периодов PERDS подписан спереди скриптом export.js)
   let vedomAdd = {};
   for (let dt of subjObj.l) {
      let dateBrief = dt.d.replace(/<.{0,1}b>/g, ''); // убираем <b></b>
      if (PERDS.includes(dateBrief)) {         
         for (let i=0; i<subjObj.list.length; i++) {
            let fio = subjObj.list[i];
            if (!vedomAdd[fio]) vedomAdd[fio] = {};
            vedomAdd[fio][dateBrief] = (dt.g)[i];
         }
      }
   }   
   vedom.push([\`\${subjObj.s} (\${teach})\`, vedomAdd]);
   
   // Текущая печатаемая страница (левая/четная и правая/нечетная)
   let currPageLeft = '', currPageRight = '';
   
   // Цикл по всем датам (урокам) в данном предмете
   // (11 - количество записанных уроков на одной странице)
   let lessNum = 0;
   for (let lessObj of subjObj.l) {
      if (!(lessNum % 11)) {
         doc += currPageLeft + currPageRight;
         currPageLeft  = \`<nav>\${pageNum}</nav>\`; pageNum++;
         currPageLeft += \`<h3>\${subjObj.s}</h3>\`;         
         currPageLeft += pupCol; // список учащихся
         
         currPageRight  = \`<nav>\${pageNum}</nav>\`; pageNum++;
         currPageRight += \`<h3>\${subjObj.p}</h3>\`;
         currPageRight += "<div class='topicsStr'>"
            + "<div>Дата</div><div>ч</div><div>Вес</div>"
            + "<div>Содержание урока</div><div>Задание на дом</div>"
            + "</div>";
      }
      // Подписываем текущий столбик урока в таблицу с отметками
      currPageLeft += \`<div class='gradeCol'><div>\${lessObj.d}</div>\`;
      for (let gr of lessObj.g)
         currPageLeft += \`<div>\${gr ? gr : ' '}</div>\`;
      currPageLeft += "</div>";
      
      // Подписываем текущую тему в таблицу с темами
      if (lessObj.t) {
         let vol = lessObj.v ? lessObj.v : 1;
         currPageRight += \`<div class='topicsStr'><div>\${lessObj.d}</div>\`
            + \`<div>\${vol}</div><div>\${(lessObj.w)/2}</div>\`
            + \`<div>\${lessObj.t.substr(0,120)}</div>\`
            + \`<div>\${lessObj.h.substr(0,120)}</div></div>\`;
      }
      
      lessNum++;
   }   
   doc += currPageLeft + currPageRight;
}

// Сводная ведомость учета успеваемости
toc += \`<p><b>\${pageNum}</b>&emsp;Сводная ведомость учета успеваемости</p>\`;
doc += \`<nav>\${pageNum}</nav>\`; pageNum++;
doc += \`<h3>Сводная ведомость учета успеваемости \${scole.className} класса<br>\`
     + \`<small>Классный руководитель: \${scole.tutor}</small></h3>\`;

// Полный список учащихся, разбитый по 2 (массив pup2):
// [["Кац И.", "Ким Ю."], ["Иванов И.", "Петров П."], ...]
let pupils = [...listFull].sort((a,b) => a.localeCompare(b, "ru"));
let pup2   = [], innerArr;
for (let i=0; i<Math.ceil(pupils.length / 2); i++) {
   innerArr = [];
   for (let j=0; j<2; j++) if(pupils[2*i+j]) innerArr.push(pupils[2*i+j]);
   pup2.push(innerArr);
}

// Цикл по этим двойкам (каждой двойке соответствует страница с таблицей)
for (let vNum=0; vNum<pup2.length; vNum++) {
   if (vNum) doc += \`<nav>\${pageNum}</nav>\`; pageNum++;
   
   // Печатаем заголовочную часть таблицы с фио детей и учебными периодами
   // (массив учебных периодов PERDS подписан спереди скриптом export.js)
   let itVal = PERDS.length;
   doc += "<table><tr><th rowspan='2'>Предмет и учитель</th>";
   for (let pup of pup2[vNum]) {doc += \`<th colspan='\${itVal}'>\${pup}</th>\`;}
   doc += "</tr><tr>";
   for (let pup of pup2[vNum]) {
      for (let period of PERDS) doc += \`<th>\${period}</th>\`;
   }
   doc += "</tr>";
   
   // Цикл по ранее сформированному массиву vedom, формируем строки таблицы
   for (let subjEl of vedom) {
      doc += "<tr>";
      doc += \`<td>\${subjEl[0]}</td>\`;
      for (let pup of pup2[vNum]) {
         for (let per of PERDS) {
            let tdCont = '';
            if (subjEl[1][pup]) if (subjEl[1][pup][per])
               tdCont = subjEl[1][pup][per];
            doc += \`<td>\${tdCont}</td>\`;
         }
      }
      doc += "</tr>";
   }   
   
   doc += "</table>";
}

doc += "<aside><p>В настоящем журнале пронумеровано,<br>" +
   "прошнуровано и скреплено печатью</p><p>листов</p><p>Подпись:</p></aside>";

body.innerHTML = doc.replace("{{toc}}", toc);
`;