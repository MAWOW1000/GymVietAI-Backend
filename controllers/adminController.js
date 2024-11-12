const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const messages = require('../config/messages');

class AdminController {
    // Quản lý Users
    async getAllUsers(req, res) {
        try {
            const [users] = await pool.execute(`
                SELECT u.userId_hash, u.firstname, u.lastname, u.email, 
                       u.gender, u.dob, u.is_active, r.name as role_name,
                       p.height, p.weight, p.level
                FROM User u
                LEFT JOIN Role r ON u.roleID = r.roleID
                LEFT JOIN Profile p ON u.userId_hash = p.userId_hash
                ORDER BY u.created_at DESC
            `);

            res.json(users);
        } catch (error) {
            console.error('Admin get users error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async createUser(req, res) {
        try {
            const { firstname, lastname, email, password, gender, dob, roleID } = req.body;

            // Kiểm tra email tồn tại
            const [existingUser] = await pool.execute(
                'SELECT email FROM User WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            // Tạo user mới
            const [result] = await pool.execute(`
                INSERT INTO User (firstname, lastname, email, password_hash, gender, dob, roleID)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [firstname, lastname, email, password_hash, gender, dob, roleID]);

            // Tạo profile mặc định
            await pool.execute(`
                INSERT INTO Profile (userId_hash, height, weight, level)
                VALUES (?, NULL, NULL, 1)
            `, [result.insertId]);

            res.status(201).json({
                message: 'Tạo user thành công',
                userId: result.insertId
            });
        } catch (error) {
            console.error('Admin create user error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { firstname, lastname, email, gender, dob, is_active, roleID } = req.body;

            // Kiểm tra user tồn tại
            const [existingUser] = await pool.execute(
                'SELECT * FROM User WHERE userId_hash = ?',
                [userId]
            );

            if (existingUser.length === 0) {
                return res.status(404).json({ message: 'User không tồn tại' });
            }

            // Cập nhật thông tin user
            await pool.execute(`
                UPDATE User 
                SET firstname = ?, lastname = ?, email = ?,
                    gender = ?, dob = ?, is_active = ?, roleID = ?
                WHERE userId_hash = ?
            `, [firstname, lastname, email, gender, dob, is_active, roleID, userId]);

            res.json({ message: 'Cập nhật user thành công' });
        } catch (error) {
            console.error('Admin update user error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            // Xóa profile
            await pool.execute('DELETE FROM Profile WHERE userId_hash = ?', [userId]);
            
            // Xóa password reset tokens
            await pool.execute('DELETE FROM PasswordReset WHERE userId_hash = ?', [userId]);
            
            // Xóa user
            await pool.execute('DELETE FROM User WHERE userId_hash = ?', [userId]);

            res.json({ message: 'Xóa user thành công' });
        } catch (error) {
            console.error('Admin delete user error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    // Quản lý Roles
    async getAllRoles(req, res) {
        try {
            const [roles] = await pool.execute(`
                SELECT r.roleID, r.name,
                       GROUP_CONCAT(p.url) as permissions,
                       COUNT(DISTINCT u.userId_hash) as user_count
                FROM Role r
                LEFT JOIN Role_Permission rp ON r.roleID = rp.roleID
                LEFT JOIN permission p ON rp.permissionID = p.permissionID
                LEFT JOIN User u ON r.roleID = u.roleID
                GROUP BY r.roleID
            `);
    
            res.json(roles);
        } catch (error) {
            console.error('Admin get roles error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    // Thống kê Dashboard
    async getDashboardStats(req, res) {
        try {
            // Tổng số user
            const [userCount] = await pool.execute(
                'SELECT COUNT(*) as total FROM User'
            );

            // Số user active
            const [activeUsers] = await pool.execute(
                'SELECT COUNT(*) as active FROM User WHERE is_active = true'
            );

            // Số user mới trong tháng
            const [newUsers] = await pool.execute(`
                SELECT COUNT(*) as new_users 
                FROM User 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            `);

            // Phân bố theo role
            const [roleDistribution] = await pool.execute(`
                SELECT r.name, COUNT(u.userId_hash) as count
                FROM Role r
                LEFT JOIN User u ON r.roleID = u.roleID
                GROUP BY r.roleID
            `);

            res.json({
                totalUsers: userCount[0].total,
                activeUsers: activeUsers[0].active,
                newUsers: newUsers[0].new_users,
                roleDistribution
            });
        } catch (error) {
            console.error('Admin dashboard stats error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }
}

module.exports = new AdminController();