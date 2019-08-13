/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК УЧЕТА ПОСЕЩАЕМОСТИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Текущий список класса
let absClList = [];

// Функция получает данные о посещаемости путем запроса к API (массив объектов
// вида {d: "d730", c: "11Б", s: s430, t: sidorov, p: ivanov, abs: 2}),
// получает справки об уважительных причинах пропуска уроков, все это
// обсчитывает и публикует на странице. Аргумент - либо логин ученика,
// либо наименование класса типа 11Б
const absShow = async (clORpup) => {
   
   // Получаем исходный массив с данными о посещаемости
   let reqObj = [];
   if (/[А-Я]/.test(clORpup)) reqObj = [clORpup, '']; // запрошен весь класс
   else                       reqObj = ['', clORpup]; // запрошен один ученик
   let apiResp = await apireq("absentGet", reqObj);
   if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
   let absentArr = JSON.parse(apiResp);
   
   alert(JSON.stringify(absentArr));
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
   <div id="absResult"></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.absent = async () => {
   
   let absRole = dqs("#selRole").value;   
   
   // Если он учащийся или родитель, показываем ему только его пропуски
   if (absRole == "pupil" || sprRole == "parent") {
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
         let apiResp = await apireq("pupilsList", [clName]);
         if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
         let absAllClasses = JSON.parse(apiResp);
         for (let cl of absAllClasses)
            selClassInner += `<option>${cl}</option>`;
      }
      dqs("#absSelClass").innerHTML = selClassInner;
      absPupListShow(); // показываем список детей
   }
};
