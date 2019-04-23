const express = require('express');
const app = express();
const Joi = require('joi');
//Used to validate input for POST requests
const logger = require('./logger');

const morgan = require('morgan');
const startupDebugger = require('debug')('app:startup');

// console.log(`Node_ENV: ${process.env.NODE_ENV}`) //undefined
// console.log(`app: ${app.get('env')}`);

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json()); // Allows JSON parsing popultes re.body property
app.use(express.urlencoded({extended: true})); //Parses url encoded payload parses key and value pair
app.use(logger);

//Imp middleware functions helmet and morgan
//Gives details about the request 

if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    startupDebugger('Morgan is enabled')//when env variable DEBUG = app:startup
}

const courses = [
    {id: 1, name: 'Course1'},
    {id: 2, name: 'Course2'},
    {id: 3, name: 'Course3'}
];

app.get('/', (req, res) => {

    res.sendFile('index.html', { root: __dirname });
});

app.get('/api/courses', (req, res) => {

    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {

    const course = courses.find(c => c.id === parseInt(req.params.id));

    if(!course) return res.status(404).send('Course With given ID Not Found'); //404 Not found
    res.send(course);
});

app.post('/api/courses', (req, res) => {

    const {error} = validateCourse(req.body);

    if (error) {
        //400 BAd request
        res.status(400).send(error.details[0].message);
        return;
    }

    const course = {
        id : courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {

    //Look up the course
    //Not found send 404
    const course = courses.find(c => c.id === parseInt(req.params.id));

    if(!course) return res.status(404).send('Course With given ID Not Found'); //404 Not found

    //Validate
    //Bad request 400 error
    
    const {error} = validateCourse(req.body);

    if (error) {
        //400 BAd request
        res.status(400).send(error.details[0].message);
        return;
    }

    //Return course
    course.name = req.body.name;

    res.send(course);


});

app.delete('/api/courses/:id', (req, res) => {

    const course = courses.find(c => c.id === parseInt(req.params.id));

    if(!course) return res.status(404).send('Course With given ID Not Found'); //404 Not found

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);



});

function validateCourse(course)
{
    const schema = {
        name: Joi.string().min(3).required()
    }

    const result = Joi.validate(course, schema);
    return result;
}

// PORT 
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))