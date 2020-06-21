const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const error401 = new Error('Not authenticated');
    error401.statusCode = 401;

    const authHeader = req.get('Authorization');
    if (!authHeader) {
        console.log('ssss');
        throw error401;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'my-super-secret-secret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        throw error401;
    }

    req.userId = decodedToken.userId;
    next();
};