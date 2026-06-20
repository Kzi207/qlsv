import bcrypt from 'bcryptjs';
import { createHash, randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { clearAuthCookies, createCsrfToken, setAuthCookies, setCsrfCookie, getCookieValue, CSRF_COOKIE_NAME } from '../utils/security.js';
import { getJwtSecret } from '../utils/env.js';
import { writeActivityLog } from '../utils/activity-log.js';
import { sendPasswordResetCodeEmail } from '../utils/auth-email.js';
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('invalid-password-for-timing-defense', 10);
const PASSWORD_RESET_EXPIRES_MINUTES = 10;
const INVALID_LOGIN_MESSAGE = 'Tài khoản hoặc mật khẩu bạn nhập chưa đúng';
const applyNoStoreHeaders = (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
};
const resolveInternalErrorMessage = (error) => {
    if (process.env.NODE_ENV === 'production')
        return 'Server error';
    const raw = error instanceof Error ? error.message : String(error || 'Unknown error');
    if (raw.toLowerCase().includes('database_url')) {
        return 'Backend is missing DATABASE_URL. Configure backend/.env and restart server.';
    }
    return raw;
};
const toSafeUser = (user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: String(user.role || '').toUpperCase(),
    studentId: user.studentId,
    class_id: user.class_id,
});
const getPasswordHashFingerprint = (passwordHash) => createHash('sha256').update(String(passwordHash || '')).digest('hex');
export const login = async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    try {
        applyNoStoreHeaders(res);
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                password: true,
                name: true,
                email: true,
                role: true,
                studentId: true,
                class_id: true,
            },
        });
        if (!user) {
            await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
            await writeActivityLog(req, {
                action: 'LOGIN_FAILED',
                category: 'AUTH',
                summary: `Dang nhap that bai cho tai khoan "${username}"`,
                details: { username },
                username,
            });
            return res.status(401).json({ message: INVALID_LOGIN_MESSAGE });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await writeActivityLog(req, {
                action: 'LOGIN_FAILED',
                category: 'AUTH',
                targetType: 'User',
                targetId: user.id,
                summary: `Dang nhap that bai cho tai khoan "${username}"`,
                details: { username, userId: user.id },
                userId: user.id,
                username: user.username,
                userName: user.name,
                role: user.role,
                studentId: user.studentId,
                classId: user.class_id,
            });
            return res.status(401).json({ message: INVALID_LOGIN_MESSAGE });
        }
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            studentId: user.studentId,
            class_id: user.class_id
        }, getJwtSecret(), { expiresIn: '24h' });
        const csrfToken = createCsrfToken();
        setAuthCookies(req, res, token, csrfToken);
        await writeActivityLog(req, {
            action: 'LOGIN_SUCCESS',
            category: 'AUTH',
            targetType: 'User',
            targetId: user.id,
            summary: `${user.name || user.username} dang nhap thanh cong`,
            details: { username: user.username },
            userId: user.id,
            username: user.username,
            userName: user.name,
            role: user.role,
            studentId: user.studentId,
            classId: user.class_id,
        });
        res.json({
            user: toSafeUser(user),
            csrfToken,
            accessToken: token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: resolveInternalErrorMessage(error) });
    }
};
export const me = async (req, res) => {
    applyNoStoreHeaders(res);
    if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                studentId: true,
                class_id: true,
            },
        });
        if (!user) {
            clearAuthCookies(req, res);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let csrfToken = getCookieValue(req, CSRF_COOKIE_NAME);
        if (!csrfToken) {
            csrfToken = createCsrfToken();
            setCsrfCookie(req, res, csrfToken);
        }
        return res.json({
            user: toSafeUser(user),
            csrfToken,
        });
    }
    catch (error) {
        console.error('Me error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
export const logout = (req, res) => {
    clearAuthCookies(req, res);
    applyNoStoreHeaders(res);
    res.json({ message: 'Logged out' });
};
export const updateProfile = async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const name = String(req.body?.name || '').trim();
    const emailValue = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(req.user.id) },
            data: {
                name,
                email: emailValue || null,
            },
        });
        await writeActivityLog(req, {
            action: 'PROFILE_UPDATE',
            category: 'AUTH',
            targetType: 'User',
            targetId: updatedUser.id,
            summary: `${updatedUser.name || updatedUser.username} cap nhat ho so ca nhan`,
            details: { name: updatedUser.name, email: updatedUser.email },
            userName: updatedUser.name,
            studentId: updatedUser.studentId,
            classId: updatedUser.class_id,
        });
        return res.json(toSafeUser(updatedUser));
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
export const changePassword = async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.id) },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        await writeActivityLog(req, {
            action: 'PASSWORD_CHANGE',
            category: 'AUTH',
            targetType: 'User',
            targetId: user.id,
            summary: `${user.name || user.username} doi mat khau`,
            details: { username: user.username },
            userName: user.name,
            studentId: user.studentId,
            classId: user.class_id,
        });
        return res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
