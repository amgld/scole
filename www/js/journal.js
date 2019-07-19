/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ДНЕВНИК УЧАЩЕГОСЯ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Объекты с предметами и учителями (подгружаются в конце страницы)
let jrnSbList = {}, jrnThList = {};

// Контент страницы - объект jrnArr:
// {
//    "8Б-мальч_s410_ivanov": {
//       d601: ["Африка", "Учить реки", 8, "нн5"],
//       ...
//    }
//    ...
// }
let jrnArr = {};

// Отображение контента по данному предмету-учителю на странице
const jrnContLoad = async () => {
   let grSbTh = dqs("#jrnSubj").value;
   alert("Показываю " + grSbTh);
}

// Формирование контента страницы (селект для начала невидим в css)
createSection("journal", `
   <select id="jrnSubj" onChange="jrnContLoad();"></select>
   <div id="jrnCont"><img src='/static/preloader.gif'></div>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.journal = async () => {
   
   // Получаем глобальный объект со списком всех предметов
   // jrnSbList = {"s110": "Русский язык", ...}
   let apiResp     = await apireq("subjList");
   let subjListDop = JSON.parse(apiResp);
   jrnSbList  = {...subjDef, ...subjListDop};
      
   // Получаем глобальный объект с логинами и ФИО учителей
   // jrnThList = {"pupkin": "Пупкин В. И.", "ivanov": "Иванов И. И.", ...}
   apiResp       = await apireq("teachList");
   let teachList = JSON.parse(apiResp);
   for (let teach of teachList) jrnThList[teach.login] = teach.fio;
   
   // Загружаем все отметки и пр. ученика с помощью API в массив jrnArr
   // (логин юзера не передаем, он подписывается API из данных авторизации)
   info(0, "Пожалуйста, дождитесь<br>загрузки данных.");
   apiResp = await apireq("jrnGet", []);
   info(2);
   if (apiResp == "none") {
      dqs("#jrnCont").innerHTML = "<b>Дневник пока пуст.</b>";
      return;
   }   
   let jrnArr = JSON.parse(apiResp);
   
   // Формируем список предметов и учителей в селекте и делаем его видимым
   let keysArr = Object.keys(jrnArr);
   if (!keysArr.length) {
      dqs("#jrnCont").innerHTML = "<b>Дневник пока пуст.</b>";
      return;
   }
   keysArr.sort(
      (a, b) => a.split('_')[1].substr(1, 3) > b.split('_')[1].substr(1, 3)
   );
   
   let selInn = '';
   for (let k of keysArr) {
      let kArr = k.split('_'),
          grName = kArr[0],
          subj   = jrnSbList[kArr[1]],
          teach  = jrnThList[kArr[2]];
      teach = grName.includes('-') ?
              `(${grName.split('-')[1]}; ${teach})` : `(${teach})`;
      selInn += `<option value="${k}">${subj} ${teach}</option>`;
   }
   dqs("#jrnSubj").innerHTML = selInn;
   dqs("#jrnSubj").style.display = "block";
      
   // Формируем контент страницы по данному предмету и учителю
   jrnContLoad();   
}