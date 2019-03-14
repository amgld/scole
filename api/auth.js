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

// Проверка введенного юзером пароля или присланного через транспорт fetch
// токена путем сверки с хэшем пароля в базе и авторизация (определение
// полномочий) юзера. Токен отличается от пароля тем, что его первый символ
// это символ '¤'. Возвращает 0, либо JSON-строку с токеном и полномочиями:
// {
//    "token": "¤abcde",
//    "roles": ["admin", "teacher"],
// }
// Переменные salt и admPwd являются глобальными; addr - это ip юзера
module.exports = (login, pwd, addr) => {
   
   // Номер дня от начала юникс-эры
   let dt = ~~(Date.now()/(1000 * 3600 * 24));
   
   // Получаем из базы соответствующую запись по логину
   // if (login != "admin") {uRecord = ''};
   
   // Если пришел токен
   if (pwd[0] == '¤') {
      let tokenTrue = hash(dt+addr+login, salt);
   }
   
   // Если пришел пароль
   else {
      if (login == "admin") {
         if (hash(pwd, 'z') == admPwd)
            return {token: '¤'+hash(dt+addr+login, salt), roles: ["root"]};
         else return 0;
      }
      else return 0;
   }
};
