/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: БЛОК УЧЕТА ПОСЕЩАЕМОСТИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

createSection("absent", `
   Блок «Посещаемость»
`);

// Динамически подгружаем контент страницы (имя метода = имени пункта меню!)
getContent.absent = async () => {
   let apiResp = await apireq("absentGet", ['', 'bikova']);
   if (apiResp != "none") alert(apiResp);
   else alert("Error!");
};
