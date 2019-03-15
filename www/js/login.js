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
    <img>
    <input type="tsxt" id="uCpt" placeholder="Код с картинки"
           onKeyDown="if (event.keyCode == 13) submLogin();">
    <button type="button" onClick="submLogin();">Вход</button>
    <div id="loginWarn">Не введен логин/пароль/код!</div>
  </article>
`;
let uToken  = '', uLogin  = '', uCpt = '', apiResp = '', captId = 0;
if (!uLogin) dqs("article").style.display = "block";

// Параметры запроса к API сервера
const apiOpt = {method: "POST", cache: "no-cache", body: ''};

// Получаем капчу с сервера и ее Id
const getCapt = async () => {
   let cptResp = await fetch("/cpt.a");
   let cptImg  = await cptResp.blob();
   captId      = cptResp.headers.get("X-Cpt").trim();
   dqs("article img").src = URL.createObjectURL(cptImg);
};
getCapt();

// Обработка отправки логина, пароля и капчи
const submLogin = () => {
   uLogin = dqs("#uLogin").value.trim();
   uCpt = dqs("#uCpt").value.trim();
   if (!uLogin || !uPwd || !uCpt) dqs("#loginWarn").style.display = "block";
   else {
      dqs("#loginWarn").style.display = "none";
      (async () => {
         apiOpt.body = `{
            "l":  "${uLogin}",
            "p":  "${dqs('#uPwd').value.trim()}",
            "f":  "login",
            "ci": "${captId}",
            "c":  "${uCpt}"
         }`;         
         apiResp = await (await fetch("/", apiOpt)).text();
         if (apiResp == "none") {
            dqs("#loginWarn").innerHTML = "Неверный логин/пароль/код!";
            dqs("#loginWarn").style.display = "block";
            getCapt();
         }
         else {
            // Чистим все переменные, содержащие пароль и Id капчи
            dqs('#uPwd').value = '';
            apiOpt.body = '';
            captId = 0;
            // Сохраняем токен и публикуем контент страницы
            uToken = JSON.parse(apiResp).token;
            dqs("article").style.display = "none";
            headerGen();
         }
      })();
   }
}
