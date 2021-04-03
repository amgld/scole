// ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ПРОСМОТР ЭКСПОРТИРОВАННОГО ФАЙЛА ЭЖ
// (МЕЖКЛАССНАЯ ГРУППА ВНЕУРОЧНОЙ ДЕЯТЕЛЬНОСТИ)
// Copyright © 2021, А.М.Гольдин. Modified BSD License
// Скрипт подписывается в каждый экспортируемый html-файл с журналом группы ВД
"use strict";

// Получаем объект с данными журнала, вырезаем все ссылки
let body = document.querySelector("article");
let bodyInner = body.innerHTML.replace(/<a .+?>/g, '').replace(/<\/a>/g, '');
let scole = JSON.parse(bodyInner);

// Формируем заголовок страницы и определения стилей
let title = document.createElement("title");
title.textContent = `Журнал группы ВД`;
document.head.prepend(title);

let stl = document.createElement("style");
stl.textContent = `
   @page {size: A4 portrait; margin:1.5cm 2.5cm}
   body {width:16cm; margin:auto; font:10pt Arial, sans-serif; text-align:center}
   nav {text-align:center; margin-bottom:6pt; page-break-before:always}
   h1, h2, h3, p {text-align:center;}
   h1 {font-size:18pt; margin:192pt 0pt 0pt}
   h2 {font-size:12pt; margin:36pt 0pt 12pt}
   h2:first-of-type {font-size:10pt; margin:72pt 0pt 0pt}
   h3 {font-size:12pt; margin:0pt 0pt 12pt}
   p {margin:48pt 0pt; border-top:0.25pt solid black}
   button {position:fixed; top:5px; right:20px; font-size:24pt; display:none;}
   
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
   .ctr {border-top:0.25pt solid black}
   .topicsStr div {
      display:inline-block; padding:3pt; text-align:center; vertical-align:top;
      -webkit-hyphens:auto; -moz-hyphens:auto; -ms-hyphens:auto; hiphens:auto;}
   .topicsStr div:nth-child(1) {width:1cm; border-left:none}
   .topicsStr div:nth-child(2) {width:0.6cm}
   .topicsStr div:nth-child(3) {width:0.8cm}
   .topicsStr div:nth-child(4) {width:6.4cm; text-align:left}
   .topicsStr div:nth-child(5) {width:6cm; text-align:left}
   .ctr div:nth-child(3), .ctr div:nth-child(4), .ctr div:nth-child(5) {
      text-align:center;}
   h3 + .topicsStr div {border-left:0.25pt solid black}
   h3 + .topicsStr div:first-child {border-left:none}
   
   @media screen {
      html {background:#ccc}
      body {background:white; margin:2cm auto; padding-top:1cm;}
      nav, aside {padding-top:12pt; border-top:5px groove #ccc; margin-top:24pt}
      aside {padding:12pt 3cm 2cm}
      button {display:block;}
   }
`;
document.head.prepend(stl);

let doc = `
   <button type="button" onClick="window.print()" title="Печать"
      >&#128424;</button>
   <p><small>(наименование образовательной организации)</small></p>
   <h1>Журнал группы внеурочной деятельности<br style="margin-bottom:12pt">
   <small>Группа ${grFull.replace("(", "<br>(")
      .replace(": ", "<br>")}</small></h1>
   <h2>20_____/_____ учебный год</h2>`;

let pageNum = 2;

// Формируем колонку с фамилиями учащихся
let pupCol = "<div class='pupCol'><div>&nbsp;</div>";
for (let pupil of scole.pnList) {
   pupil = pupil.replace(/\|.*\|/, '').trim();
   pupCol += `<div>${pupil}</div>`;
}
pupCol += "</div>";

// Текущая печатаемая страница (левая/четная и правая/нечетная)
let currPageLeft = '', currPageRight = '';

// Цикл по всем датам
// (11 - количество записанных уроков на одной странице)
let lessNum = 0;
for (let dt in scole) {
   if (dt == "pnList") continue;
   if (!(lessNum % 11)) {
      doc += currPageLeft + currPageRight;
      currPageLeft  = `<nav>${pageNum}</nav>`; pageNum++;
      currPageLeft += pupCol; // список учащихся
      
      currPageRight  = `<nav>${pageNum}</nav>`; pageNum++;
      currPageRight += "<div class='topicsStr ctr'>"
         + "<div>Дата</div><div>ч</div><div>Вес</div>"
         + "<div>Содержание занятия</div><div>Задание на дом</div>"
         + "</div>";
   }
   // Подписываем текущий столбик урока в таблицу с отметками
   currPageLeft += `<div class='gradeCol'><div>${dt}</div>`;
   for (let gr of scole[dt].g) {
      gr = gr.replace("999", "зач");
      if (!/\d{2}\.\d{2}/.test(dt)) gr = gr.replace("0", "н/а");
      currPageLeft += `<div>${gr ? gr : ' '}</div>`;
   }   
   currPageLeft += "</div>";
   
   // Подписываем текущую тему в таблицу с темами
   if (scole[dt].t) {
      let vol   = scole[dt].v ? scole[dt].v : 1,
         weight = scole[dt].w/2,
         topic  = scole[dt].t.substr(0,120),
         htask  = scole[dt].h.substr(0,120);
      currPageRight += `<div class='topicsStr'><div>${dt}</div>`
         + `<div>${vol}</div><div>${weight}</div>`
         + `<div>${topic}</div><div>${htask}</div></div>`;
   }
   
   lessNum++;
}   
doc += currPageLeft + currPageRight;

doc += "<aside><p>В настоящем журнале пронумеровано,<br>" +
   "прошнуровано и скреплено печатью</p><p>листов</p><p>Подпись:</p></aside>";

document.body.innerHTML = doc;
