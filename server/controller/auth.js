const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports.signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild');
            error.statusCode = 422;
            error.errors = errors.array()
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });
        const result = await user.save();

        res.status(201).json({
            message: 'User created',
            userId: result._id
        });
    }
    catch (err) {
        err.statusCode = 500;
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loadedUser = await User.findOne({ email: email });
        if (!loadedUser) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, loadedUser.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        },
            'my-super-secret-secret',
            { expiresIn: '6h' });

        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ status: user.status });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        user.status = newStatus;
        await user.save();

        res.status(200).json({ message: 'User updated.' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
