/**
 *   ВЫДАЧА ДАННЫХ В ИНТЕРФЕЙС УЧАЩЕГОСЯ И РОДИТЕЛЯ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В аргументах приходит массив, состоящий из одного элемента - логина клиента
// (логин с фронтенда не передается, подписывается скриптом index.js).
// Возвращает none или объект (ВСЕ темы уроков, независимо от отметок)
// {
//    "8Б-мальч_s410_ivanov": {
//       d601: ["Африка", "Учить реки", 8, "нн5"],
//       ...
//    }
//    ...
// }
module.exports = async (argArr) => {
   let resp = {};
   try {
      // Логин учащегося
      if (argArr.length != 1) return "none";
      let lg = argArr[0].substr(0, 20).trim();
      if (!/^[a-z0-9]+$/.test(lg)) return "none";
      
      // Получаем массив, состоящий из его класса и его подгрупп, где он член
      let res = await dbFind("pupils", {Ulogin: lg});
      if (!res.length) return "none";
      let pup = res[0];
      let pupGroups = [pup.Uclass];
      if (pup.groups) pupGroups = [pup.Uclass, ...pup.groups];   
      
      // Из коллекции topics получаем все темы, дз и веса
      // для этих классов и подгрупп и пишем это все в объект resp
      // (см. описание выше) пока без отметок
      for (let gr of pupGroups) {
         res = await dbFind("topics", {g: gr});
         if (!res.length) continue;
         for (let t of res) {
            let k = `${gr}_${t.s}_${t.l}`;
            if (!resp[k]) resp[k] = {};
            resp[k][t.d] = [t.t, t.h, t.w];
         }
      }
            
      // Из коллекции grades получаем все отметки этого ребенка (в том числе
      // итоговые) и подписываем их в объект resp
      res = await dbFind("grades", {p: lg});
      for (let otm of res) {
         let k = `${otm.c}_${otm.s}_${otm.t}`;
         if (!resp[k]) resp[k] = {};
         if (resp[k][otm.d]) resp[k][otm.d].push(otm.g);
         else resp[k][otm.d] = ['', '', 0, otm.g]; // итоговые отметки
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
