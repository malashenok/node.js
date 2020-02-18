const express = require('express');
const app = express();

const request = require('request');
const cheerio = require('cheerio');

const consolidate = require('consolidate');
const path = require('path');

const port = 4000;

let news = {
    quantity: 10,
    content: [],
};

function getNews(res) {
    request('https://lenta.ru/rubrics/science/', (err, resp, body) => {
        if (!err && resp.statusCode == 200) {
            news.content.length = 0;
            const $ = cheerio.load(body);

            $('.item.news.b-tabloid__topic_news').each((i, item) => {
                news.content.push($(item).find('.titles').eq(0).text());
            });

            news.content.length = news.quantity;
            res.render('news', news);
        } else {
            console.log('Error while loading page');
            res.render('error');
        }
    });
}

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    getNews(res);
});

app.post('/', (req, res) => {

    let num = parseInt(req.body.quantity);
    if (!isNaN(num) && num > 0) {
        news.quantity = num;
    }

    if (news.quantity < news.content.length) {
        news.content.length = news.quantity;
        res.render('news', news);
    } else {
        getNews(res);
    }
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
});