const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const UserService = require('../services/users.service');

function setCookie(res, token, refreshToken) {
    // Cookie token
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,
    });

    // Cookie trạng thái login
    res.cookie('logged', 1, {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Cookie refreshToken
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

class UserController {
    async createUser(req, res) {
        const { fullName, email, password, role, phone, company } = req.body;
        if (!fullName || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        // Nếu là employer thì companyName là bắt buộc
        if (role === 'employer' && (!company || !company.companyName)) {
            throw new BadRequestError('Vui lòng nhập tên công ty');
        }

        const { token, refreshToken } = await UserService.createUser({
            fullName,
            email,
            password,
            role,
            phone,
            company,
        });

        setCookie(res, token, refreshToken);

        const data = {
            token,
            refreshToken,
        };

        return new OK({ message: 'Tạo user thành công', metadata: data }).send(res);
    }

    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = {
            email,
            password,
        };
        const { token, refreshToken, user } = await UserService.login(data);

        setCookie(res, token, refreshToken);
        return new OK({ message: 'success', metadata: { token, refreshToken, user } }).send(res);
    }

    async auth(req, res) {
        const { id } = req.user;
        const data = await UserService.authUser(id);
        new OK({
            message: 'success',
            metadata: data,
        }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        const { status } = await UserService.logout(id);
        if (status === 200) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('logged');
            return new OK({ message: 'success' }).send(res);
        } else {
            throw new BadRequestError('Đăng xuất thất bại');
        }
    }

    async refreshToken(req, res) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new BadRequestError('Vui lòng đăng nhập lại');
        }
        const { token } = await UserService.refreshToken(refreshToken);

        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        const data = {
            token,
        };

        return new OK({ message: 'success', metadata: data }).send(res);
    }

    async getAllUser(req, res) {
        const { page = 1, limit = 10, search = '' } = req.query;
        const data = await UserService.getAllUser({
            page: Number(page),
            limit: Number(limit),
            search,
        });
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async updateUserAdmin(req, res) {
        const { id } = req.params;
        const data = await UserService.updateUserAdmin(id, req.body);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        const data = await UserService.deleteUser(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const data = {
            currentPassword,
            newPassword,
        };
        const newData = await UserService.changePassword(id, data);
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    async updateUser(req, res) {
        const { id } = req.user;
        const { fullName, address, phone, birthDay, email, education, experience, skills, headline, summary, gender } =
            req.body;

        const data = {
            fullName,
            address,
            phone,
            birthDay,
            email,
            gender,
            // Candidate profile fields
            headline,
            summary,
            skills,
            experience,
            education,
        };

        const newData = await UserService.updateUser(id, data);
        new OK({ message: 'Cập nhật thành công', metadata: newData }).send(res);
    }

    async uploadAvatar(req, res) {
        const { id } = req.user;
        const { uploadSingle } = require('../config/cloudinaryUpload');
        const url = await uploadSingle(req.file, 'avatars');
        const data = await UserService.uploadAvatar(id, url);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getDashboard(req, res) {
        try {
            const data = await UserService.getDashboard();
            new OK({ message: 'success', metadata: data }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const { token, refreshToken } = await UserService.loginGoogle(credential);
        setCookie(res, token, refreshToken);
        new OK({ message: 'success', metadata: { token, refreshToken } }).send(res);
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        const { token, otp } = await UserService.forgotPassword(email);
        res.cookie('tokenResetPassword', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'Strict',
            maxAge: 10 * 60 * 1000,
        });
        new OK({ message: 'success', metadata: { token, otp } }).send(res);
    }

    async resetPassword(req, res) {
        const token = req.cookies.tokenResetPassword;
        const { otp, newPassword } = req.body;
        const data = await UserService.resetPassword(token, otp, newPassword);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async chatbot(req, res) {
        const { id } = req.user;
        const { question } = req.body;
        const data = await UserService.chatbot(question, id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getMessageChatbot(req, res) {
        const { id } = req.user;
        const data = await UserService.getMessageChatbot(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }
}

module.exports = new UserController();
