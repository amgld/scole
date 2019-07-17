/**
 *   ДОБАВЛЕНИЕ ОТМЕТКИ В БАЗУ ДАННЫХ ЛИБО УДАЛЕНИЕ КОЛОНКИ ОТМЕТОК
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает "success", либо "none", либо "pupBlock" (ребенок заблокирован)
// Аргументы - [дата, класс, предмет, ученик, отметка, учитель]
//   например, ["d729", "8Б-мальч", "s110", "ivanov", "petrov", "нн5"]
// Если аргумент "ученик" пустой, удаляется вся колонка отметок
module.exports = async (argsObj) => {
   try {      
      // Проверяем, что пришло
      let d = argsObj[0].substr(0,  5).trim(),
          c = argsObj[1].substr(0, 20).trim(),
          s = argsObj[2].substr(0, 20).trim(),            
          p = argsObj[3].substr(0, 20).trim(),
          g = argsObj[4].substr(0,  5).trim(),
          t = argsObj[5].substr(0, 20).trim();
      if(!g) g = '';
            
      if (!d || !c || !s || !t) return "none";
      if (
         !/^d\d{3}[a-z]{0,1}$/.test(d) || !/^[н0-9 ]{0,5}$/.test(g)
      ) return "none";
      
      // Проверяем полномочия учителя на запрашиваемые класс и предмет
      let distrRes = await dbFind("distrib", {tLogin: t});
      if (!distrRes.length) return "none";
      else {
         let distr = distrRes[0].tLoad;
         if (!distr[s]) return "none";
         else if (!distr[s].includes(c)) return "none";
      }
      
      // Если пришел пустой ученик, удаляем всю колонку отметок
      if (!p) {
         db.grades.remove({d: d, c: c, s: s, t: t}, {multi: true});
         return "success";
      }
      
      // Проверяем, есть ли такой ученик и не заблокирован ли он
      let res = await dbFind("pupils", {Ulogin: p});
      if (!res.length)  return "none";
      if (res[0].block) return "pupBlock";
      
      let success = 1;
      db.grades.update(
         {d: d, c: c, s: s, t: t, p: p},
         {d: d, c: c, s: s, t: t, p: p, g: g},
         {upsert: true},
         function (e) {if(e) success = 0;}
      );
      if (success) return "success"; else return "none";
   }
   catch(e) {return "none";}
};
