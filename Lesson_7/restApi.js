const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://127.0.0.1:27017/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const taskMongoose = require('./models/task');
const userMongoose = require('./models/user');
const passport = require('./passport');

const port = 4000;

const app = express();
app.use(express.json());

app.use(cors());

const checkAuth = (req, res, next) => {

    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');

        jwt.verify(token, 'Very secret code', (err, decoded) => {
            if (err) {
                return res.status(403).send();
            }

            req.user = decoded;
            next();
        })
    } else {
        return res.status(403).send();
    }
};

app.use('/tasks', checkAuth);

app.get('/tasks', async (req, res) => {

    const { page = 1, limit = 10} = req.query;

    const tasks = await taskMongoose.find({
        user: req.user._id
    }).skip((page - 1) * limit).limit(limit);

    res.status(200).json(tasks);

});

app.get('/tasks/:id', async (req, res) => {

    const task = await taskMongoose.findById(req.params.id);
    res.status(200).json(tasks);

});

//Добавление задачи
app.post('/tasks', async (req, res) => {
    const task = new taskMongoose({...req.body, user: req.user._id});

    task.save()
    .then((saved) => {
        res.status(204).json(saved);
    })
    .catch(() => {
        res.status(400).json({message: 'Task was not saved'});
    });
});

//Редактирование задачи
app.post('/tasks/update', async (req, res) => {
    const { id, title } = req.body;

    await taskMongoose.updateOne(
        { _id: id }, 
        { $set: { title } }
    );
    res.redirect('/tasks');
});

//Удаление задачи
app.post('/tasks/remove', async (req, res) => {
    const { id } = req.body;

    await taskMongoose.findByIdAndRemove(id);
    res.redirect('/tasks');
});


app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body;

    if(restBody.password === repassword){
        const user = new userMongoose(restBody);
        await user.save();
        return res.status(201).send();
    } else {
        res.status(400).json({
            messageError: 'Error registration'
        });
    }
});

app.post('/auth', async (req, res) => {
    const {username, password} = req.body;

    const user = await userMongoose.findOne({email: username});

    if(!user) {
        return res.status(401).send();
    }

    if(!user.validatePassword(password)) {
        return res.status(401).send();
    }

    const plainData = JSON.parse(JSON.stringify(user));

    res.status(200).json({
        ...plainData,
        token: jwt.sign(plainData, 'Very secret code'),
    });
});


app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
});

/**
 * POST, http://localhost:4000/tasks
 * {}
 * res 403
 ********************************************
 * POST, http://localhost:4000/auth
 * {}
 * res 401
 ********************************************
 * POST, http://localhost:4000/register
 * {
 *  "email": "my@email.ru",
 *  "password": "1234",
 *  "repassword": "1234" * 
 * }
 * 
 * res 201
 ******************************************** 
 * POST, http://localhost:4000/auth
 * {
 * "email": "my@email.ru",
 * "password": "1234"
 * }
 * 
 * res 200
 * "_id": "5e56ca99a766f90fd4f054c8",
 * "password": "$2a$15$0pjY7Yz8A.pZjepA39qCVOC8is74WZRVqOkHoAzhqdtOvHEe4V7E6",
 * "__v": 0,
 * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTU2Y2E5OWE3NjZmOTBmZD
 *  RmMDU0YzgiLCJwYXNzd29yZCI6IiQyYSQxNSQwcGpZN1l6OEEucFpqZXBBMzlxQ1ZPQzhpczc0V1pSVn
 *  FPa0hvQXpocWR0T3ZIRWU0VjdFNiIsIl9fdiI6MCwiaWF0IjoxNTgyNzQ2NzI3fQ.l2pWCXbdIYBwGB55
 *  O3IMLraJjadD4UJARue8BuYhm4Q"
 ******************************************** 
 * POST, http://localhost:4000/tasks
 * {
 * "title": "Task one",
 * "completed": false 
 * }
 * 
 * res 204
 ********************************************
 * POST, http://localhost:4000/tasks
 * {
 * "title": "Task two",
 * "completed": true 
 * }
 * 
 * res 204
 ********************************************
 *  POST, http://localhost:4000/tasks
 * {
 * "title": "Task three",
 * "completed": true
 * }
 * 
 * res 204
 ********************************************
 * GET, http://localhost:4000/tasks
 * res 200
 * [
 *   {
 *       "completed": false,
 *       "_id": "5e56ceec9368c53b00883726",
 *       "title": "Task one",
 *       "user": "5e56ca99a766f90fd4f054c8",
 *       "__v": 0
 *   },
 *   {
 *       "completed": true,
 *       "_id": "5e56cf48dffe8c089053482c",
 *       "title": "Task two",
 *       "user": "5e56ca99a766f90fd4f054c8",
 *       "__v": 0
 *   },
 *   {
 *       "completed": true,
 *       "_id": "5e56cf4fdffe8c089053482d",
 *       "title": "Task three",
 *       "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *   }
 * ]
 ********************************************
 * POST, http://localhost:4000/tasks/update
 * {
 * "id": "5e56ceec9368c53b00883726",
 * "title": "Task one was updated"
 * }
 * 
 * res 200
 * 
 * [
 *  {
 *     "completed": false,
 *     "_id": "5e56ceec9368c53b00883726",
 *      "title": "Task one was updated",
 *      "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *  },
 *  {
 *      "completed": true,
 *      "_id": "5e56cf48dffe8c089053482c",
 *      "title": "Task two",
 *      "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *  },
 *  {
 *      "completed": true,
 *      "_id": "5e56cf4fdffe8c089053482d",
 *      "title": "Task three",
 *      "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *  }
 * ]
 ******************************************** 
 * POST, http://localhost:4000/tasks/remove
 * {
 *  "id": "5e56cf4fdffe8c089053482d"
 * }
 * 
 * res 200
 * 
 *[
 *  {
 *      "completed": false,
 *      "_id": "5e56ceec9368c53b00883726",
 *      "title": "Task one was updated",
 *      "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *  },
 *  {
 *      "completed": true,
 *      "_id": "5e56cf48dffe8c089053482c",
 *      "title": "Task two",
 *      "user": "5e56ca99a766f90fd4f054c8",
 *      "__v": 0
 *  }
 *]
 */