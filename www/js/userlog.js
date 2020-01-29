/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ПРОСМОТР ЛОГА ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЕЙ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Показ лога (аргумент - тип: 0 - дети, 1 - сотрудники, 2 - все)
const ulShow = async tip => {
   let source = ["#ulSelPupil", "#ulSelStaff", "#ulDt"];
   let name   = dqs(source[tip]).value;
   dqs("#ulResult").innerHTML = `<p>Лог: ${name}</p>`;
}

// Формирование списка детей в селекте выбора учащегося
const ulPupListShow = async () => {
   let clName = dqs("#ulSelClass").value;
   let resp = await apireq("gradesGet", [clName, '', "a"]);
   if (resp == "none") {info(1, "Не могу получить список учащихся"); return;}
   let ulObj = JSON.parse(resp);
   let pupLgnArr = ulObj.puList ? ulObj.puList : []; // логины детей
   
   if (pupLgnArr.length) {
      let selPupilInner = `<option value="${clName}">ВЕСЬ КЛАСС</option>`;
      for (let i=0; i<pupLgnArr.length; i++) selPupilInner +=
         `<option value="${pupLgnArr[i]}">${ulObj.pnList[i]}</option>`;     
      dqs("#ulSelPupil").innerHTML = selPupilInner;
   }
   else {
      dqs("#ulSelPupil").innerHTML = '';
      info(0, "В этом классе (группе) нет учащихся!");
   }
}

// Формирование контента страницы (regNow, regYst, regYfin определены в ini.js)
createSection("userlog", `
   <h3>Выбор фильтра для просмотра лога авторизации</h3>
   <p>Просмотр лога класса или одного учащегося (родителя)</p>
   <select id="ulSelClass" onChange="ulPupListShow()"></select>
   <select id="ulSelPupil"></select>
   <button type="button" onClick="ulShow(0)">Показать</button>
   
   <div id="ulStaff">
   <p>Просмотр лога одного сотрудника</p>
   <select id="ulSelStaff"></select>
   <button type="button" onClick="ulShow(1)">Показать</button>
   </div>
   
   <div id="ulAll">
   <p>Просмотр лога всех пользователей за одни сутки</p>
   <input id="ulDt" type="date"
          min="${regYst}" max="${regYfin}" value="${regNow}">
   <button type="button" onClick="ulShow(2)">Показать</button>
   </div>
   
   <h3>Лог авторизации пользователей</h3><div id="ulResult"></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.userlog = async () => {
   
   let ulRole = dqs("#selRole").value;
   let selClassInner = '', selStaffInner = '';
   
   dqs("#ulStaff").style.display = "none";
   dqs("#ulAll").style.display   = "none";
   dqs("#ulResult").innerHTML    = "Нет данных";
   
   // Если он классный руководитель, показываем ему только его классы
   if (ulRole == "tutor")
      for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
   
   // Если он администратор, показываем ему все фильтры
   else if (ulRole == "admin") {
      dqs("#ulStaff").style.display = "block";
      dqs("#ulAll").style.display   = "block";
      
      // Показываем все классы
      let apiResp = await apireq("classesList");
      if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
      let ulAllClasses = classSort(JSON.parse(apiResp));
      for (let cl of ulAllClasses)
         selClassInner += `<option>${cl}</option>`;
         
      // Показываем всех сотрудников
      apiResp = await apireq("teachList");
      if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
      let ulAllStaff = JSON.parse(apiResp).sort(
          (u1, u2) => (u1.fio).localeCompare(u2.fio, "ru"));      
      for (let st of ulAllStaff)
         selStaffInner += `<option value="${st.login}">${st.fio}</option>`;
      dqs("#ulSelStaff").innerHTML = selStaffInner;
   }
   dqs("#ulSelClass").innerHTML = selClassInner;
   ulPupListShow();  
};