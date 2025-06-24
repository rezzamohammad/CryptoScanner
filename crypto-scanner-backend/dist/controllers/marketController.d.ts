import type { Request, Response } from 'express';
export declare class MarketController {
    static getAllTickers(req: Request, res: Response): Promise<void>;
    static getTicker(req: Request, res: Response): Promise<void>;
    static getMarketStats(req: Request, res: Response): Promise<void>;
    static updateSettings(req: Request, res: Response): Promise<void>;
    static getSettings(req: Request, res: Response): Promise<void>;
    static healthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=marketController.d.ts.map