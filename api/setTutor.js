/**
 *   НАЗНАЧЕНИЕ КЛАССУ КЛАССНОГО РУКОВОДИТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// В запросе приходит ["8Б", "pupkin"]; возвращает "noreply"
module.exports = newTutor => {   
   try {
      let clName = newTutor[0].trim(), login = newTutor[1].trim();
      if (!clName || !login) return "noreply";
      
      db["curric"].update(
         {type: "class", className: clName},
         {$set: {tutor: login}}, {}
      );
      
      return "noreply";
   }
   catch(e) {return "noreply";}
};
