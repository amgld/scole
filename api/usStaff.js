/**
 *   СПИСОК ВСЕХ ЛОГИНОВ И ФИО ВСЕХ СОТРУДНИКОВ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Возвращает объект {"pupkin": "Пупкин В. И.", "ivanov": "Иванов И. И.", ...}
module.exports = async () => {
   try {
      let resp = {};      
      let res = await dbFind("staff", {});
      if (res.length) for (let sotr of res) resp[sotr.Ulogin] =
         `${sotr.Ufamil} ${sotr.Uname.substr(0,1)}. ${sotr.Uotch.substr(0,1)}.`;
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
