/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЗАМЕТКИ УЧИТЕЛЕЙ ДЛЯ РОДИТЕЛЕЙ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Текущий список класса
let ntClList = [];

// Показ всех заметок одному ученику
const ntShow = async (pupil) => {
   dqs("#ntResult").innerHTML = `<h3>Заметки для ${pupil} типа показаны</h3>`;
}

// Добавление заметки (в аргументе что-то типа ivanov^Иванов И. или 8Б-мальч^)
const ntAdd = async (pupil) => {
   alert (`Заметка для ${pupil} типа добавлена.`);
}

// Формирование списка детей в селекте выбора учащегося
const ntPupListShow = async () => {
   let clName = dqs("#ntSelClass").value;
   let ntResp = await apireq("gradesGet", [clName, '', "a"]);
   if (ntResp == "none") {info(1, "Не могу получить список учащихся"); return;}
   let ntObj = JSON.parse(ntResp);
   let pupLgnArr = ntObj.puList ? ntObj.puList : []; // логины детей
   
   if (pupLgnArr.length) {
      let selPupilInner = `<option value="${clName}^">ВСЕМ УЧАЩИМСЯ</option>`;
      for (let i=0; i<pupLgnArr.length; i++) selPupilInner +=
         `<option value="${pupLgnArr[i]}^${ntObj.pnList[i]}">` +
         `${ntObj.pnList[i]}</option>`;
     
      dqs("#ntSelPupil").innerHTML = selPupilInner;
   }
   else {
      dqs("#ntSelPupil").innerHTML = '';
      info(0, "В этом классе (группе) нет учащихся!");
   }
}

// Формирование контента страницы
createSection("notes", `
   <div id="ntAddForm">
   <h3>Добавление новой заметки</h3>
   <select id="ntSelClass" onChange="ntPupListShow()"></select>
   <select id="ntSelPupil"></select>
   <p>Форма добавления заметки</p>
   </div>
   
   <h3>Все заметки</h3>
   <div id="ntResult"><img src='/static/preloader.gif'></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.notes = async () => {
   
   let ntRole = dqs("#selRole").value;   
   
   // Если он учащийся или родитель, показываем заметки ему и классу
   if (ntRole == "pupil" || ntRole == "parent") {
      dqs("#ntAddForm").style.display  = "none";
      ntShow(uLogin);
   }  
   else {
      let selClassInner = '';
      
      // Если он классный руководитель, показываем ему его классы
      if (ntRole == "tutor")
         for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
      
      // Если он администратор, показываем ему все классы
      else if (ntRole == "admin") {
         let apiResp = await apireq("classesList");
         if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
         let ntAllClasses = classSort(JSON.parse(apiResp));
         for (let cl of ntAllClasses)
            selClassInner += `<option>${cl}</option>`;
      }
      // Если он учитель, показываем ему все классы и подгруппы его нагрузки
      else if (ntRole == "teacher") {
         let ntClasses = classSort(Object.keys(uTeachLoad));
         for (let cl of ntClasses) selClassInner += `<option>${cl}</option>`;
      }
      dqs("#ntSelClass").innerHTML = selClassInner;
      ntPupListShow(); // показываем список учащихся этого класса или группы
   }
};
