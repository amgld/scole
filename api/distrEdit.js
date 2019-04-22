/**
 *   РЕДАКТИРОВАНИЕ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// В запросе приходит [func, teacher, subj, className]
// (func это 'add' или 'del'); возвращает success или none
module.exports = argsObj => {   
   try {
      let func      = argsObj[0].trim(),
          teacher   = argsObj[1].trim(),
          subj      = argsObj[2].trim(),
          className = argsObj[3].trim();
      if (!func || !teacher || !subj || !className) return "none";
      
      console.info(argsObj);
      
      /*
      db["curric"].update(
         {type: "class", className: clName},
         {$set: {tutor: login}}, {}
      );
      */
      
      return "success";
   }
   catch(e) {return "none";}
};
