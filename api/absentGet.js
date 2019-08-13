/**
 *   ПОЛУЧЕНИЕ ДАННЫХ О ПОСЕЩАЕМОСТИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят ["8Б-инф1", "ivanov", "petrov"]
// 8Б-inf1 - это запрашиваемый класс или группа (пустой, если нужен один ученик)
//  ivanov - это запрашиваемый ученик (пустой, если запрашивается класс)
//  petrov - это логин автора запроса (подписывается скриптом index.js)
// 
// При вызове с фронтенда передается массив, состоящий только из двух
// первых аргументов (один из них всегда пустой)
// 
// Возвращается массив (если запрашивался один ученик - длины 1),
// состоящий из объектов вида
// {d: "d730", c: "11Б", s: s430, t: sidorov, p: ivanov, abs: 2}
// Здесь sidorov - логин преподавателя, 2 - количество пропущенных уроков
module.exports = async (argsObj) => {
   let resp = [], bdReq = {};
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
      
      if (pupil) bdReq = {p: pupil};   // если запрашивается один ученик      
      else       bdReq = {c: clName};  // если запрашивается класс или группа
      
      let grResp = await dbFind("grades", bdReq);
      for (let gr of grResp) {
         let grade = gr.g;
         if (!grade.includes('н')) continue;
         let absVal = grade.length - grade.replace(/н/g, '').length;
         resp.push({d:gr.d, c:gr.c, s:gr.s, t:gr.t, p:gr.p, abs:absVal});
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
