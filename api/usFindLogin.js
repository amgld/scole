/**
 *   ПРОВЕРКА ЗАНЯТОСТИ ЛОГИНА
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// В запросе приходит логин
// Возвращает none (ошибка на сервере), free (свободен) или busy (занят)
module.exports = async login => {
   try {
      login = login.trim().substr(0, 50);
      let dbResult1 = await dbFind("pupils", {Ulogin: login}),
          dbResult2 = await dbFind("staff",   {Ulogin: login});

      if (dbResult1.length || dbResult2.length) return "busy"
      else                                      return "free";
   }
   catch(e) {return "none";}
};
