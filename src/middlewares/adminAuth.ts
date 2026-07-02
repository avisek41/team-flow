import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Admin token required.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Simplistic check for demonstration. Replace with actual token validation
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
        return res.status(403).json({ success: false, message: 'Forbidden. Invalid admin token.' });
    }

    next();
};
