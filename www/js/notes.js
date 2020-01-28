/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ЗАМЕТКИ УЧИТЕЛЕЙ ДЛЯ РОДИТЕЛЕЙ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Максимальное число знаков в заметке
const NTVAL = 200;

// Текущий список класса
let ntClList = [];

// Массив с публикуемыми заметками
let notes = [];

// Фокус на поле добавления новой заметки
const inpFocus = () => dqs("#ntAddForm textarea").focus();

// Подсчет знаков в поле добавления заметки
const ntCount = () => {
   let val = dqs("#ntAddForm textarea").value.length;
   dqs("#ntAddForm span:first-child").innerHTML = val;
   dqs("#ntAddForm span:nth-child(2)").innerHTML = NTVAL - val;
}

// Показ всех заметок одному ученику
const ntShow = async (pupil) => {
   dqs("#ntResult").innerHTML = `<h3>Заметки для ${pupil} типа показаны</h3>`;
}

// Добавление заметки
const ntAdd = async () => {
   let ntRcpt = dqs("#ntSelPupil").value, // uLogin
       ntText = dqs("#ntAddForm textarea").value.trim();
   alert (`Кому: ${ntRcpt}; текст: ${ntText}`);
}

// Формирование списка детей в селекте выбора учащегося
const ntPupListShow = async () => {
   let clName = dqs("#ntSelClass").value;
   let ntResp = await apireq("gradesGet", [clName, '', "a"]);
   if (ntResp == "none") {info(1, "Не могу получить список учащихся"); return;}
   let ntObj = JSON.parse(ntResp);
   let pupLgnArr = ntObj.puList ? ntObj.puList : []; // логины детей
   
   if (pupLgnArr.length) {
      let selPupilInner = `<option value="${clName}">ВСЕМ УЧАЩИМСЯ</option>`;
      for (let i=0; i<pupLgnArr.length; i++) selPupilInner +=
         `<option value="${pupLgnArr[i]}">${ntObj.pnList[i]}</option>`;
     
      dqs("#ntSelPupil").innerHTML = selPupilInner;
      inpFocus();
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
   <select id="ntSelPupil" onChange="inpFocus()"></select>
   <p>Введено <span>0</span> зн.; осталось <span>${NTVAL}</span> зн.</p>
   <textarea placeholder="Текст заметки (не более ${NTVAL} знаков)"
      maxlength="${NTVAL}" onKeyUp=ntCount()></textarea>
   <button type="button" onClick="ntAdd()">Сохранить</button>
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
      inpFocus();      // фокус на поле ввода новой заметки
   }
};
