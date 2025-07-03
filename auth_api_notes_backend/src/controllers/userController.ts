import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { supabase } from "../connection/supabaseClient";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
        .from('users') // your Supabase table
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
        },
        token,
    });
}