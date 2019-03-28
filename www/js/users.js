/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РАБОТЫ СО СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Строка со списком классов для формирования селекта
// (подгружается с помощью API в конце этого модуля)
let clListSel = '';

// Кнопка для генерирования/отключения формы добавления нового юзера
const nuFormButt = `
   <button type="button" id="addUser" onclick="userFormGen('add')">
   + Добавить</button>`;

// Циклическое переключение поля категории юзера
// и отображение полей выбора класса и отчества
const newCategTurn = () => {
   let ncField = dqs("#newCateg");
   if (ncField.value == "Учащийся") {
      ncField.value = "Учитель";
      dqs("#newClass").style.display    = "none";
      dqs("#newUserOtch").style.display = "block";
   }
   else {
      ncField.value = "Учащийся";
      dqs("#newClass").style.display    = "block";
      dqs("#newUserOtch").style.display = "none";
   }
}

// Генерирование формы добавления/редактирования пользователя
// Аргумент: add - добавление, edit - редактирование
const userFormGen = func => {
   if (!clList) {info(1, "Не получен список классов"); return;}
   const zagol = {add:"Новый пользователь", edit:"Редактирование пользователя"};
   let formInner = `<h3>${zagol[func]}</h3>
      <input type="text" id="newUserLogin" placeholder="Логин">
      <input type="text" id="newUserFamil" placeholder="Фамилия">
      <input type="text" id="newUserName"  placeholder="Имя">
      <input type="text" id="newUserOtch"  placeholder="Отчество">
      <input type="text" id="newCateg" readonly value="Учащийся"
             onClick="newCategTurn()">
      <select id="newClass">${clListSel}</select>
      <input type="password" id="newUserPwd"   placeholder="Пароль">
      <input type="password" id="newUserPwd1"  placeholder="Повтор пароля">      
      <button type="button" onclick="userAddEdit(0)">Сохранить</button>
   `;
   dqs("#addEditUser").innerHTML = formInner;
   dqs("#newUserOtch").style.display = "none";
   dqs("#newUserLogin").focus();
   
   dqs("#addUser").outerHTML = `
      <button type="button" id="addUser" onclick="userAddEdit(1)">
      Закрыть без сохранения</button>
   `;
};

// Добавление/редактирование пользователя
// (аргумент 1 - ничего не делать, просто закрыть форму)
const userAddEdit = arg => {
   dqs("#addEditUser").innerHTML = '';
   dqs("#addUser").outerHTML = nuFormButt;
   if (arg) return;
   
   // Запрос к API для добавления/редактирования пользователя
}

// Формирование контента странички
createSection("users", `
   <div id="addEditUser"></div>
   ${nuFormButt}
`);

// Динамически подгружаем список классов в строку clList для селекта
// Имя метода = имени пункта меню!
getContent.users = () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "classesList"
   }`};
   (async () => {
      let apiResp   = await (await fetch("/", apiOpt)).text();
      let clListArr = classSort(JSON.parse(apiResp));
      for (let cl of clListArr) clListSel += `<option>${cl}</option>`;
   })();   
}