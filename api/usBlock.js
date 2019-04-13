/**
 *   БЛОКИРОВАНИЕ/РАЗБЛОКИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// В запросе приходит массив [логин, статус], где статус - это block или unblock
// Возвращает "success", "already" (если запрашиваемый статус уже
// установлен), либо "none", если пользователя с таким логином не существует
module.exports = async req => {   
   try {
      let login = req[0], oper = req[1];
      if (!login || !oper) return "none";
      
      // Проверяем, есть ли вообще пользователь с таким логином и кто он
      let collect = "pupils";      
      let res = await dbFind("pupils", {Ulogin: login}); 
      if (!res.length) {
         res = await dbFind("staff", {Ulogin: login});
         if (res.length) collect = "staff";
         else return "none";
      }
      
      // Получаем его текущий статус (заблокирован или нет)
      let user = res[0], status = user.block || false;
      
      // Устанавливаем/сбрасываем статус и возвращаем результат
      if (oper == "block") {
         if (status) return "already";
         user.block = true;
         db[collect].update({Ulogin: login}, user, {});
      }
      else {
         if (!status) return "already";
         delete user.block;
         db[collect].update({Ulogin: login}, user, {});
      }     
      return "success";
   }
   catch(e) {return "none";}
};
