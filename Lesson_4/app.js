const express = require('express');
const app = express();

const request = require('request');
const cheerio = require('cheerio');

const consolidate = require('consolidate');
const path = require('path');

const port = 4000;
const options = {
    url: 'https://lenta.ru/rubrics/science/',
};

let news = {
    quantity: 10,
    content: [],
};

function getNews(err, response, body) {
    if (!err && response.statusCode == 200) {

        news.content.length = 0;
        const $ = cheerio.load(body);

        $('.item.news.b-tabloid__topic_news').each((i, item) => {
            news.content.push($(item).find('.titles').eq(0).text());
        });

        news.content.length = news.quantity;
    }
}

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.urlencoded({
    extended: false
}));

app.get('/', (req, res) => {

    request(options, getNews);

    if (news.content.length > 0) {
            res.render('news', news);
    } else {
            res.render('error');
    }
});

app.post('/', (req, res) => {

    let num = parseInt(req.body.quantity);
    if (!isNaN(num)) {
        news.quantity = num;
    } 

    if(news.content.length > news.quantity) {
        news.content.length = news.quantity;
        res.render('news', news);
    } else {
        request(options, getNews);
            if (news.content.length > 0) {
                res.render('news', news);
            } else {
                res.render('error');
            }
    }
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
});