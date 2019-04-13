/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК РАБОТЫ СО СПИСКОМ АДМИНИСТРАТОРОВ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

// Разжалование из администраторов
// (в вызове API второй аргумент set - назначить, unset - разжаловать)
const unsetAdmin = login => {
   if (!confirm("Вы уверены?")) return;
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
          "l": "${uLogin}", "p": "${uToken}", "f": "usSetAdmin",
          "z": ["${login}", "unset"]
       }`}; 
   (async () => {
      let apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") info(1, "Запрашиваемая операция отклонена.");
      else if (apiResp == "already")
         info(1, `Пользователь ${login} не является администратором.`);
      else {
         info(0, `Пользователь ${login} успешно удален из администраторов.`);
         getContent.admins();
      }
   })();
}

// Формирование контента странички
createSection("admins", `<h3>Администраторы</h3><table></table>`);

// Динамически подгружаем список администраторов в таблицу
// Имя метода = имени пункта меню!
getContent.admins = () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "l": "${uLogin}", "p": "${uToken}", "f": "adminsList"
   }`};
   (async () => {
      let apiResp   = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") info(1, "Запрашиваемая операция отклонена.");
      else {
         let tableInner = '';
         let admListArr = userSort(JSON.parse(apiResp));
         if (!admListArr.length)
            tableInner = "<tr><td>Администраторов не найдено</td></tr>";
         else for (let currAdm of admListArr) {
            if (currAdm.block) continue;
            tableInner += `<tr>
               <td>${currAdm.Ulogin}</td>
               <td>${currAdm.Ufamil}</td>
               <td>${currAdm.Uname}</td>
               <td>${currAdm.Uotch}</td>
               <td title="Удалить из администраторов"
                   onClick="unsetAdmin('${currAdm.Ulogin}')">&#9747;</td>
            </tr>`;
         }
         dqs("#admins table").innerHTML = tableInner;
      }      
   })();   
}