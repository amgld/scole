/**
 *   ПОЛУЧЕНИЕ СПИСКА ДЕТЕЙ И ОТМЕТОК ДЛЯ ОДНОЙ СТРАНИЦЫ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят [класс, предмет, учитель]
// Возвращается none либо объект (вес - не строка, а число!):
// {
//    puList: ['',       "ivanov", "petrov",...],
//    pnList: ["&nbsp;", "Иванов", "Петров",...],
//    d601:   [8,        "нн",     "5",     ...],
//    ...
// }
module.exports = async argsObj => {   
   try {
      let gr = argsObj[0].substr(0, 20).trim(),
          sb = argsObj[1].substr(0,  4).trim(),
          lg = argsObj[2].substr(0, 20).trim();

      if (!gr || !sb || !lg) return "none";
      
      let resp = {},
          puListMain = [], puListBlock = [],
          pnListMain = [], pnListBlock = [];
      
      // Сначала формируем список учеников данного класса
          
      let pListArr = [];
      if (!gr.includes('-'))
         pListArr = await dbFind("pupils", {Uclass: gr});
      else
         ; // Ищем аналогично, но в коллекции groups
      for (let pup of pListArr) {
         let newPup = `${pup.Ufamil} ${pup.Uname[0]}.`;
         if (pup.block) {
            puListBlock.push(pup.Ulogin); pnListBlock.push(newPup);        
         }
         else {
            puListMain.push(pup.Ulogin); pnListMain.push(newPup);        
         }
      }
      if (puListMain.length || puListBlock.length) {
         puListMain .sort();
         puListBlock.sort();
         pnListMain .sort((a, b) => a.localeCompare(b, "ru"));
         pnListBlock.sort((a, b) => a.localeCompare(b, "ru"));
         resp.puList = ['',       ...puListMain, ...puListBlock];
         resp.pnList = ["&nbsp;", ...pnListMain, ...pnListBlock];
      }
      else return "{}";
      
      // Теперь формируем объекты (по датам) с отметками
      // ...
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
