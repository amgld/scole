/**
 *   API ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА» (ЛОКАЛЬНЫЙ ВАРИАНТ ДЛЯ ПРОСМОТРА АРХИВА)
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Промисификатор метода find() работы с базой db
// Пример вызова: let res = await dbFind("curric", {type: "class"}) 
const dbFind = (collectionName, objFind) => {
   return new Promise((resolve, reject) => {
      db[collectionName].find(objFind, (err, docs) => {
         if (err) reject(err); else resolve(docs);
      })
   })
};

apireq = async (func, args) => {
   switch (func) {
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ДАННЫХ О ПОСЕЩАЕМОСТИ
   // Описание
	case "absentGet":
 		;
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА КЛАССОВ И ИХ ПОДГРУПП
   // Возвращает несортированный массив имен классов и их подгрупп
	case "classesGroups":
   try {
      let clList = [];
      let res = await dbFind("curric", {type: "class"});      
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
      let clRes = await dbFind("curric", {type: "class"}); 
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
      let dgRes = await dbFind("distrib", {});
      if (res.length) for (let tObj of dgRes) dgResp[tObj.tLogin] = tObj.tLoad;
      return JSON.stringify(dgResp);
   }
   catch(e) {return "none";}
	break;
   
   // ***********************************************************************
   // ЭКСПОРТ ЖУРНАЛА ОДНОГО КЛАССА В HTML-ФАЙЛ
   // Описание
	case "export":
 		;
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА ДЕТЕЙ И ОТМЕТОК ДЛЯ ОДНОЙ СТРАНИЦЫ
   // Описание
	case "gradesGet":
 		;
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
      let pupilsArr = await dbFind("pupils", {Uclass: clName});
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
   // Описание
	case "sprResp":
 		;
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
      let res = await dbFind("curric", {type: "subj"});
      let sbList = {};
      for (let currDoc of res) sbList[currDoc.sbKod] = currDoc.sbName;   
      return JSON.stringify(sbList);
   }
   catch(e) {return "{}";}
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ ИТОГОВЫХ ОТМЕТОК ОДНОГО УЧАЩЕГОСЯ
   // Описание
	case "tabelGet":
 		;
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА ВСЕХ УЧИТЕЛЕЙ
   // Возвращает массив учителей, где каждый учитель - это объект
   // {login: "vasya", fio: "Пупкин В. И."}
	case "teachList":   
   try {
      let res = [];
      let dbResult = await dbFind("staff", {});      
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
   // Описание
	case "topicsGet":
 		;
	break;
   
   // ***********************************************************************
   // ПОЛУЧЕНИЕ СПИСКА КЛАССНЫХ РУКОВОДИТЕЛЕЙ
   // Описание
	case "tutorsList":
 		;
	break;
   
	default: return "none";
   }
}

