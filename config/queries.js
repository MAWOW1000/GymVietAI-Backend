module.exports = {
    // User Queries
    user: {
        getAll: `
        SELECT u.userId_hash, u.firstname, u.lastname, u.email, 
               u.gender, u.dob, u.is_active, r.name as role_name,
               u.created_at, u.updated_at
        FROM User u
        LEFT JOIN Role r ON u.roleID = r.roleID
        ORDER BY u.created_at DESC
        `,
        findByEmail: `
            SELECT u.*, r.name as role_name 
            FROM User u 
            JOIN Role r ON u.roleID = r.roleID 
            WHERE u.email = ?
        `,
        
        create: `
            INSERT INTO User (firstname, lastname, email, password_hash, gender, dob, roleID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        
        findById: `
            SELECT u.userId_hash, u.firstname, u.lastname, u.email, 
                   u.gender, u.dob, u.is_active, r.name as role
            FROM User u
            JOIN Role r ON u.roleID = r.roleID
            WHERE u.userId_hash = ?
        `,
        
        update: `
            UPDATE User 
            SET firstname = ?, lastname = ?, gender = ?, 
                dob = ?, is_active = ?, roleID = ?
            WHERE userId_hash = ?
        `,
        
        delete: 'DELETE FROM User WHERE userId_hash = ?',
        
        getAll: `
            SELECT u.userId_hash, u.firstname, u.lastname, u.email, 
                   u.gender, u.dob, u.is_active, r.name as role
            FROM User u
            JOIN Role r ON u.roleID = r.roleID
        `
    },

    // Profile Queries
    profile: {
        create: `
            INSERT INTO Profile (userId_hash, height, weight, level, goal)
            VALUES (?, ?, ?, ?, ?)
        `,
        
        findByUserId: `
            SELECT u.firstname, u.lastname, u.email, u.gender, u.dob,
                   p.height, p.weight, p.level, p.goal
            FROM User u
            LEFT JOIN Profile p ON u.userId_hash = p.userId_hash
            WHERE u.userId_hash = ?
        `,
        
        update: `
            UPDATE Profile 
            SET height = ?, weight = ?, level = ?, goal = ?
            WHERE userId_hash = ?
        `
    },

    // Role Queries
    role: {
        getAll: `
            SELECT r.roleID, r.name,
                   GROUP_CONCAT(p.name) as permissions
            FROM Role r
            LEFT JOIN Role_Permission rp ON r.roleID = rp.roleID
            LEFT JOIN Permission p ON rp.permissionID = p.permissionID
            GROUP BY r.roleID
        `,
        
        create: 'INSERT INTO Role (name) VALUES (?)',
        
        addPermissions: `
            INSERT INTO Role_Permission (roleID, permissionID) 
            VALUES ?
        `,
        
        removePermissions: 'DELETE FROM Role_Permission WHERE roleID = ?',
        
        update: 'UPDATE Role SET name = ? WHERE roleID = ?',
        
        delete: 'DELETE FROM Role WHERE roleID = ?'
    },

    // Password Reset Queries
    passwordReset: {
        create: `
            INSERT INTO PasswordReset (userId_hash, token, expires)
            VALUES (?, ?, ?)
        `,
        
        findValidToken: `
            SELECT pr.userId_hash, pr.expires 
            FROM PasswordReset pr
            WHERE pr.token = ? AND pr.expires > NOW()
            ORDER BY pr.id DESC LIMIT 1
        `,
        
        deleteToken: 'DELETE FROM PasswordReset WHERE token = ?'
    }
};