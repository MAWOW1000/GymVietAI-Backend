const pool = require('../config/database');
const queries = require('../config/queries');
const messages = require('../config/messages');

exports.getAllRoles = async (req, res) => {
    try {
        const [roles] = await pool.execute(queries.role.getAll);

        // Format lại dữ liệu
        const formattedRoles = roles.map(role => ({
            id: role.roleID,
            name: role.name,
            permissions: role.permissions ? role.permissions.split(',') : []
        }));

        res.json(formattedRoles);
    } catch (error) {
        console.error('Get all roles error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        // Tạo role mới
        const [result] = await pool.execute(queries.role.create, [name]);
        const roleId = result.insertId;

        // Thêm permissions nếu có
        if (permissions && permissions.length > 0) {
            const values = permissions.map(permId => [roleId, permId]);
            await pool.query(queries.role.addPermissions, [values]);
        }

        res.status(201).json({
            message: messages.role.createSuccess,
            roleId: roleId
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const roleId = req.params.id;

        // Cập nhật tên role
        await pool.execute(queries.role.update, [name, roleId]);

        // Cập nhật permissions
        await pool.execute(queries.role.removePermissions, [roleId]);

        if (permissions && permissions.length > 0) {
            const values = permissions.map(permId => [roleId, permId]);
            await pool.query(queries.role.addPermissions, [values]);
        }

        res.json({ message: messages.role.updateSuccess });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;

        // Kiểm tra xem có user nào đang sử dụng role không
        const [users] = await pool.execute(
            'SELECT COUNT(*) as count FROM User WHERE roleID = ?',
            [roleId]
        );

        if (users[0].count > 0) {
            return res.status(400).json({ message: messages.role.inUse });
        }

        // Xóa permissions của role
        await pool.execute(queries.role.removePermissions, [roleId]);

        // Xóa role
        await pool.execute(queries.role.delete, [roleId]);

        res.json({ message: messages.role.deleteSuccess });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};

exports.getRolePermissions = async (req, res) => {
    try {
        const roleId = req.params.id;

        const [permissions] = await pool.execute(`
            SELECT p.*
            FROM Permission p
            JOIN Role_Permission rp ON p.permissionID = rp.permissionID
            WHERE rp.roleID = ?
        `, [roleId]);

        res.json(permissions);
    } catch (error) {
        console.error('Get role permissions error:', error);
        res.status(500).json({ message: messages.server.error });
    }
};