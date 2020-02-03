/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТАТИСТИЧЕСКИЕ ДАННЫЕ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Получение и показ статистики о своевременности заполнения журнала
const stSloven = async () => {
   dqs("#stResult").innerHTML = "<img src='/static/preloader.gif'>";
   dqs("#stResult").innerHTML = "Результат по своевременности";
}

// Получение и показ статистики по параллели классов
const stClasses = async () => {
   dqs("#stResult").innerHTML = "<img src='/static/preloader.gif'>";
   let parallN = dqs("#stSelParall").value;
   dqs("#stResult").innerHTML = `Результат по параллели классов: ${parallN}`;
}

// Получение и показ статистики по одному учителю
const stTeach = async () => {
   dqs("#stResult").innerHTML = "<img src='/static/preloader.gif'>";
   let teacher = dqs("#stSelTeach").value;
   dqs("#stResult").innerHTML = `Результат по одному учителю: ${teacher}`;
}

// Получение и показ статистики по одному предмету
const stSubj = async () => {
   dqs("#stResult").innerHTML = "<img src='/static/preloader.gif'>";
   let subj = dqs("#stSelSubj").value;
   dqs("#stResult").innerHTML = `Результат по одному предмету: ${subj}`;
}

// Формирование контента страницы
createSection("stat", `
   <h3>Выбор типа статистических данных</h3>
   
   <p>Своевременность заполнения журнала
   <button type="button" onClick="stSloven()"> &gt;&gt; </button></p>
   
   <p>Статистика по параллели классов</p>
   <select id="stSelParall"></select>
   <button type="button" onClick="stClasses()"> &gt;&gt; </button>
   
   <p>Статистика по одному учителю</p>
   <select id="stSelTeach"></select>
   <button type="button" onClick="stTeach()"> &gt;&gt; </button>
   
   <p>Статистика по одному предмету</p>
   <select id="stSelSubj"></select>
   <button type="button" onClick="stSubj()"> &gt;&gt; </button>
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
   let stSubjList = await sbListFullGet();
   if (!Object.keys(stSubjList).length) {
      info(1, "Не могу получить список предметов");
      return;
   }
   for (let k of Object.keys(stSubjList))
      selSubjInner += `<option value="${k}">${stSubjList[k]}</option>`;
   dqs("#stSelSubj").innerHTML = selSubjInner;   
};