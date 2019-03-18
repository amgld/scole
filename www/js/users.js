/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РАБОТЫ СО СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Генерирование формы добавления/редактирования пользователя
// Аргумент: add - добавление, edit - редактирование
const userFormGen = func => {
   const zagol = {add:"Новый пользователь", edit:"Редактирование пользователя"};
   let formInner = `<h3>${zagol[func]}</h3>
      <input type="text" id="newUserLogin" placeholder="Логин">
      <input type="text" id="newUserFamil" placeholder="Фамилия">
      <input type="text" id="newUserName"  placeholder="Имя">
      <input type="text" id="newUserOtch"  placeholder="Отчество">
      <select>
         <option value=0 selected>Учащийся</option>
         <option value=1>Учитель (преподаватель)</option>
      </select>
      <input type="password" id="newUserPwd"   placeholder="Пароль">
      <input type="password" id="newUserPwd1"  placeholder="Повтор пароля">      
      <button type="button" onclick="userAddEdit()">Применить</button>
      &#10060;
      &#10000;
   `;
   dqs("#addEditUser").innerHTML = formInner;
   dqs("#newUserLogin").focus();
};

// Добавление/редактирование пользователя
const userAddEdit = () => {
   dqs("#addEditUser").innerHTML = '';
}

dqs("#content").innerHTML += `
   <section id="users">
   <button type="button" id="addUser" onclick="userFormGen('add')">
      + Добавить
   </button>
   <div id="addEditUser"></div>
   </section>
`;