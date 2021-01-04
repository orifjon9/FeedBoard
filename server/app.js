const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const feedRoutes = require('./router/feed');
const authRoutes = require('./router/auth');


const { static } = require('express');
const multer = require('multer');
const uuid = require('uuid');

const app = express();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

app.use(bodyParser.json()); // application/json
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message;
    const errors = error.errors;

    return res.status(statusCode).json({
        message: message,
        errors: errors
    });
});

console.log(` ${process.env.MONGODB_URL}`);

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        console.log(`Connected to MondoDB!`);
        console.log(`Server is running on port: ${process.env.PORT}...`);
        const server = app.listen(process.env.PORT);
        const io = require('./socket').init(server);
        io.on('connection', socker => {
            console.log('Client connected!');
        });
    })
    .catch(err => console.log(err));

