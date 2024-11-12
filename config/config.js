require('dotenv').config();

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Database Configuration
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Email Configuration
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },

    // Frontend URL
    frontendUrl: process.env.FRONTEND_URL,

    // Password Reset Configuration
    passwordReset: {
        tokenExpirationHours: 1
    },

    // Validation Configuration
    validation: {
        password: {
            minLength: 6
        },
        profile: {
            minHeight: 0,
            maxHeight: 300,
            minWeight: 0,
            maxWeight: 500,
            minLevel: 1,
            maxLevel: 5
        }
    },

    // Cors Configuration
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};