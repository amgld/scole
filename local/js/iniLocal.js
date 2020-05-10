/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ИЗМЕНЕНИЯ В INI.JS ДЛЯ ЛОКАЛЬНОГО ВАРИАНТА
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Убираем пункты Заметки, Лог и Статистика из меню администратора
menuItems = {"admin": [
   ["register", "Журнал"], ["absent", "Посещаемость"], ["distrib", "Нагрузка"],
   ["groups", "Группы"],   ["achsheet", "Табели"],     ["export", "Экспорт"]
]};

// Функция поиска в базе данных. Пример вызова:
// dbFind("curric", {type: "class", c: RegExp('^'+clName)}) 
const dbFind = (collectionName, objFind) => {
   let docs = db[collectionName].filter(x => {
      for (let k of Object.keys(objFind)) {
         // Проверка по простому совпадению
         if (typeof objFind[k] == "string") {
            if (x[k] !== objFind[k]) return false;
         }
         // Проверка по регулярному выражению
         else 
            if(!(objFind[k].test(x[k]))) return false;
      }
      return true;
   });
   return docs;
};
