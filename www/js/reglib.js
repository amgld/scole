/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»:
 *   БИБЛИОТЕКА ФУНКЦИЙ ДЛЯ СТРАНИЦ С ОТМЕТКАМИ И ТЕМАМИ УРОКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 * 
 *   Библиотека используется скриптом register.js
 */
"use strict";

const regWarn = "Тема не указана. Новая колонка не будет создана, "
   + "имеющаяся колонка и все отметки будут удалены.\n\nВы уверены?";

// **************************************************************************
// Формирование списка журальных страничек в селекте выбора странички
// (показываем также список журнальных страничек всех подгрупп данного класса)
const regPagesSelLoad = async (className) => {
   
   dqs("#regPageSel").innerHTML = '';   
   let regRole = dqs("#selRole").value, regSelPgInner = '';   
   
   // Получение объекта со списком всех предметов
   let apiResp     = await apireq("subjList");
   let subjListDop = JSON.parse(apiResp);
   let sbListFull  = {...subjDef, ...subjListDop};   

   if (regRole == "admin" || regRole == "tutor") {
      
      // Получаем массив groups названий подгрупп и самого класса
      apiResp        = await apireq("classesGroups");
      let groupsList = JSON.parse(apiResp);
      let groups     = classSort(groupsList.filter(x => x.includes(className)));
      
      // Получаем объект с логинами и ФИО учителей
      // {"pupkin": "Пупкин В. И.", "ivanov": "Иванов И. И.", ...}
      let teachFIO = {};
      apiResp       = await apireq("teachList");
      let teachList = JSON.parse(apiResp);
      for (let teach of teachList) {teachFIO[teach.login] = teach.fio;}
      
      // Получаем всю педагогическую нагрузку и формируем объект
      // regDistr = {"8Б": [["s110", "ivanov"], ["d830", "petrov"], ...], ...}
      let regDistr = {};
      apiResp      = await apireq("distrGet");
      let distrApi = JSON.parse(apiResp);
      for (let teacher of Object.keys(distrApi)) {
         for (let subj of Object.keys(distrApi[teacher])) {
            for (let className of distrApi[teacher][subj]) {
               if (regDistr[className])
                  regDistr[className].push([subj, teacher]);
               else regDistr[className] = [[subj, teacher]];
            }
         }
      }
      
      // Формируем внутренность селекта выбора предметной странички журнала
      // (как странички самого класса, так и странички его подгрупп)
      for (let currClass of groups) {
         if (!regDistr[currClass]) continue;
         for (let sbPairs of regDistr[currClass]) {
            
            // Если это не целый класс, а подгруппа, добавляем ее название
            let grName =
               currClass.includes('-') ? currClass.split('-')[1] + ": " : '';
            
            // Формируем фамилию И. О. учителя
            let tFIO = teachFIO[sbPairs[1]] ?
                     `(${teachFIO[sbPairs[1]]})` : `(учитель ув.)`;
            
            regSelPgInner +=
               `<option value="${currClass}^${sbPairs[0]}^${sbPairs[1]}">`
             + `${grName}${sbListFull[sbPairs[0]]} ${tFIO}</option>`;
         }
      }
   }
   
   else if (regRole == "teacher") {
      if (!uTeachLoad[className]) {dqs("#regPageSel").innerHTML = ''; return;}
      for (let sbCode of uTeachLoad[className])
         regSelPgInner += `<option value="${className}^${sbCode}^${uLogin}">`
                        + `${sbListFull[sbCode]}</option>`;
   }

   dqs("#regPageSel").innerHTML = regSelPgInner;
   
   // После прогрузки списка доступных страничек данного класса
   // загружаем контент первой в списке странички (функцию см. ниже)
   loadGrades();
}

