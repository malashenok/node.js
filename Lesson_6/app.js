const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://127.0.0.1:27017/news', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userMongoose = require('./models/user');
const passport = require('./passport');

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

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'gsdfhsdafgasdfhdsffdsa',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
}));

app.use(passport.initialize);
app.use(passport.session);

app.use('/news', passport.mustAuth);

app.get('/news', async (req, res) => {
    await getNews(res);
});

app.post('/news', (req, res) => {

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

    res.redirect('/news');    
});

app.get('/registration', (req, res) => {
    res.render('register');
});

app.post('/registration', async (req, res) => {
    const {repassword, ...restBody} = req.body;
    if(restBody.password === repassword){
        const user = new userMongoose(restBody);
        await user.save();
        res.redirect('/auth');
    } else {
        res.redirect('/auth?err=err1');
    }
    
});

app.get('/auth', (req, res) => {
    const {error} = req.query;
    res.render('auth', {error});
});

app.post('/auth', passport.autenticate);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth');
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
});