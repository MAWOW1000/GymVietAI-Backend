const pool = require('../config/database');
const messages = require('../config/messages');
const vnpayService = require('../services/vnpayService');
const moment = require('moment');

class PaymentController {
    async createPayment(req, res) {
        try {
            const { planId } = req.body;
            const userId = req.user.userId;
    
            // Lấy thông tin plan
            const [plans] = await pool.execute(
                'SELECT * FROM SubscriptionPlan WHERE planId = ?',
                [planId]
            );
    
            if (plans.length === 0) {
                return res.status(404).json({ message: 'Gói không tồn tại' });
            }
    
            const plan = plans[0];
            
            // Tạo URL thanh toán và nhận về orderId
            const { orderId, paymentUrl } = vnpayService.createPaymentUrl(
                null,
                plan.price,
                `Thanh toan goi ${plan.name}`
            );
    
            // Lưu thông tin đơn hàng với orderId mới
            await pool.execute(
                `INSERT INTO Orders (orderId, userId_hash, planId, amount, status)
                VALUES (?, ?, ?, ?, 'pending')`,
                [orderId, userId, planId, plan.price]
            );
    
            res.json({ 
                orderId,
                paymentUrl
            });
        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async handleVNPayReturn(req, res) {
        try {
            const vnpayReturn = req.query;
            
            // Kiểm tra chữ ký
            const isValidSignature = vnpayService.verifyReturnUrl(vnpayReturn);
            
            if (!isValidSignature) {
                return res.status(400).json({ message: 'Invalid signature' });
            }

            const orderId = vnpayReturn.vnp_TxnRef;
            const transactionNo = vnpayReturn.vnp_TransactionNo;
            const responseCode = vnpayReturn.vnp_ResponseCode;

            // Lấy thông tin đơn hàng
            const [orders] = await pool.execute(
                'SELECT * FROM Orders WHERE orderId = ?',
                [orderId]
            );

            if (orders.length === 0) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            }

            const order = orders[0];

            if (responseCode === '00') {
                // Thanh toán thành công
                await pool.execute(
                    `UPDATE Orders SET status = 'completed', transaction_no = ? WHERE orderId = ?`,
                    [transactionNo, orderId]
                );

                // Tạo subscription mới
                const [plan] = await pool.execute(
                    'SELECT duration FROM SubscriptionPlan WHERE planId = ?',
                    [order.planId]
                );

                const endDate = new Date();
                endDate.setDate(endDate.getDate() + plan[0].duration);

                await pool.execute(
                    `INSERT INTO UserSubscription 
                    (userId_hash, planId, end_date, payment_id)
                    VALUES (?, ?, ?, ?)`,
                    [order.userId_hash, order.planId, endDate, orderId]
                );

                res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
            } else {
                // Thanh toán thất bại
                await pool.execute(
                    `UPDATE Orders SET status = 'failed' WHERE orderId = ?`,
                    [orderId]
                );
                res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
            }
        } catch (error) {
            console.error('VNPay return error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async getSubscriptionPlans(req, res) {
        try {
            const [plans] = await pool.execute('SELECT * FROM SubscriptionPlan');
            res.json(plans);
        } catch (error) {
            console.error('Get plans error:', error);
            res.status(500).json({ message: messages.server.error });
        }
    }

    async handleVNPayIPN(req, res) {
        try {
            const vnpayIPN = req.body;
            const isValidSignature = vnpayService.verifyReturnUrl(vnpayIPN);
            
            if (!isValidSignature) {
                return res.status(400).json({ 
                    RspCode: '97',
                    Message: 'Invalid Signature'
                });
            }

            const orderId = vnpayIPN.vnp_TxnRef;
            const transactionNo = vnpayIPN.vnp_TransactionNo;
            const responseCode = vnpayIPN.vnp_ResponseCode;

            // Kiểm tra và cập nhật trạng thái đơn hàng
            const [orders] = await pool.execute(
                'SELECT * FROM Orders WHERE orderId = ?',
                [orderId]
            );

            if (orders.length === 0) {
                return res.status(404).json({ 
                    RspCode: '01',
                    Message: 'Order not found'
                });
            }

            const order = orders[0];

            if (responseCode === '00') {
                // Thanh toán thành công
                await pool.execute(
                    `UPDATE Orders 
                    SET status = 'completed', transaction_no = ? 
                    WHERE orderId = ?`,
                    [transactionNo, orderId]
                );

                // Tạo subscription mới
                const [plan] = await pool.execute(
                    'SELECT duration FROM SubscriptionPlan WHERE planId = ?',
                    [order.planId]
                );

                const endDate = new Date();
                endDate.setDate(endDate.getDate() + plan[0].duration);

                await pool.execute(
                    `INSERT INTO UserSubscription 
                    (userId_hash, planId, end_date, payment_id)
                    VALUES (?, ?, ?, ?)`,
                    [order.userId_hash, order.planId, endDate, orderId]
                );
            } else {
                // Thanh toán thất bại
                await pool.execute(
                    `UPDATE Orders SET status = 'failed' WHERE orderId = ?`,
                    [orderId]
                );
            }

            // Phản hồi cho VNPay
            res.status(200).json({
                RspCode: '00',
                Message: 'Confirm Success'
            });
        } catch (error) {
            console.error('VNPay IPN error:', error);
            res.status(500).json({
                RspCode: '99',
                Message: 'Internal Server Error'
            });
        }
    }
}

module.exports = new PaymentController();