import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { supabase } from "../connection/supabaseClient";
import { signToken } from "../middleware/auth";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
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

export const registerUser = async (req: Request,res:Response): Promise<void> => {
    try {
        const { email, name, password } = req.body;
    
        // Basic validation
        if (!email || !name || !password) {
          res.status(400).json({ error: 'Email, username, and password are required' });
          return;
        }
    
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${email},username.eq.${name}`)
          .single();
    
        if (existingUser) {
          res.status(409).json({ error: 'Email or username already in use' });
          return;
        }
    
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Insert user into Supabase
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ email, name, password: hashedPassword }])
          .select()
          .single();
    
        if (insertError) {
          throw insertError;
        }
    
        // Generate token
        const payload = { id: newUser.id, email: newUser.email, username: newUser.username };
        // const token = signToken(payload);
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
        res.status(201).json({
          message: 'User registered successfully',
          user: payload,
          token,
        });
      } catch (err: any) {
        console.error('Register error:', err.message || err);
        res.status(500).json({ error: 'Server error during registration' });
      }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, created_at'); // Select only safe fields
  
      if (error) {
        console.error('Supabase fetch users error:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
        return;
      }
  
      res.status(200).json({ users: data });
    } catch (err) {
      console.error('Server error fetching users:', err);
      res.status(500).json({ error: 'Server error fetching users' });
    }
  };