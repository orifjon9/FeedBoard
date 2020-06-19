const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports.signup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Faild');
        error.statusCode = 422;
        error.errors = errors.array()

        return next(error);
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                name: name
            });

            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User created',
                userId: result._id
            });
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);
        });
};