/**
 *   УДАЛЕНИЕ СВОДНОЙ ГРУППЫ ИЗ СПИСКА В КОЛЛЕКЦИИ CURRIC
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает "success" или "none"
module.exports = grDelName => {
   try {
      db.curric.remove({type: "intergroup", ingrName: grDelName}, {});
      return "success";
   }
   catch(e) {return "none";}
};
