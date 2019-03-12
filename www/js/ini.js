/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ИНИЦИАЛИЗАЦИЯ КОНСТАНТ, ФУНКЦИЙ И БАЗЫ ДАННЫХ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

/* Блок определения констант
--------------------------------------------------------------------- */

// Наименования ролей пользователя
const roleNames = {
   "root":    "Главный администратор",
   "admin":   "Администратор",
   "teacher": "Учитель",
   "tutor":   "Кл. руководитель",
   "pupil":   "Учащийся",
   "parent":  "Родитель"
};

// Показываемые пункты меню в зависимости от роли пользователя
const menuItems = {
   "root": [
      ["users", "Пользователи"],
      ["admins", "Администраторы"]
   ],
   "admin": [
      ["users", "Пользователи"]
   ],
   "teacher": [
      ["tmpItem", "Затычка"]
   ],
   "tutor": [
      ["tmpItem", "Затычка"]
   ],
   "pupil": [
      ["tmpItem", "Затычка"]
   ],
   "parent": [
      ["tmpItem", "Затычка"]
   ]
};

/* Блок определения функций
--------------------------------------------------------------------- */

// Просто удобное сокращение :)
const dqs = elem => document.querySelector(elem);

// Экспорт функции для среды nodejs
const ex = obj => {if (typeof(module) != "undefined") module.export = obj};

/* Блок инициализации базы данных
--------------------------------------------------------------------- */
