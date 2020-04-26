/**
 *   API ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА» (ЛОКАЛЬНЫЙ ВАРИАНТ ДЛЯ ПРОСМОТРА АРХИВА)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

apireq = (func, args) => {
   switch (func) {
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ДАННЫХ О ПОСЕЩАЕМОСТИ
   // В запросе приходят ["8Б", "ivanov"]
   //      8Б - это запрашиваемый класс (пустой, если нужен один ученик)
   //  ivanov - это запрашиваемый ученик (пустой, если запрашивается класс) 
   // Возвращается массив, состоящий из объектов вида
   // {d: "d730", s: s430, p: ivanov, abs: 2} (2 - к-во пропущенных уроков)
   case "absentGet":   
   try {
      let resp = [], bdReq = {};
      let clName = args[0].substr(0, 20).trim(),
          pupil  = args[1].substr(0, 20).trim();

      if (!clName && !pupil) return "none";
      
      if (pupil) bdReq = {p: pupil};              // если в запросе один ученик      
      else       bdReq = {c: RegExp('^'+clName)}; // если весь класс
      
      let grResp = dbFind("grades", bdReq);
      for (let gr of grResp) {
         let grade = gr.g;
         if (!grade.includes('н')) continue;
         let absVal = grade.length - grade.replace(/н/g, '').length;
         resp.push({d:gr.d, s:gr.s, p:gr.p, abs:absVal});
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА КЛАССОВ И ИХ ПОДГРУПП
   // Возвращает несортированный массив имен классов и их подгрупп
	case "classesGroups":
   try {
      let clList = [];
      let res = dbFind("curric", {type: "class"});      
      for (let currDoc of res) {
         clList.push(currDoc.className);
         clList.push(...currDoc.groups);
      }      
      return JSON.stringify(clList);
   }
   catch(e) {return "[]";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА КЛАССОВ (С ЛИТЕРАМИ)
   // Возвращает несортированный массив имен классов
	case "classesList":
   try {
      let clList = [];
      let clRes = dbFind("curric", {type: "class"}); 
      for (let currDoc of clRes) clList.push(currDoc.className);
      return JSON.stringify(clList);
   }
   catch(e) {return "[]";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ РАСПРЕДЕЛЕНИЯ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
   // Возвращает none или объект
   // {"pupkin": {"s110": ["8Б", "10Ж"], "d830": ["8Б"]}, "ivanov": ...}
	case "distrGet":
   let dgResp = {};
   try {
      let dgRes = dbFind("distrib", {});
      if (dgRes.length)
         for (let tObj of dgRes) dgResp[tObj.tLogin] = tObj.tLoad;
      return JSON.stringify(dgResp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ЭКСПОРТ ЖУРНАЛА ОДНОГО КЛАССА В HTML-ФАЙЛ
   // В запросе приходит ["8Б"]
   // Возвращается сериализованный в строку объект (описание в api/export.js)
	case "export":
   try {
      let resp = {className: '', tutor: "не назначен", content: []};
      let clName = args[0].substr(0, 3).trim();
      if (!clName) return "none";
      
      // Определяем логин классного руководителя
      let tutorLgn = '';
      let clRes = dbFind("curric", {type: "class", className: clName});
      if (clRes.length) tutorLgn = clRes[0].tutor ? clRes[0].tutor : '';
      
      resp.className = clName;
      
      // ФИО классного руководителя
      if (tutorLgn) {
         let tutRes = dbFind("staff", {Ulogin: tutorLgn});
         if (tutRes.length) resp.tutor =
            `${tutRes[0].Ufamil} ${tutRes[0].Uname} ${tutRes[0].Uotch}`;
      }
      
      // Забираем из таблицы topics все записи данного класса и его подгрупп
      // и сортируем полученный массив по кодам предметов
      let pattern   = new RegExp(`^${clName}`);
      let resTopics = dbFind("topics", {g: pattern});
      resTopics = resTopics.sort(
         (a,b) => (a.s.substr(1,3) > b.s.substr(1,3)) ? 1 : -1
      );
      
      // Разбираем полученный массив в объект objTopics с ключами вида
      // "Группа^кодПредм^Учитель" и значениями - массивами объектов из
      // остальных полей, например:
      // objTopics["10Б-мальч^s110^pupkin"] =
      //    [{d: "d004", t: "Африка", h: "Учить термины", w: 2, v:2}, ...]
      let objTopics = {};
      for (let currT of resTopics) {
         if (!objTopics[`${currT.g}^${currT.s}^${currT.l}`])
            objTopics[`${currT.g}^${currT.s}^${currT.l}`] = [];
            
         let newRec = {d: currT.d, t: currT.t, h: currT.h, w: currT.w};
         if (currT.v) newRec.v = currT.v;
            
         objTopics[`${currT.g}^${currT.s}^${currT.l}`].push(newRec);         
      }
      
      // Идем по этому объекту и формируем resp.content
      for (let currGST of Object.keys(objTopics)) {
         let keyArr = currGST.split('^');
         let grGetData =
            apireq("gradesGet", [keyArr[0], keyArr[1], keyArr[2]]);
         let grData = JSON.parse(grGetData);
         
         // Список учащихся и название предмета
         let contElem = {list: [], s: '', p: "Неизвестный N N", l: []};
         if (grData.pnList) contElem.list = grData.pnList;
         contElem.s    = keyArr[1];
         
         // Фамилия, имя, отчество педагога
         let tRes = dbFind("staff", {Ulogin: keyArr[2]});
         if (tRes.length) contElem.p =
            `${tRes[0].Ufamil} ${tRes[0].Uname} ${tRes[0].Uotch}`;
            
         // Массив с датами, весами, часами, темами, дз и отметками
         let topicsArr = objTopics[currGST];
         for (let currT of topicsArr) {
            let marks = grData[currT.d];
            if (!marks) {
               marks = [];
               for (let i=0; i<contElem.list.length; i++) marks[i] = '';
            }
            marks = marks.map(x => x.replace(/999/g, "зач"));
            
            // Вырезаем ссылки из домашних заданий
            let hmTsk = (currT.h).replace(/<[^>]+?>/gi, '');
            
            let newEl = {d:currT.d, w:currT.w, t:currT.t, h:hmTsk, g:marks};
            if (currT.v) newEl.v = currT.v;
            contElem.l.push(newEl);
         }
         // Добавляем еще в contElem.l все итоговые отметки
         for (let k of Object.keys(grData)) if (k.length == 5) {
            let marks = grData[k].map(
               x => x.replace(/^0$/g, "н/а").replace(/999/g, "зач")
            );
            contElem.l.push({d:k, w:0, t:'', h:'', g:marks})
         }
         
         // Сортируем по возрастанию дат
         contElem.l = contElem.l.sort((a,b) => (a.d > b.d) ? 1 : -1);
         
         resp.content.push(contElem);
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА ДЕТЕЙ И ОТМЕТОК ДЛЯ ОДНОЙ СТРАНИЦЫ
   // В запросе приходят [класс(подгруппа), предмет, учитель]
   // Возвращается none либо объект:
   // {
   //    puList: ["ivanov",    "petrov",    ...],
   //    pnList: ["Иванов И.", "Петров П.", ...],
   //    d601:   ["нн",        "5",         ...],
   //    ...
   // }
   // Если предмет = '', то возвращаются только puList и pnList, причем
   // без заблокированных учащихся
	case "gradesGet":
   try {
      // Одновременная сортировка двух массивов: первый из логинов, второй из
      // фамилий (кириллицей). Сортируется второй массив по алфавиту, а первый
      // массив сортируется в соответствии с отсортированным вторым.
      // Возвращается массив, состоящий из двух этих отсортированных массивов 
      const sort2 = (arrLat, arrRus) => {
         let arrRusNew = [...arrRus], arrLatNew = [];
         arrRusNew.sort((a, b) => a.localeCompare(b, "ru"));
         for (let i=0; i<arrRusNew.length; i++) {
            let iNew = arrRus.indexOf(arrRusNew[i]);
            arrLatNew[i] = arrLat[iNew];
         }
         return [arrLatNew, arrRusNew];
      }      
      
      let gr = args[0].substr(0, 20).trim(),
          sb = args[1].substr(0,  4).trim(),
          lg = args[2].substr(0, 20).trim();

      if (!gr || !lg) return "none";
      
      let resp = {},
          puListMain = [], puListBlock = [],
          pnListMain = [], pnListBlock = [];
      
      // Сначала формируем список учеников данного класса (подгруппы)
      let clName = gr.split('-')[0];
      let pListArr = dbFind("pupils", {Uclass: clName});
      
      if (pListArr.length && gr.includes('-')) // если запрошена подгруппа
         pListArr = pListArr.filter(pup => {
            if (!pup.groups) return false;
            else if (pup.groups.includes(gr)) return true;
            else return false;
         });
      
      for (let pup of pListArr) {
         let newPup = `${pup.Ufamil} ${pup.Uname[0]}.`;
         if (pup.block) {
            if(sb) {
               puListBlock.push(pup.Ulogin);
               pnListBlock.push(newPup);               
            }            
         }
         else {
            puListMain.push(pup.Ulogin); pnListMain.push(newPup);        
         }
      }
      if (puListMain.length || puListBlock.length) {
         let arr2main = sort2(puListMain, pnListMain);
         puListMain = arr2main[0];
         pnListMain = arr2main[1];         
         if (sb) {
            let arr2block = sort2(puListBlock, pnListBlock);
            puListBlock = arr2block[0];
            pnListBlock = arr2block[1];
            resp.puList = [...puListMain, ...puListBlock];
            resp.pnList = [...pnListMain, ...pnListBlock];
         }
         else {
            resp.puList = puListMain;
            resp.pnList = pnListMain;
         }
      }
      else return "{}";
      
      // Теперь формируем объекты (по датам) с отметками (если предмет != 0)
      if (sb) {
         let grVal = resp.puList.length;
         let grResp = dbFind("grades", {c: gr, s: sb, t: lg});      
         for (let currGr of grResp) {
            if (resp.puList.includes(currGr.p)) {
               let i = resp.puList.indexOf(currGr.p);
               if (!resp[currGr.d]) { // тогда просто массив ''
                  resp[currGr.d] = [];
                  for (let i=0; i<grVal; i++) resp[currGr.d][i] = '';
               }
               resp[currGr.d][i] = currGr.g;
            }
         }
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА УЧАЩИХСЯ ОДНОГО КЛАССА
   // Аргумент - ["10Б"]
   // Возвращает [["Иванов Иван", "ivanov"], ...] или "none"
   // Заблокированные учащиеся класса тоже возвращаются в общем списке
	case "pupilsList":
   try {
      let clName = args[0].substr(0,  3).trim();          

      if (!clName) return "none";
      if (!/^\d{1,2}[A-Я]{1}$/.test(clName)) return "none";
      
      let resp = [];
      
      // Идем циклом по всем ученикам данного класса
      let pupilsArr = dbFind("pupils", {Uclass: clName});
      if (!pupilsArr.length) return "none";
      pupilsArr.sort((p1, p2) => p1.Ufamil.localeCompare(p2.Ufamil, "ru"));
      for (let pupil of pupilsArr)
         resp.push([`${pupil.Ufamil} ${pupil.Uname}`, pupil.Ulogin]);
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ДАННЫХ ОБ УВАЖИТЕЛЬНЫХ ПРИЧИНАХ ПРОПУСКОВ УРОКОВ
   // В запросе приходят ["8Б", "ivanov"]
   //      8Б - это запрашиваемый класс (пустой, если нужен один ученик)
   //  ivanov - это запрашиваемый ученик (пустой, если запрашивается класс)
   // Возвращается объект с датами начала и окончания действия каждой справки
   // {
   //    ivanov: [["2019-09-02", "2019-09-13"], ...],
   //    petrov: ...
   // }
	case "sprResp":   
   try {
      let resp = {}, bdReq = {};
      let clName = args[0].substr(0, 20).trim(),
          pupil  = args[1].substr(0, 20).trim();

      if (!clName && !pupil) return "none";
      
      if (pupil) bdReq = {pupil: pupil};    // Если запрашивается один ученик      
      else       bdReq = {Uclass: clName};  // Если запрашивается класс      
      let sprResp = dbFind("spravki", bdReq);
      for (let spravka of sprResp) {
         let start = spravka.start, fin = spravka.fin, pupil = spravka.pupil;
         if (!resp[pupil]) resp[pupil] = [];
         resp[pupil].push([start, fin]);
      }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СТАТИСТИЧЕСКИХ ДАННЫХ
   // Описание
	case "statGet":
 		;
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА ДОПОЛНИТЕЛЬНЫХ ПРЕДМЕТОВ
   // Возвращает объект с условными номерами (ключи) и наименованиями предметов
	case "subjList":
   try {
      let res = dbFind("curric", {type: "subj"});
      let sbList = {};
      for (let currDoc of res) sbList[currDoc.sbKod] = currDoc.sbName;   
      return JSON.stringify(sbList);
   }
   catch(e) {return "{}";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ИТОГОВЫХ ОТМЕТОК ОДНОГО УЧАЩЕГОСЯ
   // В аргументах приходит массив типа ["ivanov"],
   // где ivanov - логин ученика, чьи отметки запрашиваются
   // Возвращает none или объект с итоговыми отметками по предметам
   // {
   //    "s410": {d628a: "5", d831b: "0", ...}
   //    ...
   // }
	case "tabelGet":   
   try {
      let resp = {};
      let pupil = args[0].substr(0, 20).trim();
      let res = dbFind("grades", {p: pupil, d: RegExp("\\w{5}")});
      for (let otm of res) 
         if (otm.g) {
            if (!resp[otm.s]) resp[otm.s] = {};
            resp[otm.s][otm.d] = otm.g;
         }
      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА ВСЕХ УЧИТЕЛЕЙ
   // Возвращает массив учителей, где каждый учитель - это объект
   // {login: "vasya", fio: "Пупкин В. И."}
	case "teachList":   
   try {
      let res = [];
      let dbResult = dbFind("staff", {});      
      if (dbResult.length) {
         for (let currUser of dbResult) {
            if (currUser.block) continue;
            let fio = `${currUser.Ufamil} ${currUser.Uname.substr(0, 1)}. `
                   + `${currUser.Uotch.substr(0, 1)}.`;
            res.push({login: currUser.Ulogin, fio: fio});
         }
         return JSON.stringify(res);
      }  else return "none";
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ТЕМ УРОКОВ ОДНОЙ СТРАНИЦЫ
   // В запросе приходят [класс, предмет, учитель]
   // Возвращается none либо объект (вес и часы - не строки, а числа!):
   // {
   //   d601: {
   //      t: "Африка",
   //      h: "Учить главу 4",
   //      w: 4,
   //      v: 2  // если равно 1, то этого свойства нет
   //   },
   //   ...
   // }
	case "topicsGet": 
   try {
      let gr = args[0].substr(0, 20).trim(),
          sb = args[1].substr(0,  4).trim(),
          lg = args[2].substr(0, 20).trim();

      if (!gr || !sb || !lg) return "none";
      
      let topics = {};      
      let res = dbFind("topics", {g: gr, s: sb, l: lg});      
      for (let currTopic of res) {
         topics[currTopic.d] = {t:currTopic.t, h:currTopic.h, w:currTopic.w};
         if (currTopic.v) (topics[currTopic.d]).v = currTopic.v;
      }
      
      return JSON.stringify(topics);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА КЛАССНЫХ РУКОВОДИТЕЛЕЙ
   // Возвращает объект {"8А": "pupkin", "8Б": "prujinkin", ...}
	case "tutorsList":
   try {
      let res = dbFind("curric", {type: "class"});
      let tutList = {};
      for (let currDoc of res) {
         let tutLogin = currDoc.tutor || "none";
         tutList[currDoc.className] = tutLogin;
      }
      return JSON.stringify(tutList);
   }
   catch(e) {return "{}";}
	break;
   
	default: return "none";
   } // end of switch
}

