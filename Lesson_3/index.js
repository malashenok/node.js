const http = require('http');
const url = require('url');

const request = require('request');
const cheerio = require('cheerio');

let arr;

const options = {
    //ссылка на сайт
    url: 'https://lenta.ru/rubrics/science/',
};


function callback(err, response, body) {
    if (!err && response.statusCode == 200) {
        //массив для хранения заголовков новостей
        arr = [];

        const $ = cheerio.load(body);
        //селeктор для заголовков новостей
        $('.item.news.b-tabloid__topic_news').each((i, item) => {
            arr.push($(item).find('.titles').eq(0).text());
        });
    }
}

http.createServer((req, res) => {
	//localhost:4000/news
    if (req.url === '/news') {

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
        });

        res.write("<h1>Новости науки и техники</h1><hr>");

        setTimeout(() => {
            request(options, callback);
            if (arr != undefined) {
    
                arr.forEach(elem => {
                    res.write(`<p>${elem}</p>`);
    
                });
            }

            res.end();

        }, 0);
    }
}).listen(4000);