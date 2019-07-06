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
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
         "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "subjList"
      }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   let subjListDop = JSON.parse(apiResp);
   let sbListFull  = {...subjDef, ...subjListDop};   

   if (regRole == "admin" || regRole == "tutor") {
      
      // Получаем массив groups названий подгрупп и самого класса
      apiOpt.body = apiOpt.body.replace("subjList", "classesGroups");
      apiResp = await (await fetch("/", apiOpt)).text();
      let groupsList = JSON.parse(apiResp);
      let groups = classSort(groupsList.filter(x => x.includes(className)));
      
      // Получаем объект с логинами и ФИО учителей
      // {"pupkin": "Пупкин В. И.", "ivanov": "Иванов И. И.", ...}
      let teachFIO = {};
      apiOpt.body = apiOpt.body.replace("classesGroups", "teachList");
      apiResp = await (await fetch("/", apiOpt)).text();
      let teachList = JSON.parse(apiResp);
      for (let teach of teachList) {teachFIO[teach.login] = teach.fio;}
      
      // Получаем всю педагогическую нагрузку и формируем объект
      // regDistr = {"8Б": [["s110", "ivanov"], ["d830", "petrov"], ...], ...}
      let regDistr = {};
      apiOpt.body = apiOpt.body.replace("teachList", "distrGet");
      apiResp = await (await fetch("/", apiOpt)).text();
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
          className = findArr[0], subj = findArr[1], teacher = findArr[2],
          dtArr = dqs("#regTopDt").value.split('-'),
          dtMesStr = Number(dtArr[1]),
          dtMes = dtMesStr > 8 ? dtMesStr - 9 : dtMesStr + 3,
          dtDay = dtArr[2],
          dt    = `d${dtMes}${dtDay}`,
          topic = dqs("#regNewTopic textarea").value.replace(/\s+/g, ' ').trim(),
          hometask = dqs("#regTopHTask").value.replace(/\s+/g, ' ').trim(),
          weight = dqs("#regTopWeight").value.toString().trim();
      if (dtMes > 9 || dtDay > 31) {info(1, "Неверная дата."); return;}
      if (!/^[1-8]{1}$/.test(weight)) {
         info(1, "Вес может быть целым<br>числом от 1 до 8.");
         return;         
      }
      if (!topic) if (!confirm(regWarn)) return;
      
      // Производим запрос к API
      let apiOpt = {method: "POST", cache: "no-cache", body: `{
         "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "topicEdit",
         "z": ["${className}", "${subj}", "${teacher}", "${dt}",
               "${topic}", "${hometask}", "${weight}"]
      }`};
      let apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp !== "success") {
         info(1, "Ошибка на сервере."); return;         
      }
      else {
         alert("Успешно.");
      }
   }
   catch(e) {info(1, "Ошибка!<br>Действие не выполнено."); return;}
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

   dqs("#regGrades").innerHTML =
      `Класс: ${className}<br>Предмет: ${subjCode}<br>Учитель: ${teachLgn}`;
   
   dqs("#regJustTopics").innerHTML = "Темы уроков";
}