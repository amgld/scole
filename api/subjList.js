/**
 *   ПОЛУЧЕНИЕ СПИСКА ДОПОЛНИТЕЛЬНЫХ ПРЕДМЕТОВ ИЗ КОЛЛЕКЦИИ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает объект с условными номерами (ключи) и наименованиями предметов
module.exports = async () => {
   let res = await dbFind("curric", {type: "subj"});
   let sbList = {};
   for (let currDoc of res) sbList[currDoc.sbKod] = currDoc.sbName;   
   return JSON.stringify(sbList);
};
