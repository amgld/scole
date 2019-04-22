/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: РАСПРЕДЕЛЕНИЕ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

let distrClList  = [], distrSbList = {}, distrThList = [],
    distrTutList = {}, distrObject = {};
    
// Добавление/удаление элемента учебной нагрузки
const editLoad = (func, teacher, subj, className) => {
   let data = `{"t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", `
            + `"f": "editLoad", "z": ["${func}", "^t^", "^s^", "^c^"]}`;
   data = data.replace("^t^", teacher).replace("^s^", subj)
              .replace("^c^", className);   

   if (func == "add") {
      teacher   = dqs("#distSelTeach").value;
      subj      = dqs("#distSelSubj" ).value;
      className = dqs("#distSelClass").value;
      
      if (!distrObject[teacher]) distrObject[teacher] = {};
      if (!distrObject[teacher][subj]) distrObject[teacher][subj] = [];
      
      if (!distrObject[teacher][subj].includes(className)) {
         navigator.sendBeacon('/', data);
         distrObject[teacher][subj].push(className);
      }
      else info(1, "Эти предмет и класс уже есть в нагрузке.");
   }
   else {
      navigator.sendBeacon('/', data);
      distrObject[teacher][subj] =
      distrObject[teacher][subj].filter(c => c != className);
   }
   
   setThLoadTable();
}
    
// Формирование таблицы с педагогической нагрузкой данного учителя
const setThLoadTable = () => {
   let teach   = dqs("#distSelTeach").value,
       pedLoad = distrObject[teach],
       inner   = '';
       
   if (!teach) {
      dqs("#teachLoad").innerHTML =
         "<tr><td style='border:none'>Учитель не выбран.</td></tr>";
      return;
   }
   
   if (pedLoad) {
      for (let subjKod of Object.keys(pedLoad)) {
         pedLoad[subjKod] = classSort(pedLoad[subjKod]);
         for (let currClass of pedLoad[subjKod]) {
            inner += `<tr>
               <td>${distrSbList[subjKod]}</td><td>${currClass}</td>
               <td title="Удалить"
                   onClick="editLoad('del',
                   '${teach}', '${subjKod}', '${currClass}')">&#10060;</td>
            </tr>`.replace(/\n/g, ' ');
         }
      }
   }
   inner = inner ? inner :
      "<tr><td style='border:none'>Нагрузки не найдено.</td></tr>";
      
   dqs("#teachLoad").innerHTML = inner;
}

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
   <select id="distSelTeach" onChange="setThLoadTable()"></select>
   <table id="teachLoad"></table>
   <select id="distSelSubj"></select>
   <select id="distSelClass"></select>
   <button type="button"
      id="addTeachLoad" onClick="editLoad('add')">Добавить</button>
      
   <h3>Классное руководство</h3>
   <table id="tutTbl"><tr><td><img src="static/preloader.gif"></td></tr></table>   
`);

// Динамически подгружаем списки предметов, классов, классных руководителей
// и всех учителей (имя метода = имени пункта меню!)
getContent.distrib = async () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "subjList"
   }`};
   
   // Объект со списком предметов
   let apiResp = await (await fetch("/", apiOpt)).text();
   let subjListDop = {};
   if (apiResp != "none") subjListDop = JSON.parse(apiResp);
   distrSbList = subjSort({...subjDef, ...subjListDop});
   
   // Массив со списком классов
   apiOpt.body = apiOpt.body.replace("subjList", "classesList");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrClList = classSort(JSON.parse(apiResp));
   
   // Объект со списком классных руководителей
   apiOpt.body = apiOpt.body.replace("classesList", "tutorsList");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrTutList = JSON.parse(apiResp);
   
   // Объект со списком всех учителей
   apiOpt.body = apiOpt.body.replace("tutorsList", "teachList");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrThList = userSort(JSON.parse(apiResp));
   
   // Объект с педагогической нагрузкой всех учителей
   // {"pupkin": {"s110": ["8Б", "10Ж"], "d830": ["8Б"]}, "ivanov": ...}
   apiOpt.body = apiOpt.body.replace("teachList", "getDistr");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrObject = JSON.parse(apiResp);
   
   // Формируем контент таблицы с классными руководителями
   dqs("#tutTbl").innerHTML = createTutorTable();
   
   // Формируем селект выбора учителя
   let dSelThInner = "<option value=''>&#9947; Выберите учителя</option>";
   for (let teach of distrThList)
      dSelThInner += `<option value="${teach.login}">${teach.fio}</option>`;
   dqs("#distSelTeach").innerHTML = dSelThInner;
   
   // Формируем селект выбора предмета
   let dSelSbInner = '';
   for (let kod of Object.keys(distrSbList))
      dSelSbInner += `<option value="${kod}">${distrSbList[kod]}</option>`;
   dqs("#distSelSubj").innerHTML = dSelSbInner;
   
   // Формируем селект выбора класса
   let dSelClInner = '';
   for (let cls of distrClList) dSelClInner += `<option>${cls}</option>`;
   dqs("#distSelClass").innerHTML = dSelClInner;
   
   // Очищаем таблицу с педагогической нагрузкой
   dqs("#teachLoad").innerHTML =
      "<tr><td style='border:none'>Учитель не выбран.</td></tr>";
}
