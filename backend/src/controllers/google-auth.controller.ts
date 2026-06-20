import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { createCsrfToken, setAuthCookies } from '../utils/security.js';
import { getJwtSecret } from '../utils/env.js';
import { writeActivityLog } from '../utils/activity-log.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

const toSafeUser = (user: any) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: String(user.role || '').toUpperCase(),
  studentId: user.studentId,
  class_id: user.class_id,
});

/**
 * GET /api/auth/google
 * Redirects the user to Google OAuth consent screen.
 */
export const googleAuthRedirect = (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ message: 'Google OAuth chưa được cấu hình trên server.' });
  }

  // Determine the frontend origin from Referer header or query param
  const referer = req.headers.referer || '';
  let frontendOrigin = 'http://localhost:5173';
  if (referer) {
    try {
      const url = new URL(referer);
      frontendOrigin = url.origin;
    } catch (e) {
      // Fallback
    }
  }

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: frontendOrigin, // Pass origin to redirect back to it dynamically
  });

  res.redirect(authorizeUrl);
};

/**
 * GET /api/auth/google/callback
 * Handles the callback from Google, exchanges code for tokens, 
 * looks up the user by email in the Student table, and logs them in.
 */
export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string; // Original frontend origin
  const frontendOrigins = String(process.env.FRONTEND_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  
  let frontendUrl = frontendOrigins[0] || 'http://localhost:5173';
  if (state) {
    // Validate that the state origin is either localhost or in our FRONTEND_ORIGIN list
    const isAllowed = frontendOrigins.some(origin => state.startsWith(origin)) || state.startsWith('http://localhost:');
    if (isAllowed) {
      frontendUrl = state;
    }
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=google_no_code`);
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Verify the ID token and extract email
    const idToken = tokens.id_token;
    if (!idToken) {
      return res.redirect(`${frontendUrl}/login?error=google_no_token`);
    }

    const ticket = await oAuth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${frontendUrl}/login?error=google_no_email`);
    }

    const googleEmail = payload.email.toLowerCase().trim();
    const googleName = payload.name || '';

    // Look up the student by email in the database
    const student = await prisma.student.findFirst({
      where: {
        email: {
          equals: googleEmail,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        student_code: true,
        name: true,
        email: true,
        class_id: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            studentId: true,
            class_id: true,
          },
        },
      },
    });

    if (!student) {
      // Also try to find by user email (for ADMIN/BCH accounts)
      const userByEmail = await prisma.user.findFirst({
        where: {
          email: {
            equals: googleEmail,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          studentId: true,
          class_id: true,
        },
      });

      if (!userByEmail) {
        return res.redirect(
          `${frontendUrl}/login?error=google_email_not_found&email=${encodeURIComponent(googleEmail)}`
        );
      }

      // Login the admin/BCH user
      const token = jwt.sign(
        {
          id: userByEmail.id,
          username: userByEmail.username,
          role: userByEmail.role,
          studentId: userByEmail.studentId,
          class_id: userByEmail.class_id,
        },
        getJwtSecret(),
        { expiresIn: '24h' }
      );

      const csrfToken = createCsrfToken();
      setAuthCookies(req, res, token, csrfToken);

      await writeActivityLog(req, {
        action: 'LOGIN_GOOGLE',
        category: 'AUTH',
        targetType: 'User',
        targetId: userByEmail.id,
        summary: `${userByEmail.name || userByEmail.username} dang nhap bang Google (${googleEmail})`,
        details: { googleEmail, username: userByEmail.username },
        userId: userByEmail.id,
        username: userByEmail.username,
        userName: userByEmail.name,
        role: userByEmail.role,
        studentId: userByEmail.studentId,
        classId: userByEmail.class_id,
      });

      const userData = encodeURIComponent(JSON.stringify({
        user: toSafeUser(userByEmail),
        csrfToken,
        accessToken: token,
      }));

      return res.redirect(`${frontendUrl}/login?google_auth=${userData}`);
    }

    // Student found - now check if they have a user account
    let user = student.user;

    if (!user) {
      // Auto-create a user account for this student
      const bcrypt = await import('bcryptjs');
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          username: student.student_code,
          password: hashedPassword,
          name: student.name,
          email: student.email,
          class_id: student.class_id,
          role: 'STUDENT',
          studentId: student.id,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          studentId: true,
          class_id: true,
        },
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
        class_id: user.class_id,
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    const csrfToken = createCsrfToken();
    setAuthCookies(req, res, token, csrfToken);

    await writeActivityLog(req, {
      action: 'LOGIN_GOOGLE',
      category: 'AUTH',
      targetType: 'User',
      targetId: user.id,
      summary: `${user.name || user.username} dang nhap bang Google (${googleEmail})`,
      details: { googleEmail, studentCode: student.student_code, username: user.username },
      userId: user.id,
      username: user.username,
      userName: user.name,
      role: user.role,
      studentId: user.studentId,
      classId: user.class_id,
    });

    // Redirect back to frontend with auth data
    const userData = encodeURIComponent(JSON.stringify({
      user: toSafeUser(user),
      csrfToken,
      accessToken: token,
    }));

    return res.redirect(`${frontendUrl}/login?google_auth=${userData}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};

/**
 * GET /api/auth/google/status
 * Returns whether Google login is configured and available.
 */
export const googleAuthStatus = (_req: Request, res: Response) => {
  res.json({
    enabled: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
  });
};
