/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ПРОСМОТР ЛОГА ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЕЙ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Показ лога (аргумент - тип: 0 - дети, 1 - сотрудники, 2 - все)
const ulShow = async tip => {
   let roles = {
         "pupil":"учащийся", "par":"родитель",
         "staff":"сотрудник", "root":"гл.&nbsp;администратор"
       },
       source = ["#ulSelPupil", "#ulSelStaff", "#ulDt"],
       name   = dqs(source[tip]).value;
   
   let resp = await apireq("logGet", [tip, name]);
   if (resp == "none") {info(1, "Данные не получены с сервера"); return;}
   let logArr = JSON.parse(resp);
   
   if (!logArr.length) {
      dqs("#ulResult").innerHTML =
         "В логе нет записей, удовлетворяющих заданному фильтру";
      return;
   }
   
   let res = "<table><tr><th><nobr>Дата и время</nobr></th><th>Логин</th>" +
             "<th>Роль</th><th><nobr>IP-адрес</nobr></th></tr>";
   for (let rec of logArr) {
      let dtArr = (rec.d.split(' ')[0]).split('-'),
          dt    = `${dtArr[2]}.${dtArr[1] ${rec.d.split(' ')[1]}`;
      res += `<tr><td>${dt}</td><td>${rec.l}</td>`
           + `<td>${roles[rec.c]}</td><td>${rec.ip}</td></tr>`;
   }
   
   dqs("#ulResult").innerHTML = res + "</table>";
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
   <button type="button" onClick="ulShow(0)"> &gt;&gt; </button>
   
   <div id="ulStaff">
   <p>Просмотр лога одного сотрудника</p>
   <select id="ulSelStaff"></select>
   <button type="button" onClick="ulShow(1)"> &gt;&gt; </button>
   </div>
   
   <div id="ulAll">
   <p>Просмотр лога всех пользователей за одни сутки</p>
   <input id="ulDt" type="date"
          min="${regYst}" max="${regYfin}" value="${regNow}">
   <button type="button" onClick="ulShow(2)"> &gt;&gt; </button>
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