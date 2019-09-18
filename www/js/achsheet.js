/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ГЕНЕРИРОВАНИЕ ТАБЕЛЕЙ УСПЕВАЕМОСТИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Объект с предметами (подгружается в конце страницы)
let achSbList = {};

// Собственно генерирование табеля одного ученика
// В аргументе приходит что-то вроде "pupkin^Пупкин Василий, 8Б класс"
const achShow = async (pupil) => {
   dqs("#tabel").innerHTML = "<img src='/static/preloader.gif'>";   
   
   // Получаем фамилию, имя и класс ученика для подзаголовка
   let famImCl = pupil.split('^')[1];
   let podzag  = famImCl ? `<p><b>${famImCl}</b></p>` : '';
   
   // Получаем итоговые отметки с помощью API
   info(0, "Пожалуйста, дождитесь<br>загрузки данных.");
   let apiResp = await apireq("tabelGet", [pupil.split('^')[0]]);
   info(2);
   if (apiResp == "none") {
      dqs("#tabel").innerHTML = "<p>Не удалось получить данные</p>";
      return;
   }   
   let gradesArr = JSON.parse(apiResp); alert(apiResp);
   
   let tabel = "<h3>ТАБЕЛЬ ОТМЕТОК ПРОМЕЖУТОЧНОЙ АТТЕСТАЦИИ</h3>" + podzag;
   
   
   dqs("#tabel").innerHTML =
      tabel + "<p><a id='achPrint'>Версия для печати</a></p>";
   
   // Подготавливаем версию для печати (HTML определен в ini.js)
   let printCont = HTML.replace("{{body}}", tabel).replace("8pt", "9pt")
                 . replace("<h3>", "<h3 style='margin-top:5cm'>");
   let dataLink = new Blob([printCont], {type: "text/html"});
   dqs("#achPrint").href = window.URL.createObjectURL(dataLink);
   dqs("#achPrint").download = "tabel.html";
}

// Формирование списка детей в селекте выбора учащегося
const achPupListShow = async () => {
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
   // Если он классный руководитель, показываем ему его классы
   else if (achRole == "tutor") {
      for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
      dqs("#achSelClass").innerHTML = selClassInner;
      achPupListShow(); // показываем список детей
   }
};