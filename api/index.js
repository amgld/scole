/**
 *   API ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА»
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

const auth = require("./auth");

// Полномочия (доступные функции) пользователей в зависимости от их роли
const RIGHTS = {
   "root":    ["usList", "admAdd", "admDel", "userAdd", "userEdit", "userDel"],
   "admin":   ["usList", "userAdd", "userEdit", "userDel"],
   "teacher": [],
   "tutor":   [],
   "pupil":   [],
   "parent":  []
};
for (let item in RIGHTS) RIGHTS[item].push("login");

module.exports = post => {   
   
   // Разбираем переданные в аргументе POST-данные
   let postDt = {};   
   try {postDt = JSON.parse(post);} catch (e) {return "none";}   
   if (!postDt.f) postDt.f = "noFunc";
   if (!postDt.l) postDt.l = "noLogin";
   if (!postDt.p) postDt.p = "noPassw";
      
   // Проверяем результаты аутентификации юзера
   let authResult = auth(postDt.l, postDt.p);
   if (!authResult) return "none";
      
   // Проверяем полномочия юзера на запрашиваемую функцию
   if (!authResult["roles"].some(r => RIGHTS[r].includes(postDt.f)))
      return "none";
      
   // Проверяем полномочия юзера на запрашиваемые параметры
      
   // Реализуем соответствующую функцию api в зависимости от переменной f      
   switch (postDt.f) {
         
      // Запрос результатов авторизации
      case "login":
         return JSON.stringify(authResult);
         break;
            
      default:
         return "none";
         break;
   }   
}

