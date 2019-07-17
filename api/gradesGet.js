/**
 *   ПОЛУЧЕНИЕ СПИСКА ДЕТЕЙ И ОТМЕТОК ДЛЯ ОДНОЙ СТРАНИЦЫ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят [класс(подгруппа), предмет, учитель]
// Возвращается none либо объект (вес - не строка, а число!):
// {
//    puList: ["ivanov", "petrov",...],
//    pnList: ["Иванов", "Петров",...],
//    d601:   ["нн",     "5",     ...],
//    ...
// }
// Если предмет = '', то возвращаются только puList и pnList, причем
// без заблокированных учащихся
module.exports = async (argsObj) => {
   try {
      let gr = argsObj[0].substr(0, 20).trim(),
          sb = argsObj[1].substr(0,  4).trim(),
          lg = argsObj[2].substr(0, 20).trim();

      if (!gr || !lg) return "none";
      
      let resp = {},
          puListMain = [], puListBlock = [],
          pnListMain = [], pnListBlock = [];
      
      // Сначала формируем список учеников данного класса (подгруппы)
      let clName = gr.split('-')[0];
      let pListArr = await dbFind("pupils", {Uclass: clName});
      
      if (pListArr.length && gr.includes('-')) // если запрошена подгруппа
         pListArr = pListArr.filter(pup => {
            if (!pup.groups) return false;
            else if (pup.groups.includes(gr)) return true;
            else return false;
         });
      
      for (let pup of pListArr) {
         let newPup = `${pup.Ufamil} ${pup.Uname[0]}.`;
         if (pup.block) {
            if(sb) {
               puListBlock.push(pup.Ulogin);
               pnListBlock.push(newPup);               
            }            
         }
         else {
            puListMain.push(pup.Ulogin); pnListMain.push(newPup);        
         }
      }
      if (puListMain.length || puListBlock.length) {
         puListMain.sort();         
         pnListMain.sort((a, b) => a.localeCompare(b, "ru"));
         if (sb) {
            puListBlock.sort();
            pnListBlock.sort((a, b) => a.localeCompare(b, "ru"));
            resp.puList = [...puListMain, ...puListBlock];
            resp.pnList = [...pnListMain, ...pnListBlock];
         }
         else {
            resp.puList = puListMain;
            resp.pnList = pnListMain;
         }
      }
      else return "{}";
      
      // Теперь формируем объекты (по датам) с отметками (если предмет != 0)
      if (sb) {
         let grVal = resp.puList.length;
         let grResp = await dbFind("grades", {c: gr, s: sb, t: lg});      
         for (let currGr of grResp) {
            if (resp.puList.includes(currGr.p)) {
               let i = resp.puList.indexOf(currGr.p);
               if (!resp[currGr.d])
                  resp[currGr.d] = (new Array(grVal)).map(x => ''); // массив ''
               resp[currGr.d][i] = currGr.g;
            }
         }
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
