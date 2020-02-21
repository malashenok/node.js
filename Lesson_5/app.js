const express = require('express');

const app = express();

const taskMySQL = require('./models/taskMysql');
const consolidate = require('consolidate');
const path = require('path');

const port = 4000;
const data = {
      quantity: 0,
      descriptions: [],
};

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/tasks', async (req, res) => {

    const tasks = await taskMySQL.getAll();

    data.quantity = tasks.length;
    data.descriptions = tasks;
    res.render('tasks', data)
});

app.post('/tasks', async (req, res) => {
    const idTask = await taskMySQL.updTask(req.body.id);
    
    res.render('tasks', data)
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
});