/**
 *   СЕРВЕР ЭЛЕКТРОННОГО ЖУРНАЛА «ШКАЛА»
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

const DOCROOT  = __dirname + "/www/",
      LOGROOT  = __dirname + "/logs/",

      https    = require("https"),
      url      = require("url"),
      fs       = require("fs"),
      nedb     = require("nedb"),
      htmlpdf  = require("html-pdf"),

      {PORT, SERVER, ERR404, MIME, PWD, SALT, KEYPATH, CERTPATH}
               = require("./config"),
      api      = require("./api"),
      putlog   = require("./api/putlog"),

      httpsOpt = {
         key: fs.readFileSync(__dirname  + "/ssl/" + KEYPATH),
         cert: fs.readFileSync(__dirname + "/ssl/" + CERTPATH)      
      };
global.salt   = SALT;
global.admPwd = PWD;

// Отправка ответа (kod - код состояния, contType - mime-тип, content - тело)
const sendOtvet = (otvet, kod, contType, content) => {
   otvet.writeHead(kod, {
      "Content-Type": contType, "Server": SERVER,
      "Strict-Transport-Security": "max-age=32000000"
   });   
   otvet.write(content);
   otvet.end();
}

https.createServer(httpsOpt, (zapros, otvet) => {
   
   // Получаем параметры запроса
   let pathname = url.parse(zapros.url).pathname;
   if (!pathname.includes(".")) pathname += "/index.html";
   pathname = pathname.replace("//", '/').replace(/\.\./g, '');
   
   let ADDR = zapros.connection.remoteAddress.replace("::1", "127.0.0.1");
   
   // Если метод GET, просто отдаем запрошенный статический файл
   if (zapros.method == "GET")
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
      zapros.on("end",  () => {
         let cont = api(postData, ADDR);
         if (cont != "noreply") sendOtvet(otvet, 200, "text/plain", cont);
         // Здесь еще блок определения логина и запрашиваемой функции
         // (вычленяем их из postData, если они там есть), пишем вместо '/'
         putlog(ADDR, "POST", '/', 200, cont.length);
      });      
   }
   
}).listen(PORT);

console.info(`Сервер стартовал на порту ${PORT}`);
