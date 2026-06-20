export declare const sendPasswordResetCodeEmail: (input: {
    to: string;
    studentName: string;
    studentCode: string;
    code: string;
    expiresInMinutes: number;
}) => Promise<{
    sent: boolean;
    message: string;
}>;
//# sourceMappingURL=auth-email.d.ts.map