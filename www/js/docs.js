/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: УЧЕТ ДОКУМЕНТОВ О ПРОПУСКАХ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Формирование содержимого таблицы с документами одного учащегося
const sprDocsShow = async (pupil) => {
   alert(`Показ справок ${pupil}`);
};

// Формирование списка детей в селекте выбора учащегося
const sprPupListShow = async () => {
   let clName = dqs("#sprSelClass").value;
   let apiResp = await apireq("pupilsList", [clName]);
   if (apiResp != "none") {
      let pupilsList = JSON.parse(apiResp);
      let selPupilInner = '';
      for (let pup of pupilsList)
         selPupilInner += `<option value="${pup[1]}">${pup[0]}</option>`;
      dqs("#sprSelPupil").innerHTML = selPupilInner;
      sprDocsShow(pupilsList[0][1]); // показываем справки первого учащегося
   }   
   else info(1, "Ошибка на сервере");
}

// Формирование контента страницы (regNow, regYst, regYfin определены в ini.js)
createSection("docs", `
   <select id="sprSelClass" onChange="sprPupListShow()"></select>
   <select id="sprSelPupil" onChange="sprDocsShow(this.value)"></select>
   <div id="sprAdd">
      <h3>Добавить новый документ</h3>
      <select id="sprVid"></select>
      <nobr>с <input id="sprStart" type="date"
         min="${regYst}" max="${regYfin}" value="${regNow}"></nobr>
      <nobr>по <input id="sprFin" type="date"
         min="${regYst}" max="${regYfin}" value="${regNow}"></nobr>
      <input id="sprPrim" type="text" placeholder="Примечание">
      <h3>Зарегистрированные документы</h3>
   </div>
   <table id="sprShowDel"><tr>
      <th> </th><th>Вид документа</th><th>с</th><th>по</th><th>Прим.</th>
   </tr></table>
`);

// Формируем селект выбора вида документа (sprVid определен в ini.js)
let sprVidInner = '';
for (let kod of Object.keys(sprVid))
   sprVidInner += `<option value="${kod}">${sprVid[kod]}</option>`;
dqs("#sprVid").innerHTML = sprVidInner; 

// Динамически формируем содержимое страницы (имя метода = имени пункта меню!)
getContent.docs = async () => {
   
   let sprRole = dqs("#selRole").value;   
   
   // Если он учащийся или родитель, показываем ему только его справки
   if (sprRole == "pupil" || sprRole == "parent") {
      dqs("#sprSelClass").style.display = "none";
      dqs("#sprSelPupil").style.display = "none";
      dqs("#sprAdd")     .style.display = "none";
      sprDocsShow(uLogin);
   }
   
   // Если он классный руководитель, показываем ему его классы
   else if (sprRole == "tutor") {
      let selClassInner = '';
      for (let cl of uTutorCls) selClassInner += `<option>${cl}</option>`;
      dqs("#sprSelClass").innerHTML = selClassInner;
      sprPupListShow(); // показываем список детей
   }
}