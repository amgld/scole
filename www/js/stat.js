/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТАТИСТИЧЕСКИЕ ДАННЫЕ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Объект с кодами и названиями предметов
let stSubjList = {};

// Запрос к API для получения статистики и публикация результатов
//    tip - тип запроса ("sloven", "classes", "teacher" или "subject")
//     hd - заголовок, печатаемый перед таблицей с результатами
const getStat = async (tip, hd) => {
   
   let resEl = dqs("#stResult");
   resEl.innerHTML = "<img src='/static/preloader.gif'>";
   let args = {
      sloven:  "a",
      classes: dqs("#stSelParall").value.toString(),
      teacher: dqs("#stSelTeach").value,
      subject: dqs("#stSelSubj").value
   };
   
   // ФИО выбранного учителя
   let fioTeach =
      dqs("#stSelTeach").options[dqs("#stSelTeach").selectedIndex].innerHTML;
   
   // Уточнение после подзаголовка перед таблицей
   let subHead = {
      sloven:  '',
      classes: `: ${args[tip]}-е классы`,
      teacher: `: ${fioTeach}`,
      subject: `: ${stSubjList(args[tip])}`
   };
   
   let apiResp = await apireq("statGet", [tip, args[tip]]);
   let resp = [];
   if (apiResp != "none") resp = JSON.parse(apiResp);  
   if (!resp.length) {
      resEl.innerHTML = "<p>Не найдено данных, удовлетворяющих запросу</p>";
      return;
   }
   
   resEl.innerHTML = `<p>${hd}${subHead}</p><table>`;
   
   // Печатаем заголовочную строку
   resEl.innerHTML += "<tr>";
   for (let thInner of resp[0]) resEl.innerHTML += `<th>${thInner}</th>`;
   resEl.innerHTML += "</tr>";
   
   // Печатаем тело таблицы
   for (let i=1; i<resp.length; i++) {
      resEl.innerHTML += "<tr>";
      for (let tdInner of resp[i]) resEl.innerHTML += `<th>${tdInner}</th>`;
      resEl.innerHTML += "</tr>";
   }
   
   resEl.innerHTML += "</table>";
}

// Формирование контента страницы
createSection("stat", `
   <h3>Выбор типа статистических данных</h3>
   
   <p>Своевременность заполнения журнала
   <button type="button"
      onClick="getStat('sloven', 'Учителя, не заполняющие журнал более 7 дней')"
      > &gt;&gt; </button></p>
   
   <p>Статистика по параллели классов</p>
   <select id="stSelParall"></select>
   <button type="button"
      onClick="getStat('classes', 'Статистика по параллели')"
      > &gt;&gt; </button>
   
   <p>Статистика по одному учителю</p>
   <select id="stSelTeach"></select>
   <button type="button"
      onClick="getStat('teacher', 'Статистика по одному учителю')"
      > &gt;&gt; </button>
   
   <p>Статистика по одному предмету</p>
   <select id="stSelSubj"></select>
   <button type="button"
      onClick="getStat('subject', 'Статистика по одному предмету')"
      > &gt;&gt; </button>
   </div>
   
   <h3>Статистические данные</h3><div id="stResult"></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.stat = async () => {   
   dqs("#stResult").innerHTML = "Нет данных";
   
   // Показываем все номера параллелей классов
   let selClassInner = '';
   let apiResp = await apireq("classesList");
   if (apiResp == "none") {info(1, "Не могу получить список классов"); return;}
   let stClasses = classSort(JSON.parse(apiResp))
                 . map(x => x.replace(/[^0-9]/g, ''));
   for (let cl of new Set(stClasses))
      selClassInner += `<option>${cl}</option>`;
   dqs("#stSelParall").innerHTML = selClassInner;
      
   // Показываем всех учителей
   let selTeachInner = '';
   apiResp = await apireq("teachList");
   if (apiResp == "none") {info(1, "Не могу получить список учителей"); return;}
   let stAllTeach = JSON.parse(apiResp).sort(
       (u1, u2) => (u1.fio).localeCompare(u2.fio, "ru"));      
   for (let t of stAllTeach)
      selTeachInner += `<option value="${t.login}">${t.fio}</option>`;
   dqs("#stSelTeach").innerHTML = selTeachInner;
   
   // Показываем все предметы
   let selSubjInner = '';
   stSubjList = await sbListFullGet();
   if (!Object.keys(stSubjList).length) {
      info(1, "Не могу получить список предметов");
      return;
   }
   for (let k of Object.keys(stSubjList))
      selSubjInner += `<option value="${k}">${stSubjList[k]}</option>`;
   dqs("#stSelSubj").innerHTML = selSubjInner;   
};
