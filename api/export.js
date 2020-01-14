/**
 *   ЭКСПОРТ ЖУРНАЛА ОДНОГО КЛАССА В ФАЙЛ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят ["8Б", "ivanov"]
//      8Б - это запрашиваемый класс
//  ivanov - это логин автора запроса (подписывается скриптом index.js)
// 
// Возвращается сериализованный в строку объект вида
// {
//   "className": "8А",   
//   "content": [
//      {
//         "list": ["Иванов В.", "Петров П.", ...],
//         "s":    "s110",
//         "p":    "Кулебякин Иван Петрович",
//         "l": [
//            {"d":"d403","w":2,"t":"Африка","h":"№ 234", "g":["3 4н", ...]},
//            ...
//          ]
//      },
//      ...    
//   ]
// }
const grGet = require("./gradesGet");

module.exports = async (args) => {
   let resp = {className: '', content: []};
   try {
      if (args.length != 2) return "none";
      let clName = args[0].substr(0,  3).trim(),
          lg     = args[1].substr(0, 20).trim();

      if (!clName || !lg) return "none";
      
      // Проверяем полномочия автора запроса на запрашиваемый класс
      let res = await dbFind("staff", {Ulogin: lg});
      if (!res.length) return "none";
      if (!res[0].admin) {         
         let clRes = await dbFind("curric", {type: "class", className: clName});
         if (!clRes.length)        return "none";
         if (clRes[0].tutor != lg) return "none";
      }
      
      resp.className = clName;
      
      // Забираем из таблицы topics все записи данного класса и его подгрупп
      // и сортируем массив полученных объектов по коду предмета
      let pattern   = new RegExp(`^${clName}`);
      let resTopics = await dbFind("topics", {g: pattern});
      resTopics = resTopics.sort((x, y) => x.s.substr(1,3) > y.s.substr(1,3));      
      
      // Разбираем полученный массив в объект objTopics с ключами вида
      // "Группа^кодПредм^Учитель" и значениями - массивами объектов из
      // остальных полей, например:
      // objTopics["10Б-мальч^s110^pupkin"] =
      //    [{d: "d004", t: "Африка", h: "Учить термины", w: 2}, ...]
      let objTopics = {};
      for (let currT of resTopics) {
         if (!objTopics[`${currT.g}^${currT.s}^${currT.l}`])
            objTopics[`${currT.g}^${currT.s}^${currT.l}`] = [];
            
         objTopics[`${currT.g}^${currT.s}^${currT.l}`]
            .push({d: currT.d, t: currT.t, h: currT.h, w: currT.w});         
      }
      
      // Идем по этому объекту и формируем resp.content
      for (let currGST of Object.keys(objTopics)) {
         let keyArr = currGST.split('^');
         let grGetData = await grGet([keyArr[0], keyArr[1], keyArr[2]]);
         let grData = JSON.parse(grGetData);
         
         // Список учащихся и название предмета
         let contElem = {list: [], s: '', p: "Неизвестный N N", l: []};
         if (grData.pnList) contElem.list = grData.pnList;
         contElem.s    = keyArr[1];
         
         // Фамилия, имя, отчество педагога
         let tRes = await dbFind("staff", {Ulogin: keyArr[2]});
         if (res.length) contElem.p =
            `${tRes[0].Ufamil} ${tRes[0].Uname} ${tRes[0].Uotch}`;
            
         // Массив с датами, весами, темами, дз и отметками
         let topicsArr = objTopics[currGST];
         for (let currT of topicsArr) {
            let marks = grData[currT.d];
            if (!marks) {
               marks = [];
               for (let i=0; i<contElem.list.length; i++) marks[i] = '';
            }
            marks = marks.map(x => x.replace(/999/g, "зач"));
            contElem.l.push(
               {d:currT.d, w:currT.w, t:currT.t, h:currT.h, g:marks}
            );
         }
         // Добавляем еще в contElem.l все итоговые отметки
         for (let k of Object.keys(grData)) if (k.length == 5) {
            let marks = grData[k].map(
               x => x.replace(/^0$/g, "н/а").replace(/999/g, "зач")
            );
            contElem.l.push({d:k, w:0, t:'', h:'', g:marks})
         }
         
         // Сортируем по возрастанию дат
         contElem.l = contElem.l.sort((a,b) => (a.d > b.d) ? 1 : -1);
         
         resp.content.push(contElem);
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {console.info(e); return "none";}
};
