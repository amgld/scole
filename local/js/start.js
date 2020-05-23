/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЗАГРУЗКА СКРИПТОВ И НАЧАЛО РАБОТЫ (ЛОКАЛЬНО)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

let uRoles = ["admin"], uLogin = "admin";

const start = () => {
   document.querySelector("#content").innerHTML = '';
   let requires = [
      "../www/js/ini",      "js/iniLocal",         "js/viewExportLocal",
      "js/exportLocal",     "js/apiLocal",         "../www/js/info",
      "../www/js/reglib",   "../www/js/register",  "../www/js/absent",
      "../www/js/distrib",  "../www/js/achsheet",  "../www/js/stat",
      "../www/js/vdreg",     "../www/js/header"
   ]; 
  
   let scriptElem;
   for (let scrName of new Set(requires)) {
      scriptElem = document.createElement("script");
      scriptElem.src = `${scrName}.js`;
      scriptElem.async = false;
      document.body.appendChild(scriptElem);
   }         
   scriptElem.onload = () => {
      headerGen();
      dqs("#progName").innerHTML += ": Просмотр архива (локально)";
   }
}
