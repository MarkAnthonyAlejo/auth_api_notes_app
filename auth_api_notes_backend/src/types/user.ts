import { Request } from 'express';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export type UserPayload = {
    id: string;
    email?: string;
    username?: string;
  };

  export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
  }
