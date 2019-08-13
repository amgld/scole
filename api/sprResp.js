/**
 *   ПОЛУЧЕНИЕ ДАННЫХ ОБ УВАЖИТЕЛЬНЫХ ПРИЧИНАХ ПРОПУСКОВ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят ["8Б", "ivanov", "petrov"]
//      8Б - это запрашиваемый класс или группа (пустой, если нужен один ученик)
//  ivanov - это запрашиваемый ученик (пустой, если запрашивается класс)
//  petrov - это логин автора запроса (подписывается скриптом index.js)
// 
// При вызове с фронтенда передается массив, состоящий только из двух
// первых аргументов (один из них всегда пустой)
// 
// Возвращается объект с датами начала и окончания действия каждой справки
// {
//    ivanov: [["d023", "d025"], ["d207", "d207"], ...],
//    petrov: ...
// }
module.exports = async (args) => {
   let resp = {}, bdReq = {};
   try {
      let clName = args[0].substr(0, 20).trim(),
          pupil  = args[1].substr(0, 20).trim(),
          lg     = args[2].substr(0, 20).trim();

      if ((!clName && !pupil) || !lg) return "none";
      
      // Проверяем полномочия автора запроса
      // (либо ученик запрашивает сам себя, либо это сотрудник)
      if (pupil != lg) { 
         let res = await dbFind("staff", {Ulogin: lg});
         if (!res.length) return "none";
      }      
      
      if (pupil) bdReq = {pupil: pupil};    // Если запрашивается один ученик      
      else       bdReq = {Uclass: clName};  // Если запрашивается класс      
      let sprResp = await dbFind("spravki", bdReq);
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
