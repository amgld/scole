/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ФОРМА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

elems.loginElem = document.createElement("article");
elems.loginElem.innerHTML = `
   <h1>ЭЖ «Шкала»</h1>
   <input type="text" readonly id="uCateg" value="Учащийся"
          onClick="turnCateg()">
   <input type="text" id="uLogin" placeholder="Логин"
          onKeyDown="if (event.keyCode == 13) submLogin()">
   <input type="password" id="uPwd" placeholder="Пароль"
          onKeyDown="if (event.keyCode == 13) submLogin()">
   <img>
   <input type="tsxt" id="uCpt" placeholder="Код с картинки"
          onKeyDown="if (event.keyCode == 13) submLogin()">
   <button type="button" onClick="submLogin()">Вход</button>
   <div id="loginWarn">Не введен логин/пароль/код!</div>
`;
dqs("#content").appendChild(elems.loginElem);

let uToken = '', uCateg = '', uLogin = '', uCpt = '', apiResp = '', captId = 0,
    uTipes = {"Учащийся": "pupil", "Сотрудник": "staff", "Родитель": "par"},
    uTutorCls = [], uTeachLoad = {}; 
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

// Обработка кликания на поле категории пользователя (циклическое переключение)
const turnCateg = () => {
   let cond = dqs("#uCateg").value;
   let valNew = (cond == "Учащийся") ?
      "Сотрудник" : ((cond == "Сотрудник") ? "Родитель" : "Учащийся");
   dqs("#uCateg").value = valNew;
   dqs("#uLogin").focus();
}

// Обработка отправки логина, пароля и капчи
const submLogin = async () => {
   uLogin = dqs("#uLogin").value.trim();
   uCateg = uTipes[dqs("#uCateg").value];
   uCpt = dqs("#uCpt").value.trim();
   if (!uLogin || !uPwd || !uCpt) dqs("#loginWarn").style.display = "block";
   else {
      dqs("#loginWarn").style.display = "none";
      apiOpt.body = `{
         "t":  "${uCateg}",
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
            
         // Сохраняем токен, перечень классов, где он классный руководитель,
         // его педагогическую нагрузку
         let apiRespObj = JSON.parse(apiResp);
         uToken         = apiRespObj.token;
         uTutorCls      = apiRespObj.tutClss   || [];
         uTeachLoad     = apiRespObj.teachLoad || {};
            
         // Публикуем контент страницы
         dqs("article").style.display = "none";
         headerGen();
      }
   }
}
dqs("#uLogin").focus();
