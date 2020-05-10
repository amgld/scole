/**
 *   ПОЛУЧЕНИЕ СПИСКА МЕЖКЛАССНЫХ ГРУПП, ИМЕЮЩИХСЯ В КОЛЛЕКЦИИ CURRIC
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает несортированный массив имен групп
module.exports = async () => {
   try {
      let grList = [];
      let res = await dbFind("curric", {type: "intergroup"});      
      for (let currDoc of res) grList.push(currDoc.ingrName);
      return JSON.stringify(grList);
   }
   catch(e) {return "[]";}
};
