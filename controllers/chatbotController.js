const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');
const messages = require('../config/messages');
const crypto = require('crypto');

class ChatbotController {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY không được cấu hình');
            return;
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Hàm tạo hash từ câu hỏi
    generateQuestionHash(question) {
        return crypto
            .createHash('sha256')
            .update(question.toLowerCase().trim())
            .digest('hex');
    }

    async getChatHistory(req, res) {
        try {
            const userId = req.user.userId;
            const [history] = await pool.execute(
                'SELECT user_message, bot_response, created_at FROM ChatHistory WHERE userId_hash = ? ORDER BY created_at DESC LIMIT 10',
                [userId]
            );
            res.json(history);
        } catch (error) {
            console.error('Get chat history error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async chat(req, res) {
        try {
            if (!this.model) {
                return res.status(500).json({ 
                    message: messages.chat.aiNotConfigured 
                });
            }

            const { message } = req.body;
            const userId = req.user.userId;
            
            // Tạo hash từ câu hỏi
            const questionHash = this.generateQuestionHash(message);

            // Kiểm tra cache
            const [cachedResponses] = await pool.execute(
                'SELECT answer FROM ChatCache WHERE question_hash = ?',
                [questionHash]
            );

            let botResponse;

            if (cachedResponses.length > 0) {
                // Nếu có trong cache thì lấy ra
                botResponse = cachedResponses[0].answer;
            } else {
                // Nếu chưa có trong cache thì gọi AI và lưu vào cache
                const [profiles] = await pool.execute(
                    'SELECT height, weight, level, goal FROM Profile WHERE userId_hash = ?',
                    [userId]
                );

                const profile = profiles[0];
                const userContext = profile ? 
                    `Thông tin người dùng:
                    Chiều cao: ${profile.height}cm
                    Cân nặng: ${profile.weight}kgx
                    Level: ${profile.level}
                    Mục tiêu: ${profile.goal}` : '';

                // Lấy prompt từ database
                const [prompts] = await pool.execute(
                    'SELECT content FROM ChatPrompt WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
                );

                const systemPrompt = prompts[0]?.content || 'Bạn là chatbot tư vấn gym';

                const chat = this.model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: systemPrompt }]
                        },
                        {
                            role: "model",
                            parts: [{ text: "Tôi đã hiểu và sẽ tuân theo hướng dẫn." }]
                        },
                        {
                            role: "user",
                            parts: [{ text: userContext }]
                        },
                        {
                            role: "model",
                            parts: [{ text: "Tôi đã ghi nhận thông tin người dùng." }]
                        }
                    ]
                });

                const result = await chat.sendMessage([{ text: message }]);
                botResponse = result.response.text();

                // Lưu vào cache
                await pool.execute(
                    'INSERT INTO ChatCache (question_hash, question, answer) VALUES (?, ?, ?)',
                    [questionHash, message, botResponse]
                );
            }

            // Lưu chat history
            await pool.execute(
                'INSERT INTO ChatHistory (userId_hash, user_message, bot_response) VALUES (?, ?, ?)',
                [userId, message, botResponse]
            );

            res.json({ message: botResponse });
        } catch (error) {
            console.error('Chatbot error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }
}

// Export một instance của class
const chatbotController = new ChatbotController();
module.exports = chatbotController; 