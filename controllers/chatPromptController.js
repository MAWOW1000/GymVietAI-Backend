const pool = require('../config/database');
const messages = require('../config/messages');

class ChatPromptController {
    async getActivePrompt(req, res) {
        try {
            const [prompts] = await pool.execute(
                'SELECT content FROM ChatPrompt WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
            );
            
            if (prompts.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy prompt' });
            }

            res.json(prompts[0]);
        } catch (error) {
            console.error('Get active prompt error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async updatePrompt(req, res) {
        try {
            const { content } = req.body;
            const promptId = req.params.id;

            await pool.execute(
                'UPDATE ChatPrompt SET content = ? WHERE promptId = ?',
                [content, promptId]
            );

            res.json({ message: 'Cập nhật prompt thành công' });
        } catch (error) {
            console.error('Update prompt error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }
}

module.exports = new ChatPromptController(); 