/**
 *   ПОЛУЧЕНИЕ СПИСКА КЛАССОВ, ИМЕЮЩИХСЯ В КОЛЛЕКЦИИ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает массив имен классов
module.exports = async () => {
   let res = await dbFind("curric", {type: "class"});
   let clList = [];
   for (let currDoc of res) clList.push(currDoc.className);   
   return JSON.stringify(clList);
};
