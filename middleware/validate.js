const { body, validationResult } = require('express-validator');
const config = require('../config/config');

exports.validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: config.validation.password.minLength })
        .withMessage(`Mật khẩu phải có ít nhất ${config.validation.password.minLength} ký tự`),
    body('firstname')
        .notEmpty()
        .withMessage('Firstname không được để trống')
        .trim(),
    body('lastname')
        .notEmpty()
        .withMessage('Lastname không được để trống')
        .trim(),
    body('gender')
        .isBoolean()
        .withMessage('Gender phải là boolean'),
    body('dob')
        .isDate()
        .withMessage('Ngày sinh không hợp lệ'),
    validateResult
];

exports.validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống'),
    validateResult
];

exports.validateProfile = [
    body('height')
        .optional()
        .isFloat({ min: config.validation.profile.minHeight, max: config.validation.profile.maxHeight })
        .withMessage(`Chiều cao phải từ ${config.validation.profile.minHeight} đến ${config.validation.profile.maxHeight}`),
    body('weight')
        .optional()
        .isFloat({ min: config.validation.profile.minWeight, max: config.validation.profile.maxWeight })
        .withMessage(`Cân nặng phải từ ${config.validation.profile.minWeight} đến ${config.validation.profile.maxWeight}`),
    body('level')
        .optional()
        .isInt({ min: config.validation.profile.minLevel, max: config.validation.profile.maxLevel })
        .withMessage(`Level phải từ ${config.validation.profile.minLevel} đến ${config.validation.profile.maxLevel}`),
    body('goal')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Goal không được để trống'),
    validateResult
];

exports.validateRole = [
    body('name')
        .notEmpty()
        .withMessage('Tên role không được để trống')
        .trim(),
    body('permissions')
        .isArray()
        .withMessage('Permissions phải là một mảng')
        .optional(),
    validateResult
];

exports.validatePasswordReset = [
    body('token')
        .notEmpty()
        .withMessage('Token không được để trống'),
    body('newPassword')
        .isLength({ min: config.validation.password.minLength })
        .withMessage(`Mật khẩu mới phải có ít nhất ${config.validation.password.minLength} ký tự`),
    validateResult
];

exports.validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại không được để trống'),
    body('newPassword')
        .isLength({ min: config.validation.password.minLength })
        .withMessage(`Mật khẩu mới phải có ít nhất ${config.validation.password.minLength} ký tự`),
    validateResult
];
exports.validateUserCreate = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('firstname')
        .notEmpty()
        .withMessage('Firstname không được để trống')
        .trim(),
    body('lastname')
        .notEmpty()
        .withMessage('Lastname không được để trống')
        .trim(),
    body('roleID')
        .isInt()
        .withMessage('RoleID không hợp lệ'),
    validateResult
];

exports.validateUserUpdate = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('firstname')
        .notEmpty()
        .withMessage('Firstname không được để trống')
        .trim(),
    body('lastname')
        .notEmpty()
        .withMessage('Lastname không được để trống')
        .trim(),
    body('roleID')
        .isInt()
        .withMessage('RoleID không hợp lệ'),
    body('is_active')
        .isBoolean()
        .withMessage('is_active phải là boolean'),
    validateResult
];
// Helper function để kiểm tra kết quả validation
function validateResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}