// **************************************************************************
// Добавление, удаление или редактирование темы урока, дз и веса отметок
const topicEdit = async () => {
   try {
      // Получаем класс^предмет^учитель, например 10Ж-мальч^s220^ivanov,
      // разбираем это, получаем данные из формы редактирования темы урока
      let findArr = dqs("#regPageSel").value.trim().split('^'),
          className = findArr[0], subj = findArr[1],
          dt = dateConv(dqs("#regTopDt").value),
          dtDay = Number(dt.substr(-2,2)),
          topic = dqs("#regNewTopic textarea").value.replace(/\s+/g, ' ').trim(),
          hometask = dqs("#regTopHTask").value.replace(/\s+/g, ' ').trim(),
          weight = dqs("#regTopWeight").value.toString().trim();
      if (dt.length > 4 || dtDay > 31) {info(1, "Неверная дата."); return;}
      if (!/^[1-8]{1}$/.test(weight)) {
         info(1, "Вес может быть целым<br>числом от 1 до 8.");
         return;         
      }
      if (!topic) if (!confirm(regWarn)) return;
      
      // Производим запрос к API (логин учителя не передается,
      // берется из данных авторизации модулем API index.js)
      let apiResp = await apireq(
         "topicEdit", [className, subj, dt, topic, hometask, weight]
      );
      if (apiResp !== "success") {
         info(1, "Ошибка на сервере."); return;         
      }
      else {
         // Добавляем или редактируем новую тему в объекте тем topicsObj
         // (либо удаляем) и обновляем показ тем на странице из этого объекта
         if (topicsObj[dt] && !topic) delete topicsObj[dt];
         else topicsObj[dt] = {t:topic, h:hometask, w:Number(weight)};
         topicsShow();
      }
   }
   catch(e) {info(1, "Ошибка!<br>Действие не выполнено."); return;}
}

// **************************************************************************
// Загрузка тем уроков, дз и весов отметок из базы
const topicsGet = async (className, subjCode, teachLgn) => {
   let apiResp = await apireq("topicsGet", [className, subjCode, teachLgn]);
   if (apiResp != "none") return JSON.parse(apiResp);
   else {info(1, "Ошибка на сервере."); return {}};
}

// **************************************************************************
// Показ тем уроков, дз и весов отметок на странице (из объекта topicsObj)
const topicsShow = () => {
   let content = '';
   if (!Object.keys(topicsObj).length) content = "<b>Уроков не найдено</b>";
   else {
      let dates = Object.keys(topicsObj).sort();
      for (let dt of dates)
         content += `<p><b onClick="dtFocus('${dt}')">${dateConv(dt)}</b> `
                  + `${topicsObj[dt].t}</p>`;
   }
   dqs("#regJustTopics").innerHTML = content;
}

// **************************************************************************
// Загрузка списка детей и отметок из базы
const gradesGet = async (className, subjCode, teachLgn) => {
   return {};
}

// **************************************************************************
// Показ списка детей и отметок на странице (из объекта topicsObj)
const gradesShow = () => {
   dqs("#regGrades").innerHTML = "Здесь что-то будет";
}

// **************************************************************************
// Перемещение выбранной даты (типа d729) в фокус (колонки отметок, темы)
// и заполнение формы редактирования темы актуальными для этой даты данными
// При вызове без аргумента - фокусировка на последней по дате теме
const dtFocus = dt => {
   alert("Выбрана дата " + dateConv(dt));
}

// **************************************************************************
// Загрузка списка класса, отметок и тем уроков
const loadGrades = async () => {
   dqs("#regGrades").innerHTML     = "<img src='/static/preloader.gif'>";
   dqs("#regJustTopics").innerHTML = "<img src='/static/preloader.gif'>";
   
   // Получаем класс^предмет^учитель, например 10Ж-мальч^s220^ivanov
   let params = dqs("#regPageSel").value.trim();
   if (!params) {
      dqs("#regGrades").innerHTML =
         "<h3>Для этого класса пока нет журнальных страничек</h3>";
      dqs("#regTopics").innerHTML = '';
      return;
   }
   let paramsArr = params.split('^'),
       className = paramsArr[0],
       subjCode  = paramsArr[1],
       teachLgn  = paramsArr[2];   
   
   // Загружаем темы уроков из базы и показываем на странице
   topicsObj = await topicsGet(className, subjCode, teachLgn);
   topicsShow();
   
   // Загружаем список детей и отметки из базы и показываем на странице
   gradesObj = await gradesGet(className, subjCode, teachLgn);
   gradesShow();   
}