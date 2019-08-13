/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК УЧЕТА ПОСЕЩАЕМОСТИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Текущий список класса
let absClList = [];

// Функция получает данные о посещаемости и об уважительных причинах пропусков
// уроков, все это обсчитывает и публикует на странице. Аргумент - либо логин
// ученика, либо наименование класса типа 11Б
const absShow = async (clORpup) => {
   
   dqs("#absResult").innerHTML = "<img src='/static/preloader.gif'>";
   
   let reqObj = [], onePupil = false;
   if (/[А-Я]/.test(clORpup)) reqObj = [clORpup, ''];   // запрошен весь класс
   else     {onePupil = true; reqObj = ['', clORpup];}  // запрошен один ученик
   
   // Получаем исходный массив absentArr объектов с данными о посещаемости
   // (учитель Сидоров, учащийся Иванов)
   // [{d: "d730", c: "11Б", s: s430, t: sidorov, p: ivanov, abs: 2}, ...]   
   let apiResp = await apireq("absentGet", reqObj);
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let absentArr = JSON.parse(apiResp);
   
   // Получаем объект respectObj с данными об уважительных причинах пропусков:
   // {
   //    ivanov: [["d002", "d013"], ...],
   //    petrov: ...
   // }
   apiResp = await apireq("sprResp", reqObj);
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let respectObjApi = JSON.parse(apiResp);
   // Переформатируем из формата 2019-09-02, полученного от API, в формат d002
   let respectObj = {};
   for (let pup of Object.keys(respectObjApi)) {
      respectObj[pup] = [];
      for (let para of respectObjApi[pup]) {
         para[0] = dateConv(para[0]);
         para[1] = dateConv(para[1]);
         respectObj[pup].push([para[0], para[1]]);
      }
   }
   
   // Подсчет числа пропусков (общего и по уважительной) всех учеников
   // по учебным периодам; результат в объекте absVal:
   // {
   //    ivanov: {d628a: [34, 28], ...},
   //    petrov: {d628a: [56, 13], ...},
   //    ...
   // }
   let absVal = {}, pattern = {}; // шаблон объекта одного ученика
   for (let itName of Object.keys(DTSIT)) {
      pattern[itName] = [0, 0];
   }
      
   for (let propusk of absentArr) {
      
      // Сначала считаем все пропуски
      if (!absVal[propusk.p]) absVal[propusk.p] = {...pattern};
      for (let itName of Object.keys(DTSIT)) {
         if (propusk.d >= DTSIT[itName][2] && propusk.d <= DTSIT[itName][3])
            absVal[propusk.p][itName][0] += propusk.abs; // все пропуски
      }
      
      // Теперь считаем уважительные, цикл по объекту respectObj
      if (!respectObj[propusk.p]) continue; // если у него нет справок вообще
      for (let paraDat of respectObj[propusk.p]) {
         if (propusk.d >= paraDat[0] && propusk.d <= paraDat[1]) // если он ув.
            for (let itName of Object.keys(DTSIT)) {
               if (propusk.d >= DTSIT[itName][2] && propusk.d <= DTSIT[itName][3])
                  absVal[propusk.p][itName][1] += propusk.abs;
            }
      }
   } // конец подсчета общего числа пропусков всех учеников
   
   // Публикация данных о посещаемости
   let dann = '';   
   if (Object.keys(absVal).length) {
      
      // Сначала публикуем таблицу со сводными данными
      dann = "<table border=1><tr><th rowspan=2> </th>";
      let str1 = '', str2 = '';
      for (let itName of Object.keys(DTSIT)) {
         str1 += `<th colspan=2>${DTSIT[itName][0]}</th>`;
         str2 += "<th>всего</th><th>по ув.</th>";
      }
      dann += `${str1}</tr><tr>${str2}</tr>`;
      
      for (let pupLogin of Object.keys(absVal)) {
         dann += `<tr><td>${pupLogin}</td>`;
         for (let itName of Object.keys(DTSIT))
            dann += `<td>${absVal[pupLogin][itName][0]}</td>`
                  + `<td>${absVal[pupLogin][itName][1]}</td>`;
         dann += "</tr>";
      }      
      dann += "</table>"
   }
   else dann = "<h3>Пропусков уроков нет</h3>";
   dqs("#absResult").innerHTML = dann;
   
} // конец функции подсчета и публикации данных о посещаемости

// Формирование списка детей в селекте выбора учащегося
const absPupListShow = async () => {
   let clName = dqs("#absSelClass").value;
   let apiResp = await apireq("pupilsList", [clName]);
   if (apiResp != "none") {
      let absClList = JSON.parse(apiResp);
      let selPupilInner = `<option value="${clName}">ВЕСЬ КЛАСС</option>`;
      for (let pup of absClList)
         selPupilInner += `<option value="${pup[1]}">${pup[0]}</option>`;
      dqs("#absSelPupil").innerHTML = selPupilInner;
      absShow(clName); // показываем пропуски всего класса
   }   
   else info(1, "Ошибка на сервере");
}

// Формирование контента страницы
createSection("absent", `
   <select id="absSelClass" onChange="absPupListShow()"></select>
   <select id="absSelPupil" onChange="absShow(this.value)"></select>
   <div id="absResult"><img src='/static/preloader.gif'></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.absent = async () => {
   
   let absRole = dqs("#selRole").value;   
   
   // Если он учащийся или родитель, показываем ему только его пропуски
   if (absRole == "pupil" || absRole == "parent") {
      dqs("#absSelClass").style.display = "none";
      dqs("#absSelPupil").style.display = "none";
      absShow(uLogin);
   }  
   else {
      let selClassInner = '';
      
      // Если он классный руководитель, показываем ему его классы
      if (absRole == "tutor")
         for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
      
      // Если он администратор, показываем ему все классы
      else if (absRole == "admin") {
         let apiResp = await apireq("classesList");
         if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
         let absAllClasses = classSort(JSON.parse(apiResp));
         for (let cl of absAllClasses)
            selClassInner += `<option>${cl}</option>`;
      }
      dqs("#absSelClass").innerHTML = selClassInner;
      absPupListShow(); // показываем список детей
   }
};
