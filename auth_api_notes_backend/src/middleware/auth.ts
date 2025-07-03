import { Request, Response, NextFunction } from "express";
import jwt  from "jsonwebtoken";
import { UserPayload } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment variables');
}

export interface AuthenticateRequest extends Request {
    user?: UserPayload;
}

export const signToken = (payload: UserPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d'});
}

export const authenticateToken = (
    req: AuthenticateRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({error: 'Authorization token required'});
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({error: 'Invalid or expired token'});
    }
};