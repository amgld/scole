/**
 *   ПОЛУЧЕНИЕ ДАННЫХ ОБ ОТСУТСТВУЮЩИХ ЗА ОДИН ДЕНЬ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят ["d123", "petrov"]
//    d123 - это дата
//  petrov - это логин автора запроса (подписывается скриптом index.js)
// 
// Возвращается объект вида
// {"10Б": {"Иванов Василий": ["s430", "s210"], ...}}
// (массив это коды предметов, пропущенных учеником в этот день)
module.exports = async (args) => {
   let resp = {}, attResp = [];
   try {
      if (args.length != 2) return "none";
      let dt = args[0].substr(0, 4),          
          lg = args[1].substr(0, 20).trim();

      if (!dt || !lg || !/^d[0-9]{3}$/.test(dt)) return "none";
      
      // Проверяем полномочия автора запроса
      let res = await dbFind("staff", {Ulogin: lg});
      if (!res.length) return "none";

      // Фильтрация ответа базы (только отметки с буквами "н")
      // и формирование результата
      const result = async respArr => {
         for (let gr of respArr) {
            let grade = gr.g, clss = gr.c, subj = gr.s, pupil = gr.p;
            if (!grade.includes('н')) continue;
            if (!resp[clss]) resp[clss] = {};
            if (!resp[clss][pupil]) resp[clss][pupil] = [];
            resp[clss][pupil].push(subj);
         }
      }

      // Если автор запроса администратор
      if (res[0].admin) {      
         attResp = await dbFind("grades", {d: dt});
         result(attResp);
      }
      else {         
         let clArr = [];

         // В каких классах он классный руководитель
         let clResp = await dbFind("curric", {type: "class", tutor: lg});
         for (let currCl of clResp) clArr.push(currCl.className);

         // В каких классах у него учебная нагрузка
         clResp = await dbFind("distrib", {tLogin: lg});
         for (let subj of Object.keys(clResp[0].tLoad))
            clArr.push(...(clResp[0].tLoad[subj]));

         let classes = new Set(
            clArr.map(x => x.split('-')[0])
                 .sort((x,y) => x.padStart(3, '0') > y.padStart(3, '0'))
         );
         for (let cl of classes) {
            attResp = await dbFind("grades", {d: dt, c: RegExp('^'+cl)});
            result(attResp);
         }
      }      
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
