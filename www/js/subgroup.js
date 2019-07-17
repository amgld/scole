/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: РАЗБИЕНИЕ КЛАССА НА ПОДГРУППЫ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Добавление/удаление подгруппы из списка
// (имя подгруппы типа "мальч" без префикса класса!)
// f - это "add" или "del"
const subGrEdit = async (sbGrName, f) => {
   let className = dqs("#sgrClassSel").value;
   if (f == "del")
      if (!confirm(`Удалить подгруппу "${sbGrName}"?`)) return;
   if (f == "add") {
      sbGrName = dqs("#subGrNew").value.trim();
      if (!sbGrName) {info(1, "Введите имя подгруппы!"); return;}
      if (!/^[а-яё0-9]{1,10}$/.test(sbGrName)) {
         info(1, "Имя подгруппы может<br>содержать от 1 до 10<br>строчных "
               + "русских букв<br>и (возможно) цифр.");
         return;         
      }
   }
   dqs("#subGrNew").value = '';
   
   let fullName = `${className}-${sbGrName}`;
   let apiResp = await apireq("subgrEdit", [className, fullName, f]);
   if (apiResp == "none") {info(1, "Ошибка на сервере"); return;}
   else subGroupsLoad(className);
}

// Получение списка существующих подгрупп данного класса
const subGroupsLoad = async (className) => {
   let apiResp = await apireq("classesGroups");
   if (apiResp != "none") {
      let groupsList = JSON.parse(apiResp);
      groupsList = groupsList.filter(x => {
         if (x.includes('-')) return (x.split('-')[0] == className);
         else return false;
      });
      // Если подгруппы есть, публикуем их с иконками удаления
      if (groupsList.length) {
         groupsList = groupsList
                    . map(x => x.replace(className + '-', '')).sort();
         let cont = '';
         for (let sGroup of groupsList)
            cont += `<div><div onclick="subGrEdit('${sGroup}', 'del')">`
                  + `&#10060;</div>${sGroup}</div>`;
         dqs("#subGrList").innerHTML = cont;
      }
      else dqs("#subGrList").innerHTML = "Подгрупп не найдено";
   }
   else dqs("#subGrList").innerHTML = "Подгрупп не найдено";
}

// Формируем контент странички
createSection("subgroup", `
   <select id="sgrClassSel" onChange="subGroupsLoad(this.value);"></select>
   <h3>Подгруппы вашего класса</h3>
   <div id="subGrList"></div>
   <input id="subGrNew" maxlength="10" placeholder="Новая подгруппа"
          onKeyDown="if (event.keyCode == 13) subGrEdit('', 'add')">
   <button type="button" onClick="subGrEdit('', 'add')">Добавить</button>
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.subgroup = async () => {
   
   // Формирование списка классов в селекте (uTutorCls определен в login.js)   
   let sgrSelClInner = '';
   for (let cls of uTutorCls) sgrSelClInner += `<option>${cls}</option>`;
   dqs("#sgrClassSel").innerHTML = sgrSelClInner;
   
   // Загружаем список подгрупп первого класса в списке классов
   subGroupsLoad(dqs("#sgrClassSel").value);

}
