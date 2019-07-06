/**
 *   РЕДАКТИРОВАНИЕ ТЕМ УРОКОВ, ДОМАШНИХ ЗАДАНИЙ И ВЕСОВ ОТМЕТОК
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят класс, предмет, учитель, дата, тема, дз, вес
// Вес приходит как строка, но в базу пишется как число!
// Дата приходит в формате "d607", где 6 - номер месяца
// (сентябрь = 0, май = 8), 07 - число месяца
// Пример: ["8Ж-дев", "s110", "ivanov", "d113", "Тема", "ДЗ", "4"]
// Возвращает success или none
// Данные хранятся в коллекции topics (одна запись - один урок):
// {
//    g: "8Ж-дев", s: "s110",   l: "ivanov",
//    d: "d113",   t: "Африка", h: "Глава 4", w: "4"
// }
module.exports = async argsObj => {   
   try {
      let gr = argsObj[0].substr(0,  20).trim(),
          sb = argsObj[1].substr(0,   4).trim(),
          lg = argsObj[2].substr(0,  20).trim(),
          dt = argsObj[3].substr(0,   4).trim(),
          tp = argsObj[4].substr(0, 200).trim(),
          ht = argsObj[5].substr(0, 200).trim() || "Не указано",
          wt = argsObj[6].substr(0,   1).trim();

      if (!gr || !sb || !lg || !dt || !wt) return "none";
      if (!/^[1-8]{1}$/.test(wt))          return "none"; wt = Number(wt);
      if (!/^d[0-9][0-3][0-9]$/.test(dt))  return "none";
      if (Number(dt.substr(2, 2)) > 31)    return "none";
      
      let objFind = {g: gr, s: sb, l: lg, d: dt},
          objNew  = {...objFind, t:tp, h:ht, w:wt};
      
      // Проверяем, нет ли уже такого урока      
      let lessons = await dbFind("topics", objFind);
      
      // Если есть - либо редактируем, либо удаляем (если tp='')
      if (lessons.length) {
         if (!tp) db["topics"].remove(objFind, {});
         else db["topics"].update(objFind, objNew, {});
      }      
      
      // Если нет - добавляем
      else if (tp) db["topics"].insert(objNew);
      
      return "success";
   }
   catch(e) {return "none";}
};
