const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const config = require('../config/config');
const queries = require('../config/queries');
const messages = require('../config/messages');
const emailService = require('../utils/emailService');

exports.register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, gender, dob } = req.body;

        // Kiểm tra email tồn tại
        const [users] = await pool.execute(queries.user.findByEmail, [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: messages.auth.emailExists });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Tạo user mới (roleID = 2 là user thường)
        const [result] = await pool.execute(
            queries.user.create,
            [firstname, lastname, email, password_hash, gender, dob, 2]
        );

        // Tạo profile
        await pool.execute(queries.profile.create, [result.insertId, null, null, 1, null]);

        // Gửi email chào mừng
        await emailService.sendWelcomeEmail(email, firstname);

        res.status(201).json({ message: messages.user.createSuccess });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user
        const [users] = await pool.execute(queries.user.findByEmail, [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: messages.auth.invalidCredentials });
        }

        const user = users[0];

        // Kiểm tra mật khẩu
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: messages.auth.invalidCredentials });
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                userId: user.userId_hash,
                role: user.role_name
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            token,
            user: {
                id: user.userId_hash,
                email: user.email,
                role: user.role_name,
                firstname: user.firstname,
                lastname: user.lastname
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email tồn tại
        const [users] = await pool.execute(queries.user.findByEmail, [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: messages.auth.emailNotFound });
        }

        // Tạo token reset password
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + config.passwordReset.tokenExpirationHours);

        // Lưu token vào database
        await pool.execute(
            queries.passwordReset.create,
            [users[0].userId_hash, resetToken, tokenExpires]
        );

        // Gửi email reset password
        await emailService.sendPasswordResetEmail(email, resetToken);

        res.json({ message: messages.password.resetEmailSent });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Kiểm tra token hợp lệ và chưa hết hạn
        const [resetTokens] = await pool.execute(queries.passwordReset.findValidToken, [token]);
        if (resetTokens.length === 0) {
            return res.status(400).json({ message: messages.auth.invalidToken });
        }

        // Hash mật khẩu mới
        const password_hash = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        await pool.execute(
            'UPDATE User SET password_hash = ? WHERE userId_hash = ?',
            [password_hash, resetTokens[0].userId_hash]
        );

        // Xóa token đã sử dụng
        await pool.execute(queries.passwordReset.deleteToken, [token]);

        res.json({ message: messages.password.resetSuccess });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Lấy thông tin user
        const [users] = await pool.execute(
            'SELECT password_hash FROM User WHERE userId_hash = ?',
            [userId]
        );

        // Kiểm tra mật khẩu hiện tại
        const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: messages.password.currentPasswordInvalid });
        }

        // Hash và cập nhật mật khẩu mới
        const password_hash = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            'UPDATE User SET password_hash = ? WHERE userId_hash = ?',
            [password_hash, userId]
        );

        res.json({ message: messages.password.changeSuccess });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};