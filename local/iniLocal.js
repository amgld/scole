/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ИЗМЕНЕНИЯ В INI.JS ДЛЯ ЛОКАЛЬНОГО ВАРИАНТА
 *   Copyright © 2020, А.М.Гольдин. Modified BSD License
 */
"use strict";

// Переопределяем функцию обращения к API
apireq = (f, z) => {return API[f](z);}
