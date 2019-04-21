/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: РАСПРЕДЕЛЕНИЕ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

let distrClList = [], distrSbList = {}, distrThList = [], distrTutList = {};

// Назначение классного руководителя классу
const setTutor = (className, tutorLogin) => {
   let data = `{"t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", `
            + `"f": "setTutor", "z": ["${className}", "${tutorLogin}"]}`;
   navigator.sendBeacon('/', data);
}

// Формирование innerHTML таблицы "Классное руководство"
const createTutorTable = () => {
   let res = '', optList = "<option value='none'>Не назначен</option>";
   
   for (let currTeach of distrThList)
      optList += `<option value="${currTeach.login}">${currTeach.fio}</option>`;
   
   for (let currCl of distrClList) {
      let classString = `<tr>
         <td>${currCl}</td><td>
         <select onChange="setTutor('${currCl}', this.value)">
         ${optList}
         </select></td>
      </tr>`;
      if (distrTutList[currCl]) if (distrTutList[currCl] != "none")
         classString = classString.replace(
            `<option value="${distrTutList[currCl]}">`,
            `<option value="${distrTutList[currCl]}" selected>`
         );

      res += classString;
   }
   return res;
}

// Формирование контента странички
createSection("distrib", `
   <h3>Распределение педагогической нагрузки</h3>
   <h3>Классное руководство</h3>
   <table><tr><td><img src="static/preloader.gif"></td></tr></table>
`);

// Динамически подгружаем списки предметов, классов, классных руководителей
// и всех учителей (имя метода = имени пункта меню!)
getContent.distrib = async () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "subjList"
   }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   let subjListDop = JSON.parse(apiResp);
   distrSbList = subjSort({...subjDef, ...subjListDop});
   
   apiOpt.body = apiOpt.body.replace("subjList", "classesList");
   apiResp = await (await fetch("/", apiOpt)).text();
   distrClList = classSort(JSON.parse(apiResp));
   
   apiOpt.body = apiOpt.body.replace("classesList", "tutorsList");
   apiResp = await (await fetch("/", apiOpt)).text();
   distrTutList = JSON.parse(apiResp);
   
   apiOpt.body = apiOpt.body.replace("tutorsList", "teachList");
   apiResp = await (await fetch("/", apiOpt)).text();
   distrThList = userSort(JSON.parse(apiResp));
   
   dqs("#distrib table").innerHTML = createTutorTable();
}
