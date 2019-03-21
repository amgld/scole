/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК ТАКОЙ-ТО
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Массив названий классов
let classesList = [];

// Публикация списка классов на страничке из массива clArr
const clListPubl = clArr => {
   // Сначала сортируем массив классов правильным образом
   let massiv = clArr.map(x => x.padStart(3, '0')).sort()
                 . map(x => x.replace(/^0/, ''));
   // Публикуем с иконками удаления
   let cont = '';
   for (let currCl of massiv) cont += `
      <span><div>&#10060;</div>${currCl}</span>`;
   dqs("#classes div").innerHTML = cont;   
};

// Отправка запроса к API для добавления класса
const classAdd = () => {
   let newClassName = dqs("#addClassNum").value.toString()
                    + dqs("#addClassLit").value;
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

// Формирование контента странички
dqs("#content").innerHTML += `
   <section id="classes">
     <h3>Список классов</h3>
     <div></div>
     <select id="addClassNum"></select>
     <select id="addClassLit"></select>
     <button type="button" onclick="classAdd()">Добавить</button>
   </section>
`;

// Формирование опций селектов для добавления класса
let clNumOpt = '', clLitOpt = '', clLiters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
for (let i = 1; i < 12; i++)
   clNumOpt += `<option>${i}</option>`;
for (let i = 0; i < clLiters.length; i++)
   clLitOpt += `<option>${clLiters.charAt(i)}</option>`;
dqs("#addClassNum").innerHTML = clNumOpt;
dqs("#addClassLit").innerHTML = clLitOpt;

// Динамически подгружаем список классов в массив classesList
// с помощью API и публикуем его на страничке (имя метода = имени пункта меню!)
getContent.classes = () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t":  "a", "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "classesList"
   }`};
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      classesList = JSON.parse(apiResp);
      clListPubl(classesList);
   })();
}
