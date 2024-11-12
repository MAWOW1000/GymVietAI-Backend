const pool = require('../config/database');
const queries = require('../config/queries');
const messages = require('../config/messages');
const emailService = require('../utils/emailService');

exports.getProfile = async (req, res) => {
    try {
        const [profile] = await pool.execute(
            queries.profile.findByUserId,
            [req.user.userId]
        );

        if (profile.length === 0) {
            return res.status(404).json({ message: messages.profile.notFound });
        }

        res.json(profile[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { height, weight, level, goal } = req.body;
        const userId = req.user.userId;

        // Kiểm tra profile tồn tại
        const [existingProfile] = await pool.execute(
            'SELECT * FROM Profile WHERE userId_hash = ?',
            [userId]
        );

        if (existingProfile.length === 0) {
            // Tạo profile mới nếu chưa tồn tại
            await pool.execute(
                queries.profile.create,
                [userId, height, weight, level, goal]
            );
        } else {
            // Cập nhật profile nếu đã tồn tại
            await pool.execute(
                queries.profile.update,
                [height, weight, level, goal, userId]
            );
        }

        // Lấy thông tin email của user
        const [user] = await pool.execute(
            'SELECT email FROM User WHERE userId_hash = ?',
            [userId]
        );

        // Gửi email thông báo cập nhật profile
        await emailService.sendProfileUpdateEmail(user[0].email);

        res.json({ message: messages.profile.updateSuccess });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.getProfileStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Lấy lịch sử cập nhật cân nặng
        const [weightHistory] = await pool.execute(`
            SELECT weight, created_at
            FROM Profile_History
            WHERE userId_hash = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [userId]);

        // Lấy thông tin mục tiêu và tiến độ
        const [goals] = await pool.execute(`
            SELECT goal, progress
            FROM Profile
            WHERE userId_hash = ?
        `, [userId]);

        res.json({
            weightHistory,
            goals: goals[0]
        });
    } catch (error) {
        console.error('Get profile stats error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { goal } = req.body;
        const userId = req.user.userId;

        await pool.execute(`
            UPDATE Profile
            SET goal = ?
            WHERE userId_hash = ?
        `, [goal, userId]);

        res.json({ message: 'Cập nhật mục tiêu thành công' });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};