/**
 *   СЕРВЕР ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА»
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

/* ПОДКЛЮЧЕНИЕ МОДУЛЕЙ И ОПРЕДЕЛЕНИЕ ГЛОБАЛЬНЫХ КОНСТАНТ
 * ----------------------------------------------------------------------- */
const DOCROOT  = __dirname + "/www/",
      LOGROOT  = __dirname + "/logs/",

      https    = require("https"),
      url      = require("url"),
      fs       = require("fs"),
      nedb     = require("nedb"),
      htmlpdf  = require("html-pdf"),

      {PORT, SERVER, ERR404, MIME, PWD, SALT, ADMIN, KEYPATH, CERTPATH}
               = require("./config"),
      api      = require("./api"),
      putlog   = require("./api/putlog"),
      captGen  = require("./api/captchaGen"),

      httpsOpt = {
         key: fs.readFileSync(__dirname  + "/ssl/" + KEYPATH),
         cert: fs.readFileSync(__dirname + "/ssl/" + CERTPATH)      
      };

global.salt   = SALT;
global.admPwd = PWD;


/* ИНИЦИАЛИЗАЦИЯ КОЛЛЕКЦИЙ БАЗЫ ДАННЫХ
 * ----------------------------------------------------------------------- */
global.db  = {};
db.staff    = new nedb({filename: "db/staff.db",    autoload: true});
db.pupils  = new nedb({filename: "db/pupils.db",  autoload: true});
db.curric  = new nedb({filename: "db/curric.db",  autoload: true});
db.distrib = new nedb({filename: "db/distrib.db", autoload: true});


/* ОПРЕДЕЛЕНИЯ ФУНКЦИЙ
 * ----------------------------------------------------------------------- */

// Генерирование числового значения капчи по её Id
global.captNumGen = str => {
   let captNum = '', s, h = 0;
   for (let j = 0; j < 6; j++) {
      s = global.salt + j + str;
      for (let i=0; i<s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
      captNum += Math.abs(h) % 10;
   }
   return captNum;
}

// Промисификатор метода find() работы с базой db
// Пример вызова: let res = await dbFind("curric", {type: "class"}) 
global.dbFind = (collectionName, objFind) => {
   return new Promise((resolve, reject) => {
      db[collectionName].find(objFind, (err, docs) => {
         if (err) reject(err);
         else     resolve(docs);
      })
   })
};

// Отправка ответа (kod - код состояния, contType - mime-тип, content - тело)
const sendOtvet = (otvet, kod, contType, content) => {
   otvet.writeHead(kod, {
      "Content-Type": contType, "Server": SERVER,
      "Strict-Transport-Security": "max-age=32000000"
   });
   otvet.end(content);
}


/* ОБЪЕКТЫ, ОБСЛУЖИВАЮЩИЕ РАБОТУ С КАПЧЕЙ
 * ----------------------------------------------------------------------- */

// Параметры отдаваемой капчи
const captOpt = {
   bkR: 246, bkG: 243, bkB: 240, // фоновый цвет
   fnR: 214, fnG: 191, fnB: 168, // цвет шрифта   
}

// Массив выданных сервером клиенту ID капчи и время жизни капчи в секундах
// (те, что вернулись от клиента, а также старые удаляются)
global.captchaIdArr = [];
const CAPTDEATH = 180;


/* СОБСТВЕННО ЦИКЛ ОБРАБОТКИ ЗАПРОСА
 * ----------------------------------------------------------------------- */
https.createServer(httpsOpt, (zapros, otvet) => {
   
   // Получаем параметры запроса
   let pathname = url.parse(zapros.url).pathname;
   if (!pathname.includes(".")) pathname += "/index.html";
   pathname = pathname.replace("//", '/').replace(/\.\./g, '');
   
   let ADDR = zapros.connection.remoteAddress.replace("::1", "127.0.0.1");
   
   // Если пришел запрос контактов администратора
   if (pathname == "/a.a") sendOtvet(otvet, 200, "text/plain", ADMIN);
   
   // Если пришел запрос капчи, отдаем ее вместе с ее Id (в заголовке X-Cpt)
   else if (pathname == "/cpt.a") {
      let tm = Date.now();
      // Удаляем все устаревшие Id капчи и кладем новый Id
      captchaIdArr = captchaIdArr.filter(
         x => Number(x) > Number(tm - CAPTDEATH * 1000));
      captchaIdArr.push(tm);
      otvet.writeHead(200,
         {"Content-Type": "image/png", "Server": SERVER, "X-Cpt": tm});
      otvet.end(captGen(captNumGen(tm), captOpt));
   }
   
   // Если метод GET, просто отдаем запрошенный статический файл
   else if (zapros.method == "GET")
      fs.readFile(DOCROOT + pathname, function(err, cont) {
         let mtip = MIME[pathname.split(".")[1]];      
         if (!mtip || err) {
            sendOtvet(otvet, 404, "text/html", ERR404);
            putlog(ADDR, "GET", pathname, 404, ERR404.length);
         }
         else {
            sendOtvet(otvet, 200, mtip, cont);
            putlog(ADDR, "GET", pathname, 200, cont.length);
         }
      });
   
   // Если метод POST - это запрос к API
   else {
      let postData = '';
      zapros.on("data", dann => postData += dann.toString());
      zapros.on("end",  async () => {
         let cont = await api(postData, ADDR);
         if (cont != "noreply") sendOtvet(otvet, 200, "text/plain", cont);
         // Здесь еще блок определения логина и запрашиваемой функции
         // (вычленяем их из postData, если они там есть), пишем вместо '/'
         putlog(ADDR, "POST", '/', 200, cont.length);
      });      
   }
   
}).listen(PORT);

let now = (new Date()).toString().replace(/ \(.*\)/, '');
console.info(`${now} ScoleServer стартовал на порту ${PORT}`);
