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

// Импорируем из ini.js метод работы с датами dtConv(), сортировку списка
// предметов sbSort(), объект учебных периодов dtsIt и список предметов по
// умолчанию sbDef, а также список дополнительных предметов SB()
const INI = require("../www/js/ini");
const SB  = require("./subjList");

module.exports = async (args) => {
   let rs, resp = [];
   try {
      if (args.length != 3) return "none";
      let tip  = args[0].substr(0, 10),
          arg  = args[1].substr(0, 20).trim(),
          lg   = args[2].substr(0, 20).trim();
      
      // Проверяем полномочия автора запроса
      let staff = await dbFind("staff", {Ulogin: lg});
      if (!staff.length)   return "none";
      if (!staff[0].admin) return "none";
      
      // Получаем всю педагогическую нагрузку в массив объектов вида
      // {
      //    tLogin: "pupkin",
      //    tLoad:  {s110: ["10И","8С"], s120: ["8С"]}
      // }
      let distrib = await dbFind("distrib", {});
      if (!distrib.length) return "none";
      
      // Получаем всех учителей в объект вида {"pupkin": "Пупкин В. И.", ...}
      rs = await dbFind("staff", {$not: {block: true} });
      if (!rs.length) return "none";
      let teachers = {};
      for (let t of rs)
         teachers[t.Ulogin] = `${t.Ufamil} ${t.Uname[0]}. ${t.Uotch[0]}.`;
         
      // Получаем список всех предметов в объект вида {s110: "Русский", ...}
      rs = await SB();
      if (rs == "none") return "none";
      let subjects = INI.sbSort({...INI.sbDef, ...JSON.parse(rs)});
      
      switch (tip) {
         
// ***** Своевременность заполнения журнала *********************************

         // Отдаем список учителей, последняя запись у которых
         // не было записей последние 8 суток (без учета каникул;
         // по каждому предмету и классу)
         case "sloven":
         resp.push(["Учитель", "Предмет", "Класс", "Последняя<br>запись"]);
         
         // Цикл по массиву с педагогической нагрузкой
         for (let dElem of distrib) {
            let teacher = teachers[dElem.tLogin] || '';
            if (!teacher) continue;
            
            // Цикл по всем предметам данного учителя
            for (let sb of Object.keys(dElem.tLoad)) {
               let subject = subjects[sb] || '';
               if (!subject) continue;
               
               // Цикл по всем классам или подгруппам этого предмета
               for (let gr of dElem.tLoad[sb]) {
                  resp.push([teacher, subject, gr, "23.09"]);
               }
            }
         }
         
         break;
         
// ***** Статистика по параллели классов ************************************
         case "classes":
         ;
         break;
         
// ***** Статистика по одному учителю ***************************************
         case "teacher":
         ;
         break;
         
// ***** Статистика по одному предмету **************************************
         case "subject":
         ;
         break;
         
         default: return "none";
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {console.info(e); return "none";}
};
