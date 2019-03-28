/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РАБОТЫ СО СПИСКОМ ПОЛЬЗОВАТЕЛЕЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Строка со списком классов для формирования селектов выбора класса
// (подгружается с помощью API в конце этого модуля)
let clListSel = '';

// Кнопка для генерирования/отключения формы добавления нового юзера
const nuFormButt = `
   <button type="button" id="addUser" onclick="userFormGen('add')">
   + Добавить</button>`;

// Циклическое переключение поля категории юзера
// и отображение полей выбора класса и отчества
const newCategTurn = () => {
   let ncField = dqs("#newUcateg");
   if (ncField.value == "Учащийся") {
      ncField.value = "Учитель";
      dqs("#newUclass").style.display = "none";
      dqs("#newUotch").style.display  = "block";
   }
   else {
      ncField.value = "Учащийся";
      dqs("#newUclass").style.display = "block";
      dqs("#newUotch").style.display  = "none";
   }
}

// Генерирование формы добавления/редактирования пользователя
// Аргумент: add - добавление, edit - редактирование
const userFormGen = func => {
   if (!clList) {info(1, "Не получен список классов"); return;}
   const zagol = {add:"Новый пользователь", edit:"Редактирование пользователя"};
   let formInner = `<h3>${zagol[func]}</h3>
      <input type="text" id="newUlogin" placeholder="Логин">
      <input type="text" id="newUfamil" placeholder="Фамилия">
      <input type="text" id="newUname"  placeholder="Имя">
      <input type="text" id="newUotch"  placeholder="Отчество">
      <input type="text" id="newUcateg" readonly value="Учащийся"
             onClick="newCategTurn()">
      <select id="newUclass">${clListSel}</select>
      <input type="password" id="newUpwd"   placeholder="Пароль">
      <input type="password" id="newUpwd1"  placeholder="Повтор пароля">      
      <button type="button" onclick="userAddEdit(0)">Сохранить</button>
   `;
   dqs("#addEditUser").innerHTML  = formInner;
   dqs("#newUotch").style.display = "none";
   dqs("#newUlogin").focus();
   
   dqs("#addUser").outerHTML = `
      <button type="button" id="addUser" onclick="userAddEdit(1)">
      Закрыть без сохранения</button>
   `;
};

// Добавление/редактирование пользователя
// (аргумент 1 - ничего не делать, просто закрыть форму)
const userAddEdit = arg => {
   let newUser = {};
   if (!arg) {
      const newUsFields = ["Ulogin", "Ufamil", "Uname", "Uotch", "Ucateg",
                           "Uclass", "Upwd", "Upwd1"];      
      for (let field of newUsFields) {
         newUser[field] = dqs(`#new${field}`).value.trim() || '';
         if (!newUser[field] && (field != "Uotch")) {            
            info(1, "Заполнены не все поля!");
            return;
         }
      }
      if (newUser.Upwd != newUser.Upwd1) {
         info(1, "Пароли не совпадают.");
         return;
      }
      delete newUser.Upwd1;
   }
   dqs("#addEditUser").innerHTML = '';
   dqs("#addUser").outerHTML     = nuFormButt;
   if (arg) return;
   
   // Посылаем запрос к API на добавление/редактирование
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "usAddEdit",
      "z":  ${newUser}
   }`};
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") info(1, "Запрашиваемая операция отклонена.");
      else info(0,
         `Пользователь ${newUser.Ulogin} успешно добавлен (отредактирован).`);
   })();
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