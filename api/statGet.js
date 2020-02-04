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

         // Отдаем список учителей, у которых не было записей
         // последние 15 суток (по каждому предмету и классу)
         // в пределах одного календарного года
         case "sloven":
         resp.push(["Учитель", "Предмет", "Класс"]);
         
         // Определяем дату board: 15 суток назад в формате "d613"
         let bDt   = new Date(Date.now() - (15 * 24 * 3600 * 1000)),
             bYear = bDt.getFullYear(),
             bMon  = bDt.getMonth() + 1,
             bDay  = bDt.getDate(),
             board = `${bYear}-${bMon.toString().padStart(2,'0')}-`
                   + `${bDay.toString().padStart(2,'0')}`;                   
         if (bMon == 12 && bDay > 10) board = `${bYear}-12-10`;
         if (bMon > 5   && bMon < 9)  board = `${bYear}-05-10`;
         if (bMon == 8  && bDay > 16) board = `${bYear}-09-01`;
         board = INI.dtConv(board);
         
         // Получаем из базы все записи тем, датированные последними
         // 15 сутками, в объект good вида
         // {ivanov: [["10А", "s430",  "d815"], ...], petrov: [...], ...}
         rs = await dbFind("topics",
              {$where: function() {return (this.d >= board);}});
         let good = {};
         for (let rec of rs) {
            if (!good[rec.l]) good[rec.l] = [];
            good[rec.l].push([rec.g, rec.s, rec.d]);
         }         
         
         // Цикл по массиву с педагогической нагрузкой
         for (let dElem of distrib) {
            let teacher = teachers[dElem.tLogin];
            if (!teacher)       continue;
            if (!good[dElem.tLogin]) good[dElem.tLogin] = [];
            
            // Цикл по всем предметам данного учителя
            // Формируем массив goodSb всех уроков по данному предмету
            for (let sb of Object.keys(dElem.tLoad)) {
               let subject = subjects[sb];
               if (!subject) continue;
               let goodSb = good[dElem.tLogin].filter(x => x[1] == sb);
               
               // Цикл по всем классам или подгруппам этого предмета
               for (let gr of dElem.tLoad[sb]) {
                  let isSloven = true; // должник ли он
                  for (let lsn of goodSb) {
                     if (lsn[0] == gr) {isSloven = false; break;}
                  }
                  if (isSloven) resp.push([teacher, subject, gr]);
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
