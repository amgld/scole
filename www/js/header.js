/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ХИДЕР СТРАНИЦ ЖУРНАЛА
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Показ блоков страницы в зависимости от выбранного пункта меню
const blockShow = menuItem => {
   // Подсвечиваем выбранный пункт меню
   for (let mn of document.querySelectorAll("nav li"))
      mn.classList.remove("sel");
   dqs(`#mn${menuItem}`).className = "sel";
   
   // Сворачиваем мобильное меню
   if (dqs("header img").src.includes("MobClose")) dqs("header img").click();
   
   // Показываем соответствующий блок контента
   for (let sect of document.querySelectorAll("section"))
      sect.style.display = "none";
   dqs(`#${menuItem}`).style.display = "block";
   
   // Вызываем необходимую для этого блока функцию для подгрузки контента
   // (функции подгрузки для каждого блока определены в самих скриптах блоков)
   if (getContent[menuItem]) getContent[menuItem]();
};

// Генерирование меню в зависимости от выбранной роли пользователя
// (константа menuItems определена в ini.js)
const menuGen = () => {
   let role = dqs("#selRole").value;
   let res = "<ul>";
   for (let mi of menuItems[role])
      res += `<li id="mn${mi[0]}" onClick="blockShow('${mi[0]}')">${mi[1]}</li>\n`;
   res += "</ul>";
   dqs("nav").innerHTML = res;
   blockShow(menuItems[role][0][0]);
   dqs("#selRole").blur();
};

// Формирование опций для селекта выбора роли пользователя
// (константа roleNames определена в ini.js)
const headerOptGen = roles => {
   let res = '';
   for (let i = 0; i < roles.length; i++)
      res += `<option value=${roles[i]}>${roleNames[roles[i]]}</option>`;
   return res;
};

// Обработка кликания на иконке мобильного меню
const showMenuMob = () => {
   let mmiDisp = dqs("nav").style.display || "none";
   dqs("nav").style.display =
      (mmiDisp == "none") ? "block" : "none";
   dqs("header img").src =
      (mmiDisp == "none") ? "static/menuMobClose.svg" : "static/menuMob.svg";
}

// Формирование хидера и включение футера
const headerGen = () => {
   let apiRespObj = JSON.parse(apiResp);
   let rl = apiRespObj.roles;
   dqs("#content").innerHTML += `
      <header>
         <img src="static/menuMob.svg" title="Меню" onClick="showMenuMob()">
         <span id="progName">ЭЖ «Шкала»</span>
         <span>${uLogin}:<span>
         <select id="selRole" onChange="menuGen()" title="Роль пользователя">
            ${headerOptGen(rl)}
         </select>
         <span id="chPwd" title="Сменить пароль">&#9874;</span>
         <a href='' title="Выход">&#9635;</a>
      </header>
      <nav></nav>
   `;
   menuGen();
   (async () => {
      let adminCont = await (await fetch("/a.a")).text();
      let versCont = await (await fetch("/history.html", {method: "GET"})).text();
      versCont = versCont.split("<pre>")[1].trim().split(' ')[0];
      dqs("footer").innerHTML += `Адм.: ${adminCont} &bull;
         <a href="history.html" target="_blank">v.&nbsp;${versCont}</a>`;
      dqs("footer").style.display = "block";
   })();   
};
