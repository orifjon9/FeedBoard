const express = require('express');
const { body } = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const router = express.Router();

const authController = require('../controller/auth');
const User = require('../models/user');

router.put('/signup', [
    body('email', 'Please enter a valid email')
        .isEmail()
        .trim()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userData => {
                    if (userData) {
                        return Promise.reject('E-mail address already exists')
                    }
                })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .notEmpty()
],
    authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
    '/status',
    isAuth,
    [
        body('status')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.updateUserStatus
);


module.exports = router;