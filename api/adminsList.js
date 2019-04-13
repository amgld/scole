/**
 *   ВЫДАЧА СПИСКА АДМИНИСТРАТОРОВ ЭЖ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает none или массив найденных администраторов,
// где каждый администратор - это объект (стандартный для коллекции staff)
module.exports = async () => {
   try {
      let res = await dbFind("staff", {admin: true});
      return JSON.stringify(res);
   }
   catch(e) {return "none";}
};
