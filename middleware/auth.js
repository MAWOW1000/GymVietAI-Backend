const jwt = require('jsonwebtoken');
const config = require('../config/config');
const messages = require('../config/messages');
const pool = require('../config/database');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: messages.auth.tokenRequired });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: messages.auth.invalidToken });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: messages.auth.unauthorized });
    }
    next();
};

exports.hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const [permissions] = await pool.execute(`
                SELECT p.name
                FROM Permission p
                JOIN Role_Permission rp ON p.permissionID = rp.permissionID
                JOIN Role r ON rp.roleID = r.roleID
                WHERE r.name = ?
            `, [req.user.role]);

            const userPermissions = permissions.map(p => p.name);

            if (!userPermissions.includes(permission)) {
                return res.status(403).json({ message: messages.auth.unauthorized });
            }

            next();
        } catch (error) {
            res.status(500).json({ message: messages.server.error });
        }
    };
};