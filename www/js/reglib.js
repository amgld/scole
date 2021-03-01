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
   
   // Получаем объект со списком всех предметов
   let sbListFull = await sbListFullGet();

   if (regRole == "admin" || regRole == "tutor") {
      
      // Получаем массив groups названий подгрупп и самого класса
      let apiResp    = await apireq("classesGroups");
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
         
         // Сортируем regDistr[currClass] по ключам предметов
         regDistr[currClass].sort(
            (a, b) => a[0].substr(1,3) > b[0].substr(1,3)
         );
         
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
// Навешивание ссылки на выделенный участок текста в окне div дом. задания
// Аргумент elemId - это id элемента div, в котором делается выделение текста
let setLink;
const insertLink = elemId => {
   
   let elem = dqs('#' + elemId), sel = document.getSelection(); 
   if (sel.isCollapsed) {
      info(1, "Предварительно выделите фрагмент текста в домашнем задании");
      return;
   }
   
   let r = sel.getRangeAt(0);
   let trueSelect = 
      (r.startContainer == elem && r.endContainer == elem) ||
      (r.startContainer.parentNode == elem && r.endContainer.parentNode == elem)
   if (!trueSelect) {
      info(1, "Недопустимый диапазон выделения"); return;}   
   
   // Выводим модальное окно запроса href ссылки
   let getHrefWin = document.createElement("div");
   getHrefWin.id = "hrefQuery";
   getHrefWin.innerHTML = `
      <h3>Введите URL ссылки:</h3>
      <input id="hrefURL" type="text">
      <button type="button" onclick="setLink()">Создать ссылку</button>
      <button type="button" onclick="setLink(1)">Отмена</button>
   `;
   document.body.append(getHrefWin);
   hrefURL.focus();   
   
   // Оборачивание выделенного текста в ссылку
   // (при наличии аргумента просто закрывает окно запроса URL)
   setLink = arg => {
      if (arg) {getHrefWin.remove(); return;}
      let hrefVal = dqs("#hrefURL").value.trim()
         .replace(/[^A-Za-z0-9А-ЯЁа-яё\-._~:\/?#\[\]%@!$&'()*+,;=]/g, '');
      if (
         !hrefVal.includes("http://")  &&
         !hrefVal.includes("https://") &&
         !hrefVal.includes("ftp://")
      )  hrefVal = "http://" + hrefVal;
      
      let lnk   = document.createElement('a');
      lnk.href  = hrefVal;
      lnk.title = hrefVal;
      r.surroundContents(lnk);
      r.collapse();
      getHrefWin.remove();   
   }   
}

// **************************************************************************
// Добавление, удаление или редактирование темы урока, дз и веса отметок
// (если пришел ненулевой аргумент vneur - для внеурочной деятельности)
const topicEdit = async vneur => {
   if (!vneur) vneur = 0;
   try {
      // Получаем класс^предмет, например 10Ж-мальч^s220
      // (для внеурочной деятельности только имя_группы, например, 29Ж),
      // разбираем это, получаем данные из формы редактирования темы урока
      // Для внеурочной деятельности код предмета - s000
      let className, subj, dt, topic, hometask, weight, volume;
      
      let findNode = vneur ? dqs("#vdGroupSel") : dqs("#regPageSel"),      
          findArr  = findNode.value.trim().split('^');
      className    = findArr[0];
      subj         = findArr[1];
      
      dt = vneur ? dateConv(dqs("#vdTopDt" ).value) :
                   dateConv(dqs("#regTopDt").value);
      let dtDay = Number(dt.substr(-2,2));
      if (dt.length > 4 || dtDay > 31) {info(1, "Неверная дата."); return;}     

      topic = vneur ? dqs("#vdNewTopic textarea" ).value :
                      dqs("#regNewTopic textarea").value;
      topic = topic.replace(/\s+/g, ' ').trim();
      if (!topic) if (!confirm(regWarn)) return;

      hometask = vneur ? dqs("#vdTopHTask" ).innerHTML :
                         dqs("#regTopHTask").innerHTML;

      hometask = hometask             
         .replace(/<.+?javascript:.+?>/gi, '').replace(/<\/a>/g, '¤')
         .replace(/<(?!a )[^>]+?>/g, ' ').replace(/¤/g, "</a>")
         .replace(/\s+/g, ' ').replace(/(&nbsp;)+/g, ' ').trim();
      if (hometask == "Домашнее задание") hometask = '';

      weight = vneur ? dqs("#vdTopWeight" ).value :
                       dqs("#regTopWeight").value;
      weight = weight.toString().trim();
      if (!/^[0-8]{1}$/.test(weight)) {
         info(1, "Вес должен быть числом<br>от 0 до 4 с шагом 0.5");
         return;         
      }

      volume = vneur ? dqs("#vdTopVol" ).value :
                       dqs("#regTopVol").value;
      volume = volume.toString().trim();      
      if (!/^[1-7]{1}$/.test(volume)) {
         info(1, "Количество часов<br>должно быть от 1 до 7");
         return;         
      }     
      
      // Производим запрос к API (логин учителя не передается,
      // берется из данных авторизации модулем API index.js)
      let apiResp = await apireq(
         "topicEdit", [className, subj, dt, topic, hometask, weight, volume]
      );
      if (apiResp !== "success") {
         info(1, "Ошибка на сервере."); return;         
      }
      else {
         // Добавляем или редактируем новую тему в объекте тем topicsObj
         // либо vdTopicsObj для внеурочной деятельности
         // (либо удаляем) и обновляем показ тем на странице из этого объекта
         // Если тема пустая то, кроме того, удаляем соотв. колонку отметок
         let currTopicsObj = vneur ? vdTopicsObj : topicsObj,
             currGradesObj = vneur ? vdGradesObj : gradesObj;
         if (currTopicsObj[dt] && !topic) {
            delete currTopicsObj[dt];
            let apiResp =
               await apireq("gradeAdd", [dt, className, subj, '', '', 'a']);
            if (apiResp !== "success") info(1, "Ошибка на сервере.");
            delete currGradesObj[dt];
         }            
         else if (topic) {
            currTopicsObj[dt] = {t:topic, h:hometask, w:Number(weight)};
            if (volume != '1') (currTopicsObj[dt]).v = Number(volume);
         }

         topicsShow(vneur);
         
         // Очищаем поле ввода домашнего задания
         if (vneur) dqs("#vdTopHTask" ).innerHTML = '';
         else       dqs("#regTopHTask").innerHTML = '';
      }
   }
   catch(e) {info(1, "Ошибка!<br>Действие не выполнено."); return;}
}

// **************************************************************************
// Загрузка тем уроков, дз, весов отметок и количества часов из базы
const topicsGet = async (className, subjCode, teachLgn) => {
   let apiResp = await apireq("topicsGet", [className, subjCode, teachLgn]);
   if (apiResp != "none") return JSON.parse(apiResp);
   else {info(1, "Ошибка на сервере."); return {}};
}

// **************************************************************************
// Показ тем уроков, дз, весов отметок и к-ва часов (из объекта topicsObj
// или vdTopicsObj для внеурочной деятельности)
// (если пришел ненулевой аргумент vneur - для внеурочной деятельности)
const topicsShow = vneur => {
   if (!vneur) vneur = 0;
   let ctObj = vneur ? vdTopicsObj : topicsObj;
   let content = '';
   if (!Object.keys(ctObj).length)
      content = "<b>Тем занятий не найдено</b>";
   else {
      let dates = Object.keys(ctObj).sort();
      for (let dt of dates) {
         let vol = ctObj[dt].v ? ` (${ctObj[dt].v}&thinsp;ч)` : '';
         let dz  = ctObj[dt].h ? ` <span>[${ctObj[dt].h}]</span>` : '';
         content += `<p><b onClick="dtFocus('${dt}', ${vneur})">`
                  + `${dateConv(dt)}</b> ${ctObj[dt].t}${vol}${dz}</p>`;
      }
   }
   let topicNode = vneur ? dqs("#vdJustTopics") : dqs("#regJustTopics"),
          dtNode = vneur ? dqs("#vdTopDt")      : dqs("#regTopDt");
   topicNode.innerHTML = content;
   dtFocus('', vneur);
   dtNode.value = regNow; // из замыкания
   gradesShow(vneur);
}

// **************************************************************************
// Замена содержимого ячейки таблицы с отметками на input для ввода отметок
// (только если редактирование отметки разрешено, то есть если текущая дата
// содержится в том же или предыдущем учебном периоде, что и редактируемая
// дата). Если редактирование не разрешено и не определена переменная
// pincode[дата-класс], показываем модальное окно запроса пин-кода.
// rgClassName был установлен в loadGrades; whereis - в ini.js
let pincode = {};
const td2inp = (id, grOld) => {
   let idElem  = rgSubjCode == "s000" ?
          dqs(`#vdGrades #${id}`) : dqs(`#regGrades #${id}`);
   if (!idElem) return;

   if (!grOld) grOld = idElem.innerHTML.replace("&nbsp;", '').replace(' ', '');
   if (dqs("#selRole").value != "teacher") return;

   // Проверяем полномочия на редактирование и запрашиваем pin-код
   let clss = rgClassName.split('-')[0];  
   let dtOtm = id.split('-')[0].substr(0, 4),
       dtCur = dateConv(regNow); // текущая дата
   dtCur = dtCur.length > 4 ? "d999" : dtCur;
   if ((whereis(dtCur) > whereis(dtOtm)) && !pincode[`${dtOtm}-${clss}`]) {
      let pin = prompt("Введите PIN-код:", "0000");
      if (pin) pin = pin.trim();
      if (!/^\d{4}$/.test(pin)) {info(1, "Неверный PIN-код"); return;}
      pincode[`${dtOtm}-${clss}`] = pin.toString();
   }

   // Меняем содержимое на input
   idElem.onclick = null;
   idElem.innerHTML = `
      <input id="inp${id}" maxlength="5"
         onBlur="sendGr('${id}', '${grOld}', this.value)"
         onKeyDown="if (event.keyCode == 13 || event.keyCode == 40) `
            + `sendGr('${id}', '${grOld}', this.value, 1);"
         value="${grOld}">
   `;
   let inpElem = rgSubjCode == "s000" ?
          dqs(`#vdGrades #inp${id}`) : dqs(`#regGrades #inp${id}`);
   inpElem.focus();
}

// **************************************************************************
// Отправка введенной отметки для записи в базу с помощью API
const sendGr = async (id, gradeOld, gradeNew, toDown) => {
   let crGrObj = rgSubjCode == "s000" ? vdGradesObj : gradesObj,
       idElem  = rgSubjCode == "s000" ?
          dqs(`#vdGrades #${id}`) : dqs(`#regGrades #${id}`),
       inpElem = rgSubjCode == "s000" ?
          dqs(`#vdGrades #inp${id}`) : dqs(`#regGrades #inp${id}`);
   
   let dt     = id.split('-')[0],
       pupNum = Number(id.split('-')[1]),
       pupId  = crGrObj.puList[pupNum];
   
   gradeNew = gradeNew.replace(/\s+/g, ' ').replace(/Н/g, 'н')
      .replace(/б/g, 'н').replace(/[\-+=.,a-zA-Zа-мо-яёА-ЯЁ]/g, '').trim();
   if (!/^[н0-9 ]{0,5}$/.test(gradeNew)) {
      gradeNew = gradeOld;
      info(1, "Допустимы не более 5 символов:<br>только цифры, пробел<br>"
            + "и русская строчная буква «н»");
   }       
   if (dt.length > 4 && !/^[0-9]{0,3}$/.test(gradeNew)) {
      gradeNew = gradeOld;
      info(1, "В итоговых отметках допустимы<br>только цифры (не более трёх)");
   }
   
   if (gradeOld != gradeNew) {
      
      inpElem.style.background = "#f99";
      
      // Отправляем отметку с помощью API
      // Отметки хранятся с полями [дата, класс, предм, учитель, ученик, отм]
      // rgClassName, rgSubjCode были установлены в loadGrades()
      // Логин учителя не передается, берется из данных авторизации
      // модулем API index.js
      let clss = rgClassName.split('-')[0],
          dtt  = dt.substr(0, 4),
          pin  = pincode[`${dtt}-${clss}`] ? pincode[`${dtt}-${clss}`] : 'a';

      let apiResp = await apireq(
         "gradeAdd", [dt, rgClassName, rgSubjCode, pupId, gradeNew, pin]
      );
      let errMess = "Ошибка на сервере";
      if (apiResp == "pupBlock")    errMess = "Этот учащийся отчислен";
      else if (apiResp == "pinBad") errMess = "Неверный PIN-код";
      if (apiResp != "success") {gradeNew = gradeOld; info(1, errMess);}      
   }
      
   // Обновляем ячейку
   inpElem.style.background = "none";
   let cnt = gradeNew ? gradeNew : ' ';
   idElem.outerHTML =
      `<td id="${id}" onClick="td2inp('${id}', '${gradeNew}')">${cnt}</td>`;
      
   // Обновляем объект crGrObj (gradesObj или vdGradesObj для внеурочки)
   if (!crGrObj[dt])
      crGrObj[dt] = (new Array(crGrObj.puList.length)).map(x => '');
   crGrObj[dt][pupNum] = gradeNew.toString();
      
   // Если пришел аргумент toDown, устанавливаем фокус (с полем input)
   // на нижележащую ячейку, если она есть
   if (toDown) {
      pupNum++;
      let idNew = `${dt}-${pupNum}`;
      td2inp(idNew);
   }
}

// **************************************************************************
// Показ средних баллов и сумм баллов по учащемуся с данным номером в списке
// (номера начинаются с 0, естественно) путем обработки topicsObj и gradesObj
const gradesStat = i => {
   let crGrObj = rgSubjCode == "s000" ? vdGradesObj : gradesObj,
       crTpObj = rgSubjCode == "s000" ? vdTopicsObj : topicsObj;

   let mess = `<h3>${crGrObj.pnList[i].replace(/\|.+?\|/, '')}</h3>`
            + `<table><tr><th> </th><th>Σ</th><th>m</th><th>Н</th></tr>`;   
   for (let itDate of Object.keys(DTSIT)) {
       // Cумма весов, сумма отметок с весами, среднее, пропуски
      let wSum = 0, sum  = 0, av = 0, abs = 0;
      
      // Цикл по всем темам
      for (let dt of Object.keys(crTpObj)) { 
         // Если дата хорошая и у данного ребенка за эту дату есть отметки
         if (dt >= DTSIT[itDate][2] && dt <= DTSIT[itDate][3])           
         if (crGrObj[dt])
         if (crGrObj[dt][i]) {
            let w = crTpObj[dt].w, gFull = crGrObj[dt][i];
            let gClear = gFull.replace(/н/g, ''); // без «н»
            abs += gFull.length - gClear.length;  // к-во пропусков
            gClear = gClear.replace(/\s{2,}/g, ' ').trim();
            if (gClear) if (gClear != "999") {
               let gArr = gClear.split(' ');
               for (let x of gArr) {sum += Number(x) * w; wSum += w;}
            }
         }
      }
      if (wSum) av = (sum / wSum).toFixed(2);
      mess += `<tr><td>${DTSIT[itDate][0]}</td><td>${sum/2}</td>`
            + `<td>${av}</td><td>${abs}</td></tr>`;
   }
   info(0, mess + "</table>");
}

// **************************************************************************
// Загрузка списка детей и отметок из базы
const gradesGet = async (className, subjCode, teachLgn) => {
   let apiResp = await apireq("gradesGet", [className, subjCode, teachLgn]);
   if (apiResp != "none") return JSON.parse(apiResp);
   else {info(1, "Ошибка на сервере."); return {}};
}

// **************************************************************************
// Показ списка детей и отметок на странице
// (из объекта gradesObj или vdGradesObj для внеурочной деятельности)
const gradesShow = vneur => {
   if (!vneur) vneur = 0;
   let crGradObj = vneur ? vdGradesObj      : gradesObj,
       crTopiObj = vneur ? vdTopicsObj      : topicsObj,
       gradElem  = vneur ? dqs("#vdGrades") : dqs("#regGrades");
   let content = '';
   if (!Object.keys(crGradObj).length) content = "<b>Ничего не найдено</b>";
   else {      
      // Список детей
      content = "<table id='regPupList'>"
              + "<tr><td>&nbsp;</td></tr>"
              + "<tr><td class='r'>Вес отметок&nbsp;</td></tr>";

      for (let i=0; i<crGradObj.pnList.length; i++) {
         let pupCl = '',
             pipFio = crGradObj.pnList[i];
         if (vneur) {
            pupCl  = /\|(.+?)\|/.exec(pipFio)[1];
            pupCl  = `<small>${pupCl}</small>`;
            pipFio = pipFio.replace(/\|.+?\|/, '');
         }
         let n = (i > 8) ? i+1 : "  " + (i+1);
         content += `<tr><td id="rp${i}" title="Кликните для показа статистики"`
                  + ` onClick="gradesStat(${i})">`
                  + `${n}. ${pupCl}${pipFio}</td></tr>`;
      }
      content += "</table>";
      
      // Отметки
      content += "<div>";
      // Текущие и итоговые даты; DTSIT определен в ini.js
      let dtArr = [...Object.keys(crTopiObj), ...Object.keys(DTSIT)].sort();
      for (let dt of dtArr) {
         
         // Две верхних заголовочных ячейки с датой и с весом
         let dtN = '', dtW = ' ', bgcol = '', ttl = '';
         if (dt.length == 5) { // итоговая дата вида d628c
            dtN = `<b>${DTSIT[dt][0]}</b>`;
            bgcol = " class='grIt'";
         }
         else if (crTopiObj[dt].t.includes("Экзамен")) {
            dtN = `<b>Экз</b>`;
            bgcol = " class='grIt'";
            dtW = (Number(crTopiObj[dt].w)/2).toString();
            ttl = ` title="${dateConv(dt)}"`;
         }
         else { // обычная текущая дата вида d613
            dtN = dateConv(dt);
            dtW = (Number(crTopiObj[dt].w)/2).toString();
         }
         content += `<table${bgcol}><tr>`
                  + `<td onClick="dtFocus('${dt}', ${vneur})"${ttl}">`
                  +  `${dtN}</td></tr><tr><td>${dtW}</td></tr>`;
                  
         // Собственно отметки, если они есть
         for (let i=0; i<crGradObj.pnList.length; i++) {
            let gr = ' ';
            if (crGradObj[dt]) if (crGradObj[dt][i]) gr = crGradObj[dt][i];
            if (!gr) gr = ' ';
            let grA = gr.replace("&nbsp;", '').replace(" ", '');
            content += `<tr><td id="${dt}-${i}" `
               + `onClick="td2inp('${dt}-${i}', '${grA}')">${gr}</td></tr>`;
         }
         content += "</table>";
      }
      content += "</div>";
   }
   
   gradElem.innerHTML = content;
   dtFocus(0, vneur);
}

// **************************************************************************
// Перемещение выбранной даты (типа d729) в фокус (колонки отметок, темы)
// и заполнение формы редактирования темы актуальными для этой даты данными
// При вызове с пустым аргументом даты - фокусировка на последней по дате теме
let clearPhr = () => {;}
const dtFocus = (dt, vneur) => {
   if (!vneur) vneur = 0;
   let gradesNode = vneur ? dqs("#vdGrades div") : dqs("#regGrades div"),
       topicsNode = vneur ? dqs("#vdJustTopics") : dqs("#regJustTopics"),
       newtopNode = vneur ?
                    dqs("#vdNewTopic textarea")  :
                    dqs("#regNewTopic textarea"),
       hmtaskNode = vneur ? dqs("#vdTopHTask")   : dqs("#regTopHTask"),
       topwgtNode = vneur ? dqs("#vdTopWeight")  : dqs("#regTopWeight"),
       topdtNode  = vneur ? dqs("#vdTopDt")      : dqs("#regTopDt"),
       topvolNode = vneur ? dqs("#vdTopVol")     : dqs("#regTopVol"),
       crTopicObj = vneur ? vdTopicsObj          : topicsObj;

   if(!dt) {
      topicsNode.scrollTop   = topicsNode.scrollHeight;      
      newtopNode.value       = '';
      hmtaskNode.innerHTML   = "Домашнее задание";
      hmtaskNode.style.color = "gray";
      topwgtNode.value       = 2;
      topvolNode.value       = 1;
      
      // Функция очищает поле ввода домашнего задания от placeholder'а
      clearPhr = vneuroch => {
         if (!vneuroch) vneuroch = 0;
         let elem = vneuroch ? dqs("#vdTopHTask") : dqs("#regTopHTask");
         elem.innerHTML = '';
         elem.style.color = "black";
      }      
      
      // Проматываем таблицу отметок к концу
      if (gradesNode) gradesNode.scrollBy(99000, 0);
   }
   else if (dt.length > 4) return;
   else {
      // Заполняем поля формы ввода новой темы данными выбранной даты
      topdtNode.value        = dateConv(dt, 1);
      newtopNode.value       = crTopicObj[dt].t;
      hmtaskNode.innerHTML   = crTopicObj[dt].h;
      hmtaskNode.style.color = "black";
      clearPhr               = () => {;}
      topwgtNode.value       = crTopicObj[dt].w;
      topvolNode.value       = crTopicObj[dt].v ? crTopicObj[dt].v : 1;
      
      // Прокручиваем таблицу с отметками, чтобы дата была видима
      let gradesPar = vneur ? "vdGrades" : "regGrades",
          colonObj  = dqs(`#${gradesPar} #${dt}-0`).parentNode.parentNode,
          realX     = colonObj.getBoundingClientRect().left;
      gradesNode.scrollBy(~~realX - 178, 0);
   }
}

// **************************************************************************
// Загрузка списка класса, отметок и тем уроков
// (если пришел ненулевой аргумент vneur - для внеурочной деятельности)
const loadGrades = async vneur => {
   if (!vneur) vneur = 0;
   let gradesNode = vneur ? dqs("#vdGrades")     : dqs("#regGrades"),
       topicsNode = vneur ? dqs("#vdJustTopics") : dqs("#regJustTopics"),
       selectNode = vneur ? dqs("#vdGroupSel")   : dqs("#regPageSel");

   gradesNode.innerHTML = "<img src='static/preloader.gif'>";
   topicsNode.innerHTML = "<img src='static/preloader.gif'>";
   
   // Получаем класс^предмет^учитель, например 10Ж-мальч^s220^ivanov
   let params = selectNode.value.trim();
   if (!params) {
      gradesNode.innerHTML = "<b>Журнальных страничек пока нет</b>";
      topicsNode.innerHTML = '';
      return;
   }
   else {
      let paramsArr = params.split('^');
      rgClassName = paramsArr[0]; // глобальные переменные из register.js
      rgSubjCode  = paramsArr[1];
      rgTeachLgn  = paramsArr[2];   
      
      // Загружаем темы уроков из базы и показываем на странице
      let cTops = await topicsGet(rgClassName, rgSubjCode, rgTeachLgn);
      if (vneur) vdTopicsObj = cTops; else topicsObj = cTops;
      topicsShow(vneur);
      
      // Загружаем список детей и отметки из базы и показываем на странице
      let cGrds = await gradesGet(rgClassName, rgSubjCode, rgTeachLgn);
      if (vneur) vdGradesObj = cGrds; else gradesObj = cGrds;
      gradesShow(vneur);
   }
}
