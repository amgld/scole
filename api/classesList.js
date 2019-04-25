/**
 *   ПОЛУЧЕНИЕ СПИСКА КЛАССОВ, ИМЕЮЩИХСЯ В КОЛЛЕКЦИИ CURRIC
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает массив имен классов
module.exports = async () => {
   try {
      let res = await dbFind("curric", {type: "class"});
      let clList = [];
      for (let currDoc of res) clList.push(currDoc.className);   
      return JSON.stringify(clList);
   }
   catch(e) {return "[]";}
};
