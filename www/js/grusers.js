/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: РЕДАКТИРОВАНИE СОСТАВА МЕЖКЛАССНЫХ ГРУПП
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";
// Массив групп данного учителя: [["23Б", "Химия"], ...]
let grusList = [];

// Формирование контента странички
createSection("grusers", `
   <h3>Редактирование состава групп внеурочной деятельности</h3>
   <select id="grusSelGr" onChange="alert(this.value)"></select>
`);

// Динамически подгружаем список групп данного учителя в массив grusList
// и публикуем его на страничке (имя метода = имени пункта меню!)
// uLogin из замыкания (определен в login.js)
getContent.grusers = async () => {
   let selInner = "<option value=''>== ВЫБЕРИТЕ ГРУППУ ==</option>";
   
   let apiResp = await apireq("interGroupList");
   grusList = JSON.parse(apiResp)
            . filter(x => x[2] == uLogin).map(x => [x[0], x[1]]);
   
   if (grusList.length) {
      grusList.sort((a, b) => a[0].localeCompare(b[0], "ru"));   
      for (let g of grusList) {
         let grTitle = g[1].length > 30 ? g[1].substr(0, 30) + "..." : g[1];
         selInner += `<option value="${g[0]}">${g[0]}: ${grTitle}</option>`;
      }
   }
   else selInner =
      "<option value=''>У вас нет групп внеурочной деятельности</option>";

   dqs("#grusSelGr").innerHTML = selInner;      
}