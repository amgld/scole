/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЗАГРУЗКА СКРИПТОВ И НАЧАЛО РАБОТЫ (ЛОКАЛЬНО)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

let uRoles = ["admin"], uLogin = "admin";

const start = () => {
   dqs("#content").innerHTML = '';
   let requires = ["info"];
   for (let rlItem of menuItems["admin"]) requires.push(rlItem[0]);
   requires.push("header");
   
   let scriptElem;
   for (let scrName of new Set(requires)) {
      scriptElem = document.createElement("script");
      scriptElem.src = `../www/js/${scrName}.js`;
      scriptElem.async = false;
      document.body.appendChild(scriptElem);
   }         
   scriptElem.onload = () => headerGen();
}
