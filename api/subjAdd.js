/**
 *   ДОБАВЛЕНИЕ ДОПОЛНИТЕЛЬНОГО ПРЕДМЕТА В КОЛЛЕКЦИЮ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает "success" либо "none"
module.exports = async newSubj => {
   
   // Проверяем, что пришло
   const newSubjKey  = newSubj[0].trim() || 'a',
         newSubjName = newSubj[1].trim() || 'a',
         reSubjKey   = /^[ds]{1}\d{3}$/,
         reSubjName  = /^[A-Za-z0-9А-Яа-яЁё ]{2,30}$/;
   if (!reSubjKey.test(newSubjKey) || !reSubjName.test(newSubjName))
      return "none";
   
   // Проверяем, нет ли уже предмета с таким же условным номером,
   // если нет - добавляем, если есть - возвращаем ошибку
   let res = await dbFind("curric", {type: "subj", sbKod: newSubjKey});
   if (res.length) return "none";
   else {      
      db.curric.insert(
         {type: "subj", sbKod: newSubjKey, sbName: newSubjName});
      return "success";
   }   
};
