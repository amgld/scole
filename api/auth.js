/**
 *   АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Функция изготавливает хэш длины 24 из строки str с солью slt
let hash = (str, slt) => {   
   let
      alph = "0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz",
      char,
      strNew,
      h = 0,
      pass = '';
   for (let j = 0; j < 24; j++) {
      strNew = slt + j + str;
      for (let i = 0; i < strNew.length; i++) {
         char = strNew.charCodeAt(i);
         h = ((h << 5) - h) + char;
      }
      pass += alph[Math.abs(h) % alph.length];
   }
   return pass;
}

// Проверка введенного юзером пароля путем сверки с хэшем пароля в базе
// и авторизация (определение полномочий) юзера. Возвращает 0 либо JSON-строку
// с полномочиями юзера вида
// {    
//    "roles": ["admin", "teacher"],
// }
// Переменные salt и admPwd являются глобальными
module.exports = (login, pwd) => {
   if (login == "admin") {
      if (hash(pwd, 'z') == admPwd) return {roles: ["root"]};
      else return 0;
   }
   else return 0;
};
