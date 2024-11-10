const pool = require('../config/database');
const queries = require('../config/queries');
const messages = require('../config/messages');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(queries.user.getAll);
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const [user] = await pool.execute(queries.user.findById, [req.params.id]);
        if (user.length === 0) {
            return res.status(404).json({ message: messages.user.notFound });
        }
        res.json(user[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { firstname, lastname, gender, dob, is_active, roleID } = req.body;
        const userId = req.params.id;

        await pool.execute(
            queries.user.update,
            [firstname, lastname, gender, dob, is_active, roleID, userId]
        );

        res.json({ message: messages.user.updateSuccess });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Xóa profile trước
        await pool.execute('DELETE FROM Profile WHERE userId_hash = ?', [userId]);
        
        // Xóa user
        await pool.execute(queries.user.delete, [userId]);

        res.json({ message: messages.user.deleteSuccess });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};