export const requestPasswordResetCode = async (req, res) => {
    const username = String(req.body?.username || '').trim();
    if (!username) {
        return res.status(400).json({ message: 'Vui lòng nhập mã sinh viên hoặc tên đăng nhập.' });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                username: true,
                password: true,
                name: true,
                email: true,
                role: true,
                studentId: true,
                class_id: true,
                student: {
                    select: {
                        student_code: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản sinh viên.' });
        }
        const targetEmail = String(user.email || user.student?.email || '').trim();
        if (!targetEmail) {
            return res.status(400).json({ message: 'Tài khoản này chưa có email sinh viên để nhận mã.' });
        }
        const resetCode = String(randomInt(100000, 1000000));
        const resetToken = jwt.sign({
            purpose: 'PASSWORD_RESET',
            userId: user.id,
            username: user.username,
            code: resetCode,
            pwdv: getPasswordHashFingerprint(user.password),
        }, getJwtSecret(), { expiresIn: `${PASSWORD_RESET_EXPIRES_MINUTES}m` });
        const mailResult = await sendPasswordResetCodeEmail({
            to: targetEmail,
            studentName: user.student?.name || user.name || user.username,
            studentCode: user.student?.student_code || user.username,
            code: resetCode,
            expiresInMinutes: PASSWORD_RESET_EXPIRES_MINUTES,
        });
        if (!mailResult.sent) {
            return res.status(500).json({ message: mailResult.message });
        }
        return res.json({
            message: mailResult.message,
            resetToken,
        });
    }
    catch (error) {
        console.error('Request password reset code error:', error);
        return res.status(500).json({ message: resolveInternalErrorMessage(error) });
    }
};
export const confirmPasswordReset = async (req, res) => {
    const resetToken = String(req.body?.resetToken || '').trim();
    const code = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.newPassword || '');
    if (!resetToken || !code || !newPassword) {
        return res.status(400).json({ message: 'Thiếu mã xác thực hoặc mật khẩu mới.' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
    }
    try {
        const decoded = jwt.verify(resetToken, getJwtSecret());
        if (!decoded || typeof decoded === 'string') {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
        }
        const payload = decoded;
        if (payload.purpose !== 'PASSWORD_RESET') {
            return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
        }
        if (payload.code !== code) {
            return res.status(400).json({ message: 'Mã xác thực không đúng.' });
        }
        const user = await prisma.user.findUnique({
            where: { id: Number(payload.userId) },
            select: {
                id: true,
                username: true,
                password: true,
                name: true,
                role: true,
                studentId: true,
                class_id: true,
            },
        });
        if (!user || getPasswordHashFingerprint(user.password) !== payload.pwdv) {
            return res.status(400).json({ message: 'Mã xác thực đã hết hiệu lực. Vui lòng yêu cầu mã mới.' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        await writeActivityLog(req, {
            action: 'PASSWORD_RESET',
            category: 'AUTH',
            targetType: 'User',
            targetId: user.id,
            summary: `${user.name || user.username} dat lai mat khau bang ma xac thuc`,
            details: { username: user.username },
            userId: user.id,
            username: user.username,
            userName: user.name,
            role: user.role,
            studentId: user.studentId,
            classId: user.class_id,
        });
        return res.json({ message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.' });
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' });
        }
        console.error('Confirm password reset error:', error);
        return res.status(500).json({ message: resolveInternalErrorMessage(error) });
    }
};
//# sourceMappingURL=auth.controller.js.map