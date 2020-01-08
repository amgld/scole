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
//         "s":    "Русский язык",
//         "p":    "Кулебякин Иван Петрович",
//         "l": [
//            {"d":"03.09","w":2,"t":"Африка","h":"№ 234", "g":["3 4н", ...]},
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
      
      // Список предметов, подгрупп и фамилий учителей данного класса типа
      // curric = [["Физика", "10Б-инф1", "Козлов Иван Петрович"], ...]
      
      // Цикл по списку предметов
      
      
      return JSON.stringify(resp);
   }
   catch(e) {console.info(e); return "none";} // !!!!!!!!!!! не забыть удалить!
};
