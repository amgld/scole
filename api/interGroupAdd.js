/**
 *   ДОБАВЛЕНИЕ ИМЕНИ СВОДНОЙ ГРУППЫ В КОЛЛЕКЦИЮ CURRIC
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает "success" либо "none"
module.exports = async newInGrName => {
   try {
      // Проверяем формат пришедшего имени группы
      const reGrName = /^[2-9]{2}[A-Я]{1}$/;
      if (!reGrName.test(newInGrName)) return "none";
   
      // Проверяем, нет ли уже такой группы в списке,
      // если нет - добавляем, если есть - возвращаем ошибку
      let res = await dbFind(
         "curric", {type: "intergroup", ingrName: newInGrName}
      );
      if (res.length) return "none";
      else {
         db.curric.insert({type: "intergroup", ingrName: newInGrName});
         return "success";
      }
   }
   catch(e) {return "none";}
};
