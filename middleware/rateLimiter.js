const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Giới hạn 5 lần đăng nhập thất bại
    message: {
        message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút'
    }
});

exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 100, // Giới hạn 100 request/phút
    message: {
        message: 'Quá nhiều request, vui lòng thử lại sau'
    }
});