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
   
   let reqObj = [];
   if (/[А-Я]/.test(clORpup)) reqObj = [clORpup, '']; // запрошен весь класс
   else                       reqObj = ['', clORpup]; // запрошен один ученик
   
   // Получаем исходный массив объектов с данными о посещаемости
   // [{d: "d730", c: "11Б", s: s430, t: sidorov, p: ivanov, abs: 2}, ...]   
   let apiResp = await apireq("absentGet", reqObj);
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let absentArr = JSON.parse(apiResp);
   
   // Получаем объект с данными об уважительных причинах пропусков уроков:
   // {
   //    ivanov: [["2019-09-02", "2019-09-13"], ...],
   //    petrov: ...
   // }
   let apiResp = await apireq("sprResp", reqObj);
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let respectObj = JSON.parse(apiResp);
   
   alert(JSON.stringify(respectObj));
}

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
