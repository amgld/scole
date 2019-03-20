/**
 *   ДОБАВЛЕНИЕ НОМЕРА КЛАССА В КОЛЛЕКЦИЮ CURRIC
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает "success" либо "none"
module.exports = async newClassName => {
   
   // Промисификатор метода find() работы с базой
   // Пример вызова: let res = await dbFind("curric", {type: "class"}) 
   const dbFind = (collectionName, objFind) => {
      return new Promise((resolve, reject) => {
         db[collectionName].find(objFind, (err, docs) => {
            if (err) reject(err);
            else     resolve(docs);
         })
      })
   };
   
   // Проверяем формат пришедшего имени класса
   const reClassName = /\d{1,2}[A-Я]{1}/;
   if (!reClassName.test(newClassName)) return "none";
   
   // Проверяем, нет ли уже такого класса в списке,
   // если нет - добавляем, если есть - возвращаем ошибку
   let res = await dbFind("curric", {type: "class", className: newClassName});
   if (res.length) return "none";
   else {
      let subNames = ["мальч", "дев", "иняз1", "иняз2", "инф1", "инф2"]
                   . map(x => newClassName + '-' + x);
      db.curric.insert(
         {type: "class", className: newClassName, groups: subNames});
      return "success";
   }   
};
