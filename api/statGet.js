/**
 *   ПОЛУЧЕНИЕ СТАТИСТИЧЕСКИХ ДАННЫХ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Аргументы - ["classes", arg, "petrov"]
// Здесь classes - типа запрашиваемых статистических данных
//           arg - аргумент (зависит от типа, см. www/js/stat.js)
//        petrov - логин автора запроса (с фронтенда не передается,
//                 подписывается скриптом index.js)
// Возвращает массив строк таблицы (включая заголовочную строку) для публикации
// на странице; каждая строка - это массив значений ячеек
module.exports = async (args) => {
   let resp = [];
   try {
      if (args.length != 3) return "none";
      let tip  = args[0].substr(0, 10),
          arg  = args[1].substr(0, 20).trim(),
          lg   = args[2].substr(0, 20).trim();
      
      // Проверяем полномочия автора запроса
      let staff = await dbFind("staff", {Ulogin: lg});
      if (!staff.length)   return "none";
      if (!staff[0].admin) return "none";
      
      switch (tip) {
         
         // ********** Своевременность заполнения журнала ******************
         case "sloven":
            resp = [["Один", "Два", "Три"], ["Вася", "Петя", "Маша"]];
         break;
         
         // ********** Статистика по параллели классов *********************
         case "classes":
            ;
         break;
         
         // ********** Статистика по одному учителю ************************
         case "teacher":
            ;
         break;
         
         // ********** Статистика по одному предмету ***********************
         case "subject":
            ;
         break;
         
         default: return "none";
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
