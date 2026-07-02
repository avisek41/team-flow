import { Request, Response } from 'express';
import uiService from '../services/uiService';

export const getUiTheme = async (req: Request, res: Response) => {
    try {
        const cityId = (req.query.city_id as string) || 'mumbai';
        const clientTime = (req.query.client_time as string) || new Date().toISOString();
        const dayOfMonth = req.query.day_of_month ? parseInt(req.query.day_of_month as string, 10) : new Date().getDate();

        const themeData = await uiService.resolveUiTheme(cityId, clientTime, dayOfMonth);
        
        return res.status(200).json({
            success: true,
            message: "UI Theme resolved successfully",
            data: themeData
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error resolving UI theme",
            errors: [error.message]
        });
    }
};
