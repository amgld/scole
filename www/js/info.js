/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ВЫДАЧА СООБЩЕНИЯ ВМЕСТО alert()
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

document.body.innerHTML += `
  <output>
    <div></div><button type="button" onClick="info(2);">OK</button>
  </output>
`;

// Выдача окна с сообщением
// Первый аргумент: 0 - информационное, 1 - ошибка, 2 - закрыть окно
// Второй аргумент: текст собщения
const info = (t, text) => {
   let out = dqs("output");
   let div = dqs("output div");
   
   if (t == 2) {
      out.style.display = "none";
      return;
   }
   
   if (!t) out.style.background = "#efe";
   else    out.style.background = "#fee";
   
   div.innerHTML = text;
   out.style.display = "block";
}
