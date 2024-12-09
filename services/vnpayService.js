const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');

class VNPayService {
    createPaymentUrl(orderId, amount, orderInfo) {
        console.log('=== START VNPAY PAYMENT DEBUG ===');
        
        const createDate = moment().format('YYYYMMDDHHmmss');
        const txnRef = moment().format('DDHHmmss');
        const amountInCents = Math.round(amount * 100);
    
        let vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: process.env.VNPAY_TMN_CODE,
            vnp_Amount: amountInCents,
            vnp_CreateDate: createDate,
            vnp_CurrCode: 'VND',
            vnp_IpAddr: '127.0.0.1',
            vnp_Locale: 'vn',
            vnp_OrderInfo: orderInfo.replace(/\s/g, '+'), // Thay khoảng trắng bằng dấu +
            vnp_OrderType: 'other',
            vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
            vnp_TxnRef: txnRef
        };
    
        // Sắp xếp field theo alphabet
        const sortedKeys = Object.keys(vnpParams).sort();
        
        // Tạo chuỗi hash
        const signData = sortedKeys
            .map(key => {
                if (vnpParams[key] !== '' && vnpParams[key] !== null && vnpParams[key] !== undefined) {
                    return `${key}=${encodeURIComponent(vnpParams[key])}`;
                }
                return '';
            })
            .filter(item => item)
            .join('&');
    
        console.log('Raw Hash String:', signData);
    
        const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();
    
        vnpParams.vnp_SecureHash = signed;
    
        // URL thanh toán
        const paymentUrl = process.env.VNPAY_URL + '?' + querystring.stringify(vnpParams, { encode: true });
        
        console.log('=== END VNPAY PAYMENT DEBUG ===');
    
        return {
            orderId: txnRef,
            paymentUrl: paymentUrl
        };
    }
}

module.exports = new VNPayService();