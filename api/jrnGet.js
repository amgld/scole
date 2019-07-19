/**
 *   ВЫДАЧА ДАННЫХ В ИНТЕРФЕЙС УЧАЩЕГОСЯ И РОДИТЕЛЯ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В аргументах приходит массив, состоящий из одного элемента - логина клиента
// (логин с фронтенда не передается, подписывается скриптом index.js).
// Возвращает none или объект (ВСЕ темы уроков, независимо от отметок)
// {
//    "s410-ivanov": {
//       d601: ["Африка", "Учить реки", 8, "нн5"],
//       ...
//    }
//    ...
// }
module.exports = async (argArr) => {
   let resp = {};
   try {
      let lg = argArr[0].substr(0, 20).trim();
      if (!/^[a-z0-9]+$/.test(lg)) return "none";
      
      // Получаем массив, состоящий из его класса и его подгрупп, где он член
      let res = await dbFind("pupils", {Ulogin: lg});
      if (!res.length) return "none";
      let pup = res[0];
      let pupGroups = [pup.Uclass];
      if (pup.groups) pupGroups = [pup.Uclass, ...pup.groups];
      
      // Из коллекции topics получаем все темы, дз и веса
      // для этих классов и подгрупп и пишем это все в массив resp
      // (см. описание выше) пока без отметок
      for (let gr of pupGroups) {
         res = await dbFind("topics", {g: gr});
         if (!res.length) return "none";
         for (let topic of res) {
            if (!)
         }
      }      
      
      resp = pupClasses;
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
