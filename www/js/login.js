/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ФОРМА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

dqs("#content").innerHTML += `
  <article>
    <h1>ЭЖ «Шкала»</h1>
    <input type="text" id="uLogin" placeholder="Логин" autofocus
           onKeyDown="if (event.keyCode == 13) submLogin();">
    <input type="password" id="uPwd" placeholder="Пароль"
           onKeyDown="if (event.keyCode == 13) submLogin();">
    <button type="button" onClick="submLogin();">Вход</button>
    <div id="loginWarn">Не введен логин/пароль!</div>
  </article>
`;
let uToken  = '', uLogin  = '', apiResp = '';
if (!uLogin) dqs("article").style.display = "block";

// Параметры запроса к API сервера
const apiOpt = {method: "POST", cache: "no-cache", body: ''};

// Обработка отправки логина и пароля
const submLogin = () => {
   uLogin = dqs("#uLogin").value.trim();
   if (!uLogin || !uPwd) dqs("#loginWarn").style.display = "block";
   else {
      dqs("#loginWarn").style.display = "none";
      (async () => {
         apiOpt.body = `{
            "l": "${uLogin}",
            "p": "${dqs('#uPwd').value.trim()}",
            "f": "login"            
         }`;         
         apiResp = await (await fetch("/", apiOpt)).text();
         if (apiResp == "none") {
            dqs("#loginWarn").innerHTML = "Неверный логин/пароль!";
            dqs("#loginWarn").style.display = "block";
         }
         else {
            // Чистим все переменные, содержащие пароль
            dqs('#uPwd').value = '';
            apiOpt.body = '';
            // Сохраняем токен и публикуем контент страницы
            uToken = JSON.parse(apiResp).token;
            dqs("article").style.display = "none";
            headerGen();
         }
      })();
   }
}
