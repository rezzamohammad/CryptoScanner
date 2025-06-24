import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        apiKey: string;
        authenticated: boolean;
    };
}
export declare function authenticateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map