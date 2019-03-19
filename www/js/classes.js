/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК ТАКОЙ-ТО
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Отправка запроса к API для добавления класса
const classAdd = () => {
   let newClassName = dqs("#addClassNum").value.toString()
                    + dqs("#addClassLit").value;
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t":  "a",
      "l":  "${uLogin}",
      "p":  "${uToken}",
      "f":  "classAdd",
      "z":  "${newClassName}"
   }`};
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") info(1, "Ошибка: запрошенная операция отклонена.");
      else info(0, `${newClassName} класс успешно добавлен.`);
   })();
};

// Формирование контента странички
dqs("#content").innerHTML += `
   <section id="classes">
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
