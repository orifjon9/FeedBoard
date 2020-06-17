const express = require('express');
const bodyParser = require('body-parser');

const feedRouts = require('./router/feed');

const app = express();
app.use(bodyParser.json()); // application/json


// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRouts);

app.listen(4000);

