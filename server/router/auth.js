const express = require('express');
const { body } = require('express-validator/check');

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

module.exports = router;