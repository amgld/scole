/**
 *   ДОБАВЛЕНИЕ/РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Возвращает "success" либо "none"
module.exports = async newUser => {   
   try {
      // Определяем имя коллекции, в которую будем писать
      let collect = (newUser.Ucateg == "Учащийся") ? "pupils" : "staff";
      delete newUser.Ucateg;
   
      // Проверяем, нет ли уже юзера с таким же логином,
      // если нет - добавляем, если есть - обновляем (пароли не обновляем!)
      let res = await dbFind(collect, {Ulogin: newUser.Ulogin});   
      if (res.length) {
         newUser.Upwd = res[0].Upwd;
         if (collect == "pupils") newUser.UpwdPar = res[0].UpwdPar;
         db[collect].update({Ulogin: newUser.Ulogin}, newUser, {});
      }
      else {
         newUser.Upwd = hash(newUser.Upwd, salt); // хэш пароля
         if (collect == "pupils")                 // хэш родительского пароля
            newUser.UpwdPar = hash('p' + captNumGen(newUser.Upwd), salt);
         db[collect].insert(newUser);
      }
      return "success";
   }
   catch(e) {return "none";}
};
