/**
 *   ПОЛУЧЕНИЕ СПИСКА КЛАССНЫХ РУКОВОДИТЕЛЕЙ ИЗ КОЛЛЕКЦИИ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает объект {"8А": "pupkin", "8Б": "prujinkin", ...}
module.exports = async () => {
   let res = await dbFind("curric", {type: "class"});
   let tutList = {};
   for (let currDoc of res) {
      let tutLogin = currDoc.tutor || "none";
      tutList[currDoc.className] = tutLogin;
   }
   return JSON.stringify(tutList);
};
