/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ИНИЦИАЛИЗАЦИЯ КОНСТАНТ И ФУНКЦИЙ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

/* БЛОК ОПРЕДЕЛЕНИЯ КОНСТАНТ
--------------------------------------------------------------------- */

// Наименования ролей пользователя
const roleNames = {
   "root":    "Гл. администратор",
   "admin":   "Администратор",
   "teacher": "Учитель",
   "tutor":   "Кл. руководитель",
   "pupil":   "Учащийся",
   "parent":  "Родитель"
};

// Показываемые пункты меню в зависимости от роли пользователя
const menuItems = {
   "root": [      
      ["users",    "Пользователи"],
      ["admins",   "Администраторы"],
      ["classes",  "Классы"],
      ["subjects", "Предметы"]
   ],
   "admin": [
      ["register", "Журнал"],
      ["absent",   "Посещаемость"],
      ["notes",    "Заметки"],
      ["distrib",  "Нагрузка"],
      ["groups",   "Группы"],
      ["export",   "Экспорт"],
      ["stat",     "Статистика"],
      ["userlog",  "Лог"]
   ],
   "teacher": [
      ["register", "Журнал"],
      ["notes",    "Заметки"]
   ],
   "tutor": [
      ["register", "Журнал"],
      ["absent",   "Посещаемость"],
      ["docs",     "Справки"],
      ["notes",    "Заметки"],
      ["subgroup", "Подгруппы"],
      ["achsheet", "Табели"],
      ["parcodes", "Родители"],
      ["export",   "Экспорт"],
      ["userlog",  "Лог"]
   ],
   "pupil": [
      ["journal", "Дневник"],
      ["achsheet", "Табели"],
      ["docs",     "Справки"],
      ["notes",    "Заметки"]
   ],
   "parent": [
      ["journal", "Дневник"],
      ["achsheet", "Табели"],
      ["docs",     "Справки"],
      ["notes",    "Заметки"]
   ]
};

// Список предметов по умолчанию
const subjDef = {
   "s110": "Русский язык",
   "s120": "Литература",
   "s210": "Английский язык",
   "s220": "Немецкий язык",
   "s230": "Французский язык",
   "s310": "Искусство",
   "s320": "МХК",
   "s330": "Музыка",
   "s410": "Математика",
   "s420": "Алгебра",
   "s430": "Алгебра и начала анализа",
   "s440": "Геометрия",
   "s450": "Информатика",
   "s510": "История",
   "s520": "История России",
   "s530": "Всеобщая история",
   "s540": "Обществознание",
   "s550": "Экономика",
   "s560": "Право",
   "s570": "География",
   "s610": "Физика",
   "s620": "Астрономия",
   "s630": "Химия",
   "s640": "Биология",
   "s710": "Технология",
   "s810": "Физическая культура",
   "s820": "ОБЖ"
};

/* БЛОК ОПРЕДЕЛЕНИЯ ФУНКЦИЙ
--------------------------------------------------------------------- */

// Объект функций для динамической подгрузки контента в блоки
let getContent = {};

// Просто удобное сокращение :)
const dqs = elem => document.querySelector(elem);

// Создание нового элемента section на странице с id="newId"
// и наполнение его содержимым inner
let elems = {};
const createSection = (newId, inner) => {
   elems[newId] = document.createElement("section");
   elems[newId].id = newId;
   elems[newId].innerHTML = inner;
   dqs("#content").appendChild(elems[newId]);
};

// Запрос к API. Вызов: let apiResp = await apireq(f, z) или await apireq(f)
// Аргументы: f (имя функции API) и z (строка или объект параметров API)
// Если параметров нет, функция вызывается с одним аргументом f
// Переменные uCateg, uLogin, uToken берутся из замыкания
const apireq = async (f, z) => {
   let body = {t: uCateg, l: uLogin, p: uToken, f: f};
   if (z) body.z = z;
   let opt = {method: "POST", cache: "no-cache", body: JSON.stringify(body)};
   return await (await fetch("/", opt)).text();
}

// Сортировка массива названий классов и подгрупп правильным образом (11А > 1А,
// подгруппы следуют непосредственно за своими классами)
const classSort = classArr => classArr
   .map(x => {
      let xArr = x.split('-'),
          grName = xArr[1] ? `-${xArr[1]}` : ''; 
      return xArr[0].padStart(3, '0') + grName;      
   }).sort().map(x => x.replace(/^0/, ''));

// Сортировка списка предметов правильным образом по ключам (d480 > s110)
const subjSort = sbObj => {
   let res = {};
   Object.keys(sbObj)
      .sort((k1, k2) => Number(k1.substr(1,3)) - Number(k2.substr(1,3)))
      .forEach(key => {res[key] = sbObj[key]});
   return res;
};

// Сортировка массива, состоящего из объектов-пользователей,
// по ключу login в каждом объекте-пользователе
const userSort = usArray => usArray.sort((u1, u2) => (u1.login > u2.login));

// Экспорт функций и других объектов для среды nodejs
if (typeof(module) !== "undefined") {
   module.exports.subjDef = subjDef;   
};
