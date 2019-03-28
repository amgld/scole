/**
 *   УДАЛЕНИЕ ДОПОЛНИТЕЛЬНОГО ПРЕДМЕТА ИЗ КОЛЛЕКЦИИ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает "success" :)
module.exports = sbDelKey => {
   db.curric.remove({type: "subj", sbKod: sbDelKey}, {});
   return "success";
};
