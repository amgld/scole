/**
 *   ВЫДАЧА РАСПРЕДЕЛЕНИЯ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает none или объект
// {"pupkin": {"s110": ["8Б", "10Ж"], "d830": ["8Б"]}, "ivanov": ...}
module.exports = async () => {
   let resp = {};
   try {
      let res = await dbFind("distrib", {});
      if (res.length) for (let tObj of res) resp[tObj.tLogin] = tObj.tLoad;
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
