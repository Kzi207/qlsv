import type { Request, Response } from 'express';
/**
 * GET /api/auth/google
 * Redirects the user to Google OAuth consent screen.
 */
export declare const googleAuthRedirect: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
/**
 * GET /api/auth/google/callback
 * Handles the callback from Google, exchanges code for tokens,
 * looks up the user by email in the Student table, and logs them in.
 */
export declare const googleAuthCallback: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/auth/google/status
 * Returns whether Google login is configured and available.
 */
export declare const googleAuthStatus: (_req: Request, res: Response) => void;
//# sourceMappingURL=google-auth.controller.d.ts.map