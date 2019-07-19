/**
 *   API ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА»
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Подключение необходимых модулей API (модуль авторизации подключен отдельно)
// Имя модуля - ключ, а значения - это пара вида [0,1],
// где первое значение - требуется ли await при вызове модуля,
//     второе значение - передается ли модулю объект аргументов postDt.z
const modReq = {
   "classAdd":    [1,1], "classesList": [1,0], "classDel":      [0,1],
   "subjList":    [1,0], "subjAdd":     [1,1], "subjEdit":      [1,1],
   "subjDel":     [0,1], "usAddEdit":   [1,1], "usFind":        [1,1],
   "usFindLogin": [1,1], "usImport":    [1,1], "usSetAdmin":    [1,1],
   "adminsList":  [1,0], "usBlock":     [1,1], "usChPwd":       [1,1],
   "teachList":   [1,0], "tutorSet":    [0,1], "tutorsList":    [1,0],
   "distrGet":    [1,0], "distrEdit":   [1,1], "classesGroups": [1,0],
   "topicEdit":   [1,1], "topicsGet":   [1,1], "gradesGet":     [1,1],
   "gradeAdd":    [1,1], "subgrEdit":   [1,1], "subgrPups":     [1,1],
   "parCodes":    [1,1], "jrnGet":      [1,1]
};
let mod = {};
mod.auth = require("./auth");
for (let modName in modReq) mod[modName] = require("./" + modName);

// Полномочия (доступные модули) пользователей в зависимости от их роли
const RIGHTS = {
   "root":    [
      "classAdd", "classesList", "classDel", "subjList", "subjAdd", "subjEdit",
      "subjDel", "usAddEdit", "usFind", "usFindLogin", "usImport", "usSetAdmin",
      "adminsList", "usBlock"
   ],
   "admin":   [
      "classesList", "subjList", "teachList", "tutorSet", "tutorsList",
      "distrGet", "distrEdit", "classesGroups", "topicsGet", "gradesGet"
   ],
   "teacher": [
      "usChPwd", "subjList", "topicEdit", "topicsGet", "gradesGet", "gradeAdd"
   ],
   "tutor":   [
      "subjList", "distrGet", "teachList", "classesGroups", "topicsGet",
      "gradesGet", "subgrEdit", "subgrPups", "parCodes"
   ],
   "pupil":   ["subjList", "teachList", "jrnGet"],
   "parent":  ["subjList", "teachList", "jrnGet"]
};
for (let item in RIGHTS) RIGHTS[item].push("login");

module.exports = async (post, addr) => {   
   
   // Разбираем переданные в аргументе POST-данные   
   let postDt = {};
   try {postDt = JSON.parse(post);} catch (e) {return "none";}   
   if (!postDt.t)  postDt.t  = "noType";
   if (!postDt.f)  postDt.f  = "noFunc";
   if (!postDt.l)  postDt.l  = "noLogin";
   if (!postDt.p)  postDt.p  = "noPassw";
   if (!postDt.ci) postDt.ci = "noCptId";
   if (!postDt.c)  postDt.c  = "noCapt";
   
   // Проверяем результаты аутентификации юзера
   let authResult = await mod.auth(
      postDt.t, postDt.l, postDt.p, postDt.ci, postDt.c, addr);
   if (!authResult) return "none";
   
   // Подписываем логин юзера в массив аргументов, передающийся модулю API
   // (для некоторых функций API, требующих валидного логина юзера)
   let fNames = [
      "topicEdit", "gradeAdd", "subgrEdit", "subgrPups", "parCodes", "jrnGet"
   ];
   if (fNames.includes(postDt.f) && postDt.z) postDt.z.push(postDt.l);
      
   // Проверяем полномочия юзера на запрашиваемую функцию   
   let rolesArr = JSON.parse(authResult)["roles"];
   if (!rolesArr.some(r => RIGHTS[r].includes(postDt.f))) return "none";
      
   // Реализуем соответствующую функцию api в зависимости от переменной f
   // и необходимости использования await и передачи модулю аргументов
   if (postDt.f == "login") return authResult;
   if (!Object.keys(modReq).includes(postDt.f)) return "none";
   
   let argsObj = {};
   if (modReq[postDt.f][1]) {
      if (!postDt.z) return "none"; // аргументы модулю нужны, но они не пришли
      argsObj = postDt.z;
   }   
   
   if (modReq[postDt.f][0]) return (await mod[postDt.f](argsObj));
   else                     return mod[postDt.f](argsObj);
}
