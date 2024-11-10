const messages = require('../config/messages');

exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Lỗi validation',
            errors: err.errors
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: messages.auth.unauthorized
        });
    }

    res.status(500).json({
        message: messages.server.error,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

exports.notFound = (req, res) => {
    res.status(404).json({
        message: 'API endpoint không tồn tại'
    });
};