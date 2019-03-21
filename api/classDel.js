/**
 *   УДАЛЕНИЕ КЛАССА ИЗ СПИСКА В КОЛЛЕКЦИИ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает "success" :)
module.exports = clDelName => {
   db.curric.remove({type: "class", className: clDelName}, {});
   return "success";
};
