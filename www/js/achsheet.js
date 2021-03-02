/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ГЕНЕРИРОВАНИЕ ТАБЕЛЕЙ УСПЕВАЕМОСТИ
 *   Copyright © 2021, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Объект с предметами (подгружается в конце страницы)
let achSbList = {};

// Замена отметок на расшифровку
const grFull = {
   "0":"н/а", "2":"2 (неуд.)", "3":"3 (удовл.)",
   "4":"4 (хор.)", "5":"5 (отл.)", "999":"зач."
};

// Собственно генерирование табеля одного ученика
// В аргументе приходит что-то вроде "pupkin^Пупкин Василий, 8Б класс"
const achShow = async (pupil) => {
   dqs("#tabel").innerHTML = "<img src='static/preloader.gif'>";   
   
   // Получаем фамилию, имя и класс ученика для подзаголовка
   let famImCl = pupil.split('^')[1];
   let podzag  = famImCl ? `<p><b>${famImCl}</b></p>` : '';
   
   // Получаем итоговые отметки с помощью API в объект
   // gradesObj = {"s410": {d628a: "5", d831b: "0", ...} ...}
   info(0, "Пожалуйста, дождитесь<br>загрузки данных.");
   let apiResp = await apireq("tabelGet", [pupil.split('^')[0]]);
   info(2);
   if (apiResp == "none") {
      dqs("#tabel").innerHTML = "<p>Не удалось получить данные</p>";
      return;
   }   
   let gradesObj = JSON.parse(apiResp);
   
   // Упорядоченный список кодов предметов (ключи объекта gradesObj)
   let subjs = Object.keys(gradesObj)
             . sort((a,b) => a.substr(1,3) > b.substr(1,3));
   
   // Публикуем
   if (!subjs.length) {
      dqs("#tabel").innerHTML =
         "<p>Табель не сгенерирован:<br>не выставлено ни одной " +
         "отметки промежуточной аттестации</p>";
      return;
   }
   let tabel = "<h3>ТАБЕЛЬ ОТМЕТОК ПРОМЕЖУТОЧНОЙ АТТЕСТАЦИИ</h3>" + podzag;
   
   tabel += "<table><tr><th>Предмет</th>";
   for (let period of Object.keys(DTSIT))
      tabel += `<th>${DTSIT[period][0]}</th>`;
   tabel += "</tr>";
   
   for (let sbCode of subjs) {
      tabel += `<tr><td>${achSbList[sbCode]}</td>`;
      for (let period of Object.keys(DTSIT)) {
         let grade = gradesObj[sbCode][period] ?
                     gradesObj[sbCode][period] : "–";
         grade = grFull[grade] ? grFull[grade] : grade;
         tabel += `<td>${grade}</td>`;
      }
      tabel += "</tr>";
   }
   
   tabel += "</table>";   
   
   dqs("#tabel").innerHTML =
      tabel + "<p><a id='achPrint'>Версия для печати</a></p>";
   
   // Подготавливаем версию для печати (HTML определен в ini.js)
   let tabelPrn = tabel + "<p class='sgn'>Директор<br>Классный руководитель</p>";
   let printCont = HTML.replace("{{body}}", tabelPrn).replace("8pt", "9pt")
                 . replace("<h3>", "<h3 style='margin-top:5cm'>");
   let dataLink = new Blob([printCont], {type: "text/html"});
   dqs("#achPrint").href = window.URL.createObjectURL(dataLink);
   dqs("#achPrint").download = "tabel.html";
}

// Формирование списка детей в селекте выбора учащегося
const achPupListShow = async () => {
   dqs("#tabel").innerHTML = '';
   let clName = dqs("#achSelClass").value;
   let apiResp = await apireq("pupilsList", [clName]);
   if (apiResp != "none") {
      let achClList = JSON.parse(apiResp);
      let selPupilInner = `<option value=''>== Выберите учащегося ==</option>`;
      for (let pup of achClList) {
         let imya = pup[0].split(' ')[1] || 'N';
         let famI = pup[0].split(' ')[0] + ` ${imya[0]}.`;
         selPupilInner += `<option value="${pup[1]}^${pup[0]}, `
                        + `${clName} класс">${famI}</option>`;
      }
      dqs("#achSelPupil").innerHTML = selPupilInner;
   }
   else {
      dqs("#achSelPupil").innerHTML = '';
      dqs("#tabel").innerHTML = "<h3>В этом классе нет учащихся</h3>";
   }
}

// Формирование контента страницы
createSection("achsheet", `
   <select id="achSelClass" onChange="achPupListShow()"></select>
   <select id="achSelPupil" onChange="achShow(this.value)"></select>
   <div id="tabel" style="margin-top:20px"></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.achsheet = async () => {
   
   // Получаем глобальный объект со списком всех предметов
   // achSbList = {"s110": "Русский язык", ...}
   let apiResp     = await apireq("subjList");
   let achListDop = JSON.parse(apiResp);
   achSbList  = {...subjDef, ...achListDop};
   
   let achRole = dqs("#selRole").value;
   let selClassInner = '';
   
   // Если он учащийся или родитель, показываем ему его табель
   if (achRole == "pupil" || achRole == "parent") {
      dqs("#achSelClass").style.display = "none";
      dqs("#achSelPupil").style.display = "none";
      achShow(`${uLogin}^`);
   }
   // Если он администратор, показываем ему все классы
   else if (achRole == "admin") {
      let apiResp = await apireq("classesList");
      if (apiResp == "none") {info(1, "Не могу получить данные"); return;}
      let achAllClasses = classSort(JSON.parse(apiResp));
      for (let cl of achAllClasses) selClassInner += `<option>${cl}</option>`;
      dqs("#achSelClass").innerHTML = selClassInner;
      achPupListShow(); // показываем список детей
   }
   // Если он классный руководитель, показываем ему его классы
   else if (achRole == "tutor") {
      for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
      dqs("#achSelClass").innerHTML = selClassInner;
      achPupListShow(); // показываем список детей
   }
   dqs("#tabel").innerHTML = '';
};