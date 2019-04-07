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

// Циклическое переключение поля категории юзера и отображение поля
// выбора класса в форме поиска пользователя
const usFindCategTurn = () => {
   let ucField = dqs("#usFindCateg");
   if (ucField.value == "Учащийся") {
      ucField.value = "Учитель";
      dqs("#usFindClass").value = '0';
      dqs("#usFindClass").style.display = "none";
   }
   else {
      ucField.value = "Учащийся";
      dqs("#usFindClass").style.display = "inline-block";
   }
}

// Поиск пользователя и выдача результатов
const userFind = () => {
   let usStatus    = dqs("#usFindCateg").value.trim() || "Учащийся";
   let usFindClass = dqs("#usFindClass").value.trim() || '0';
   let usFindFIO   = dqs("#usFindFIO").value.trim()   || '';
   if (usFindClass == '0' && !usFindFIO) {
      info(1, "Задайте условие поиска");
      return;
   }
   if (usFindClass == '0' && usFindFIO.length < 3) {
      info(1, "В поле «ФИО» должно быть не менее трех символов.");
      return;
   }
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l":  "${uLogin}", "p":  "${uToken}", "f":  "usFind",
      "z": ["${usStatus}", "${usFindClass}", "${usFindFIO}"]
   }`};
   (async () => {
      dqs("#usFindResult").innerHTML = "Производится поиск...";
      let usFindRes = "Пользователи не найдены";
      let apiResp   = await (await fetch("/", apiOpt)).text();
      
      if (apiResp != "none") {
         let setAdmin = (usStatus == "Учитель") ?
            "&#9398;&nbsp;" : '';
         usFindRes = "<table><tr><th>Логин</th><th>Фамилия</th><th>Имя</th>"
                   + "<th>Отчество</th><th>Класс</th><th>&nbsp;</th>";
         for (let currUser of JSON.parse(apiResp))
            usFindRes += `<tr>
               <td>${currUser.login}</td>
               <td>${currUser.famil}</td>
               <td>${currUser.name}</td>
               <td>${currUser.name2}</td>
               <td>${currUser.unit}</td>
               <td>&#9874;&nbsp;${setAdmin}&#10060;</td>
            </tr>`;
         usFindRes += "</table>";
      }
      
      dqs("#usFindResult").innerHTML = usFindRes;
   })();
}

// Кнопка для генерирования/отключения формы добавления нового юзера
const nuFormButt = `
   <button type="button" id="addUser" onclick="userFormGen('add')">
   + Добавить пользователя</button>`;

// Циклическое переключение поля категории юзера и отображение полей
// выбора класса и отчества в форме добавления/редактирования пользователя
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
      <input type="text" id="newUcateg" readonly value="Учащийся"
             onClick="newCategTurn()">
      <input type="text" id="newUlogin" placeholder="Логин">
      <input type="text" id="newUfamil" placeholder="Фамилия">
      <input type="text" id="newUname"  placeholder="Имя">
      <input type="text" id="newUotch"  placeholder="Отчество">      
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
      let pLgn = /^[a-z0-9]+$/;
      if (!pLgn.test(newUser["Ulogin"])) {
         info(1, "Логин может состоять только из строчных "
               + "букв латинского алфавита и цифр.");
         return;
      }
      if (newUser.Upwd != newUser.Upwd1) {
         info(1, "Пароли не совпадают.");
         return;
      }
      delete newUser.Upwd1;
      if (newUser.Ucateg == "Учащийся") delete newUser.Uotch;
      else                              delete newUser.Uclass;
      
      // Если это добавление, а не редактирование, проверяем, свободен ли логин
   }
   dqs("#addEditUser").innerHTML = '';
   dqs("#addUser").outerHTML     = nuFormButt;
   if (arg) return;
   
   // Посылаем запрос к API на добавление/редактирование
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l":  "${uLogin}", "p":  "${uToken}", "f":  "usAddEdit",
      "z":  ${JSON.stringify(newUser)}
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
   <h3>Поиск пользователей</h3>
   <div id="findUser">
      <input type="text" id="usFindCateg" readonly value="Учащийся"
             onClick="usFindCategTurn()">
      <select id="usFindClass">
         <option value="0">Любой класс</option>
      </select>
      <input type="text" id="usFindFIO" placeholder="ФИО"
             onKeyDown="if (event.keyCode == 13) userFind()">     
      <button type="button" onclick="userFind()">Искать</button>
   </div>
   <div id="usFindResult"></div>
`);

// Динамически подгружаем список классов в строку clList для селекта
// Имя метода = имени пункта меню!
getContent.users = () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l":  "${uLogin}", "p":  "${uToken}",
      "f":  "classesList"
   }`};
   (async () => {
      if (!clListSel) {
         let apiResp   = await (await fetch("/", apiOpt)).text();
         let clListArr = classSort(JSON.parse(apiResp));
         for (let cl of clListArr) clListSel += `<option>${cl}</option>`;
         dqs("#usFindClass").innerHTML += clListSel;
      }
   })();   
}