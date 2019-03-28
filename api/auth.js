/**
 *   АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Проверка введенного юзером пароля или присланного через транспорт fetch
// токена путем сверки с хэшем пароля в базе и авторизация (определение
// полномочий) юзера. Токен отличается от пароля тем, что его первый символ
// это символ '¤'. Возвращает 0, либо JSON-строку с токеном (при первичной
// авторизации по паролю) и полномочиями:
// {
//    "token": "¤abcde",
//    "roles": ["admin", "teacher"],
// }
// Переменные salt и admPwd являются глобальными; addr - это ip юзера
// tip          - staff, pupil либо par (родитель)
// cptId        - Id капчи (таймстамп)
// capt         - собственно капча (6 цифр)
// captchaIdArr - глобальный массив, содержащий активные Id капчей
// captNumGen   - глобальная функция, генерирующая капчу по ее Id
module.exports = (tip, login, pwd, cptId, capt, addr) => {
   
   // Номер дня от начала юникс-эры
   let dt = ~~(Date.now()/(1000 * 3600 * 24));
   
   let tokenTrue = '¤' + hash(dt+addr+login, salt);   
   
   // Если пришел токен
   if (pwd[0] == '¤') {
      if (pwd == tokenTrue) {
         
         // Если он администратор
         if (login == "admin") return {roles: ["root"]};         
      }
      else return 0;
   }
   
   // Если пришел пароль
   else {
      // Сначала проверяем капчу; в любом случае убиваем ее
      let cptIdIndex = captchaIdArr.indexOf(Number(cptId));
      if (cptIdIndex > -1) {
         captchaIdArr.splice(cptIdIndex, 1);
         if (captNumGen(cptId) != capt) return 0;         
      }
      else return 0;
      
      // Если он утверждает, что он администратор
      if (login == "admin") {
         if (hash(pwd, 'z') == admPwd)
            return {token: '¤'+hash(dt+addr+login, salt), roles: ["root"]};
         else return 0;
      }
      else {
         // Получаем из базы соответствующую запись по логину
         // uRecord = '';
         return 0;
      }
   }
}
