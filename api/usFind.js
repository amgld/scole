/**
 *   ПОИСК ЮЗЕРОВ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Запрос имеет вид [Статус, Класс, ФИО] (статус - это Учащийся/Учитель,
// класс типа 8Б, ФИО это фрагмент для поиска по подстроке)
// Возвращает none или массив найденных юзеров, где каждый юзер - это объект
// {
//    login: "vasya", famil: "Пупкин", name: "Василий",
//    name2: "Иванович", unit: "8Б", admin: false
// }
module.exports = async req => {
   let dbResult = [], res = [];
   try {
      // Разбираемся с тем, что пришло в запросе
      let status = req[0], unit = req[1], fio = req[2];
      if (!status) return "none";

      // Производим запрос к соответстсвующей коллекции базы данных
      if (status == "Учащийся")
         if (unit != '0')
            dbResult = await dbFind("pupils", {$or: [
               {Uclass: unit, Ufamil: RegExp(fio, 'i')},
               {Uclass: unit, Uname:  RegExp(fio, 'i')}
            ]});
         else
            dbResult = await dbFind("pupils", {$or: [
               {Ufamil: RegExp(fio, 'i')}, {Uname: RegExp(fio, 'i')}
            ]});
      else
         dbResult = await dbFind("staff", {$or: [
            {Ufamil: RegExp(fio, 'i')},
            {Uname:  RegExp(fio, 'i')},
            {Uotch:  RegExp(fio, 'i')}
         ]});

      // Если ответ непуст, формируем и возвращаем результат
      if (dbResult.length) {
         for (let currUser of dbResult) {
            let respClass = currUser.Uclass || '',
                respOtch  = currUser.Uotch  || '',
                respAdmin = currUser.admin  || '';
            res.push({
               login: currUser.Ulogin,
               famil: currUser.Ufamil,
               name:  currUser.Uname,
               name2: respOtch,
               unit:  respClass,
               admin: respAdmin
            });
         }
         return JSON.stringify(res);
      }
      else return "none";
   }
   catch(e) {return "none";}
};
