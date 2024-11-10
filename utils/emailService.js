const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendWelcomeEmail(email, name) {
        try {
            // Kiểm tra email tồn tại
            if (!email) {
                throw new Error('Email address is required');
            }

            const info = await this.transporter.sendMail({
                from: `"GymViet" <${process.env.SMTP_USER}>`, // Địa chỉ email gửi
                to: email.trim(), // Đảm bảo email không có khoảng trắng
                subject: 'Chào mừng bạn đến với GymViet',
                html: `
                    <h1>Xin chào ${name}!</h1>
                    <p>Chúc mừng bạn đã đăng ký thành công tài khoản tại GymViet.</p>
                    <p>Hãy bắt đầu hành trình của bạn bằng cách cập nhật profile.</p>
                `
            });

            console.log('Email sent successfully:', {
                messageId: info.messageId,
                to: email
            });

            return info;
        } catch (error) {
            console.error('Send email error:', {
                error: error.message,
                email: email
            });
            throw error;
        }
    }

    async sendPasswordResetEmail(email, resetToken) {
        try {
            if (!email || !resetToken) {
                throw new Error('Email and reset token are required');
            }

            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            const info = await this.transporter.sendMail({
                from: `"Fitness App" <${process.env.SMTP_USER}>`,
                to: email.trim(),
                subject: 'Đặt lại mật khẩu',
                html: `
                    <h1>Yêu cầu đặt lại mật khẩu</h1>
                    <p>Click vào link sau để đặt lại mật khẩu:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>Link này sẽ hết hạn sau 1 giờ.</p>
                `
            });

            console.log('Reset password email sent:', {
                messageId: info.messageId,
                to: email
            });

            return info;
        } catch (error) {
            console.error('Send reset email error:', {
                error: error.message,
                email: email
            });
            throw error;
        }
    }

    async sendProfileUpdateEmail(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }

            const info = await this.transporter.sendMail({
                from: `"Fitness App" <${process.env.SMTP_USER}>`,
                to: email.trim(),
                subject: 'Thông tin profile đã được cập nhật',
                html: `
                    <h1>Cập nhật thông tin thành công</h1>
                    <p>Profile của bạn đã được cập nhật.</p>
                `
            });

            console.log('Profile update email sent:', {
                messageId: info.messageId,
                to: email
            });

            return info;
        } catch (error) {
            console.error('Send profile update email error:', {
                error: error.message,
                email: email
            });
            throw error;
        }
    }
}

module.exports = new EmailService();