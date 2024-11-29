module.exports = {
    auth: {
        invalidCredentials: 'Email hoặc mật khẩu không đúng',
        emailExists: 'Email đã tồn tại',
        emailNotFound: 'Email không tồn tại',
        invalidToken: 'Token không hợp lệ hoặc đã hết hạn',
        unauthorized: 'Không có quyền truy cập',
        tokenRequired: 'Token không tồn tại'
    },

    user: {
        notFound: 'Người dùng không tồn tại',
        createSuccess: 'Tạo người dùng thành công',
        updateSuccess: 'Cập nhật người dùng thành công',
        deleteSuccess: 'Xóa người dùng thành công'
    },

    profile: {
        notFound: 'Profile không tồn tại',
        updateSuccess: 'Cập nhật profile thành công'
    },

    role: {
        notFound: 'Role không tồn tại',
        createSuccess: 'Tạo role thành công',
        updateSuccess: 'Cập nhật role thành công',
        deleteSuccess: 'Xóa role thành công',
        inUse: 'Không thể xóa role đang được sử dụng'
    },

    password: {
        resetEmailSent: 'Email hướng dẫn đặt lại mật khẩu đã được gửi',
        resetSuccess: 'Đặt lại mật khẩu thành công',
        changeSuccess: 'Đổi mật khẩu thành công',
        currentPasswordInvalid: 'Mật khẩu hiện tại không đúng'
    },

    server: {
        error: 'Đã có lỗi xảy ra',
        databaseError: 'Lỗi database'
    },

    chat: {
        messageRequired: 'Tin nhắn không được để trống',
        messageTooLong: 'Tin nhắn không được vượt quá 500 ký tự',
        historyCleared: 'Đã xóa lịch sử chat',
        aiNotConfigured: 'Hệ thống AI chưa được cấu hình'
    }
};