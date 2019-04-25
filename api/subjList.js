/**
 *   ПОЛУЧЕНИЕ СПИСКА ДОПОЛНИТЕЛЬНЫХ ПРЕДМЕТОВ ИЗ КОЛЛЕКЦИИ CURRIC
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает объект с условными номерами (ключи) и наименованиями предметов
module.exports = async () => {
   try {
      let res = await dbFind("curric", {type: "subj"});
      let sbList = {};
      for (let currDoc of res) sbList[currDoc.sbKod] = currDoc.sbName;   
      return JSON.stringify(sbList);
   }
   catch(e) {return "{}";}
};
