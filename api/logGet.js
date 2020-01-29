/**
 *   ПОЛУЧЕНИЕ ВЫПИСКИ ИЗ ЛОГА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЕЙ
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// В запросе приходят [1, "ivanov", "petrov"]
//    1 - это запрашиваемый тип лога (0 - дети или сотрудники, 1 - все)
//    ivanov - это данные фильтра (для детей или
//             сотрудников - логин, для общего лога - дата)
//    petrov - это логин автора запроса (подписывается скриптом index.js)
// 
// Возвращается сериализованная в строку выписка из лога - массив объектов
// {d:"2020-01-19 17:14:02", l:"ivanov", c:"par", ip:"1.2.3.4", _id: "Gf56d"}

module.exports = async (args) => {
   let request = {};
   try {
      if (args.length != 3) return "none";
      let tip  = Number(args[0].substr(0, 1)),
          name = args[1].substr(0, 20).trim(),
          lg   = args[2].substr(0, 20).trim();

      if (!name || !lg) return "none";      
      
      // Сотрудник ли он?
      let staff = await dbFind("staff", {Ulogin: lg});
      if (!staff.length) return "none";
      
      switch (tip) {
         // Если запрашивается лог ученика или сотрудника
         case 0: request = {l: name}; break;
         
         // Если запрашивается лог всех за одни сутки
         case 1:
            if (!staff[0].admin) return "none";
            if (!/^\d{4}-\d{2}-d{2}/.test(name)) return "none";
            request = {$where: function() {return (this.d).includes(name);}}
         break;
         
         default: return "none"; break;
      }
      
      let resp = await dbFind("authlog", request);
      resp.sort((a, b) => a.d < b.d);            
      return JSON.stringify(resp);
   }
   catch(e) {return "none";}
};
