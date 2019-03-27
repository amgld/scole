/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РАБОТЫ СО СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Циклическое переключение поля категории юзера
// и отображение поля выбора класса
const newCategTurn = () => {
   let ncField = dqs("#newCateg");
   if (ncField.value == "Учащийся") {
      ncField.value = "Учитель";
      dqs("#newClass").style.display = "none";
   }
   else {
      ncField.value = "Учащийся";
      dqs("#newClass").style.display = "block";
   }
}

// Генерирование формы добавления/редактирования пользователя
// Аргумент: add - добавление, edit - редактирование
const userFormGen = func => {
   const zagol = {add:"Новый пользователь", edit:"Редактирование пользователя"};
   let formInner = `<h3>${zagol[func]}</h3>
      <input type="text" id="newUserLogin" placeholder="Логин">
      <input type="text" id="newUserFamil" placeholder="Фамилия">
      <input type="text" id="newUserName"  placeholder="Имя">
      <input type="text" id="newUserOtch"  placeholder="Отчество">
      <input type="text" id="newCateg" readonly value="Учащийся"
             onClick="newCategTurn()">
      <select id="newClass"><option>Класс</option></select>
      <input type="password" id="newUserPwd"   placeholder="Пароль">
      <input type="password" id="newUserPwd1"  placeholder="Повтор пароля">      
      <button type="button" onclick="userAddEdit()">Сохранить</button>
   `;
   dqs("#addEditUser").innerHTML = formInner;
   dqs("#newUserLogin").focus();
};

// Добавление/редактирование пользователя
const userAddEdit = () => {
   dqs("#addEditUser").innerHTML = '';
}

// Формирование контента странички
createSection("users", `
   <button type="button" id="addUser" onclick="userFormGen('add')">
      + Добавить
   </button>
   <div id="addEditUser"></div>
`);
