/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: СТАТИСТИЧЕСКИЕ ДАННЫЕ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Запрос к API для получения статистики
const getStat = async (tip, variable) => {
   dqs("#stResult").innerHTML = "<img src='/static/preloader.gif'>";
   let resp = await apireq("statGet", [tip, variable]);
   if (resp == "none") {
      dqs("#stResult").innerHTML = "Не удалось получить данные";
      return 0;
   }
   return JSON.parse(resp);
}

// Получение и показ статистики о своевременности заполнения журнала
const stSloven = async () => {
   let stObj = await getStat("sloven", 'a');
}

// Получение и показ статистики по параллели классов
const stClasses = async () => {
   let parallN = dqs("#stSelParall").value.toString();
   let stObj = await getStat("classes", parallN);
}

// Получение и показ статистики по одному учителю
const stTeach = async () => {
   let teacher = dqs("#stSelTeach").value;
   let stObj = await getStat("teacher", teacher);
}

// Получение и показ статистики по одному предмету
const stSubj = async () => {
   let subj = dqs("#stSelSubj").value;
   let stObj = await getStat("subject", subj);
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
